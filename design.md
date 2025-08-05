# 宇宙主题交互式网站系统设计文档

## 项目概述

### 系统名称
宇宙探索者 (Cosmos Explorer) - 交互式3D宇宙可视化系统

### 设计目标
构建一个高性能、可扩展的Web 3D宇宙可视化平台，支持从原子尺度到可观测宇宙的无缝探索体验，融合现代天文学与中华古代天文文化。

## 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                      │
├─────────────────────────────────────────────────────────────┤
│  React组件  │  UI控制器  │  事件处理  │  状态管理(Zustand)    │
├─────────────────────────────────────────────────────────────┤
│                   3D渲染引擎层 (Rendering Layer)              │
├─────────────────────────────────────────────────────────────┤
│  Three.js核心 │ 场景管理器 │ 相机控制器 │ 动画系统 │ LOD管理   │
├─────────────────────────────────────────────────────────────┤
│                   数据管理层 (Data Layer)                     │
├─────────────────────────────────────────────────────────────┤
│  天体数据库  │  纹理管理  │  模型加载器 │ 缓存系统 │ API接口   │
├─────────────────────────────────────────────────────────────┤
│                   核心服务层 (Core Services)                  │
├─────────────────────────────────────────────────────────────┤
│  计算引擎   │  物理模拟  │  时间系统   │ 坐标转换 │ 性能监控   │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

#### 前端技术栈
- **框架**: React 18 + TypeScript 5.0+
- **3D引擎**: Three.js r160+
- **状态管理**: Zustand (轻量级，适合3D应用)
- **构建工具**: Vite 5.0+ (快速热重载)
- **样式**: Tailwind CSS + Styled Components
- **动画**: Framer Motion (UI动画) + Three.js Tween (3D动画)

#### 开发工具
- **包管理**: pnpm (性能优化)
- **代码质量**: ESLint + Prettier + Husky
- **测试**: Vitest + React Testing Library
- **类型检查**: TypeScript strict mode

#### 后端服务 (可选)
- **API服务**: Node.js + Fastify (高性能)
- **数据库**: PostgreSQL + Redis (缓存)
- **部署**: Docker + Kubernetes

## 系统组件设计

### 1. 3D渲染引擎架构

#### 核心渲染组件
```typescript
interface RenderingEngine {
  sceneManager: SceneManager;
  cameraController: CameraController;
  animationSystem: AnimationSystem;
  lodManager: LODManager;
  effectsComposer: EffectComposer;
}
```

#### 场景管理器 (SceneManager)
```typescript
class SceneManager {
  // 多尺度场景管理
  private scenes: Map<ScaleLevel, THREE.Scene>;
  private currentScale: ScaleLevel;
  
  // 场景切换
  async transitionToScale(targetScale: ScaleLevel, duration: number): Promise<void>;
  
  // 天体对象管理
  addCelestialBody(body: CelestialBody, scale: ScaleLevel): void;
  removeCelestialBody(id: string): void;
  
  // 性能优化
  cullInvisibleObjects(): void;
  updateLOD(cameraPosition: THREE.Vector3): void;
}
```

#### 相机控制器 (CameraController)
```typescript
class CameraController {
  // 多尺度相机管理
  private cameras: Map<ScaleLevel, THREE.PerspectiveCamera>;
  
  // 平滑过渡
  async smoothTransition(
    fromPosition: THREE.Vector3,
    toPosition: THREE.Vector3,
    duration: number,
    easing: EasingFunction
  ): Promise<void>;
  
  // 智能跟踪
  followTarget(target: CelestialBody, offset: THREE.Vector3): void;
  
  // 用户交互
  handleUserInput(input: UserInput): void;
}
```

### 2. 数据管理系统

