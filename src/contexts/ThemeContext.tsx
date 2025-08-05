/**
 * 主题Context
 * 提供主题状态管理和切换功能
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeName, themes, defaultTheme } from '@/theme';

interface ThemeContextType {
  /** 当前主题 */
  theme: Theme;
  /** 当前主题名称 */
  themeName: ThemeName;
  /** 切换主题 */
  setTheme: (themeName: ThemeName) => void;
  /** 可用主题列表 */
  availableThemes: Record<ThemeName, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  /** 初始主题 */
  initialTheme?: ThemeName;
  /** 是否启用本地存储 */
  enableLocalStorage?: boolean;
}

/**
 * 主题Provider组件
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'deep-space',
  enableLocalStorage = true,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (enableLocalStorage && typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('cosmos-theme') as ThemeName;
      return savedTheme && themes[savedTheme] ? savedTheme : initialTheme;
    }
    return initialTheme;
  });

  const theme = themes[themeName] || defaultTheme;

  // 切换主题
  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    
    if (enableLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem('cosmos-theme', newThemeName);
    }
  };

  // 应用CSS变量到根元素
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // 设置颜色变量
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    Object.entries(theme.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--color-background-${key}`, value);
    });
    
    Object.entries(theme.colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--color-text-${key}`, value);
    });
    
    Object.entries(theme.colors.border).forEach(([key, value]) => {
      root.style.setProperty(`--color-border-${key}`, value);
    });
    
    Object.entries(theme.colors.status).forEach(([key, value]) => {
      root.style.setProperty(`--color-status-${key}`, value);
    });
    
    // 设置阴影变量
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // 设置圆角变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // 设置间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // 设置主题名称
    root.setAttribute('data-theme', themeName);
  }, [theme, themeName]);

  const value: ThemeContextType = {
    theme,
    themeName,
    setTheme,
    availableThemes: themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题的Hook
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
