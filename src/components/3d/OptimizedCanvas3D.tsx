/**
 * OptimizedCanvas3D 组件
 * 终极优化版3D画布，集成所有性能优化功能
 */

import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import { Loading } from '@/components';
import { useTheme } from '@/contexts';
import { SceneManager } from './SceneManager';
import { CameraController } from './CameraController';
import { LightingSystem } from './LightingSystem';
import { PerformanceMonitor } from './PerformanceMonitor';
import { RenderOptimizer } from './RenderOptimizer';
import { FrameRateController } from './FrameRateController';
import { MemoryManager } from './MemoryManager';
import type { 
  RenderQuality, 
  SceneConfig, 
  CameraConfig, 
  LightConfig, 
  CameraControlMode,
  PerformanceStats,
  RenderOptimizationConfig
} from '@/types/engine';
import * as THREE from 'three';

export interface OptimizedCanvas3DProps {
  /** 渲染质量 */
  quality?: RenderQuality;
  /** 场景配置 */
  sceneConfig?: SceneConfig;
  /** 相机配置 */
  cameraConfig?: CameraConfig;
  /** 光照配置 */
  lightConfig?: LightConfig;
  /** 渲染优化配置 */
  optimizationConfig?: RenderOptimizationConfig;
  /** 相机控制模式 */
  cameraMode?: CameraControlMode;
  /** 目标帧率 */
  targetFPS?: number;
  /** 是否启用自适应帧率 */
  adaptiveFrameRate?: boolean;
  /** 是否启用自动质量调整 */
  autoQualityAdjust?: boolean;
  /** 最大内存使用量（MB） */
  maxMemoryUsage?: number;
  /** 是否显示性能监控 */
  showPerformanceMonitor?: boolean;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 是否启用环境贴图 */
  enableEnvironment?: boolean;
  /** 环境贴图预设 */
  environmentPreset?: string;
  /** 子组件 */
  children?: React.ReactNode;
  /** 画布样式 */
  className?: string;
  /** 画布样式 */
  style?: React.CSSProperties;
  /** 测试ID */
  testId?: string;
  /** 性能更新回调 */
  onPerformanceUpdate?: (stats: PerformanceStats) => void;
  /** 质量变化回调 */
  onQualityChange?: (quality: RenderQuality) => void;
  /** 帧率变化回调 */
  onFrameRateChange?: (fps: number) => void;
  /** 内存使用回调 */
  onMemoryUsage?: (usage: { total: number; textures: number; geometries: number; materials: number }) => void;
  /** 场景准备就绪回调 */
  onSceneReady?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
}

/**
 * 终极优化版3D画布组件
 */