#### 天体数据模型
```typescript
interface CelestialBody {
  id: string;
  name: string;
  chineseName?: string; // 中文名称
  type: CelestialBodyType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  
  // 物理属性
  mass: number;
  radius: number;
  
  // 轨道数据
  orbit?: OrbitData;
  
  // 渲染属性
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  texture?: THREE.Texture;
  
  // LOD级别
  lodLevels: LODLevel[];
  
  // 文化信息
  culturalInfo?: CulturalInfo;
}

interface CulturalInfo {
  chineseConstellation?: string; // 所属中国星座
  mythology?: string; // 神话传说
  historicalRecords?: string[]; // 历史观测记录
  traditionalName?: string; // 传统名称
}
```

#### 数据加载策略
```typescript
class DataManager {
  // 分层数据加载
  async loadScaleData(scale: ScaleLevel): Promise<CelestialBody[]>;
  
  // 渐进式纹理加载
  async loadTexture(url: string, priority: Priority): Promise<THREE.Texture>;
  
  // 缓存管理
  private cache: LRUCache<string, any>;
  
  // 预加载策略
  preloadAdjacentScales(currentScale: ScaleLevel): void;
}
```

### 3. 动画系统设计

#### 过渡动画管理器
```typescript
class TransitionManager {
  // 场景过渡
  async sceneTransition(
    fromScene: ScaleLevel,
    toScene: ScaleLevel,
    focusTarget?: CelestialBody
  ): Promise<void> {
    // 1. 准备目标场景
    await this.prepareTargetScene(toScene);
    
    // 2. 计算过渡路径
    const path = this.calculateTransitionPath(fromScene, toScene, focusTarget);
    
    // 3. 执行平滑过渡
    await this.executeTransition(path, {
      duration: this.getTransitionDuration(fromScene, toScene),
      easing: 'easeInOutCubic'
    });
    
    // 4. 清理源场景
    this.cleanupSourceScene(fromScene);
  }
  
  // 缓动函数
  private easingFunctions = {
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeOutQuart: (t: number) => 1 - (--t) * t * t * t
  };
}
```

#### 时间系统
```typescript
class TimeSystem {
  private currentTime: Date;
  private timeScale: number = 1; // 时间倍速
  private isPlaying: boolean = true;
  
  // 时间控制
  setTimeScale(scale: number): void;
  setCurrentTime(time: Date): void;
  play(): void;
  pause(): void;
  
  // 天体位置计算
  calculateCelestialPosition(body: CelestialBody, time: Date): THREE.Vector3;
  
  // 历史时间支持
  getHistoricalData(bodyId: string, timeRange: TimeRange): HistoricalData[];
}
```

### 4. 性能优化系统

#### LOD (Level of Detail) 管理
```typescript
class LODManager {
  // LOD级别定义
  private lodLevels = {
    ULTRA_HIGH: { distance: 0, polygons: 100000 },
    HIGH: { distance: 1000, polygons: 50000 },
    MEDIUM: { distance: 10000, polygons: 10000 },
    LOW: { distance: 100000, polygons: 1000 },
    ULTRA_LOW: { distance: 1000000, polygons: 100 }
  };
  
  // 动态LOD调整
  updateLOD(objects: CelestialBody[], cameraPosition: THREE.Vector3): void;
  
  // 视锥体剔除
  frustumCulling(camera: THREE.Camera, objects: CelestialBody[]): CelestialBody[];
  
  // 遮挡剔除
  occlusionCulling(objects: CelestialBody[]): CelestialBody[];
}
```

#### 内存管理
```typescript
class MemoryManager {
  // 纹理池管理
  private texturePool: Map<string, THREE.Texture>;
  
  // 几何体复用
  private geometryCache: Map<string, THREE.BufferGeometry>;
  
  // 垃圾回收
  cleanup(): void;
  
  // 内存监控
  getMemoryUsage(): MemoryStats;
}
```

## 数据流设计

### 数据流架构图

