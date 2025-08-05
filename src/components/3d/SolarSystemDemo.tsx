/**
 * SolarSystemDemo 组件
 * 简单的太阳系演示，用于测试3D引擎功能
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BasicSphere } from './BasicSphere';
import type { Group } from 'three';

export interface SolarSystemDemoProps {
  /** 动画速度 */
  animationSpeed?: number;
  /** 是否显示轨道 */
  showOrbits?: boolean;
  /** 行星点击回调 */
  onPlanetClick?: (planetName: string) => void;
}

/**
 * 行星数据
 */
const planets = [
  {
    name: '太阳',
    radius: 2,
    distance: 0,
    speed: 0,
    color: '#FDB813',
    label: '太阳 Sun',
  },
  {
    name: '水星',
    radius: 0.3,
    distance: 4,
    speed: 0.02,
    color: '#8C7853',
    label: '水星 Mercury',
  },
  {
    name: '金星',
    radius: 0.4,
    distance: 6,
    speed: 0.015,
    color: '#FFC649',
    label: '金星 Venus',
  },
  {
    name: '地球',
    radius: 0.5,
    distance: 8,
    speed: 0.01,
    color: '#6B93D6',
    label: '地球 Earth',
  },
  {
    name: '火星',
    radius: 0.4,
    distance: 10,
    speed: 0.008,
    color: '#C1440E',
    label: '火星 Mars',
  },
  {
    name: '木星',
    radius: 1.2,
    distance: 14,
    speed: 0.005,
    color: '#D8CA9D',
    label: '木星 Jupiter',
  },
  {
    name: '土星',
    radius: 1.0,
    distance: 18,
    speed: 0.003,
    color: '#FAD5A5',
    label: '土星 Saturn',
  },
  {
    name: '天王星',
    radius: 0.8,
    distance: 22,
    speed: 0.002,
    color: '#4FD0E7',
    label: '天王星 Uranus',
  },
  {
    name: '海王星',
    radius: 0.8,
    distance: 26,
    speed: 0.001,
    color: '#4B70DD',
    label: '海王星 Neptune',
  },
];

/**
 * 轨道组件
 */
const Orbit: React.FC<{ radius: number }> = ({ radius }) => {
  const points = [];
  const segments = 64;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
  }

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={new Float32Array(points)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#444444" transparent opacity={0.3} />
    </line>
  );
};

/**
 * 行星组件
 */
const Planet: React.FC<{
  planet: typeof planets[0];
  animationSpeed: number;
  onPlanetClick?: (planetName: string) => void;
}> = ({ planet, animationSpeed, onPlanetClick }) => {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && planet.distance > 0) {
      const elapsed = clock.getElapsedTime();
      const angle = elapsed * planet.speed * animationSpeed;
      groupRef.current.position.x = Math.cos(angle) * planet.distance;
      groupRef.current.position.z = Math.sin(angle) * planet.distance;
    }
  });

  const handleClick = () => {
    onPlanetClick?.(planet.name);
  };

  if (planet.distance === 0) {
    // 太阳固定在中心
    return (
      <BasicSphere
        position={[0, 0, 0]}
        radius={planet.radius}
        color={planet.color}
        label={planet.label}
        autoRotate={true}
        rotationSpeed={0.005}
        onClick={handleClick}
      />
    );
  }

  return (
    <group ref={groupRef}>
      <BasicSphere
        position={[0, 0, 0]}
        radius={planet.radius}
        color={planet.color}
        label={planet.label}
        autoRotate={true}
        rotationSpeed={0.01}
        onClick={handleClick}
      />
    </group>
  );
};

/**
 * 太阳系演示组件
 */
export const SolarSystemDemo: React.FC<SolarSystemDemoProps> = ({
  animationSpeed = 1,
  showOrbits = true,
  onPlanetClick,
}) => {
  return (
    <group>
      {/* 轨道 */}
      {showOrbits && planets.map((planet) => 
        planet.distance > 0 ? (
          <Orbit key={`orbit-${planet.name}`} radius={planet.distance} />
        ) : null
      )}

      {/* 行星 */}
      {planets.map((planet) => (
        <Planet
          key={planet.name}
          planet={planet}
          animationSpeed={animationSpeed}
          onPlanetClick={onPlanetClick}
        />
      ))}

      {/* 环境光效 */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
      <ambientLight intensity={0.1} />
    </group>
  );
};

export default SolarSystemDemo;
