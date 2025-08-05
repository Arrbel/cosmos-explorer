/**
 * 3D引擎相关类型定义
 * 定义3D渲染引擎的核心接口和类型
 */

import type {
  Scene,
  Camera,
  PerspectiveCamera,
  WebGLRenderer,
  Object3D
} from 'three';
import type { ScaleLevel, CelestialBody, Vector3Data, EulerData } from './celestial';

/**
 * 相机类型枚举
 */
export enum CameraType {
  PERSPECTIVE = 'perspective',
  ORTHOGRAPHIC = 'orthographic',
}

/**
 * 渲染质量级别
 */
export enum RenderQuality {
  ULTRA_LOW = 'ultra_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA_HIGH = 'ultra_high',
}

/**
 * 动画缓动类型
 */
export enum EasingType {
  LINEAR = 'linear',
  EASE_IN = 'easeIn',
  EASE_OUT = 'easeOut',
  EASE_IN_OUT = 'easeInOut',
  EASE_IN_CUBIC = 'easeInCubic',
  EASE_OUT_CUBIC = 'easeOutCubic',
  EASE_IN_OUT_CUBIC = 'easeInOutCubic',
  EASE_IN_QUART = 'easeInQuart',
  EASE_OUT_QUART = 'easeOutQuart',
  EASE_IN_OUT_QUART = 'easeInOutQuart',
}

/**
 * 性能监控指标接口
 */
export interface PerformanceMetrics {
  /** 帧率 (FPS) */
  fps: number;
  /** 渲染时间 (ms) */
  renderTime: number;
  /** 内存使用 (MB) */
  memoryUsage: number;
  /** 绘制调用次数 */
  drawCalls: number;
  /** 三角形数量 */
  triangles: number;
  /** 几何体数量 */
  geometries: number;
  /** 纹理数量 */
  textures: number;
  /** GPU内存使用 (MB) */
  gpuMemory: number;
  /** 时间戳 */
  timestamp: Date;
}

/**
 * 四元数数据接口
 */
export interface QuaternionData {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * 相机状态接口
 */
export interface CameraState {
  /** 位置 */
  position: Vector3Data;
  /** 旋转 */
  rotation: EulerData;
  /** 四元数 */
  quaternion: QuaternionData;
  /** 目标点 */
  target: Vector3Data;
  /** 视野角度 */
  fov: number;
  /** 近裁剪面 */
  near: number;
  /** 远裁剪面 */
  far: number;
  /** 缩放级别 */
  zoom: number;
  /** 当前尺度 */
  scaleLevel: ScaleLevel;
}

/**
 * 场景状态接口
 */
export interface SceneState {
  /** 场景ID */
  id: string;
  /** 尺度级别 */
  scaleLevel: ScaleLevel;
  /** 是否激活 */
  active: boolean;
  /** 天体数量 */
  objectCount: number;
  /** 可见天体数量 */
  visibleObjectCount: number;
  /** 边界框 */
  boundingBox: {
    min: Vector3Data;
    max: Vector3Data;
  };
  /** 场景中心 */
  center: Vector3Data;
  /** 场景半径 */
  radius: number;
}

/**
 * 动画关键帧接口
 */
export interface AnimationKeyframe {
  /** 时间 (0-1) */
  time: number;
  /** 位置 */
  position?: Vector3Data;
  /** 旋转 */
  rotation?: EulerData;
  /** 缩放 */
  scale?: Vector3Data;
  /** 其他属性 */
  properties?: Record<string, any>;
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 动画ID */
  id: string;
  /** 目标对象 */
  target: Object3D | CelestialBody;
  /** 关键帧 */
  keyframes: AnimationKeyframe[];
  /** 持续时间 (ms) */
  duration: number;
  /** 缓动类型 */
  easing: EasingType;
  /** 是否循环 */
  loop: boolean;
  /** 延迟时间 (ms) */
  delay: number;
  /** 完成回调 */
  onComplete?: () => void;
  /** 更新回调 */
  onUpdate?: (progress: number) => void;
}

/**
 * 过渡动画配置接口
 */
export interface TransitionConfig {
  /** 起始状态 */
  from: CameraState;
  /** 目标状态 */
  to: CameraState;
  /** 持续时间 (ms) */
  duration: number;
  /** 缓动类型 */
  easing: EasingType;
  /** 过渡路径点 */
  waypoints?: Vector3Data[];
  /** 是否保持目标在视野中心 */
  keepTargetInView: boolean;
  /** 完成回调 */
  onComplete?: () => void;
  /** 进度回调 */
  onProgress?: (progress: number) => void;
}

/**
 * LOD配置接口
 */
export interface LODConfig {
  /** LOD级别定义 */
  levels: {
    /** 距离阈值 */
    distance: number;
    /** 几何体复杂度 */
    complexity: number;
    /** 纹理分辨率 */
    textureResolution: number;
  }[];
  /** 是否启用 */
  enabled: boolean;
  /** 更新频率 (ms) */
  updateInterval: number;
  /** 距离计算方法 */
  distanceCalculation: 'euclidean' | 'manhattan' | 'chebyshev';
}

/**
 * 渲染配置接口
 */
export interface RenderConfig {
  /** 渲染质量 */
  quality: RenderQuality;
  /** 抗锯齿 */
  antialias: boolean;
  /** 阴影 */
  shadows: boolean;
  /** 后处理效果 */
  postProcessing: boolean;
  /** 像素比 */
  pixelRatio: number;
  /** 背景颜色 */
  backgroundColor: string;
  /** 雾效 */
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  /** LOD配置 */
  lod: LODConfig;
}

/**
 * 输入事件类型
 */
export enum InputEventType {
  MOUSE_MOVE = 'mouseMove',
  MOUSE_DOWN = 'mouseDown',
  MOUSE_UP = 'mouseUp',
  MOUSE_WHEEL = 'mouseWheel',
  TOUCH_START = 'touchStart',
  TOUCH_MOVE = 'touchMove',
  TOUCH_END = 'touchEnd',
  KEY_DOWN = 'keyDown',
  KEY_UP = 'keyUp',
}

/**
 * 输入事件接口
 */
export interface InputEvent {
  /** 事件类型 */
  type: InputEventType;
  /** 鼠标/触摸位置 */
  position?: { x: number; y: number };
  /** 鼠标/触摸位置变化 */
  delta?: { x: number; y: number };
  /** 滚轮增量 */
  wheelDelta?: number;
  /** 按键代码 */
  keyCode?: string;
  /** 修饰键状态 */
  modifiers?: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
  /** 时间戳 */
  timestamp: number;
}

/**
 * 相机控制器接口
 */
export interface CameraController {
  /** 当前相机 */
  camera: PerspectiveCamera;
  /** 当前状态 */
  state: CameraState;
  /** 是否启用 */
  enabled: boolean;
  
