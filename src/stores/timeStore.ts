/**
 * 时间状态存储
 * 管理时间控制相关的状态
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TimeControlState } from '@/types';
import { createDevtoolsStore, createDefaultDevtoolsConfig } from './utils/devtools';
import { createPersistentStore } from './utils/persistence';

/**
 * 时间状态接口
 */
export interface TimeStoreState extends TimeControlState {
  /** 是否实时同步 */
  isRealTimeSync: boolean;
  /** 动画帧ID */
  animationFrameId: number | null;
  /** 上次更新时间 */
  lastUpdateTime: number;
  /** 累计时间 */
  accumulatedTime: number;
}

/**
 * 时间状态操作接口
 */
export interface TimeStoreActions {
  /** 设置当前时间 */
  setCurrentTime: (time: Date) => void;
  /** 设置时间倍速 */
  setTimeScale: (scale: number) => void;
  /** 播放/暂停 */
  togglePlay: () => void;
  /** 播放 */
  play: () => void;
  /** 暂停 */
  pause: () => void;
  /** 设置时间步长 */
  setTimeStep: (step: number) => void;
  /** 步进时间 */
  stepTime: (forward?: boolean) => void;
  /** 跳转到指定时间 */
  jumpToTime: (time: Date) => void;
  /** 重置到当前时间 */
  resetToNow: () => void;
  /** 设置时间范围 */
  setTimeRange: (minTime: Date, maxTime: Date) => void;
  /** 切换实时同步 */
  toggleRealTimeSync: () => void;
  /** 开始时间循环 */
  startTimeLoop: () => void;
  /** 停止时间循环 */
  stopTimeLoop: () => void;
  /** 更新时间 */
  updateTime: (deltaTime: number) => void;
}

/**
 * 创建初始状态
 */
const createInitialState = (): TimeStoreState => ({
  currentTime: new Date(),
  timeScale: 1,
  isPlaying: false,
  minTime: new Date('1900-01-01'),
  maxTime: new Date('2100-12-31'),
  timeStepOptions: [
    { label: '1秒', value: 1, unit: 'second' },
    { label: '1分钟', value: 60, unit: 'second' },
    { label: '1小时', value: 3600, unit: 'second' },
    { label: '1天', value: 86400, unit: 'second' },
    { label: '1周', value: 604800, unit: 'second' },
    { label: '1月', value: 2592000, unit: 'second' },
    { label: '1年', value: 31536000, unit: 'second' },
  ],
  currentTimeStep: 86400, // 1天
  isRealTimeSync: false,
  animationFrameId: null,
  lastUpdateTime: 0,
  accumulatedTime: 0,
});

/**
 * 时间格式化工具
 */
const formatTimeScale = (scale: number): string => {
  if (scale === 1) return '实时';
  if (scale < 1) return `${scale}x 慢速`;
  if (scale < 60) return `${scale}x`;
  if (scale < 3600) return `${Math.round(scale / 60)}分钟/秒`;
  if (scale < 86400) return `${Math.round(scale / 3600)}小时/秒`;
  if (scale < 31536000) return `${Math.round(scale / 86400)}天/秒`;
  return `${Math.round(scale / 31536000)}年/秒`;
};

/**
 * 创建时间状态存储
 */
