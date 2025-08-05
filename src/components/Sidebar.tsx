/**
 * Sidebar 组件
 * 提供可折叠的侧边栏布局
 */

import React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export interface SidebarProps {
  /** 侧边栏内容 */
  children: React.ReactNode;
  /** 是否展开 */
  expanded?: boolean;
  /** 侧边栏位置 */
  position?: 'left' | 'right';
  /** 侧边栏宽度 */
  width?: number;
  /** 是否显示遮罩 */
  showOverlay?: boolean;
  /** 是否可以通过遮罩关闭 */
  closeOnOverlayClick?: boolean;
  /** 展开/收起回调 */
  onToggle?: (expanded: boolean) => void;
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
 * 侧边栏组件
 */
export const Sidebar: React.FC<SidebarProps> = ({
  children,
  expanded = true,
  position = 'left',
  width = 280,
  showOverlay = false,
  closeOnOverlayClick = true,
  onToggle,
  visible = true,
  className,
  style,
  testId,
}) => {
  // 处理遮罩点击
  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onToggle) {
      onToggle(false);
    }
  };

  // 处理切换
  const handleToggle = () => {
    if (onToggle) {
      onToggle(!expanded);
    }
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  // 侧边栏样式
  const sidebarClasses = clsx(
    'fixed',
    'top-0',
    'h-full',
    'bg-slate-900',
    'border-slate-700',
    'shadow-xl',
    'z-40',
    'flex',
    'flex-col',
    {
      'left-0 border-r': position === 'left',
      'right-0 border-l': position === 'right',
    },
    className
  );

  // 动画变体
  const sidebarVariants = {
    expanded: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    collapsed: {
      x: position === 'left' ? -width : width,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <AnimatePresence>
        {showOverlay && expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={handleOverlayClick}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 */}
      <motion.div
        className={sidebarClasses}
        style={{ width, ...style }}
        variants={sidebarVariants}
        animate={expanded ? 'expanded' : 'collapsed'}
        data-testid={testId}
      >
        {/* 切换按钮 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">导航</h2>
          <button
            onClick={handleToggle}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            aria-label={expanded ? '收起侧边栏' : '展开侧边栏'}
          >
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ 
                rotate: position === 'left' 
                  ? (expanded ? 0 : 180) 
                  : (expanded ? 180 : 0) 
              }}
              transition={{ duration: 0.2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </motion.svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
