/**
 * SolarSystemVisualizer 组件
 * 太阳系尺度可视化器
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ScaleLevel, type ScaleInfo } from '@/types/scale';

export interface SolarSystemVisualizerProps {
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
 * 行星数据
 */
const planets = [
  {
    name: '太阳',
    nameCN: '太阳',
    distance: 0,
    radius: 2,
    color: '#FDB813',
    speed: 0,
    moons: [],
  },
  {
    name: 'Mercury',
    nameCN: '水星',
    distance: 8,
    radius: 0.2,
    color: '#8C7853',
    speed: 0.02,
    moons: [],
  },
  {
    name: 'Venus',
    nameCN: '金星',
    distance: 12,
    radius: 0.3,
    color: '#FFC649',
    speed: 0.015,
    moons: [],
  },
  {
    name: 'Earth',
    nameCN: '地球',
    distance: 16,
    radius: 0.4,
    color: '#6B93D6',
    speed: 0.01,
    moons: [
      { name: 'Moon', nameCN: '月球', distance: 1, radius: 0.1, color: '#C0C0C0', speed: 0.1 }
    ],
  },
  {
    name: 'Mars',
    nameCN: '火星',
    distance: 20,
    radius: 0.3,
    color: '#C1440E',
    speed: 0.008,
    moons: [],
  },
  {
    name: 'Jupiter',
    nameCN: '木星',
    distance: 30,
    radius: 1.2,
    color: '#D8CA9D',
    speed: 0.005,
    moons: [
      { name: 'Io', nameCN: '木卫一', distance: 2, radius: 0.05, color: '#FFFF99', speed: 0.2 },
      { name: 'Europa', nameCN: '木卫二', distance: 2.5, radius: 0.05, color: '#FFFFFF', speed: 0.15 },
    ],
  },
  {
    name: 'Saturn',
    nameCN: '土星',
    distance: 40,
    radius: 1.0,
    color: '#FAD5A5',
    speed: 0.003,
    moons: [],
  },
  {
    name: 'Uranus',
    nameCN: '天王星',
    distance: 50,
    radius: 0.8,
    color: '#4FD0E7',
    speed: 0.002,
    moons: [],
  },
  {
    name: 'Neptune',
    nameCN: '海王星',
    distance: 60,
    radius: 0.8,
    color: '#4B70DD',
    speed: 0.001,
    moons: [],
  },
];

/**
 * 太阳系可视化器组件
 */
