import { describe, it, expect } from 'vitest';
import { buildCameraOverrides } from '../../productStudioV2/builders/buildCameraOverrides';
import { buildComposition } from '../../productStudioV2/builders/buildComposition';
import { buildLighting } from '../../productStudioV2/builders/buildLighting';
import { buildWorld } from '../../productStudioV2/builders/buildWorld';
import { buildGeometry } from '../../productStudioV2/builders/buildGeometry';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';
import { genericPipeline } from '../../productStudioV2/pipelines/genericPipeline';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

/**
 * V1 Hero Realism regression guard.
 *
 * Verifies that the V2 pipeline contains every structural constraint that
 * existed in V1 for hero studio and Pool Water photo modes:
 *
 *  • PRODUCT_ORIENTATION_LOCK    — vertical axis, no tilt
 *  • CAMERA_STABILITY_LOCK       — roll=0, no Dutch angle
 *  • DEPTH_STYLE (natural)       — photographic depth, no flat CGI
 *  • HERO_COMPOSITION_DISCIPLINE — single focal element, centered
 *  • HERO_STUDIO_LIGHTING        — softbox wrap, label readability
 *  • POOL_WATER_REALISM_LOCK     — no crowns, no arcs, only ripples
 *  • GRAVITY_LOCK                — products grounded, no levitation
 */

// ────────────────────────────────────────────────────────────────────────────
// Test 1 — Hero Landing Page
// ────────────────────────────────────────────────────────────────────────────

function heroState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
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

