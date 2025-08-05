/**
 * SceneManager 组件
 * 3D场景管理器，负责场景的创建、更新和销毁
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneConfig, CameraConfig, PerformanceStats } from '@/types/engine';

export interface SceneManagerProps {
  /** 场景配置 */
  config?: SceneConfig;
  /** 相机配置 */
  cameraConfig?: CameraConfig;
  /** 性能监控回调 */
  onPerformanceUpdate?: (stats: PerformanceStats) => void;
  /** 场景准备就绪回调 */
  onSceneReady?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 场景管理器组件
 */
export const SceneManager: React.FC<SceneManagerProps> = ({
  config = {
    background: '#0a0a0a',
    fog: { enabled: true, color: '#0a0a0a', near: 50, far: 200 },
    shadows: { enabled: true, type: 'PCFSoft' },
    environment: { enabled: true, preset: 'night' },
  },
  cameraConfig = {
    position: [10, 10, 10],
    target: [0, 0, 0],
    fov: 75,
    near: 0.1,
    far: 1000,
  },
  onPerformanceUpdate,
  onSceneReady,
  children,
}) => {
  const { scene, camera, gl } = useThree();
  const clockRef = useRef(new THREE.Clock());
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const performanceRef = useRef<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
  });

  // 初始化场景
  useEffect(() => {
    if (!scene || !camera || !gl) return;

    // 设置背景
    if (config.background) {
      scene.background = new THREE.Color(config.background);
    }

    // 设置雾效
    if (config.fog?.enabled) {
      scene.fog = new THREE.Fog(
        config.fog.color || '#0a0a0a',
        config.fog.near || 50,
        config.fog.far || 200
      );
    }

    // 设置阴影
    if (config.shadows?.enabled) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap; // 默认使用软阴影
    }

    // 设置相机
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(...cameraConfig.position);
      camera.lookAt(...cameraConfig.target);
      camera.fov = cameraConfig.fov;
      camera.near = cameraConfig.near;
      camera.far = cameraConfig.far;
      camera.updateProjectionMatrix();
    }

    // 通知场景准备就绪
    onSceneReady?.(scene, camera as THREE.PerspectiveCamera, gl);

    return () => {
      // 清理资源
      scene.clear();
    };
  }, [scene, camera, gl, config, cameraConfig, onSceneReady]);

  // 性能监控
  const updatePerformanceStats = useCallback(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
      const frameTime = (currentTime - lastTimeRef.current) / frameCountRef.current;
      
      // 获取渲染器信息
      const info = gl.info;
      
      // 获取内存使用情况（如果可用）
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      performanceRef.current = {
        fps,
        frameTime,
        memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
      };

      onPerformanceUpdate?.(performanceRef.current);

      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  }, [gl, onPerformanceUpdate]);

  // 渲染循环
  useFrame(() => {
    updatePerformanceStats();
  });

  return <>{children}</>;
};

export default SceneManager;
