/**
 * InteractiveSolarSystem 组件
 * 交互式太阳系演示，支持点击、悬停、拖拽等交互
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { InteractionManager, type InteractionEvent } from './InteractionManager';
import { InteractiveObject } from './InteractiveObject';
import type { Group } from 'three';

export interface InteractiveSolarSystemProps {
  /** 动画速度 */
  animationSpeed?: number;
  /** 是否显示轨道 */
  showOrbits?: boolean;
  /** 是否启用交互 */
  enableInteraction?: boolean;
  /** 行星点击回调 */
  onPlanetClick?: (planetName: string, event: InteractionEvent) => void;
  /** 行星悬停回调 */
  onPlanetHover?: (planetName: string, hovered: boolean, event: InteractionEvent) => void;
  /** 行星拖拽回调 */
  onPlanetDrag?: (planetName: string, event: InteractionEvent) => void;
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
    hoverColor: '#FFD700',
    selectedColor: '#FF8C00',
    description: '太阳系的中心恒星',
  },
  {
    name: '水星',
    radius: 0.3,
    distance: 4,
    speed: 0.02,
    color: '#8C7853',
    hoverColor: '#A0906B',
    selectedColor: '#B8A082',
    description: '距离太阳最近的行星',
  },
  {
    name: '金星',
    radius: 0.4,
    distance: 6,
    speed: 0.015,
    color: '#FFC649',
    hoverColor: '#FFD700',
    selectedColor: '#FFB347',
    description: '太阳系中最热的行星',
  },
  {
    name: '地球',
    radius: 0.5,
    distance: 8,
    speed: 0.01,
    color: '#6B93D6',
    hoverColor: '#87CEEB',
    selectedColor: '#4682B4',
    description: '我们的家园',
  },
  {
    name: '火星',
    radius: 0.4,
    distance: 10,
    speed: 0.008,
    color: '#C1440E',
    hoverColor: '#FF6347',
    selectedColor: '#CD5C5C',
    description: '红色星球',
  },
  {
    name: '木星',
    radius: 1.2,
    distance: 14,
    speed: 0.005,
    color: '#D8CA9D',
    hoverColor: '#F0E68C',
    selectedColor: '#DEB887',
    description: '太阳系最大的行星',
  },
  {
    name: '土星',
    radius: 1.0,
    distance: 18,
    speed: 0.003,
    color: '#FAD5A5',
    hoverColor: '#F5DEB3',
    selectedColor: '#DDD5A5',
    description: '拥有美丽光环的行星',
  },
  {
    name: '天王星',
    radius: 0.8,
    distance: 22,
    speed: 0.002,
    color: '#4FD0E7',
    hoverColor: '#87CEEB',
    selectedColor: '#5F9EA0',
    description: '侧躺着自转的行星',
  },
  {
    name: '海王星',
    radius: 0.8,
    distance: 26,
    speed: 0.001,
    color: '#4B70DD',
    hoverColor: '#6495ED',
    selectedColor: '#4169E1',
    description: '太阳系最远的行星',
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
  enableInteraction: boolean;
  selected: boolean;
  onPlanetClick?: (planetName: string, event: InteractionEvent) => void;
  onPlanetHover?: (planetName: string, hovered: boolean, event: InteractionEvent) => void;
  onPlanetDrag?: (planetName: string, event: InteractionEvent) => void;
}> = ({ planet, animationSpeed, enableInteraction, selected, onPlanetClick, onPlanetHover, onPlanetDrag }) => {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && planet.distance > 0) {
      const elapsed = clock.getElapsedTime();
      const angle = elapsed * planet.speed * animationSpeed;
      groupRef.current.position.x = Math.cos(angle) * planet.distance;
      groupRef.current.position.z = Math.sin(angle) * planet.distance;
    }
  });

  const handleClick = (event: InteractionEvent) => {
    onPlanetClick?.(planet.name, event);
  };

  const handleHoverStart = (event: InteractionEvent) => {
    onPlanetHover?.(planet.name, true, event);
  };

  const handleHoverEnd = (event: InteractionEvent) => {
    onPlanetHover?.(planet.name, false, event);
  };

  const handleDrag = (event: InteractionEvent) => {
    onPlanetDrag?.(planet.name, event);
  };

  if (planet.distance === 0) {
    // 太阳固定在中心
    return (
      <InteractiveObject
        geometry="sphere"
        position={[0, 0, 0]}
        scale={planet.radius}
        color={planet.color}
        hoverColor={planet.hoverColor}
        selectedColor={planet.selectedColor}
        selected={selected}
        label={planet.name}
        autoRotate={true}
        rotationSpeed={0.005}
        interactive={enableInteraction}
        draggable={false} // 太阳不可拖拽
        onClick={handleClick}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      />
    );
  }

  return (
    <group ref={groupRef}>
      <InteractiveObject
        geometry="sphere"
        position={[0, 0, 0]}
        scale={planet.radius}
        color={planet.color}
        hoverColor={planet.hoverColor}
        selectedColor={planet.selectedColor}
        selected={selected}
        label={planet.name}
        autoRotate={true}
        rotationSpeed={0.01}
        interactive={enableInteraction}
        draggable={enableInteraction}
        onClick={handleClick}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        onDrag={handleDrag}
      />
    </group>
  );
};

/**
 * 交互式太阳系演示组件
 */
export const InteractiveSolarSystem: React.FC<InteractiveSolarSystemProps> = ({
  animationSpeed = 1,
  showOrbits = true,
  enableInteraction = true,
  onPlanetClick,
  onPlanetHover,
  onPlanetDrag,
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // 处理行星点击
  const handlePlanetClick = (planetName: string, event: InteractionEvent) => {
    setSelectedPlanet(selectedPlanet === planetName ? null : planetName);
    onPlanetClick?.(planetName, event);
    
    // 显示行星信息
    const planet = planets.find(p => p.name === planetName);
    if (planet) {
      console.log(`点击了${planetName}: ${planet.description}`);
    }
  };

  // 处理行星悬停
  const handlePlanetHover = (planetName: string, hovered: boolean, event: InteractionEvent) => {
    setHoveredPlanet(hovered ? planetName : null);
    onPlanetHover?.(planetName, hovered, event);
    
    if (hovered) {
      const planet = planets.find(p => p.name === planetName);
      if (planet) {
        console.log(`悬停在${planetName}: ${planet.description}`);
      }
    }
  };

  // 处理行星拖拽
  const handlePlanetDrag = (planetName: string, event: InteractionEvent) => {
    onPlanetDrag?.(planetName, event);
    console.log(`拖拽${planetName}`);
  };

  // 交互过滤器：只有行星可以交互
  const objectFilter = (object: THREE.Object3D) => {
    return object.userData.interactive === true;
  };

  return (
    <InteractionManager
      enabled={enableInteraction}
      enableClick={true}
      enableHover={true}
      enableDrag={true}
      objectFilter={objectFilter}
    >
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
            enableInteraction={enableInteraction}
            selected={selectedPlanet === planet.name}
            onPlanetClick={handlePlanetClick}
            onPlanetHover={handlePlanetHover}
            onPlanetDrag={handlePlanetDrag}
          />
        ))}

        {/* 环境光效 */}
        <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
        <ambientLight intensity={0.1} />
      </group>
    </InteractionManager>
  );
};

export default InteractiveSolarSystem;
