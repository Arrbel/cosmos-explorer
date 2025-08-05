/**
 * Canvas3D 组件
 * 基础的3D画布组件，使用React Three Fiber
 */

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Grid, Environment } from '@react-three/drei';
import { Loading } from '@/components';
import { useTheme } from '@/contexts';
import type { RenderQuality } from '@/types/engine';

export interface Canvas3DProps {
  /** 渲染质量 */
  quality?: RenderQuality;
  /** 是否显示统计信息 */
  showStats?: boolean;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 是否启用轨道控制 */
  enableControls?: boolean;
  /** 环境贴图 */
  environment?: string | null;
  /** 相机初始位置 */
  cameraPosition?: [number, number, number];
  /** 相机目标位置 */
  cameraTarget?: [number, number, number];
  /** 子组件 */
  children?: React.ReactNode;
  /** 画布样式 */
  className?: string;
  /** 画布样式 */
  style?: React.CSSProperties;
  /** 测试ID */
  testId?: string;
}

/**
 * 3D场景内容组件
 */
const SceneContent: React.FC<{
  showGrid: boolean;
  showStats: boolean;
  enableControls: boolean;
  environment: string | null;
  cameraTarget: [number, number, number];
  children?: React.ReactNode;
}> = ({ showGrid, showStats, enableControls, environment, cameraTarget, children }) => {
  return (
    <>
      {/* 轨道控制器 */}
      {enableControls && (
        <OrbitControls
          target={cameraTarget}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={1.0}
          panSpeed={1.0}
          rotateSpeed={1.0}
          minDistance={0.1}
          maxDistance={1000}
        />
      )}

      {/* 性能统计 */}
      {showStats && <Stats />}

      {/* 环境光照 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* 环境贴图 */}
      {environment && <Environment preset={environment as any} />}

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
    </>
  );
};

/**
 * 加载中组件
 */
const CanvasLoader: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <Loading 
        type="cosmic" 
        text="正在初始化3D引擎..." 
        size="lg"
      />
    </div>
  );
};

/**
 * 3D画布组件
 */
export const Canvas3D: React.FC<Canvas3DProps> = ({
  quality = 'medium',
  showStats = false,
  showGrid = true,
  enableControls = true,
  environment = 'city',
  cameraPosition = [10, 10, 10],
  cameraTarget = [0, 0, 0],
  children,
  className = '',
  style,
  testId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  // 根据质量设置渲染参数
  const getRenderSettings = () => {
    switch (quality) {
      case 'ultra_low':
        return {
          antialias: false,
          shadows: false,
          pixelRatio: Math.min(window.devicePixelRatio, 1),
        };
      case 'low':
        return {
          antialias: false,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        };
      case 'medium':
        return {
          antialias: true,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        };
      case 'high':
        return {
          antialias: true,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        };
      case 'ultra_high':
        return {
          antialias: true,
          shadows: true,
          pixelRatio: window.devicePixelRatio,
        };
      default:
        return {
          antialias: true,
          shadows: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        };
    }
  };

  const renderSettings = getRenderSettings();

  // 处理画布大小变化
  useEffect(() => {
    const handleResize = () => {
      // Canvas会自动处理大小变化
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      style={style}
      data-testid={testId}
    >
      <Canvas
        ref={canvasRef}
        camera={{
          position: cameraPosition,
          fov: 75,
          near: 0.1,
          far: 10000,
        }}
        gl={{
          antialias: renderSettings.antialias,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        shadows={renderSettings.shadows}
        dpr={renderSettings.pixelRatio}
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.primary}, ${theme.colors.background.secondary})`,
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            showGrid={showGrid}
            showStats={showStats}
            enableControls={enableControls}
            environment={environment}
            cameraTarget={cameraTarget}
          >
            {children}
          </SceneContent>
        </Suspense>
      </Canvas>

      {/* 加载状态覆盖层 */}
      <Suspense fallback={<CanvasLoader />}>
        <div style={{ display: 'none' }} />
      </Suspense>
    </div>
  );
};

export default Canvas3D;
