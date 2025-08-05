/**
 * HumanScaleVisualizer 组件
 * 人体尺度可视化器
 */

import React from 'react';
import { Text } from '@react-three/drei';
import { type ScaleInfo } from '@/types/scale';

export interface HumanScaleVisualizerProps {
  scale: any;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

export const HumanScaleVisualizer: React.FC<HumanScaleVisualizerProps> = ({
  scaleInfo,
  lodLevel,
}) => {
  return (
    <group>
      {/* 简单的人形表示 */}
      <group position={[0, 0, 0]}>
        {/* 头部 */}
        <mesh position={[0, 1.7, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* 身体 */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.4, 0.8, 0.2]} />
          <meshStandardMaterial color="#4488ff" />
        </mesh>

        {/* 腿部 */}
        <mesh position={[-0.1, 0.2, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.1, 0.2, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* 环境对象 */}
      <mesh position={[3, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh position={[-3, 1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {lodLevel > 1 && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {scaleInfo.nameCN}
        </Text>
      )}
    </group>
  );
};

export default HumanScaleVisualizer;
