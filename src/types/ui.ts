/**
 * 用户界面相关类型定义
 * 定义UI组件、状态管理和用户交互的类型
 */

import type { ScaleLevel, CelestialBody } from './celestial';
import type { CameraState, PerformanceMetrics } from './engine';

/**
 * 主题类型
 */
export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  COSMIC = 'cosmic',
  NEBULA = 'nebula',
}

/**
 * 语言类型
 */
export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
  ZH_TW = 'zh-TW',
}

/**
 * 面板类型
 */
export enum PanelType {
  CELESTIAL_INFO = 'celestialInfo',
  TIME_CONTROL = 'timeControl',
  SETTINGS = 'settings',
  SEARCH = 'search',
  BOOKMARKS = 'bookmarks',
  HELP = 'help',
  PERFORMANCE = 'performance',
  CHINESE_ASTRONOMY = 'chineseAstronomy',
  LEARNING = 'learning',
}

/**
 * 通知类型
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * 加载状态
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  /** 语言设置 */
  language: Language;
  /** 主题设置 */
  theme: Theme;
  /** 显示中文名称 */
  showChineseNames: boolean;
  /** 显示传统星座 */
  showTraditionalConstellations: boolean;
  /** 显示轨道 */
  showOrbits: boolean;
  /** 显示标签 */
  showLabels: boolean;
  /** 性能模式 */
  performanceMode: 'high' | 'medium' | 'low' | 'auto';
  /** 音效开关 */
  soundEnabled: boolean;
  /** 音量 */
  volume: number;
  /** 自动保存 */
  autoSave: boolean;
  /** 键盘快捷键 */
  keyboardShortcuts: Record<string, string>;
  /** 鼠标灵敏度 */
  mouseSensitivity: number;
  /** 触摸灵敏度 */
  touchSensitivity: number;
}

/**
 * 书签接口
 */
export interface Bookmark {
  /** 书签ID */
  id: string;
  /** 书签名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 相机状态 */
  cameraState: CameraState;
  /** 目标天体ID */
  targetId?: string;
  /** 尺度级别 */
  scaleLevel: ScaleLevel;
  /** 创建时间 */
  createdAt: Date;
  /** 标签 */
  tags: string[];
  /** 缩略图 */
  thumbnail?: string;
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  /** 结果ID */
  id: string;
  /** 标题 */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 描述 */
  description: string;
  /** 类型 */
  type: 'celestial_body' | 'constellation' | 'feature' | 'location';
  /** 相关天体 */
  celestialBody?: CelestialBody;
  /** 匹配度分数 */
  score: number;
  /** 高亮文本 */
  highlights: string[];
  /** 缩略图 */
  thumbnail?: string;
}

/**
 * 通知消息接口
 */
export interface NotificationMessage {
  /** 消息ID */
  id: string;
  /** 消息类型 */
  type: NotificationType;
  /** 标题 */
  title: string;
  /** 内容 */
  message: string;
  /** 持续时间 (ms) */
  duration?: number;
  /** 是否可关闭 */
  closable: boolean;
  /** 操作按钮 */
  actions?: {
    label: string;
    action: () => void;
  }[];
  /** 创建时间 */
  timestamp: Date;
}

/**
 * 时间控制状态接口
 */
export interface TimeControlState {
  /** 当前时间 */
  currentTime: Date;
  /** 时间倍速 */
  timeScale: number;
  /** 是否播放 */
  isPlaying: boolean;
  /** 最小时间 */
  minTime: Date;
  /** 最大时间 */
  maxTime: Date;
  /** 时间步长选项 */
  timeStepOptions: {
    label: string;
    value: number;
    unit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
  }[];
  /** 当前时间步长 */
  currentTimeStep: number;
}

/**
 * 学习进度接口
 */
export interface LearningProgress {
  /** 用户ID */
  userId: string;
  /** 完成的课程 */
  completedLessons: string[];
  /** 当前课程 */
  currentLesson?: string;
  /** 总进度百分比 */
  overallProgress: number;
  /** 获得的成就 */
  achievements: string[];
  /** 学习时间 (分钟) */
  studyTime: number;
  /** 测验分数 */
  quizScores: Record<string, number>;
  /** 最后学习时间 */
  lastStudyTime: Date;
}

/**
 * UI状态接口
 */
