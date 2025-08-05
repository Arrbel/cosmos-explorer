/**
 * ScaleContext 组件
 * 尺度状态上下文，用于在Canvas内外共享尺度状态
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScaleLevel, type ScaleEvent, type ScaleManagerState } from '@/types/scale';
import { SCALE_DEFINITIONS, SCALE_LEVELS_ORDERED, getScaleIndex, getAdjacentScales } from '@/constants/scales';

export interface ScaleContextValue {
  // 状态
  state: ScaleManagerState;
  
  // 控制方法
  transitionToScale: (scale: ScaleLevel) => void;
  scaleUp: () => void;
  scaleDown: () => void;
  jumpToMagnitude: (magnitude: number) => void;
  goBack: () => void;
  
  // 信息方法
  getScaleInfo: (scale?: ScaleLevel) => any;
  canTransitionTo: (scale: ScaleLevel) => boolean;
  
  // 事件处理
  onScaleEvent: (event: ScaleEvent) => void;
}

const ScaleContext = createContext<ScaleContextValue | null>(null);

export interface ScaleProviderProps {
  /** 初始尺度 */
  initialScale?: ScaleLevel;
  /** 尺度事件回调 */
  onScaleEvent?: (event: ScaleEvent) => void;
  /** 尺度变化回调 */
  onScaleChange?: (from: ScaleLevel, to: ScaleLevel) => void;
  /** 过渡进度回调 */
  onTransitionProgress?: (progress: number) => void;
  /** 子组件 */
  children: React.ReactNode;
}

/**
 * 尺度状态提供者组件
 */
export const ScaleProvider: React.FC<ScaleProviderProps> = ({
  initialScale = ScaleLevel.HUMAN_SCALE,
  onScaleEvent,
  onScaleChange,
  onTransitionProgress,
  children,
}) => {
  const [state, setState] = useState<ScaleManagerState>({
    currentScale: initialScale,
    targetScale: null,
    isTransitioning: false,
    transitionProgress: 0,
    availableScales: SCALE_LEVELS_ORDERED,
    scaleHistory: [initialScale],
    maxHistorySize: 10,
  });

  // 发送尺度事件
  const emitScaleEvent = useCallback((type: ScaleEvent['type'], data?: Partial<ScaleEvent>) => {
    const event: ScaleEvent = {
      type,
      timestamp: Date.now(),
      ...data,
    };
    onScaleEvent?.(event);
  }, [onScaleEvent]);

  // 开始尺度过渡
  const transitionToScale = useCallback((targetScale: ScaleLevel) => {
    if (state.isTransitioning || state.currentScale === targetScale) {
      return;
    }

    setState(prev => ({
      ...prev,
      targetScale,
      isTransitioning: true,
      transitionProgress: 0,
    }));

    // 发送事件
    emitScaleEvent('scale-change-start', {
      fromScale: state.currentScale,
      toScale: targetScale,
    });

    // 调用回调
    onScaleChange?.(state.currentScale, targetScale);

    // 模拟过渡过程
    const startTime = performance.now();
    const duration = 2000; // 2秒过渡时间

    const updateProgress = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setState(prev => ({
        ...prev,
        transitionProgress: easedProgress,
      }));

      // 发送进度事件
      emitScaleEvent('scale-change-progress', {
        fromScale: state.currentScale,
        toScale: targetScale,
        progress: easedProgress,
      });

      onTransitionProgress?.(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        // 完成过渡
        setState(prev => ({
          ...prev,
          currentScale: targetScale,
          targetScale: null,
          isTransitioning: false,
          transitionProgress: 1,
          scaleHistory: [...prev.scaleHistory.slice(-9), targetScale], // 保留最近10个
        }));

        // 发送完成事件
        emitScaleEvent('scale-change-complete', {
          fromScale: state.currentScale,
          toScale: targetScale,
        });
      }
    };

    requestAnimationFrame(updateProgress);
  }, [state.currentScale, state.isTransitioning, emitScaleEvent, onScaleChange, onTransitionProgress]);

  // 切换到相邻尺度
  const scaleUp = useCallback(() => {
    const adjacent = getAdjacentScales(state.currentScale);
    if (adjacent.larger) {
      transitionToScale(adjacent.larger);
    }
  }, [state.currentScale, transitionToScale]);

  const scaleDown = useCallback(() => {
    const adjacent = getAdjacentScales(state.currentScale);
    if (adjacent.smaller) {
      transitionToScale(adjacent.smaller);
    }
  }, [state.currentScale, transitionToScale]);

  // 跳转到指定数量级
  const jumpToMagnitude = useCallback((magnitude: number) => {
    const targetScale = SCALE_LEVELS_ORDERED.find(scale => 
      SCALE_DEFINITIONS[scale].magnitude === magnitude
    );
    if (targetScale) {
      transitionToScale(targetScale);
    }
  }, [transitionToScale]);

  // 返回上一个尺度
  const goBack = useCallback(() => {
    const history = state.scaleHistory;
    if (history.length > 1) {
      const previousScale = history[history.length - 2];
      transitionToScale(previousScale);
    }
  }, [state.scaleHistory, transitionToScale]);

  // 获取尺度信息
  const getScaleInfo = useCallback((scale?: ScaleLevel) => {
    return SCALE_DEFINITIONS[scale || state.currentScale];
  }, [state.currentScale]);

  // 检查是否可以切换到指定尺度
  const canTransitionTo = useCallback((scale: ScaleLevel) => {
    return !state.isTransitioning && state.availableScales.includes(scale);
  }, [state.isTransitioning, state.availableScales]);

  const contextValue: ScaleContextValue = {
    state,
    transitionToScale,
    scaleUp,
    scaleDown,
    jumpToMagnitude,
    goBack,
    getScaleInfo,
    canTransitionTo,
    onScaleEvent: emitScaleEvent,
  };

  return (
    <ScaleContext.Provider value={contextValue}>
      {children}
    </ScaleContext.Provider>
  );
};

/**
 * 使用尺度上下文的Hook
 */
export const useScaleContext = () => {
  const context = useContext(ScaleContext);
  if (!context) {
    throw new Error('useScaleContext must be used within a ScaleProvider');
  }
  return context;
};

export default ScaleProvider;
