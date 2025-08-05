/**
 * MultiScaleDemo 组件
 * 多尺度系统演示组件
 */

import React, { useState } from 'react';
import { ScaleProvider, ScaleNavigator, ScaleVisualizer, useScaleContext } from './';
import { ScaleLevel, type ScaleEvent } from '@/types/scale';
import { OptimizedCanvas3D } from '@/components/3d';

export interface MultiScaleDemoProps {
  /** 初始尺度 */
  initialScale?: ScaleLevel;
  /** 是否显示导航器 */
  showNavigator?: boolean;
  /** 导航器模式 */
  navigatorMode?: 'compact' | 'full' | 'slider';
  /** 是否启用调试信息 */
  showDebugInfo?: boolean;
  /** 渲染质量 */
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  /** 高度 */
  height?: string | number;
}

/**
 * 内部Canvas组件（在ScaleProvider内部使用）
 */
const InternalCanvas: React.FC<{
  quality: string;
  showDebugInfo: boolean;
  height: string | number;
}> = ({ quality, showDebugInfo, height }) => {
  return (
    <OptimizedCanvas3D
      quality="high"
      targetFPS={60}
      adaptiveFrameRate={true}
      autoQualityAdjust={true}
      maxMemoryUsage={256}
      showPerformanceMonitor={false}
      showGrid={false}
      enableEnvironment={true}
      environmentPreset="night"
      cameraMode="orbit"
      cameraConfig={{
        position: [10, 10, 10],
        target: [0, 0, 0],
        fov: 75,
        near: 0.1,
        far: 1000,
      }}
      className="w-full h-full"
    >
      <ScaleVisualizer
        enableLOD={true}
        quality={quality}
        showDebugInfo={showDebugInfo}
      />
    </OptimizedCanvas3D>
  );
};

/**
 * UI覆盖层组件（在ScaleProvider内部使用）
 */
const UIOverlay: React.FC<{
  showNavigator: boolean;
  navigatorMode: 'compact' | 'full' | 'slider';
  showDebugInfo: boolean;
  eventLog: ScaleEvent[];
}> = ({ showNavigator, navigatorMode, showDebugInfo, eventLog }) => {
  const { state } = useScaleContext();

  return (
    <>
      {/* 尺度导航器 */}
      {showNavigator && (
        <ScaleNavigator
          visible={true}
          position="bottom-right"
          mode={navigatorMode}
          showScaleInfo={true}
          showQuickButtons={true}
          showHistory={true}
        />
      )}

      {/* 事件日志 */}
      {showDebugInfo && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs font-mono max-w-xs z-50">
          <div className="font-bold mb-2">事件日志</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {eventLog.slice(-5).map((event, index) => (
              <div key={index} className="text-xs">
                <span className="text-gray-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <br />
                <span className="text-blue-400">{event.type}</span>
                {event.fromScale && event.toScale && (
                  <>
                    <br />
                    <span className="text-green-400">
                      {event.fromScale} → {event.toScale}
                    </span>
                  </>
                )}
                {event.progress !== undefined && (
                  <>
                    <br />
                    <span className="text-yellow-400">
                      进度: {Math.round(event.progress * 100)}%
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 过渡状态指示器 */}
      {state.isTransitioning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>正在切换尺度...</span>
          </div>
        </div>
      )}

      {/* 键盘快捷键提示 */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
        <div className="font-bold mb-1">快捷键</div>
        <div>↑/↓: 切换尺度</div>
        <div>1-6: 快速跳转</div>
        <div>Space: 暂停/继续</div>
      </div>
    </>
  );
};

/**
 * 多尺度演示组件
 */
export const MultiScaleDemo: React.FC<MultiScaleDemoProps> = ({
  initialScale = ScaleLevel.HUMAN_SCALE,
  showNavigator = true,
  navigatorMode = 'compact',
  showDebugInfo = false,
  quality = 'medium',
  height = '500px',
}) => {
  const [eventLog, setEventLog] = useState<ScaleEvent[]>([]);

  // 处理尺度变化
  const handleScaleChange = (from: ScaleLevel, to: ScaleLevel) => {
    console.log(`尺度变化: ${from} → ${to}`);
  };

  // 处理尺度事件
  const handleScaleEvent = (event: ScaleEvent) => {
    setEventLog(prev => [...prev.slice(-9), event]); // 保留最近10个事件
  };

  return (
    <ScaleProvider
      initialScale={initialScale}
      onScaleChange={handleScaleChange}
      onScaleEvent={handleScaleEvent}
    >
      <div className="relative w-full" style={{ height }}>
        {/* 3D画布层 */}
        <InternalCanvas
          quality={quality}
          showDebugInfo={showDebugInfo}
          height={height}
        />

        {/* UI覆盖层 */}
        <UIOverlay
          showNavigator={showNavigator}
          navigatorMode={navigatorMode}
          showDebugInfo={showDebugInfo}
          eventLog={eventLog}
        />
      </div>
    </ScaleProvider>
  );
};

export default MultiScaleDemo;
