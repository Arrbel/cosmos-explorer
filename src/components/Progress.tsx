/**
 * Progress 组件
 * 提供进度条功能和样式
 */

import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface ProgressProps {
  /** 当前进度值 (0-100) */
  value: number;
  /** 最大值 */
  max?: number;
  /** 进度条大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 进度条颜色主题 */
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cosmic';
  /** 是否显示百分比文本 */
  showPercentage?: boolean;
  /** 是否显示标签 */
  label?: string;
  /** 是否动画 */
  animated?: boolean;
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
 * 进度条组件
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showPercentage = false,
  label,
  animated = true,
  visible = true,
  className,
  style,
  testId,
}) => {
  // 计算百分比
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // 尺寸样式
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  // 颜色样式
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    cosmic: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  };

  // 背景颜色样式
  const backgroundColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
    cosmic: 'bg-gray-200',
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <div
      className={clsx('w-full', className)}
      style={style}
      data-testid={testId}
    >
      {/* 标签和百分比 */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* 进度条容器 */}
      <div
        className={clsx(
          'w-full',
          'rounded-full',
          'overflow-hidden',
          sizeClasses[size],
          backgroundColorClasses[color]
        )}
      >
        {/* 进度条填充 */}
        {animated ? (
          <motion.div
            className={clsx(
              'h-full',
              'rounded-full',
              colorClasses[color],
              'relative',
              'overflow-hidden'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            {/* 宇宙主题的闪光效果 */}
            {color === 'cosmic' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
        ) : (
          <div
            className={clsx(
              'h-full',
              'rounded-full',
              colorClasses[color],
              'transition-all',
              'duration-300'
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* 详细信息 */}
      {max !== 100 && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default Progress;
