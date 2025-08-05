/**
 * 天体相关类型定义
 * 定义宇宙中各种天体的数据结构和属性
 */

import type { BufferGeometry, Material, Texture } from 'three';

/**
 * 尺度级别枚举 - 支持25个数量级的缩放
 */
export enum ScaleLevel {
  // 微观尺度
  ATOMIC = 'atomic',           // 10^-15 m (原子核)
  MOLECULAR = 'molecular',     // 10^-9 m (分子)
  CELLULAR = 'cellular',       // 10^-6 m (细胞)
  
  // 宏观尺度
  TERRESTRIAL = 'terrestrial', // 10^0 m (地表)
  ATMOSPHERIC = 'atmospheric', // 10^4 m (大气层)
  PLANETARY = 'planetary',     // 10^7 m (行星)
  
  // 太阳系尺度
  SOLAR_SYSTEM = 'solar_system', // 10^12 m (太阳系)
  KUIPER_BELT = 'kuiper_belt',   // 10^13 m (柯伊伯带)
  OORT_CLOUD = 'oort_cloud',     // 10^15 m (奥尔特云)
  
  // 恒星际尺度
  STELLAR = 'stellar',         // 10^16 m (恒星际)
  LOCAL_BUBBLE = 'local_bubble', // 10^18 m (本地泡)
  
  // 银河系尺度
  GALACTIC = 'galactic',       // 10^21 m (银河系)
  LOCAL_GROUP = 'local_group', // 10^23 m (本地星系群)
  
  // 宇宙尺度
  COSMIC = 'cosmic',           // 10^26 m (可观测宇宙)
}

/**
 * 天体类型枚举
 */
export enum CelestialBodyType {
  // 恒星类
  STAR = 'star',
  NEUTRON_STAR = 'neutron_star',
  BLACK_HOLE = 'black_hole',
  WHITE_DWARF = 'white_dwarf',
  
  // 行星类
  PLANET = 'planet',
  DWARF_PLANET = 'dwarf_planet',
  MOON = 'moon',
  ASTEROID = 'asteroid',
  COMET = 'comet',
  
  // 深空天体
  NEBULA = 'nebula',
  GALAXY = 'galaxy',
  GALAXY_CLUSTER = 'galaxy_cluster',
  QUASAR = 'quasar',
  
  // 人造天体
  SPACECRAFT = 'spacecraft',
  SPACE_STATION = 'space_station',
  SATELLITE = 'satellite',
}

/**
 * 3D向量类型（兼容Three.js）
 */
export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

/**
 * 欧拉角类型（兼容Three.js）
 */
export interface EulerData {
  x: number;
  y: number;
  z: number;
  order?: 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY';
}

/**
 * 轨道数据接口
 */
export interface OrbitData {
  /** 半长轴 (AU) */
  semiMajorAxis: number;
  /** 偏心率 */
  eccentricity: number;
  /** 轨道倾角 (度) */
  inclination: number;
  /** 升交点黄经 (度) */
  longitudeOfAscendingNode: number;
  /** 近日点幅角 (度) */
  argumentOfPeriapsis: number;
  /** 平近点角 (度) */
  meanAnomaly: number;
  /** 轨道周期 (天) */
  period: number;
  /** 参考历元 */
  epoch: Date;
}

/**
 * 中华文化信息接口
 */
export interface CulturalInfo {
  /** 中国古代星座名称 */
  chineseConstellation?: string;
  /** 二十八宿归属 */
  twentyEightMansions?: string;
  /** 三垣归属 */
  threeEnclosures?: string;
  /** 传统名称 */
  traditionalName?: string;
  /** 神话传说 */
  mythology?: string;
  /** 历史观测记录 */
  historicalRecords?: string[];
  /** 文化意义 */
  culturalSignificance?: string;
  /** 古代星等 */
  ancientMagnitude?: number;
}

/**
 * 物理属性接口
 */
