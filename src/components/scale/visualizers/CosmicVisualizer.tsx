/**
 * CosmicVisualizer 组件
 * 宇宙尺度可视化器
 */

import React from 'react';
import { Text } from '@react-three/drei';
import { type ScaleInfo } from '@/types/scale';

export interface CosmicVisualizerProps {
  scale: any;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

export const CosmicVisualizer: React.FC<CosmicVisualizerProps> = ({
  scaleInfo,
  lodLevel,
}) => {
  return (
    <group>
      {/* 星系团 */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        const size = 5 + Math.random() * 15;

        return (
          <group key={i} position={[x, y, z]}>
            {/* 星系 */}
            <mesh>
              <sphereGeometry args={[size, 8, 8]} />
              <meshStandardMaterial
                color="#8888ff"
                emissive="#4444ff"
                emissiveIntensity={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* 星系周围的恒星 */}
            {Array.from({ length: 10 }).map((_, j) => {
              const angle = (j / 10) * Math.PI * 2;
              const radius = size * 1.5;
              const sx = Math.cos(angle) * radius;
              const sz = Math.sin(angle) * radius;

              return (
                <mesh key={j} position={[sx, 0, sz]}>
                  <sphereGeometry args={[0.5, 4, 4]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* 宇宙网结构 */}
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
          ]}
        >
          <sphereGeometry args={[0.1, 3, 3]} />
          <meshBasicMaterial
            color="#222244"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* 宇宙微波背景辐射效果 */}
      <mesh>
        <sphereGeometry args={[1500, 32, 32]} />
        <meshBasicMaterial
          color="#001122"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {lodLevel > 1 && (
        <Text
          position={[0, 500, 0]}
          fontSize={100}
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

export default CosmicVisualizer;
