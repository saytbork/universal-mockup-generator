import { describe, expect, it } from 'vitest';
import { LifestyleProfessionalBiasBuilder } from '../../promptEngine/builders/lifestyleProfessionalBias';
import type { PromptOptions } from '../../promptEngine/types';

const makeOptions = (overrides: Partial<PromptOptions> = {}): PromptOptions => ({
  contentStyle: '',
  creationMode: 'lifestyle',
  aspectRatio: '1:1',
  camera: 'DSLR / mirrorless camera',
  setting: 'Kitchen',
  lighting: 'Natural',
  perspective: 'Eye level',
  environmentOrder: 'normal',
  productPlane: 'foreground',
  ...overrides,
});

describe('LifestyleProfessionalBiasBuilder', () => {
  it('injects professional bias for lifestyle-real brand aesthetic holding flow', () => {
    const builder = new LifestyleProfessionalBiasBuilder();
    const output = builder.build(
      makeOptions({
        sceneType: 'lifestyle-real',
        contentStyle: 'brand' as any,
        creationMode: 'aesthetic',
        ugcRealModeActive: false,
        productInteraction: 'Holding',
        skinRealism: 'Raw / Real',
      })
    );

    expect(output).toContain('Lifestyle editorial photography standard with campaign-grade commercial polish.');
    expect(output).toContain('Creative advertising direction: premium, art-directed, visually expensive');
    expect(output).not.toMatch(/\bcandid\b/i);
    expect(output).not.toMatch(/\binfluencer\b/i);
    expect(output).not.toMatch(/\bcasual\b/i);
    expect(output).not.toMatch(/raw handheld/i);
  });

  it('separates editorial, brand, and luxury intent language', () => {
    const builder = new LifestyleProfessionalBiasBuilder();

    const editorial = builder.build(
      makeOptions({
        sceneType: 'lifestyle-real',
        contentStyle: 'brand' as any,
        creationMode: 'aesthetic',
        visualIntent: 'editorial',
      })
    );

    const brand = builder.build(
      makeOptions({
        sceneType: 'lifestyle-real',
        contentStyle: 'brand' as any,
        creationMode: 'aesthetic',
        visualIntent: 'brand',
      })
    );

    const luxury = builder.build(
      makeOptions({
        sceneType: 'lifestyle-real',
        contentStyle: 'brand' as any,
        creationMode: 'aesthetic',
        visualIntent: 'luxury',
      })
    );

    expect(editorial).toContain('Intent profile: editorial campaign.');
    expect(editorial).toContain('Editorial direction: bolder composition');
    expect(editorial).not.toContain('Luxury direction: dramatic premium lighting');

    expect(brand).toContain('Intent profile: brand campaign.');
    expect(brand).toContain('Brand direction: cleaner commercial hierarchy');
    expect(brand).not.toContain('Editorial direction: bolder composition');

    expect(luxury).toContain('Intent profile: luxury campaign.');
    expect(luxury).toContain('Luxury direction: dramatic premium lighting');
    expect(luxury).not.toContain('Brand direction: cleaner commercial hierarchy');
  });

  it('does not activate in ugc real mode', () => {
    const builder = new LifestyleProfessionalBiasBuilder();
    const output = builder.build(
      makeOptions({
        sceneType: 'lifestyle-real',
        contentStyle: 'brand' as any,
        creationMode: 'aesthetic',
        ugcRealModeActive: true,
        productInteraction: 'Holding',
      })
    );

    expect(output).toBe('');
  });
});
