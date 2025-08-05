/**
 * 数据管理相关类型定义
 * 定义数据加载、缓存、API接口等类型
 */

import type { CelestialBody, CelestialBodyQuery, CelestialBodyQueryResult, ScaleLevel } from './celestial';

/**
 * 数据优先级
 */
export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  BACKGROUND = 'background',
}

/**
 * 数据源类型
 */
export enum DataSourceType {
  NASA_API = 'nasa_api',
  LOCAL_FILE = 'local_file',
  CACHE = 'cache',
  USER_GENERATED = 'user_generated',
  CHINESE_ASTRONOMY = 'chinese_astronomy',
}

/**
 * 缓存策略
 */
export enum CacheStrategy {
  NO_CACHE = 'no_cache',
  MEMORY_ONLY = 'memory_only',
  PERSISTENT = 'persistent',
  HYBRID = 'hybrid',
}

/**
 * 数据状态
 */
export enum DataStatus {
  PENDING = 'pending',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  STALE = 'stale',
}

/**
 * API响应基类
 */
export interface APIResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** 状态码 */
  status: number;
  /** 状态消息 */
  message: string;
  /** 是否成功 */
  success: boolean;
  /** 时间戳 */
  timestamp: Date;
  /** 请求ID */
  requestId: string;
}

/**
 * 分页信息接口
 */
export interface PaginationInfo {
  /** 当前页 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总数量 */
  total: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
}

/**
 * 数据加载配置接口
 */
export interface DataLoadConfig {
  /** 数据源 */
  source: DataSourceType;
  /** 优先级 */
  priority: Priority;
  /** 缓存策略 */
  cacheStrategy: CacheStrategy;
  /** 超时时间 (ms) */
  timeout: number;
  /** 重试次数 */
  retryCount: number;
  /** 重试延迟 (ms) */
  retryDelay: number;
  /** 是否并行加载 */
  parallel: boolean;
  /** 批量大小 */
  batchSize: number;
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存键 */
  key: string;
  /** 缓存值 */
  value: T;
  /** 创建时间 */
  createdAt: Date;
  /** 过期时间 */
  expiresAt: Date;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessedAt: Date;
  /** 数据大小 (bytes) */
  size: number;
  /** 标签 */
  tags: string[];
}

/**
 * 缓存统计接口
 */
export interface CacheStats {
  /** 总项目数 */
  totalItems: number;
  /** 总大小 (bytes) */
  totalSize: number;
  /** 命中次数 */
  hits: number;
  /** 未命中次数 */
  misses: number;
  /** 命中率 */
  hitRate: number;
  /** 内存使用 (bytes) */
  memoryUsage: number;
  /** 最大内存 (bytes) */
  maxMemory: number;
  /** 清理次数 */
  evictions: number;
}

/**
 * 数据加载器接口
 */
export interface DataLoader<T = any> {
  /** 加载器ID */
  id: string;
  /** 加载数据 */
  load(config: DataLoadConfig): Promise<T>;
  /** 预加载 */
  preload(keys: string[]): Promise<void>;
  /** 取消加载 */
  cancel(requestId: string): void;
  /** 获取加载状态 */
  getStatus(key: string): DataStatus;
  /** 清理资源 */
  cleanup(): void;
}

/**
 * 天体数据API接口
 */
export interface CelestialDataAPI {
  /** 获取天体列表 */
  getCelestialBodies(query: CelestialBodyQuery): Promise<APIResponse<CelestialBodyQueryResult>>;
  /** 获取单个天体 */
  getCelestialBody(id: string): Promise<APIResponse<CelestialBody>>;
  /** 搜索天体 */
  searchCelestialBodies(keyword: string, filters?: Partial<CelestialBodyQuery>): Promise<APIResponse<CelestialBody[]>>;
  /** 获取天体轨道数据 */
  getOrbitData(id: string, timeRange: { start: Date; end: Date }): Promise<APIResponse<any>>;
  /** 获取实时位置 */
  getRealTimePosition(id: string): Promise<APIResponse<{ position: [number, number, number]; timestamp: Date }>>;
}

/**
 * 中国古代天文数据接口
 */
export interface ChineseAstronomyData {
  /** 二十八宿数据 */
  twentyEightMansions: {
    id: string;
    name: string;
    category: '东方青龙' | '西方白虎' | '南方朱雀' | '北方玄武';
    stars: {
      id: string;
      name: string;
      position: [number, number, number];
      magnitude: number;
    }[];
    mythology: string;
    significance: string;
  }[];
  
  /** 三垣数据 */
  threeEnclosures: {
    id: string;
    name: '紫微垣' | '太微垣' | '天市垣';
    stars: {
      id: string;
      name: string;
      position: [number, number, number];
      role: string;
    }[];
    description: string;
  }[];
  
