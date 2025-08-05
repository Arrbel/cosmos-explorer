/**
 * 状态管理入口文件
 * 导出所有状态存储和相关工具
 */

export { useAppStore } from './appStore';
export { useViewStore } from './viewStore';
export { useTimeStore } from './timeStore';
export { useUIStore } from './uiStore';
export { useDataStore } from './dataStore';
export { usePerformanceStore } from './performanceStore';

// 导出状态类型
export type { AppStoreState, AppStoreActions } from './appStore';
export type { ViewStoreState, ViewStoreActions } from './viewStore';
export type { TimeStoreState, TimeStoreActions } from './timeStore';
export type { UIStoreState, UIStoreActions } from './uiStore';
export type { DataStoreState, DataStoreActions } from './dataStore';
export type { PerformanceStoreState, PerformanceStoreActions } from './performanceStore';

// 导出工具函数
export { createPersistentStore } from './utils/persistence';
export { createDevtoolsStore } from './utils/devtools';
export { subscribeToStore } from './utils/subscription';

// 导出状态选择器
export * from './selectors';
