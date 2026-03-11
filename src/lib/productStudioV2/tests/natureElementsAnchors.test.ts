import { describe, expect, it, vi, afterEach } from 'vitest';
import { buildWorld } from '../builders/buildWorld';
import { resolveStudioAuthority } from '../authority/studioAuthorityResolver';
import * as worldRouter from '../worldBuilders/worldRouter';
import type { StudioUIState } from '../types/studioTypes';

function baseState(): StudioUIState {
  return {
    industryProfile: 'supplements',
    photoMode: 'Hero Landing Page',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    environmentPreset: 'Nature Elements',
  } as StudioUIState;
}

function countToken(text: string, token: string): number {
  return (text.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Nature Elements anchor injection regression', () => {
  it('injects all 4 anchors when world output has none', () => {
    vi.spyOn(worldRouter, 'resolveWorldBuilder').mockReturnValue({
      name: 'mockWorld',
      builder: () => 'STUDIO_WORLD: nature scene base.',
    } as any);

    const state = baseState();
    const out = buildWorld(resolveStudioAuthority(state), undefined, state);

    expect(countToken(out, 'NATURAL_MATERIAL_REALISM:')).toBe(1);
    expect(countToken(out, 'NO_SYNTHETIC_RENDERING:')).toBe(1);
    expect(countToken(out, 'SURFACE_MICRODETAIL:')).toBe(1);
    expect(countToken(out, 'PHOTOGRAPHIC_LIGHT_RESPONSE:')).toBe(1);
  });

  it('does not duplicate anchors when all 4 already exist', () => {
    const withAllAnchors = [
      'STUDIO_WORLD: nature scene base.',
      'NATURAL_MATERIAL_REALISM: already-set.',
      'NO_SYNTHETIC_RENDERING: already-set.',
      'SURFACE_MICRODETAIL: already-set.',
      'PHOTOGRAPHIC_LIGHT_RESPONSE: already-set.',
    ].join(' ');

    vi.spyOn(worldRouter, 'resolveWorldBuilder').mockReturnValue({
      name: 'mockWorld',
      builder: () => withAllAnchors,
    } as any);

    const state = baseState();
    const out = buildWorld(resolveStudioAuthority(state), undefined, state);

    expect(countToken(out, 'NATURAL_MATERIAL_REALISM:')).toBe(1);
    expect(countToken(out, 'NO_SYNTHETIC_RENDERING:')).toBe(1);
    expect(countToken(out, 'SURFACE_MICRODETAIL:')).toBe(1);
    expect(countToken(out, 'PHOTOGRAPHIC_LIGHT_RESPONSE:')).toBe(1);
  });
});
