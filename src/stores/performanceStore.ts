/**
 * 性能状态存储
 * 管理性能监控和优化相关的状态
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PerformanceMetrics } from '@/types';
import { RenderQuality } from '@/types';
import { createDevtoolsStore, createDefaultDevtoolsConfig } from './utils/devtools';

/**
 * 性能状态接口
 */
export interface PerformanceStoreState {
  /** 当前性能指标 */
  currentMetrics: PerformanceMetrics;
  /** 性能历史记录 */
  metricsHistory: PerformanceMetrics[];
  /** 自动调整质量 */
  autoAdjustQuality: boolean;
  /** 目标帧率 */
  targetFPS: number;
  /** 当前渲染质量 */
  currentQuality: RenderQuality;
  /** 性能警告阈值 */
  thresholds: {
    lowFPS: number;
    highMemory: number;
    highDrawCalls: number;
    highTriangles: number;
  };
  /** 性能警告 */
  warnings: Array<{
    id: string;
    type: 'fps' | 'memory' | 'drawCalls' | 'triangles';
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>;
  /** 优化建议 */
  optimizationSuggestions: Array<{
    id: string;
    type: 'quality' | 'lod' | 'culling' | 'texture';
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
    timestamp: Date;
  }>;
  /** 性能监控是否启用 */
  monitoringEnabled: boolean;
  /** 监控间隔 */
  monitoringInterval: number;
  /** 统计信息 */
  stats: {
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    averageMemory: number;
    peakMemory: number;
    totalFrames: number;
    droppedFrames: number;
  };
}

/**
 * 性能状态操作接口
 */
export interface PerformanceStoreActions {
  /** 更新性能指标 */
  updateMetrics: (metrics: PerformanceMetrics) => void;
  /** 设置目标帧率 */
  setTargetFPS: (fps: number) => void;
  /** 切换自动质量调整 */
  toggleAutoAdjustQuality: () => void;
  /** 设置渲染质量 */
  setRenderQuality: (quality: RenderQuality) => void;
  /** 设置性能阈值 */
  setThresholds: (thresholds: Partial<PerformanceStoreState['thresholds']>) => void;
  /** 添加性能警告 */
  addWarning: (warning: Omit<PerformanceStoreState['warnings'][0], 'id' | 'timestamp'>) => void;
  /** 移除性能警告 */
  removeWarning: (id: string) => void;
  /** 清除所有警告 */
  clearWarnings: () => void;
  /** 添加优化建议 */
  addOptimizationSuggestion: (suggestion: Omit<PerformanceStoreState['optimizationSuggestions'][0], 'id' | 'timestamp'>) => void;
  /** 移除优化建议 */
  removeOptimizationSuggestion: (id: string) => void;
  /** 清除所有建议 */
  clearOptimizationSuggestions: () => void;
  /** 启用/禁用监控 */
  setMonitoringEnabled: (enabled: boolean) => void;
  /** 设置监控间隔 */
  setMonitoringInterval: (interval: number) => void;
  /** 重置统计信息 */
  resetStats: () => void;
  /** 获取性能报告 */
  getPerformanceReport: () => {
    summary: string;
    recommendations: string[];
    metrics: PerformanceMetrics;
  };
  /** 自动优化性能 */
  autoOptimize: () => void;
  /** 重置性能状态 */
  resetPerformanceState: () => void;
}

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建初始状态
 */
const createInitialState = (): PerformanceStoreState => ({
  currentMetrics: {
    fps: 60,
    renderTime: 16.67,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    gpuMemory: 0,
    timestamp: new Date(),
  },
  metricsHistory: [],
  autoAdjustQuality: true,
  targetFPS: 60,
  currentQuality: RenderQuality.HIGH,
  thresholds: {
    lowFPS: 30,
    highMemory: 512, // MB
    highDrawCalls: 1000,
    highTriangles: 500000,
  },
  warnings: [],
  optimizationSuggestions: [],
  monitoringEnabled: true,
  monitoringInterval: 1000, // ms
  stats: {
    averageFPS: 60,
    minFPS: 60,
    maxFPS: 60,
    averageMemory: 0,
    peakMemory: 0,
    totalFrames: 0,
    droppedFrames: 0,
  },
});

/**
 * 创建性能状态存储
 */
export const usePerformanceStore = create<PerformanceStoreState & PerformanceStoreActions>()(
  createDevtoolsStore(
    immer((set, get) => ({
      ...createInitialState(),

      updateMetrics: (metrics: PerformanceMetrics) => {
        set((state) => {
          state.currentMetrics = metrics;
          state.metricsHistory.push(metrics);
          
          // 限制历史记录长度
          if (state.metricsHistory.length > 300) {
            state.metricsHistory.shift();
          }
          
          // 更新统计信息
          const history = state.metricsHistory;
          if (history.length > 0) {
            const fpsList = history.map(m => m.fps);
            const memoryList = history.map(m => m.memoryUsage);
            
            state.stats.averageFPS = fpsList.reduce((a, b) => a + b, 0) / fpsList.length;
            state.stats.minFPS = Math.min(...fpsList);
            state.stats.maxFPS = Math.max(...fpsList);
            state.stats.averageMemory = memoryList.reduce((a, b) => a + b, 0) / memoryList.length;
            state.stats.peakMemory = Math.max(...memoryList);
            state.stats.totalFrames++;
            
            if (metrics.fps < state.targetFPS * 0.9) {
              state.stats.droppedFrames++;
            }
          }
          
          // 检查性能警告
          const actions = get();
          if ('checkPerformanceWarnings' in actions) {
            (actions as any).checkPerformanceWarnings(metrics);
          }
          
          // 自动质量调整
          if (state.autoAdjustQuality) {
            const actions = get();
            if ('autoOptimize' in actions) {
              (actions as any).autoOptimize();
            }
          }
        });
      },

      setTargetFPS: (fps: number) => {
        set((state) => {
          state.targetFPS = Math.max(15, Math.min(120, fps));
        });
      },

      toggleAutoAdjustQuality: () => {
        set((state) => {
          state.autoAdjustQuality = !state.autoAdjustQuality;
        });
      },

      setRenderQuality: (quality: RenderQuality) => {
        set((state) => {
          state.currentQuality = quality;
        });
      },

      setThresholds: (thresholds) => {
        set((state) => {
          Object.assign(state.thresholds, thresholds);
        });
      },

      addWarning: (warning) => {
        set((state) => {
          const newWarning = {
            ...warning,
            id: generateId(),
            timestamp: new Date(),
          };
          state.warnings.push(newWarning);
          
          // 限制警告数量
          if (state.warnings.length > 20) {
            state.warnings.shift();
          }
        });
      },

      removeWarning: (id: string) => {
        set((state) => {
          const index = state.warnings.findIndex(w => w.id === id);
          if (index !== -1) {
            state.warnings.splice(index, 1);
          }
        });
      },

      clearWarnings: () => {
        set((state) => {
          state.warnings = [];
        });
      },

      addOptimizationSuggestion: (suggestion) => {
        set((state) => {
          const newSuggestion = {
            ...suggestion,
            id: generateId(),
            timestamp: new Date(),
          };
          state.optimizationSuggestions.push(newSuggestion);
          
          // 限制建议数量
          if (state.optimizationSuggestions.length > 10) {
            state.optimizationSuggestions.shift();
          }
        });
      },

      removeOptimizationSuggestion: (id: string) => {
        set((state) => {
          const index = state.optimizationSuggestions.findIndex(s => s.id === id);
          if (index !== -1) {
            state.optimizationSuggestions.splice(index, 1);
          }
        });
      },

      clearOptimizationSuggestions: () => {
        set((state) => {
          state.optimizationSuggestions = [];
        });
      },

      setMonitoringEnabled: (enabled: boolean) => {
        set((state) => {
          state.monitoringEnabled = enabled;
        });
      },

      setMonitoringInterval: (interval: number) => {
        set((state) => {
          state.monitoringInterval = Math.max(100, Math.min(5000, interval));
        });
      },

      resetStats: () => {
        set((state) => {
          state.stats = {
            averageFPS: 60,
            minFPS: 60,
            maxFPS: 60,
            averageMemory: 0,
            peakMemory: 0,
            totalFrames: 0,
            droppedFrames: 0,
          };
          state.metricsHistory = [];
        });
      },

      getPerformanceReport: () => {
        const state = get();
        const metrics = state.currentMetrics;
        const stats = state.stats;
        
        const summary = `
          当前性能状态：
          - 帧率: ${metrics.fps.toFixed(1)} FPS (目标: ${state.targetFPS} FPS)
          - 内存使用: ${metrics.memoryUsage.toFixed(1)} MB
          - 渲染时间: ${metrics.renderTime.toFixed(2)} ms
          - 绘制调用: ${metrics.drawCalls}
          - 三角形数: ${metrics.triangles.toLocaleString()}
          
          统计信息：
          - 平均帧率: ${stats.averageFPS.toFixed(1)} FPS
          - 最低帧率: ${stats.minFPS.toFixed(1)} FPS
          - 峰值内存: ${stats.peakMemory.toFixed(1)} MB
          - 掉帧率: ${((stats.droppedFrames / stats.totalFrames) * 100).toFixed(1)}%
        `;
        
        const recommendations: string[] = [];
        
        if (metrics.fps < state.targetFPS * 0.8) {
          recommendations.push('降低渲染质量以提高帧率');
        }
        if (metrics.memoryUsage > state.thresholds.highMemory) {
          recommendations.push('清理未使用的纹理和几何体');
        }
        if (metrics.drawCalls > state.thresholds.highDrawCalls) {
          recommendations.push('合并绘制调用或使用实例化渲染');
        }
        
        return { summary, recommendations, metrics };
      },

      autoOptimize: () => {
        const state = get();
        const metrics = state.currentMetrics;
        const actions = get();
        
        // 基于当前性能自动调整质量
        if (metrics.fps < state.targetFPS * 0.7) {
          // 严重性能问题，降低质量
          if (state.currentQuality === RenderQuality.ULTRA_HIGH) {
            actions.setRenderQuality(RenderQuality.HIGH);
          } else if (state.currentQuality === RenderQuality.HIGH) {
            actions.setRenderQuality(RenderQuality.MEDIUM);
          } else if (state.currentQuality === RenderQuality.MEDIUM) {
            actions.setRenderQuality(RenderQuality.LOW);
          }
        } else if (metrics.fps > state.targetFPS * 1.2 && metrics.memoryUsage < state.thresholds.highMemory * 0.5) {
          // 性能良好，可以提高质量
          if (state.currentQuality === RenderQuality.LOW) {
            actions.setRenderQuality(RenderQuality.MEDIUM);
          } else if (state.currentQuality === RenderQuality.MEDIUM) {
            actions.setRenderQuality(RenderQuality.HIGH);
          } else if (state.currentQuality === RenderQuality.HIGH) {
            actions.setRenderQuality(RenderQuality.ULTRA_HIGH);
          }
        }
      },

      // 内部方法：检查性能警告
      checkPerformanceWarnings: (metrics: PerformanceMetrics) => {
        set((state) => {
          const addWarning = (warning: any) => {
            const newWarning = {
              ...warning,
              id: generateId(),
              timestamp: new Date(),
            };
            state.warnings.push(newWarning);

            // 限制警告数量
            if (state.warnings.length > 20) {
              state.warnings.shift();
            }
          };

          // 检查低帧率
          if (metrics.fps < state.thresholds.lowFPS) {
            addWarning({
              type: 'fps',
              message: `帧率过低: ${metrics.fps.toFixed(1)} FPS`,
              severity: metrics.fps < state.thresholds.lowFPS * 0.5 ? 'high' : 'medium',
            });
          }

          // 检查高内存使用
          if (metrics.memoryUsage > state.thresholds.highMemory) {
            addWarning({
              type: 'memory',
              message: `内存使用过高: ${metrics.memoryUsage.toFixed(1)} MB`,
              severity: metrics.memoryUsage > state.thresholds.highMemory * 1.5 ? 'high' : 'medium',
            });
          }

          // 检查绘制调用
          if (metrics.drawCalls > state.thresholds.highDrawCalls) {
            addWarning({
              type: 'drawCalls',
              message: `绘制调用过多: ${metrics.drawCalls}`,
              severity: metrics.drawCalls > state.thresholds.highDrawCalls * 2 ? 'high' : 'medium',
            });
          }

          // 检查三角形数量
          if (metrics.triangles > state.thresholds.highTriangles) {
            addWarning({
              type: 'triangles',
              message: `三角形数量过多: ${metrics.triangles.toLocaleString()}`,
              severity: metrics.triangles > state.thresholds.highTriangles * 2 ? 'high' : 'medium',
            });
          }
        });
      },

      resetPerformanceState: () => {
        set(createInitialState());
      },
    })),
    createDefaultDevtoolsConfig('CosmosExplorer::PerformanceStore')
  )
);
