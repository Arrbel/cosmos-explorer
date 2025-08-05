/**
 * StellarVisualizer 组件
 * 恒星际尺度可视化器
 */

import React from 'react';
import { Text } from '@react-three/drei';
import { type ScaleInfo } from '@/types/scale';

export interface StellarVisualizerProps {
  scale: any;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

export const StellarVisualizer: React.FC<StellarVisualizerProps> = ({
  scaleInfo,
  lodLevel,
}) => {
  return (
    <group>
      {/* 恒星 */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        const size = 0.5 + Math.random() * 2;
        const color = ['#ffffff', '#ffaa44', '#ff4444', '#4444ff'][Math.floor(Math.random() * 4)];

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}

      {/* 星际尘埃 */}
      {Array.from({ length: 1000 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 500,
            (Math.random() - 0.5) * 500,
            (Math.random() - 0.5) * 500,
          ]}
        >
          <sphereGeometry args={[0.01, 3, 3]} />
          <meshBasicMaterial
            color="#444444"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {lodLevel > 1 && (
        <Text
          position={[0, 50, 0]}
          fontSize={10}
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

export default StellarVisualizer;
