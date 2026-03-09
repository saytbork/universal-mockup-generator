import { describe, expect, it } from 'vitest';
import { IdentityBuilder } from '../../promptEngine/builders/identity';
import type { PromptOptions } from '../../promptEngine/types';

const makeOptions = (overrides: Partial<PromptOptions> = {}): PromptOptions => ({
  personIncluded: true,
  contentStyle: 'brand' as any,
  creationMode: 'aesthetic',
  creationIntent: 'brand',
  aspectRatio: '1:1',
  camera: 'DSLR / mirrorless camera',
  setting: 'Kitchen',
  lighting: 'Natural',
  perspective: 'Eye level',
  environmentOrder: 'normal',
  productPlane: 'foreground',
  personCount: 'group',
  personDetails: {
    age: 30,
    gender: 'Female',
    facialExpression: 'Calm & Serene',
    eyeDirection: 'Looking at camera' as any,
    skinRealism: 'raw, unretouched skin with gentle natural variation and minimal emphasis on pores',
    productInteraction: 'holding product naturally',
  },
  ...overrides,
});

describe('IdentityBuilder group composition realism', () => {
  it('forces cohesive group staging instead of foreground hero plus background fillers', () => {
    const builder = new IdentityBuilder();
    const output = builder.build(makeOptions());

    expect(output).toContain('GROUP MODE: 3–5 subjects in frame.');
    expect(output).toContain('single cohesive social unit');
    expect(output).toContain('Do NOT stage one dominant person close to camera with the others pushed far into the background.');
    expect(output).toContain('Do NOT create filler people behind the main subject.');
    expect(output).toContain('no sibling-like duplicates, no twin-looking repeats');
  });
});
