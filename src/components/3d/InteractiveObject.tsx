/**
 * InteractiveObject 组件
 * 可交互的3D对象，支持点击、悬停、拖拽等交互
 */

import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/contexts';
import type { InteractionEvent } from './InteractionManager';

export interface InteractiveObjectProps {
  /** 几何体类型 */
  geometry?: 'box' | 'sphere' | 'cylinder' | 'cone' | 'plane';
  /** 位置 */
  position?: [number, number, number];
  /** 旋转 */
  rotation?: [number, number, number];
  /** 缩放 */
  scale?: [number, number, number] | number;
  /** 颜色 */
  color?: string;
  /** 是否可交互 */
  interactive?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否自动旋转 */
  autoRotate?: boolean;
  /** 旋转速度 */
  rotationSpeed?: number;
  /** 标签文本 */
  label?: string;
  /** 悬停时的颜色 */
  hoverColor?: string;
  /** 选中时的颜色 */
  selectedColor?: string;
  /** 是否选中 */
  selected?: boolean;
  /** 点击回调 */
  onClick?: (event: InteractionEvent) => void;
  /** 悬停开始回调 */
  onHoverStart?: (event: InteractionEvent) => void;
  /** 悬停结束回调 */
  onHoverEnd?: (event: InteractionEvent) => void;
  /** 拖拽开始回调 */
  onDragStart?: (event: InteractionEvent) => void;
  /** 拖拽中回调 */
  onDrag?: (event: InteractionEvent) => void;
  /** 拖拽结束回调 */
  onDragEnd?: (event: InteractionEvent) => void;
  /** 自定义几何体 */
  customGeometry?: THREE.BufferGeometry;
  /** 自定义材质 */
  customMaterial?: THREE.Material;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 可交互3D对象组件
 */
export const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  geometry = 'box',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color,
  interactive = true,
  draggable = true,
  autoRotate = false,
  rotationSpeed = 0.01,
  label,
  hoverColor,
  selectedColor,
  selected = false,
  onClick,
  onHoverStart,
  onHoverEnd,
  onDragStart,
  onDrag,
  onDragEnd,
  customGeometry,
  customMaterial,
  children,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  const { theme } = useTheme();

  // 默认颜色
  const defaultColor = color || theme.colors.primary[500];
  const defaultHoverColor = hoverColor || theme.colors.primary[400];
  const defaultSelectedColor = selectedColor || theme.colors.secondary[500];

  // 获取当前颜色
  const getCurrentColor = useCallback(() => {
    if (selected) return defaultSelectedColor;
    if (hovered) return defaultHoverColor;
    return defaultColor;
  }, [selected, hovered, defaultColor, defaultHoverColor, defaultSelectedColor]);

  // 创建几何体
  const createGeometry = useCallback(() => {
    if (customGeometry) return customGeometry;

    switch (geometry) {
      case 'sphere':
        return new THREE.SphereGeometry(1, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(1, 1, 2, 32);
      case 'cone':
        return new THREE.ConeGeometry(1, 2, 32);
      case 'plane':
        return new THREE.PlaneGeometry(2, 2);
      case 'box':
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [geometry, customGeometry]);

  // 创建材质
  const createMaterial = useCallback(() => {
    if (customMaterial) return customMaterial;

    return new THREE.MeshStandardMaterial({
      color: getCurrentColor(),
      metalness: 0.3,
      roughness: 0.4,
      emissive: hovered || selected ? getCurrentColor() : '#000000',
      emissiveIntensity: hovered || selected ? 0.1 : 0,
    });
  }, [customMaterial, getCurrentColor, hovered, selected]);

  // 动画循环
  useFrame(() => {
    if (meshRef.current && autoRotate && !isDragging) {
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed * 0.5;
    }
  });

  // 处理点击
  const handleClick = useCallback((event: InteractionEvent) => {
    if (!interactive) return;
    onClick?.(event);
  }, [interactive, onClick]);

  // 处理悬停开始
  const handleHoverStart = useCallback((event: InteractionEvent) => {
    if (!interactive) return;
    setHovered(true);
    document.body.style.cursor = draggable ? 'grab' : 'pointer';
    onHoverStart?.(event);
  }, [interactive, draggable, onHoverStart]);

  // 处理悬停结束
  const handleHoverEnd = useCallback((event: InteractionEvent) => {
    if (!interactive) return;
    setHovered(false);
    document.body.style.cursor = 'auto';
    onHoverEnd?.(event);
  }, [interactive, onHoverEnd]);

  // 处理拖拽开始
  const handleDragStart = useCallback((event: InteractionEvent) => {
    if (!interactive || !draggable) return;
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    
    if (meshRef.current && event.worldPosition) {
      const offset = meshRef.current.position.clone().sub(event.worldPosition);
      setDragOffset(offset);
    }
    
    onDragStart?.(event);
  }, [interactive, draggable, onDragStart]);

  // 处理拖拽中
  const handleDrag = useCallback((event: InteractionEvent) => {
    if (!interactive || !draggable || !isDragging) return;
    
    if (meshRef.current && event.worldPosition) {
      const newPosition = event.worldPosition.clone().add(dragOffset);
      meshRef.current.position.copy(newPosition);
    }
    
    onDrag?.(event);
  }, [interactive, draggable, isDragging, dragOffset, onDrag]);

  // 处理拖拽结束
  const handleDragEnd = useCallback((event: InteractionEvent) => {
    if (!interactive || !draggable) return;
    setIsDragging(false);
    document.body.style.cursor = hovered ? 'grab' : 'auto';
    onDragEnd?.(event);
  }, [interactive, draggable, hovered, onDragEnd]);

  // 更新材质颜色
  React.useEffect(() => {
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.color.set(getCurrentColor());
      meshRef.current.material.emissive.set(hovered || selected ? getCurrentColor() : '#000000');
      meshRef.current.material.emissiveIntensity = hovered || selected ? 0.1 : 0;
    }
  }, [getCurrentColor, hovered, selected]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 主要网格 */}
      <mesh
        ref={meshRef}
        geometry={createGeometry()}
        material={createMaterial()}
        userData={{
          interactive,
          draggable,
          onInteraction: {
            onClick: handleClick,
            onHoverStart: handleHoverStart,
            onHoverEnd: handleHoverEnd,
            onDragStart: handleDragStart,
            onDrag: handleDrag,
            onDragEnd: handleDragEnd,
          },
        }}
      />

      {/* 标签 */}
      {label && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color={theme.colors.text.primary}
          anchorX="center"
          anchorY="middle"

          maxWidth={10}
          textAlign="center"
        >
          {label}
        </Text>
      )}

      {/* 选中指示器 */}
      {selected && (
        <mesh position={[0, 0, 0]} scale={1.1}>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshBasicMaterial
            color={defaultSelectedColor}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}

      {/* 悬停指示器 */}
      {hovered && !selected && (
        <mesh position={[0, 0, 0]} scale={1.05}>
          <sphereGeometry args={[1.05, 32, 32]} />
          <meshBasicMaterial
            color={defaultHoverColor}
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}

      {/* 子组件 */}
      {children}
    </group>
  );
};

export default InteractiveObject;
