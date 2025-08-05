/**
 * Canvas3D 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Canvas3D } from '../3d/Canvas3D';
import { ThemeProvider } from '@/contexts';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="r3f-canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn(),
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stats: () => <div data-testid="stats" />,
  Grid: () => <div data-testid="grid" />,
  Environment: () => <div data-testid="environment" />,
}));

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('Canvas3D 组件', () => {
  it('应该正确渲染基础画布', () => {
    render(
      <TestWrapper>
        <Canvas3D testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('应该支持不同的渲染质量', () => {
    const { rerender } = render(
      <TestWrapper>
        <Canvas3D quality="low" testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <Canvas3D quality="high" testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();
  });

  it('应该支持显示/隐藏统计信息', () => {
    const { rerender } = render(
      <TestWrapper>
        <Canvas3D showStats={false} testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('stats')).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <Canvas3D showStats={true} testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('stats')).toBeInTheDocument();
  });

  it('应该支持显示/隐藏网格', () => {
    const { rerender } = render(
      <TestWrapper>
        <Canvas3D showGrid={false} testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('grid')).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <Canvas3D showGrid={true} testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('应该支持启用/禁用控制器', () => {
    const { rerender } = render(
      <TestWrapper>
        <Canvas3D enableControls={false} testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('orbit-controls')).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <Canvas3D enableControls={true} testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('应该支持环境贴图', () => {
    render(
      <TestWrapper>
        <Canvas3D environment="sunset" testId="canvas-3d" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('environment')).toBeInTheDocument();
  });

  it('应该支持自定义相机位置', () => {
    render(
      <TestWrapper>
        <Canvas3D 
          cameraPosition={[5, 5, 5]} 
          cameraTarget={[1, 1, 1]}
          testId="canvas-3d" 
        />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();
  });

  it('应该支持自定义类名和样式', () => {
    render(
      <TestWrapper>
        <Canvas3D 
          className="custom-canvas" 
          style={{ backgroundColor: 'red' }}
          testId="canvas-3d"
        />
      </TestWrapper>
    );
    
    const canvas = screen.getByTestId('canvas-3d');
    expect(canvas).toHaveClass('custom-canvas');
    expect(canvas).toHaveAttribute('style');
  });

  it('应该支持子组件', () => {
    render(
      <TestWrapper>
        <Canvas3D testId="canvas-3d">
          <div data-testid="child-component">子组件</div>
        </Canvas3D>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('canvas-3d')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });
});