export const SolarSystemVisualizer: React.FC<SolarSystemVisualizerProps> = ({
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
  const planetRefs = useRef<{ [key: string]: THREE.Group }>({});

  // 根据尺度调整显示内容
  const visiblePlanets = useMemo(() => {
    switch (scale) {
      case ScaleLevel.ORBITAL:
        return planets.slice(0, 4); // 只显示内行星
      case ScaleLevel.INNER_SYSTEM:
        return planets.slice(0, 5); // 显示到火星
      case ScaleLevel.SOLAR_SYSTEM:
        return planets; // 显示所有行星
      case ScaleLevel.OUTER_SYSTEM:
      case ScaleLevel.HELIOSPHERE:
        return planets.concat([
          {
            name: 'Pluto',
            nameCN: '冥王星',
            distance: 80,
            radius: 0.1,
            color: '#8C7853',
            speed: 0.0005,
            moons: [],
          }
        ]);
      default:
        return planets;
    }
  }, [scale]);

  // 动画循环
  useFrame(({ clock }) => {
    if (!enablePhysics || isTransitioning) return;

    const time = clock.getElapsedTime() * timeScale * 0.1;

    // 行星轨道运动
    visiblePlanets.forEach((planet) => {
      const planetGroup = planetRefs.current[planet.name];
      if (planetGroup && planet.distance > 0) {
        const angle = time * planet.speed;
        planetGroup.position.x = Math.cos(angle) * planet.distance;
        planetGroup.position.z = Math.sin(angle) * planet.distance;

        // 卫星运动
        planet.moons.forEach((moon, moonIndex) => {
          const moonMesh = planetGroup.children[moonIndex + 1] as THREE.Mesh;
          if (moonMesh) {
            const moonAngle = time * moon.speed + moonIndex * Math.PI;
            moonMesh.position.x = Math.cos(moonAngle) * moon.distance;
            moonMesh.position.z = Math.sin(moonAngle) * moon.distance;
          }
        });
      }
    });
  });

  // 渲染轨道
  const renderOrbits = () => {
    if (quality === 'low' || lodLevel < 1) return null;

    return visiblePlanets.map((planet) => {
      if (planet.distance === 0) return null;

      return (
        <mesh key={`orbit-${planet.name}`} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.distance - 0.1, planet.distance + 0.1, 64]} />
          <meshBasicMaterial
            color="#444444"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    });
  };

  // 渲染行星
  const renderPlanets = () => {
    return visiblePlanets.map((planet) => (
      <group
        key={planet.name}
        ref={(ref) => {
          if (ref) {
            planetRefs.current[planet.name] = ref;
          }
        }}
        position={planet.distance === 0 ? [0, 0, 0] : [planet.distance, 0, 0]}
      >
        {/* 行星本体 */}
        <mesh>
          <sphereGeometry args={[planet.radius, 16, 16]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.name === '太阳' ? planet.color : '#000000'}
            emissiveIntensity={planet.name === '太阳' ? 0.3 : 0}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* 土星环 */}
        {planet.name === 'Saturn' && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.radius * 1.2, planet.radius * 2, 32]} />
            <meshBasicMaterial
              color="#FAD5A5"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 卫星 */}
        {planet.moons.map((moon, moonIndex) => (
          <mesh
            key={moon.name}
            position={[moon.distance, 0, 0]}
          >
            <sphereGeometry args={[moon.radius, 8, 8]} />
            <meshStandardMaterial
              color={moon.color}
              metalness={0.1}
              roughness={0.9}
            />
          </mesh>
        ))}

        {/* 行星标签 */}
        {lodLevel > 1 && (
          <Text
            position={[0, planet.radius + 0.5, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
          >
            {planet.nameCN}
          </Text>
        )}
      </group>
    ));
  };

  // 渲染小行星带
  const renderAsteroidBelt = () => {
    if (scale === ScaleLevel.ORBITAL || quality === 'low') return null;

    return (
      <group>
        {Array.from({ length: 100 }).map((_, i) => {
          const angle = (i / 100) * Math.PI * 2;
          const distance = 25 + Math.random() * 3;
          const x = Math.cos(angle) * distance;
          const z = Math.sin(angle) * distance;

          return (
            <mesh
              key={i}
              position={[x, (Math.random() - 0.5) * 0.5, z]}
            >
              <sphereGeometry args={[0.02 + Math.random() * 0.03, 4, 4]} />
              <meshStandardMaterial
                color="#8C7853"
                roughness={1}
              />
            </mesh>
          );
        })}
      </group>
    );
  };

  // 渲染柯伊伯带
  const renderKuiperBelt = () => {
    if (scale !== ScaleLevel.OUTER_SYSTEM && scale !== ScaleLevel.HELIOSPHERE) return null;

    return (
      <group>
        {Array.from({ length: 200 }).map((_, i) => {
          const angle = (i / 200) * Math.PI * 2;
          const distance = 70 + Math.random() * 20;
          const x = Math.cos(angle) * distance;
          const z = Math.sin(angle) * distance;

          return (
            <mesh
              key={i}
              position={[x, (Math.random() - 0.5) * 2, z]}
            >
              <sphereGeometry args={[0.01 + Math.random() * 0.02, 3, 3]} />
              <meshStandardMaterial
                color="#AAAAAA"
                roughness={1}
              />
            </mesh>
          );
        })}
      </group>
    );
  };

  // 渲染背景星空
  const renderStarField = () => {
    if (quality === 'low') return null;

    return (
      <group>
        {Array.from({ length: 1000 }).map((_, i) => {
          const phi = Math.acos(2 * Math.random() - 1);
          const theta = 2 * Math.PI * Math.random();
          const radius = 200;

          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);

          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.1, 3, 3]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        })}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {/* 轨道 */}
      {renderOrbits()}

      {/* 行星 */}
      {renderPlanets()}

      {/* 小行星带 */}
      {renderAsteroidBelt()}

      {/* 柯伊伯带 */}
      {renderKuiperBelt()}

      {/* 背景星空 */}
      {renderStarField()}

      {/* 太阳光照 */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color="#FDB813"
        distance={100}
      />
    </group>
  );
};

export default SolarSystemVisualizer;
