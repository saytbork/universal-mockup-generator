import { describe, expect, it } from 'vitest';
import { IdentityBuilder } from '../../promptEngine/builders/identity';
import type { PromptOptions } from '../../promptEngine/types';

const makeOptions = (overrides: Partial<PromptOptions> = {}): PromptOptions => ({
  creationIntent: 'brand',
  creationMode: 'aesthetic',
  contentStyle: 'brand',
  personIncluded: true,
  aspectRatio: '1:1',
  personDetails: {
    age: 30,
    gender: 'Female',
    skinTone: 'Medium Neutral',
    ethnicity: 'Non-specific',
    bodyType: 'Average',
    eyeColor: 'Brown',
    hairLength: 'Shoulder',
    hairTexture: 'Wavy',
    hairColor: 'Dark brown',
    facialExpression: 'Calm & Serene',
    eyeDirection: 'Looking at camera',
  } as any,
  ...overrides,
});

describe('identity brand-editorial realism', () => {
  it('injects facial realism guard for brand advertising humans', () => {
    const builder = new IdentityBuilder();
    const text = builder.build(makeOptions());

    expect(text).toContain('BRAND_EDITORIAL_STANDARD:');
    expect(text).toContain('ADVERTISING HUMAN REALISM (NON-NEGOTIABLE):');
    expect(text).toContain('NO doll eyes');
    expect(text).toContain('NO fake veneers look');
    expect(text).toContain('glassy eyes');
    expect(text).toContain('HAIR STYLING:');
    expect(text).not.toContain('greasy unwashed hair');
    expect(text).not.toContain('frizzy and unkempt');
  });

  it('applies the same realism guard to luxury and editorial intents', () => {
    const builder = new IdentityBuilder();

    const luxury = builder.build(makeOptions({ creationIntent: 'luxury', contentStyle: 'brand' }));
    const editorial = builder.build(makeOptions({ creationIntent: 'editorial', contentStyle: 'brand' }));

    expect(luxury).toContain('ADVERTISING HUMAN REALISM (NON-NEGOTIABLE):');
    expect(editorial).toContain('ADVERTISING HUMAN REALISM (NON-NEGOTIABLE):');
  });
});
