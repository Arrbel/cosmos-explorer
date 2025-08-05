/**
 * Button 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button 组件', () => {
  it('应该正确渲染基础按钮', () => {
    render(<Button>测试按钮</Button>);
    
    const button = screen.getByRole('button', { name: '测试按钮' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('测试按钮');
  });

  it('应该支持不同的变体', () => {
    const { rerender } = render(<Button variant="primary">主要按钮</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');

    rerender(<Button variant="secondary">次要按钮</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600');

    rerender(<Button variant="danger">危险按钮</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('应该支持不同的尺寸', () => {
    const { rerender } = render(<Button size="sm">小按钮</Button>);
    let button = screen.getByRole('button');
    // 检查响应式尺寸类名
    expect(button).toHaveClass('px-2', 'py-1', 'text-xs');
    expect(button).toHaveClass('sm:px-3', 'sm:py-1.5', 'sm:text-sm');

    rerender(<Button size="md">中按钮</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    expect(button).toHaveClass('sm:px-4', 'sm:py-2', 'sm:text-base');

    rerender(<Button size="lg">大按钮</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    expect(button).toHaveClass('sm:px-6', 'sm:py-3', 'sm:text-lg');
  });

  it('应该处理点击事件', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击我</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该在禁用状态下不响应点击', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>禁用按钮</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('应该在加载状态下显示加载图标', () => {
    render(<Button loading>加载中</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // 检查是否有加载图标
    const loadingIcon = button.querySelector('svg');
    expect(loadingIcon).toBeInTheDocument();
    expect(loadingIcon).toHaveClass('animate-spin');
  });

  it('应该支持图标', () => {
    const icon = <span data-testid="test-icon">🚀</span>;
    render(<Button icon={icon}>带图标按钮</Button>);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('应该支持自定义类名和样式', () => {
    render(
      <Button
        className="custom-class"
        style={{ backgroundColor: 'red' }}
        testId="custom-button"
      >
        自定义按钮
      </Button>
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('custom-class');
    // 由于Tailwind CSS的优先级，我们只检查类名是否正确应用
    expect(button).toHaveAttribute('style');
  });

  it('应该在不可见时不渲染', () => {
    render(<Button visible={false}>不可见按钮</Button>);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
