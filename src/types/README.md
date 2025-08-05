# 类型定义文档

## 概述

本目录包含了宇宙探索者项目的完整TypeScript类型定义，为整个应用提供类型安全保障。

## 文件结构

```
src/types/
├── celestial.ts      # 天体相关类型定义
├── engine.ts         # 3D引擎相关类型定义
├── ui.ts            # 用户界面相关类型定义
├── data.ts          # 数据管理相关类型定义
├── utils.ts         # 工具类型定义
├── index.ts         # 类型导出入口
├── examples.ts      # 类型使用示例
├── README.md        # 本文档
└── __tests__/       # 类型测试文件
    ├── celestial.test.ts
    └── engine.test.ts
```

## 核心类型模块

### 1. 天体类型 (celestial.ts)

定义了宇宙中各种天体的数据结构：

- **ScaleLevel**: 25个数量级的尺度枚举
- **CelestialBodyType**: 天体类型枚举
- **CelestialBody**: 天体核心接口
- **OrbitData**: 轨道数据接口
- **CulturalInfo**: 中华文化信息接口
- **PhysicalProperties**: 物理属性接口

#### 主要特性
- 支持从原子尺度到可观测宇宙的25个数量级
- 完整的天体物理属性定义
- 中华古代天文文化信息集成
- LOD (细节层次) 系统支持

### 2. 3D引擎类型 (engine.ts)

定义了3D渲染引擎的核心接口：

- **CameraState**: 相机状态接口
- **SceneState**: 场景状态接口
- **AnimationConfig**: 动画配置接口
- **TransitionConfig**: 过渡动画配置
- **PerformanceMetrics**: 性能监控指标

#### 主要特性
- 多尺度相机管理
- 平滑过渡动画系统
- 性能监控和优化
- 用户输入处理

### 3. 用户界面类型 (ui.ts)

定义了UI组件和状态管理类型：

- **AppState**: 应用全局状态
- **UserPreferences**: 用户偏好设置
- **UIState**: 界面状态
- **TimeControlState**: 时间控制状态
- **组件属性接口**: Button, Panel, Modal等

#### 主要特性
- 完整的状态管理类型
- 多语言和主题支持
- 响应式组件属性
- 学习进度追踪

### 4. 数据管理类型 (data.ts)

定义了数据加载、缓存和API接口：

- **DataLoader**: 数据加载器接口
- **CacheManager**: 缓存管理接口
- **APIResponse**: API响应格式
- **ChineseAstronomyData**: 中国古代天文数据

#### 主要特性
- 分层数据加载策略
- 智能缓存管理
- 实时数据更新
- 中华文化数据集成

### 5. 工具类型 (utils.ts)

提供通用的TypeScript工具类型：

- **DeepPartial**: 深度可选类型
- **Optional**: 可选属性类型
- **KeysOfType**: 类型键提取
- **PathValue**: 路径值类型

## 使用示例

### 创建天体对象

```typescript
import { CelestialBodyType, ScaleLevel } from '@/types';
import type { CelestialBody } from '@/types';

const earth: CelestialBody = {
  id: 'earth',
  name: 'Earth',
  chineseName: '地球',
  type: CelestialBodyType.PLANET,
  scaleLevel: ScaleLevel.PLANETARY,
  // ... 其他属性
};
```

### 配置动画

```typescript
import { EasingType } from '@/types';
import type { AnimationConfig } from '@/types';

const rotationAnimation: AnimationConfig = {
  id: 'earth-rotation',
  target: earth,
  duration: 24 * 60 * 60 * 1000, // 24小时
  easing: EasingType.LINEAR,
  loop: true,
  // ... 其他配置
};
```

### 管理应用状态

```typescript
import type { AppState } from '@/types';

const initialState: AppState = {
  currentView: {
    scale: ScaleLevel.SOLAR_SYSTEM,
    target: null,
    cameraState: defaultCameraState
  },
  // ... 其他状态
};
```

## 类型安全特性

### 1. 严格的类型检查
- 启用TypeScript严格模式
- 所有属性都有明确的类型定义
- 支持类型推断和自动补全

### 2. 枚举类型安全
- 使用字符串枚举确保类型安全
- 避免魔法字符串和数字
- 支持编译时检查

### 3. 接口组合
- 使用接口继承和组合
- 避免重复定义
- 保持类型一致性

### 4. 泛型支持
- 数据加载器支持泛型
- API响应类型参数化
- 灵活的工具类型

## 测试覆盖

### 单元测试
- 类型定义正确性验证
- 枚举值完整性检查
- 接口结构验证
- 类型兼容性测试

### 集成测试
- 类型使用示例验证
- 复杂对象创建测试
- 类型守卫功能测试

## 性能考虑

### 1. 类型优化
- 避免过度复杂的类型计算
- 使用简化的路径类型
- 优化编译时间

### 2. 内存效率
- 合理的接口设计
- 避免不必要的类型嵌套
- 支持按需加载

## 扩展指南

### 添加新的天体类型
1. 在 `CelestialBodyType` 枚举中添加新类型
2. 更新相关的类型守卫函数
3. 添加对应的测试用例

### 扩展尺度级别
1. 在 `ScaleLevel` 枚举中添加新尺度
2. 更新 `SCALE_CONSTANTS` 中的尺度大小
3. 调整相关的LOD配置

### 新增UI组件类型
1. 在 `ui.ts` 中定义组件属性接口
2. 继承 `BaseComponentProps`
3. 添加组件特定的属性

## 最佳实践

### 1. 命名规范
- 接口使用PascalCase
- 枚举使用PascalCase
- 类型别名使用PascalCase
- 属性使用camelCase

### 2. 文档注释
- 所有公共接口都有JSDoc注释
- 重要属性包含单位说明
- 复杂类型提供使用示例

### 3. 版本控制
- 重大类型变更需要版本号更新
- 保持向后兼容性
- 提供迁移指南

## 常见问题

### Q: 如何处理Three.js类型兼容性？
A: 我们定义了自己的Vector3Data、EulerData等接口，与Three.js类型兼容但更灵活。

### Q: 为什么使用字符串枚举？
A: 字符串枚举提供更好的调试体验和序列化支持，适合Web应用。

### Q: 如何确保类型定义的正确性？
A: 通过完整的单元测试和类型使用示例来验证类型定义的正确性。

## 贡献指南

1. 修改类型定义前先添加测试用例
2. 确保所有测试通过
3. 更新相关文档
4. 遵循现有的命名和结构规范
