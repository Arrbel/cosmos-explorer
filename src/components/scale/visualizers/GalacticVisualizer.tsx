/**
 * GalacticVisualizer 组件
 * 银河系尺度可视化器
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { type ScaleInfo } from '@/types/scale';

export interface GalacticVisualizerProps {
  scale: any;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

export const GalacticVisualizer: React.FC<GalacticVisualizerProps> = ({
  scaleInfo,
  lodLevel,
  enablePhysics,
  timeScale,
  isTransitioning,
}) => {
  const galaxyRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!enablePhysics || isTransitioning) return;
    const time = clock.getElapsedTime() * timeScale * 0.001;
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = time;
    }
  });

  return (
    <group ref={galaxyRef}>
      {/* 银河系中心 */}
      <mesh>
        <sphereGeometry args={[5, 16, 16]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* 旋臂 */}
      {Array.from({ length: 4 }).map((_, armIndex) => {
        const armAngle = (armIndex / 4) * Math.PI * 2;
        
        return (
          <group key={armIndex} rotation={[0, armAngle, 0]}>
            {Array.from({ length: 100 }).map((_, starIndex) => {
              const t = starIndex / 100;
              const radius = 10 + t * 80;
              const angle = t * Math.PI * 4;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const y = (Math.random() - 0.5) * 5;

              return (
                <mesh key={starIndex} position={[x, y, z]}>
                  <sphereGeometry args={[0.1 + Math.random() * 0.2, 4, 4]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* 球状星团 */}
      {Array.from({ length: 20 }).map((_, i) => {
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        const radius = 60 + Math.random() * 40;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color="#ffff88"
              emissive="#ffff88"
              emissiveIntensity={0.2}
            />
          </mesh>
        );
      })}

      {lodLevel > 1 && (
        <Text
          position={[0, 120, 0]}
          fontSize={20}
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

export default GalacticVisualizer;
