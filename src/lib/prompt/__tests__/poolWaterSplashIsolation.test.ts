import { describe, it, expect } from 'vitest';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';
import { getAllowedStudioModifiers } from '../../productStudioV2/modifiers/studioModifierRegistry';
import { buildPhysics } from '../../productStudioV2/builders/buildPhysics';
import { genericPipeline } from '../../productStudioV2/pipelines/genericPipeline';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

/**
 * Regression guard: Pool Water must NEVER produce splash physics.
 * Splash Shot with dynamic motion MUST produce splash physics.
 *
 * Architecture contract:
 *   Pool Water  → world='water-surface', allowSplash=false, no STUDIO_MODIFIER_SPLASH, no STUDIO_PHYSICS_MODEL
 *   Splash Shot → world='splash-tank',   allowSplash=true (when motion=pouring), STUDIO_MODIFIER_SPLASH present
 */

function poolWaterState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    photoMode: 'Pool Water',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    requestedModifiers: ['splash'],   // even if splash is explicitly requested, it must be blocked
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

// ── Pool Water authority ────────────────────────────────────────────────────

describe('Pool Water — authority resolver', () => {
  it('resolves world to water-surface (not splash-tank)', () => {
    const authority = resolveStudioAuthority(poolWaterState());
    expect(authority.world).toBe('water-surface');
  });

  it('allowSplash is false', () => {
    const authority = resolveStudioAuthority(poolWaterState());
    expect(authority.permissions.allowSplash).toBe(false);
  });

  it('allowSplash is false even when motion is set to a dynamic value', () => {
    // Water-surface world does not grant splash regardless of motion
    const authority = resolveStudioAuthority(poolWaterState({ motion: 'pouring' }));
    expect(authority.world).toBe('water-surface');
    expect(authority.permissions.allowSplash).toBe(false);
  });

  it('allowAtmosphere remains true (water scene still needs atmosphere)', () => {
    const authority = resolveStudioAuthority(poolWaterState());
    expect(authority.permissions.allowAtmosphere).toBe(true);
  });
});

// ── Pool Water modifiers ────────────────────────────────────────────────────

describe('Pool Water — modifier registry', () => {
  it('splash modifier is never returned even when explicitly requested', () => {
    const authority = resolveStudioAuthority(poolWaterState());
    const modifiers = getAllowedStudioModifiers(authority, poolWaterState());
    expect(modifiers).not.toContain('splash');
  });
});

// ── Pool Water physics builder ──────────────────────────────────────────────

describe('Pool Water — buildPhysics', () => {
  it('returns empty string (no STUDIO_PHYSICS_MODEL)', () => {
    const state = poolWaterState();
    const authority = resolveStudioAuthority(state);
    const result = buildPhysics(authority, state);
    expect(result).toBe('');
  });
});

// ── Pool Water full pipeline prompt ────────────────────────────────────────

describe('Pool Water — full pipeline prompt', () => {
  it('does not contain STUDIO_MODIFIER_SPLASH', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).not.toMatch(/STUDIO_MODIFIER_SPLASH/i);
  });

  it('does not contain STUDIO_PHYSICS_MODEL', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).not.toMatch(/STUDIO_PHYSICS_MODEL/i);
  });

  it('contains water-surface world description', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/water.surface|pool water|caustic|refraction/i);
  });
});

// ── Splash Shot authority ───────────────────────────────────────────────────

describe('Splash Shot — authority resolver', () => {
  it('resolves world to splash-tank', () => {
    const authority = resolveStudioAuthority(splashShotState());
    expect(authority.world).toBe('splash-tank');
  });

  it('allowSplash is true when motion is dynamic', () => {
    const authority = resolveStudioAuthority(splashShotState());
    expect(authority.permissions.allowSplash).toBe(true);
  });

  it('allowSplash is false when motion is static', () => {
    // Splash Shot with static motion should NOT get splash physics
    const authority = resolveStudioAuthority(splashShotState({ motion: 'static' }));
    expect(authority.permissions.allowSplash).toBe(false);
  });
});

// ── Splash Shot modifiers ───────────────────────────────────────────────────

describe('Splash Shot — modifier registry', () => {
  it('splash modifier is returned when motion is dynamic and requested', () => {
    const state = splashShotState();
    const authority = resolveStudioAuthority(state);
    const modifiers = getAllowedStudioModifiers(authority, state);
    expect(modifiers).toContain('splash');
  });
});

// ── Splash Shot physics builder ─────────────────────────────────────────────

describe('Splash Shot — buildPhysics', () => {
  it('returns STUDIO_PHYSICS_MODEL when motion is dynamic', () => {
    const state = splashShotState();
    const authority = resolveStudioAuthority(state);
    const result = buildPhysics(authority, state);
    expect(result).toMatch(/STUDIO_PHYSICS_MODEL/);
  });
});

// ── Cross-mode isolation contract ──────────────────────────────────────────

describe('Cross-mode splash isolation contract', () => {
  it('Pool Water and Splash Shot produce different world values', () => {
    const pwAuthority = resolveStudioAuthority(poolWaterState());
    const ssAuthority = resolveStudioAuthority(splashShotState());
    expect(pwAuthority.world).not.toBe(ssAuthority.world);
  });

  it('Pool Water allowSplash=false while Splash Shot allowSplash=true', () => {
    const pwAuthority = resolveStudioAuthority(poolWaterState());
    const ssAuthority = resolveStudioAuthority(splashShotState());
    expect(pwAuthority.permissions.allowSplash).toBe(false);
    expect(ssAuthority.permissions.allowSplash).toBe(true);
  });
});