export const OptimizedCanvas3D: React.FC<OptimizedCanvas3DProps> = ({
  quality = 'medium',
  sceneConfig,
  cameraConfig = {
    position: [10, 10, 10],
    target: [0, 0, 0],
    fov: 75,
    near: 0.1,
    far: 1000,
  },
  lightConfig,
  optimizationConfig,
  cameraMode = 'orbit',
  targetFPS = 60,
  adaptiveFrameRate = true,
  autoQualityAdjust = true,
  maxMemoryUsage = 512,
  showPerformanceMonitor = false,
  showGrid = true,
  enableEnvironment = true,
  environmentPreset = 'city',
  children,
  className = '',
  style,
  testId,
  onPerformanceUpdate,
  onQualityChange,
  onFrameRateChange,
  onMemoryUsage,
  onSceneReady,
}) => {
  const { theme } = useTheme();
  const [currentQuality, setCurrentQuality] = useState<RenderQuality>(quality);
  const [renderState, setRenderState] = useState<'active' | 'paused' | 'reduced'>('active');

  // 根据质量设置渲染参数
  const getRenderSettings = useCallback((renderQuality: RenderQuality) => {
    switch (renderQuality) {
      case 'ultra_low':
        return {
          antialias: false,
          shadows: false,
          pixelRatio: Math.min(window.devicePixelRatio, 0.5),
          toneMapping: THREE.NoToneMapping,
          powerPreference: 'default' as const,
        };
      case 'low':
        return {
          antialias: false,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 1),
          toneMapping: THREE.LinearToneMapping,
          powerPreference: 'default' as const,
        };
      case 'medium':
        return {
          antialias: true,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance' as const,
        };
      case 'high':
        return {
          antialias: true,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance' as const,
        };
      case 'ultra_high':
        return {
          antialias: true,
          shadows: true,
          pixelRatio: window.devicePixelRatio,
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance' as const,
        };
      default:
        return {
          antialias: true,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance' as const,
        };
    }
  }, []);

  const renderSettings = getRenderSettings(currentQuality);

  // 处理质量变化
  const handleQualityChange = useCallback((newQuality: RenderQuality) => {
    setCurrentQuality(newQuality);
    onQualityChange?.(newQuality);
  }, [onQualityChange]);

  // 处理渲染状态变化
  const handleRenderStateChange = useCallback((state: 'active' | 'paused' | 'reduced') => {
    setRenderState(state);
    console.log(`Render state changed to: ${state}`);
  }, []);

  // 加载中组件
  const CanvasLoader = () => (
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <Loading 
        type="cosmic" 
        text="正在初始化终极优化3D引擎..." 
        size="lg"
      />
    </div>
  );

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      style={style}
      data-testid={testId}
    >
      <Canvas
        camera={{
          position: cameraConfig.position,
          fov: cameraConfig.fov,
          near: cameraConfig.near,
          far: cameraConfig.far,
        }}
        gl={{
          antialias: renderSettings.antialias,
          alpha: true,
          powerPreference: renderSettings.powerPreference,
          toneMapping: renderSettings.toneMapping,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        shadows={renderSettings.shadows}
        dpr={renderSettings.pixelRatio}
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.primary}, ${theme.colors.background.secondary})`,
        }}
      >
        <Suspense fallback={null}>
          {/* 内存管理器 */}
          <MemoryManager
            maxMemoryUsage={maxMemoryUsage}
            enableTextureCache={true}
            enableGeometryPooling={true}
            enableAutoGC={true}
            onMemoryUsage={onMemoryUsage}
          >
            {/* 帧率控制器 */}
            <FrameRateController
              targetFPS={targetFPS}
              adaptiveFrameRate={adaptiveFrameRate}
              pauseOnHidden={true}
              reduceOnBlur={true}
              onFrameRateChange={onFrameRateChange}
              onRenderStateChange={handleRenderStateChange}
            >
              {/* 渲染优化器 */}
              <RenderOptimizer
                config={optimizationConfig}
                enableLOD={true}
                enableFrustumCulling={true}
                enableInstancing={true}
                maxRenderDistance={1000}
                performanceBudget={1000 / targetFPS}
              >
                {/* 场景管理器 */}
                <SceneManager
                  config={sceneConfig}
                  cameraConfig={cameraConfig}
                  onPerformanceUpdate={onPerformanceUpdate}
                  onSceneReady={onSceneReady}
                >
                  {/* 相机控制器 */}
                  <CameraController
                    mode={cameraMode}
                    config={cameraConfig}
                    enabled={renderState === 'active'}
                  />

                  {/* 光照系统 */}
                  <LightingSystem
                    config={lightConfig}
                    enableShadows={renderSettings.shadows}
                    shadowQuality={currentQuality === 'ultra_low' ? 'low' : 
                                 currentQuality === 'low' ? 'low' :
                                 currentQuality === 'medium' ? 'medium' :
                                 currentQuality === 'high' ? 'high' : 'ultra'}
                  />

                  {/* 环境贴图 */}
                  {enableEnvironment && (
                    <Environment preset={environmentPreset as any} />
                  )}

                  {/* 网格 */}
                  {showGrid && (
                    <Grid
                      args={[100, 100]}
                      cellSize={1}
                      cellThickness={0.5}
                      cellColor="#6f6f6f"
                      sectionSize={10}
                      sectionThickness={1}
                      sectionColor="#9d4b4b"
                      fadeDistance={100}
                      fadeStrength={1}
                      followCamera={false}
                      infiniteGrid={true}
                    />
                  )}

                  {/* 用户自定义内容 */}
                  {children}
                </SceneManager>
              </RenderOptimizer>
            </FrameRateController>
          </MemoryManager>
        </Suspense>
      </Canvas>

      {/* 性能监控器 */}
      {showPerformanceMonitor && (
        <PerformanceMonitor
          visible={true}
          onPerformanceUpdate={onPerformanceUpdate}
          autoQualityAdjust={autoQualityAdjust}
          targetFPS={targetFPS}
          onQualityChange={handleQualityChange}
          position="top-left"
        />
      )}

      {/* 渲染状态指示器 */}
      {renderState !== 'active' && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          {renderState === 'paused' ? '渲染已暂停' : '低功耗模式'}
        </div>
      )}

      {/* 加载状态覆盖层 */}
      <Suspense fallback={<CanvasLoader />}>
        <div style={{ display: 'none' }} />
      </Suspense>
    </div>
  );
};

export default OptimizedCanvas3D;
