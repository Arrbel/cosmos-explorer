/**
 * PlanetaryVisualizer 组件
 * 行星尺度可视化器
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { type ScaleInfo } from '@/types/scale';

export interface PlanetaryVisualizerProps {
  scale: any;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

export const PlanetaryVisualizer: React.FC<PlanetaryVisualizerProps> = ({
  scaleInfo,
  lodLevel,
  enablePhysics,
  timeScale,
  isTransitioning,
}) => {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!enablePhysics || isTransitioning) return;
    const time = clock.getElapsedTime() * timeScale * 0.1;
    if (planetRef.current) {
      planetRef.current.rotation.y = time;
    }
  });

  return (
    <group>
      {/* 行星主体 */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial
          color="#6B93D6"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 大气层 */}
      <mesh>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshStandardMaterial
          color="#87CEEB"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* 云层 */}
      {Array.from({ length: 20 }).map((_, i) => {
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        const radius = 5.1;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}

      {lodLevel > 1 && (
        <Text
          position={[0, 7, 0]}
          fontSize={1}
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

export default PlanetaryVisualizer;
