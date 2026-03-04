import { describe, it, expect } from 'vitest';
import { buildGeometry } from '../../productStudioV2/builders/buildGeometry';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';
import { genericPipeline } from '../../productStudioV2/pipelines/genericPipeline';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

/**
 * Regression guard: product must be perfectly upright by default.
 * Tilt is only permitted when rotationEnabled = true.
 *
 * Architecture contract:
 *   rotationEnabled = false (default) → PRODUCT_ORIENTATION_LOCK + VERTICAL_AXIS_ALIGNMENT + CAMERA_ORIENTATION_LOCK
 *   rotationEnabled = true            → PRODUCT_ORIENTATION with user angle, no lock blocks
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

describe('buildGeometry — default orientation lock', () => {
  it('emits PRODUCT_ORIENTATION_LOCK when rotationEnabled is not set', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
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

  it('explicitly forbids tilt and lean', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/Do not tilt, lean, or rotate/i);
    expect(out).toMatch(/No diagonal orientation/i);
    expect(out).toMatch(/No perspective lean/i);
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

  it('still emits GEOMETRY_LOCK alongside orientation blocks', () => {
    const state = baseState();
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/GEOMETRY_LOCK/);
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });
});

// ── buildGeometry — rotation explicitly false ─────────────────────────────

describe('buildGeometry — rotationEnabled: false is identical to default', () => {
  it('emits orientation lock when rotationEnabled is explicitly false', () => {
    const state = baseState({ rotationEnabled: false });
    const out = buildGeometry(authority(state), state);
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
    expect(out).toMatch(/CAMERA_ORIENTATION_LOCK/);
  });

  it('does not emit user rotation angle when rotationEnabled is false', () => {
    const state = baseState({ rotationEnabled: false, rotationAngle: 15 });
    const out = buildGeometry(authority(state), state);
    // Lock blocks present, no PRODUCT_ORIENTATION user override
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
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
