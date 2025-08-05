/**
 * EnhancedCanvas3D 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnhancedCanvas3D } from '../3d/EnhancedCanvas3D';
import { ThemeProvider } from '@/contexts';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="r3f-canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn(),
  useThree: () => ({
    scene: {},
    camera: {},
    gl: { info: { render: { calls: 0, triangles: 0 } } },
  }),
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  Environment: () => <div data-testid="environment" />,
  Grid: () => <div data-testid="grid" />,
}));

// Mock 3D components
vi.mock('../3d/SceneManager', () => ({
  SceneManager: ({ children }: any) => <div data-testid="scene-manager">{children}</div>,
}));

vi.mock('../3d/CameraController', () => ({
  CameraController: () => <div data-testid="camera-controller" />,
}));

vi.mock('../3d/LightingSystem', () => ({
  LightingSystem: () => <div data-testid="lighting-system" />,
}));

vi.mock('../3d/PerformanceMonitor', () => ({
  PerformanceMonitor: () => <div data-testid="performance-monitor" />,
}));

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('EnhancedCanvas3D 组件', () => {
  it('应该正确渲染增强版画布', () => {
    render(
      <TestWrapper>
        <EnhancedCanvas3D testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('scene-manager')).toBeInTheDocument();
    expect(screen.getByTestId('camera-controller')).toBeInTheDocument();
    expect(screen.getByTestId('lighting-system')).toBeInTheDocument();
  });

  it('应该支持不同的渲染质量', () => {
    const { rerender } = render(
      <TestWrapper>
        <EnhancedCanvas3D quality="low" testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EnhancedCanvas3D quality="ultra_high" testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();
  });

  it('应该支持显示/隐藏性能监控', () => {
    const { rerender } = render(
      <TestWrapper>
        <EnhancedCanvas3D showPerformanceMonitor={false} testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EnhancedCanvas3D showPerformanceMonitor={true} testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument();
  });

  it('应该支持显示/隐藏网格', () => {
    const { rerender } = render(
      <TestWrapper>
        <EnhancedCanvas3D showGrid={false} testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('grid')).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EnhancedCanvas3D showGrid={true} testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('应该支持启用/禁用环境贴图', () => {
    const { rerender } = render(
      <TestWrapper>
        <EnhancedCanvas3D enableEnvironment={false} testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('environment')).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EnhancedCanvas3D enableEnvironment={true} testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('environment')).toBeInTheDocument();
  });

  it('应该支持不同的相机控制模式', () => {
    const { rerender } = render(
      <TestWrapper>
        <EnhancedCanvas3D cameraMode="orbit" testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EnhancedCanvas3D cameraMode="fly" testId="enhanced-canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();
  });

  it('应该支持自动质量调整', () => {
    render(
      <TestWrapper>
        <EnhancedCanvas3D 
          autoQualityAdjust={true}
          targetFPS={60}
          testId="enhanced-canvas-3d" 
        />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();
  });

  it('应该支持回调函数', () => {
    const onPerformanceUpdate = vi.fn();
    const onQualityChange = vi.fn();
    const onSceneReady = vi.fn();
    
    render(
      <TestWrapper>
        <EnhancedCanvas3D 
          onPerformanceUpdate={onPerformanceUpdate}
          onQualityChange={onQualityChange}
          onSceneReady={onSceneReady}
          testId="enhanced-canvas-3d"
        />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();
  });

  it('应该支持自定义配置', () => {
    const sceneConfig = {
      background: '#ff0000',
      fog: { enabled: true, color: '#ff0000', near: 10, far: 100 },
      shadows: { enabled: true, type: 'PCFSoft' as const },
      environment: { enabled: true, preset: 'sunset' },
    };

    const cameraConfig = {
      position: [5, 5, 5] as [number, number, number],
      target: [1, 1, 1] as [number, number, number],
      fov: 60,
      near: 0.5,
      far: 500,
    };

    render(
      <TestWrapper>
        <EnhancedCanvas3D 
          sceneConfig={sceneConfig}
          cameraConfig={cameraConfig}
          testId="enhanced-canvas-3d"
        />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();
  });

  it('应该支持子组件', () => {
    render(
      <TestWrapper>
        <EnhancedCanvas3D testId="enhanced-canvas-3d">
          <div data-testid="child-component">子组件</div>
        </EnhancedCanvas3D>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('enhanced-canvas-3d')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });
});
