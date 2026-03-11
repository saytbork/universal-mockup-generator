import { describe, expect, it } from 'vitest';
import { buildSplashMode } from '../photoModes/splashMode';
import { buildModifiers } from '../builders/buildModifiers';
import { genericPipeline } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function splashState(): StudioUIState {
  return {
    industryProfile: 'supplements',
    photoMode: 'Splash Shot',
    motion: 'pouring',
    composition: 'hero',
    creativeIntent: 'conversion',
    requestedModifiers: ['splash'],
  } as StudioUIState;
}

describe('splash physics ownership regression', () => {
  it('splash mode contains interaction contract tokens', () => {
    const block = buildSplashMode();
    expect(block).toContain('INTERACTION_MODE:');
    expect(block).toContain('FLOW_DIRECTION:');
    expect(block).toContain('PRODUCT_GROUNDING:');
    expect(block).toContain('LOCAL_DEFORMATION:');
    expect(block).toContain('IMPACT_TYPE:');
    expect(block).toContain('FLUID_REALISM_CONSTRAINT:');
  });

  it('modifiers own only STUDIO_PHYSICS_MODEL for splash', () => {
    const block = buildModifiers(['splash'] as any);
    expect(block).toContain('STUDIO_PHYSICS_MODEL:');
    expect(block).not.toContain('IMPACT_TYPE:');
  });

  it('final splash prompt has single physics model and single impact type', () => {
    const prompt = genericPipeline.build(splashState());
    const physicsCount = (prompt.match(/STUDIO_PHYSICS_MODEL:/g) || []).length;
    const impactCount = (prompt.match(/IMPACT_TYPE:\s*liquid_splash\./g) || []).length;

    expect(physicsCount).toBe(1);
    expect(impactCount).toBe(1);
  });
});
