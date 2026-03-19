import { describe, expect, it } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../index';
import type { ProductStudioState, PhotoMode } from '../../productStudio/types';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';

function makeWineState(photoMode: PhotoMode, overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
    industryProfile: 'wine',
    visualProfile: 'wine',
    photoMode,
    contextPreset: 'Dark Luxury Studio',
    definition: { type: 'custom' } as ProductStudioState['definition'],
    ...overrides,
  } as ProductStudioState;
}

describe('wine concept modes', () => {
  it('keeps bottle + glass composition aligned with served-open wine physics', () => {
    const mapped = toStudioV2State(makeWineState('Bottle + Glass'));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('served');
    expect(mapped.wineBottleFillMode).toBe('just-opened');
    expect(mapped.wineGlassMode).toBe('filled');
    expect(mapped.wineBottleState).toBe('opened-with-cork-nearby');
    expect(prompt).toContain('bottleState=open; serveState=served;');
    expect(prompt).toContain('COMPOSITION: BOTTLE_AND_GLASS. Opened service bottle and filled wine glass.');
    expect(prompt).toContain('PHOTO_MODE: Bottle + Glass.');
    expect(prompt).not.toContain('Sealed bottle and filled wine glass.');
  });

  it('maps bottle + glass pour to controlled pour wine state', () => {
    const mapped = toStudioV2State(makeWineState('Bottle + Glass Pour'));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('pouring');
    expect(mapped.wineBottleFillMode).toBe('partially-served');
    expect(mapped.wineAction).toBe('controlled-pour');
    expect(mapped.wineGlassMode).toBe('filled');
    expect(mapped.wineBottleState).toBe('opened-with-cork-nearby');
    expect(prompt).toContain('serveState=pouring;');
    expect(prompt).toContain('SCENE_STYLE: real wine hospitality photography with controlled pour motion.');
    expect(prompt).toContain('BOTTLE_TILT_PHYSICS:');
    expect(prompt).toContain('LIQUID_STREAM_PHYSICS:');
    expect(prompt).toContain('must not look suspended');
    expect(prompt).toContain('No levitating bottle.');
    expect(prompt).toContain('supported from off-frame or by a cropped hand');
    expect(prompt).toContain('Never emit liquid from below the bottle rim');
  });

  it('preserves just-opened served bottles as near-full service instead of half-empty', () => {
    const mapped = toStudioV2State(
      makeWineState('Bottle + Glass', {
        wineServeMode: 'served',
        wineBottleFillMode: 'just-opened',
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('freshly opened');
    expect(prompt).not.toContain('visibly below retail-full level because wine has been poured into the glass');
  });

  it('renders lineup comparison as wine-family comparison instead of hero fallback', () => {
    const mapped = toStudioV2State(
      makeWineState('Wine Lineup Comparison', {
        wineServeMode: 'served',
        wineBottleFillMode: 'partially-served',
        wineGlassMode: 'filled',
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('bottle-only');
    expect(prompt).toContain('SCENE_STYLE: real wine lineup photography with clean varietal spacing and brand-family balance.');
    expect(prompt).toContain('PHOTO_MODE: Wine Lineup Comparison.');
    expect(prompt).toContain('NO_GLASS: No wine glass in the scene.');
    expect(prompt).not.toContain('WINE_GLASS:');
    expect(prompt).not.toContain('PHOTO_MODE_SCENE: Clean studio hero composition.');
  });

  it('forces winery scene environment ownership and emits dedicated winery scene guidance', () => {
    const mapped = toStudioV2State(makeWineState('Winery Scene', { contextPreset: 'Dark Luxury Studio' }));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineEnvironmentVariation).toBe('dark-cellar');
    expect(prompt).toContain('WINE_ENVIRONMENT: dark-cellar.');
    expect(prompt).toContain('PHOTO_MODE: Winery Scene.');
    expect(prompt).toContain('SCENE_STYLE: real wine photography in an authentic cellar or winery environment.');
    expect(prompt).not.toContain('WINE_ENVIRONMENT: black-studio.');
  });

  it('maps explicit wine environment selection from the wine module into the V2 environment variation', () => {
    const mapped = toStudioV2State(
      makeWineState('Hero Landing Page', {
        contextPreset: '',
        wineEnvironment: 'Marble Bar',
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineEnvironment).toBe('Marble Bar');
    expect(mapped.wineEnvironmentVariation).toBe('marble-bar');
    expect(mapped.autoRandomizeWineEnvironment).toBe(false);
    expect(prompt).toContain('WINE_ENVIRONMENT: marble-bar.');
  });

  it('uses explicit sparkling flute guidance when selected for served wine scenes', () => {
    const mapped = toStudioV2State(
      makeWineState('Bottle + Glass Pour', {
        wineType: 'sparkling-white',
        wineGlassType: 'sparkling-flute' as any,
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('a slender sparkling flute');
  });

  it('renders bottle in hand cutout as cropped-hand wine concept', () => {
    const mapped = toStudioV2State(makeWineState('Bottle In Hand Cutout'));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('SCENE_STYLE: real cutout wine bottle photography with minimal backdrop and natural capture response.');
    expect(prompt).toContain('PHOTO_MODE: Bottle In Hand Cutout.');
    expect(prompt).toContain('Single cropped hand or forearm only.');
    expect(prompt).toContain('No torso.');
  });

  it('maps hosting pour to a wine lifestyle pouring state instead of static served mode', () => {
    const mapped = toStudioV2State(
      makeWineState('Hosting Pour', {
        sceneType: 'lifestyle-real',
      } as any)
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('pouring');
    expect(mapped.wineAction).toBe('controlled-pour');
    expect(prompt).toContain('serveState=pouring;');
    expect(prompt).toContain('PHOTO_MODE: Hosting Pour.');
    expect(prompt).toContain('ACTION_ONLY_POLICY: No portrait subject. No hero human figure.');
    expect(prompt).toContain('Only incidental hands, cropped arms, or partial cues needed to support the pour action.');
    expect(prompt).toContain('No floating bottle.');
  });

  it('renders outdoor toast as a wine lifestyle social scene rather than a studio fallback', () => {
    const mapped = toStudioV2State(
      makeWineState('Outdoor Toast', {
        sceneType: 'lifestyle-real',
      } as any)
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('PHOTO_MODE: Outdoor Toast.');
    expect(prompt).toContain('SCENE_STYLE: real product-lifestyle outdoor wine photography');
    expect(prompt).toContain('ACTION_ONLY_POLICY: No portrait subject. No hero human figure.');
    expect(prompt).toContain('partial seated bodies may appear only as supporting toast context');
    expect(prompt).toContain('garden hospitality cues');
    expect(prompt).not.toContain('PHOTO_MODE_SCENE: Clean studio hero composition.');
  });
});
