/**
 * ResponsiveShow 组件
 * 根据屏幕尺寸条件性显示内容
 */

import React from 'react';
import { useBreakpoint, type Breakpoint } from '@/hooks/useBreakpoint';

export interface ResponsiveShowProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 显示条件 - 仅在指定断点显示 */
  only?: Breakpoint | Breakpoint[];
  /** 显示条件 - 在指定断点及以上显示 */
  above?: Breakpoint;
  /** 显示条件 - 在指定断点及以下显示 */
  below?: Breakpoint;
  /** 隐藏条件 - 在指定断点隐藏 */
  hide?: Breakpoint | Breakpoint[];
  /** 自定义显示条件函数 */
  when?: (breakpoint: Breakpoint, width: number) => boolean;
  /** 测试ID */
  testId?: string;
}

/**
 * 响应式显示组件
 */
export const ResponsiveShow: React.FC<ResponsiveShowProps> = ({
  children,
  only,
  above,
  below,
  hide,
  when,
  testId,
}) => {
  const { breakpoint, width, isAtLeast, isAtMost } = useBreakpoint();

  // 检查是否应该显示
  const shouldShow = (): boolean => {
    // 自定义条件优先
    if (when) {
      return when(breakpoint, width);
    }

    // 检查隐藏条件
    if (hide) {
      const hideBreakpoints = Array.isArray(hide) ? hide : [hide];
      if (hideBreakpoints.includes(breakpoint)) {
        return false;
      }
    }

    // 检查仅显示条件
    if (only) {
      const onlyBreakpoints = Array.isArray(only) ? only : [only];
      return onlyBreakpoints.includes(breakpoint);
    }

    // 检查最小断点条件
    if (above && !isAtLeast(above)) {
      return false;
    }

    // 检查最大断点条件
    if (below && !isAtMost(below)) {
      return false;
    }

    // 默认显示
    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <div data-testid={testId}>
      {children}
    </div>
  );
};

export default ResponsiveShow;
