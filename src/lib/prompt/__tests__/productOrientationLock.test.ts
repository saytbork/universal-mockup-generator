import { describe, it, expect } from 'vitest';
import { buildGeometry } from '../../productStudioV2/builders/buildGeometry';
import { buildProductOrientation } from '../../productStudioV2/builders/buildProductOrientation';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';
import { genericPipeline } from '../../productStudioV2/pipelines/genericPipeline';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

/**
 * Regression guard: product must be perfectly upright by default.
 * Tilt is only permitted when rotationEnabled = true AND productOrientation = 'free'.
 *
 * Architecture contract (Phase 12):
 *   PRODUCT_ORIENTATION_LOCK is emitted EXCLUSIVELY by buildProductOrientation.
 *   buildGeometry emits VERTICAL_AXIS_ALIGNMENT + CAMERA_ORIENTATION_LOCK (geometry domain)
 *   but NOT PRODUCT_ORIENTATION_LOCK — that guardrail lives in buildProductOrientation.
 *
 *   rotationEnabled = false (default) →
 *     buildGeometry:          GEOMETRY_LOCK + VERTICAL_AXIS_ALIGNMENT + CAMERA_ORIENTATION_LOCK
 *     buildProductOrientation: PRODUCT_ORIENTATION_LOCK + VERTICAL_AXIS_ALIGNMENT + CAMERA_ROLL_LOCK
 *
 *   rotationEnabled = true + productOrientation = 'free' →
 *     buildGeometry:          GEOMETRY_LOCK + PRODUCT_ORIENTATION (user angle note)
 *     buildProductOrientation: USER_ROTATION_OVERRIDE (no lock blocks)
 */

function baseState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    photoMode: 'Pool Water',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

function authority(state: StudioUIState) {
  return resolveStudioAuthority(state);
}

// ── buildGeometry — default (no rotation) ────────────────────────────────
// NOTE: As of Phase 12, PRODUCT_ORIENTATION_LOCK is owned by buildProductOrientation.
// buildGeometry emits VERTICAL_AXIS_ALIGNMENT and CAMERA_ORIENTATION_LOCK only.

describe('buildGeometry — default orientation lock', () => {
  it('does NOT emit PRODUCT_ORIENTATION_LOCK (that is owned by buildProductOrientation)', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).not.toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('emits VERTICAL_AXIS_ALIGNMENT when rotationEnabled is not set', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });

  it('emits CAMERA_ORIENTATION_LOCK when rotationEnabled is not set', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/CAMERA_ORIENTATION_LOCK/);
  });

  it('still emits GEOMETRY_LOCK', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/GEOMETRY_LOCK/);
  });

  it('explicitly forbids Dutch angle on camera', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/Camera roll must remain 0 degrees/i);
    expect(out).toMatch(/Do not simulate Dutch angle/i);
  });

  it('explicitly enforces vertical axis alignment to gravity', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/perpendicular to the ground plane/i);
    expect(out).toMatch(/align vertically with gravity/i);
  });
});

// ── buildGeometry — rotation explicitly false ─────────────────────────────

describe('buildGeometry — rotationEnabled: false is identical to default', () => {
  it('emits VERTICAL_AXIS_ALIGNMENT and CAMERA_ORIENTATION_LOCK when rotationEnabled is explicitly false', () => {
    const state = baseState({ rotationEnabled: false });
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
    expect(out).toMatch(/CAMERA_ORIENTATION_LOCK/);
  });

  it('does not emit user rotation angle when rotationEnabled is false', () => {
    const state = baseState({ rotationEnabled: false, rotationAngle: 15 });
    const out = buildGeometry(authority(state), state);
    // No PRODUCT_ORIENTATION user override in buildGeometry
    expect(out).not.toMatch(/User-defined rotation active/);
  });
});

// ── buildGeometry — rotation explicitly enabled ───────────────────────────

describe('buildGeometry — rotationEnabled: true unlocks tilt', () => {
  it('does NOT emit PRODUCT_ORIENTATION_LOCK when rotationEnabled is true', () => {
    const state = baseState({ rotationEnabled: true, rotationAngle: 15 });
    const out = buildGeometry(authority(state), state);
    expect(out).not.toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('does NOT emit VERTICAL_AXIS_ALIGNMENT when rotationEnabled is true', () => {
    const state = baseState({ rotationEnabled: true, rotationAngle: 15 });
    const out = buildGeometry(authority(state), state);
    expect(out).not.toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });

  it('does NOT emit CAMERA_ORIENTATION_LOCK when rotationEnabled is true', () => {
    const state = baseState({ rotationEnabled: true, rotationAngle: 15 });
    const out = buildGeometry(authority(state), state);
    expect(out).not.toMatch(/CAMERA_ORIENTATION_LOCK/);
  });

  it('emits user-defined rotation directive with correct angle', () => {
    const state = baseState({ rotationEnabled: true, rotationAngle: 15 });
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/User-defined rotation active/);
    expect(out).toMatch(/15°/);
  });

  it('emits 0° rotation when rotationEnabled is true with no angle', () => {
    const state = baseState({ rotationEnabled: true });
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/User-defined rotation active/);
    expect(out).toMatch(/0°/);
  });

  it('still emits GEOMETRY_LOCK when rotationEnabled is true', () => {
    const state = baseState({ rotationEnabled: true, rotationAngle: 30 });
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/GEOMETRY_LOCK/);
  });
});

// ── Full pipeline — Pool Water orientation lock ───────────────────────────

describe('Full pipeline — Pool Water prompt contains orientation lock', () => {
  it('contains PRODUCT_ORIENTATION_LOCK in final prompt', () => {
    const prompt = genericPipeline.build(baseState());
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('contains VERTICAL_AXIS_ALIGNMENT in final prompt', () => {
    const prompt = genericPipeline.build(baseState());
    expect(prompt).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });

  it('contains CAMERA_ORIENTATION_LOCK in final prompt', () => {
    const prompt = genericPipeline.build(baseState());
    expect(prompt).toMatch(/CAMERA_ORIENTATION_LOCK/);
  });
});

// ── Full pipeline — orientation lock on other photo modes ─────────────────

describe('Full pipeline — orientation lock applies universally', () => {
  it('Hero Landing Page gets orientation lock by default', () => {
    const state = baseState({
      photoMode: 'Hero Landing Page',
      productPaletteSource: 'Brand Colors',
      brandPalette: { primaryColor: '#336699' },
    });
    const prompt = genericPipeline.build(state);
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('Ingredient Stack gets orientation lock by default', () => {
    const state = baseState({ photoMode: 'Ingredient Stack' });
    const prompt = genericPipeline.build(state);
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });
});
