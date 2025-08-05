/**
 * AtomicVisualizer 组件
 * 原子尺度可视化器
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ScaleLevel, type ScaleInfo } from '@/types/scale';

export interface AtomicVisualizerProps {
  scale: ScaleLevel;
  scaleInfo: ScaleInfo;
  lodLevel: number;
  quality: string;
  isTransitioning: boolean;
  transitionProgress: number;
  enablePhysics: boolean;
  timeScale: number;
}

/**
 * 原子可视化器组件
 */
export const AtomicVisualizer: React.FC<AtomicVisualizerProps> = ({
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
  const electronRefs = useRef<THREE.Mesh[]>([]);

  // 原子配置
  const atomConfig = useMemo(() => {
    if (scale === ScaleLevel.SUBATOMIC) {
      return {
        type: 'proton',
        name: '质子',
        color: '#ff4444',
        radius: 0.5,
        electrons: 0,
        orbitals: [],
      };
    } else {
      return {
        type: 'hydrogen',
        name: '氢原子',
        color: '#ffffff',
        radius: 0.3,
        electrons: 1,
        orbitals: [
          { radius: 2, electrons: 1, speed: 0.02 }
        ],
      };
    }
  }, [scale]);

  // 动画循环
  useFrame(({ clock }) => {
    if (!enablePhysics || isTransitioning) return;

    const time = clock.getElapsedTime() * timeScale;

    // 旋转原子核
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }

    // 电子轨道运动
    electronRefs.current.forEach((electron, index) => {
      if (electron && atomConfig.orbitals[index]) {
        const orbital = atomConfig.orbitals[index];
        const angle = time * orbital.speed + (index * Math.PI * 2) / orbital.electrons;
        
        electron.position.x = Math.cos(angle) * orbital.radius;
        electron.position.z = Math.sin(angle) * orbital.radius;
        electron.position.y = Math.sin(angle * 2) * 0.2; // 轻微的垂直运动
      }
    });
  });

  // 渲染原子核
  const renderNucleus = () => (
    <mesh>
      <sphereGeometry args={[atomConfig.radius, 16, 16]} />
      <meshStandardMaterial
        color={atomConfig.color}
        emissive={atomConfig.color}
        emissiveIntensity={0.2}
        metalness={0.1}
        roughness={0.3}
      />
    </mesh>
  );

  // 渲染电子轨道
  const renderOrbitals = () => {
    if (scale === ScaleLevel.SUBATOMIC) return null;

    return atomConfig.orbitals.map((orbital, orbitalIndex) => (
      <group key={orbitalIndex}>
        {/* 轨道路径 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[orbital.radius - 0.02, orbital.radius + 0.02, 32]} />
          <meshBasicMaterial
            color="#4488ff"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 电子 */}
        {Array.from({ length: orbital.electrons }).map((_, electronIndex) => (
          <mesh
            key={electronIndex}
            ref={(ref) => {
              if (ref) {
                electronRefs.current[orbitalIndex * orbital.electrons + electronIndex] = ref;
              }
            }}
            position={[orbital.radius, 0, 0]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#44aaff"
              emissive="#44aaff"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>
    ));
  };

  // 渲染粒子效果
  const renderParticleEffects = () => {
    if (scale !== ScaleLevel.SUBATOMIC) return null;

    return (
      <group>
        {/* 量子场效果 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4,
            ]}
          >
            <sphereGeometry args={[0.02, 4, 4]} />
            <meshBasicMaterial
              color="#ffaa44"
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>
    );
  };

  // 渲染信息标签
  const renderInfoLabel = () => (
    <Text
      position={[0, scaleInfo.size * 3, 0]}
      fontSize={scaleInfo.size * 0.5}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      {atomConfig.name}
    </Text>
  );

  return (
    <group ref={groupRef}>
      {/* 原子核 */}
      {renderNucleus()}

      {/* 电子轨道 */}
      {renderOrbitals()}

      {/* 粒子效果 */}
      {renderParticleEffects()}

      {/* 信息标签 */}
      {lodLevel > 2 && renderInfoLabel()}

      {/* 环境粒子 */}
      {quality !== 'low' && (
        <group>
          {Array.from({ length: 50 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
              ]}
            >
              <sphereGeometry args={[0.01, 3, 3]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.1}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

export default AtomicVisualizer;