  /** 古代天文仪器 */
  ancientInstruments: {
    id: string;
    name: string;
    type: '浑天仪' | '简仪' | '圭表' | '水运仪象台';
    description: string;
    inventor: string;
    period: string;
    modelUrl?: string;
    usage: string[];
  }[];
  
  /** 传统历法 */
  traditionalCalendar: {
    /** 二十四节气 */
    solarTerms: {
      name: string;
      date: Date;
      description: string;
      astronomicalMeaning: string;
    }[];
    /** 农历月份 */
    lunarMonths: {
      name: string;
      startDate: Date;
      endDate: Date;
      isLeapMonth: boolean;
    }[];
    /** 干支纪年 */
    sexagenaryYear: {
      heavenlyStem: string;
      earthlyBranch: string;
      zodiac: string;
      year: number;
    };
  };
}

/**
 * 实时数据接口
 */
export interface RealTimeData {
  /** ISS位置 */
  issPosition: {
    latitude: number;
    longitude: number;
    altitude: number;
    velocity: number;
    timestamp: Date;
  };
  
  /** 天文事件 */
  astronomicalEvents: {
    id: string;
    type: 'eclipse' | 'conjunction' | 'meteor_shower' | 'comet_approach';
    name: string;
    description: string;
    startTime: Date;
    endTime: Date;
    visibility: {
      regions: string[];
      conditions: string;
    };
  }[];
  
  /** 观测建议 */
  observingRecommendations: {
    location: {
      latitude: number;
      longitude: number;
    };
    date: Date;
    recommendations: {
      target: string;
      bestTime: Date;
      visibility: 'excellent' | 'good' | 'fair' | 'poor';
      equipment: string[];
      tips: string[];
    }[];
  };
}

/**
 * 纹理数据接口
 */
export interface TextureData {
  /** 纹理ID */
  id: string;
  /** 纹理名称 */
  name: string;
  /** 纹理类型 */
  type: 'diffuse' | 'normal' | 'height' | 'emissive' | 'specular';
  /** 文件URL */
  url: string;
  /** 分辨率 */
  resolution: {
    width: number;
    height: number;
  };
  /** 文件大小 (bytes) */
  fileSize: number;
  /** 压缩格式 */
  format: 'jpg' | 'png' | 'webp' | 'ktx2' | 'dds';
  /** 质量级别 */
  quality: 'low' | 'medium' | 'high' | 'ultra';
  /** 是否支持流式加载 */
  streamable: boolean;
}

/**
 * 模型数据接口
 */
export interface ModelData {
  /** 模型ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型类型 */
  type: 'planet' | 'spacecraft' | 'instrument' | 'structure';
  /** 文件URL */
  url: string;
  /** 文件格式 */
  format: 'gltf' | 'glb' | 'obj' | 'fbx';
  /** 文件大小 (bytes) */
  fileSize: number;
  /** 顶点数量 */
  vertexCount: number;
  /** 三角形数量 */
  triangleCount: number;
  /** LOD级别 */
  lodLevels: {
    distance: number;
    url: string;
    vertexCount: number;
  }[];
  /** 材质信息 */
  materials: {
    name: string;
    textures: string[];
  }[];
  /** 动画信息 */
  animations?: {
    name: string;
    duration: number;
    type: 'rotation' | 'translation' | 'scale' | 'morph';
  }[];
}

/**
 * 数据管理器接口
 */
export interface DataManager {
  /** 天体数据加载器 */
  celestialLoader: DataLoader<CelestialBody[]>;
  /** 纹理加载器 */
  textureLoader: DataLoader<TextureData>;
  /** 模型加载器 */
  modelLoader: DataLoader<ModelData>;
  /** 缓存管理器 */
  cacheManager: {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttl?: number): void;
    delete(key: string): boolean;
    clear(): void;
    getStats(): CacheStats;
  };
  
  /** 加载尺度数据 */
  loadScaleData(scale: ScaleLevel, config?: Partial<DataLoadConfig>): Promise<CelestialBody[]>;
  /** 预加载相邻尺度 */
  preloadAdjacentScales(currentScale: ScaleLevel): Promise<void>;
  /** 获取实时数据 */
  getRealTimeData(): Promise<RealTimeData>;
  /** 获取中国古代天文数据 */
  getChineseAstronomyData(): Promise<ChineseAstronomyData>;
  /** 清理过期数据 */
  cleanup(): void;
  /** 获取数据统计 */
  getDataStats(): {
    totalItems: number;
    totalSize: number;
    cacheStats: CacheStats;
    loadingTasks: number;
  };
}
