/**
 * ResponsiveContainer 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveContainer } from '../ResponsiveContainer';

describe('ResponsiveContainer 组件', () => {
  it('应该正确渲染基础容器', () => {
    render(
      <ResponsiveContainer testId="container">
        <p>容器内容</p>
      </ResponsiveContainer>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    expect(screen.getByText('容器内容')).toBeInTheDocument();
  });

  it('应该支持不同的最大宽度', () => {
    const { rerender } = render(
      <ResponsiveContainer maxWidth="sm" testId="container">
        内容
      </ResponsiveContainer>
    );
    
    let container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-sm');

    rerender(
      <ResponsiveContainer maxWidth="lg" testId="container">
        内容
      </ResponsiveContainer>
    );
    
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-lg');
  });

  it('应该支持居中对齐', () => {
    render(
      <ResponsiveContainer centered testId="container">
        内容
      </ResponsiveContainer>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('mx-auto');
  });

  it('应该支持不同的内边距', () => {
    const { rerender } = render(
      <ResponsiveContainer padding="sm" testId="container">
        内容
      </ResponsiveContainer>
    );
    
    let container = screen.getByTestId('container');
    expect(container).toHaveClass('p-2');

    rerender(
      <ResponsiveContainer padding="lg" testId="container">
        内容
      </ResponsiveContainer>
    );
    
    container = screen.getByTestId('container');
    expect(container).toHaveClass('p-6');
  });

  it('应该支持响应式内边距', () => {
    render(
      <ResponsiveContainer 
        responsivePadding={{
          mobile: 'sm',
          tablet: 'md',
          desktop: 'lg'
        }}
        testId="container"
      >
        内容
      </ResponsiveContainer>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('p-2'); // mobile
    expect(container).toHaveClass('md:p-4'); // tablet
    expect(container).toHaveClass('lg:p-6'); // desktop
  });

  it('应该在不可见时不渲染', () => {
    render(
      <ResponsiveContainer visible={false} testId="container">
        内容
      </ResponsiveContainer>
    );
    
    expect(screen.queryByTestId('container')).not.toBeInTheDocument();
  });

  it('应该支持自定义类名和样式', () => {
    render(
      <ResponsiveContainer 
        className="custom-class" 
        style={{ backgroundColor: 'red' }}
        testId="container"
      >
        内容
      </ResponsiveContainer>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-class');
    expect(container).toHaveAttribute('style');
  });
});
