/**
 * 多尺度系统类型定义
 * 定义从原子到宇宙的25个数量级尺度系统
 */

/**
 * 尺度级别枚举
 * 从最小的原子尺度到最大的宇宙尺度
 */
export enum ScaleLevel {
  // 微观世界 (10^-15 到 10^-6 米)
  SUBATOMIC = 'subatomic',        // 10^-15m 亚原子粒子
  ATOMIC = 'atomic',              // 10^-10m 原子
  MOLECULAR = 'molecular',        // 10^-9m  分子
  NANOSCALE = 'nanoscale',        // 10^-8m  纳米尺度
  CELLULAR = 'cellular',          // 10^-6m  细胞

  // 微观到宏观过渡 (10^-5 到 10^-1 米)
  MICROSCOPIC = 'microscopic',    // 10^-5m  显微镜尺度
  MILLIMETER = 'millimeter',      // 10^-3m  毫米
  CENTIMETER = 'centimeter',      // 10^-2m  厘米
  HUMAN_SCALE = 'human_scale',    // 10^0m   人体尺度

  // 地面尺度 (10^1 到 10^6 米)
  BUILDING = 'building',          // 10^1m   建筑物
  CITY_BLOCK = 'city_block',      // 10^2m   街区
  CITY = 'city',                  // 10^4m   城市
  REGIONAL = 'regional',          // 10^5m   地区
  CONTINENTAL = 'continental',    // 10^6m   大陆

  // 行星尺度 (10^7 到 10^10 米)
  PLANETARY = 'planetary',        // 10^7m   行星表面
  PLANET = 'planet',              // 10^7m   整个行星
  ORBITAL = 'orbital',            // 10^8m   轨道空间
  INNER_SYSTEM = 'inner_system',  // 10^9m   内太阳系

  // 太阳系尺度 (10^11 到 10^13 米)
  SOLAR_SYSTEM = 'solar_system',  // 10^12m  太阳系
  OUTER_SYSTEM = 'outer_system',  // 10^13m  外太阳系
  HELIOSPHERE = 'heliosphere',    // 10^13m  日球层

  // 恒星际尺度 (10^14 到 10^17 米)
  STELLAR = 'stellar',            // 10^16m  恒星际空间
  LOCAL_STARS = 'local_stars',    // 10^17m  邻近恒星

  // 银河系尺度 (10^18 到 10^21 米)
  GALACTIC_LOCAL = 'galactic_local',  // 10^18m  银河系局部
  GALACTIC = 'galactic',          // 10^21m  银河系
  LOCAL_GROUP = 'local_group',    // 10^22m  本星系群

  // 宇宙尺度 (10^23 到 10^26 米)
  COSMIC = 'cosmic',              // 10^24m  宇宙大尺度结构
  UNIVERSE = 'universe'           // 10^26m  可观测宇宙
}

/**
 * 尺度信息接口
 */
export interface ScaleInfo {
  /** 尺度级别 */
  level: ScaleLevel;
  /** 尺度名称 */
  name: string;
  /** 中文名称 */
  nameCN: string;
  /** 典型尺寸（米） */
  size: number;
  /** 数量级 */
  magnitude: number;
  /** 描述 */
  description: string;
  /** 中文描述 */
  descriptionCN: string;
  /** 代表性对象 */
  examples: string[];
  /** 中文代表性对象 */
  examplesCN: string[];
  /** 相机默认距离 */
  defaultCameraDistance: number;
  /** 相机最小距离 */
  minCameraDistance: number;
  /** 相机最大距离 */
  maxCameraDistance: number;
  /** 渲染细节级别 */
  lodLevel: number;
  /** 是否启用物理模拟 */
  enablePhysics: boolean;
  /** 时间缩放因子 */
  timeScale: number;
}

/**
 * 尺度切换配置
 */
export interface ScaleTransition {
  /** 源尺度 */
  from: ScaleLevel;
  /** 目标尺度 */
  to: ScaleLevel;
  /** 过渡时间（毫秒） */
  duration: number;
  /** 缓动函数 */
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  /** 自定义缓动参数 */
  easingParams?: [number, number, number, number];
  /** 是否需要加载新数据 */
  requiresDataLoad: boolean;
  /** 过渡动画类型 */
  animationType: 'zoom' | 'fade' | 'morph' | 'tunnel';
}

