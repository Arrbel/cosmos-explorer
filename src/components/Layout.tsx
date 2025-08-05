/**
 * Layout 组件
 * 提供应用的主要布局结构
 */

import React from 'react';
import { clsx } from 'clsx';

export interface LayoutProps {
  /** 主要内容 */
  children: React.ReactNode;
  /** 头部内容 */
  header?: React.ReactNode;
  /** 侧边栏内容 */
  sidebar?: React.ReactNode;
  /** 底部内容 */
  footer?: React.ReactNode;
  /** 是否显示侧边栏 */
  showSidebar?: boolean;
  /** 侧边栏位置 */
  sidebarPosition?: 'left' | 'right';
  /** 侧边栏宽度 */
  sidebarWidth?: number;
  /** 是否全屏布局 */
  fullscreen?: boolean;
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
 * 布局组件
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  showSidebar = false,
  sidebarPosition = 'left',
  sidebarWidth = 280,
  fullscreen = false,
  visible = true,
  className,
  style,
  testId,
}) => {
  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  // 主容器样式
  const containerClasses = clsx(
    'flex',
    'h-screen',
    'overflow-hidden',
    {
      'fixed inset-0': fullscreen,
    },
    className
  );

  // 主内容区域样式
  const mainClasses = clsx(
    'flex',
    'flex-col',
    'flex-1',
    'overflow-hidden',
    {
      'order-1': sidebarPosition === 'left',
      'order-2': sidebarPosition === 'right',
    }
  );

  // 侧边栏样式
  const sidebarClasses = clsx(
    'flex-shrink-0',
    'bg-slate-900',
    'border-slate-700',
    {
      'border-r order-1': sidebarPosition === 'left',
      'border-l order-2': sidebarPosition === 'right',
    }
  );

  return (
    <div
      className={containerClasses}
      style={style}
      data-testid={testId}
    >
      {/* 侧边栏 */}
      {showSidebar && sidebar && (
        <div
          className={sidebarClasses}
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </div>
      )}

      {/* 主内容区域 */}
      <div className={mainClasses}>
        {/* 头部 */}
        {header && (
          <header className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
            {header}
          </header>
        )}

        {/* 主要内容 */}
        <main className="flex-1 overflow-auto bg-slate-900">
          {children}
        </main>

        {/* 底部 */}
        {footer && (
          <footer className="flex-shrink-0 bg-slate-800 border-t border-slate-700">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;
