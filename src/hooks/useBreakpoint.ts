/**
 * useBreakpoint Hook
 * 检测当前屏幕断点
 */

import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

// 默认断点配置（与Tailwind CSS保持一致）
const defaultBreakpoints: BreakpointConfig = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

/**
 * 获取当前断点
 */
const getCurrentBreakpoint = (width: number, breakpoints: BreakpointConfig): Breakpoint => {
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};

/**
 * 检测当前屏幕断点的Hook
 */
export const useBreakpoint = (customBreakpoints?: Partial<BreakpointConfig>) => {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getCurrentBreakpoint(window.innerWidth, breakpoints);
  });

  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return 1024;
    return window.innerWidth;
  });

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      setBreakpoint(getCurrentBreakpoint(newWidth, breakpoints));
    };

    window.addEventListener('resize', handleResize);
    
    // 初始化时也要检查一次
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoints]);

  // 便捷的断点检查函数
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  const isWide = breakpoint === 'wide';
  
  // 范围检查函数
  const isMobileOrTablet = isMobile || isTablet;
  const isTabletOrDesktop = isTablet || isDesktop;
  const isDesktopOrWide = isDesktop || isWide;
  
  // 最小宽度检查
  const isAtLeast = (targetBreakpoint: Breakpoint): boolean => {
    const order: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide'];
    const currentIndex = order.indexOf(breakpoint);
    const targetIndex = order.indexOf(targetBreakpoint);
    return currentIndex >= targetIndex;
  };

  // 最大宽度检查
  const isAtMost = (targetBreakpoint: Breakpoint): boolean => {
    const order: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide'];
    const currentIndex = order.indexOf(breakpoint);
    const targetIndex = order.indexOf(targetBreakpoint);
    return currentIndex <= targetIndex;
  };

  return {
    // 当前状态
    breakpoint,
    width,
    
    // 具体断点检查
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    
    // 范围检查
    isMobileOrTablet,
    isTabletOrDesktop,
    isDesktopOrWide,
    
    // 条件检查函数
    isAtLeast,
    isAtMost,
    
    // 断点配置
    breakpoints,
  };
};

export default useBreakpoint;
