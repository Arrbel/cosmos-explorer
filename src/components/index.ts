/**
 * 组件库导出文件
 * 统一导出所有UI组件
 */

// 基础组件
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Loading } from './Loading';
export { Progress } from './Progress';

// 布局组件
export { Panel } from './Panel';
export { Sidebar } from './Sidebar';
export { Layout } from './Layout';
export { Header } from './Header';
export { Navigation } from './Navigation';

// 响应式组件
export { ResponsiveContainer } from './ResponsiveContainer';
export { ResponsiveGrid } from './ResponsiveGrid';
export { ResponsiveShow } from './ResponsiveShow';

// 主题组件
export { ThemeSelector } from './ThemeSelector';

// 3D组件
export {
  Canvas3D,
  BasicSphere,
  SolarSystemDemo,
  InteractiveSolarSystem,
  EnhancedCanvas3D,
  OptimizedCanvas3D,
  SceneManager,
  CameraController,
  LightingSystem,
  PerformanceMonitor,
  RenderOptimizer,
  FrameRateController,
  MemoryManager,
  InteractionManager,
  InteractiveObject
} from './3d';

// 尺度系统组件
export {
  ScaleManager,
  useScaleManager,
  ScaleNavigator,
  ScaleVisualizer,
  MultiScaleDemo
} from './scale';

// 导出默认组件
export { default as ButtonDefault } from './Button';
export { default as InputDefault } from './Input';
export { default as ModalDefault } from './Modal';
export { default as LoadingDefault } from './Loading';
export { default as ProgressDefault } from './Progress';
export { default as PanelDefault } from './Panel';
export { default as SidebarDefault } from './Sidebar';
export { default as LayoutDefault } from './Layout';
export { default as HeaderDefault } from './Header';
export { default as NavigationDefault } from './Navigation';
export { default as ResponsiveContainerDefault } from './ResponsiveContainer';
export { default as ResponsiveGridDefault } from './ResponsiveGrid';
export { default as ResponsiveShowDefault } from './ResponsiveShow';
export { default as ThemeSelectorDefault } from './ThemeSelector';
export {
  Canvas3DDefault,
  BasicSphereDefault,
  SolarSystemDemoDefault,
  InteractiveSolarSystemDefault,
  EnhancedCanvas3DDefault,
  OptimizedCanvas3DDefault,
  SceneManagerDefault,
  CameraControllerDefault,
  LightingSystemDefault,
  PerformanceMonitorDefault,
  RenderOptimizerDefault,
  FrameRateControllerDefault,
  MemoryManagerDefault,
  InteractionManagerDefault,
  InteractiveObjectDefault
} from './3d';
export {
  ScaleManagerDefault,
  ScaleNavigatorDefault,
  ScaleVisualizerDefault,
  MultiScaleDemoDefault
} from './scale';

// 重新导出类型
export type { ButtonProps, InputProps, ModalProps, PanelProps } from '@/types/ui';
export type { LoadingProps } from './Loading';
export type { ProgressProps } from './Progress';
export type { SidebarProps } from './Sidebar';
export type { LayoutProps } from './Layout';
export type { HeaderProps } from './Header';
export type { NavigationProps, NavigationItem } from './Navigation';
export type { ResponsiveContainerProps } from './ResponsiveContainer';
export type { ResponsiveGridProps } from './ResponsiveGrid';
export type { ResponsiveShowProps } from './ResponsiveShow';
export type { ThemeSelectorProps } from './ThemeSelector';
export type {
  Canvas3DProps,
  BasicSphereProps,
  SolarSystemDemoProps,
  InteractiveSolarSystemProps,
  EnhancedCanvas3DProps,
  OptimizedCanvas3DProps,
  SceneManagerProps,
  CameraControllerProps,
  LightingSystemProps,
  PerformanceMonitorProps,
  RenderOptimizerProps,
  FrameRateControllerProps,
  MemoryManagerProps,
  InteractionManagerProps,
  InteractionEvent,
  InteractiveObjectProps
} from './3d';
export type {
  ScaleManagerProps,
  ScaleNavigatorProps,
  ScaleVisualizerProps,
  MultiScaleDemoProps
} from './scale';
