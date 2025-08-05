/**
 * 开发者工具集成
 * 提供Redux DevTools支持和状态调试功能
 */

import type { StateCreator } from 'zustand';

/**
 * DevTools配置接口
 */
export interface DevtoolsConfig {
  /** 存储名称 */
  name: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 是否匿名化 */
  anonymousActionType?: string;
  /** 序列化配置 */
  serialize?: {
    options?: boolean | {
      date?: boolean;
      regex?: boolean;
      undefined?: boolean;
      error?: boolean;
      symbol?: boolean;
      map?: boolean;
      set?: boolean;
      function?: boolean | ((fn: Function) => string);
    };
    replacer?: (key: string, value: any) => any;
    reviver?: (key: string, value: any) => any;
    immutable?: any;
    refs?: any[];
  };
  /** 动作类型映射 */
  actionCreators?: Record<string, (...args: any[]) => any>;
  /** 延迟连接 */
  latency?: number;
  /** 预定义类型 */
  predicate?: (state: any, action: any) => boolean;
  /** 状态清理器 */
  stateSanitizer?: (state: any) => any;
  /** 动作清理器 */
  actionSanitizer?: (action: any) => any;
}

/**
 * DevTools扩展接口
 */
interface DevtoolsExtension {
  connect(config?: DevtoolsConfig): {
    subscribe: (listener: (message: any) => void) => () => void;
    unsubscribe: () => void;
    send: (action: any, state: any) => void;
    init: (state: any) => void;
    error: (message: string) => void;
  };
}

/**
 * 获取Redux DevTools扩展
 */
const getDevtoolsExtension = (): DevtoolsExtension | null => {
  if (typeof window === 'undefined') return null;
  
  return (
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ ||
    (window as any).top?.__REDUX_DEVTOOLS_EXTENSION__ ||
    null
  );
};

/**
 * 创建带DevTools支持的状态存储
 */
export const createDevtoolsStore = <T>(
  stateCreator: StateCreator<T>,
  config: DevtoolsConfig
): StateCreator<T> => {
  const devtools = getDevtoolsExtension();

  if (!devtools || !config.enabled) {
    // 如果DevTools不可用或未启用，返回原始状态创建器
    return stateCreator;
  }

  return (set, get, api) => {
    try {
      const connection = devtools.connect({
        name: config.name,
      });

      // 创建初始状态
      const initialState = stateCreator(set, get, api);

      // 初始化DevTools
      connection.init(initialState);

      return initialState;
    } catch (error) {
      console.warn('DevTools connection failed:', error);
      return stateCreator(set, get, api);
    }
  };
};

/**
 * 检查DevTools是否可用
 */
export const isDevtoolsAvailable = (): boolean => {
  return getDevtoolsExtension() !== null;
};

/**
 * 创建动作创建器
 */
export const createActionCreators = <T extends Record<string, (...args: any[]) => any>>(
  actions: T
): T => {
  return actions;
};

/**
 * 状态清理器 - 移除敏感信息
 */
export const createStateSanitizer = <T extends Record<string, any>>(
  sensitiveKeys: (keyof T)[]
): ((state: T) => Partial<T>) => {
  return (state: T) => {
    const sanitized = { ...state };
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        (sanitized as any)[key] = '[HIDDEN]';
      }
    });
    return sanitized;
  };
};

/**
 * 动作清理器 - 移除敏感的动作数据
 */
export const createActionSanitizer = (
  sensitiveActionTypes: string[]
): ((action: any) => any) => {
  return (action: any) => {
    if (sensitiveActionTypes.includes(action.type)) {
      return {
        ...action,
        payload: '[HIDDEN]',
      };
    }
    return action;
  };
};

/**
 * 开发环境检查
 */
export const isDevelopment = (): boolean => {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
};

/**
 * 创建默认DevTools配置
 */
export const createDefaultDevtoolsConfig = (name: string): DevtoolsConfig => ({
  name,
  enabled: isDevelopment() && isDevtoolsAvailable(),
  anonymousActionType: 'setState',
  serialize: {
    options: {
      date: true,
      regex: true,
      undefined: true,
      error: true,
      symbol: false,
      map: true,
      set: true,
      function: (fn: Function) => fn.name || 'anonymous',
    },
  },
  latency: 0,
  predicate: () => true,
});

/**
 * 性能监控装饰器
 */
export const withPerformanceMonitoring = <T>(
  stateCreator: StateCreator<T>,
  storeName: string
): StateCreator<T> => {
  return (set, get, api) => {
    const performanceSet = (partial: any, replace?: boolean) => {
      const startTime = performance.now();

      set(partial, replace);

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 16) { // 超过一帧的时间
        console.warn(
          `Slow state update in ${storeName}:`,
          `setState took ${duration.toFixed(2)}ms`
        );
      }
    };

    return stateCreator(performanceSet, get, api);
  };
};
