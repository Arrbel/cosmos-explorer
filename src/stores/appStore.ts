/**
 * 主应用状态存储
 * 管理应用的全局状态
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// 启用Immer的MapSet支持
enableMapSet();
import type { AppState } from '@/types';
import { createPersistentStore } from './utils/persistence';
import { createDevtoolsStore, createDefaultDevtoolsConfig } from './utils/devtools';
import { ScaleLevel, LoadingState, Theme, Language, PanelType } from '@/types';

/**
 * 应用状态接口
 */
export interface AppStoreState extends AppState {
  /** 内部版本号 */
  _version?: number;
  /** 最后更新时间 */
  _lastUpdated?: Date;
}

/**
 * 应用状态操作接口
 */
export interface AppStoreActions {
  // 视图操作
  setCurrentScale: (scale: ScaleLevel) => void;
  setCurrentTarget: (target: AppState['currentView']['target']) => void;
  updateCameraState: (cameraState: Partial<AppState['currentView']['cameraState']>) => void;
  
  // 时间操作
  setCurrentTime: (time: Date) => void;
  setTimeScale: (scale: number) => void;
  toggleTimePlay: () => void;
  setTimeStep: (step: number) => void;
  
  // UI操作
  toggleUI: () => void;
  setActivePanel: (panel: PanelType | null) => void;
  toggleFullscreen: () => void;
  toggleImmersiveMode: () => void;
  setLoadingState: (state: LoadingState, progress?: number, message?: string) => void;
  addNotification: (notification: Omit<AppState['uiState']['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 用户偏好操作
  updateUserPreferences: (preferences: Partial<AppState['userPreferences']>) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  
  // 书签操作
  addBookmark: (bookmark: Omit<AppState['bookmarks'][0], 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<AppState['bookmarks'][0]>) => void;
  
  // 数据操作
  addLoadedScale: (scale: ScaleLevel) => void;
  removeLoadedScale: (scale: ScaleLevel) => void;
  setCelestialBody: (id: string, body: AppState['dataState']['celestialBodies'] extends Map<string, infer T> ? T : never) => void;
  removeCelestialBody: (id: string) => void;
  
  // 性能操作
  updatePerformanceMetrics: (metrics: AppState['performanceState']['currentMetrics']) => void;
  toggleAutoAdjustQuality: () => void;
  setTargetFPS: (fps: number) => void;
  
  // 重置操作
  resetToDefaults: () => void;
  resetUIState: () => void;
  resetUserPreferences: () => void;
}

/**
 * 创建初始状态
 */
const createInitialState = (): AppStoreState => ({
  currentView: {
    scale: ScaleLevel.SOLAR_SYSTEM,
    target: null,
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
  },
  
  timeState: {
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
      { label: '1月', value: 2592000, unit: 'second' },
      { label: '1年', value: 31536000, unit: 'second' },
    ],
    currentTimeStep: 86400,
  },
  
  uiState: {
    showUI: true,
    activePanel: null,
    isFullscreen: false,
    isImmersiveMode: false,
    loadingState: LoadingState.IDLE,
    loadingProgress: 0,
    loadingMessage: '',
    errorMessage: null,
    notifications: [],
    sidebarExpanded: true,
    bottomPanelExpanded: false,
    selectedCelestialBody: null,
    searchResults: [],
    searchQuery: '',
    showSearchSuggestions: false,
  },
  
  userPreferences: {
    language: Language.ZH_CN,
    theme: Theme.COSMIC,
    showChineseNames: true,
    showTraditionalConstellations: false,
    showOrbits: true,
    showLabels: true,
    performanceMode: 'auto',
    soundEnabled: true,
    volume: 0.7,
    autoSave: true,
    keyboardShortcuts: {
      zoom_in: 'KeyW',
      zoom_out: 'KeyS',
      rotate_left: 'KeyA',
      rotate_right: 'KeyD',
      reset_view: 'KeyR',
      toggle_ui: 'KeyH',
    },
    mouseSensitivity: 1.0,
    touchSensitivity: 1.2,
  },
  
  bookmarks: [],
  
  learningProgress: {
    userId: '',
    completedLessons: [],
    overallProgress: 0,
    achievements: [],
    studyTime: 0,
    quizScores: {},
    lastStudyTime: new Date(),
  },
  
  dataState: {
    loadedScales: new Set(),
    celestialBodies: new Map(),
    textures: new Map(),
    models: new Map(),
  },
  
  performanceState: {
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
  },
  
  _version: 1,
  _lastUpdated: new Date(),
});

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建应用状态存储
 */
export const useAppStore = create<AppStoreState & AppStoreActions>()(
  createDevtoolsStore(
    createPersistentStore(
      immer((set, get) => ({
        ...createInitialState(),
        
        // 视图操作
        setCurrentScale: (scale: ScaleLevel) => {
          set((state) => {
            state.currentView.scale = scale;
            state.currentView.cameraState.scaleLevel = scale;
            state._lastUpdated = new Date();
          });
        },
        
        setCurrentTarget: (target) => {
          set((state) => {
            state.currentView.target = target;
            state._lastUpdated = new Date();
          });
        },
        
        updateCameraState: (cameraState) => {
          set((state) => {
            Object.assign(state.currentView.cameraState, cameraState);
            state._lastUpdated = new Date();
          });
        },
        
        // 时间操作
        setCurrentTime: (time: Date) => {
          set((state) => {
            state.timeState.currentTime = time;
            state._lastUpdated = new Date();
          });
        },
        
        setTimeScale: (scale: number) => {
          set((state) => {
            state.timeState.timeScale = scale;
            state._lastUpdated = new Date();
          });
        },
        
        toggleTimePlay: () => {
          set((state) => {
            state.timeState.isPlaying = !state.timeState.isPlaying;
            state._lastUpdated = new Date();
          });
        },
        
        setTimeStep: (step: number) => {
          set((state) => {
            state.timeState.currentTimeStep = step;
            state._lastUpdated = new Date();
          });
        },
        
        // UI操作
        toggleUI: () => {
          set((state) => {
            state.uiState.showUI = !state.uiState.showUI;
            state._lastUpdated = new Date();
          });
        },
        
        setActivePanel: (panel: PanelType | null) => {
          set((state) => {
            state.uiState.activePanel = panel;
            state._lastUpdated = new Date();
          });
        },
        
        toggleFullscreen: () => {
          set((state) => {
            state.uiState.isFullscreen = !state.uiState.isFullscreen;
            state._lastUpdated = new Date();
          });
        },
        
        toggleImmersiveMode: () => {
          set((state) => {
            state.uiState.isImmersiveMode = !state.uiState.isImmersiveMode;
            if (state.uiState.isImmersiveMode) {
              state.uiState.showUI = false;
            }
            state._lastUpdated = new Date();
          });
        },
        
        setLoadingState: (loadingState: LoadingState, progress = 0, message = '') => {
          set((state) => {
            state.uiState.loadingState = loadingState;
            state.uiState.loadingProgress = progress;
            state.uiState.loadingMessage = message;
            state._lastUpdated = new Date();
          });
        },
        
        addNotification: (notification) => {
          set((state) => {
            const newNotification = {
              ...notification,
              id: generateId(),
              timestamp: new Date(),
            };
            state.uiState.notifications.push(newNotification);
            state._lastUpdated = new Date();
          });
        },
        
        removeNotification: (id: string) => {
          set((state) => {
            const index = state.uiState.notifications.findIndex(n => n.id === id);
            if (index !== -1) {
              state.uiState.notifications.splice(index, 1);
            }
            state._lastUpdated = new Date();
          });
        },
        
        clearNotifications: () => {
          set((state) => {
            state.uiState.notifications = [];
            state._lastUpdated = new Date();
          });
        },
        
        // 用户偏好操作
        updateUserPreferences: (preferences) => {
          set((state) => {
            Object.assign(state.userPreferences, preferences);
            state._lastUpdated = new Date();
          });
        },
        
        setLanguage: (language: Language) => {
          set((state) => {
            state.userPreferences.language = language;
            state._lastUpdated = new Date();
          });
        },
        
        setTheme: (theme: Theme) => {
          set((state) => {
            state.userPreferences.theme = theme;
            state._lastUpdated = new Date();
          });
        },
        
        // 书签操作
        addBookmark: (bookmark) => {
          set((state) => {
            const newBookmark = {
              ...bookmark,
              id: generateId(),
              createdAt: new Date(),
            };
            state.bookmarks.push(newBookmark);
            state._lastUpdated = new Date();
          });
        },
        
        removeBookmark: (id: string) => {
          set((state) => {
            const index = state.bookmarks.findIndex(b => b.id === id);
            if (index !== -1) {
              state.bookmarks.splice(index, 1);
            }
            state._lastUpdated = new Date();
          });
        },
        
        updateBookmark: (id: string, updates) => {
          set((state) => {
            const bookmark = state.bookmarks.find(b => b.id === id);
            if (bookmark) {
              Object.assign(bookmark, updates);
            }
            state._lastUpdated = new Date();
          });
        },
        
        // 数据操作
        addLoadedScale: (scale: ScaleLevel) => {
          set((state) => {
            state.dataState.loadedScales.add(scale);
            state._lastUpdated = new Date();
          });
        },
        
        removeLoadedScale: (scale: ScaleLevel) => {
          set((state) => {
            state.dataState.loadedScales.delete(scale);
            state._lastUpdated = new Date();
          });
        },
        
        setCelestialBody: (id: string, body: any) => {
          set((state) => {
            state.dataState.celestialBodies.set(id, body);
            state._lastUpdated = new Date();
          });
        },
        
        removeCelestialBody: (id: string) => {
          set((state) => {
            state.dataState.celestialBodies.delete(id);
            state._lastUpdated = new Date();
          });
        },
        
        // 性能操作
        updatePerformanceMetrics: (metrics) => {
          set((state) => {
            state.performanceState.currentMetrics = metrics;
            state.performanceState.metricsHistory.push(metrics);
            
            // 保持历史记录在合理范围内
            if (state.performanceState.metricsHistory.length > 100) {
              state.performanceState.metricsHistory.shift();
            }
            
            state._lastUpdated = new Date();
          });
        },
        
        toggleAutoAdjustQuality: () => {
          set((state) => {
            state.performanceState.autoAdjustQuality = !state.performanceState.autoAdjustQuality;
            state._lastUpdated = new Date();
          });
        },
        
        setTargetFPS: (fps: number) => {
          set((state) => {
            state.performanceState.targetFPS = fps;
            state._lastUpdated = new Date();
          });
        },
        
        // 重置操作
        resetToDefaults: () => {
          set(createInitialState());
        },
        
        resetUIState: () => {
          set((state) => {
            const initialState = createInitialState();
            state.uiState = initialState.uiState;
            state._lastUpdated = new Date();
          });
        },
        
        resetUserPreferences: () => {
          set((state) => {
            const initialState = createInitialState();
            state.userPreferences = initialState.userPreferences;
            state._lastUpdated = new Date();
          });
        },
      })),
      {
        name: 'cosmos-explorer-app-state',
        version: 1,
        partialize: (state) => ({
          userPreferences: state.userPreferences,
          bookmarks: state.bookmarks,
          learningProgress: state.learningProgress,
          currentView: {
            scale: state.currentView.scale,
          },
          timeState: {
            timeScale: state.timeState.timeScale,
            currentTimeStep: state.timeState.currentTimeStep,
          },
        }),
      }
    ),
    createDefaultDevtoolsConfig('CosmosExplorer::AppStore')
  )
);
