import { describe, it, expect } from 'vitest';
import { buildProductOrientation } from '../../productStudioV2/builders/buildProductOrientation';
import { resolveStudioAuthority } from '../../productStudioV2/authority/studioAuthorityResolver';
import { genericPipeline } from '../../productStudioV2/pipelines/genericPipeline';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes';

/**
 * Global product vertical-axis safety system tests.
 *
 * Architecture contract:
 *   rotationEnabled = false/unset (default)
 *     → PRODUCT_ORIENTATION_LOCK + VERTICAL_AXIS_ALIGNMENT + CAMERA_ROLL_LOCK
 *
 *   rotationEnabled = true AND productOrientation = "free"
 *     → USER_ROTATION_OVERRIDE (lock blocks absent — tilt is intentional)
 *
 *   rotationEnabled = true but productOrientation ≠ "free"
 *     → still locked (both signals must agree to unlock)
 *
 * Pool Water, Hero Landing Page, and Ingredient Stack are exercised via
 * the full pipeline to confirm orientation safety applies to every photo mode.
 */

// ── helpers ──────────────────────────────────────────────────────────────────

function baseState(overrides: Partial<StudioUIState> = {}): StudioUIState {
  return {
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    ...overrides,
  } as StudioUIState;
}

// ── Test 1: Default state ─────────────────────────────────────────────────────

describe('buildProductOrientation — Test 1: default state', () => {
  it('emits PRODUCT_ORIENTATION_LOCK when no rotation fields are set', () => {
    const out = buildProductOrientation(baseState());
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('emits VERTICAL_AXIS_ALIGNMENT when no rotation fields are set', () => {
    const out = buildProductOrientation(baseState());
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });

  it('emits CAMERA_ROLL_LOCK when no rotation fields are set', () => {
    const out = buildProductOrientation(baseState());
    expect(out).toMatch(/CAMERA_ROLL_LOCK/);
  });

  it('PRODUCT_ORIENTATION_LOCK forbids tilt and lean', () => {
    const out = buildProductOrientation(baseState());
    expect(out).toMatch(/No tilt/i);
    expect(out).toMatch(/No lean/i);
    expect(out).toMatch(/No diagonal orientation/i);
  });

  it('PRODUCT_ORIENTATION_LOCK enforces perpendicular center axis', () => {
    const out = buildProductOrientation(baseState());
    expect(out).toMatch(/perpendicular to the ground plane/i);
    expect(out).toMatch(/label plane must face the camera/i);
  });

  it('VERTICAL_AXIS_ALIGNMENT enforces neck-gravity alignment', () => {
    const out = buildProductOrientation(baseState());
    expect(out).toMatch(/bottle neck must align vertically with gravity/i);
    expect(out).toMatch(/product base must sit level/i);
  });

  it('CAMERA_ROLL_LOCK forbids Dutch angle', () => {
    const out = buildProductOrientation(baseState());
    expect(out).toMatch(/Camera roll must remain 0 degrees/i);
    expect(out).toMatch(/Do not apply Dutch angle/i);
    expect(out).toMatch(/Do not tilt the camera frame/i);
  });

  it('does NOT emit USER_ROTATION_OVERRIDE in default state', () => {
    const out = buildProductOrientation(baseState());
    expect(out).not.toMatch(/USER_ROTATION_OVERRIDE/);
  });

  it('emits lock blocks when undefined state is passed', () => {
    const out = buildProductOrientation(undefined);
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
    expect(out).toMatch(/CAMERA_ROLL_LOCK/);
  });

  it('emits lock blocks when rotationEnabled = false explicitly', () => {
    const out = buildProductOrientation(baseState({ rotationEnabled: false }));
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
    expect(out).toMatch(/CAMERA_ROLL_LOCK/);
  });

  it('ignores rotationAngle when rotationEnabled = false', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: false, rotationAngle: 45 })
    );
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).not.toMatch(/USER_ROTATION_OVERRIDE/);
    expect(out).not.toMatch(/45°/);
  });

  it('emits lock blocks when productOrientation = "upright" explicitly', () => {
    const out = buildProductOrientation(
      baseState({ productOrientation: 'upright' })
    );
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });
});

// ── Test 2: Rotation enabled ──────────────────────────────────────────────────

