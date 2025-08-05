/**
 * 状态管理使用示例
 * 展示如何在React组件中使用各种状态存储
 */

import React, { useEffect } from 'react';
import { 
  useAppStore, 
  useViewStore, 
  useTimeStore, 
  useUIStore, 
  useDataStore, 
  usePerformanceStore 
} from './index';
import { 
  appSelectors, 
  viewSelectors, 
  timeSelectors, 
  uiSelectors, 
  performanceSelectors 
} from './selectors';
import { subscribeToStore, subscribeToField } from './utils/subscription';
import { ScaleLevel, PanelType, NotificationType, LoadingState } from '@/types';

/**
 * 应用状态使用示例
 */
export const AppStateExample: React.FC = () => {
  // 使用选择器获取特定状态
  const currentScale = useAppStore(appSelectors.getCurrentScale);
  const userPreferences = useAppStore(appSelectors.getUserPreferences);
  const bookmarks = useAppStore(appSelectors.getBookmarks);
  
  // 获取操作函数
  const { 
    setCurrentScale, 
    setLanguage, 
    addBookmark, 
    addNotification 
  } = useAppStore();

  const handleScaleChange = (scale: ScaleLevel) => {
    setCurrentScale(scale);
    
    // 添加通知
    addNotification({
      type: NotificationType.INFO,
      title: '尺度切换',
      message: `已切换到 ${scale} 尺度`,
      closable: true,
    });
  };

  const handleAddBookmark = () => {
    const currentView = useAppStore.getState().currentView;
    
    addBookmark({
      name: `${currentScale} 视角`,
      description: `当前 ${currentScale} 尺度的视角`,
      cameraState: currentView.cameraState,
      scaleLevel: currentScale,
      tags: [currentScale],
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">应用状态示例</h2>
      
      <div>
        <h3 className="font-semibold">当前尺度: {currentScale}</h3>
        <div className="flex gap-2 mt-2">
          {Object.values(ScaleLevel).slice(0, 5).map(scale => (
            <button
              key={scale}
              onClick={() => handleScaleChange(scale)}
              className={`px-3 py-1 rounded ${
                currentScale === scale 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold">用户偏好</h3>
        <p>语言: {userPreferences.language}</p>
        <p>主题: {userPreferences.theme}</p>
        <p>显示中文名称: {userPreferences.showChineseNames ? '是' : '否'}</p>
      </div>

      <div>
        <h3 className="font-semibold">书签 ({bookmarks.length})</h3>
        <button
          onClick={handleAddBookmark}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          添加当前视角为书签
        </button>
        {bookmarks.map(bookmark => (
          <div key={bookmark.id} className="mt-2 p-2 bg-gray-100 rounded">
            <p className="font-medium">{bookmark.name}</p>
            <p className="text-sm text-gray-600">{bookmark.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 时间控制示例
 */
export const TimeControlExample: React.FC = () => {
  const currentTime = useTimeStore(timeSelectors.getCurrentTime);
  const timeScale = useTimeStore(timeSelectors.getTimeScale);
  const isPlaying = useTimeStore(timeSelectors.isPlaying);
  const formattedTime = useTimeStore(timeSelectors.getFormattedCurrentTime);
  const formattedScale = useTimeStore(timeSelectors.getFormattedTimeScale);
  
  const { 
    togglePlay, 
    setTimeScale, 
    stepTime, 
    resetToNow 
  } = useTimeStore();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">时间控制示例</h2>
      
      <div>
        <h3 className="font-semibold">当前时间</h3>
        <p className="font-mono">{formattedTime}</p>
        <p className="text-sm text-gray-600">倍速: {formattedScale}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={togglePlay}
          className={`px-3 py-1 rounded ${
            isPlaying 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}
        >
          {isPlaying ? '暂停' : '播放'}
        </button>
        
        <button
          onClick={() => stepTime(false)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          后退
        </button>
        
        <button
          onClick={() => stepTime(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          前进
        </button>
        
        <button
          onClick={resetToNow}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          重置到现在
        </button>
      </div>

      <div>
        <h3 className="font-semibold">时间倍速</h3>
        <input
          type="range"
          min="0.1"
          max="100"
          step="0.1"
          value={timeScale}
          onChange={(e) => setTimeScale(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>0.1x</span>
          <span>100x</span>
        </div>
      </div>
    </div>
  );
};

/**
 * UI状态示例
 */
export const UIStateExample: React.FC = () => {
  const showUI = useUIStore(uiSelectors.shouldShowUI);
  const activePanel = useUIStore(uiSelectors.getActivePanel);
  const loadingState = useUIStore(uiSelectors.getLoadingState);
  const notifications = useUIStore(uiSelectors.getNotifications);
  const windowSize = useUIStore(uiSelectors.getWindowSize);
  
  const { 
    toggleUI, 
    setActivePanel, 
    setLoadingState, 
    addNotification, 
    removeNotification 
  } = useUIStore();

  const handleTestLoading = () => {
    setLoadingState(LoadingState.LOADING, 0, '开始加载...');
    
    // 模拟加载进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setLoadingState(LoadingState.LOADING, progress, `加载中... ${progress}%`);
      
      if (progress >= 100) {
        clearInterval(interval);
        setLoadingState(LoadingState.SUCCESS, 100, '加载完成');
        setTimeout(() => {
          setLoadingState(LoadingState.IDLE);
        }, 1000);
      }
    }, 200);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">UI状态示例</h2>
      
      <div>
        <h3 className="font-semibold">UI控制</h3>
        <div className="flex gap-2">
          <button
            onClick={toggleUI}
            className={`px-3 py-1 rounded ${
              showUI 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            UI {showUI ? '显示' : '隐藏'}
          </button>
          
          <select
            value={activePanel || ''}
            onChange={(e) => setActivePanel(e.target.value as PanelType || null)}
            className="px-3 py-1 border rounded"
          >
            <option value="">无面板</option>
            {Object.values(PanelType).map(panel => (
              <option key={panel} value={panel}>{panel}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          当前面板: {activePanel || '无'}
        </p>
      </div>

      <div>
        <h3 className="font-semibold">加载状态</h3>
        <p>状态: {loadingState.state}</p>
        <p>进度: {loadingState.progress}%</p>
        <p>消息: {loadingState.message}</p>
        <button
          onClick={handleTestLoading}
          className="px-3 py-1 bg-blue-500 text-white rounded mt-2"
        >
          测试加载
        </button>
      </div>

      <div>
        <h3 className="font-semibold">通知 ({notifications.length})</h3>
        <button
          onClick={() => addNotification({
            type: NotificationType.INFO,
            title: '测试通知',
            message: `这是一个测试通知 - ${new Date().toLocaleTimeString()}`,
            closable: true,
          })}
          className="px-3 py-1 bg-purple-500 text-white rounded"
        >
          添加通知
        </button>
        
        <div className="mt-2 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="p-2 bg-blue-100 border border-blue-300 rounded flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm">{notification.message}</p>
              </div>
              {notification.closable && (
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold">窗口信息</h3>
        <p>尺寸: {windowSize.width} × {windowSize.height}</p>
      </div>
    </div>
  );
};

/**
 * 性能监控示例
 */
export const PerformanceExample: React.FC = () => {
  const currentMetrics = usePerformanceStore(performanceSelectors.getCurrentMetrics);
  const performanceGrade = usePerformanceStore(performanceSelectors.getPerformanceGrade);
  const isPerformanceGood = usePerformanceStore(performanceSelectors.isPerformanceGood);
  const warnings = usePerformanceStore(performanceSelectors.getWarnings);
  const suggestions = usePerformanceStore(performanceSelectors.getOptimizationSuggestions);
  
  const { 
    updateMetrics, 
    toggleAutoAdjustQuality, 
    addWarning, 
    addOptimizationSuggestion 
  } = usePerformanceStore();

  // 模拟性能数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      const mockMetrics = {
        fps: 45 + Math.random() * 30,
        renderTime: 10 + Math.random() * 20,
        memoryUsage: 200 + Math.random() * 300,
        drawCalls: 100 + Math.random() * 200,
        triangles: 50000 + Math.random() * 100000,
        geometries: 20 + Math.random() * 30,
        textures: 10 + Math.random() * 20,
        gpuMemory: 100 + Math.random() * 200,
        timestamp: new Date(),
      };
      
      updateMetrics(mockMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [updateMetrics]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">性能监控示例</h2>
      
      <div>
        <h3 className="font-semibold">当前性能</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p>帧率: {currentMetrics.fps.toFixed(1)} FPS</p>
            <p>渲染时间: {currentMetrics.renderTime.toFixed(2)} ms</p>
            <p>内存使用: {currentMetrics.memoryUsage.toFixed(1)} MB</p>
          </div>
          <div>
            <p>绘制调用: {currentMetrics.drawCalls}</p>
            <p>三角形: {currentMetrics.triangles.toLocaleString()}</p>
            <p>GPU内存: {currentMetrics.gpuMemory.toFixed(1)} MB</p>
          </div>
        </div>
        
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 rounded text-white ${
            performanceGrade === 'A' ? 'bg-green-500' :
            performanceGrade === 'B' ? 'bg-yellow-500' :
            performanceGrade === 'C' ? 'bg-orange-500' :
            'bg-red-500'
          }`}>
            性能等级: {performanceGrade}
          </span>
          
          <span className={`ml-2 inline-block px-2 py-1 rounded text-white ${
            isPerformanceGood ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isPerformanceGood ? '性能良好' : '性能警告'}
          </span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-600">性能警告</h3>
          <div className="space-y-1">
            {warnings.slice(-3).map(warning => (
              <div key={warning.id} className="text-sm text-red-600">
                {warning.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <h3 className="font-semibold text-blue-600">优化建议</h3>
          <div className="space-y-1">
            {suggestions.slice(-3).map(suggestion => (
              <div key={suggestion.id} className="text-sm text-blue-600">
                {suggestion.suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 状态订阅示例
 */
export const SubscriptionExample: React.FC = () => {
  const [subscriptionLog, setSubscriptionLog] = React.useState<string[]>([]);

  useEffect(() => {
    // 订阅尺度变化
    const unsubscribeScale = subscribeToField(
      useAppStore,
      'currentView',
      (currentView, previousView) => {
        if (currentView.scale !== previousView.scale) {
          setSubscriptionLog(prev => [
            ...prev.slice(-4),
            `尺度变化: ${previousView.scale} → ${currentView.scale}`
          ]);
        }
      }
    );

    // 订阅时间播放状态变化
    const unsubscribeTime = subscribeToField(
      useTimeStore,
      'isPlaying',
      (isPlaying, previousIsPlaying) => {
        if (isPlaying !== previousIsPlaying) {
          setSubscriptionLog(prev => [
            ...prev.slice(-4),
            `时间播放: ${previousIsPlaying ? '播放' : '暂停'} → ${isPlaying ? '播放' : '暂停'}`
          ]);
        }
      }
    );

    return () => {
      unsubscribeScale();
      unsubscribeTime();
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">状态订阅示例</h2>
      
      <div>
        <h3 className="font-semibold">订阅日志</h3>
        <div className="bg-gray-100 p-2 rounded font-mono text-sm">
          {subscriptionLog.length === 0 ? (
            <p className="text-gray-500">暂无状态变化</p>
          ) : (
            subscriptionLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        尝试切换尺度或时间播放状态来查看订阅效果
      </p>
    </div>
  );
};

/**
 * 完整示例组合
 */
export const StateManagementDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">状态管理示例</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg">
          <AppStateExample />
        </div>
        
        <div className="border rounded-lg">
          <TimeControlExample />
        </div>
        
        <div className="border rounded-lg">
          <UIStateExample />
        </div>
        
        <div className="border rounded-lg">
          <PerformanceExample />
        </div>
        
        <div className="border rounded-lg lg:col-span-2">
          <SubscriptionExample />
        </div>
      </div>
    </div>
  );
};
