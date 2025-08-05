/**
 * 状态选择器
 * 提供优化的状态选择和计算函数
 */

import type { 
  AppStoreState, 
  ViewStoreState, 
  TimeStoreState, 
  UIStoreState, 
  DataStoreState, 
  PerformanceStoreState 
} from './index';
import type { ScaleLevel, CelestialBodyType } from '@/types';

/**
 * 应用状态选择器
 */
export const appSelectors = {
  /** 获取当前视图状态 */
  getCurrentView: (state: AppStoreState) => state.currentView,
  
  /** 获取当前尺度 */
  getCurrentScale: (state: AppStoreState) => state.currentView.scale,
  
  /** 获取当前目标 */
  getCurrentTarget: (state: AppStoreState) => state.currentView.target,
  
  /** 获取相机状态 */
  getCameraState: (state: AppStoreState) => state.currentView.cameraState,
  
  /** 获取用户偏好 */
  getUserPreferences: (state: AppStoreState) => state.userPreferences,
  
  /** 获取当前语言 */
  getCurrentLanguage: (state: AppStoreState) => state.userPreferences.language,
  
  /** 获取当前主题 */
  getCurrentTheme: (state: AppStoreState) => state.userPreferences.theme,
  
  /** 获取书签列表 */
  getBookmarks: (state: AppStoreState) => state.bookmarks,
  
  /** 获取学习进度 */
  getLearningProgress: (state: AppStoreState) => state.learningProgress,
  
  /** 检查是否显示中文名称 */
  shouldShowChineseNames: (state: AppStoreState) => state.userPreferences.showChineseNames,
  
  /** 检查是否显示传统星座 */
  shouldShowTraditionalConstellations: (state: AppStoreState) => state.userPreferences.showTraditionalConstellations,
};

/**
 * 视图状态选择器
 */
export const viewSelectors = {
  /** 获取当前尺度 */
  getCurrentScale: (state: ViewStoreState) => state.currentScale,
  
  /** 获取目标天体 */
  getTargetBody: (state: ViewStoreState) => state.targetBody,
  
  /** 获取相机状态 */
  getCameraState: (state: ViewStoreState) => state.cameraState,
  
  /** 检查是否正在过渡 */
  isTransitioning: (state: ViewStoreState) => state.isTransitioning,
  
  /** 获取过渡进度 */
  getTransitionProgress: (state: ViewStoreState) => state.transitionProgress,
  
  /** 获取视图历史 */
  getViewHistory: (state: ViewStoreState) => state.viewHistory,
  
  /** 检查是否可以后退 */
  canGoBack: (state: ViewStoreState) => state.historyIndex > 0,
  
  /** 检查是否可以前进 */
  canGoForward: (state: ViewStoreState) => state.historyIndex < state.viewHistory.length - 1,
  
  /** 检查是否跟随目标 */
  isFollowingTarget: (state: ViewStoreState) => state.isFollowingTarget,
  
  /** 获取跟随偏移 */
  getFollowOffset: (state: ViewStoreState) => state.followOffset,
};

/**
 * 时间状态选择器
 */
export const timeSelectors = {
  /** 获取当前时间 */
  getCurrentTime: (state: TimeStoreState) => state.currentTime,
  
  /** 获取时间倍速 */
  getTimeScale: (state: TimeStoreState) => state.timeScale,
  
  /** 检查是否正在播放 */
  isPlaying: (state: TimeStoreState) => state.isPlaying,
  
  /** 获取时间步长 */
  getTimeStep: (state: TimeStoreState) => state.currentTimeStep,
  
  /** 获取时间范围 */
  getTimeRange: (state: TimeStoreState) => ({
    min: state.minTime,
    max: state.maxTime,
  }),
  
  /** 检查是否实时同步 */
  isRealTimeSync: (state: TimeStoreState) => state.isRealTimeSync,
  
  /** 获取时间步长选项 */
  getTimeStepOptions: (state: TimeStoreState) => state.timeStepOptions,
  
  /** 格式化当前时间 */
  getFormattedCurrentTime: (state: TimeStoreState) => {
    return state.currentTime.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  },
  
  /** 格式化时间倍速 */
  getFormattedTimeScale: (state: TimeStoreState) => {
    const scale = state.timeScale;
    if (scale === 1) return '实时';
    if (scale < 1) return `${scale}x 慢速`;
    if (scale < 60) return `${scale}x`;
    if (scale < 3600) return `${Math.round(scale / 60)}分钟/秒`;
    if (scale < 86400) return `${Math.round(scale / 3600)}小时/秒`;
    if (scale < 31536000) return `${Math.round(scale / 86400)}天/秒`;
    return `${Math.round(scale / 31536000)}年/秒`;
  },
};

