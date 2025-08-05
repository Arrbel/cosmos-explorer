/**
 * ResponsiveGrid 组件
 * 提供响应式网格布局
 */

import React from 'react';
import { clsx } from 'clsx';

export interface ResponsiveGridProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 列数配置 */
  columns?: {
    mobile?: 1 | 2 | 3 | 4 | 6 | 12;
    tablet?: 1 | 2 | 3 | 4 | 6 | 12;
    desktop?: 1 | 2 | 3 | 4 | 6 | 12;
  };
  /** 间距 */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** 响应式间距 */
  responsiveGap?: {
    mobile?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    tablet?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    desktop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  /** 是否自动填充 */
  autoFit?: boolean;
  /** 最小列宽（当autoFit为true时） */
  minColumnWidth?: string;
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
 * 响应式网格组件
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  responsiveGap,
  autoFit = false,
  minColumnWidth = '250px',
  visible = true,
  className,
  style,
  testId,
}) => {
  // 列数样式映射
  const getColumnClasses = () => {
    if (autoFit) return '';
    
    const classes = [];
    
    if (columns.mobile) {
      const mobileColumns = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        6: 'grid-cols-6',
        12: 'grid-cols-12',
      };
      classes.push(mobileColumns[columns.mobile]);
    }
    
    if (columns.tablet) {
      const tabletColumns = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
        6: 'md:grid-cols-6',
        12: 'md:grid-cols-12',
      };
      classes.push(tabletColumns[columns.tablet]);
    }
    
    if (columns.desktop) {
      const desktopColumns = {
        1: 'lg:grid-cols-1',
        2: 'lg:grid-cols-2',
        3: 'lg:grid-cols-3',
        4: 'lg:grid-cols-4',
        6: 'lg:grid-cols-6',
        12: 'lg:grid-cols-12',
      };
      classes.push(desktopColumns[columns.desktop]);
    }
    
    return classes.join(' ');
  };

  // 间距样式
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  // 响应式间距样式
  const getResponsiveGapClasses = () => {
    if (!responsiveGap) return '';
    
    const classes = [];
    
    if (responsiveGap.mobile) {
      const mobileGap = {
        none: 'gap-0',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
      };
      classes.push(mobileGap[responsiveGap.mobile]);
    }
    
    if (responsiveGap.tablet) {
      const tabletGap = {
        none: 'md:gap-0',
        sm: 'md:gap-2',
        md: 'md:gap-4',
        lg: 'md:gap-6',
        xl: 'md:gap-8',
      };
      classes.push(tabletGap[responsiveGap.tablet]);
    }
    
    if (responsiveGap.desktop) {
      const desktopGap = {
        none: 'lg:gap-0',
        sm: 'lg:gap-2',
        md: 'lg:gap-4',
        lg: 'lg:gap-6',
        xl: 'lg:gap-8',
      };
      classes.push(desktopGap[responsiveGap.desktop]);
    }
    
    return classes.join(' ');
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  // 组合样式
  const gridClasses = clsx(
    'grid',
    autoFit ? '' : getColumnClasses(),
    responsiveGap ? getResponsiveGapClasses() : gapClasses[gap],
    className
  );

  // 自动填充样式
  const gridStyle = autoFit
    ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`,
        ...style,
      }
    : style;

  return (
    <div
      className={gridClasses}
      style={gridStyle}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
