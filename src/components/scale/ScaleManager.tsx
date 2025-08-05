/**
 * ScaleManager 组件
 * 多尺度场景管理器核心组件
 */

import React, { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { ScaleLevel, type ScaleManagerState, type ScaleEvent, type ScaleEventType } from '@/types/scale';
import { SCALE_DEFINITIONS, SCALE_LEVELS_ORDERED, getScaleIndex, getAdjacentScales } from '@/constants/scales';

export interface ScaleManagerProps {
  /** 初始尺度 */
  initialScale?: ScaleLevel;
  /** 当前尺度 */
  currentScale?: ScaleLevel;
  /** 是否启用自动过渡 */
  enableAutoTransition?: boolean;
  /** 过渡持续时间（毫秒） */
  transitionDuration?: number;
  /** 尺度变化回调 */
  onScaleChange?: (from: ScaleLevel, to: ScaleLevel) => void;
  /** 过渡进度回调 */
  onTransitionProgress?: (progress: number) => void;
  /** 尺度事件回调 */
  onScaleEvent?: (event: ScaleEvent) => void;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 尺度管理器组件
 */
export const ScaleManager: React.FC<ScaleManagerProps> = ({
  initialScale = ScaleLevel.HUMAN_SCALE,
  currentScale,
  enableAutoTransition = true,
  transitionDuration = 2000,
  onScaleChange,
  onTransitionProgress,
  onScaleEvent,
  children,
}) => {
  const stateRef = useRef<ScaleManagerState>({
    currentScale: currentScale || initialScale,
    targetScale: null,
    isTransitioning: false,
    transitionProgress: 0,
    availableScales: SCALE_LEVELS_ORDERED,
    scaleHistory: [currentScale || initialScale],
    maxHistorySize: 10,
  });

  const transitionStartTimeRef = useRef<number>(0);
  const initialCameraPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetCameraPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // 发送尺度事件
  const emitScaleEvent = useCallback((type: ScaleEventType, data?: Partial<ScaleEvent>) => {
    const event: ScaleEvent = {
      type,
      timestamp: Date.now(),
      ...data,
    };
    onScaleEvent?.(event);
  }, [onScaleEvent]);

  // 更新相机位置和设置（现在只是记录目标位置）
  const updateCameraForScale = useCallback((scale: ScaleLevel, immediate = false) => {
    const scaleInfo = SCALE_DEFINITIONS[scale];
    if (!scaleInfo) return;

    const targetPosition = new THREE.Vector3(0, 0, scaleInfo.defaultCameraDistance);

    if (immediate) {
      // 在没有相机的情况下，只记录位置
      targetCameraPositionRef.current.copy(targetPosition);
    } else {
      targetCameraPositionRef.current.copy(targetPosition);
    }
  }, []);

  // 开始尺度过渡
  const startScaleTransition = useCallback((targetScale: ScaleLevel) => {
    const state = stateRef.current;
    
    if (state.isTransitioning || state.currentScale === targetScale) {
      return;
    }

    // 更新状态
    state.targetScale = targetScale;
    state.isTransitioning = true;
    state.transitionProgress = 0;
    transitionStartTimeRef.current = performance.now();

    // 记录初始相机位置（现在使用默认位置）
    initialCameraPositionRef.current.set(0, 0, 10);
    
    // 计算目标相机位置
    updateCameraForScale(targetScale, false);

    // 发送事件
    emitScaleEvent('scale-change-start', {
      fromScale: state.currentScale,
      toScale: targetScale,
    });

    // 调用回调
    onScaleChange?.(state.currentScale, targetScale);
  }, [updateCameraForScale, emitScaleEvent, onScaleChange]);

  // 完成尺度过渡
  const completeScaleTransition = useCallback(() => {
    const state = stateRef.current;
    
    if (!state.isTransitioning || !state.targetScale) {
      return;
    }

    const previousScale = state.currentScale;
    
    // 更新状态
    state.currentScale = state.targetScale;
    state.targetScale = null;
    state.isTransitioning = false;
    state.transitionProgress = 1;

    // 更新历史记录
    state.scaleHistory.push(state.currentScale);
    if (state.scaleHistory.length > state.maxHistorySize) {
      state.scaleHistory.shift();
    }

    // 最终更新相机
    updateCameraForScale(state.currentScale, true);

    // 发送事件
    emitScaleEvent('scale-change-complete', {
      fromScale: previousScale,
      toScale: state.currentScale,
    });
  }, [updateCameraForScale, emitScaleEvent]);

  // 缓动函数
  const easeInOutCubic = useCallback((t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }, []);

  // 使用定时器进行过渡更新（替代useFrame）
  useEffect(() => {
    if (!stateRef.current.isTransitioning) return;

    const interval = setInterval(() => {
      const state = stateRef.current;

      if (!state.isTransitioning || !state.targetScale) {
        return;
      }

      const currentTime = performance.now();
      const elapsed = currentTime - transitionStartTimeRef.current;
      const rawProgress = Math.min(elapsed / transitionDuration, 1);
      const easedProgress = easeInOutCubic(rawProgress);

      // 更新过渡进度
      state.transitionProgress = easedProgress;

      // 发送进度事件
      emitScaleEvent('scale-change-progress', {
        fromScale: state.currentScale,
        toScale: state.targetScale,
        progress: easedProgress,
      });

      // 调用进度回调
      onTransitionProgress?.(easedProgress);

      // 检查是否完成过渡
      if (rawProgress >= 1) {
        completeScaleTransition();
      }
    }, 16); // 约60FPS

    return () => clearInterval(interval);
  }, [stateRef.current.isTransitioning, transitionDuration, easeInOutCubic, emitScaleEvent, onTransitionProgress, completeScaleTransition]);

  // 外部尺度变化处理
  useEffect(() => {
    if (currentScale && currentScale !== stateRef.current.currentScale && !stateRef.current.isTransitioning) {
      if (enableAutoTransition) {
        startScaleTransition(currentScale);
      } else {
        stateRef.current.currentScale = currentScale;
        updateCameraForScale(currentScale, true);
      }
    }
  }, [currentScale, enableAutoTransition, startScaleTransition, updateCameraForScale]);

  // 初始化
  useEffect(() => {
    updateCameraForScale(stateRef.current.currentScale, true);
  }, [updateCameraForScale]);

  // 暴露管理方法
  const scaleManagerAPI = {
    // 获取当前状态
    getState: () => ({ ...stateRef.current }),
    
    // 切换到指定尺度
    transitionToScale: startScaleTransition,
    
    // 切换到相邻尺度
    scaleUp: () => {
      const adjacent = getAdjacentScales(stateRef.current.currentScale);
      if (adjacent.larger) {
        startScaleTransition(adjacent.larger);
      }
    },
    
    scaleDown: () => {
      const adjacent = getAdjacentScales(stateRef.current.currentScale);
      if (adjacent.smaller) {
        startScaleTransition(adjacent.smaller);
      }
    },
    
    // 跳转到指定数量级
    jumpToMagnitude: (magnitude: number) => {
      const targetScale = SCALE_LEVELS_ORDERED.find(scale => 
        SCALE_DEFINITIONS[scale].magnitude === magnitude
      );
      if (targetScale) {
        startScaleTransition(targetScale);
      }
    },
    
    // 返回上一个尺度
    goBack: () => {
      const history = stateRef.current.scaleHistory;
      if (history.length > 1) {
        const previousScale = history[history.length - 2];
        startScaleTransition(previousScale);
      }
    },
    
    // 获取尺度信息
    getScaleInfo: (scale?: ScaleLevel) => {
      return SCALE_DEFINITIONS[scale || stateRef.current.currentScale];
    },
    
    // 检查是否可以切换到指定尺度
    canTransitionTo: (scale: ScaleLevel) => {
      return !stateRef.current.isTransitioning && 
             stateRef.current.availableScales.includes(scale);
    },
  };

  // 将API暴露给子组件
  return (
    <scaleManagerContext.Provider value={scaleManagerAPI}>
      {children}
    </scaleManagerContext.Provider>
  );
};

// 创建Context
const scaleManagerContext = React.createContext<{
  getState: () => ScaleManagerState;
  transitionToScale: (scale: ScaleLevel) => void;
  scaleUp: () => void;
  scaleDown: () => void;
  jumpToMagnitude: (magnitude: number) => void;
  goBack: () => void;
  getScaleInfo: (scale?: ScaleLevel) => any;
  canTransitionTo: (scale: ScaleLevel) => boolean;
} | null>(null);

// Hook for using scale manager
export const useScaleManager = () => {
  const context = React.useContext(scaleManagerContext);
  if (!context) {
    throw new Error('useScaleManager must be used within a ScaleManager');
  }
  return context;
};

export default ScaleManager;
