/**
 * BasicSphere 组件
 * 基础的3D球体组件，用于演示和测试
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import type { Mesh } from 'three';
import { useTheme } from '@/contexts';

export interface BasicSphereProps {
  /** 位置 */
  position?: [number, number, number];
  /** 半径 */
  radius?: number;
  /** 颜色 */
  color?: string;
  /** 是否自动旋转 */
  autoRotate?: boolean;
  /** 旋转速度 */
  rotationSpeed?: number;
  /** 显示标签 */
  label?: string;
  /** 是否可交互 */
  interactive?: boolean;
  /** 点击回调 */
  onClick?: () => void;
  /** 悬停回调 */
  onHover?: (hovered: boolean) => void;
}

/**
 * 基础球体组件
 */
export const BasicSphere: React.FC<BasicSphereProps> = ({
  position = [0, 0, 0],
  radius = 1,
  color,
  autoRotate = true,
  rotationSpeed = 0.01,
  label,
  interactive = true,
  onClick,
  onHover,
}) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();

  // 默认颜色使用主题色
  const sphereColor = color || theme.colors.primary[500];

  // 动画循环
  useFrame(() => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed * 0.5;
    }
  });

  // 处理鼠标悬停
  const handlePointerOver = () => {
    if (interactive) {
      setHovered(true);
      onHover?.(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    if (interactive) {
      setHovered(false);
      onHover?.(false);
      document.body.style.cursor = 'auto';
    }
  };

  // 处理点击
  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  return (
    <group position={position}>
      {/* 球体 */}
      <Sphere
        ref={meshRef}
        args={[radius, 32, 32]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={sphereColor}
          metalness={0.3}
          roughness={0.4}
          emissive={hovered ? sphereColor : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </Sphere>

      {/* 标签 */}
      {label && (
        <Text
          position={[0, radius + 0.5, 0]}
          fontSize={0.5}
          color={theme.colors.text.primary}
          anchorX="center"
          anchorY="middle"

          maxWidth={10}
          textAlign="center"
        >
          {label}
        </Text>
      )}

      {/* 悬停时的光环效果 */}
      {hovered && (
        <Sphere args={[radius * 1.2, 32, 32]}>
          <meshBasicMaterial
            color={sphereColor}
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
};

export default BasicSphere;
