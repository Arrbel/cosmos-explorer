/**
 * Loading 组件
 * 提供加载状态的视觉反馈
 */

import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface LoadingProps {
  /** 加载文本 */
  text?: string;
  /** 加载器大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 加载器类型 */
  type?: 'spinner' | 'dots' | 'pulse' | 'cosmic';
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
 * 旋转加载器
 */
const SpinnerLoader: React.FC<{ size: string }> = ({ size }) => (
  <svg
    className={clsx('animate-spin', size)}
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
);

/**
 * 点状加载器
 */
const DotsLoader: React.FC<{ size: string }> = ({ size }) => {
  const dotSize = size === 'w-4 h-4' ? 'w-2 h-2' : size === 'w-6 h-6' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={clsx('bg-current rounded-full', dotSize)}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

/**
 * 脉冲加载器
 */
const PulseLoader: React.FC<{ size: string }> = ({ size }) => (
  <motion.div
    className={clsx('bg-current rounded-full', size)}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
    }}
  />
);

/**
 * 宇宙主题加载器
 */
const CosmicLoader: React.FC<{ size: string }> = ({ size }) => (
  <div className={clsx('relative', size)}>
    {/* 中心星球 */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
    
    {/* 轨道环 */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 border border-current rounded-full opacity-30"
        style={{
          transform: `scale(${1.2 + i * 0.3})`,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3 + i,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    ))}
  </div>
);

/**
 * 加载组件
 */
export const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  size = 'md',
  type = 'spinner',
  visible = true,
  className,
  style,
  testId,
}) => {
  // 尺寸映射
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  // 渲染加载器
  const renderLoader = () => {
    const sizeClass = sizeClasses[size];
    
    switch (type) {
      case 'dots':
        return <DotsLoader size={sizeClass} />;
      case 'pulse':
        return <PulseLoader size={sizeClass} />;
      case 'cosmic':
        return <CosmicLoader size={sizeClass} />;
      default:
        return <SpinnerLoader size={sizeClass} />;
    }
  };

  return (
    <div
      className={clsx(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'space-y-2',
        'text-gray-600',
        className
      )}
      style={style}
      data-testid={testId}
    >
      {/* 加载器 */}
      <div className="flex items-center justify-center">
        {renderLoader()}
      </div>
      
      {/* 加载文本 */}
      {text && (
        <p className={clsx('text-center', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
