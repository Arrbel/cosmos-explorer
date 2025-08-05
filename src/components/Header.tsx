/**
 * Header 组件
 * 提供应用头部导航栏
 */

import React from 'react';
import { clsx } from 'clsx';
import { Button } from './Button';

export interface HeaderProps {
  /** 标题 */
  title?: string;
  /** 副标题 */
  subtitle?: string;
  /** 左侧内容 */
  leftContent?: React.ReactNode;
  /** 右侧内容 */
  rightContent?: React.ReactNode;
  /** 是否显示菜单按钮 */
  showMenuButton?: boolean;
  /** 菜单按钮点击回调 */
  onMenuClick?: () => void;
  /** 是否显示 */
  visible?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 测试ID */
  testId?: string;
}

/**
 * 头部组件
 */
export const Header: React.FC<HeaderProps> = ({
  title = '宇宙探索者',
  subtitle = 'Cosmos Explorer',
  leftContent,
  rightContent,
  showMenuButton = false,
  onMenuClick,
  visible = true,
  className,
  style,
  testId,
}) => {
  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <header
      className={clsx(
        'flex',
        'items-center',
        'justify-between',
        'px-6',
        'py-4',
        'bg-slate-800',
        'border-b',
        'border-slate-700',
        'shadow-lg',
        className
      )}
      style={style}
      data-testid={testId}
    >
      {/* 左侧区域 */}
      <div className="flex items-center space-x-4">
        {/* 菜单按钮 */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            }
            aria-label="打开菜单"
          />
        )}

        {/* 左侧自定义内容 */}
        {leftContent}

        {/* 标题区域 */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center space-x-4">
        {rightContent}
      </div>
    </header>
  );
};

export default Header;