```
用户交互 → 事件处理器 → 状态管理器 → 3D渲染引擎
    ↓           ↓           ↓           ↓
  UI更新 ← 组件重渲染 ← 状态变更 ← 场景更新
    ↓
  性能监控 → 优化策略调整
```

### 状态管理设计

#### 全局状态结构
```typescript
interface AppState {
  // 当前视图状态
  currentView: {
    scale: ScaleLevel;
    target: CelestialBody | null;
    cameraPosition: THREE.Vector3;
    cameraRotation: THREE.Euler;
  };
  
  // 时间状态
  timeState: {
    currentTime: Date;
    timeScale: number;
    isPlaying: boolean;
  };
  
  // UI状态
  uiState: {
    showUI: boolean;
    activePanel: PanelType | null;
    isLoading: boolean;
    loadingProgress: number;
  };
  
  // 用户偏好
  userPreferences: {
    language: 'zh' | 'en';
    showChineseNames: boolean;
    showTraditionalConstellations: boolean;
    performanceMode: 'high' | 'medium' | 'low';
  };
  
  // 数据状态
  dataState: {
    loadedScales: Set<ScaleLevel>;
    celestialBodies: Map<string, CelestialBody>;
    textures: Map<string, THREE.Texture>;
  };
}
```

#### 状态更新流程
```typescript
// 使用Zustand进行状态管理
const useAppStore = create<AppState>((set, get) => ({
  // 场景切换
  transitionToScale: async (targetScale: ScaleLevel, target?: CelestialBody) => {
    set({ uiState: { ...get().uiState, isLoading: true } });
    
    try {
      await sceneManager.transitionToScale(targetScale);
      set({
        currentView: {
          scale: targetScale,
          target,
          cameraPosition: cameraController.getPosition(),
          cameraRotation: cameraController.getRotation()
        },
        uiState: { ...get().uiState, isLoading: false }
      });
    } catch (error) {
      // 错误处理
      set({ uiState: { ...get().uiState, isLoading: false } });
    }
  },
  
  // 时间控制
  setTimeScale: (scale: number) => {
    timeSystem.setTimeScale(scale);
    set({ timeState: { ...get().timeState, timeScale: scale } });
  }
}));
```

## API设计

### 天文数据API

#### 基础天体数据
```typescript
// GET /api/celestial-bodies?scale={scale}&region={region}
interface CelestialBodyResponse {
  data: CelestialBody[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  metadata: {
    scale: ScaleLevel;
    region: string;
    lastUpdated: string;
  };
}
```

#### 实时数据API
```typescript
// WebSocket: /ws/real-time-data
interface RealTimeUpdate {
  type: 'position_update' | 'new_discovery' | 'event_alert';
  data: {
    bodyId: string;
    position?: THREE.Vector3;
    velocity?: THREE.Vector3;
    timestamp: string;
  };
}
```

#### 中国古代天文数据API
```typescript
// GET /api/chinese-astronomy/constellations
interface ChineseConstellationResponse {
  data: {
    id: string;
    name: string;
    category: '三垣' | '二十八宿';
    stars: {
      id: string;
      traditionalName: string;
      modernName: string;
      position: THREE.Vector3;
    }[];
    culturalInfo: {
      mythology: string;
      historicalRecords: string[];
      significance: string;
    };
  }[];
}
```

### 用户数据API

#### 用户偏好设置
```typescript
// POST /api/user/preferences
interface UserPreferences {
  language: 'zh' | 'en';
  showChineseNames: boolean;
  showTraditionalConstellations: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  bookmarks: {
    id: string;
    name: string;
    scale: ScaleLevel;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    timestamp: string;
  }[];
}
```

## 性能优化策略

### 渲染优化