/**
 * UI状态选择器
 */
export const uiSelectors = {
  /** 检查是否显示UI */
  shouldShowUI: (state: UIStoreState) => state.showUI,
  
  /** 获取活动面板 */
  getActivePanel: (state: UIStoreState) => state.activePanel,
  
  /** 检查是否全屏 */
  isFullscreen: (state: UIStoreState) => state.isFullscreen,
  
  /** 检查是否沉浸模式 */
  isImmersiveMode: (state: UIStoreState) => state.isImmersiveMode,
  
  /** 获取加载状态 */
  getLoadingState: (state: UIStoreState) => ({
    state: state.loadingState,
    progress: state.loadingProgress,
    message: state.loadingMessage,
  }),
  
  /** 获取错误消息 */
  getErrorMessage: (state: UIStoreState) => state.errorMessage,
  
  /** 获取通知列表 */
  getNotifications: (state: UIStoreState) => state.notifications,
  
  /** 获取未读通知数量 */
  getUnreadNotificationCount: (state: UIStoreState) => state.notifications.length,
  
  /** 检查侧边栏是否展开 */
  isSidebarExpanded: (state: UIStoreState) => state.sidebarExpanded,
  
  /** 检查底部面板是否展开 */
  isBottomPanelExpanded: (state: UIStoreState) => state.bottomPanelExpanded,
  
  /** 获取选中的天体 */
  getSelectedCelestialBody: (state: UIStoreState) => state.selectedCelestialBody,
  
  /** 获取搜索状态 */
  getSearchState: (state: UIStoreState) => ({
    query: state.searchQuery,
    results: state.searchResults,
    showSuggestions: state.showSearchSuggestions,
  }),
  
  /** 获取窗口尺寸 */
  getWindowSize: (state: UIStoreState) => state.windowSize,
  
  /** 检查是否移动端 */
  isMobile: (state: UIStoreState) => state.isMobile,
  
  /** 检查是否平板 */
  isTablet: (state: UIStoreState) => state.isTablet,
  
  /** 获取键盘状态 */
  getKeyboardState: (state: UIStoreState) => state.keyboardState,
  
  /** 获取鼠标状态 */
  getMouseState: (state: UIStoreState) => state.mouseState,
  
  /** 获取触摸状态 */
  getTouchState: (state: UIStoreState) => state.touchState,
};

/**
 * 数据状态选择器
 */
export const dataSelectors = {
  /** 获取已加载的尺度 */
  getLoadedScales: (state: DataStoreState) => Array.from(state.loadedScales),
  
  /** 检查尺度是否已加载 */
  isScaleLoaded: (scale: ScaleLevel) => (state: DataStoreState) => state.loadedScales.has(scale),
  
  /** 获取所有天体 */
  getAllCelestialBodies: (state: DataStoreState) => Array.from(state.celestialBodies.values()),
  
  /** 根据尺度获取天体 */
  getCelestialBodiesByScale: (scale: ScaleLevel) => (state: DataStoreState) => {
    const bodies: any[] = [];
    state.celestialBodies.forEach((body: any) => {
      if (body.scaleLevel === scale) {
        bodies.push(body);
      }
    });
    return bodies;
  },

  /** 根据类型获取天体 */
  getCelestialBodiesByType: (type: CelestialBodyType) => (state: DataStoreState) => {
    const bodies: any[] = [];
    state.celestialBodies.forEach((body: any) => {
      if (body.type === type) {
        bodies.push(body);
      }
    });
    return bodies;
  },

  /** 获取天体数量统计 */
  getCelestialBodyStats: (state: DataStoreState) => {
    const stats: Record<string, number> = {};
    state.celestialBodies.forEach((body: any) => {
      stats[body.type] = (stats[body.type] || 0) + 1;
    });
    return stats;
  },
  
  /** 获取缓存统计 */
  getCacheStats: (state: DataStoreState) => state.cacheStats,
  
  /** 获取加载状态 */
  getLoadingStates: (state: DataStoreState) => state.loadingStates,
  
  /** 获取错误信息 */
  getErrors: (state: DataStoreState) => state.errors,
  
  /** 获取数据版本 */
  getDataVersion: (state: DataStoreState) => state.dataVersion,
  
  /** 获取最后更新时间 */
  getLastUpdated: (state: DataStoreState) => state.lastUpdated,
};

