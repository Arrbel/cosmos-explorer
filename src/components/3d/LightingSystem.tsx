/**
 * LightingSystem 组件
 * 3D场景光照系统
 */

import React from 'react';
import * as THREE from 'three';
import type { LightConfig } from '@/types/engine';

export interface LightingSystemProps {
  /** 光照配置 */
  config?: LightConfig;
  /** 是否启用阴影 */
  enableShadows?: boolean;
  /** 阴影质量 */
  shadowQuality?: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * 默认光照配置
 */
const defaultLightConfig: LightConfig = {
  ambient: {
    enabled: true,
    color: '#404040',
    intensity: 0.4,
  },
  directional: {
    enabled: true,
    color: '#ffffff',
    intensity: 1.0,
    position: [10, 10, 5],
    target: [0, 0, 0],
    castShadow: true,
    shadowMapSize: 2048,
  },
  point: [
    {
      enabled: true,
      color: '#ffffff',
      intensity: 0.5,
      position: [-10, 10, -10],
      distance: 100,
      decay: 2,
      castShadow: false,
    },
  ],
  spot: [],
  hemisphere: {
    enabled: false,
    skyColor: '#87CEEB',
    groundColor: '#362d1d',
    intensity: 0.3,
  },
};

/**
 * 光照系统组件
 */
export const LightingSystem: React.FC<LightingSystemProps> = ({
  config = defaultLightConfig,
  enableShadows = true,
  shadowQuality = 'medium',
}) => {
  // 获取阴影贴图尺寸
  const getShadowMapSize = () => {
    switch (shadowQuality) {
      case 'low':
        return 512;
      case 'medium':
        return 1024;
      case 'high':
        return 2048;
      case 'ultra':
        return 4096;
      default:
        return 1024;
    }
  };

  const shadowMapSize = getShadowMapSize();

  return (
    <>
      {/* 环境光 */}
      {config.ambient?.enabled && (
        <ambientLight
          color={config.ambient.color}
          intensity={config.ambient.intensity}
        />
      )}

      {/* 半球光 */}
      {config.hemisphere?.enabled && (
        <hemisphereLight
          args={[
            config.hemisphere.skyColor,
            config.hemisphere.groundColor,
            config.hemisphere.intensity,
          ]}
        />
      )}

      {/* 方向光 */}
      {config.directional?.enabled && (
        <directionalLight
          color={config.directional.color}
          intensity={config.directional.intensity}
          position={config.directional.position}
          target-position={config.directional.target}
          castShadow={enableShadows && config.directional.castShadow}
          shadow-mapSize-width={shadowMapSize}
          shadow-mapSize-height={shadowMapSize}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.0001}
        />
      )}

      {/* 点光源 */}
      {config.point?.map((light, index) => 
        light.enabled ? (
          <pointLight
            key={`point-${index}`}
            color={light.color}
            intensity={light.intensity}
            position={light.position}
            distance={light.distance}
            decay={light.decay}
            castShadow={enableShadows && light.castShadow}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-camera-near={0.5}
            shadow-camera-far={light.distance || 100}
          />
        ) : null
      )}

      {/* 聚光灯 */}
      {config.spot?.map((light, index) => 
        light.enabled ? (
          <spotLight
            key={`spot-${index}`}
            color={light.color}
            intensity={light.intensity}
            position={light.position}
            target-position={light.target}
            distance={light.distance}
            angle={light.angle}
            penumbra={light.penumbra}
            decay={light.decay}
            castShadow={enableShadows && light.castShadow}
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
            shadow-camera-near={0.5}
            shadow-camera-far={light.distance || 100}
            shadow-camera-fov={light.angle ? (light.angle * 180) / Math.PI : 50}
          />
        ) : null
      )}
    </>
  );
};

export default LightingSystem;