describe('buildProductOrientation — Test 2: rotation enabled', () => {
  it('emits USER_ROTATION_OVERRIDE when rotationEnabled=true and productOrientation="free"', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'free', rotationAngle: 15 })
    );
    expect(out).toMatch(/USER_ROTATION_OVERRIDE/);
  });

  it('embeds the exact rotation angle in USER_ROTATION_OVERRIDE', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'free', rotationAngle: 15 })
    );
    expect(out).toMatch(/15°/);
  });

  it('PRODUCT_ORIENTATION_LOCK is absent when rotation is enabled', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'free', rotationAngle: 15 })
    );
    expect(out).not.toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('VERTICAL_AXIS_ALIGNMENT is absent when rotation is enabled', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'free', rotationAngle: 15 })
    );
    expect(out).not.toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });

  it('CAMERA_ROLL_LOCK is absent when rotation is enabled', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'free', rotationAngle: 15 })
    );
    expect(out).not.toMatch(/CAMERA_ROLL_LOCK/);
  });

  it('uses 0° when rotationAngle is unset but rotationEnabled=true with free orientation', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'free' })
    );
    expect(out).toMatch(/USER_ROTATION_OVERRIDE/);
    expect(out).toMatch(/0°/);
  });

  it('rotation 30° is reflected in override text', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'free', rotationAngle: 30 })
    );
    expect(out).toMatch(/30°/);
    expect(out).not.toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  // Safety gate: rotationEnabled=true but productOrientation is NOT "free" → still locked
  it('still locks when rotationEnabled=true but productOrientation="upright"', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, productOrientation: 'upright', rotationAngle: 20 })
    );
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).not.toMatch(/USER_ROTATION_OVERRIDE/);
  });

  it('still locks when rotationEnabled=true but productOrientation is unset', () => {
    const out = buildProductOrientation(
      baseState({ rotationEnabled: true, rotationAngle: 20 })
    );
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(out).not.toMatch(/USER_ROTATION_OVERRIDE/);
  });
});

// ── Test 3: Pool Water mode — product always upright ─────────────────────────

describe('buildProductOrientation — Test 3: Pool Water mode', () => {
  function poolWaterState(overrides: Partial<StudioUIState> = {}): StudioUIState {
    return baseState({
      photoMode: 'Pool Water',
      motion: 'static',
      ...overrides,
    });
  }

  it('emits PRODUCT_ORIENTATION_LOCK in Pool Water mode', () => {
    const out = buildProductOrientation(poolWaterState());
    expect(out).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('emits VERTICAL_AXIS_ALIGNMENT in Pool Water mode', () => {
    const out = buildProductOrientation(poolWaterState());
    expect(out).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });

  it('emits CAMERA_ROLL_LOCK in Pool Water mode', () => {
    const out = buildProductOrientation(poolWaterState());
    expect(out).toMatch(/CAMERA_ROLL_LOCK/);
  });

  it('does not emit USER_ROTATION_OVERRIDE in Pool Water mode by default', () => {
    const out = buildProductOrientation(poolWaterState());
    expect(out).not.toMatch(/USER_ROTATION_OVERRIDE/);
  });

  it('vertical axis preserved — no tilt/lean/diagonal in Pool Water', () => {
    const out = buildProductOrientation(poolWaterState());
    expect(out).toMatch(/No tilt/i);
    expect(out).toMatch(/No lean/i);
    expect(out).toMatch(/No diagonal orientation/i);
  });

  it('full Pool Water pipeline includes PRODUCT_ORIENTATION_LOCK', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
  });

  it('full Pool Water pipeline includes VERTICAL_AXIS_ALIGNMENT', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
  });

  it('full Pool Water pipeline includes CAMERA_ROLL_LOCK', () => {
    const prompt = genericPipeline.build(poolWaterState());
    expect(prompt).toMatch(/CAMERA_ROLL_LOCK/);
  });
});

// ── Full pipeline integration ─────────────────────────────────────────────────

describe('buildProductOrientation — full pipeline integration', () => {
  it('Hero Landing Page pipeline includes all three orientation lock blocks', () => {
    const prompt = genericPipeline.build(
      baseState({ photoMode: 'Hero Landing Page' })
    );
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(prompt).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
    expect(prompt).toMatch(/CAMERA_ROLL_LOCK/);
  });

  it('Ingredient Stack pipeline includes all three orientation lock blocks', () => {
    const prompt = genericPipeline.build(
      baseState({ photoMode: 'Ingredient Stack', composition: 'ingredient-stack' })
    );
    expect(prompt).toMatch(/PRODUCT_ORIENTATION_LOCK/);
    expect(prompt).toMatch(/VERTICAL_AXIS_ALIGNMENT/);
    expect(prompt).toMatch(/CAMERA_ROLL_LOCK/);
  });

  it('orientation builder fires after geometry in pipeline output order', () => {
    const prompt = genericPipeline.build(baseState());
    const geometryIdx = prompt.indexOf('GEOMETRY_LOCK');
    const orientationIdx = prompt.indexOf('PRODUCT_ORIENTATION_LOCK');
    // buildProductOrientation runs after buildGeometry — its blocks appear later
    expect(geometryIdx).toBeGreaterThanOrEqual(0);
    expect(orientationIdx).toBeGreaterThanOrEqual(0);
    // The second PRODUCT_ORIENTATION_LOCK (from buildProductOrientation) must come
    // after GEOMETRY_LOCK in the final prompt string
    expect(orientationIdx).toBeGreaterThan(geometryIdx);
  });

  it('wine prestige mode bypasses buildProductOrientation', () => {
    const out = buildProductOrientation(
      baseState({ winePrestigeMode: true })
    );
    expect(out).toBe('');
  });

  it('advanced controls mode bypasses buildProductOrientation', () => {
    const out = buildProductOrientation(
      baseState({ advancedControls: true })
    );
    expect(out).toBe('');
  });
});
