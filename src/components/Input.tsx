/**
 * Input 组件
 * 提供统一的输入框样式和功能
 */

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import type { InputProps } from '@/types/ui';

/**
 * 输入框组件
 */
export const Input: React.FC<InputProps> = ({
  value = '',
  placeholder = '',
  type = 'text',
  required = false,
  disabled = false,
  minLength,
  maxLength,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  className,
  style,
  visible = true,
  testId,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 同步外部value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // 基础样式
  const baseClasses = [
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'disabled:bg-gray-100',
  ];

  // 状态样式
  const stateClasses = {
    default: [
      'border-gray-300',
      'bg-white',
      'text-gray-900',
      'placeholder-gray-500',
      'focus:border-blue-500',
      'focus:ring-blue-500',
    ],
    focused: [
      'border-blue-500',
      'ring-2',
      'ring-blue-500',
      'ring-offset-1',
    ],
    error: [
      'border-red-500',
      'focus:border-red-500',
      'focus:ring-red-500',
    ],
  };

  // 组合样式
  const inputClasses = clsx(
    baseClasses,
    isFocused ? stateClasses.focused : stateClasses.default,
    className
  );

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  // 处理获得焦点
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    if (onFocus) {
      onFocus();
    }
  };

  // 处理失去焦点
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    if (onBlur) {
      onBlur();
    }
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={internalValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        className={inputClasses}
        style={style}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-testid={testId}
        {...props}
      />
      
      {/* 字符计数 */}
      {maxLength && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          {internalValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default Input;
