/**
 * UI状态存储
 * 管理用户界面相关的状态
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UIState, PanelType, NotificationMessage } from '@/types';
import { LoadingState } from '@/types';
import { createDevtoolsStore, createDefaultDevtoolsConfig } from './utils/devtools';

/**
 * UI状态接口
 */
export interface UIStoreState extends UIState {
  /** 窗口尺寸 */
  windowSize: {
    width: number;
    height: number;
  };
  /** 是否移动端 */
  isMobile: boolean;
  /** 是否平板 */
  isTablet: boolean;
  /** 键盘快捷键状态 */
  keyboardState: {
    pressedKeys: Set<string>;
    modifiers: {
      ctrl: boolean;
      shift: boolean;
      alt: boolean;
      meta: boolean;
    };
  };
  /** 鼠标状态 */
  mouseState: {
    position: { x: number; y: number };
    isDown: boolean;
    button: number;
  };
  /** 触摸状态 */
  touchState: {
    touches: Array<{
      id: number;
      position: { x: number; y: number };
    }>;
    isMultiTouch: boolean;
  };
}

/**
 * UI状态操作接口
 */
export interface UIStoreActions {
  /** 切换UI显示 */
  toggleUI: () => void;
  /** 设置活动面板 */
  setActivePanel: (panel: PanelType | null) => void;
  /** 切换全屏 */
  toggleFullscreen: () => void;
  /** 切换沉浸模式 */
  toggleImmersiveMode: () => void;
  /** 设置加载状态 */
  setLoadingState: (state: LoadingState, progress?: number, message?: string) => void;
  /** 设置错误消息 */
  setErrorMessage: (message: string | null) => void;
  /** 添加通知 */
  addNotification: (notification: Omit<NotificationMessage, 'id' | 'timestamp'>) => void;
  /** 移除通知 */
  removeNotification: (id: string) => void;
  /** 清除所有通知 */
  clearNotifications: () => void;
  /** 切换侧边栏 */
  toggleSidebar: () => void;
  /** 切换底部面板 */
  toggleBottomPanel: () => void;
  /** 设置搜索查询 */
  setSearchQuery: (query: string) => void;
  /** 设置搜索结果 */
  setSearchResults: (results: UIState['searchResults']) => void;
  /** 切换搜索建议 */
  toggleSearchSuggestions: (show?: boolean) => void;
  /** 更新窗口尺寸 */
  updateWindowSize: (width: number, height: number) => void;
  /** 设置设备类型 */
  setDeviceType: (isMobile: boolean, isTablet: boolean) => void;
  /** 更新键盘状态 */
  updateKeyboardState: (key: string, pressed: boolean, modifiers?: Partial<UIStoreState['keyboardState']['modifiers']>) => void;
  /** 更新鼠标状态 */
  updateMouseState: (position: { x: number; y: number }, isDown?: boolean, button?: number) => void;
  /** 更新触摸状态 */
  updateTouchState: (touches: UIStoreState['touchState']['touches']) => void;
  /** 重置UI状态 */
  resetUIState: () => void;
}

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 检测设备类型
 */
const detectDeviceType = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bTablet\b)/i.test(userAgent);
  return { isMobile, isTablet };
};

/**
 * 创建初始状态
 */
const createInitialState = (): UIStoreState => {
  const { isMobile, isTablet } = detectDeviceType();
  
  return {
    showUI: true,
    activePanel: null,
    isFullscreen: false,
    isImmersiveMode: false,
    loadingState: LoadingState.IDLE,
    loadingProgress: 0,
    loadingMessage: '',
    errorMessage: null,
    notifications: [],
    sidebarExpanded: !isMobile,
    bottomPanelExpanded: false,
    selectedCelestialBody: null,
    searchResults: [],
    searchQuery: '',
    showSearchSuggestions: false,
    
    windowSize: {
      width: typeof window !== 'undefined' ? window.innerWidth : 1920,
      height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    },
    isMobile,
    isTablet,
    keyboardState: {
      pressedKeys: new Set(),
      modifiers: {
        ctrl: false,
        shift: false,
        alt: false,
        meta: false,
      },
    },
    mouseState: {
      position: { x: 0, y: 0 },
      isDown: false,
      button: 0,
    },
    touchState: {
      touches: [],
      isMultiTouch: false,
    },
  };
};

/**
 * 创建UI状态存储
 */
