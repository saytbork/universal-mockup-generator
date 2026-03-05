import { describe, it, expect } from 'vitest';
import { buildPhotoModeDynamic } from '../builders/buildPhotoModeDynamic';
import { buildIngredients } from '../builders/buildIngredients';
import { buildWorld } from '../builders/buildWorld';
import type { StudioUIState } from '../types/studioTypes';

describe('Textured Bed / Scatter Base contracts', () => {
  it('emits strict textured bed contract with user ingredient authority and depth control', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'flat-lay',
      photoMode: 'Textured Bed / Scatter Base',
      ingredientObjects: 'rolled oats, dried lavender',
      photoModeDynamicSettings: {
        depthLevel: 'Immersive',
      },
    };

    const block = buildPhotoModeDynamic(state);

    expect(block).toContain('REFERENCE_PRODUCT_LOCK:');
    expect(block).toContain('TEXTURED_BED_INGREDIENT_AUTHORITY: The ingredient bed must be built exclusively from: rolled oats, dried lavender.');
    expect(block).toContain('TEXTURED_BED_CAMERA_LOCK: True top-down flat lay only (90 degrees overhead).');
    expect(block).toContain('DEPTH_LEVEL_CONTROL: Immersive -> deep immersion');
    expect(block).toContain('LABEL_CLEARANCE_RULE:');
  });

  it('flags missing user-defined ingredients as validation failure', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'flat-lay',
      photoMode: 'Textured Bed / Scatter Base',
    };

    const block = buildPhotoModeDynamic(state);
    expect(block).toContain('<MISSING_USER_DEFINED_INGREDIENTS>');
    expect(block).toContain('TEXTURED_BED_VALIDATION: Missing user-defined ingredients.');
  });

  it('buildIngredients enforces textured-bed-only ingredient policy', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'flat-lay',
      photoMode: 'Textured Bed / Scatter Base',
      ingredientObjects: 'sea salt flakes, rosemary',
    };

    const block = buildIngredients(state);
    expect(block).toContain('TEXTURED_BED_INGREDIENT_AUTHORITY: Build the textured bed exclusively from: sea salt flakes, rosemary.');
    expect(block).toContain('TEXTURED_BED_PROHIBITED_DEFAULTS:');
    expect(block).toContain('No coffee beans.');
  });
});

describe('Gel Smear Editorial contracts', () => {
  it('injects strict gel smear editorial scene rules', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      photoMode: 'Gel Smear Editorial',
      photoModeDynamicSettings: {
        smearWidth: 'Balanced',
      },
    };

    const block = buildPhotoModeDynamic(state);
    expect(block).toContain('GEL_SMEAR_EDITORIAL_SCENE:');
    expect(block).toContain('GEL_SMEAR_MATERIAL_TRUTH:');
    expect(block).toContain('PRODUCT_PROTECTION_RULE: Smear must not cover product label.');
    expect(block).toContain('SURFACE_RULE: Neutral premium stone/concrete/cosmetic slab');
    expect(block).toContain('No background gradients.');
    expect(block).toContain('No props. No clutter.');
  });

  it('world scene mapping for Gel Smear keeps slab/no-gradient constraints', () => {
    const state: StudioUIState = {
      motion: 'static',
      composition: 'hero',
      photoMode: 'Gel Smear Editorial',
    };

    const world = buildWorld(
      {
        creativeIntent: 'conversion',
        world: 'studio',
        motion: 'static',
        composition: 'hero',
        permissions: {
          allowSplash: false,
          allowAtmosphere: false,
          allowParticles: false,
          allowHorizontalSpread: true,
          allowVerticalDominance: true,
        },
      },
      undefined,
      state
    );

    expect(world).toContain('premium editorial gel-smear composition on neutral stone/concrete cosmetic slab');
    expect(world).toContain('no background gradients');
    expect(world).toContain('no props, no clutter');
  });
});
