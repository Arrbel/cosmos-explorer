/**
 * 数据状态存储
 * 管理天体数据、纹理、模型等资源
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// 启用Immer的MapSet支持
enableMapSet();
import type { CelestialBody, ScaleLevel } from '@/types';
import { DataStatus } from '@/types';
import { createDevtoolsStore, createDefaultDevtoolsConfig } from './utils/devtools';

/**
 * 数据状态接口
 */
export interface DataStoreState {
  /** 已加载的尺度 */
  loadedScales: Set<ScaleLevel>;
  /** 天体数据 */
  celestialBodies: Map<string, CelestialBody>;
  /** 纹理缓存 */
  textures: Map<string, string>;
  /** 模型缓存 */
  models: Map<string, string>;
  /** 加载状态 */
  loadingStates: Map<string, DataStatus>;
  /** 加载进度 */
  loadingProgress: Map<string, number>;
  /** 错误信息 */
  errors: Map<string, string>;
  /** 缓存统计 */
  cacheStats: {
    totalSize: number;
    itemCount: number;
    hitCount: number;
    missCount: number;
  };
  /** 数据版本 */
  dataVersion: string;
  /** 最后更新时间 */
  lastUpdated: Date;
}

/**
 * 数据状态操作接口
 */
export interface DataStoreActions {
  /** 添加已加载尺度 */
  addLoadedScale: (scale: ScaleLevel) => void;
  /** 移除已加载尺度 */
  removeLoadedScale: (scale: ScaleLevel) => void;
  /** 检查尺度是否已加载 */
  isScaleLoaded: (scale: ScaleLevel) => boolean;
  
  /** 设置天体数据 */
  setCelestialBody: (id: string, body: CelestialBody) => void;
  /** 获取天体数据 */
  getCelestialBody: (id: string) => CelestialBody | undefined;
  /** 移除天体数据 */
  removeCelestialBody: (id: string) => void;
  /** 批量设置天体数据 */
  setCelestialBodies: (bodies: CelestialBody[]) => void;
  /** 获取指定尺度的天体 */
  getCelestialBodiesByScale: (scale: ScaleLevel) => CelestialBody[];
  /** 搜索天体 */
  searchCelestialBodies: (query: string) => CelestialBody[];
  
  /** 设置纹理 */
  setTexture: (id: string, url: string) => void;
  /** 获取纹理 */
  getTexture: (id: string) => string | undefined;
  /** 移除纹理 */
  removeTexture: (id: string) => void;
  
  /** 设置模型 */
  setModel: (id: string, url: string) => void;
  /** 获取模型 */
  getModel: (id: string) => string | undefined;
  /** 移除模型 */
  removeModel: (id: string) => void;
  
  /** 设置加载状态 */
  setLoadingState: (key: string, status: DataStatus, progress?: number) => void;
  /** 获取加载状态 */
  getLoadingState: (key: string) => DataStatus;
  /** 设置错误 */
  setError: (key: string, error: string) => void;
  /** 清除错误 */
  clearError: (key: string) => void;
  
  /** 更新缓存统计 */
  updateCacheStats: (stats: Partial<DataStoreState['cacheStats']>) => void;
  /** 清理缓存 */
  clearCache: () => void;
  /** 清理过期数据 */
  cleanupExpiredData: () => void;
  
  /** 重置数据状态 */
  resetDataState: () => void;
}

/**
 * 创建初始状态
 */
const createInitialState = (): DataStoreState => ({
  loadedScales: new Set(),
  celestialBodies: new Map(),
  textures: new Map(),
  models: new Map(),
  loadingStates: new Map(),
  loadingProgress: new Map(),
  errors: new Map(),
  cacheStats: {
    totalSize: 0,
    itemCount: 0,
    hitCount: 0,
    missCount: 0,
  },
  dataVersion: '1.0.0',
  lastUpdated: new Date(),
});

/**
 * 创建数据状态存储
 */
