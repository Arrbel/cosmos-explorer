/**
 * Modal 组件
 * 提供模态框功能和样式
 */

import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModalProps } from '@/types/ui';

/**
 * 模态框组件
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  onClose,
  size = 'md',
  className,
  style,
  visible = true,
  testId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 尺寸样式（响应式）
  const sizeClasses = {
    sm: 'w-full max-w-sm mx-4 sm:max-w-md sm:mx-auto',
    md: 'w-full max-w-md mx-4 sm:max-w-lg sm:mx-auto',
    lg: 'w-full max-w-lg mx-4 sm:max-w-2xl sm:mx-auto',
    xl: 'w-full max-w-xl mx-4 sm:max-w-4xl sm:mx-auto',
    full: 'w-full max-w-full mx-4',
  };

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, closeOnEscape, onClose]);

  // 处理遮罩点击
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // 处理关闭按钮点击
  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          data-testid={testId}
        >
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* 模态框内容 */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'relative',
              'w-full',
              sizeClasses[size],
              'bg-white',
              'rounded-lg',
              'shadow-xl',
              'max-h-[90vh]',
              'overflow-hidden',
              'flex',
              'flex-col',
              className
            )}
            style={style}
          >
            {/* 标题栏 */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <button
                    onClick={handleCloseClick}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="关闭"
                  >
                    <svg
                      className="w-5 h-5"
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
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
