/**
 * MemoryManager 组件
 * 内存管理器，提供纹理缓存、几何体池化和自动垃圾回收
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface MemoryManagerProps {
  /** 最大内存使用量（MB） */
  maxMemoryUsage?: number;
  /** 是否启用纹理缓存 */
  enableTextureCache?: boolean;
  /** 是否启用几何体池化 */
  enableGeometryPooling?: boolean;
  /** 是否启用自动垃圾回收 */
  enableAutoGC?: boolean;
  /** 垃圾回收间隔（帧数） */
  gcInterval?: number;
  /** 纹理缓存大小限制 */
  textureCacheSize?: number;
  /** 几何体池大小限制 */
  geometryPoolSize?: number;
  /** 内存使用回调 */
  onMemoryUsage?: (usage: {
    total: number;
    textures: number;
    geometries: number;
    materials: number;
  }) => void;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 内存管理器组件
 */
export const MemoryManager: React.FC<MemoryManagerProps> = ({
  maxMemoryUsage = 512, // 512MB
  enableTextureCache = true,
  enableGeometryPooling = true,
  enableAutoGC = true,
  gcInterval = 300, // 每300帧执行一次GC
  textureCacheSize = 100,
  geometryPoolSize = 50,
  onMemoryUsage,
  children,
}) => {
  const { gl } = useThree();
  const frameCountRef = useRef(0);
  const textureCacheRef = useRef(new Map<string, THREE.Texture>());
  const geometryPoolRef = useRef(new Map<string, THREE.BufferGeometry[]>());
  const materialCacheRef = useRef(new Map<string, THREE.Material>());
  const lastUsedRef = useRef(new Map<string, number>());

  // 计算内存使用量
  const calculateMemoryUsage = useCallback(() => {
    const info = gl.info;
    const textureMemory = info.memory?.textures || 0;
    const geometryMemory = info.memory?.geometries || 0;
    
    // 估算材质内存使用
    let materialMemory = 0;
    materialCacheRef.current.forEach((material) => {
      if (material instanceof THREE.ShaderMaterial) {
        materialMemory += 1; // 1MB per shader material (估算)
      } else {
        materialMemory += 0.1; // 0.1MB per standard material (估算)
      }
    });

    const totalMemory = textureMemory + geometryMemory + materialMemory;

    return {
      total: totalMemory,
      textures: textureMemory,
      geometries: geometryMemory,
      materials: materialMemory,
    };
  }, [gl]);

  // 纹理缓存管理
  const manageTextureCache = useCallback((texture: THREE.Texture, key: string) => {
    if (!enableTextureCache) return texture;

    const cached = textureCacheRef.current.get(key);
    if (cached) {
      lastUsedRef.current.set(key, frameCountRef.current);
      return cached;
    }

    // 如果缓存已满，移除最久未使用的纹理
    if (textureCacheRef.current.size >= textureCacheSize) {
      let oldestKey = '';
      let oldestTime = Infinity;

      textureCacheRef.current.forEach((_, cacheKey) => {
        const lastUsed = lastUsedRef.current.get(cacheKey) || 0;
        if (lastUsed < oldestTime) {
          oldestTime = lastUsed;
          oldestKey = cacheKey;
        }
      });

      if (oldestKey) {
        const oldTexture = textureCacheRef.current.get(oldestKey);
        if (oldTexture) {
          oldTexture.dispose();
        }
        textureCacheRef.current.delete(oldestKey);
        lastUsedRef.current.delete(oldestKey);
      }
    }

    textureCacheRef.current.set(key, texture);
    lastUsedRef.current.set(key, frameCountRef.current);
    return texture;
  }, [enableTextureCache, textureCacheSize]);

  // 几何体池化管理
  const manageGeometryPool = useCallback((geometry: THREE.BufferGeometry, type: string) => {
    if (!enableGeometryPooling) return geometry;

    const pool = geometryPoolRef.current.get(type) || [];
    
    // 尝试从池中获取几何体
    if (pool.length > 0) {
      const pooledGeometry = pool.pop()!;
      lastUsedRef.current.set(`geometry_${type}`, frameCountRef.current);
      return pooledGeometry;
    }

    // 如果池为空，创建新的几何体
    const newGeometry = geometry.clone();
    lastUsedRef.current.set(`geometry_${type}`, frameCountRef.current);
    return newGeometry;
  }, [enableGeometryPooling]);

  // 回收几何体到池中
  const recycleGeometry = useCallback((geometry: THREE.BufferGeometry, type: string) => {
    if (!enableGeometryPooling) {
      geometry.dispose();
      return;
    }

    const pool = geometryPoolRef.current.get(type) || [];
    
    if (pool.length < geometryPoolSize) {
      pool.push(geometry);
      geometryPoolRef.current.set(type, pool);
    } else {
      geometry.dispose();
    }
  }, [enableGeometryPooling, geometryPoolSize]);

  // 垃圾回收
  const performGarbageCollection = useCallback(() => {
    const currentFrame = frameCountRef.current;
    const threshold = 1000; // 1000帧未使用则清理

    // 清理纹理缓存
    textureCacheRef.current.forEach((texture, key) => {
      const lastUsed = lastUsedRef.current.get(key) || 0;
      if (currentFrame - lastUsed > threshold) {
        texture.dispose();
        textureCacheRef.current.delete(key);
        lastUsedRef.current.delete(key);
      }
    });

    // 清理几何体池
    geometryPoolRef.current.forEach((pool, type) => {
      const lastUsed = lastUsedRef.current.get(`geometry_${type}`) || 0;
      if (currentFrame - lastUsed > threshold) {
        pool.forEach(geometry => geometry.dispose());
        geometryPoolRef.current.delete(type);
        lastUsedRef.current.delete(`geometry_${type}`);
      }
    });

    // 清理材质缓存
    materialCacheRef.current.forEach((material, key) => {
      const lastUsed = lastUsedRef.current.get(`material_${key}`) || 0;
      if (currentFrame - lastUsed > threshold) {
        material.dispose();
        materialCacheRef.current.delete(key);
        lastUsedRef.current.delete(`material_${key}`);
      }
    });

    // 强制垃圾回收（如果可用）
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }, []);

  // 检查内存使用并执行清理
  const checkMemoryUsage = useCallback(() => {
    const usage = calculateMemoryUsage();
    
    if (usage.total > maxMemoryUsage) {
      console.warn(`Memory usage ${usage.total}MB exceeds limit ${maxMemoryUsage}MB, performing cleanup`);
      performGarbageCollection();
    }

    onMemoryUsage?.(usage);
  }, [calculateMemoryUsage, maxMemoryUsage, performGarbageCollection, onMemoryUsage]);

  // 渲染循环
  useFrame(() => {
    frameCountRef.current++;

    // 定期执行垃圾回收
    if (enableAutoGC && frameCountRef.current % gcInterval === 0) {
      performGarbageCollection();
    }

    // 定期检查内存使用
    if (frameCountRef.current % 60 === 0) {
      checkMemoryUsage();
    }
  });

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      // 清理所有缓存
      textureCacheRef.current.forEach(texture => texture.dispose());
      textureCacheRef.current.clear();

      geometryPoolRef.current.forEach(pool => {
        pool.forEach(geometry => geometry.dispose());
      });
      geometryPoolRef.current.clear();

      materialCacheRef.current.forEach(material => material.dispose());
      materialCacheRef.current.clear();

      lastUsedRef.current.clear();
    };
  }, []);

  // 暴露管理方法给子组件
  const contextValue = {
    manageTextureCache,
    manageGeometryPool,
    recycleGeometry,
    performGarbageCollection,
    calculateMemoryUsage,
  };

  return (
    <memoryManagerContext.Provider value={contextValue}>
      {children}
    </memoryManagerContext.Provider>
  );
};

// 创建Context以便子组件使用内存管理功能
const memoryManagerContext = React.createContext<{
  manageTextureCache: (texture: THREE.Texture, key: string) => THREE.Texture;
  manageGeometryPool: (geometry: THREE.BufferGeometry, type: string) => THREE.BufferGeometry;
  recycleGeometry: (geometry: THREE.BufferGeometry, type: string) => void;
  performGarbageCollection: () => void;
  calculateMemoryUsage: () => { total: number; textures: number; geometries: number; materials: number };
} | null>(null);

// Hook for using memory manager
export const useMemoryManager = () => {
  const context = React.useContext(memoryManagerContext);
  if (!context) {
    throw new Error('useMemoryManager must be used within a MemoryManager');
  }
  return context;
};

export default MemoryManager;