  /** 设置目标 */
  setTarget(target: Vector3Data): void;
  /** 移动到位置 */
  moveTo(position: Vector3Data, duration?: number): Promise<void>;
  /** 看向目标 */
  lookAt(target: Vector3Data, duration?: number): Promise<void>;
  /** 跟随目标 */
  followTarget(target: CelestialBody, offset?: Vector3Data): void;
  /** 停止跟随 */
  stopFollowing(): void;
  /** 处理输入 */
  handleInput(event: InputEvent): void;
  /** 更新 */
  update(deltaTime: number): void;
  /** 保存状态 */
  saveState(): CameraState;
  /** 恢复状态 */
  restoreState(state: CameraState): void;
}

/**
 * 场景管理器接口
 */
export interface SceneManager {
  /** 当前场景 */
  currentScene: Scene;
  /** 所有场景 */
  scenes: Map<ScaleLevel, Scene>;
  /** 当前尺度 */
  currentScale: ScaleLevel;
  
  /** 切换到指定尺度 */
  transitionToScale(scale: ScaleLevel, duration?: number): Promise<void>;
  /** 添加天体 */
  addCelestialBody(body: CelestialBody): void;
  /** 移除天体 */
  removeCelestialBody(id: string): void;
  /** 获取天体 */
  getCelestialBody(id: string): CelestialBody | undefined;
  /** 更新LOD */
  updateLOD(cameraPosition: Vector3Data): void;
  /** 视锥体剔除 */
  frustumCulling(camera: Camera): void;
  /** 获取场景状态 */
  getSceneState(scale: ScaleLevel): SceneState;
}

/**
 * 动画系统接口
 */
export interface AnimationSystem {
  /** 活动动画 */
  activeAnimations: Map<string, AnimationConfig>;
  /** 是否暂停 */
  paused: boolean;
  
  /** 创建动画 */
  createAnimation(config: AnimationConfig): string;
  /** 播放动画 */
  playAnimation(id: string): void;
  /** 暂停动画 */
  pauseAnimation(id: string): void;
  /** 停止动画 */
  stopAnimation(id: string): void;
  /** 移除动画 */
  removeAnimation(id: string): void;
  /** 创建过渡动画 */
  createTransition(config: TransitionConfig): Promise<void>;
  /** 更新动画 */
  update(deltaTime: number): void;
  /** 清除所有动画 */
  clear(): void;
}

/**
 * 渲染引擎接口
 */
export interface RenderingEngine {
  /** 渲染器 */
  renderer: WebGLRenderer;
  /** 场景管理器 */
  sceneManager: SceneManager;
  /** 相机控制器 */
  cameraController: CameraController;
  /** 动画系统 */
  animationSystem: AnimationSystem;
  /** 渲染配置 */
  config: RenderConfig;
  /** 性能监控 */
  performanceMonitor: PerformanceMetrics;
  
  /** 初始化 */
  initialize(canvas: HTMLCanvasElement): void;
  /** 渲染一帧 */
  render(): void;
  /** 调整大小 */
  resize(width: number, height: number): void;
  /** 销毁 */
  dispose(): void;
  /** 获取性能指标 */
  getPerformanceMetrics(): PerformanceMetrics;
  /** 设置渲染质量 */
  setRenderQuality(quality: RenderQuality): void;
}
