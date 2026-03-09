import { describe, expect, it } from 'vitest';
import { buildLighting } from '../builders/buildLighting';
import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';

const authority: StudioAuthorityBundle = {
  creativeIntent: 'conversion',
  world: 'studio',
  motion: 'static',
  composition: 'hero',
  permissions: {
    allowSplash: false,
    allowAtmosphere: true,
    allowParticles: false,
    allowHorizontalSpread: false,
    allowVerticalDominance: false,
  },
};

function state(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    photoMode: 'Hero Landing Page',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

describe('buildLighting priority + alias normalization regression', () => {
  it('priority 1: lightingModelOverride wins over everything', () => {
    const out = buildLighting(authority, state({
      lightingModelOverride: 'custom override rig',
      basicLighting: 'natural-light',
      lighting: 'sunny-day',
    }));
    expect(out).toContain('STUDIO_LIGHTING_PROFILE: custom override rig.');
  });

  it('priority 2: basicLighting wins over preset', () => {
    const out = buildLighting(authority, state({
      basicLighting: 'overcast',
      lighting: 'sunny-day',
    }));
    expect(out).toContain('STUDIO_LIGHTING_PROFILE: overcast diffused daylight with flat soft shadows and even illumination.');
    expect(out).not.toContain('sunny day window light');
  });

  it('priority 3: preset branch wins when no override/basic', () => {
    const out = buildLighting(authority, state({ lightingPreset: 'golden-hour' }));
    expect(out).toContain('STUDIO_LIGHTING_PROFILE: golden hour directional sunlight with warm rim falloff.');
  });

  it('priority 4: fallback only when override/basic/preset are empty', () => {
    const out = buildLighting(authority, state());
    expect(out).toContain('STUDIO_LIGHTING_PROFILE: conversion softbox wrap with label-priority separation.');
  });

  it.each([
    ['natural-light', 'sunny day window light'],
    ['soft-diffused', 'soft diffused studio daylight with gentle wrap'],
    ['studio-high-key', 'studio high-key lighting with bright even exposure'],
    ['studio-low-key', 'studio low-key lighting with controlled deep shadow contrast'],
    ['overcast-natural', 'overcast natural daylight with low-contrast diffuse shadows'],
    ['golden-hour', 'golden hour directional sunlight with warm rim falloff'],
    ['sunny-day', 'sunny day window light'],
  ])('normalizes alias %s', (alias, expected) => {
    const out = buildLighting(authority, state({ lighting: alias }));
    expect(out).toContain(expected);
  });

  it('keeps accent gel constrained to rim separation without atmospheric glow language', () => {
    const out = buildLighting(authority, state({
      lightingModelOverride: 'Prism Spotlight Duo',
      customLightColor: '#9966FF',
      accentLightIntensity: 69,
    }));
    expect(out).toContain('Use restrained colored edge/rim separation only.');
    expect(out).toContain('No colored haze, no diffuse bloom, no noisy spill across the background, and no label contamination.');
    expect(out).not.toContain('atmospheric glow');
  });

  it('does not inject accent gel text for non-gel lighting rigs', () => {
    const out = buildLighting(authority, state({
      lightingModelOverride: '3-Point Beauty Dish',
      customLightColor: '#9966FF',
      accentLightIntensity: 69,
    }));
    expect(out).toContain('STUDIO_LIGHTING_PROFILE: 3-Point Beauty Dish.');
    expect(out).not.toContain('ACCENT LIGHT GEL:');
  });

  it('adds dark premium studio lighting discipline when that visual style is active', () => {
    const out = buildLighting(authority, state({
      visualStyle: 'Dark Premium Studio',
      visualStyleCategory: 'studio',
    }));
    expect(out).toContain('DARK_PREMIUM_STUDIO_LIGHTING:');
    expect(out).toContain('No muddy shadow noise, no crushed detail');
    expect(out).toContain('DARK_PREMIUM_SPECULAR_CONTROL:');
  });
});
