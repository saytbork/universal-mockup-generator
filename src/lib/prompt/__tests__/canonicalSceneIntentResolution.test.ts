import { describe, expect, it } from 'vitest';
import { SceneNarrativeBuilder } from '../../promptEngine/builders/canonicalScene';
import type { PromptOptions } from '../../promptEngine/types';

const makeOptions = (overrides: Partial<PromptOptions> = {}): PromptOptions => ({
  sceneType: 'lifestyle-real',
  contentStyle: 'brand',
  creationIntent: 'brand',
  creationMode: 'aesthetic',
  aspectRatio: '1:1',
  camera: 'DSLR / mirrorless camera',
  setting: 'Kitchen',
  lighting: 'Natural',
  perspective: 'Eye level',
  environmentOrder: 'normal',
  productPlane: 'foreground',
  personIncluded: true,
  ugcRealModeActive: false,
  ...overrides,
});

describe('SceneNarrativeBuilder intent resolution', () => {
  it('does not emit expert-led narrative without active formulation signals', () => {
    const builder = new SceneNarrativeBuilder();
    const sections = builder.build(
      makeOptions({
        visualIntent: 'editorial',
        formulationExpertEnabled: false,
      })
    );

    expect(sections.creationIntent).toContain('Editorial-led product narrative.');
    expect(sections.creationIntent).not.toContain('Expert-led product narrative.');
    expect(sections.creationIntent).not.toContain('Scientific credibility and formulation trust.');
  });

  it('emits expert-led narrative only when formulation signals are active', () => {
    const builder = new SceneNarrativeBuilder();
    const sections = builder.build(
      makeOptions({
        creationMode: 'formulation' as any,
        formulationExpertEnabled: true,
        formulationExpertRole: 'chemist' as any,
      })
    );

    expect(sections.creationIntent).toContain('Expert-led product narrative.');
    expect(sections.creationIntent).toContain('Scientific credibility and formulation trust.');
  });
});
