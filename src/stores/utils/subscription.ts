/**
 * 状态订阅工具
 * 提供状态变化监听和订阅功能
 */

import type { StoreApi } from 'zustand';

/**
 * 订阅配置接口
 */
export interface SubscriptionConfig<T> {
  /** 选择器函数 */
  selector?: (state: T) => any;
  /** 相等性比较函数 */
  equalityFn?: (a: any, b: any) => boolean;
  /** 是否立即触发 */
  fireImmediately?: boolean;
  /** 防抖延迟 */
  debounceMs?: number;
  /** 节流延迟 */
  throttleMs?: number;
}

/**
 * 订阅回调函数类型
 */
export type SubscriptionCallback<T> = (
  state: T,
  previousState: T
) => void;

/**
 * 取消订阅函数类型
 */
export type Unsubscribe = () => void;

/**
 * 默认相等性比较函数
 */
const defaultEqualityFn = (a: any, b: any): boolean => a === b;

/**
 * 防抖函数
 */
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

/**
 * 节流函数
 */
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  }) as T;
};

/**
 * 订阅状态变化
 */
export const subscribeToStore = <T>(
  store: StoreApi<T>,
  callback: SubscriptionCallback<T>,
  config: SubscriptionConfig<T> = {}
): Unsubscribe => {
  const {
    selector = (state: T) => state,
    equalityFn = defaultEqualityFn,
    fireImmediately = false,
    debounceMs,
    throttleMs,
  } = config;

  let previousSelectedState = selector(store.getState());
  let previousState = store.getState();

  // 应用防抖或节流
  let processedCallback = callback;
  if (debounceMs) {
    processedCallback = debounce(callback, debounceMs);
  } else if (throttleMs) {
    processedCallback = throttle(callback, throttleMs);
  }

  // 如果需要立即触发
  if (fireImmediately) {
    processedCallback(store.getState(), previousState);
  }

  // 订阅状态变化
  const unsubscribe = store.subscribe((state) => {
    const selectedState = selector(state);
    
    if (!equalityFn(selectedState, previousSelectedState)) {
      processedCallback(state, previousState);
      previousSelectedState = selectedState;
    }
    
    previousState = state;
  });

  return unsubscribe;
};

/**
 * 订阅特定字段变化
 */
export const subscribeToField = <T, K extends keyof T>(
  store: StoreApi<T>,
  field: K,
  callback: (value: T[K], previousValue: T[K], state: T) => void,
  equalityFn: (a: T[K], b: T[K]) => boolean = defaultEqualityFn
): Unsubscribe => {
  return subscribeToStore(
    store,
    (state, previousState) => {
      callback(state[field], previousState[field], state);
    },
    {
      selector: (state) => state[field],
      equalityFn,
    }
  );
};

/**
 * 订阅多个字段变化
 */
export const subscribeToFields = <T, K extends keyof T>(
  store: StoreApi<T>,
  fields: K[],
  callback: (
    values: Pick<T, K>,
    previousValues: Pick<T, K>,
    state: T
  ) => void,
  equalityFn: (a: Pick<T, K>, b: Pick<T, K>) => boolean = (a, b) => {
    return fields.every(field => defaultEqualityFn(a[field], b[field]));
  }
): Unsubscribe => {
  return subscribeToStore(
    store,
    (state, previousState) => {
      const values = fields.reduce((acc, field) => {
        acc[field] = state[field];
        return acc;
      }, {} as Pick<T, K>);
      
      const previousValues = fields.reduce((acc, field) => {
        acc[field] = previousState[field];
        return acc;
      }, {} as Pick<T, K>);
      
      callback(values, previousValues, state);
    },
    {
      selector: (state) => fields.reduce((acc, field) => {
        acc[field] = state[field];
        return acc;
      }, {} as Pick<T, K>),
      equalityFn,
    }
  );
};

/**
 * 创建状态变化监听器
 */
export const createStateWatcher = <T>() => {
  const watchers = new Map<string, {
    callback: SubscriptionCallback<T>;
    unsubscribe?: Unsubscribe;
  }>();

  return {
    /**
     * 添加监听器
     */
    watch: (
      id: string,
      store: StoreApi<T>,
      callback: SubscriptionCallback<T>,
      config?: SubscriptionConfig<T>
    ) => {
      // 如果已存在，先取消订阅
      if (watchers.has(id)) {
        watchers.get(id)?.unsubscribe?.();
      }

      const unsubscribe = subscribeToStore(store, callback, config);
      watchers.set(id, { callback, unsubscribe });
    },

    /**
     * 移除监听器
     */
    unwatch: (id: string) => {
      const watcher = watchers.get(id);
      if (watcher) {
        watcher.unsubscribe?.();
        watchers.delete(id);
      }
    },

    /**
     * 清除所有监听器
     */
    clear: () => {
      watchers.forEach(watcher => watcher.unsubscribe?.());
      watchers.clear();
    },

    /**
     * 获取活跃监听器数量
     */
    getWatcherCount: () => watchers.size,

    /**
     * 获取所有监听器ID
     */
    getWatcherIds: () => Array.from(watchers.keys()),
  };
};

/**
 * 深度相等比较函数
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

/**
 * 浅层相等比较函数
 */
export const shallowEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== 'object' || typeof b !== 'object') return a === b;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || a[key] !== b[key]) return false;
  }
  
  return true;
};
