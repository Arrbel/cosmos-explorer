/**
 * CameraController 组件
 * 相机控制器，提供多种相机控制模式
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CameraControlMode, CameraConfig } from '@/types/engine';

export interface CameraControllerProps {
  /** 控制模式 */
  mode?: CameraControlMode;
  /** 相机配置 */
  config?: CameraConfig;
  /** 是否启用控制 */
  enabled?: boolean;
  /** 是否启用阻尼 */
  enableDamping?: boolean;
  /** 阻尼系数 */
  dampingFactor?: number;
  /** 是否自动旋转 */
  autoRotate?: boolean;
  /** 自动旋转速度 */
  autoRotateSpeed?: number;
  /** 缩放限制 */
  zoomLimits?: { min: number; max: number };
  /** 极角限制 */
  polarAngleLimits?: { min: number; max: number };
  /** 方位角限制 */
  azimuthAngleLimits?: { min: number; max: number };
  /** 相机移动回调 */
  onCameraMove?: (position: THREE.Vector3, target: THREE.Vector3) => void;
}

/**
 * 相机控制器组件
 */
export const CameraController: React.FC<CameraControllerProps> = ({
  mode = 'orbit',
  config,
  enabled = true,
  enableDamping = true,
  dampingFactor = 0.05,
  autoRotate = false,
  autoRotateSpeed = 2.0,
  zoomLimits = { min: 0.1, max: 1000 },
  polarAngleLimits = { min: 0, max: Math.PI },
  azimuthAngleLimits = { min: -Infinity, max: Infinity },
  onCameraMove,
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const lastPositionRef = useRef(new THREE.Vector3());
  const lastTargetRef = useRef(new THREE.Vector3());

  // 初始化相机位置
  useEffect(() => {
    if (config && camera) {
      camera.position.set(...config.position);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = config.fov;
        camera.near = config.near;
        camera.far = config.far;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(...config.target);
    }
  }, [config, camera]);

  // 监听相机移动
  const handleCameraMove = useCallback(() => {
    if (!camera || !onCameraMove) return;

    const currentPosition = camera.position.clone();
    const currentTarget = controlsRef.current?.target || new THREE.Vector3();

    // 检查位置是否发生变化
    if (
      !currentPosition.equals(lastPositionRef.current) ||
      !currentTarget.equals(lastTargetRef.current)
    ) {
      onCameraMove(currentPosition, currentTarget);
      lastPositionRef.current.copy(currentPosition);
      lastTargetRef.current.copy(currentTarget);
    }
  }, [camera, onCameraMove]);

  // 渲染循环
  useFrame(() => {
    handleCameraMove();
  });

  // 渲染不同的控制模式
  const renderControls = () => {
    switch (mode) {
      case 'orbit':
        return (
          <OrbitControls
            ref={controlsRef}
            args={[camera, gl.domElement]}
            enabled={enabled}
            enableDamping={enableDamping}
            dampingFactor={dampingFactor}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={zoomLimits.min}
            maxDistance={zoomLimits.max}
            minPolarAngle={polarAngleLimits.min}
            maxPolarAngle={polarAngleLimits.max}
            minAzimuthAngle={azimuthAngleLimits.min}
            maxAzimuthAngle={azimuthAngleLimits.max}
            target={config?.target ? new THREE.Vector3(...config.target) : undefined}
          />
        );

      case 'fly':
        // 飞行控制器（简化版本，实际项目中可能需要更复杂的实现）
        return (
          <OrbitControls
            ref={controlsRef}
            args={[camera, gl.domElement]}
            enabled={enabled}
            enableDamping={enableDamping}
            dampingFactor={dampingFactor}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={0}
            maxDistance={Infinity}
            screenSpacePanning={true}
          />
        );

      case 'first_person':
        // 第一人称控制器（简化版本）
        return (
          <OrbitControls
            ref={controlsRef}
            args={[camera, gl.domElement]}
            enabled={enabled}
            enableDamping={enableDamping}
            dampingFactor={dampingFactor}
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            minDistance={0}
            maxDistance={0}
          />
        );

      case 'none':
      default:
        return null;
    }
  };

  return <>{renderControls()}</>;
};

export default CameraController;
