/**
 * ScaleVisualizer 组件
 * 尺度可视化组件，根据当前尺度显示相应的3D内容
 */

import React, { useMemo } from 'react';
import { useScaleContext } from './ScaleContext';
import { ScaleLevel } from '@/types/scale';
import { SCALE_DEFINITIONS } from '@/constants/scales';

// 导入不同尺度的可视化组件
import { AtomicVisualizer } from './visualizers/AtomicVisualizer';
import { MolecularVisualizer } from './visualizers/MolecularVisualizer';
import { CellularVisualizer } from './visualizers/CellularVisualizer';
import { HumanScaleVisualizer } from './visualizers/HumanScaleVisualizer';
import { PlanetaryVisualizer } from './visualizers/PlanetaryVisualizer';
import { SolarSystemVisualizer } from './visualizers/SolarSystemVisualizer';
import { StellarVisualizer } from './visualizers/StellarVisualizer';
import { GalacticVisualizer } from './visualizers/GalacticVisualizer';
import { CosmicVisualizer } from './visualizers/CosmicVisualizer';

export interface ScaleVisualizerProps {
  /** 是否启用LOD优化 */
  enableLOD?: boolean;
  /** 渲染质量 */
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  /** 是否显示调试信息 */
  showDebugInfo?: boolean;
  /** 自定义渲染器 */
  customRenderers?: Partial<Record<ScaleLevel, React.ComponentType<any>>>;
}

/**
 * 尺度可视化器组件
 */
export const ScaleVisualizer: React.FC<ScaleVisualizerProps> = ({
  enableLOD = true,
  quality = 'medium',
  showDebugInfo = false,
  customRenderers = {},
}) => {
  const scaleContext = useScaleContext();
  const { state } = scaleContext;
  const currentScaleInfo = scaleContext.getScaleInfo();

  // 获取当前尺度的可视化组件
  const VisualizerComponent = useMemo(() => {
    // 优先使用自定义渲染器
    if (customRenderers[state.currentScale]) {
      return customRenderers[state.currentScale]!;
    }

    // 根据尺度级别选择对应的可视化组件
    switch (state.currentScale) {
      case ScaleLevel.SUBATOMIC:
      case ScaleLevel.ATOMIC:
        return AtomicVisualizer;
      
      case ScaleLevel.MOLECULAR:
      case ScaleLevel.NANOSCALE:
        return MolecularVisualizer;
      
      case ScaleLevel.CELLULAR:
      case ScaleLevel.MICROSCOPIC:
        return CellularVisualizer;
      
      case ScaleLevel.MILLIMETER:
      case ScaleLevel.CENTIMETER:
      case ScaleLevel.HUMAN_SCALE:
      case ScaleLevel.BUILDING:
        return HumanScaleVisualizer;
      
      case ScaleLevel.CITY_BLOCK:
      case ScaleLevel.CITY:
      case ScaleLevel.REGIONAL:
      case ScaleLevel.CONTINENTAL:
      case ScaleLevel.PLANETARY:
      case ScaleLevel.PLANET:
        return PlanetaryVisualizer;
      
      case ScaleLevel.ORBITAL:
      case ScaleLevel.INNER_SYSTEM:
      case ScaleLevel.SOLAR_SYSTEM:
      case ScaleLevel.OUTER_SYSTEM:
      case ScaleLevel.HELIOSPHERE:
        return SolarSystemVisualizer;
      
      case ScaleLevel.STELLAR:
      case ScaleLevel.LOCAL_STARS:
        return StellarVisualizer;
      
      case ScaleLevel.GALACTIC_LOCAL:
      case ScaleLevel.GALACTIC:
      case ScaleLevel.LOCAL_GROUP:
        return GalacticVisualizer;
      
      case ScaleLevel.COSMIC:
      case ScaleLevel.UNIVERSE:
        return CosmicVisualizer;
      
      default:
        return HumanScaleVisualizer;
    }
  }, [state.currentScale, customRenderers]);

  // 计算LOD级别
  const lodLevel = useMemo(() => {
    if (!enableLOD) return 0;
    
    const qualityMultiplier = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      ultra: 2,
    }[quality];
    
    return Math.max(0, currentScaleInfo.lodLevel * qualityMultiplier);
  }, [enableLOD, quality, currentScaleInfo.lodLevel]);

  // 渲染过渡粒子效果（Three.js版本）
  const renderTransitionParticles = () => {
    if (!state.isTransitioning) return null;

    return (
      <group>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 100,
              (Math.random() - 0.5) * 100,
              (Math.random() - 0.5) * 100,
            ]}
          >
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial
              color="#4488ff"
              transparent
              opacity={state.transitionProgress * 0.8}
            />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <group>
      {/* 主要可视化内容 */}
      <VisualizerComponent
        scale={state.currentScale}
        scaleInfo={currentScaleInfo}
        lodLevel={lodLevel}
        quality={quality}
        isTransitioning={state.isTransitioning}
        transitionProgress={state.transitionProgress}
        enablePhysics={currentScaleInfo.enablePhysics}
        timeScale={currentScaleInfo.timeScale}
      />

      {/* 过渡期间的目标尺度预览 */}
      {state.isTransitioning && state.targetScale && state.transitionProgress > 0.5 && (
        <group opacity={state.transitionProgress - 0.5}>
          {(() => {
            const TargetComponent = customRenderers[state.targetScale] || VisualizerComponent;
            const targetScaleInfo = SCALE_DEFINITIONS[state.targetScale];
            
            return (
              <TargetComponent
                scale={state.targetScale}
                scaleInfo={targetScaleInfo}
                lodLevel={lodLevel * 0.5} // 降低目标尺度的LOD
                quality={quality}
                isTransitioning={true}
                transitionProgress={state.transitionProgress}
                enablePhysics={targetScaleInfo.enablePhysics}
                timeScale={targetScaleInfo.timeScale}
              />
            );
          })()}
        </group>
      )}

      {/* 环境光照调整 */}
      <ambientLight 
        intensity={0.4 + (currentScaleInfo.magnitude + 15) * 0.02} 
        color="#ffffff"
      />
      
      {/* 方向光 */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow={currentScaleInfo.lodLevel <= 2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 点光源（用于小尺度照明） */}
      {currentScaleInfo.magnitude < 0 && (
        <pointLight
          position={[0, 0, currentScaleInfo.defaultCameraDistance * 0.1]}
          intensity={1}
          distance={currentScaleInfo.defaultCameraDistance}
        />
      )}

      {/* 雾效（用于大尺度深度感） */}
      {currentScaleInfo.magnitude > 10 && (
        <fog
          attach="fog"
          args={['#000011', currentScaleInfo.minCameraDistance, currentScaleInfo.maxCameraDistance]}
        />
      )}

      {/* 过渡粒子效果 */}
      {renderTransitionParticles()}
    </group>
  );
};

export default ScaleVisualizer;
