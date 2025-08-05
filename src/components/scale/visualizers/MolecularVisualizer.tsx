/**
 * MolecularVisualizer 组件
 * 分子尺度可视化器
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ScaleLevel, type ScaleInfo } from '@/types/scale';

export interface MolecularVisualizerProps {
  scale: ScaleLevel;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

export const MolecularVisualizer: React.FC<MolecularVisualizerProps> = ({
  scale,
  scaleInfo,
  lodLevel,
  quality,
  isTransitioning,
  transitionProgress,
  enablePhysics,
  timeScale,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!enablePhysics || isTransitioning) return;
    const time = clock.getElapsedTime() * timeScale;
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }
  });

  // 渲染DNA双螺旋结构
  const renderDNA = () => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 8;
      const x = Math.cos(angle) * 2;
      const z = Math.sin(angle) * 2;
      const y = t * 10 - 5;
      points.push(new THREE.Vector3(x, y, z));
    }

    return (
      <group>
        {points.map((point, i) => (
          <mesh key={i} position={point}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={i % 4 === 0 ? '#ff4444' : '#4444ff'} />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {scale === ScaleLevel.MOLECULAR && renderDNA()}
      
      {/* 分子云效果 */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
          ]}
        >
          <sphereGeometry args={[0.05 + Math.random() * 0.1, 6, 6]} />
          <meshStandardMaterial
            color={`hsl(${Math.random() * 360}, 70%, 60%)`}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {lodLevel > 1 && (
        <Text
          position={[0, 8, 0]}
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

export default MolecularVisualizer;
