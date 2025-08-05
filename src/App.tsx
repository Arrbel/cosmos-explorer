import React, { useState } from 'react'
import { useAppStore, useTimeStore, useUIStore } from './stores'
import { ScaleLevel, PanelType, NotificationType } from './types'
import { Button, Input, Modal, Loading, Progress, Panel, Navigation, Header, ResponsiveContainer, ResponsiveGrid, ResponsiveShow, ThemeSelector, Canvas3D, SolarSystemDemo, EnhancedCanvas3D, OptimizedCanvas3D, InteractiveSolarSystem, MultiScaleDemo } from './components'
import type { NavigationItem } from './components'
import { useBreakpoint } from './hooks'
import { useTheme } from './contexts'

function App() {
  const [showDemo, setShowDemo] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [progress, setProgress] = useState(45)
  const [activeNavItem, setActiveNavItem] = useState('home')

  // 响应式断点检测
  const { breakpoint, width, isMobile, isTablet, isDesktop } = useBreakpoint()

  // 主题系统
  const { theme, themeName } = useTheme()

  // 导航数据
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: '首页',
      icon: <span>🏠</span>,
    },
    {
      id: 'explore',
      label: '探索宇宙',
      icon: <span>🌌</span>,
      children: [
        {
          id: 'solar-system',
          label: '太阳系',
          icon: <span>☀️</span>,
        },
        {
          id: 'deep-space',
          label: '深空天体',
          icon: <span>🌠</span>,
        },
        {
          id: 'constellations',
          label: '星座',
          icon: <span>⭐</span>,
        },
      ],
    },
    {
      id: 'culture',
      label: '中华天文',
      icon: <span>🏮</span>,
      children: [
        {
          id: 'star-officials',
          label: '二十八宿',
          icon: <span>🐉</span>,
        },
        {
          id: 'instruments',
          label: '古代仪器',
          icon: <span>🔭</span>,
        },
        {
          id: 'calendar',
          label: '传统历法',
          icon: <span>📅</span>,
        },
      ],
    },
    {
      id: 'learn',
      label: '学习中心',
      icon: <span>📚</span>,
    },
    {
      id: 'settings',
      label: '设置',
      icon: <span>⚙️</span>,
    },
  ]

  // 状态管理演示
  const currentScale = useAppStore(state => state.currentView.scale)
  const { setCurrentScale, addNotification } = useAppStore()

  const isPlaying = useTimeStore(state => state.isPlaying)
  const { togglePlay } = useTimeStore()

  const showUI = useUIStore(state => state.showUI)
  const { toggleUI, addNotification: addUINotification } = useUIStore()

  const handleScaleChange = (scale: ScaleLevel) => {
    setCurrentScale(scale)
    addNotification({
      type: NotificationType.INFO,
      title: '尺度切换',
      message: `已切换到 ${scale} 尺度`,
      closable: true,
    })
  }

  const handleTestNotification = () => {
    addUINotification({
      type: NotificationType.SUCCESS,
      title: '状态管理测试',
      message: `当前时间: ${new Date().toLocaleTimeString()}`,
      closable: true,
    })
  }

  if (!showDemo) {
    return (
      <div className="w-full h-full star-field flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text cosmic-gradient mb-4">
            宇宙探索者
          </h1>
          <h2 className="text-2xl text-gray-300 mb-8">
            Cosmos Explorer
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            交互式3D宇宙可视化平台正在构建中...
          </p>
          <button
            onClick={() => setShowDemo(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            查看状态管理演示
          </button>
          <div className="mt-8">
            <div className="inline-block animate-spin-slow">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            状态管理演示
          </h1>
          <button
            onClick={() => setShowDemo(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 返回主页
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 尺度控制 */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">尺度控制</h3>
            <p className="text-gray-300 mb-4">当前尺度: {currentScale}</p>
            <div className="space-y-2">
              {[ScaleLevel.PLANETARY, ScaleLevel.SOLAR_SYSTEM, ScaleLevel.STELLAR, ScaleLevel.GALACTIC].map(scale => (
                <button
                  key={scale}
                  onClick={() => handleScaleChange(scale)}
                  className={`w-full px-3 py-2 rounded text-left transition-colors ${
                    currentScale === scale
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>

          {/* 时间控制 */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">时间控制</h3>
            <p className="text-gray-300 mb-4">
              状态: {isPlaying ? '播放中' : '已暂停'}
            </p>
            <button
              onClick={togglePlay}
              className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? '暂停' : '播放'}
            </button>
          </div>

          {/* UI控制 */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">UI控制</h3>
            <p className="text-gray-300 mb-4">
              UI显示: {showUI ? '开启' : '关闭'}
            </p>
            <div className="space-y-2">
              <button
                onClick={toggleUI}
                className={`w-full px-4 py-2 rounded font-medium transition-colors ${
                  showUI
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                切换UI显示
              </button>
              <button
                onClick={handleTestNotification}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
              >
                测试通知
              </button>
            </div>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">当前状态信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-400 mb-2">视图状态</h4>
              <p>尺度: {currentScale}</p>
              <p>目标: {useAppStore.getState().currentView.target?.name || '无'}</p>
            </div>
            <div>
              <h4 className="font-medium text-green-400 mb-2">时间状态</h4>
              <p>播放: {isPlaying ? '是' : '否'}</p>
              <p>倍速: {useTimeStore.getState().timeScale}x</p>
            </div>
            <div>
              <h4 className="font-medium text-purple-400 mb-2">UI状态</h4>
              <p>显示: {showUI ? '是' : '否'}</p>
              <p>通知数: {useUIStore.getState().notifications.length}</p>
            </div>
          </div>
        </div>

        {/* 持久化测试 */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">持久化测试</h3>
          <p className="text-gray-300 mb-4">
            修改上面的设置后刷新页面，设置应该会被保存。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors"
          >
            刷新页面测试持久化
          </button>
        </div>

        {/* UI组件演示 */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">UI组件演示</h3>

          {/* 按钮演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-blue-400">按钮组件</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="danger">危险按钮</Button>
              <Button loading>加载中</Button>
              <Button icon={<span>🚀</span>}>带图标</Button>
            </div>
          </div>

          {/* 输入框演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-green-400">输入框组件</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="请输入文本"
                value={inputValue}
                onChange={setInputValue}
              />
              <Input
                type="password"
                placeholder="请输入密码"
              />
              <Input
                placeholder="限制长度"
                maxLength={20}
              />
              <Input
                placeholder="搜索..."
                type="search"
              />
            </div>
          </div>

          {/* 进度条演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-purple-400">进度条组件</h4>
            <div className="space-y-4">
              <Progress value={progress} label="基础进度条" showPercentage />
              <Progress value={75} color="green" label="成功进度" />
              <Progress value={30} color="yellow" label="警告进度" />
              <Progress value={90} color="cosmic" label="宇宙主题" animated />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                  -10%
                </Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                  +10%
                </Button>
              </div>
            </div>
          </div>

          {/* 加载器演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-yellow-400">加载器组件</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Loading type="spinner" text="旋转加载" />
              <Loading type="dots" text="点状加载" />
              <Loading type="pulse" text="脉冲加载" />
              <Loading type="cosmic" text="宇宙加载" />
            </div>
          </div>

          {/* 模态框演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-red-400">模态框组件</h4>
            <Button onClick={() => setShowModal(true)}>
              打开模态框
            </Button>
          </div>
        </div>

        {/* 布局组件演示 */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">布局组件演示</h3>

          {/* 头部组件演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-blue-400">头部组件</h4>
            <div className="border border-slate-600 rounded-lg overflow-hidden">
              <Header
                title="宇宙探索者"
                subtitle="Cosmos Explorer"
                showMenuButton
                onMenuClick={() => console.log('菜单点击')}
                rightContent={
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">登录</Button>
                    <Button size="sm">注册</Button>
                  </div>
                }
              />
            </div>
          </div>

          {/* 导航组件演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-green-400">导航组件</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="text-sm font-medium mb-2 text-gray-400">垂直导航</h5>
                <Navigation
                  items={navigationItems}
                  activeId={activeNavItem}
                  onItemClick={(item) => setActiveNavItem(item.id)}
                />
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="text-sm font-medium mb-2 text-gray-400">水平导航</h5>
                <Navigation
                  items={navigationItems.slice(0, 3)}
                  activeId={activeNavItem}
                  vertical={false}
                  onItemClick={(item) => setActiveNavItem(item.id)}
                />
              </div>
            </div>
          </div>

          {/* 面板组件演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-purple-400">面板组件</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Panel title="基础面板" size="sm">
                <p className="text-sm">这是一个基础面板的内容。</p>
              </Panel>

              <Panel title="可折叠面板" collapsible size="sm">
                <div className="space-y-2">
                  <p className="text-sm">这是可折叠面板的内容。</p>
                  <Button size="sm" variant="outline">操作按钮</Button>
                </div>
              </Panel>

              <Panel title="可关闭面板" closable size="sm" onClose={() => console.log('面板关闭')}>
                <div className="space-y-2">
                  <p className="text-sm">这是可关闭面板的内容。</p>
                  <Progress value={75} size="sm" />
                </div>
              </Panel>
            </div>
          </div>
        </div>

        {/* 响应式组件演示 */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">响应式组件演示</h3>

          {/* 断点信息 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-cyan-400">当前断点信息</h4>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">断点:</span>
                  <span className="ml-2 font-mono text-cyan-300">{breakpoint}</span>
                </div>
                <div>
                  <span className="text-gray-400">宽度:</span>
                  <span className="ml-2 font-mono text-cyan-300">{width}px</span>
                </div>
                <div>
                  <span className="text-gray-400">移动端:</span>
                  <span className={`ml-2 font-mono ${isMobile ? 'text-green-400' : 'text-red-400'}`}>
                    {isMobile ? '是' : '否'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">桌面端:</span>
                  <span className={`ml-2 font-mono ${isDesktop ? 'text-green-400' : 'text-red-400'}`}>
                    {isDesktop ? '是' : '否'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 响应式容器演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-blue-400">响应式容器</h4>
            <ResponsiveContainer
              maxWidth="lg"
              responsivePadding={{
                mobile: 'sm',
                tablet: 'md',
                desktop: 'lg'
              }}
              className="bg-slate-900 rounded-lg"
            >
              <p className="text-center text-gray-300">
                这是一个响应式容器，在不同屏幕尺寸下有不同的内边距
              </p>
            </ResponsiveContainer>
          </div>

          {/* 响应式网格演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-green-400">响应式网格</h4>
            <ResponsiveGrid
              columns={{
                mobile: 1,
                tablet: 2,
                desktop: 3
              }}
              gap="md"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <div key={num} className="bg-slate-900 rounded-lg p-4 text-center">
                  <span className="text-gray-300">网格项 {num}</span>
                </div>
              ))}
            </ResponsiveGrid>
          </div>

          {/* 响应式显示演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-purple-400">响应式显示</h4>
            <div className="space-y-4">
              <ResponsiveShow only="mobile">
                <div className="bg-red-900 rounded-lg p-4 text-center">
                  <span className="text-red-200">仅在移动端显示</span>
                </div>
              </ResponsiveShow>

              <ResponsiveShow only="tablet">
                <div className="bg-yellow-900 rounded-lg p-4 text-center">
                  <span className="text-yellow-200">仅在平板端显示</span>
                </div>
              </ResponsiveShow>

              <ResponsiveShow only="desktop">
                <div className="bg-green-900 rounded-lg p-4 text-center">
                  <span className="text-green-200">仅在桌面端显示</span>
                </div>
              </ResponsiveShow>

              <ResponsiveShow above="tablet">
                <div className="bg-blue-900 rounded-lg p-4 text-center">
                  <span className="text-blue-200">平板端及以上显示</span>
                </div>
              </ResponsiveShow>
            </div>
          </div>
        </div>

        {/* 主题系统演示 */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">主题系统演示</h3>

          {/* 当前主题信息 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-cyan-400">当前主题信息</h4>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">主题名称:</span>
                  <span className="ml-2 font-mono text-cyan-300">{theme.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">主题ID:</span>
                  <span className="ml-2 font-mono text-cyan-300">{themeName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 主题选择器演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-blue-400">主题选择器</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2 text-gray-400">按钮模式</h5>
                <ThemeSelector mode="buttons" showNames showPreview />
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2 text-gray-400">切换模式</h5>
                <ThemeSelector mode="toggle" showNames />
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2 text-gray-400">下拉模式</h5>
                <ThemeSelector mode="dropdown" />
              </div>
            </div>
          </div>

          {/* 主题颜色展示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-green-400">主题颜色</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 主要颜色 */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-400">主要颜色</h5>
                <div className="flex space-x-1">
                  {[500, 600, 700, 800].map(shade => (
                    <div
                      key={shade}
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: theme.colors.primary[shade as keyof typeof theme.colors.primary] }}
                      title={`primary-${shade}`}
                    />
                  ))}
                </div>
              </div>

              {/* 次要颜色 */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-400">次要颜色</h5>
                <div className="flex space-x-1">
                  {[500, 600, 700, 800].map(shade => (
                    <div
                      key={shade}
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: theme.colors.secondary[shade as keyof typeof theme.colors.secondary] }}
                      title={`secondary-${shade}`}
                    />
                  ))}
                </div>
              </div>

              {/* 背景颜色 */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-400">背景颜色</h5>
                <div className="flex space-x-1">
                  {Object.entries(theme.colors.background).map(([name, color]) => (
                    <div
                      key={name}
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: color }}
                      title={`background-${name}`}
                    />
                  ))}
                </div>
              </div>

              {/* 状态颜色 */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-400">状态颜色</h5>
                <div className="flex space-x-1">
                  {Object.entries(theme.colors.status).map(([name, color]) => (
                    <div
                      key={name}
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: color }}
                      title={`status-${name}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D引擎演示 */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">3D引擎演示</h3>

          {/* 3D画布演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-cyan-400">太阳系3D可视化</h4>
            <div className="bg-slate-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <Canvas3D
                quality="medium"
                showStats={false}
                showGrid={false}
                enableControls={true}
                environment="night"
                cameraPosition={[30, 20, 30]}
                cameraTarget={[0, 0, 0]}
              >
                <SolarSystemDemo
                  animationSpeed={2}
                  showOrbits={true}
                  onPlanetClick={(planetName) => {
                    console.log(`点击了行星: ${planetName}`);
                    // 这里可以添加更多交互逻辑
                  }}
                />
              </Canvas3D>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              使用鼠标拖拽旋转视角，滚轮缩放，点击行星查看详情
            </p>
          </div>

          {/* 3D引擎功能说明 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-blue-400">引擎特性</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="font-medium text-green-400 mb-2">🎮 交互控制</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 轨道控制器</li>
                  <li>• 鼠标交互</li>
                  <li>• 键盘导航</li>
                  <li>• 触摸支持</li>
                </ul>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="font-medium text-purple-400 mb-2">🎨 渲染特性</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 多质量级别</li>
                  <li>• 动态阴影</li>
                  <li>• 环境光照</li>
                  <li>• 材质系统</li>
                </ul>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h5 className="font-medium text-yellow-400 mb-2">⚡ 性能优化</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 自适应像素比</li>
                  <li>• 视锥体剔除</li>
                  <li>• LOD系统</li>
                  <li>• 内存管理</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 增强版3D引擎演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-purple-400">增强版3D引擎</h4>
            <div className="bg-slate-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <EnhancedCanvas3D
                quality="high"
                showPerformanceMonitor={true}
                autoQualityAdjust={true}
                targetFPS={60}
                showGrid={true}
                enableEnvironment={true}
                environmentPreset="night"
                cameraMode="orbit"
                cameraConfig={{
                  position: [25, 15, 25],
                  target: [0, 0, 0],
                  fov: 75,
                  near: 0.1,
                  far: 1000,
                }}
                sceneConfig={{
                  background: '#0a0a0a',
                  fog: { enabled: true, color: '#0a0a0a', near: 50, far: 200 },
                  shadows: { enabled: true, type: 'PCFSoft' },
                  environment: { enabled: true, preset: 'night' },
                }}
                onPerformanceUpdate={(stats) => {
                  console.log('性能统计:', stats);
                }}
                onQualityChange={(quality) => {
                  console.log('质量变化:', quality);
                }}
              >
                <SolarSystemDemo
                  animationSpeed={1.5}
                  showOrbits={true}
                  onPlanetClick={(planetName) => {
                    console.log(`增强版引擎 - 点击了行星: ${planetName}`);
                  }}
                />
              </EnhancedCanvas3D>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              增强版引擎包含性能监控、自动质量调整、高级光照和场景管理
            </p>
          </div>

          {/* 终极优化版3D引擎演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-orange-400">终极优化版3D引擎</h4>
            <div className="bg-slate-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <OptimizedCanvas3D
                quality="high"
                targetFPS={60}
                adaptiveFrameRate={true}
                autoQualityAdjust={true}
                maxMemoryUsage={256}
                showPerformanceMonitor={true}
                showGrid={false}
                enableEnvironment={true}
                environmentPreset="night"
                cameraMode="orbit"
                cameraConfig={{
                  position: [35, 25, 35],
                  target: [0, 0, 0],
                  fov: 75,
                  near: 0.1,
                  far: 1000,
                }}
                onPerformanceUpdate={(stats) => {
                  // 可以在这里处理性能数据
                }}
                onQualityChange={(quality) => {
                  console.log('自动质量调整:', quality);
                }}
                onFrameRateChange={(fps) => {
                  console.log('帧率变化:', fps);
                }}
                onMemoryUsage={(usage) => {
                  console.log('内存使用:', usage);
                }}
              >
                <InteractiveSolarSystem
                  animationSpeed={1}
                  showOrbits={true}
                  enableInteraction={true}
                  onPlanetClick={(planetName, event) => {
                    console.log(`终极版引擎 - 点击了行星: ${planetName}`, event);
                  }}
                  onPlanetHover={(planetName, hovered, event) => {
                    console.log(`终极版引擎 - ${hovered ? '悬停' : '离开'}行星: ${planetName}`, event);
                  }}
                  onPlanetDrag={(planetName, event) => {
                    console.log(`终极版引擎 - 拖拽行星: ${planetName}`, event);
                  }}
                />
              </OptimizedCanvas3D>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              终极版引擎集成了所有优化功能：性能监控、自动质量调整、内存管理、帧率控制、交互系统
            </p>
          </div>

          {/* 多尺度场景管理器演示 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-purple-400">多尺度场景管理器</h4>
            <div className="bg-slate-900 rounded-lg overflow-hidden" style={{ height: '500px' }}>
              <MultiScaleDemo
                initialScale="human_scale"
                showNavigator={true}
                navigatorMode="compact"
                showDebugInfo={true}
                quality="high"
                height="100%"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              25个数量级的无缝尺度切换：从原子到宇宙的完整探索体验。使用右下角导航器或快捷键切换尺度。
            </p>
          </div>

          {/* 技术栈信息 */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-red-400">技术栈</h4>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">3D引擎:</span>
                  <span className="ml-2 font-mono text-cyan-300">Three.js</span>
                </div>
                <div>
                  <span className="text-gray-400">React集成:</span>
                  <span className="ml-2 font-mono text-cyan-300">R3F</span>
                </div>
                <div>
                  <span className="text-gray-400">工具库:</span>
                  <span className="ml-2 font-mono text-cyan-300">Drei</span>
                </div>
                <div>
                  <span className="text-gray-400">渲染器:</span>
                  <span className="ml-2 font-mono text-cyan-300">WebGL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* 模态框 */}
      <Modal
        open={showModal}
        title="演示模态框"
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-4">
          <p>这是一个演示模态框，展示了模态框组件的基本功能。</p>
          <div className="space-y-2">
            <Input placeholder="在模态框中输入" />
            <Progress value={60} label="模态框中的进度条" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button onClick={() => setShowModal(false)}>
              确定
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default App
