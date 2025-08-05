/**
 * 3D组件导出文件
 * 统一导出所有3D相关组件
 */

// 基础3D组件
export { Canvas3D } from './Canvas3D';
export { BasicSphere } from './BasicSphere';
export { SolarSystemDemo } from './SolarSystemDemo';
export { InteractiveSolarSystem } from './InteractiveSolarSystem';

// 增强3D组件
export { EnhancedCanvas3D } from './EnhancedCanvas3D';
export { OptimizedCanvas3D } from './OptimizedCanvas3D';
export { SceneManager } from './SceneManager';
export { CameraController } from './CameraController';
export { LightingSystem } from './LightingSystem';
export { PerformanceMonitor } from './PerformanceMonitor';

// 渲染优化组件
export { RenderOptimizer } from './RenderOptimizer';
export { FrameRateController } from './FrameRateController';
export { MemoryManager, useMemoryManager } from './MemoryManager';

// 交互组件
export { InteractionManager } from './InteractionManager';
export { InteractiveObject } from './InteractiveObject';

// 导出默认组件
export { default as Canvas3DDefault } from './Canvas3D';
export { default as BasicSphereDefault } from './BasicSphere';
export { default as SolarSystemDemoDefault } from './SolarSystemDemo';
export { default as InteractiveSolarSystemDefault } from './InteractiveSolarSystem';
export { default as EnhancedCanvas3DDefault } from './EnhancedCanvas3D';
export { default as OptimizedCanvas3DDefault } from './OptimizedCanvas3D';
export { default as SceneManagerDefault } from './SceneManager';
export { default as CameraControllerDefault } from './CameraController';
export { default as LightingSystemDefault } from './LightingSystem';
export { default as PerformanceMonitorDefault } from './PerformanceMonitor';
export { default as RenderOptimizerDefault } from './RenderOptimizer';
export { default as FrameRateControllerDefault } from './FrameRateController';
export { default as MemoryManagerDefault } from './MemoryManager';
export { default as InteractionManagerDefault } from './InteractionManager';
export { default as InteractiveObjectDefault } from './InteractiveObject';

// 重新导出类型
export type { Canvas3DProps } from './Canvas3D';
export type { BasicSphereProps } from './BasicSphere';
export type { SolarSystemDemoProps } from './SolarSystemDemo';
export type { InteractiveSolarSystemProps } from './InteractiveSolarSystem';
export type { EnhancedCanvas3DProps } from './EnhancedCanvas3D';
export type { OptimizedCanvas3DProps } from './OptimizedCanvas3D';
export type { SceneManagerProps } from './SceneManager';
export type { CameraControllerProps } from './CameraController';
export type { LightingSystemProps } from './LightingSystem';
export type { PerformanceMonitorProps } from './PerformanceMonitor';
export type { RenderOptimizerProps } from './RenderOptimizer';
export type { FrameRateControllerProps } from './FrameRateController';
export type { MemoryManagerProps } from './MemoryManager';
export type { InteractionManagerProps, InteractionEvent } from './InteractionManager';
export type { InteractiveObjectProps } from './InteractiveObject';