/**
 * 性能状态选择器
 */
export const performanceSelectors = {
  /** 获取当前性能指标 */
  getCurrentMetrics: (state: PerformanceStoreState) => state.currentMetrics,
  
  /** 获取性能历史 */
  getMetricsHistory: (state: PerformanceStoreState) => state.metricsHistory,
  
  /** 获取最近的性能指标 */
  getRecentMetrics: (count: number = 10) => (state: PerformanceStoreState) => {
    return state.metricsHistory.slice(-count);
  },
  
  /** 检查是否自动调整质量 */
  isAutoAdjustQuality: (state: PerformanceStoreState) => state.autoAdjustQuality,
  
  /** 获取目标帧率 */
  getTargetFPS: (state: PerformanceStoreState) => state.targetFPS,
  
  /** 获取当前渲染质量 */
  getCurrentQuality: (state: PerformanceStoreState) => state.currentQuality,
  
  /** 获取性能阈值 */
  getThresholds: (state: PerformanceStoreState) => state.thresholds,
  
  /** 获取性能警告 */
  getWarnings: (state: PerformanceStoreState) => state.warnings,
  
  /** 获取高严重性警告 */
  getHighSeverityWarnings: (state: PerformanceStoreState) => {
    return state.warnings.filter((w: any) => w.severity === 'high');
  },

  /** 获取优化建议 */
  getOptimizationSuggestions: (state: PerformanceStoreState) => state.optimizationSuggestions,

  /** 获取高影响建议 */
  getHighImpactSuggestions: (state: PerformanceStoreState) => {
    return state.optimizationSuggestions.filter((s: any) => s.impact === 'high');
  },
  
  /** 检查监控是否启用 */
  isMonitoringEnabled: (state: PerformanceStoreState) => state.monitoringEnabled,
  
  /** 获取监控间隔 */
  getMonitoringInterval: (state: PerformanceStoreState) => state.monitoringInterval,
  
  /** 获取统计信息 */
  getStats: (state: PerformanceStoreState) => state.stats,
  
  /** 获取性能等级 */
  getPerformanceGrade: (state: PerformanceStoreState) => {
    const fps = state.currentMetrics.fps;
    const targetFPS = state.targetFPS;
    
    if (fps >= targetFPS * 0.9) return 'A';
    if (fps >= targetFPS * 0.7) return 'B';
    if (fps >= targetFPS * 0.5) return 'C';
    if (fps >= targetFPS * 0.3) return 'D';
    return 'F';
  },
  
  /** 检查性能是否良好 */
  isPerformanceGood: (state: PerformanceStoreState) => {
    const metrics = state.currentMetrics;
    const thresholds = state.thresholds;
    
    return (
      metrics.fps >= state.targetFPS * 0.8 &&
      metrics.memoryUsage < thresholds.highMemory &&
      metrics.drawCalls < thresholds.highDrawCalls
    );
  },
};

/**
 * 组合选择器
 */
export const combinedSelectors = {
  /** 获取完整的应用状态摘要 */
  getAppSummary: (
    appState: AppStoreState,
    uiState: UIStoreState,
    performanceState: PerformanceStoreState
  ) => ({
    currentScale: appState.currentView.scale,
    isUIVisible: uiState.showUI,
    isLoading: uiState.loadingState !== 'idle',
    performanceGrade: performanceSelectors.getPerformanceGrade(performanceState),
    hasErrors: !!uiState.errorMessage,
    notificationCount: uiState.notifications.length,
  }),
  
  /** 获取当前视图的完整信息 */
  getCurrentViewInfo: (
    appState: AppStoreState,
    viewState: ViewStoreState,
    dataState: DataStoreState
  ) => ({
    scale: viewState.currentScale,
    target: viewState.targetBody,
    cameraState: viewState.cameraState,
    isTransitioning: viewState.isTransitioning,
    loadedBodies: dataSelectors.getCelestialBodiesByScale(viewState.currentScale)(dataState),
    canNavigateBack: viewSelectors.canGoBack(viewState),
    canNavigateForward: viewSelectors.canGoForward(viewState),
  }),
};
