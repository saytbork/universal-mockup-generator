import { test, expect } from 'playwright/test';
import { mapSceneToPrompt } from '../src/lib/productStudio/mapSceneToPrompt';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../src/lib/productStudio/store';

const buildPrompt = (overrides: Record<string, unknown> = {}) =>
  mapSceneToPrompt({
    ...DEFAULT_PRODUCT_STUDIO_STATE,
    sceneType: 'studio-branding',
    mode: 'studio',
    environmentContext: null,
    ...overrides,
  } as any).prompt;

test.describe('ProductStudio authority resolution pipeline', () => {
  test('no contradictory motion blocks', () => {
    const prompt = buildPrompt({
      photoMode: 'Splash Shot',
      stateMotion: 'static',
    });

    expect((prompt.match(/PRODUCT_STATE_MOTION:/g) || []).length).toBe(1);
    expect(prompt).toContain('PRODUCT_STATE_MOTION: static.');
    expect(prompt).not.toMatch(/PRODUCT_STATE_MOTION:\s*(falling|pouring|spilled|dispensed)\./i);
  });

  test('lighting authority is singular', () => {
    const prompt = buildPrompt({
      photoMode: 'Brand Campaign',
      visualIntent: 'campaign',
      qualityProfile: 'luxury-brand',
    });

    expect((prompt.match(/LIGHTING AUTHORITY:/g) || []).length).toBe(1);
    expect(prompt).toContain('LIGHTING AUTHORITY: natural-sunlight.');
  });

  test('no duplicate visual intent lines', () => {
    const prompt = buildPrompt({
      photoMode: 'Color Pop Hero',
      qualityProfile: 'clinical',
      visualIntent: 'conversion',
    });

    expect((prompt.match(/VISUAL INTENT:/g) || []).length).toBe(1);
  });

  test('split-level 1:1 vertical subject disables lateral spread', () => {
    const prompt = buildPrompt({
      photoMode: 'Underwater Split',
      aspectRatio: '1:1',
      visualIntent: 'conversion',
      definition: {
        type: 'drops',
        physical: { kind: 'drops', v: { ...((DEFAULT_PRODUCT_STUDIO_STATE as any).definition?.physical?.v || {}) } },
      },
    });

    expect(prompt).toContain('allow vertical subject dominance');
    expect(prompt).toContain('no white lateral bands');
    expect(prompt).not.toContain('controlled horizontal environmental spread to avoid narrow vertical subject bias');
  });

  test('standard conversion square keeps controlled spread', () => {
    const prompt = buildPrompt({
      photoMode: 'Color Pop Hero',
      aspectRatio: '1:1',
      visualIntent: 'conversion',
      definition: {
        type: 'dummy',
        physical: { kind: 'dummy', v: {} },
      },
    });

    expect(prompt).toContain('controlled horizontal environmental spread');
    expect(prompt).not.toContain('allow vertical subject dominance');
  });

  test('splash physics block is deterministic', () => {
    const prompt = buildPrompt({
      photoMode: 'Splash Shot',
      stateMotion: 'pouring',
      visualIntent: 'conversion',
      qualityProfile: 'ecommerce-conversion',
    });

    expect(prompt).toContain('SPLASH_PHYSICS_MODEL:');
    expect(prompt).not.toMatch(/Allow crossing splash arcs/i);
    expect(prompt).not.toMatch(/irregular foam shapes/i);
    expect(prompt).not.toMatch(/floating droplets/i);
    expect(prompt).toMatch(/Liquid origin must be physically defined/i);
  });

  test('splash physics block is absent for clinical and static-only', () => {
    const clinicalPrompt = buildPrompt({
      photoMode: 'Splash Shot',
      stateMotion: 'pouring',
      qualityProfile: 'clinical',
      visualIntent: 'conversion',
    });
    const staticPrompt = buildPrompt({
      photoMode: 'Underwater Split',
      stateMotion: 'static',
      qualityProfile: 'ecommerce-conversion',
      visualIntent: 'conversion',
    });

    expect(clinicalPrompt).not.toContain('SPLASH_PHYSICS_MODEL:');
    expect(staticPrompt).not.toContain('SPLASH_PHYSICS_MODEL:');
  });
});