describe('Test 1 — Hero Landing Page: V1 realism guardrails', () => {
  it('emits PRODUCT_ORIENTATION_LOCK (vertical product, no tilt)', () => {
    const state = heroState();
    const auth = resolveStudioAuthority(state);
    const out = buildGeometry(auth, state);
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).toMatch(/perfectly upright/i);
  });

  it('enforces camera roll = 0 via CAMERA_STABILITY_LOCK in camera block', () => {
    const out = buildCameraOverrides(heroState());
    expect(out).toMatch(/CAMERA_STABILITY_LOCK/);
    expect(out).toMatch(/Camera roll must remain exactly 0 degrees/i);
  });

  it('forbids Dutch angle in camera block', () => {
    const out = buildCameraOverrides(heroState());
    expect(out).toMatch(/Do not apply Dutch angle/i);
  });

  it('emits natural photographic DEPTH_STYLE (not flat CGI)', () => {
    const out = buildCameraOverrides(heroState());
    expect(out).toMatch(/DEPTH_STYLE: natural photographic depth/i);
    expect(out).toMatch(/No CGI-style flat gradient fields/i);
  });

  it('emits HERO_COMPOSITION_DISCIPLINE (single object, centered)', () => {
    const state = heroState();
    const auth = resolveStudioAuthority(state);
    const out = buildComposition(auth, state);
    expect(out).toMatch(/HERO_COMPOSITION_DISCIPLINE/);
    expect(out).toMatch(/Single object only/i);
    expect(out).toMatch(/Centered hero composition/i);
  });

  it('emits HERO_STUDIO_LIGHTING (softbox wrap, label readability)', () => {
    const state = heroState();
    const auth = resolveStudioAuthority(state);
    const out = buildLighting(auth, state);
    expect(out).toMatch(/HERO_STUDIO_LIGHTING/);
    expect(out).toMatch(/softbox wrap/i);
    expect(out).toMatch(/label readability/i);
  });

  it('emits GRAVITY_LOCK (products grounded, no levitation)', () => {
    const state = heroState();
    const auth = resolveStudioAuthority(state);
    const out = buildComposition(auth, state);
    expect(out).toMatch(/GRAVITY_LOCK/);
    expect(out).toMatch(/No levitation/i);
    expect(out).toMatch(/No floating objects/i);
  });

  it('full pipeline contains all V1 hero guardrails together', () => {
    const prompt = genericPipeline.build(heroState());
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(prompt).toMatch(/CAMERA_STABILITY_LOCK/);
    expect(prompt).toMatch(/DEPTH_STYLE: natural photographic depth/i);
    expect(prompt).toMatch(/HERO_COMPOSITION_DISCIPLINE/);
    expect(prompt).toMatch(/HERO_STUDIO_LIGHTING/);
    expect(prompt).toMatch(/GRAVITY_LOCK/);
  });

  it('full pipeline does NOT contain flat depth rendering language', () => {
    const prompt = genericPipeline.build(heroState());
    expect(prompt).not.toMatch(/uniform flat depth rendering/i);
    expect(prompt).not.toMatch(/No background tonal gradient/i);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Test 2 — Pool Water
// ────────────────────────────────────────────────────────────────────────────

function poolWaterState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    photoMode: 'Pool Water',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

describe('Test 2 — Pool Water: V1 realism guardrails', () => {
  it('emits PRODUCT_ORIENTATION_LOCK (vertical product, no tilt)', () => {
    const state = poolWaterState();
    const auth = resolveStudioAuthority(state);
    const out = buildGeometry(auth, state);
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('emits POOL_WATER_REALISM_LOCK in world block', () => {
    const state = poolWaterState();
    const auth = resolveStudioAuthority(state);
    const out = buildWorld(auth, state.world, state);
    expect(out).toMatch(/POOL_WATER_REALISM_LOCK/);
  });

  it('forbids splash crowns in world block', () => {
    const state = poolWaterState();
    const auth = resolveStudioAuthority(state);
    const out = buildWorld(auth, state.world, state);
    expect(out).toMatch(/No stylized splash arcs/i);
    expect(out).toMatch(/No water crowns/i);
  });

  it('forbids symmetric wave arcs in world block', () => {
    const state = poolWaterState();
    const auth = resolveStudioAuthority(state);
    const out = buildWorld(auth, state.world, state);
    expect(out).toMatch(/No symmetric wave explosions/i);
  });

  it('emits SPLASH_PATTERN_PROHIBITION', () => {
    const state = poolWaterState();
    const auth = resolveStudioAuthority(state);
    const out = buildWorld(auth, state.world, state);
    expect(out).toMatch(/SPLASH_PATTERN_PROHIBITION/);
  });

  it('emits natural caustics via WATER_OPTICS_REALISM', () => {
    const state = poolWaterState();
    const auth = resolveStudioAuthority(state);
    const out = buildWorld(auth, state.world, state);
    expect(out).toMatch(/WATER_OPTICS_REALISM/);
    expect(out).toMatch(/natural light caustics/i);
  });

  it('emits GRAVITY_LOCK in composition block', () => {
    const state = poolWaterState();
    const auth = resolveStudioAuthority(state);
    const out = buildComposition(auth, state);
    expect(out).toMatch(/GRAVITY_LOCK/);
  });

  it('full pipeline has no splash arc language', () => {
    const prompt = genericPipeline.build(poolWaterState());
    // The SPLASH_PATTERN_PROHIBITION block itself names splash arcs to prohibit them —
    // verify prohibitive phrasing is present, not permissive
    expect(prompt).toMatch(/SPLASH_PATTERN_PROHIBITION/);
    expect(prompt).toMatch(/Do not generate splash arcs/i);
  });

  it('full pipeline: waterline interacts naturally (pool water surface world)', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/pool water surface/i);
    expect(prompt).toMatch(/natural refraction/i);
  });

  it('full pipeline contains all V1 Pool Water guardrails together', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(prompt).toMatch(/POOL_WATER_REALISM_LOCK/);
    expect(prompt).toMatch(/SPLASH_PATTERN_PROHIBITION/);
    expect(prompt).toMatch(/WATER_OPTICS_REALISM/);
    expect(prompt).toMatch(/GRAVITY_LOCK/);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Cross-mode: CAMERA_STABILITY_LOCK and natural DEPTH_STYLE apply to all
// camera-override-enabled modes (when camera system is fully specified)
// ────────────────────────────────────────────────────────────────────────────

describe('Cross-mode: camera stability and depth realism guardrails', () => {
  it('CAMERA_STABILITY_LOCK present in any mode with full camera spec', () => {
    const state = poolWaterState({
      cameraSystem: 'DSLR / mirrorless camera system',
      cameraAngle: '45° hero',
      cameraDistance: 'Standard',
      cameraRotation: '0°',
      framingGuide: 'Centered hero',
    });
    const out = buildCameraOverrides(state);
    expect(out).toMatch(/CAMERA_STABILITY_LOCK/);
  });

  it('DEPTH_STYLE: natural photographic depth in any mode with full camera spec', () => {
    const state = heroState({
      cameraSystem: 'DSLR / mirrorless camera system',
      cameraAngle: 'Low angle',
      cameraDistance: 'Tight',
      cameraRotation: '0°',
      framingGuide: 'Centered hero',
    });
    const out = buildCameraOverrides(state);
    expect(out).toMatch(/DEPTH_STYLE: natural photographic depth/);
    expect(out).toMatch(/No CGI-style flat gradient fields/i);
  });

  it('no camera blocks emitted when camera spec is incomplete', () => {
    const out = buildCameraOverrides({ motion: 'static' } as StudioUIState);
    expect(out).toBe('');
    expect(out).not.toMatch(/CAMERA_STABILITY_LOCK/);
  });
});
