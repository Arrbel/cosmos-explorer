/**
 * 视图状态存储
 * 管理3D视图相关的状态
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { CameraState, CelestialBody } from '@/types';
import { ScaleLevel } from '@/types';
import { createDevtoolsStore, createDefaultDevtoolsConfig } from './utils/devtools';

/**
 * 视图状态接口
 */
export interface ViewStoreState {
  /** 当前尺度级别 */
  currentScale: ScaleLevel;
  /** 目标天体 */
  targetBody: CelestialBody | null;
  /** 相机状态 */
  cameraState: CameraState;
  /** 是否正在过渡 */
  isTransitioning: boolean;
  /** 过渡进度 */
  transitionProgress: number;
  /** 视图历史 */
  viewHistory: Array<{
    scale: ScaleLevel;
    cameraState: CameraState;
    timestamp: Date;
  }>;
  /** 当前历史索引 */
  historyIndex: number;
  /** 是否跟随目标 */
  isFollowingTarget: boolean;
  /** 跟随偏移 */
  followOffset: { x: number; y: number; z: number };
}

/**
 * 视图状态操作接口
 */
export interface ViewStoreActions {
  /** 设置当前尺度 */
  setCurrentScale: (scale: ScaleLevel) => void;
  /** 设置目标天体 */
  setTargetBody: (body: CelestialBody | null) => void;
  /** 更新相机状态 */
  updateCameraState: (state: Partial<CameraState>) => void;
  /** 设置过渡状态 */
  setTransitionState: (isTransitioning: boolean, progress?: number) => void;
  /** 添加视图历史 */
  addViewHistory: (scale: ScaleLevel, cameraState: CameraState) => void;
  /** 导航到历史记录 */
  navigateToHistory: (index: number) => void;
  /** 后退 */
  goBack: () => boolean;
  /** 前进 */
  goForward: () => boolean;
  /** 清除历史 */
  clearHistory: () => void;
  /** 设置跟随状态 */
  setFollowTarget: (follow: boolean, offset?: { x: number; y: number; z: number }) => void;
  /** 重置视图 */
  resetView: () => void;
}

/**
 * 创建初始状态
 */
const createInitialState = (): ViewStoreState => ({
  currentScale: ScaleLevel.SOLAR_SYSTEM,
  targetBody: null,
  cameraState: {
    position: { x: 0, y: 0, z: 10000 },
    rotation: { x: 0, y: 0, z: 0 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
    target: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 1000000,
    zoom: 1,
    scaleLevel: ScaleLevel.SOLAR_SYSTEM,
  },
  isTransitioning: false,
  transitionProgress: 0,
  viewHistory: [],
  historyIndex: -1,
  isFollowingTarget: false,
  followOffset: { x: 0, y: 0, z: 1000 },
});

/**
 * 创建视图状态存储
 */
export const useViewStore = create<ViewStoreState & ViewStoreActions>()(
  createDevtoolsStore(
    immer((set, get) => ({
      ...createInitialState(),

      setCurrentScale: (scale: ScaleLevel) => {
        set((state) => {
          const currentState = get();
          // 添加到历史记录
          if (state.currentScale !== scale) {
            state.viewHistory = state.viewHistory.slice(0, state.historyIndex + 1);
            state.viewHistory.push({
              scale: state.currentScale,
              cameraState: { ...state.cameraState },
              timestamp: new Date(),
            });
            state.historyIndex = state.viewHistory.length - 1;
          }
          
          state.currentScale = scale;
          state.cameraState.scaleLevel = scale;
        });
      },

      setTargetBody: (body: CelestialBody | null) => {
        set((state) => {
          state.targetBody = body;
          if (body) {
            state.cameraState.target = body.position;
          }
        });
      },

      updateCameraState: (newState: Partial<CameraState>) => {
        set((state) => {
          Object.assign(state.cameraState, newState);
        });
      },

      setTransitionState: (isTransitioning: boolean, progress = 0) => {
        set((state) => {
          state.isTransitioning = isTransitioning;
          state.transitionProgress = progress;
        });
      },

      addViewHistory: (scale: ScaleLevel, cameraState: CameraState) => {
        set((state) => {
          // 移除当前索引之后的历史记录
          state.viewHistory = state.viewHistory.slice(0, state.historyIndex + 1);
          
          // 添加新的历史记录
          state.viewHistory.push({
            scale,
            cameraState: { ...cameraState },
            timestamp: new Date(),
          });
          
          state.historyIndex = state.viewHistory.length - 1;
          
          // 限制历史记录数量
          if (state.viewHistory.length > 50) {
            state.viewHistory.shift();
            state.historyIndex--;
          }
        });
      },

      navigateToHistory: (index: number) => {
        set((state) => {
          if (index >= 0 && index < state.viewHistory.length) {
            const historyItem = state.viewHistory[index];
            if (historyItem) {
              state.currentScale = historyItem.scale;
              state.cameraState = { ...historyItem.cameraState };
              state.historyIndex = index;
            }
          }
        });
      },

      goBack: () => {
        const state = get();
        if (state.historyIndex > 0) {
          get().navigateToHistory(state.historyIndex - 1);
          return true;
        }
        return false;
      },

      goForward: () => {
        const state = get();
        if (state.historyIndex < state.viewHistory.length - 1) {
          get().navigateToHistory(state.historyIndex + 1);
          return true;
        }
        return false;
      },

      clearHistory: () => {
        set((state) => {
          state.viewHistory = [];
          state.historyIndex = -1;
        });
      },

      setFollowTarget: (follow: boolean, offset = { x: 0, y: 0, z: 1000 }) => {
        set((state) => {
          state.isFollowingTarget = follow;
          state.followOffset = offset;
        });
      },

      resetView: () => {
        set(createInitialState());
      },
    })),
    createDefaultDevtoolsConfig('CosmosExplorer::ViewStore')
  )
);
