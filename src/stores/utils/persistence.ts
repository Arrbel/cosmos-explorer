/**
 * 状态持久化工具
 * 提供localStorage持久化功能
 */

import type { StateCreator } from 'zustand';

/**
 * 持久化配置接口
 */
export interface PersistConfig<T> {
  /** 存储键名 */
  name: string;
  /** 需要持久化的状态键 */
  partialize?: (state: T) => Partial<T>;
  /** 版本号 */
  version?: number;
  /** 状态迁移函数 */
  migrate?: (persistedState: any, version: number) => T;
  /** 序列化函数 */
  serialize?: (state: T) => string;
  /** 反序列化函数 */
  deserialize?: (str: string) => T;
  /** 是否跳过水合 */
  skipHydration?: boolean;
}

/**
 * 持久化存储接口
 */
export interface PersistStorage<T> {
  getItem: (name: string) => T | null | Promise<T | null>;
  setItem: (name: string, value: T) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
}

/**
 * 默认的localStorage存储实现
 */
export const createLocalStorage = <T>(): PersistStorage<T> => ({
  getItem: (name: string): T | null => {
    try {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to get item "${name}" from localStorage:`, error);
      return null;
    }
  },
  setItem: (name: string, value: T): void => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set item "${name}" to localStorage:`, error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn(`Failed to remove item "${name}" from localStorage:`, error);
    }
  },
});

/**
 * 创建持久化状态存储
 */
export const createPersistentStore = <T>(
  stateCreator: StateCreator<T>,
  config: PersistConfig<T>
): StateCreator<T> => {
  const storage = createLocalStorage<Partial<T>>();
  const {
    name,
    partialize = (state) => state,
    version = 0,
    migrate,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    skipHydration = false,
  } = config;

  return (set, get, api) => {
    const initialState = stateCreator(set, get, api);

    // 从localStorage恢复状态
    const hydrate = async (): Promise<void> => {
      if (skipHydration) return;

      try {
        const persistedState = await storage.getItem(name);
        if (persistedState) {
          const parsedState = typeof persistedState === 'string' 
            ? deserialize(persistedState) 
            : persistedState;

          let migratedState = parsedState;
          if (migrate && parsedState._version !== version) {
            migratedState = migrate(parsedState, parsedState._version || 0);
          }

          // 合并持久化状态和初始状态
          set({ ...initialState, ...migratedState, _version: version } as T);
        }
      } catch (error) {
        console.warn(`Failed to hydrate state for "${name}":`, error);
      }
    };

    // 保存状态到localStorage
    const persist = (): void => {
      try {
        const state = get();
        const stateToSave = partialize(state);
        const serializedState = serialize({ ...stateToSave, _version: version } as T);
        storage.setItem(name, serializedState);
      } catch (error) {
        console.warn(`Failed to persist state for "${name}":`, error);
      }
    };

    // 监听状态变化并持久化
    api.subscribe((state) => {
      persist();
    });

    // 初始化时恢复状态
    hydrate();

    return { ...initialState, _version: version } as T;
  };
};

/**
 * 清除持久化数据
 */
export const clearPersistedState = (name: string): void => {
  const storage = createLocalStorage();
  storage.removeItem(name);
};

/**
 * 获取持久化数据大小
 */
export const getPersistedStateSize = (name: string): number => {
  try {
    const item = localStorage.getItem(name);
    return item ? new Blob([item]).size : 0;
  } catch {
    return 0;
  }
};

/**
 * 获取所有持久化数据的总大小
 */
export const getTotalPersistedSize = (): number => {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item) {
          total += new Blob([item]).size;
        }
      }
    }
    return total;
  } catch {
    return 0;
  }
};

/**
 * 检查localStorage可用性
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * 持久化状态的调试信息
 */
export const getPersistedStateInfo = (name: string): {
  exists: boolean;
  size: number;
  version?: number;
  lastModified?: Date;
} => {
  try {
    const item = localStorage.getItem(name);
    if (!item) {
      return { exists: false, size: 0 };
    }

    const parsed = JSON.parse(item);
    return {
      exists: true,
      size: new Blob([item]).size,
      version: parsed._version,
      lastModified: parsed._lastModified ? new Date(parsed._lastModified) : undefined,
    };
  } catch {
    return { exists: false, size: 0 };
  }
};
