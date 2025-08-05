/**
 * 类型使用示例
 * 展示如何使用项目中定义的各种类型
 */

import {
  ScaleLevel,
  CelestialBodyType,
  EasingType,
  Theme,
  Language,
  PanelType,
  LoadingState
} from './index';

import type {
  CelestialBody,
  CameraState,
  AnimationConfig,
  UserPreferences,
  AppState,
  PerformanceMetrics
} from './index';

/**
 * 创建地球天体对象示例
 */
export const createEarthExample = (): CelestialBody => {
  return {
    id: 'earth',
    name: 'Earth',
    chineseName: '地球',
    type: CelestialBodyType.PLANET,
    scaleLevel: ScaleLevel.PLANETARY,
    
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    velocity: { x: 0, y: 0, z: 29780 }, // 地球公转速度 m/s
    
    physicalProperties: {
      mass: 5.97237e24, // kg
      radius: 6371000,  // m
      density: 5514,    // kg/m³
      temperature: 288, // K
      apparentMagnitude: -3.99,
      absoluteMagnitude: -3.99
    },
    
    orbit: {
      semiMajorAxis: 1.0, // AU
      eccentricity: 0.0167,
      inclination: 0.0,
      longitudeOfAscendingNode: 0.0,
      argumentOfPeriapsis: 102.9,
      meanAnomaly: 100.5,
      period: 365.25,
      epoch: new Date('2000-01-01T12:00:00Z')
    },
    
    culturalInfo: {
      chineseConstellation: '地球',
      traditionalName: '地',
      culturalSignificance: '人类的家园，万物生长的摇篮'
    },
    
    renderProperties: {
      renderPriority: 1,
      visible: true,
      opacity: 1.0
    },
    
    lodLevels: [
      {
        distance: 0,
        polygons: 100000,
        textureResolution: 4096
      },
      {
        distance: 10000,
        polygons: 50000,
        textureResolution: 2048
      },
      {
        distance: 100000,
        polygons: 10000,
        textureResolution: 1024
      }
    ],
    
    childrenIds: ['moon'],
    
    createdAt: new Date(),
    updatedAt: new Date(),
    dataSource: 'NASA JPL',
    version: '1.0.0'
  };
};

/**
 * 创建相机状态示例
 */
