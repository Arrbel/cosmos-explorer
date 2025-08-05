/**
 * Button 组件
 * 提供统一的按钮样式和交互功能
 */

import React from 'react';
import { clsx } from 'clsx';
import type { ButtonProps } from '@/types/ui';

/**
 * 按钮组件
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onClick,
  className,
  style,
  visible = true,
  testId,
  ...props
}) => {
  // 基础样式
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ];

  // 变体样式
  const variantClasses = {
    primary: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'active:bg-blue-800',
    ],
    secondary: [
      'bg-gray-600',
      'text-white',
      'hover:bg-gray-700',
      'focus:ring-gray-500',
      'active:bg-gray-800',
    ],
    outline: [
      'border-2',
      'border-blue-600',
      'text-blue-600',
      'bg-transparent',
      'hover:bg-blue-50',
      'focus:ring-blue-500',
      'active:bg-blue-100',
    ],
    ghost: [
      'text-gray-700',
      'bg-transparent',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
      'active:bg-gray-200',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'active:bg-red-800',
    ],
  };

  // 尺寸样式（响应式）
  const sizeClasses = {
    sm: ['px-2', 'py-1', 'text-xs', 'sm:px-3', 'sm:py-1.5', 'sm:text-sm'],
    md: ['px-3', 'py-1.5', 'text-sm', 'sm:px-4', 'sm:py-2', 'sm:text-base'],
    lg: ['px-4', 'py-2', 'text-base', 'sm:px-6', 'sm:py-3', 'sm:text-lg'],
  };

  // 加载状态样式
  const loadingClasses = loading ? ['cursor-wait'] : [];

  // 组合所有样式
  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loadingClasses,
    className
  );

  // 处理点击事件
  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick();
    }
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <button
      className={buttonClasses}
      style={style}
      disabled={disabled || loading}
      onClick={handleClick}
      data-testid={testId}
      {...props}
    >
      {/* 加载图标 */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* 图标 */}
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}

      {/* 按钮文本 */}
      <span>{children}</span>
    </button>
  );
};

export default Button;
