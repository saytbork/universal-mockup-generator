import { describe, expect, it } from 'vitest';
import { SceneNarrativeBuilder } from '../../promptEngine/builders/canonicalScene';
import type { PromptOptions } from '../../promptEngine/types';

const makeOptions = (overrides: Partial<PromptOptions> = {}): PromptOptions => ({
  creationIntent: 'brand',
  creationMode: 'aesthetic',
  contentStyle: 'brand',
  personIncluded: true,
  aspectRatio: '1:1',
  setting: 'Kitchen',
  environmentOrder: 'Kitchen',
  lighting: 'Natural',
  camera: 'DSLR / mirrorless camera',
  cameraAngle: 'eye level',
  cameraShot: 'medium shot',
  perspective: 'rule-of-thirds composition',
  productPlane: 'foreground',
  personDetails: {
    facialExpression: 'calm, serene facial expression',
    eyeDirection: 'eyes directed straight into camera lens',
  } as any,
  ...overrides,
});

describe('canonical scene brand realism', () => {
  it('does not inject expert-led narrative into standard brand lifestyle scenes', () => {
    const builder = new SceneNarrativeBuilder();
    const sections = builder.build(makeOptions());
    const text = [
      sections.creationIntent,
      sections.environmentLightingMood,
      sections.cameraFraming,
    ].join(' ');

    expect(text).toContain('Brand-led product narrative.');
    expect(text).not.toContain('Expert-led product narrative.');
    expect(text).not.toContain('The expert remains the primary subject.');
  });

  it('injects anti-doll human realism guard for aesthetic brand scenes with a person', () => {
    const builder = new SceneNarrativeBuilder();
    const sections = builder.build(makeOptions());
    const text = [
      sections.creationIntent,
      sections.environmentLightingMood,
      sections.cameraFraming,
    ].join(' ');

    expect(text).toContain('Human realism guard (non-negotiable):');
    expect(text).toContain('No doll face');
    expect(text).toContain('no beauty-filter smoothing');
  });
});
