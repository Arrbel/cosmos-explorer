/**
 * BasicSphere 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicSphere } from '../3d/BasicSphere';
import { ThemeProvider } from '@/contexts';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  Sphere: ({ children, onClick, onPointerOver, onPointerOut, ...props }: any) => (
    <div 
      data-testid="sphere"
      onClick={onClick}
      onMouseOver={onPointerOver}
      onMouseOut={onPointerOut}
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({ children, ...props }: any) => (
    <div data-testid="text" {...props}>
      {children}
    </div>
  ),
}));

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('BasicSphere 组件', () => {
  it('应该正确渲染基础球体', () => {
    render(
      <TestWrapper>
        <BasicSphere />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('sphere')).toBeInTheDocument();
  });

  it('应该支持自定义位置和半径', () => {
    render(
      <TestWrapper>
        <BasicSphere 
          position={[1, 2, 3]} 
          radius={2}
        />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('sphere')).toBeInTheDocument();
  });

  it('应该支持自定义颜色', () => {
    render(
      <TestWrapper>
        <BasicSphere color="#ff0000" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('sphere')).toBeInTheDocument();
  });

  it('应该支持显示标签', () => {
    render(
      <TestWrapper>
        <BasicSphere label="测试球体" />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('sphere')).toBeInTheDocument();
    expect(screen.getByTestId('text')).toBeInTheDocument();
    expect(screen.getByText('测试球体')).toBeInTheDocument();
  });

  it('应该支持点击事件', () => {
    const handleClick = vi.fn();
    
    render(
      <TestWrapper>
        <BasicSphere onClick={handleClick} />
      </TestWrapper>
    );
    
    const sphere = screen.getByTestId('sphere');
    fireEvent.click(sphere);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该支持悬停事件', () => {
    const handleHover = vi.fn();
    
    render(
      <TestWrapper>
        <BasicSphere onHover={handleHover} />
      </TestWrapper>
    );
    
    const sphere = screen.getByTestId('sphere');
    
    fireEvent.mouseOver(sphere);
    expect(handleHover).toHaveBeenCalledWith(true);
    
    fireEvent.mouseOut(sphere);
    expect(handleHover).toHaveBeenCalledWith(false);
  });

  it('应该支持禁用交互', () => {
    const handleClick = vi.fn();
    const handleHover = vi.fn();
    
    render(
      <TestWrapper>
        <BasicSphere 
          interactive={false}
          onClick={handleClick}
          onHover={handleHover}
        />
      </TestWrapper>
    );
    
    const sphere = screen.getByTestId('sphere');
    
    fireEvent.click(sphere);
    fireEvent.mouseOver(sphere);
    
    expect(handleClick).not.toHaveBeenCalled();
    expect(handleHover).not.toHaveBeenCalled();
  });

  it('应该支持自动旋转设置', () => {
    const { rerender } = render(
      <TestWrapper>
        <BasicSphere autoRotate={true} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('sphere')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <BasicSphere autoRotate={false} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('sphere')).toBeInTheDocument();
  });

  it('应该支持自定义旋转速度', () => {
    render(
      <TestWrapper>
        <BasicSphere 
          autoRotate={true}
          rotationSpeed={0.05}
        />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('sphere')).toBeInTheDocument();
  });
});