export interface UIState {
  /** 是否显示UI */
  showUI: boolean;
  /** 活动面板 */
  activePanel: PanelType | null;
  /** 是否全屏 */
  isFullscreen: boolean;
  /** 是否沉浸模式 */
  isImmersiveMode: boolean;
  /** 加载状态 */
  loadingState: LoadingState;
  /** 加载进度 */
  loadingProgress: number;
  /** 加载消息 */
  loadingMessage: string;
  /** 错误消息 */
  errorMessage: string | null;
  /** 通知列表 */
  notifications: NotificationMessage[];
  /** 侧边栏是否展开 */
  sidebarExpanded: boolean;
  /** 底部面板是否展开 */
  bottomPanelExpanded: boolean;
  /** 当前选中的天体 */
  selectedCelestialBody: CelestialBody | null;
  /** 搜索结果 */
  searchResults: SearchResult[];
  /** 搜索关键词 */
  searchQuery: string;
  /** 是否显示搜索建议 */
  showSearchSuggestions: boolean;
}

/**
 * 应用状态接口
 */
export interface AppState {
  /** 当前视图状态 */
  currentView: {
    /** 尺度级别 */
    scale: ScaleLevel;
    /** 目标天体 */
    target: CelestialBody | null;
    /** 相机状态 */
    cameraState: CameraState;
  };
  
  /** 时间状态 */
  timeState: TimeControlState;
  
  /** UI状态 */
  uiState: UIState;
  
  /** 用户偏好 */
  userPreferences: UserPreferences;
  
  /** 书签列表 */
  bookmarks: Bookmark[];
  
  /** 学习进度 */
  learningProgress: LearningProgress;
  
  /** 数据状态 */
  dataState: {
    /** 已加载的尺度 */
    loadedScales: Set<ScaleLevel>;
    /** 天体数据缓存 */
    celestialBodies: Map<string, CelestialBody>;
    /** 纹理缓存 */
    textures: Map<string, string>;
    /** 模型缓存 */
    models: Map<string, string>;
  };
  
  /** 性能状态 */
  performanceState: {
    /** 当前性能指标 */
    currentMetrics: PerformanceMetrics;
    /** 性能历史 */
    metricsHistory: PerformanceMetrics[];
    /** 自动调整质量 */
    autoAdjustQuality: boolean;
    /** 目标帧率 */
    targetFPS: number;
  };
}

/**
 * 组件属性基类
 */
export interface BaseComponentProps {
  /** 类名 */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;
  /** 是否可见 */
  visible?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 测试ID */
  testId?: string;
}

/**
 * 按钮组件属性
 */
export interface ButtonProps extends BaseComponentProps {
  /** 按钮文本 */
  children: React.ReactNode;
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否加载中 */
  loading?: boolean;
  /** 图标 */
  icon?: React.ReactNode;
  /** 点击事件 */
  onClick?: () => void;
}

/**
 * 面板组件属性
 */
export interface PanelProps extends BaseComponentProps {
  /** 面板标题 */
  title?: string;
  /** 面板内容 */
  children: React.ReactNode;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 是否默认折叠 */
  defaultCollapsed?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭事件 */
  onClose?: () => void;
  /** 面板大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * 模态框组件属性
 */
export interface ModalProps extends BaseComponentProps {
  /** 是否打开 */
  open: boolean;
  /** 模态框标题 */
  title?: string;
  /** 模态框内容 */
  children: React.ReactNode;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 是否点击遮罩关闭 */
  closeOnOverlayClick?: boolean;
  /** 是否按ESC关闭 */
  closeOnEscape?: boolean;
  /** 关闭事件 */
  onClose?: () => void;
  /** 模态框大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * 输入框组件属性
 */
export interface InputProps extends BaseComponentProps {
  /** 输入值 */
  value?: string;
  /** 占位符 */
  placeholder?: string;
  /** 输入类型 */
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  /** 是否必填 */
  required?: boolean;
  /** 最小长度 */
  minLength?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 输入变化事件 */
  onChange?: (value: string) => void;
  /** 获得焦点事件 */
  onFocus?: () => void;
  /** 失去焦点事件 */
  onBlur?: () => void;
  /** 按键事件 */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * 滑块组件属性
 */
export interface SliderProps extends BaseComponentProps {
  /** 当前值 */
  value: number;
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 步长 */
  step?: number;
  /** 标签 */
  label?: string;
  /** 显示值 */
  showValue?: boolean;
  /** 值变化事件 */
  onChange?: (value: number) => void;
  /** 格式化显示值 */
  formatValue?: (value: number) => string;
}
