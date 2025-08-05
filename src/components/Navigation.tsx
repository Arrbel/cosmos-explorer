/**
 * Navigation 组件
 * 提供导航菜单功能
 */

import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface NavigationItem {
  /** 唯一标识 */
  id: string;
  /** 显示文本 */
  label: string;
  /** 图标 */
  icon?: React.ReactNode;
  /** 是否激活 */
  active?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子菜单 */
  children?: NavigationItem[];
  /** 点击回调 */
  onClick?: () => void;
}

export interface NavigationProps {
  /** 导航项目 */
  items: NavigationItem[];
  /** 当前激活项 */
  activeId?: string;
  /** 是否垂直布局 */
  vertical?: boolean;
  /** 是否显示图标 */
  showIcons?: boolean;
  /** 项目点击回调 */
  onItemClick?: (item: NavigationItem) => void;
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
 * 导航组件
 */
export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeId,
  vertical = true,
  showIcons = true,
  onItemClick,
  visible = true,
  className,
  style,
  testId,
}) => {
  // 处理项目点击
  const handleItemClick = (item: NavigationItem) => {
    if (!item.disabled) {
      if (item.onClick) {
        item.onClick();
      }
      if (onItemClick) {
        onItemClick(item);
      }
    }
  };

  // 渲染导航项
  const renderItem = (item: NavigationItem, level = 0) => {
    const isActive = item.active || item.id === activeId;
    
    const itemClasses = clsx(
      'flex',
      'items-center',
      'px-4',
      'py-3',
      'text-sm',
      'font-medium',
      'transition-all',
      'duration-200',
      'cursor-pointer',
      'rounded-lg',
      'mx-2',
      {
        'text-white bg-blue-600': isActive,
        'text-gray-300 hover:text-white hover:bg-slate-700': !isActive && !item.disabled,
        'text-gray-500 cursor-not-allowed': item.disabled,
        'pl-8': level > 0,
      }
    );

    return (
      <div key={item.id}>
        <motion.div
          className={itemClasses}
          onClick={() => handleItemClick(item)}
          whileHover={!item.disabled ? { scale: 1.02 } : {}}
          whileTap={!item.disabled ? { scale: 0.98 } : {}}
        >
          {/* 图标 */}
          {showIcons && item.icon && (
            <span className="mr-3 flex-shrink-0">
              {item.icon}
            </span>
          )}
          
          {/* 文本 */}
          <span className="flex-1">{item.label}</span>
          
          {/* 子菜单指示器 */}
          {item.children && item.children.length > 0 && (
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </motion.div>
        
        {/* 子菜单 */}
        {item.children && item.children.length > 0 && (
          <div className="ml-4">
            {item.children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <nav
      className={clsx(
        'py-4',
        {
          'flex flex-col space-y-1': vertical,
          'flex flex-row space-x-1': !vertical,
        },
        className
      )}
      style={style}
      data-testid={testId}
    >
      {items.map(item => renderItem(item))}
    </nav>
  );
};

export default Navigation;
