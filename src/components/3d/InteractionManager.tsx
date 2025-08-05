/**
 * InteractionManager 组件
 * 3D场景交互管理器，提供点击、悬停、拖拽等交互功能
 */

import React, { useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface InteractionEvent {
  /** 事件类型 */
  type: 'click' | 'hover' | 'drag' | 'wheel' | 'key';
  /** 目标对象 */
  object?: THREE.Object3D;
  /** 鼠标/触摸位置 */
  position?: { x: number; y: number };
  /** 3D世界坐标 */
  worldPosition?: THREE.Vector3;
  /** 射线信息 */
  ray?: THREE.Ray;
  /** 原始事件 */
  originalEvent?: Event;
  /** 额外数据 */
  data?: any;
}

export interface InteractionManagerProps {
  /** 是否启用交互 */
  enabled?: boolean;
  /** 是否启用点击交互 */
  enableClick?: boolean;
  /** 是否启用悬停交互 */
  enableHover?: boolean;
  /** 是否启用拖拽交互 */
  enableDrag?: boolean;
  /** 是否启用滚轮交互 */
  enableWheel?: boolean;
  /** 是否启用键盘交互 */
  enableKeyboard?: boolean;
  /** 可交互对象过滤器 */
  objectFilter?: (object: THREE.Object3D) => boolean;
  /** 交互事件回调 */
  onInteraction?: (event: InteractionEvent) => void;
  /** 点击事件回调 */
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
  /** 滚轮事件回调 */
  onWheel?: (event: InteractionEvent) => void;
  /** 键盘事件回调 */
  onKeyboard?: (event: InteractionEvent) => void;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 交互管理器组件
 */
export const InteractionManager: React.FC<InteractionManagerProps> = ({
  enabled = true,
  enableClick = true,
  enableHover = true,
  enableDrag = true,
  enableWheel = true,
  enableKeyboard = true,
  objectFilter,
  onInteraction,
  onClick,
  onHoverStart,
  onHoverEnd,
  onDragStart,
  onDrag,
  onDragEnd,
  onWheel,
  onKeyboard,
  children,
}) => {
  const { camera, scene, gl, raycaster } = useThree();
  const mouseRef = useRef(new THREE.Vector2());
  const hoveredObjectRef = useRef<THREE.Object3D | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartPositionRef = useRef(new THREE.Vector2());
  const dragObjectRef = useRef<THREE.Object3D | null>(null);

  // 射线检测
  const performRaycast = useCallback((x: number, y: number) => {
    mouseRef.current.set(x, y);
    raycaster.setFromCamera(mouseRef.current, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // 过滤可交互对象
    const filteredIntersects = intersects.filter(intersect => {
      if (!objectFilter) return true;
      return objectFilter(intersect.object);
    });

    return filteredIntersects;
  }, [camera, scene, raycaster, objectFilter]);

  // 处理鼠标移动
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 悬停检测
    if (enableHover && !isDraggingRef.current) {
      const intersects = performRaycast(x, y);
      const newHoveredObject = intersects.length > 0 ? intersects[0].object : null;

      if (newHoveredObject !== hoveredObjectRef.current) {
        // 悬停结束
        if (hoveredObjectRef.current) {
          const endEvent: InteractionEvent = {
            type: 'hover',
            object: hoveredObjectRef.current,
            position: { x: event.clientX, y: event.clientY },
            originalEvent: event,
          };
          onHoverEnd?.(endEvent);
          onInteraction?.(endEvent);
        }

        // 悬停开始
        if (newHoveredObject) {
          const startEvent: InteractionEvent = {
            type: 'hover',
            object: newHoveredObject,
            position: { x: event.clientX, y: event.clientY },
            worldPosition: intersects[0].point,
            originalEvent: event,
          };
          onHoverStart?.(startEvent);
          onInteraction?.(startEvent);
        }

        hoveredObjectRef.current = newHoveredObject;
      }
    }

    // 拖拽处理
    if (enableDrag && isDraggingRef.current && dragObjectRef.current) {
      const dragEvent: InteractionEvent = {
        type: 'drag',
        object: dragObjectRef.current,
        position: { x: event.clientX, y: event.clientY },
        originalEvent: event,
        data: {
          deltaX: event.clientX - dragStartPositionRef.current.x,
          deltaY: event.clientY - dragStartPositionRef.current.y,
        },
      };
      onDrag?.(dragEvent);
      onInteraction?.(dragEvent);
    }
  }, [enabled, enableHover, enableDrag, gl, performRaycast, onHoverStart, onHoverEnd, onDrag, onInteraction]);

  // 处理鼠标点击
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!enabled || !enableClick) return;

    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const intersects = performRaycast(x, y);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      // 点击事件
      const clickEvent: InteractionEvent = {
        type: 'click',
        object: clickedObject,
        position: { x: event.clientX, y: event.clientY },
        worldPosition: intersects[0].point,
        originalEvent: event,
      };
      onClick?.(clickEvent);
      onInteraction?.(clickEvent);

      // 拖拽开始
      if (enableDrag) {
        isDraggingRef.current = true;
        dragObjectRef.current = clickedObject;
        dragStartPositionRef.current.set(event.clientX, event.clientY);

        const dragStartEvent: InteractionEvent = {
          type: 'drag',
          object: clickedObject,
          position: { x: event.clientX, y: event.clientY },
          worldPosition: intersects[0].point,
          originalEvent: event,
        };
        onDragStart?.(dragStartEvent);
        onInteraction?.(dragStartEvent);
      }
    }
  }, [enabled, enableClick, enableDrag, gl, performRaycast, onClick, onDragStart, onInteraction]);

  // 处理鼠标释放
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    if (enableDrag && isDraggingRef.current && dragObjectRef.current) {
      const dragEndEvent: InteractionEvent = {
        type: 'drag',
        object: dragObjectRef.current,
        position: { x: event.clientX, y: event.clientY },
        originalEvent: event,
      };
      onDragEnd?.(dragEndEvent);
      onInteraction?.(dragEndEvent);

      isDraggingRef.current = false;
      dragObjectRef.current = null;
    }
  }, [enabled, enableDrag, onDragEnd, onInteraction]);

  // 处理滚轮事件
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enabled || !enableWheel) return;

    const wheelEvent: InteractionEvent = {
      type: 'wheel',
      position: { x: event.clientX, y: event.clientY },
      originalEvent: event,
      data: {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
      },
    };
    onWheel?.(wheelEvent);
    onInteraction?.(wheelEvent);
  }, [enabled, enableWheel, onWheel, onInteraction]);

  // 处理键盘事件
  const handleKeyboard = useCallback((event: KeyboardEvent) => {
    if (!enabled || !enableKeyboard) return;

    const keyboardEvent: InteractionEvent = {
      type: 'key',
      originalEvent: event,
      data: {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      },
    };
    onKeyboard?.(keyboardEvent);
    onInteraction?.(keyboardEvent);
  }, [enabled, enableKeyboard, onKeyboard, onInteraction]);

  // 绑定事件监听器
  React.useEffect(() => {
    const canvas = gl.domElement;
    
    if (enabled) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('wheel', handleWheel);
      
      if (enableKeyboard) {
        window.addEventListener('keydown', handleKeyboard);
        window.addEventListener('keyup', handleKeyboard);
      }
    }

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      
      if (enableKeyboard) {
        window.removeEventListener('keydown', handleKeyboard);
        window.removeEventListener('keyup', handleKeyboard);
      }
    };
  }, [enabled, enableKeyboard, gl, handleMouseMove, handleMouseDown, handleMouseUp, handleWheel, handleKeyboard]);

  return <>{children}</>;
};

export default InteractionManager;
