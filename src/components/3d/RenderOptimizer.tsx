/**
 * RenderOptimizer 组件
 * 渲染优化管理器，提供LOD、视锥体剔除、实例化等优化功能
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RenderOptimizationConfig, LODLevel } from '@/types/engine';

export interface RenderOptimizerProps {
  /** 优化配置 */
  config?: RenderOptimizationConfig;
  /** 是否启用LOD */
  enableLOD?: boolean;
  /** 是否启用视锥体剔除 */
  enableFrustumCulling?: boolean;
  /** 是否启用遮挡剔除 */
  enableOcclusionCulling?: boolean;
  /** 是否启用实例化渲染 */
  enableInstancing?: boolean;
  /** 最大渲染距离 */
  maxRenderDistance?: number;
  /** 性能预算（毫秒） */
  performanceBudget?: number;
  /** 优化统计回调 */
  onOptimizationStats?: (stats: {
    culledObjects: number;
    lodLevel: number;
    instancedObjects: number;
    renderTime: number;
  }) => void;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 默认优化配置
 */
const defaultConfig: RenderOptimizationConfig = {
  lod: {
    enabled: true,
    levels: [
      { distance: 0, quality: 1.0 },
      { distance: 50, quality: 0.7 },
      { distance: 100, quality: 0.4 },
      { distance: 200, quality: 0.1 },
    ],
  },
  frustumCulling: {
    enabled: true,
    margin: 0.1,
  },
  occlusionCulling: {
    enabled: false,
    threshold: 0.01,
  },
  instancing: {
    enabled: true,
    maxInstances: 1000,
    threshold: 10,
  },
  performanceBudget: 16.67, // 60 FPS
};

/**
 * 渲染优化器组件
 */
export const RenderOptimizer: React.FC<RenderOptimizerProps> = ({
  config = defaultConfig,
  enableLOD = true,
  enableFrustumCulling = true,
  enableOcclusionCulling = false,
  enableInstancing = true,
  maxRenderDistance = 1000,
  performanceBudget = 16.67,
  onOptimizationStats,
  children,
}) => {
  const { scene, camera } = useThree();
  const frustumRef = useRef(new THREE.Frustum());
  const matrixRef = useRef(new THREE.Matrix4());
  const statsRef = useRef({
    culledObjects: 0,
    lodLevel: 0,
    instancedObjects: 0,
    renderTime: 0,
  });
  const frameStartTimeRef = useRef(0);

  // LOD管理
  const updateLOD = useCallback((object: THREE.Object3D, distance: number) => {
    if (!enableLOD || !config.lod?.enabled) return;

    const levels = config.lod.levels;
    let currentLevel = 0;

    for (let i = levels.length - 1; i >= 0; i--) {
      if (distance >= levels[i].distance) {
        currentLevel = i;
        break;
      }
    }

    // 更新对象的LOD级别
    if (object.userData.lodLevel !== currentLevel) {
      object.userData.lodLevel = currentLevel;
      const quality = levels[currentLevel].quality;
      
      // 应用质量设置
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 调整几何体细节
          if (child.userData.originalGeometry) {
            const geometry = child.userData.originalGeometry;
            if (geometry instanceof THREE.SphereGeometry) {
              const segments = Math.max(8, Math.floor(32 * quality));
              child.geometry = new THREE.SphereGeometry(
                geometry.parameters.radius,
                segments,
                segments
              );
            }
          }
          
          // 调整材质质量
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = Math.max(0.1, 1 - quality * 0.5);
            child.material.metalness = Math.min(1, quality);
          }
        }
      });
    }

    statsRef.current.lodLevel = currentLevel;
  }, [enableLOD, config.lod]);

  // 视锥体剔除
  const performFrustumCulling = useCallback(() => {
    if (!enableFrustumCulling || !config.frustumCulling?.enabled) return;

    // 更新视锥体
    matrixRef.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustumRef.current.setFromProjectionMatrix(matrixRef.current);

    let culledCount = 0;

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // 计算对象的包围盒
        if (!object.geometry.boundingBox) {
          object.geometry.computeBoundingBox();
        }

        const boundingBox = object.geometry.boundingBox!.clone();
        boundingBox.applyMatrix4(object.matrixWorld);

        // 检查是否在视锥体内
        const isVisible = frustumRef.current.intersectsBox(boundingBox);
        
        if (object.visible !== isVisible) {
          object.visible = isVisible;
          if (!isVisible) culledCount++;
        }

        // 距离剔除
        const distance = camera.position.distanceTo(object.position);
        if (distance > maxRenderDistance) {
          object.visible = false;
          culledCount++;
        } else if (enableLOD) {
          updateLOD(object, distance);
        }
      }
    });

    statsRef.current.culledObjects = culledCount;
  }, [enableFrustumCulling, config.frustumCulling, camera, scene, maxRenderDistance, updateLOD, enableLOD]);

  // 实例化渲染优化
  const optimizeInstancing = useCallback(() => {
    if (!enableInstancing || !config.instancing?.enabled) return;

    const instanceGroups = new Map<string, THREE.Object3D[]>();
    let instancedCount = 0;

    // 收集相似的对象
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.instanceable) {
        const key = `${object.geometry.uuid}-${object.material.uuid}`;
        if (!instanceGroups.has(key)) {
          instanceGroups.set(key, []);
        }
        instanceGroups.get(key)!.push(object);
      }
    });

    // 创建实例化网格
    instanceGroups.forEach((objects, key) => {
      if (objects.length >= (config.instancing?.threshold || 10)) {
        // 这里可以实现实例化逻辑
        instancedCount += objects.length;
      }
    });

    statsRef.current.instancedObjects = instancedCount;
  }, [enableInstancing, config.instancing, scene]);

  // 性能监控
  const monitorPerformance = useCallback(() => {
    const frameTime = performance.now() - frameStartTimeRef.current;
    statsRef.current.renderTime = frameTime;

    // 如果超出性能预算，可以动态调整质量
    if (frameTime > performanceBudget) {
      // 可以在这里实现动态质量调整逻辑
      console.warn(`Frame time ${frameTime.toFixed(2)}ms exceeds budget ${performanceBudget}ms`);
    }

    onOptimizationStats?.(statsRef.current);
  }, [performanceBudget, onOptimizationStats]);

  // 渲染循环
  useFrame(() => {
    frameStartTimeRef.current = performance.now();

    // 执行优化
    performFrustumCulling();
    optimizeInstancing();
    
    // 监控性能
    monitorPerformance();
  });

  // 初始化对象的原始几何体引用
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && !object.userData.originalGeometry) {
        object.userData.originalGeometry = object.geometry.clone();
      }
    });
  }, [scene]);

  return <>{children}</>;
};

export default RenderOptimizer;