export const useTimeStore = create<TimeStoreState & TimeStoreActions>()(
  createDevtoolsStore(
    createPersistentStore(
      immer((set, get) => ({
        ...createInitialState(),

        setCurrentTime: (time: Date) => {
          set((state) => {
            // 确保时间在有效范围内
            if (time >= state.minTime && time <= state.maxTime) {
              state.currentTime = time;
              state.isRealTimeSync = false;
            }
          });
        },

        setTimeScale: (scale: number) => {
          set((state) => {
            // 限制时间倍速范围
            state.timeScale = Math.max(0.001, Math.min(1000000, scale));
          });
        },

        togglePlay: () => {
          const state = get();
          if (state.isPlaying) {
            get().pause();
          } else {
            get().play();
          }
        },

        play: () => {
          set((state) => {
            state.isPlaying = true;
            state.lastUpdateTime = performance.now();
          });
          get().startTimeLoop();
        },

        pause: () => {
          set((state) => {
            state.isPlaying = false;
          });
          get().stopTimeLoop();
        },

        setTimeStep: (step: number) => {
          set((state) => {
            state.currentTimeStep = Math.max(1, step);
          });
        },

        stepTime: (forward = true) => {
          set((state) => {
            const direction = forward ? 1 : -1;
            const newTime = new Date(
              state.currentTime.getTime() + direction * state.currentTimeStep * 1000
            );
            
            // 确保时间在有效范围内
            if (newTime >= state.minTime && newTime <= state.maxTime) {
              state.currentTime = newTime;
              state.isRealTimeSync = false;
            }
          });
        },

        jumpToTime: (time: Date) => {
          set((state) => {
            if (time >= state.minTime && time <= state.maxTime) {
              state.currentTime = time;
              state.isRealTimeSync = false;
            }
          });
        },

        resetToNow: () => {
          set((state) => {
            state.currentTime = new Date();
            state.timeScale = 1;
            state.isRealTimeSync = true;
          });
        },

        setTimeRange: (minTime: Date, maxTime: Date) => {
          set((state) => {
            if (minTime < maxTime) {
              state.minTime = minTime;
              state.maxTime = maxTime;
              
              // 确保当前时间在新范围内
              if (state.currentTime < minTime) {
                state.currentTime = minTime;
              } else if (state.currentTime > maxTime) {
                state.currentTime = maxTime;
              }
            }
          });
        },

        toggleRealTimeSync: () => {
          set((state) => {
            state.isRealTimeSync = !state.isRealTimeSync;
            if (state.isRealTimeSync) {
              state.currentTime = new Date();
              state.timeScale = 1;
            }
          });
        },

        startTimeLoop: () => {
          const state = get();
          if (state.animationFrameId !== null) {
            return; // 已经在运行
          }

          const loop = (currentTime: number) => {
            const state = get();
            if (!state.isPlaying) {
              set((draft) => {
                draft.animationFrameId = null;
              });
              return;
            }

            const deltaTime = currentTime - state.lastUpdateTime;
            get().updateTime(deltaTime);

            set((draft) => {
              draft.animationFrameId = requestAnimationFrame(loop);
              draft.lastUpdateTime = currentTime;
            });
          };

          set((state) => {
            state.animationFrameId = requestAnimationFrame(loop);
            state.lastUpdateTime = performance.now();
          });
        },

        stopTimeLoop: () => {
          set((state) => {
            if (state.animationFrameId !== null) {
              cancelAnimationFrame(state.animationFrameId);
              state.animationFrameId = null;
            }
          });
        },

        updateTime: (deltaTime: number) => {
          set((state) => {
            if (state.isRealTimeSync) {
              state.currentTime = new Date();
              return;
            }

            // 累计时间变化
            state.accumulatedTime += deltaTime * state.timeScale;

            // 当累计时间超过1秒时更新显示时间
            if (Math.abs(state.accumulatedTime) >= 1000) {
              const timeChange = Math.floor(state.accumulatedTime);
              const newTime = new Date(state.currentTime.getTime() + timeChange);
              
              // 确保时间在有效范围内
              if (newTime >= state.minTime && newTime <= state.maxTime) {
                state.currentTime = newTime;
                state.accumulatedTime -= timeChange;
              } else {
                // 到达边界时暂停
                state.isPlaying = false;
                state.accumulatedTime = 0;
                if (newTime < state.minTime) {
                  state.currentTime = state.minTime;
                } else {
                  state.currentTime = state.maxTime;
                }
              }
            }
          });
        },
      })),
      {
        name: 'cosmos-explorer-time-state',
        version: 1,
        partialize: (state) => ({
          timeScale: state.timeScale,
          currentTimeStep: state.currentTimeStep,
          minTime: state.minTime,
          maxTime: state.maxTime,
          isRealTimeSync: state.isRealTimeSync,
        }),
      }
    ),
    createDefaultDevtoolsConfig('CosmosExplorer::TimeStore')
  )
);
