import { describe, it, expect } from 'vitest';
import { buildPhotoModeDynamic } from '../../productStudioV2/builders/buildPhotoModeDynamic';
import { buildWorld } from '../../productStudioV2/builders/buildWorld';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';
import { genericPipeline } from '../../productStudioV2/pipelines/genericPipeline';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

/**
 * Regression guard: Pool Water must render as calm real-world pool photography,
 * never as CGI splash / dynamic water simulation.
 *
 * Contracts enforced:
 *  - PHOTO_MODE_SETTING_WATERENERGY is always 'Calm' (never Splashy/Violent/Dynamic)
 *  - PHOTO_MODE_SETTING_WATERLEVEL  is always 'SurfaceContact' (never Split/Impact/Submerged)
 *  - POOL_WATER_REALISM_LOCK guardrail present in every Pool Water prompt
 *  - WATER_OPTICS_REALISM present
 *  - SPLASH_PATTERN_PROHIBITION present
 *  - No crown/arc/burst language in the final prompt
 */

function poolWaterState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    photoMode: 'Pool Water',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

function splashShotState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    photoMode: 'Splash Shot',
    motion: 'pouring',
    composition: 'hero',
    creativeIntent: 'conversion',
    requestedModifiers: ['splash'],
    ...overrides,
  } as StudioUIState;
}

// ── buildPhotoModeDynamic — Pool Water with no user settings ──────────────

describe('buildPhotoModeDynamic — Pool Water default settings', () => {
  it('emits WATERENERGY: Calm when no settings provided', () => {
    const out = buildPhotoModeDynamic(poolWaterState());
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERENERGY:\s*Calm/i);
  });

  it('emits WATERLEVEL: SurfaceContact when no settings provided', () => {
    const out = buildPhotoModeDynamic(poolWaterState());
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERLEVEL:\s*SurfaceContact/i);
  });

  it('never emits WATERENERGY: Splashy when no settings provided', () => {
    const out = buildPhotoModeDynamic(poolWaterState());
    expect(out).not.toMatch(/WATERENERGY:\s*Splashy/i);
  });
});

// ── buildPhotoModeDynamic — Pool Water with dangerous user settings ────────

describe('buildPhotoModeDynamic — Pool Water sanitizes dangerous user settings', () => {
  it('replaces waterEnergy=Splashy with Calm', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterEnergy: 'Splashy', waterLevel: 'SurfaceContact' },
    });
    const out = buildPhotoModeDynamic(state);
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERENERGY:\s*Calm/i);
    expect(out).not.toMatch(/WATERENERGY:\s*Splashy/i);
  });

  it('replaces waterEnergy=Violent with Calm', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterEnergy: 'Violent' },
    });
    const out = buildPhotoModeDynamic(state);
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERENERGY:\s*Calm/i);
  });

  it('replaces waterEnergy=Dynamic with Calm', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterEnergy: 'Dynamic' },
    });
    const out = buildPhotoModeDynamic(state);
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERENERGY:\s*Calm/i);
  });

  it('replaces waterLevel=Split with SurfaceContact', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterEnergy: 'Calm', waterLevel: 'Split' },
    });
    const out = buildPhotoModeDynamic(state);
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERLEVEL:\s*SurfaceContact/i);
    expect(out).not.toMatch(/WATERLEVEL:\s*Split/i);
  });

  it('replaces waterLevel=Impact with SurfaceContact', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterLevel: 'Impact' },
    });
    const out = buildPhotoModeDynamic(state);
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERLEVEL:\s*SurfaceContact/i);
  });

  it('replaces waterLevel=Submerged with SurfaceContact', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterLevel: 'Submerged' },
    });
    const out = buildPhotoModeDynamic(state);
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERLEVEL:\s*SurfaceContact/i);
  });

  it('passes through safe waterEnergy values unchanged', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterEnergy: 'Subtle ripple' },
    });
    const out = buildPhotoModeDynamic(state);
    expect(out).toMatch(/PHOTO_MODE_SETTING_WATERENERGY:\s*Subtle ripple/i);
  });
});

