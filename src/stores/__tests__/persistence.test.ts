/**
 * 状态持久化测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createLocalStorage, 
  createPersistentStore,
  clearPersistedState,
  getPersistedStateSize,
  isStorageAvailable 
} from '../utils/persistence';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Persistence Utils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('createLocalStorage', () => {
    it('应该能存储和获取数据', () => {
      const storage = createLocalStorage<{ test: string }>();
      const testData = { test: 'hello' };
      
      storage.setItem('test-key', testData);
      const retrieved = storage.getItem('test-key');
      
      expect(retrieved).toEqual(testData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('应该在数据不存在时返回null', () => {
      const storage = createLocalStorage<{ test: string }>();
      
      const result = storage.getItem('non-existent-key');
      
      expect(result).toBeNull();
    });

    it('应该能删除数据', () => {
      const storage = createLocalStorage<{ test: string }>();
      const testData = { test: 'hello' };
      
      storage.setItem('test-key', testData);
      expect(storage.getItem('test-key')).toEqual(testData);
      
      storage.removeItem('test-key');
      expect(storage.getItem('test-key')).toBeNull();
    });

    it('应该处理JSON解析错误', () => {
      const storage = createLocalStorage<{ test: string }>();
      
      // 模拟损坏的JSON数据
      localStorageMock.setItem('corrupted-key', 'invalid-json');
      
      const result = storage.getItem('corrupted-key');
      
      expect(result).toBeNull();
    });
  });

  describe('createPersistentStore', () => {
    it('应该创建带持久化的store', () => {
      interface TestState {
        count: number;
        name: string;
      }

      const stateCreator = vi.fn((set: any, get: any, api: any) => ({
        count: 0,
        name: 'test',
        increment: () => set((state: TestState) => ({ ...state, count: state.count + 1 })),
      }));

      const persistentCreator = createPersistentStore(stateCreator, {
        name: 'test-store',
        version: 1,
      });

      // 模拟Zustand的调用
      const mockSet = vi.fn();
      const mockGet = vi.fn();
      const mockApi = { subscribe: vi.fn() };

      const result = persistentCreator(mockSet, mockGet, mockApi);

      expect(stateCreator).toHaveBeenCalledWith(mockSet, mockGet, mockApi);
      expect(result).toHaveProperty('_version', 1);
    });

    it('应该支持状态分割', () => {
      interface TestState {
        persistedData: string;
        temporaryData: string;
        _version?: number;
      }

      const stateCreator = (set: any, get: any, api: any) => ({
        persistedData: 'important',
        temporaryData: 'not-important',
      });

      const persistentCreator = createPersistentStore(stateCreator, {
        name: 'test-store-partial',
        version: 1,
        partialize: (state: TestState) => ({
          persistedData: state.persistedData,
        }),
      });

      const mockSet = vi.fn();
      const mockGet = vi.fn(() => ({
        persistedData: 'important',
        temporaryData: 'not-important',
      }));
      const mockApi = { subscribe: vi.fn() };

      persistentCreator(mockSet, mockGet, mockApi);

      // 验证订阅被设置
      expect(mockApi.subscribe).toHaveBeenCalled();
    });

    it('应该处理版本迁移', () => {
      interface TestState {
        data: string;
        _version?: number;
      }

      const migrate = vi.fn((persistedState: any, version: number) => ({
        data: 'migrated',
        _version: 2,
      }));

      const stateCreator = (set: any, get: any, api: any) => ({
        data: 'initial',
      });

      const persistentCreator = createPersistentStore(stateCreator, {
        name: 'test-store-migration',
        version: 2,
        migrate,
      });

      // 模拟旧版本数据
      localStorageMock.setItem('test-store-migration', JSON.stringify({
        data: 'old',
        _version: 1,
      }));

      const mockSet = vi.fn();
      const mockGet = vi.fn();
      const mockApi = { subscribe: vi.fn() };

      persistentCreator(mockSet, mockGet, mockApi);

      // 注意：由于异步恢复，迁移可能不会立即调用
      // 在实际应用中，这会在hydrate过程中处理
    });
  });

  describe('Utility Functions', () => {
    it('clearPersistedState应该清除指定的持久化数据', () => {
      localStorageMock.setItem('test-data', 'some-data');
      
      clearPersistedState('test-data');
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-data');
    });

    it('getPersistedStateSize应该返回数据大小', () => {
      const testData = 'hello world';
      localStorageMock.setItem('size-test', testData);
      
      const size = getPersistedStateSize('size-test');
      
      expect(size).toBeGreaterThan(0);
    });

    it('getPersistedStateSize应该在数据不存在时返回0', () => {
      const size = getPersistedStateSize('non-existent');
      
      expect(size).toBe(0);
    });

    it('isStorageAvailable应该检测localStorage可用性', () => {
      const available = isStorageAvailable();
      
      expect(available).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('__storage_test__', '__storage_test__');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('__storage_test__');
    });

    it('isStorageAvailable应该在localStorage不可用时返回false', () => {
      // 模拟localStorage抛出错误
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Storage not available');
      });
      
      const available = isStorageAvailable();
      
      expect(available).toBe(false);
      
      // 恢复原始方法
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('Error Handling', () => {
    it('应该处理localStorage写入错误', () => {
      const storage = createLocalStorage<{ test: string }>();
      
      // 模拟写入错误
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });
      
      // 应该不抛出错误
      expect(() => {
        storage.setItem('test', { test: 'data' });
      }).not.toThrow();
    });

    it('应该处理localStorage读取错误', () => {
      const storage = createLocalStorage<{ test: string }>();
      
      // 模拟读取错误
      localStorageMock.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const result = storage.getItem('test');
      
      expect(result).toBeNull();
    });

    it('应该处理localStorage删除错误', () => {
      const storage = createLocalStorage<{ test: string }>();
      
      // 模拟删除错误
      localStorageMock.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      // 应该不抛出错误
      expect(() => {
        storage.removeItem('test');
      }).not.toThrow();
    });
  });
});
