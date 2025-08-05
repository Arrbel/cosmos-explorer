/**
 * ResponsiveContainer 组件
 * 提供响应式容器布局
 */

import React from 'react';
import { clsx } from 'clsx';

export interface ResponsiveContainerProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 容器最大宽度 */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** 是否居中 */
  centered?: boolean;
  /** 内边距 */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** 响应式内边距 */
  responsivePadding?: {
    mobile?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    tablet?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    desktop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
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
 * 响应式容器组件
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'full',
  centered = true,
  padding = 'md',
  responsivePadding,
  visible = true,
  className,
  style,
  testId,
}) => {
  // 最大宽度样式
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  // 内边距样式
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // 响应式内边距样式
  const getResponsivePaddingClasses = () => {
    if (!responsivePadding) return '';
    
    const classes = [];
    
    if (responsivePadding.mobile) {
      const mobilePadding = {
        none: '',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      };
      classes.push(mobilePadding[responsivePadding.mobile]);
    }
    
    if (responsivePadding.tablet) {
      const tabletPadding = {
        none: '',
        sm: 'md:p-2',
        md: 'md:p-4',
        lg: 'md:p-6',
        xl: 'md:p-8',
      };
      classes.push(tabletPadding[responsivePadding.tablet]);
    }
    
    if (responsivePadding.desktop) {
      const desktopPadding = {
        none: '',
        sm: 'lg:p-2',
        md: 'lg:p-4',
        lg: 'lg:p-6',
        xl: 'lg:p-8',
      };
      classes.push(desktopPadding[responsivePadding.desktop]);
    }
    
    return classes.join(' ');
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  // 组合样式
  const containerClasses = clsx(
    'w-full',
    maxWidthClasses[maxWidth],
    {
      'mx-auto': centered,
    },
    responsivePadding ? getResponsivePaddingClasses() : paddingClasses[padding],
    className
  );

  return (
    <div
      className={containerClasses}
      style={style}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
