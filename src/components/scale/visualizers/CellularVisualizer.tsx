/**
 * CellularVisualizer 组件
 * 细胞尺度可视化器
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { type ScaleInfo } from '@/types/scale';

export interface CellularVisualizerProps {
  scale: any;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

export const CellularVisualizer: React.FC<CellularVisualizerProps> = ({
  scaleInfo,
  lodLevel,
  enablePhysics,
  timeScale,
  isTransitioning,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!enablePhysics || isTransitioning) return;
    const time = clock.getElapsedTime() * timeScale;
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 细胞膜 */}
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial
          color="#88ff88"
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>

      {/* 细胞核 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#ff8888" />
      </mesh>

      {/* 线粒体 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
          ]}
        >
          <capsuleGeometry args={[0.3, 1, 4, 8]} />
          <meshStandardMaterial color="#ffaa44" />
        </mesh>
      ))}

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

export default CellularVisualizer;
