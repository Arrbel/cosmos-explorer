/**
 * Panel 组件
 * 提供可折叠、可关闭的面板容器
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanelProps } from '@/types/ui';

/**
 * 面板组件
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  closable = false,
  onClose,
  size = 'md',
  className,
  style,
  visible = true,
  testId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // 尺寸样式
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  // 处理折叠切换
  const handleToggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // 处理关闭
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <div
      className={clsx(
        'bg-slate-800',
        'border',
        'border-slate-700',
        'rounded-lg',
        'shadow-lg',
        'overflow-hidden',
        sizeClasses[size],
        className
      )}
      style={style}
      data-testid={testId}
    >
      {/* 标题栏 */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-700 border-b border-slate-600">
          <div className="flex items-center space-x-2">
            {/* 折叠按钮 */}
            {collapsible && (
              <button
                onClick={handleToggleCollapse}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                aria-label={isCollapsed ? '展开' : '折叠'}
              >
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </button>
            )}
            
            {/* 标题文本 */}
            <h3 className="text-sm font-medium text-white">{title}</h3>
          </div>

          {/* 关闭按钮 */}
          {closable && (
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="关闭"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 内容区域 */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 text-gray-300">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Panel;
