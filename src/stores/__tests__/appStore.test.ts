/**
 * 应用状态存储测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../appStore';
import { ScaleLevel, LoadingState, Theme, Language, PanelType, NotificationType } from '@/types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AppStore', () => {
  beforeEach(() => {
    // 重置store状态
    useAppStore.getState().resetToDefaults();
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useAppStore.getState();
      
      expect(state.currentView.scale).toBe(ScaleLevel.SOLAR_SYSTEM);
      expect(state.currentView.target).toBeNull();
      expect(state.timeState.isPlaying).toBe(false);
      expect(state.uiState.showUI).toBe(true);
      expect(state.uiState.loadingState).toBe(LoadingState.IDLE);
      expect(state.userPreferences.language).toBe(Language.ZH_CN);
      expect(state.userPreferences.theme).toBe(Theme.COSMIC);
      expect(state.bookmarks).toEqual([]);
    });
  });

  describe('视图操作', () => {
    it('应该能设置当前尺度', () => {
      const { setCurrentScale } = useAppStore.getState();
      
      setCurrentScale(ScaleLevel.PLANETARY);
      
      const state = useAppStore.getState();
      expect(state.currentView.scale).toBe(ScaleLevel.PLANETARY);
      expect(state.currentView.cameraState.scaleLevel).toBe(ScaleLevel.PLANETARY);
    });

    it('应该能更新相机状态', () => {
      const { updateCameraState } = useAppStore.getState();
      
      updateCameraState({
        position: { x: 100, y: 200, z: 300 },
        fov: 90,
      });
      
      const state = useAppStore.getState();
      expect(state.currentView.cameraState.position).toEqual({ x: 100, y: 200, z: 300 });
      expect(state.currentView.cameraState.fov).toBe(90);
    });
  });

  describe('时间操作', () => {
    it('应该能设置当前时间', () => {
      const { setCurrentTime } = useAppStore.getState();
      const testTime = new Date('2023-01-01T12:00:00Z');
      
      setCurrentTime(testTime);
      
      const state = useAppStore.getState();
      expect(state.timeState.currentTime).toEqual(testTime);
    });

    it('应该能切换时间播放状态', () => {
      const { toggleTimePlay } = useAppStore.getState();
      
      // 初始状态应该是暂停
      expect(useAppStore.getState().timeState.isPlaying).toBe(false);
      
      toggleTimePlay();
      expect(useAppStore.getState().timeState.isPlaying).toBe(true);
      
      toggleTimePlay();
      expect(useAppStore.getState().timeState.isPlaying).toBe(false);
    });

    it('应该能设置时间倍速', () => {
      const { setTimeScale } = useAppStore.getState();
      
      setTimeScale(10);
      
      const state = useAppStore.getState();
      expect(state.timeState.timeScale).toBe(10);
    });
  });

  describe('UI操作', () => {
    it('应该能切换UI显示', () => {
      const { toggleUI } = useAppStore.getState();
      
      // 初始状态应该显示UI
      expect(useAppStore.getState().uiState.showUI).toBe(true);
      
      toggleUI();
      expect(useAppStore.getState().uiState.showUI).toBe(false);
      
      toggleUI();
      expect(useAppStore.getState().uiState.showUI).toBe(true);
    });

    it('应该能设置活动面板', () => {
      const { setActivePanel } = useAppStore.getState();
      
      setActivePanel(PanelType.SETTINGS);
      expect(useAppStore.getState().uiState.activePanel).toBe(PanelType.SETTINGS);
      
      setActivePanel(null);
      expect(useAppStore.getState().uiState.activePanel).toBeNull();
    });

    it('应该能设置加载状态', () => {
      const { setLoadingState } = useAppStore.getState();
      
      setLoadingState(LoadingState.LOADING, 50, '加载中...');
      
      const state = useAppStore.getState();
      expect(state.uiState.loadingState).toBe(LoadingState.LOADING);
      expect(state.uiState.loadingProgress).toBe(50);
      expect(state.uiState.loadingMessage).toBe('加载中...');
    });

    it('应该能添加和移除通知', () => {
      const { addNotification, removeNotification } = useAppStore.getState();
      
      // 添加通知
      addNotification({
        type: NotificationType.INFO,
        title: '测试通知',
        message: '这是一个测试通知',
        closable: true,
      });
      
      let state = useAppStore.getState();
      expect(state.uiState.notifications).toHaveLength(1);
      expect(state.uiState.notifications[0]?.title).toBe('测试通知');
      
      // 移除通知
      const notificationId = state.uiState.notifications[0]?.id;
      if (notificationId) {
        removeNotification(notificationId);
      }
      
      state = useAppStore.getState();
      expect(state.uiState.notifications).toHaveLength(0);
    });
  });

  describe('用户偏好操作', () => {
    it('应该能更新用户偏好', () => {
      const { updateUserPreferences } = useAppStore.getState();
      
      updateUserPreferences({
        showChineseNames: false,
        volume: 0.5,
        mouseSensitivity: 2.0,
      });
      
      const state = useAppStore.getState();
      expect(state.userPreferences.showChineseNames).toBe(false);
      expect(state.userPreferences.volume).toBe(0.5);
      expect(state.userPreferences.mouseSensitivity).toBe(2.0);
    });

    it('应该能设置语言', () => {
      const { setLanguage } = useAppStore.getState();
      
      setLanguage(Language.EN_US);
      
      const state = useAppStore.getState();
      expect(state.userPreferences.language).toBe(Language.EN_US);
    });

    it('应该能设置主题', () => {
      const { setTheme } = useAppStore.getState();
      
      setTheme(Theme.DARK);
      
      const state = useAppStore.getState();
      expect(state.userPreferences.theme).toBe(Theme.DARK);
    });
  });

  describe('书签操作', () => {
    it('应该能添加书签', () => {
      const { addBookmark } = useAppStore.getState();
      
      addBookmark({
        name: '地球视角',
        description: '从太空看地球',
        cameraState: {
          position: { x: 0, y: 0, z: 10000 },
          rotation: { x: 0, y: 0, z: 0 },
          quaternion: { x: 0, y: 0, z: 0, w: 1 },
          target: { x: 0, y: 0, z: 0 },
          fov: 75,
          near: 0.1,
          far: 1000000,
          zoom: 1,
          scaleLevel: ScaleLevel.PLANETARY,
        },
        scaleLevel: ScaleLevel.PLANETARY,
        tags: ['地球', '行星'],
      });
      
      const state = useAppStore.getState();
      expect(state.bookmarks).toHaveLength(1);
      expect(state.bookmarks[0]?.name).toBe('地球视角');
      expect(state.bookmarks[0]?.tags).toEqual(['地球', '行星']);
    });

    it('应该能移除书签', () => {
      const { addBookmark, removeBookmark } = useAppStore.getState();
      
      // 先添加书签
      addBookmark({
        name: '测试书签',
        cameraState: {
          position: { x: 0, y: 0, z: 1000 },
          rotation: { x: 0, y: 0, z: 0 },
          quaternion: { x: 0, y: 0, z: 0, w: 1 },
          target: { x: 0, y: 0, z: 0 },
          fov: 75,
          near: 0.1,
          far: 1000000,
          zoom: 1,
          scaleLevel: ScaleLevel.SOLAR_SYSTEM,
        },
        scaleLevel: ScaleLevel.SOLAR_SYSTEM,
        tags: [],
      });
      
      let state = useAppStore.getState();
      expect(state.bookmarks).toHaveLength(1);
      
      // 移除书签
      const bookmarkId = state.bookmarks[0]?.id;
      if (bookmarkId) {
        removeBookmark(bookmarkId);
      }
      
      state = useAppStore.getState();
      expect(state.bookmarks).toHaveLength(0);
    });
  });

  describe('数据操作', () => {
    it('应该能添加已加载尺度', () => {
      const { addLoadedScale } = useAppStore.getState();
      
      addLoadedScale(ScaleLevel.PLANETARY);
      
      const state = useAppStore.getState();
      expect(state.dataState.loadedScales.has(ScaleLevel.PLANETARY)).toBe(true);
    });

    it('应该能移除已加载尺度', () => {
      const { addLoadedScale, removeLoadedScale } = useAppStore.getState();
      
      // 先添加
      addLoadedScale(ScaleLevel.PLANETARY);
      expect(useAppStore.getState().dataState.loadedScales.has(ScaleLevel.PLANETARY)).toBe(true);
      
      // 再移除
      removeLoadedScale(ScaleLevel.PLANETARY);
      expect(useAppStore.getState().dataState.loadedScales.has(ScaleLevel.PLANETARY)).toBe(false);
    });
  });

  describe('性能操作', () => {
    it('应该能更新性能指标', () => {
      const { updatePerformanceMetrics } = useAppStore.getState();
      
      const testMetrics = {
        fps: 45,
        renderTime: 22.2,
        memoryUsage: 256,
        drawCalls: 150,
        triangles: 50000,
        geometries: 25,
        textures: 10,
        gpuMemory: 128,
        timestamp: new Date(),
      };
      
      updatePerformanceMetrics(testMetrics);
      
      const state = useAppStore.getState();
      expect(state.performanceState.currentMetrics).toEqual(testMetrics);
      expect(state.performanceState.metricsHistory).toHaveLength(1);
    });

    it('应该能切换自动质量调整', () => {
      const { toggleAutoAdjustQuality } = useAppStore.getState();
      
      // 初始状态应该是启用的
      expect(useAppStore.getState().performanceState.autoAdjustQuality).toBe(true);
      
      toggleAutoAdjustQuality();
      expect(useAppStore.getState().performanceState.autoAdjustQuality).toBe(false);
      
      toggleAutoAdjustQuality();
      expect(useAppStore.getState().performanceState.autoAdjustQuality).toBe(true);
    });
  });

  describe('重置操作', () => {
    it('应该能重置到默认状态', () => {
      const { 
        setCurrentScale, 
        setLanguage, 
        addBookmark, 
        resetToDefaults 
      } = useAppStore.getState();
      
      // 修改一些状态
      setCurrentScale(ScaleLevel.GALACTIC);
      setLanguage(Language.EN_US);
      addBookmark({
        name: '测试',
        cameraState: {
          position: { x: 0, y: 0, z: 1000 },
          rotation: { x: 0, y: 0, z: 0 },
          quaternion: { x: 0, y: 0, z: 0, w: 1 },
          target: { x: 0, y: 0, z: 0 },
          fov: 75,
          near: 0.1,
          far: 1000000,
          zoom: 1,
          scaleLevel: ScaleLevel.SOLAR_SYSTEM,
        },
        scaleLevel: ScaleLevel.SOLAR_SYSTEM,
        tags: [],
      });
      
      // 验证状态已改变
      let state = useAppStore.getState();
      expect(state.currentView.scale).toBe(ScaleLevel.GALACTIC);
      expect(state.userPreferences.language).toBe(Language.EN_US);
      expect(state.bookmarks).toHaveLength(1);
      
      // 重置
      resetToDefaults();
      
      // 验证状态已重置
      state = useAppStore.getState();
      expect(state.currentView.scale).toBe(ScaleLevel.SOLAR_SYSTEM);
      expect(state.userPreferences.language).toBe(Language.ZH_CN);
      expect(state.bookmarks).toHaveLength(0);
    });
  });
});