/**
 * 尺度管理器状态
 */
export interface ScaleManagerState {
  /** 当前尺度 */
  currentScale: ScaleLevel;
  /** 目标尺度 */
  targetScale: ScaleLevel | null;
  /** 是否正在过渡 */
  isTransitioning: boolean;
  /** 过渡进度 (0-1) */
  transitionProgress: number;
  /** 可用的尺度列表 */
  availableScales: ScaleLevel[];
  /** 尺度历史记录 */
  scaleHistory: ScaleLevel[];
  /** 最大历史记录数 */
  maxHistorySize: number;
}

/**
 * 尺度相关的数据加载配置
 */
export interface ScaleDataConfig {
  /** 尺度级别 */
  scale: ScaleLevel;
  /** 数据源URL */
  dataSource: string;
  /** 数据类型 */
  dataType: 'static' | 'dynamic' | 'procedural';
  /** 预加载距离（相对于当前尺度的级别差） */
  preloadDistance: number;
  /** 缓存优先级 */
  cachePriority: 'low' | 'medium' | 'high';
  /** 数据大小估计（MB） */
  estimatedSize: number;
  /** 是否支持流式加载 */
  streamingSupport: boolean;
}

/**
 * 尺度渲染配置
 */
export interface ScaleRenderConfig {
  /** 尺度级别 */
  scale: ScaleLevel;
  /** 渲染质量 */
  quality: 'ultra_low' | 'low' | 'medium' | 'high' | 'ultra_high';
  /** 最大可见对象数 */
  maxVisibleObjects: number;
  /** LOD距离阈值 */
  lodDistances: number[];
  /** 是否启用阴影 */
  enableShadows: boolean;
  /** 是否启用反射 */
  enableReflections: boolean;
  /** 是否启用后处理效果 */
  enablePostProcessing: boolean;
  /** 粒子系统密度 */
  particleDensity: number;
}

/**
 * 尺度导航配置
 */
export interface ScaleNavigationConfig {
  /** 允许的导航方向 */
  allowedDirections: ('up' | 'down' | 'lateral')[];
  /** 快速跳转目标 */
  quickJumpTargets: ScaleLevel[];
  /** 导航限制 */
  restrictions: {
    /** 最小尺度 */
    minScale: ScaleLevel;
    /** 最大尺度 */
    maxScale: ScaleLevel;
    /** 禁用的尺度 */
    disabledScales: ScaleLevel[];
  };
  /** 自动导航建议 */
  autoSuggestions: boolean;
}

/**
 * 尺度事件类型
 */
export type ScaleEventType = 
  | 'scale-change-start'
  | 'scale-change-progress'
  | 'scale-change-complete'
  | 'scale-data-load-start'
  | 'scale-data-load-progress'
  | 'scale-data-load-complete'
  | 'scale-render-update'
  | 'scale-error';

/**
 * 尺度事件数据
 */
export interface ScaleEvent {
  /** 事件类型 */
  type: ScaleEventType;
  /** 源尺度 */
  fromScale?: ScaleLevel;
  /** 目标尺度 */
  toScale?: ScaleLevel;
  /** 进度 (0-1) */
  progress?: number;
  /** 错误信息 */
  error?: string;
  /** 额外数据 */
  data?: any;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 尺度管理器配置
 */
export interface ScaleManagerConfig {
  /** 初始尺度 */
  initialScale: ScaleLevel;
  /** 过渡配置 */
  transitions: Record<string, ScaleTransition>;
  /** 数据配置 */
  dataConfigs: Record<ScaleLevel, ScaleDataConfig>;
  /** 渲染配置 */
  renderConfigs: Record<ScaleLevel, ScaleRenderConfig>;
  /** 导航配置 */
  navigationConfig: ScaleNavigationConfig;
  /** 是否启用自动优化 */
  enableAutoOptimization: boolean;
  /** 性能监控 */
  enablePerformanceMonitoring: boolean;
  /** 调试模式 */
  debugMode: boolean;
}
