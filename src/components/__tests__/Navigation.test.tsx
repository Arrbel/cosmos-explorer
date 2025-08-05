/**
 * Navigation 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation, type NavigationItem } from '../Navigation';

const mockItems: NavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    icon: <span data-testid="home-icon">🏠</span>,
  },
  {
    id: 'explore',
    label: '探索',
    icon: <span data-testid="explore-icon">🔍</span>,
    children: [
      {
        id: 'solar-system',
        label: '太阳系',
      },
      {
        id: 'deep-space',
        label: '深空',
      },
    ],
  },
  {
    id: 'settings',
    label: '设置',
    disabled: true,
  },
];

describe('Navigation 组件', () => {
  it('应该正确渲染导航项目', () => {
    render(<Navigation items={mockItems} />);
    
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('探索')).toBeInTheDocument();
    expect(screen.getByText('设置')).toBeInTheDocument();
  });

  it('应该显示图标', () => {
    render(<Navigation items={mockItems} showIcons />);
    
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByTestId('explore-icon')).toBeInTheDocument();
  });

  it('应该隐藏图标', () => {
    render(<Navigation items={mockItems} showIcons={false} />);
    
    expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('explore-icon')).not.toBeInTheDocument();
  });

  it('应该处理项目点击', () => {
    const handleItemClick = vi.fn();
    render(<Navigation items={mockItems} onItemClick={handleItemClick} />);
    
    fireEvent.click(screen.getByText('首页'));
    
    expect(handleItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'home', label: '首页' })
    );
  });

  it('应该显示激活状态', () => {
    render(<Navigation items={mockItems} activeId="home" />);
    
    const homeItem = screen.getByText('首页').closest('div');
    expect(homeItem).toHaveClass('bg-blue-600');
  });

  it('应该显示子菜单', () => {
    render(<Navigation items={mockItems} />);
    
    expect(screen.getByText('太阳系')).toBeInTheDocument();
    expect(screen.getByText('深空')).toBeInTheDocument();
  });

  it('应该处理禁用状态', () => {
    const handleItemClick = vi.fn();
    render(<Navigation items={mockItems} onItemClick={handleItemClick} />);
    
    const settingsItem = screen.getByText('设置').closest('div');
    expect(settingsItem).toHaveClass('cursor-not-allowed');
    
    fireEvent.click(screen.getByText('设置'));
    expect(handleItemClick).not.toHaveBeenCalled();
  });

  it('应该支持水平布局', () => {
    render(<Navigation items={mockItems} vertical={false} testId="nav" />);
    
    const nav = screen.getByTestId('nav');
    expect(nav).toHaveClass('flex-row');
  });

  it('应该在不可见时不渲染', () => {
    render(<Navigation items={mockItems} visible={false} testId="nav" />);
    
    expect(screen.queryByTestId('nav')).not.toBeInTheDocument();
  });

  it('应该调用项目自身的onClick', () => {
    const itemOnClick = vi.fn();
    const itemsWithClick: NavigationItem[] = [
      {
        id: 'test',
        label: '测试',
        onClick: itemOnClick,
      },
    ];
    
    render(<Navigation items={itemsWithClick} />);
    
    fireEvent.click(screen.getByText('测试'));
    expect(itemOnClick).toHaveBeenCalledTimes(1);
  });
});