export const createCameraStateExample = (): CameraState => {
  return {
    position: { x: 0, y: 0, z: 10000 },
    rotation: { x: 0, y: 0, z: 0 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
    target: { x: 0, y: 0, z: 0 },
    fov: 75,
    near: 0.1,
    far: 1000000,
    zoom: 1,
    scaleLevel: ScaleLevel.PLANETARY
  };
};

/**
 * 创建动画配置示例
 */
export const createAnimationExample = (): AnimationConfig => {
  const earth = createEarthExample();
  
  return {
    id: 'earth-rotation',
    target: earth,
    keyframes: [
      {
        time: 0,
        rotation: { x: 0, y: 0, z: 0 }
      },
      {
        time: 1,
        rotation: { x: 0, y: Math.PI * 2, z: 0 }
      }
    ],
    duration: 24 * 60 * 60 * 1000, // 24小时
    easing: EasingType.LINEAR,
    loop: true,
    delay: 0
  };
};

/**
 * 创建用户偏好示例
 */
export const createUserPreferencesExample = (): UserPreferences => {
  return {
    language: Language.ZH_CN,
    theme: Theme.COSMIC,
    showChineseNames: true,
    showTraditionalConstellations: true,
    showOrbits: true,
    showLabels: true,
    performanceMode: 'auto',
    soundEnabled: true,
    volume: 0.7,
    autoSave: true,
    keyboardShortcuts: {
      'zoom_in': 'KeyW',
      'zoom_out': 'KeyS',
      'rotate_left': 'KeyA',
      'rotate_right': 'KeyD',
      'reset_view': 'KeyR',
      'toggle_ui': 'KeyH'
    },
    mouseSensitivity: 1.0,
    touchSensitivity: 1.2
  };
};

/**
 * 创建性能指标示例
 */
export const createPerformanceMetricsExample = (): PerformanceMetrics => {
  return {
    fps: 60,
    renderTime: 16.67,
    memoryUsage: 256,
    drawCalls: 150,
    triangles: 75000,
    geometries: 25,
    textures: 12,
    gpuMemory: 128,
    timestamp: new Date()
  };
};

/**
 * 创建应用状态示例
 */
export const createAppStateExample = (): AppState => {
  const earth = createEarthExample();
  const cameraState = createCameraStateExample();
  const userPreferences = createUserPreferencesExample();
  const performanceMetrics = createPerformanceMetricsExample();
  
  return {
    currentView: {
      scale: ScaleLevel.PLANETARY,
      target: earth,
      cameraState
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
        { label: '1年', value: 31536000, unit: 'second' }
      ],
      currentTimeStep: 86400
    },
    
    uiState: {
      showUI: true,
      activePanel: PanelType.CELESTIAL_INFO,
      isFullscreen: false,
      isImmersiveMode: false,
      loadingState: LoadingState.IDLE,
      loadingProgress: 0,
      loadingMessage: '',
      errorMessage: null,
      notifications: [],
      sidebarExpanded: true,
      bottomPanelExpanded: false,
      selectedCelestialBody: earth,
      searchResults: [],
      searchQuery: '',
      showSearchSuggestions: false
    },
    
    userPreferences,
    
    bookmarks: [
      {
        id: 'earth-view',
        name: '地球视角',
        description: '从太空看地球的经典视角',
        cameraState,
        targetId: 'earth',
        scaleLevel: ScaleLevel.PLANETARY,
        createdAt: new Date(),
        tags: ['地球', '经典视角'],
        thumbnail: '/thumbnails/earth-view.jpg'
      }
    ],
    
    learningProgress: {
      userId: 'user-123',
      completedLessons: ['solar-system-basics', 'planet-formation'],
      currentLesson: 'stellar-evolution',
      overallProgress: 35,
      achievements: ['first-exploration', 'solar-system-master'],
      studyTime: 120, // 分钟
      quizScores: {
        'solar-system-quiz': 85,
        'planet-quiz': 92
      },
      lastStudyTime: new Date()
    },
    
    dataState: {
      loadedScales: new Set([ScaleLevel.PLANETARY, ScaleLevel.SOLAR_SYSTEM]),
      celestialBodies: new Map([['earth', earth]]),
      textures: new Map([
        ['earth-diffuse', '/textures/earth-diffuse.jpg'],
        ['earth-normal', '/textures/earth-normal.jpg']
      ]),
      models: new Map([
        ['earth-model', '/models/earth.glb']
      ])
    },
    
    performanceState: {
      currentMetrics: performanceMetrics,
      metricsHistory: [performanceMetrics],
      autoAdjustQuality: true,
      targetFPS: 60
    }
  };
};

/**
 * 类型守卫示例
 */
export const isCelestialBodyPlanet = (body: CelestialBody): boolean => {
  return body.type === CelestialBodyType.PLANET;
};

export const isCelestialBodyStar = (body: CelestialBody): boolean => {
  return body.type === CelestialBodyType.STAR;
};

/**
 * 类型转换示例
 */
export const celestialBodyToDisplayName = (body: CelestialBody, showChinese: boolean): string => {
  if (showChinese && body.chineseName) {
    return `${body.chineseName} (${body.name})`;
  }
  return body.name;
};

/**
 * 类型验证示例
 */
export const validateCelestialBody = (body: Partial<CelestialBody>): body is CelestialBody => {
  return !!(
    body.id &&
    body.name &&
    body.type &&
    body.scaleLevel &&
    body.position &&
    body.rotation &&
    body.scale &&
    body.physicalProperties &&
    body.renderProperties &&
    body.lodLevels &&
    body.childrenIds &&
    body.createdAt &&
    body.updatedAt &&
    body.dataSource &&
    body.version
  );
};