// ── buildWorld — Pool Water realism guardrails ────────────────────────────

describe('buildWorld — Pool Water realism lock blocks', () => {
  it('emits POOL_WATER_REALISM_LOCK for water-surface world', () => {
    const state = poolWaterState();
    const authority = resolveStudioAuthority(state);
    const out = buildWorld(authority, undefined, state);
    expect(out).toMatch(/POOL_WATER_REALISM_LOCK/);
  });

  it('emits WATER_OPTICS_REALISM for water-surface world', () => {
    const state = poolWaterState();
    const authority = resolveStudioAuthority(state);
    const out = buildWorld(authority, undefined, state);
    expect(out).toMatch(/WATER_OPTICS_REALISM/);
  });

  it('emits SPLASH_PATTERN_PROHIBITION for water-surface world', () => {
    const state = poolWaterState();
    const authority = resolveStudioAuthority(state);
    const out = buildWorld(authority, undefined, state);
    expect(out).toMatch(/SPLASH_PATTERN_PROHIBITION/);
  });

  it('realism lock explicitly forbids splash arcs and wave crowns', () => {
    const state = poolWaterState();
    const authority = resolveStudioAuthority(state);
    const out = buildWorld(authority, undefined, state);
    expect(out).toMatch(/No stylized splash arcs/i);
    expect(out).toMatch(/No water crowns/i);
  });

  it('does NOT emit POOL_WATER_REALISM_LOCK for splash-tank world', () => {
    const state = splashShotState();
    const authority = resolveStudioAuthority(state);
    const out = buildWorld(authority, undefined, state);
    expect(out).not.toMatch(/POOL_WATER_REALISM_LOCK/);
  });
});

// ── Full pipeline — Pool Water prompt contracts ───────────────────────────

describe('Full pipeline — Pool Water final prompt', () => {
  it('contains WATERENERGY: Calm', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/WATERENERGY:\s*Calm/i);
  });

  it('contains WATERLEVEL: SurfaceContact', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/WATERLEVEL:\s*SurfaceContact/i);
  });

  it('contains POOL_WATER_REALISM_LOCK', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/POOL_WATER_REALISM_LOCK/);
  });

  it('contains SPLASH_PATTERN_PROHIBITION', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/SPLASH_PATTERN_PROHIBITION/);
  });

  it('does not contain Splashy when user set waterEnergy=Splashy', () => {
    const state = poolWaterState({
      photoModeDynamicSettings: { waterEnergy: 'Splashy', waterLevel: 'Split' },
    });
    const prompt = genericPipeline.build(state);
    expect(prompt).not.toMatch(/WATERENERGY:\s*Splashy/i);
    expect(prompt).not.toMatch(/WATERLEVEL:\s*Split/i);
  });
});

// ── Splash Shot is unaffected ────────────────────────────────────────────

describe('Splash Shot — realism lock is not injected', () => {
  it('does not contain POOL_WATER_REALISM_LOCK in world output', () => {
    const state = splashShotState();
    const authority = resolveStudioAuthority(state);
    // Test buildWorld directly — not the full pipeline which requires complete state
    const worldOut = buildWorld(authority, undefined, state);
    expect(worldOut).not.toMatch(/POOL_WATER_REALISM_LOCK/);
  });

  it('does not contain SPLASH_PATTERN_PROHIBITION in world output', () => {
    const state = splashShotState();
    const authority = resolveStudioAuthority(state);
    const worldOut = buildWorld(authority, undefined, state);
    expect(worldOut).not.toMatch(/SPLASH_PATTERN_PROHIBITION/);
  });

  it('does not contain WATER_OPTICS_REALISM in world output', () => {
    const state = splashShotState();
    const authority = resolveStudioAuthority(state);
    const worldOut = buildWorld(authority, undefined, state);
    expect(worldOut).not.toMatch(/WATER_OPTICS_REALISM/);
  });
});