#### 1. 分层渲染策略
```typescript
class LayeredRenderer {
  // 背景层：星空背景、银河系
  private backgroundLayer: THREE.Scene;
  
  // 主要天体层：行星、恒星
  private mainLayer: THREE.Scene;
  
  // UI层：标签、界面元素
  private uiLayer: THREE.Scene;
  
  // 分层渲染
  render(camera: THREE.Camera): void {
    // 根据距离和重要性分层渲染
    this.renderLayer(this.backgroundLayer, camera, { priority: 'low' });
    this.renderLayer(this.mainLayer, camera, { priority: 'high' });
    this.renderLayer(this.uiLayer, camera, { priority: 'medium' });
  }
}
```

#### 2. 实例化渲染
```typescript
// 对于大量相似天体（如小行星），使用实例化渲染
class InstancedRenderer {
  private instancedMesh: THREE.InstancedMesh;
  
  // 批量渲染小行星
  renderAsteroids(asteroids: Asteroid[]): void {
    const count = asteroids.length;
    this.instancedMesh = new THREE.InstancedMesh(
      asteroidGeometry,
      asteroidMaterial,
      count
    );
    
    // 设置每个实例的变换矩阵
    asteroids.forEach((asteroid, index) => {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(asteroid.position);
      this.instancedMesh.setMatrixAt(index, matrix);
    });
  }
}
```

### 内存优化

#### 1. 纹理压缩和流式加载
```typescript
class TextureManager {
  // 纹理压缩格式支持
  private supportedFormats = {
    desktop: ['DXT', 'ETC2', 'ASTC'],
    mobile: ['ETC2', 'ASTC', 'PVRTC']
  };
  
  // 流式纹理加载
  async loadTextureStream(url: string, priority: number): Promise<THREE.Texture> {
    // 先加载低分辨率版本
    const lowRes = await this.loadTexture(`${url}_low.jpg`);
    
    // 后台加载高分辨率版本
    this.loadTexture(`${url}_high.jpg`).then(highRes => {
      // 平滑替换
      this.replaceTexture(lowRes, highRes);
    });
    
    return lowRes;
  }
}
```

#### 2. 几何体优化
```typescript
class GeometryOptimizer {
  // 几何体简化
  simplifyGeometry(geometry: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
    // 使用简化算法减少顶点数
    return SimplifyModifier.modify(geometry, ratio);
  }
  
  // 几何体压缩
  compressGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    // 使用Draco压缩
    return DRACOLoader.compress(geometry);
  }
}
```

### 移动端优化

#### 1. 自适应质量调整
```typescript
class AdaptiveQuality {
  private performanceMonitor = new PerformanceMonitor();
  
  // 根据设备性能调整渲染质量
  adjustQuality(): void {
    const fps = this.performanceMonitor.getCurrentFPS();
    const deviceTier = this.detectDeviceTier();
    
    if (fps < 30 || deviceTier === 'low') {
      this.applyLowQualitySettings();
    } else if (fps > 50 && deviceTier === 'high') {
      this.applyHighQualitySettings();
    }
  }
  
  private applyLowQualitySettings(): void {
    // 降低渲染分辨率
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    
    // 减少阴影质量
    renderer.shadowMap.type = THREE.BasicShadowMap;
    
    // 简化材质
    this.switchToBasicMaterials();
  }
}
```

## 部署架构

### 前端部署
```yaml
# Docker配置
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### CDN配置
```typescript
// 静态资源CDN配置
const CDN_CONFIG = {
  textures: 'https://cdn.cosmos-explorer.com/textures/',
  models: 'https://cdn.cosmos-explorer.com/models/',
  data: 'https://api.cosmos-explorer.com/data/'
};
```

### 监控和分析
```typescript
// 性能监控
class PerformanceMonitor {
  // FPS监控
  monitorFPS(): void;
  
  // 内存使用监控
  monitorMemory(): void;
  
  // 用户行为分析
  trackUserInteraction(event: UserEvent): void;
  
  // 错误监控
  captureError(error: Error): void;
}
```

这个系统设计文档提供了完整的技术架构和实现方案。接下来我将创建详细的开发任务清单。
