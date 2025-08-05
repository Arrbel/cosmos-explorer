/**
 * PerformanceMonitor 组件
 * 3D场景性能监控器
 */

import React, { useState, useEffect } from 'react';
import type { PerformanceStats, RenderQuality } from '@/types/engine';

export interface PerformanceMonitorProps {
  /** 是否显示性能统计 */
  visible?: boolean;
  /** 性能更新回调 */
  onPerformanceUpdate?: (stats: PerformanceStats) => void;
  /** 自动质量调整 */
  autoQualityAdjust?: boolean;
  /** 目标FPS */
  targetFPS?: number;
  /** 质量调整回调 */
  onQualityChange?: (quality: RenderQuality) => void;
  /** 位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * 性能监控器组件
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  visible = true,
  onPerformanceUpdate,
  autoQualityAdjust = false,
  targetFPS = 60,
  onQualityChange,
  position = 'top-left',
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
  });

  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());
  const [currentQuality, setCurrentQuality] = useState<RenderQuality>('medium');
  const [qualityAdjustCooldown, setQualityAdjustCooldown] = useState(0);

  // 质量级别定义
  const qualityLevels: RenderQuality[] = ['ultra_low', 'low', 'medium', 'high', 'ultra_high'];

  // 使用定时器更新性能统计（替代useFrame）
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      const currentTime = performance.now();
      const newFrameCount = frameCount + 1;
      setFrameCount(newFrameCount);

      // 每秒更新一次统计
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((newFrameCount * 1000) / (currentTime - lastTime));
        const frameTime = (currentTime - lastTime) / newFrameCount;

        // 获取内存使用情况
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

        const newStats: PerformanceStats = {
          fps,
          frameTime,
          memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
          drawCalls: 0, // 无法在Canvas外获取
          triangles: 0, // 无法在Canvas外获取
        };

        setStats(newStats);
        onPerformanceUpdate?.(newStats);

        // 自动质量调整
        if (autoQualityAdjust && qualityAdjustCooldown <= 0) {
          adjustQuality(fps);
          setQualityAdjustCooldown(60); // 60帧冷却时间
        }

        setFrameCount(0);
        setLastTime(currentTime);
      }

      // 减少冷却时间
      if (qualityAdjustCooldown > 0) {
        setQualityAdjustCooldown(prev => prev - 1);
      }
    }, 16); // 约60FPS

    return () => clearInterval(interval);
  }, [visible, frameCount, lastTime, autoQualityAdjust, qualityAdjustCooldown, onPerformanceUpdate]);

  // 自动质量调整逻辑
  const adjustQuality = (fps: number) => {
    const currentIndex = qualityLevels.indexOf(currentQuality);
    let newQuality = currentQuality;

    if (fps < targetFPS * 0.8 && currentIndex > 0) {
      // FPS过低，降低质量
      newQuality = qualityLevels[currentIndex - 1];
    } else if (fps > targetFPS * 1.1 && currentIndex < qualityLevels.length - 1) {
      // FPS过高，提升质量
      newQuality = qualityLevels[currentIndex + 1];
    }

    if (newQuality !== currentQuality) {
      setCurrentQuality(newQuality);
      onQualityChange?.(newQuality);
    }
  };

  // 获取位置样式
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 1000,
      padding: '8px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '4px',
      minWidth: '200px',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: '10px', left: '10px' };
      case 'top-right':
        return { ...baseStyle, top: '10px', right: '10px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '10px', left: '10px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '10px', right: '10px' };
      default:
        return { ...baseStyle, top: '10px', left: '10px' };
    }
  };

  // 获取FPS颜色
  const getFPSColor = (fps: number) => {
    if (fps >= targetFPS * 0.9) return '#4ade80'; // 绿色
    if (fps >= targetFPS * 0.7) return '#fbbf24'; // 黄色
    return '#ef4444'; // 红色
  };

  if (!visible) return null;

  return (
    <div style={getPositionStyle()}>
      <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>
        性能监控
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ color: getFPSColor(stats.fps) }}>
          FPS: {stats.fps}
        </div>
        
        <div>
          帧时间: {stats.frameTime.toFixed(2)}ms
        </div>
        
        <div>
          内存: {stats.memoryUsage}MB
        </div>
        
        <div>
          绘制调用: {stats.drawCalls}
        </div>
        
        <div>
          三角形: {stats.triangles.toLocaleString()}
        </div>

        {autoQualityAdjust && (
          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #444' }}>
            <div>质量: {currentQuality}</div>
            <div>目标FPS: {targetFPS}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