export const useUIStore = create<UIStoreState & UIStoreActions>()(
  createDevtoolsStore(
    immer((set, get) => ({
      ...createInitialState(),

      toggleUI: () => {
        set((state) => {
          state.showUI = !state.showUI;
        });
      },

      setActivePanel: (panel: PanelType | null) => {
        set((state) => {
          state.activePanel = panel;
        });
      },

      toggleFullscreen: () => {
        set((state) => {
          state.isFullscreen = !state.isFullscreen;
        });
        
        // 实际切换全屏
        if (typeof document !== 'undefined') {
          const currentState = get();
          if (currentState.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        }
      },

      toggleImmersiveMode: () => {
        set((state) => {
          state.isImmersiveMode = !state.isImmersiveMode;
          if (state.isImmersiveMode) {
            state.showUI = false;
            state.activePanel = null;
          } else {
            state.showUI = true;
          }
        });
      },

      setLoadingState: (loadingState: LoadingState, progress = 0, message = '') => {
        set((state) => {
          state.loadingState = loadingState;
          state.loadingProgress = Math.max(0, Math.min(100, progress));
          state.loadingMessage = message;
        });
      },

      setErrorMessage: (message: string | null) => {
        set((state) => {
          state.errorMessage = message;
        });
      },

      addNotification: (notification) => {
        set((state) => {
          const newNotification: NotificationMessage = {
            ...notification,
            id: generateId(),
            timestamp: new Date(),
          };
          state.notifications.push(newNotification);
          
          // 限制通知数量
          if (state.notifications.length > 10) {
            state.notifications.shift();
          }
        });
      },

      removeNotification: (id: string) => {
        set((state) => {
          const index = state.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            state.notifications.splice(index, 1);
          }
        });
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.sidebarExpanded = !state.sidebarExpanded;
        });
      },

      toggleBottomPanel: () => {
        set((state) => {
          state.bottomPanelExpanded = !state.bottomPanelExpanded;
        });
      },

      setSearchQuery: (query: string) => {
        set((state) => {
          state.searchQuery = query;
          state.showSearchSuggestions = query.length > 0;
        });
      },

      setSearchResults: (results) => {
        set((state) => {
          state.searchResults = results;
        });
      },

      toggleSearchSuggestions: (show) => {
        set((state) => {
          state.showSearchSuggestions = show !== undefined ? show : !state.showSearchSuggestions;
        });
      },

      updateWindowSize: (width: number, height: number) => {
        set((state) => {
          state.windowSize.width = width;
          state.windowSize.height = height;
          
          // 根据窗口大小调整UI
          if (width < 768 && !state.isMobile) {
            state.sidebarExpanded = false;
          }
        });
      },

      setDeviceType: (isMobile: boolean, isTablet: boolean) => {
        set((state) => {
          state.isMobile = isMobile;
          state.isTablet = isTablet;
          
          // 移动端默认收起侧边栏
          if (isMobile) {
            state.sidebarExpanded = false;
          }
        });
      },

      updateKeyboardState: (key: string, pressed: boolean, modifiers) => {
        set((state) => {
          if (pressed) {
            state.keyboardState.pressedKeys.add(key);
          } else {
            state.keyboardState.pressedKeys.delete(key);
          }
          
          if (modifiers) {
            Object.assign(state.keyboardState.modifiers, modifiers);
          }
        });
      },

      updateMouseState: (position: { x: number; y: number }, isDown, button) => {
        set((state) => {
          state.mouseState.position = position;
          if (isDown !== undefined) {
            state.mouseState.isDown = isDown;
          }
          if (button !== undefined) {
            state.mouseState.button = button;
          }
        });
      },

      updateTouchState: (touches) => {
        set((state) => {
          state.touchState.touches = touches;
          state.touchState.isMultiTouch = touches.length > 1;
        });
      },

      resetUIState: () => {
        set(createInitialState());
      },
    })),
    createDefaultDevtoolsConfig('CosmosExplorer::UIStore')
  )
);

// 监听窗口大小变化
if (typeof window !== 'undefined') {
  const handleResize = () => {
    useUIStore.getState().updateWindowSize(window.innerWidth, window.innerHeight);
  };
  
  window.addEventListener('resize', handleResize);
  
  // 监听全屏状态变化
  const handleFullscreenChange = () => {
    const isFullscreen = !!document.fullscreenElement;
    const currentState = useUIStore.getState();
    if (currentState.isFullscreen !== isFullscreen) {
      useUIStore.setState({ isFullscreen });
    }
  };
  
  document.addEventListener('fullscreenchange', handleFullscreenChange);
}
