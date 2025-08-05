/**
 * FrameRateController 组件
 * 帧率控制器，提供帧率限制、自适应帧率和渲染暂停功能
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';

export interface FrameRateControllerProps {
  /** 目标帧率 */
  targetFPS?: number;
  /** 是否启用自适应帧率 */
  adaptiveFrameRate?: boolean;
  /** 最小帧率 */
  minFPS?: number;
  /** 最大帧率 */
  maxFPS?: number;
  /** 是否在页面不可见时暂停渲染 */
  pauseOnHidden?: boolean;
  /** 是否在窗口失焦时降低帧率 */
  reduceOnBlur?: boolean;
  /** 失焦时的帧率 */
  blurFPS?: number;
  /** 帧率变化回调 */
  onFrameRateChange?: (fps: number) => void;
  /** 渲染状态回调 */
  onRenderStateChange?: (state: 'active' | 'paused' | 'reduced') => void;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 帧率控制器组件
 */
export const FrameRateController: React.FC<FrameRateControllerProps> = ({
  targetFPS = 60,
  adaptiveFrameRate = true,
  minFPS = 30,
  maxFPS = 120,
  pauseOnHidden = true,
  reduceOnBlur = true,
  blurFPS = 30,
  onFrameRateChange,
  onRenderStateChange,
  children,
}) => {
  const frameIntervalRef = useRef(1000 / targetFPS);
  const lastFrameTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsHistoryRef = useRef<number[]>([]);
  const currentFPSRef = useRef(targetFPS);
  const renderStateRef = useRef<'active' | 'paused' | 'reduced'>('active');
  const isVisibleRef = useRef(true);
  const isFocusedRef = useRef(true);

  // 更新帧率间隔
  const updateFrameInterval = useCallback((fps: number) => {
    const clampedFPS = Math.max(minFPS, Math.min(maxFPS, fps));
    frameIntervalRef.current = 1000 / clampedFPS;
    currentFPSRef.current = clampedFPS;
    onFrameRateChange?.(clampedFPS);
  }, [minFPS, maxFPS, onFrameRateChange]);

  // 自适应帧率调整
  const adjustFrameRate = useCallback(() => {
    if (!adaptiveFrameRate) return;

    const history = fpsHistoryRef.current;
    if (history.length < 10) return; // 需要足够的历史数据

    const avgFPS = history.reduce((sum, fps) => sum + fps, 0) / history.length;
    const variance = history.reduce((sum, fps) => sum + Math.pow(fps - avgFPS, 2), 0) / history.length;
    const stability = 1 / (1 + variance);

    let newTargetFPS = currentFPSRef.current;

    // 如果帧率稳定且高于目标，可以尝试提高目标帧率
    if (stability > 0.8 && avgFPS > currentFPSRef.current * 1.1) {
      newTargetFPS = Math.min(maxFPS, currentFPSRef.current + 5);
    }
    // 如果帧率不稳定或低于目标，降低目标帧率
    else if (stability < 0.5 || avgFPS < currentFPSRef.current * 0.9) {
      newTargetFPS = Math.max(minFPS, currentFPSRef.current - 5);
    }

    if (newTargetFPS !== currentFPSRef.current) {
      updateFrameInterval(newTargetFPS);
    }

    // 清理历史数据
    if (history.length > 60) {
      history.splice(0, 30);
    }
  }, [adaptiveFrameRate, maxFPS, minFPS, updateFrameInterval]);

  // 更新渲染状态
  const updateRenderState = useCallback(() => {
    let newState: 'active' | 'paused' | 'reduced' = 'active';

    if (pauseOnHidden && !isVisibleRef.current) {
      newState = 'paused';
    } else if (reduceOnBlur && !isFocusedRef.current) {
      newState = 'reduced';
      updateFrameInterval(blurFPS);
    } else {
      updateFrameInterval(targetFPS);
    }

    if (newState !== renderStateRef.current) {
      renderStateRef.current = newState;
      onRenderStateChange?.(newState);
    }
  }, [pauseOnHidden, reduceOnBlur, blurFPS, targetFPS, updateFrameInterval, onRenderStateChange]);

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      updateRenderState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateRenderState]);

  // 窗口焦点变化处理
  useEffect(() => {
    const handleFocus = () => {
      isFocusedRef.current = true;
      updateRenderState();
    };

    const handleBlur = () => {
      isFocusedRef.current = false;
      updateRenderState();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [updateRenderState]);

  // 渲染循环控制
  useFrame((state, delta) => {
    const currentTime = performance.now();

    // 检查是否应该暂停渲染
    if (renderStateRef.current === 'paused') {
      return;
    }

    // 帧率限制
    if (currentTime - lastFrameTimeRef.current < frameIntervalRef.current) {
      return;
    }

    lastFrameTimeRef.current = currentTime;
    frameCountRef.current++;

    // 计算实际FPS
    const actualFPS = 1000 / (delta * 1000);
    fpsHistoryRef.current.push(actualFPS);

    // 每60帧调整一次帧率
    if (frameCountRef.current % 60 === 0) {
      adjustFrameRate();
    }
  });

  // 初始化
  useEffect(() => {
    updateFrameInterval(targetFPS);
    updateRenderState();
  }, [targetFPS, updateFrameInterval, updateRenderState]);

  return <>{children}</>;
};

export default FrameRateController;
