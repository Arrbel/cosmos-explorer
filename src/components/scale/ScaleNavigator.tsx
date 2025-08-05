/**
 * ScaleNavigator 组件
 * 尺度导航控制器，提供尺度切换的用户界面
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components';
import { useTheme } from '@/contexts';
import { useScaleContext } from './ScaleContext';
import { ScaleLevel } from '@/types/scale';
import { SCALE_DEFINITIONS, SCALE_LEVELS_ORDERED, getScaleIndex } from '@/constants/scales';

export interface ScaleNavigatorProps {
  /** 是否显示 */
  visible?: boolean;
  /** 位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  /** 显示模式 */
  mode?: 'compact' | 'full' | 'slider';
  /** 是否显示尺度信息 */
  showScaleInfo?: boolean;
  /** 是否显示快捷按钮 */
  showQuickButtons?: boolean;
  /** 是否显示历史记录 */
  showHistory?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 测试ID */
  testId?: string;
}

/**
 * 尺度导航器组件
 */
export const ScaleNavigator: React.FC<ScaleNavigatorProps> = ({
  visible = true,
  position = 'bottom-right',
  mode = 'compact',
  showScaleInfo = true,
  showQuickButtons = true,
  showHistory = false,
  className,
  style,
  testId,
}) => {
  const { theme } = useTheme();
  const scaleContext = useScaleContext();
  const { state } = scaleContext;
  const [isExpanded, setIsExpanded] = useState(false);

  // 获取位置样式
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 1000,
      padding: '16px',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyle, top: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '20px', right: '20px' };
      case 'center':
        return { 
          ...baseStyle, 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
      default:
        return { ...baseStyle, bottom: '20px', right: '20px' };
    }
  };

  // 获取当前尺度信息
  const currentScaleInfo = scaleContext.getScaleInfo();
  const currentIndex = getScaleIndex(state.currentScale);

  // 渲染紧凑模式
  const renderCompactMode = () => (
    <div className="bg-black bg-opacity-80 rounded-lg p-4 min-w-64">
      {/* 当前尺度信息 */}
      {showScaleInfo && (
        <div className="mb-4">
          <div className="text-white font-medium text-sm">
            {currentScaleInfo.nameCN} ({currentScaleInfo.name})
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {currentScaleInfo.descriptionCN}
          </div>
          <div className="text-gray-500 text-xs mt-1">
            尺度: 10^{currentScaleInfo.magnitude}m
          </div>
        </div>
      )}

      {/* 导航按钮 */}
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={scaleContext.scaleDown}
          disabled={currentIndex === 0 || state.isTransitioning}
          className="flex-1"
        >
          ↓ 缩小
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={scaleContext.scaleUp}
          disabled={currentIndex === SCALE_LEVELS_ORDERED.length - 1 || state.isTransitioning}
          className="flex-1"
        >
          ↑ 放大
        </Button>
      </div>

      {/* 过渡进度 */}
      {state.isTransitioning && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-1">
            切换中... {Math.round(state.transitionProgress * 100)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${state.transitionProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 快捷按钮 */}
      {showQuickButtons && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">快速跳转</div>
          <div className="grid grid-cols-3 gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scaleContext.transitionToScale(ScaleLevel.ATOMIC)}
              disabled={state.isTransitioning}
              className="text-xs"
            >
              原子
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scaleContext.transitionToScale(ScaleLevel.HUMAN_SCALE)}
              disabled={state.isTransitioning}
              className="text-xs"
            >
              人体
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scaleContext.transitionToScale(ScaleLevel.PLANET)}
              disabled={state.isTransitioning}
              className="text-xs"
            >
              行星
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scaleContext.transitionToScale(ScaleLevel.SOLAR_SYSTEM)}
              disabled={state.isTransitioning}
              className="text-xs"
            >
              太阳系
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scaleContext.transitionToScale(ScaleLevel.GALACTIC)}
              disabled={state.isTransitioning}
              className="text-xs"
            >
              银河系
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => scaleContext.transitionToScale(ScaleLevel.UNIVERSE)}
              disabled={state.isTransitioning}
              className="text-xs"
            >
              宇宙
            </Button>
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {showHistory && state.scaleHistory.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400">历史记录</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={scaleContext.goBack}
              disabled={state.isTransitioning}
              className="text-xs"
            >
              返回
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            {state.scaleHistory.slice(-3).map((scale, index) => (
              <span key={index}>
                {SCALE_DEFINITIONS[scale].nameCN}
                {index < 2 ? ' → ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染滑块模式
  const renderSliderMode = () => (
    <div className="bg-black bg-opacity-80 rounded-lg p-4 w-80">
      {/* 当前尺度信息 */}
      {showScaleInfo && (
        <div className="mb-4 text-center">
          <div className="text-white font-medium">
            {currentScaleInfo.nameCN}
          </div>
          <div className="text-gray-400 text-sm">
            10^{currentScaleInfo.magnitude}m
          </div>
        </div>
      )}

      {/* 尺度滑块 */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={SCALE_LEVELS_ORDERED.length - 1}
          value={currentIndex}
          onChange={(e) => {
            const newIndex = parseInt(e.target.value);
            const newScale = SCALE_LEVELS_ORDERED[newIndex];
            if (newScale) {
              scaleContext.transitionToScale(newScale);
            }
          }}
          disabled={state.isTransitioning}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        
        {/* 刻度标签 */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>原子</span>
          <span>人体</span>
          <span>行星</span>
          <span>太阳系</span>
          <span>银河系</span>
          <span>宇宙</span>
        </div>
      </div>

      {/* 过渡进度 */}
      {state.isTransitioning && (
        <div className="text-center">
          <div className="text-sm text-gray-400">
            正在切换到 {state.targetScale ? SCALE_DEFINITIONS[state.targetScale].nameCN : ''}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-100"
              style={{ width: `${state.transitionProgress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  // 渲染完整模式
  const renderFullMode = () => (
    <div className="bg-black bg-opacity-90 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
      {/* 标题 */}
      <div className="text-white font-medium text-lg mb-4 text-center">
        尺度导航器
      </div>

      {/* 当前尺度 */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="text-white font-medium">
          {currentScaleInfo.nameCN} ({currentScaleInfo.name})
        </div>
        <div className="text-gray-400 text-sm mt-1">
          {currentScaleInfo.descriptionCN}
        </div>
        <div className="text-gray-500 text-xs mt-1">
          典型尺寸: 10^{currentScaleInfo.magnitude}m
        </div>
        <div className="text-gray-500 text-xs">
          示例: {currentScaleInfo.examplesCN.join(', ')}
        </div>
      </div>

      {/* 尺度列表 */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {SCALE_LEVELS_ORDERED.map((scale, index) => {
          const scaleInfo = SCALE_DEFINITIONS[scale];
          const isCurrent = scale === state.currentScale;
          const isTarget = scale === state.targetScale;
          
          return (
            <button
              key={scale}
              onClick={() => scaleContext.transitionToScale(scale)}
              disabled={state.isTransitioning}
              className={clsx(
                'w-full text-left p-2 rounded text-sm transition-colors',
                isCurrent && 'bg-blue-600 text-white',
                isTarget && 'bg-blue-500 text-white',
                !isCurrent && !isTarget && 'text-gray-300 hover:bg-gray-700',
                state.isTransitioning && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="font-medium">
                {scaleInfo.nameCN} (10^{scaleInfo.magnitude}m)
              </div>
              <div className="text-xs opacity-75">
                {scaleInfo.examplesCN[0]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!visible) return null;

  return (
    <div
      className={clsx('select-none', className)}
      style={{ ...getPositionStyle(), ...style }}
      data-testid={testId}
    >
      {mode === 'compact' && renderCompactMode()}
      {mode === 'slider' && renderSliderMode()}
      {mode === 'full' && renderFullMode()}
    </div>
  );
};

export default ScaleNavigator;
