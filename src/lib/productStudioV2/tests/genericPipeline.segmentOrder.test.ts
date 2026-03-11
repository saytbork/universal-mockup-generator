import { describe, expect, it } from 'vitest';
import { __buildOrderedSegmentsForTest, __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function baseState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    photoMode: 'Hero Landing Page',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    cameraSystem: 'DSLR / mirrorless camera system',
    cameraAngle: '45° hero',
    cameraDistance: 'Standard',
    cameraRotation: '0°',
    framingGuide: 'Centered hero',
    ...overrides,
  } as StudioUIState;
}

function assertCanonicalBucketsPresent(types: string[]): void {
  const cameraAt = types.indexOf('camera');
  const compositionAt = types.indexOf('composition');
  const worldAt = types.indexOf('world');
  const guardrailAt = types.indexOf('guardrail');

  if (cameraAt >= 0 && compositionAt >= 0) {
    expect(cameraAt).toBeLessThan(compositionAt);
  }
  if (compositionAt >= 0 && worldAt >= 0) {
    expect(compositionAt).toBeLessThan(worldAt);
  }
  if (worldAt >= 0 && guardrailAt >= 0) {
    expect(worldAt).toBeLessThan(guardrailAt);
  }
}

function assertTokenOrder(prompt: string, beforeToken: string, afterToken: string): void {
  const a = prompt.indexOf(beforeToken);
  const b = prompt.indexOf(afterToken);
  if (a >= 0 && b >= 0) {
    expect(a).toBeLessThan(b);
  }
}

describe('genericPipeline segment order regression', () => {
  it('supplements + Hero Landing Page keeps canonical segment order and token progression', () => {
    const state = baseState();
    const segments = __buildOrderedSegmentsForTest(state);
    assertCanonicalBucketsPresent(segments.map((s) => s.type));

    const prompt = __buildPromptForTest(state);
    assertTokenOrder(prompt, 'STUDIO_CAMERA_SYSTEM:', 'STUDIO_COMPOSITION_PROFILE:');
    assertTokenOrder(prompt, 'STUDIO_COMPOSITION_PROFILE:', 'PHOTO_MODE_ATMOSPHERE:');
    assertTokenOrder(prompt, 'PHOTO_MODE_ATMOSPHERE:', 'PHOTO_MODE_SCENE:');
    assertTokenOrder(prompt, 'PHOTO_MODE_SCENE:', 'STUDIO_LIGHTING_PROFILE:');
    assertTokenOrder(prompt, 'PHOTO_MODE_SCENE:', 'STUDIO_MATERIAL_PROFILE:');
    assertTokenOrder(prompt, 'PHOTO_MODE_SCENE:', 'STUDIO_PRODUCT_MOTION:');
  });

  it('supplements + Splash Shot keeps canonical segment order and token progression', () => {
    const state = baseState({
      photoMode: 'Splash Shot',
      motion: 'pouring',
      requestedModifiers: ['splash'],
    });
    const segments = __buildOrderedSegmentsForTest(state);
    assertCanonicalBucketsPresent(segments.map((s) => s.type));

    const prompt = __buildPromptForTest(state);
    assertTokenOrder(prompt, 'STUDIO_COMPOSITION_PROFILE:', 'INTERACTION_MODE: liquid impact.');
    assertTokenOrder(prompt, 'INTERACTION_MODE: liquid impact.', 'PHOTO_MODE_SCENE:');
    assertTokenOrder(prompt, 'PHOTO_MODE_SCENE:', 'STUDIO_LIGHTING_PROFILE:');
    assertTokenOrder(prompt, 'PHOTO_MODE_SCENE:', 'STUDIO_MODIFIERS:');
  });

  it('supplements + Nature Elements keeps canonical order and world anchors present', () => {
    const state = baseState({
      environmentPreset: 'Nature Elements',
    });
    const segments = __buildOrderedSegmentsForTest(state);
    assertCanonicalBucketsPresent(segments.map((s) => s.type));

    const prompt = __buildPromptForTest(state);
    assertTokenOrder(prompt, 'PHOTO_MODE_ATMOSPHERE:', 'NATURAL_MATERIAL_REALISM:');
    assertTokenOrder(prompt, 'NATURAL_MATERIAL_REALISM:', 'STUDIO_LIGHTING_PROFILE:');
    expect(prompt).toContain('NO_SYNTHETIC_RENDERING:');
    expect(prompt).toContain('SURFACE_MICRODETAIL:');
    expect(prompt).toContain('PHOTOGRAPHIC_LIGHT_RESPONSE:');
  });

  it('wine + Wine Macro Label keeps canonical order and interaction before world', () => {
    const state = baseState({
      industryProfile: 'wine',
      photoMode: 'Wine Macro Label',
      motion: 'static',
      composition: 'macro',
      wineEngineVersion: 4,
      wineBottleState: 'sealed',
      wineGlassMode: 'none',
      wineClosureType: 'from-reference',
    });

    const segments = __buildOrderedSegmentsForTest(state);
    assertCanonicalBucketsPresent(segments.map((s) => s.type));

    const prompt = __buildPromptForTest(state);
    assertTokenOrder(prompt, 'INTERACTION_MODE: label-inspection.', 'PHOTO_MODE_SCENE:');
    assertTokenOrder(prompt, 'PHOTO_MODE_SCENE:', 'STUDIO_LIGHTING_PROFILE:');
  });
});