export interface PhysicalProperties {
  /** 质量 (kg) */
  mass: number;
  /** 半径 (m) */
  radius: number;
  /** 密度 (kg/m³) */
  density?: number;
  /** 表面温度 (K) */
  temperature?: number;
  /** 光度 (W) */
  luminosity?: number;
  /** 视星等 */
  apparentMagnitude?: number;
  /** 绝对星等 */
  absoluteMagnitude?: number;
  /** 光谱类型 */
  spectralType?: string;
}

/**
 * 渲染属性接口
 */
export interface RenderProperties {
  /** 几何体 */
  geometry?: BufferGeometry;
  /** 材质 */
  material?: Material;
  /** 纹理 */
  texture?: Texture;
  /** 法线贴图 */
  normalMap?: Texture;
  /** 高度图 */
  heightMap?: Texture;
  /** 发光贴图 */
  emissiveMap?: Texture;
  /** 渲染优先级 */
  renderPriority: number;
  /** 是否可见 */
  visible: boolean;
  /** 透明度 */
  opacity: number;
}

/**
 * LOD级别接口
 */
export interface LODLevel {
  /** 距离阈值 */
  distance: number;
  /** 多边形数量 */
  polygons: number;
  /** 纹理分辨率 */
  textureResolution: number;
  /** 几何体引用 */
  geometry?: BufferGeometry;
  /** 材质引用 */
  material?: Material;
}

/**
 * 天体核心接口
 */
export interface CelestialBody {
  /** 唯一标识符 */
  id: string;
  /** 英文名称 */
  name: string;
  /** 中文名称 */
  chineseName?: string;
  /** 天体类型 */
  type: CelestialBodyType;
  /** 适用的尺度级别 */
  scaleLevel: ScaleLevel;
  
  // 位置和运动
  /** 当前位置 */
  position: Vector3Data;
  /** 旋转角度 */
  rotation: EulerData;
  /** 缩放比例 */
  scale: Vector3Data;
  /** 速度向量 */
  velocity?: Vector3Data;
  
  // 物理属性
  /** 物理属性 */
  physicalProperties: PhysicalProperties;
  /** 轨道数据 */
  orbit?: OrbitData;
  
  // 文化信息
  /** 中华文化信息 */
  culturalInfo?: CulturalInfo;
  
  // 渲染属性
  /** 渲染属性 */
  renderProperties: RenderProperties;
  /** LOD级别 */
  lodLevels: LODLevel[];
  
  // 关系
  /** 父天体ID */
  parentId?: string;
  /** 子天体ID列表 */
  childrenIds: string[];
  
  // 元数据
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 数据来源 */
  dataSource: string;
  /** 数据版本 */
  version: string;
}

/**
 * 天体集合接口
 */
export interface CelestialBodyCollection {
  /** 集合ID */
  id: string;
  /** 集合名称 */
  name: string;
  /** 集合描述 */
  description: string;
  /** 天体列表 */
  bodies: CelestialBody[];
  /** 适用尺度 */
  scaleLevel: ScaleLevel;
  /** 边界框 */
  boundingBox: {
    min: Vector3Data;
    max: Vector3Data;
  };
}

/**
 * 天体查询参数接口
 */
export interface CelestialBodyQuery {
  /** 尺度级别 */
  scaleLevel?: ScaleLevel;
  /** 天体类型 */
  type?: CelestialBodyType[];
  /** 搜索关键词 */
  keyword?: string;
  /** 位置范围 */
  positionRange?: {
    center: Vector3Data;
    radius: number;
  };
  /** 物理属性过滤 */
  physicalFilter?: {
    massRange?: [number, number];
    radiusRange?: [number, number];
    temperatureRange?: [number, number];
  };
  /** 分页参数 */
  pagination?: {
    page: number;
    limit: number;
  };
  /** 排序参数 */
  sort?: {
    field: keyof CelestialBody;
    order: 'asc' | 'desc';
  };
}

/**
 * 天体查询结果接口
 */
export interface CelestialBodyQueryResult {
  /** 查询结果 */
  data: CelestialBody[];
  /** 总数量 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 查询参数 */
  query: CelestialBodyQuery;
  /** 查询时间 */
  timestamp: Date;
}
