/**
 * 天体类型定义测试
 * 验证天体相关类型的正确性和完整性
 */

import { describe, it, expect } from 'vitest';
import {
  ScaleLevel,
  CelestialBodyType
} from '../celestial';
import type {
  CelestialBody,
  OrbitData,
  CulturalInfo,
  PhysicalProperties,
  RenderProperties,
  LODLevel,
  Vector3Data,
  EulerData
} from '../celestial';

describe('Celestial Types', () => {
  describe('ScaleLevel', () => {
    it('should contain all required scale levels', () => {
      const scaleValues = Object.values(ScaleLevel);
      
      expect(scaleValues).toContain('atomic');
      expect(scaleValues).toContain('molecular');
      expect(scaleValues).toContain('terrestrial');
      expect(scaleValues).toContain('planetary');
      expect(scaleValues).toContain('solar_system');
      expect(scaleValues).toContain('stellar');
      expect(scaleValues).toContain('galactic');
      expect(scaleValues).toContain('cosmic');
      
      // 验证总数量（应该有14个尺度级别）
      expect(scaleValues).toHaveLength(14);
    });
  });

  describe('CelestialBodyType', () => {
    it('should contain all celestial body types', () => {
      const bodyTypes = Object.values(CelestialBodyType);
      
      expect(bodyTypes).toContain('star');
      expect(bodyTypes).toContain('planet');
      expect(bodyTypes).toContain('moon');
      expect(bodyTypes).toContain('asteroid');
      expect(bodyTypes).toContain('galaxy');
      expect(bodyTypes).toContain('spacecraft');
    });
  });

  describe('Vector3Data', () => {
    it('should have correct structure', () => {
      const vector: Vector3Data = {
        x: 1.0,
        y: 2.0,
        z: 3.0
      };
      
      expect(vector.x).toBe(1.0);
      expect(vector.y).toBe(2.0);
      expect(vector.z).toBe(3.0);
    });
  });

  describe('EulerData', () => {
    it('should have correct structure with optional order', () => {
      const euler1: EulerData = {
        x: 0,
        y: Math.PI / 2,
        z: 0
      };
      
      const euler2: EulerData = {
        x: 0,
        y: Math.PI / 2,
        z: 0,
        order: 'XYZ'
      };
      
      expect(euler1.x).toBe(0);
      expect(euler1.y).toBe(Math.PI / 2);
      expect(euler1.z).toBe(0);
      expect(euler1.order).toBeUndefined();
      
      expect(euler2.order).toBe('XYZ');
    });
  });

  describe('OrbitData', () => {
    it('should have all required orbital elements', () => {
      const orbit: OrbitData = {
        semiMajorAxis: 1.0, // 1 AU
        eccentricity: 0.0167,
        inclination: 0.0,
        longitudeOfAscendingNode: 0.0,
        argumentOfPeriapsis: 0.0,
        meanAnomaly: 0.0,
        period: 365.25,
        epoch: new Date('2000-01-01T12:00:00Z')
      };
      
      expect(orbit.semiMajorAxis).toBe(1.0);
      expect(orbit.eccentricity).toBe(0.0167);
      expect(orbit.period).toBe(365.25);
      expect(orbit.epoch).toBeInstanceOf(Date);
    });
  });

  describe('CulturalInfo', () => {
    it('should support Chinese astronomical data', () => {
      const culturalInfo: CulturalInfo = {
        chineseConstellation: '青龙',
        twentyEightMansions: '角宿',
        threeEnclosures: '紫微垣',
        traditionalName: '太白',
        mythology: '太白金星的传说',
        historicalRecords: ['史记·天官书', '汉书·天文志'],
        culturalSignificance: '古代重要的观测目标',
        ancientMagnitude: 1
      };
      
      expect(culturalInfo.chineseConstellation).toBe('青龙');
      expect(culturalInfo.twentyEightMansions).toBe('角宿');
      expect(culturalInfo.historicalRecords).toHaveLength(2);
    });
  });

  describe('PhysicalProperties', () => {
    it('should contain all physical parameters', () => {
      const physics: PhysicalProperties = {
        mass: 5.97237e24, // Earth mass in kg
        radius: 6371000,  // Earth radius in m
        density: 5514,    // kg/m³
        temperature: 288, // K
        apparentMagnitude: -26.7,
        absoluteMagnitude: 4.83,
        spectralType: 'G2V'
      };
      
      expect(physics.mass).toBe(5.97237e24);
      expect(physics.radius).toBe(6371000);
      expect(physics.spectralType).toBe('G2V');
    });
  });

  describe('RenderProperties', () => {
    it('should have rendering configuration', () => {
      const renderProps: RenderProperties = {
        renderPriority: 1,
        visible: true,
        opacity: 1.0
      };
      
      expect(renderProps.renderPriority).toBe(1);
      expect(renderProps.visible).toBe(true);
      expect(renderProps.opacity).toBe(1.0);
    });
  });

  describe('LODLevel', () => {
    it('should define level of detail parameters', () => {
      const lodLevel: LODLevel = {
        distance: 1000,
        polygons: 50000,
        textureResolution: 2048
      };
      
      expect(lodLevel.distance).toBe(1000);
      expect(lodLevel.polygons).toBe(50000);
      expect(lodLevel.textureResolution).toBe(2048);
    });
  });

  describe('CelestialBody', () => {
    it('should create a complete celestial body', () => {
      const earth: CelestialBody = {
        id: 'earth',
        name: 'Earth',
        chineseName: '地球',
        type: CelestialBodyType.PLANET,
        scaleLevel: ScaleLevel.PLANETARY,
        
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        
        physicalProperties: {
          mass: 5.97237e24,
          radius: 6371000,
          density: 5514,
          temperature: 288
        },
        
        orbit: {
          semiMajorAxis: 1.0,
          eccentricity: 0.0167,
          inclination: 0.0,
          longitudeOfAscendingNode: 0.0,
          argumentOfPeriapsis: 0.0,
          meanAnomaly: 0.0,
          period: 365.25,
          epoch: new Date('2000-01-01T12:00:00Z')
        },
        
        culturalInfo: {
          chineseConstellation: '地球',
          traditionalName: '地',
          culturalSignificance: '人类的家园'
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
            distance: 1000,
            polygons: 50000,
            textureResolution: 2048
          }
        ],
        
        childrenIds: ['moon'],
        
        createdAt: new Date(),
        updatedAt: new Date(),
        dataSource: 'NASA',
        version: '1.0.0'
      };
      
      expect(earth.id).toBe('earth');
      expect(earth.name).toBe('Earth');
      expect(earth.chineseName).toBe('地球');
      expect(earth.type).toBe(CelestialBodyType.PLANET);
      expect(earth.scaleLevel).toBe(ScaleLevel.PLANETARY);
      expect(earth.childrenIds).toContain('moon');
      expect(earth.lodLevels).toHaveLength(2);
    });
  });

  describe('Type Compatibility', () => {
    it('should allow partial updates', () => {
      const partialBody: Partial<CelestialBody> = {
        name: 'Updated Name',
        position: { x: 1, y: 2, z: 3 }
      };
      
      expect(partialBody.name).toBe('Updated Name');
      expect(partialBody.position?.x).toBe(1);
    });

    it('should support optional cultural info', () => {
      const bodyWithoutCulture: Omit<CelestialBody, 'culturalInfo'> = {
        id: 'asteroid-1',
        name: 'Asteroid 1',
        type: CelestialBodyType.ASTEROID,
        scaleLevel: ScaleLevel.SOLAR_SYSTEM,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        physicalProperties: {
          mass: 1e15,
          radius: 500
        },
        renderProperties: {
          renderPriority: 3,
          visible: true,
          opacity: 1.0
        },
        lodLevels: [],
        childrenIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        dataSource: 'Minor Planet Center',
        version: '1.0.0'
      };
      
      expect(bodyWithoutCulture.id).toBe('asteroid-1');
      expect(bodyWithoutCulture.type).toBe(CelestialBodyType.ASTEROID);
    });
  });
});