export const useDataStore = create<DataStoreState & DataStoreActions>()(
  createDevtoolsStore(
    immer((set, get) => ({
      ...createInitialState(),

      // 尺度管理
      addLoadedScale: (scale: ScaleLevel) => {
        set((state) => {
          state.loadedScales.add(scale);
          state.lastUpdated = new Date();
        });
      },

      removeLoadedScale: (scale: ScaleLevel) => {
        set((state) => {
          state.loadedScales.delete(scale);
          state.lastUpdated = new Date();
        });
      },

      isScaleLoaded: (scale: ScaleLevel) => {
        return get().loadedScales.has(scale);
      },

      // 天体数据管理
      setCelestialBody: (id: string, body: CelestialBody) => {
        set((state) => {
          state.celestialBodies.set(id, body);
          state.cacheStats.itemCount = state.celestialBodies.size;
          state.lastUpdated = new Date();
        });
      },

      getCelestialBody: (id: string) => {
        const state = get();
        const body = state.celestialBodies.get(id);
        
        // 更新缓存统计
        set((draft) => {
          if (body) {
            draft.cacheStats.hitCount++;
          } else {
            draft.cacheStats.missCount++;
          }
        });
        
        return body;
      },

      removeCelestialBody: (id: string) => {
        set((state) => {
          state.celestialBodies.delete(id);
          state.cacheStats.itemCount = state.celestialBodies.size;
          state.lastUpdated = new Date();
        });
      },

      setCelestialBodies: (bodies: CelestialBody[]) => {
        set((state) => {
          bodies.forEach(body => {
            state.celestialBodies.set(body.id, body);
          });
          state.cacheStats.itemCount = state.celestialBodies.size;
          state.lastUpdated = new Date();
        });
      },

      getCelestialBodiesByScale: (scale: ScaleLevel) => {
        const state = get();
        const bodies: CelestialBody[] = [];
        
        state.celestialBodies.forEach(body => {
          if (body.scaleLevel === scale) {
            bodies.push(body);
          }
        });
        
        return bodies;
      },

      searchCelestialBodies: (query: string) => {
        const state = get();
        const results: CelestialBody[] = [];
        const lowerQuery = query.toLowerCase();
        
        state.celestialBodies.forEach(body => {
          const nameMatch = body.name.toLowerCase().includes(lowerQuery);
          const chineseNameMatch = body.chineseName?.toLowerCase().includes(lowerQuery);
          const typeMatch = body.type.toLowerCase().includes(lowerQuery);
          
          if (nameMatch || chineseNameMatch || typeMatch) {
            results.push(body);
          }
        });
        
        return results.sort((a, b) => {
          // 优先显示名称完全匹配的结果
          const aExactMatch = a.name.toLowerCase() === lowerQuery || a.chineseName?.toLowerCase() === lowerQuery;
          const bExactMatch = b.name.toLowerCase() === lowerQuery || b.chineseName?.toLowerCase() === lowerQuery;
          
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          return a.name.localeCompare(b.name);
        });
      },

      // 纹理管理
      setTexture: (id: string, url: string) => {
        set((state) => {
          state.textures.set(id, url);
          state.lastUpdated = new Date();
        });
      },

      getTexture: (id: string) => {
        return get().textures.get(id);
      },

      removeTexture: (id: string) => {
        set((state) => {
          state.textures.delete(id);
          state.lastUpdated = new Date();
        });
      },

      // 模型管理
      setModel: (id: string, url: string) => {
        set((state) => {
          state.models.set(id, url);
          state.lastUpdated = new Date();
        });
      },

      getModel: (id: string) => {
        return get().models.get(id);
      },

      removeModel: (id: string) => {
        set((state) => {
          state.models.delete(id);
          state.lastUpdated = new Date();
        });
      },

      // 加载状态管理
      setLoadingState: (key: string, status: DataStatus, progress = 0) => {
        set((state) => {
          state.loadingStates.set(key, status);
          if (progress > 0) {
            state.loadingProgress.set(key, progress);
          }
          state.lastUpdated = new Date();
        });
      },

      getLoadingState: (key: string) => {
        return get().loadingStates.get(key) || DataStatus.PENDING;
      },

      setError: (key: string, error: string) => {
        set((state) => {
          state.errors.set(key, error);
          state.loadingStates.set(key, DataStatus.ERROR);
          state.lastUpdated = new Date();
        });
      },

      clearError: (key: string) => {
        set((state) => {
          state.errors.delete(key);
          state.lastUpdated = new Date();
        });
      },

      // 缓存管理
      updateCacheStats: (stats) => {
        set((state) => {
          Object.assign(state.cacheStats, stats);
          state.lastUpdated = new Date();
        });
      },

      clearCache: () => {
        set((state) => {
          state.celestialBodies.clear();
          state.textures.clear();
          state.models.clear();
          state.loadingStates.clear();
          state.loadingProgress.clear();
          state.errors.clear();
          state.cacheStats = {
            totalSize: 0,
            itemCount: 0,
            hitCount: 0,
            missCount: 0,
          };
          state.lastUpdated = new Date();
        });
      },

      cleanupExpiredData: () => {
        set((state) => {
          // 清理超过1小时的错误状态
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          
          state.errors.forEach((error, key) => {
            // 这里可以添加更复杂的过期逻辑
            // 暂时保留所有错误信息
          });
          
          state.lastUpdated = new Date();
        });
      },

      resetDataState: () => {
        set(createInitialState());
      },
    })),
    createDefaultDevtoolsConfig('CosmosExplorer::DataStore')
  )
);
