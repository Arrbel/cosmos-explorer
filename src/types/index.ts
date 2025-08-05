/**
 * 类型定义入口文件
 * 统一导出所有类型定义
 */

// 天体相关类型
export type {
  CelestialBody,
  CelestialBodyCollection,
  CelestialBodyQuery,
  CelestialBodyQueryResult,
  OrbitData,
  CulturalInfo,
  PhysicalProperties,
  RenderProperties,
  LODLevel,
  Vector3Data,
  EulerData,
} from './celestial';

export {
  ScaleLevel,
  CelestialBodyType,
} from './celestial';

// 3D引擎相关类型
export type {
  CameraState,
  SceneState,
  AnimationKeyframe,
  AnimationConfig,
  TransitionConfig,
  LODConfig,
  RenderConfig,
  InputEvent,
  CameraController,
  SceneManager,
  AnimationSystem,
  RenderingEngine,
  PerformanceMetrics,
} from './engine';

export {
  CameraType,
  RenderQuality,
  EasingType,
  InputEventType,
} from './engine';

// UI相关类型
export type {
  UserPreferences,
  Bookmark,
  SearchResult,
  NotificationMessage,
  TimeControlState,
  LearningProgress,
  UIState,
  AppState,
  BaseComponentProps,
  ButtonProps,
  PanelProps,
  ModalProps,
  InputProps,
  SliderProps,
} from './ui';

export {
  Theme,
  Language,
  PanelType,
  NotificationType,
  LoadingState,
} from './ui';

// 数据管理相关类型
export type {
  APIResponse,
  PaginationInfo,
  DataLoadConfig,
  CacheItem,
  CacheStats,
  DataLoader,
  CelestialDataAPI,
  ChineseAstronomyData,
  RealTimeData,
  TextureData,
  ModelData,
  DataManager,
} from './data';

export {
  Priority,
  DataSourceType,
  CacheStrategy,
  DataStatus,
} from './data';

// 工具类型
export type * from './utils';

// 尺度系统类型
export type * from './scale';



/**
 * 常用常量类型
 */

/** 数学常量 */
export const MATH_CONSTANTS = {
  /** 天文单位 (m) */
  AU: 149597870700,
  /** 光速 (m/s) */
  SPEED_OF_LIGHT: 299792458,
  /** 光年 (m) */
  LIGHT_YEAR: 9460730472580800,
  /** 秒差距 (m) */
  PARSEC: 30856775814913673,
  /** 太阳质量 (kg) */
  SOLAR_MASS: 1.98847e30,
  /** 地球质量 (kg) */
  EARTH_MASS: 5.97237e24,
  /** 地球半径 (m) */
  EARTH_RADIUS: 6371000,
  /** 太阳半径 (m) */
  SOLAR_RADIUS: 695700000,
} as const;

/** 时间常量 */
export const TIME_CONSTANTS = {
  /** 一天的毫秒数 */
  DAY_MS: 24 * 60 * 60 * 1000,
  /** 一年的毫秒数 */
  YEAR_MS: 365.25 * 24 * 60 * 60 * 1000,
  /** 一个月的毫秒数 */
  MONTH_MS: 30.44 * 24 * 60 * 60 * 1000,
  /** 一小时的毫秒数 */
  HOUR_MS: 60 * 60 * 1000,
  /** 一分钟的毫秒数 */
  MINUTE_MS: 60 * 1000,
} as const;

/** 性能常量 */
export const PERFORMANCE_CONSTANTS = {
  /** 目标帧率 */
  TARGET_FPS: 60,
  /** 最小帧率 */
  MIN_FPS: 30,
  /** 最大内存使用 (MB) */
  MAX_MEMORY_MB: 512,
  /** 最大纹理大小 */
  MAX_TEXTURE_SIZE: 4096,
  /** 最大几何体顶点数 */
  MAX_VERTICES: 100000,
} as const;

/** 尺度常量 */
export const SCALE_CONSTANTS = {
  /** 各尺度的典型大小 (m) */
  SCALE_SIZES: {
    'atomic': 1e-15,
    'molecular': 1e-9,
    'cellular': 1e-6,
    'terrestrial': 1,
    'atmospheric': 1e4,
    'planetary': 1e7,
    'solar_system': 1e12,
    'kuiper_belt': 1e13,
    'oort_cloud': 1e15,
    'stellar': 1e16,
    'local_bubble': 1e18,
    'galactic': 1e21,
    'local_group': 1e23,
    'cosmic': 1e26,
  },
  /** 尺度切换阈值 */
  SCALE_THRESHOLDS: {
    ZOOM_IN: 0.1,
    ZOOM_OUT: 10,
  },
} as const;
