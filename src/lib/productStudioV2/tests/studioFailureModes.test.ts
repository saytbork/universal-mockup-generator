import { describe, expect, it } from 'vitest';
import { buildLighting } from '../builders/buildLighting';
import { resolveStudioAuthority } from '../authority/studioAuthorityResolver';
import { __orderSegmentsForTest, __validateFinalPromptForTest, genericPipeline } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function baseState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    photoMode: 'Hero Landing Page',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

describe('Studio failure modes', () => {
  it('Splash Shot no longer fails validation', () => {
    const state = baseState({
      photoMode: 'Splash Shot',
      motion: 'pouring',
      requestedModifiers: ['splash'],
    });
    const prompt = genericPipeline.build(state);
    expect(prompt).toContain('STUDIO_PHYSICS_MODEL:');
    expect(prompt).toContain('IMPACT_TYPE: liquid_splash.');
    expect(() => __validateFinalPromptForTest(prompt, state)).not.toThrow();
  });

  it('Nature Elements includes all realism anchors', () => {
    const state = baseState({ environmentPreset: 'Nature Elements' });
    const prompt = genericPipeline.build(state);
    expect(prompt).toContain('NATURAL_MATERIAL_REALISM:');
    expect(prompt).toContain('NO_SYNTHETIC_RENDERING:');
    expect(prompt).toContain('SURFACE_MICRODETAIL:');
    expect(prompt).toContain('PHOTOGRAPHIC_LIGHT_RESPONSE:');
    expect(() => __validateFinalPromptForTest(prompt, state)).not.toThrow();
  });

  it('Wine Macro Label preserves label inspection contract', () => {
    const state = baseState({
      industryProfile: 'wine',
      photoMode: 'Wine Macro Label',
      composition: 'macro',
      wineEngineVersion: 4,
      wineBottleState: 'sealed',
      wineGlassMode: 'none',
      wineClosureType: 'from-reference',
    });
    const prompt = genericPipeline.build(state);
    expect(prompt.includes('INTERACTION_MODE:') || prompt.includes('APPLICATION_ZONE: front label.')).toBe(true);
    expect(() => __validateFinalPromptForTest(prompt, state)).not.toThrow();
  });

  it('basicLighting overrides preset alias', () => {
    const state = baseState({
      basicLighting: 'clinical-softbox' as any,
      lightingPreset: 'sunny-day' as any,
    });
    const authority = resolveStudioAuthority(state);
    const lighting = buildLighting(authority, state);
    expect(lighting).toContain('STUDIO_LIGHTING_PROFILE: conversion softbox wrap with label-priority separation.');
    expect(lighting).not.toContain('sunny day window light');
  });

  it('no duplicate exact normalized segments after ordering', () => {
    const ordered = __orderSegmentsForTest([
      'STUDIO_COMPOSITION_PROFILE: hero.',
      'STUDIO_COMPOSITION_PROFILE:   hero.',
      'STUDIO_COMPOSITION_PROFILE: hero. extra',
      'STUDIO_WORLD: studio.',
    ]);
    const keys = ordered.map((s) => `${s.type}|${s.content.replace(/\s+/g, ' ').trim()}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

