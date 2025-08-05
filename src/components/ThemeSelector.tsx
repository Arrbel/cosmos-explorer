/**
 * ThemeSelector 组件
 * 提供主题切换功能
 */

import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeName } from '@/theme';
import { Button } from './Button';

export interface ThemeSelectorProps {
  /** 显示模式 */
  mode?: 'dropdown' | 'buttons' | 'toggle';
  /** 是否显示主题名称 */
  showNames?: boolean;
  /** 是否显示预览 */
  showPreview?: boolean;
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
 * 主题选择器组件
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  mode = 'buttons',
  showNames = true,
  showPreview = true,
  visible = true,
  className,
  style,
  testId,
}) => {
  const { theme, themeName, setTheme, availableThemes } = useTheme();

  // 主题信息映射
  const themeInfo: Record<ThemeName, { label: string; icon: string; description: string }> = {
    'deep-space': {
      label: '深空',
      icon: '🌌',
      description: '深邃的宇宙深空主题',
    },
    'nebula': {
      label: '星云',
      icon: '🌠',
      description: '绚烂的星云主题',
    },
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  // 渲染按钮模式
  const renderButtons = () => (
    <div className="flex flex-wrap gap-2">
      {Object.entries(availableThemes).map(([name, themeConfig]) => {
        const info = themeInfo[name as ThemeName];
        const isActive = name === themeName;
        
        return (
          <Button
            key={name}
            variant={isActive ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTheme(name as ThemeName)}
            className={clsx(
              'flex items-center space-x-2',
              isActive && 'ring-2 ring-blue-500'
            )}
          >
            {showPreview && (
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: themeConfig.colors.primary[500] }}
              />
            )}
            {info.icon && <span>{info.icon}</span>}
            {showNames && <span>{info.label}</span>}
          </Button>
        );
      })}
    </div>
  );

  // 渲染切换模式（仅适用于两个主题）
  const renderToggle = () => {
    const themeNames = Object.keys(availableThemes) as ThemeName[];
    if (themeNames.length !== 2) {
      return renderButtons();
    }

    const currentIndex = themeNames.indexOf(themeName);
    const nextTheme = themeNames[1 - currentIndex];
    const nextInfo = themeInfo[nextTheme];

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(nextTheme)}
        className="flex items-center space-x-2"
      >
        <span>切换到</span>
        {nextInfo.icon && <span>{nextInfo.icon}</span>}
        {showNames && <span>{nextInfo.label}</span>}
      </Button>
    );
  };

  // 渲染下拉模式
  const renderDropdown = () => (
    <div className="relative">
      <select
        value={themeName}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
        className={clsx(
          'appearance-none',
          'bg-slate-800',
          'border',
          'border-slate-600',
          'text-white',
          'px-3',
          'py-2',
          'pr-8',
          'rounded-lg',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-blue-500',
          'focus:border-blue-500'
        )}
      >
        {Object.entries(availableThemes).map(([name]) => {
          const info = themeInfo[name as ThemeName];
          return (
            <option key={name} value={name}>
              {info.icon} {info.label}
            </option>
          );
        })}
      </select>
      
      {/* 下拉箭头 */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );

  // 渲染当前主题信息
  const renderCurrentThemeInfo = () => {
    const info = themeInfo[themeName];
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <span>当前主题:</span>
        <span>{info.icon}</span>
        <span>{info.label}</span>
      </div>
    );
  };

  return (
    <div
      className={clsx('space-y-2', className)}
      style={style}
      data-testid={testId}
    >
      {/* 主题选择器 */}
      {mode === 'dropdown' && renderDropdown()}
      {mode === 'buttons' && renderButtons()}
      {mode === 'toggle' && renderToggle()}
      
      {/* 当前主题信息 */}
      {showNames && mode !== 'dropdown' && renderCurrentThemeInfo()}
    </div>
  );
};

export default ThemeSelector;
