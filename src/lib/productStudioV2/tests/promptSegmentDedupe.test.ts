import { describe, expect, it } from 'vitest';
import { __orderSegmentsForTest } from '../pipelines/genericPipeline';

describe('prompt segment dedupe normalization regression', () => {
  it('collapses exact normalized duplicates', () => {
    const segments = __orderSegmentsForTest([
      'STUDIO_CAMERA_SYSTEM: DSLR / mirrorless camera system.',
      'STUDIO_CAMERA_SYSTEM:   DSLR   / mirrorless   camera system.',
    ]);

    const matching = segments.filter((s) => s.content.startsWith('STUDIO_CAMERA_SYSTEM:'));
    expect(matching.length).toBe(1);
  });

  it('does not collapse near-duplicates', () => {
    const segments = __orderSegmentsForTest([
      'STUDIO_LIGHTING_PROFILE: sunny day window light.',
      'STUDIO_LIGHTING_PROFILE: sunny day window light with warm rim falloff.',
    ]);

    const matching = segments.filter((s) => s.content.startsWith('STUDIO_LIGHTING_PROFILE:'));
    expect(matching.length).toBe(2);
  });

  it('keeps lines with different token text', () => {
    const segments = __orderSegmentsForTest([
      'INTERACTION_MODE: liquid impact.',
      'FLOW_DIRECTION: outward arc.',
    ]);

    expect(segments.some((s) => s.content.startsWith('INTERACTION_MODE:'))).toBe(true);
    expect(segments.some((s) => s.content.startsWith('FLOW_DIRECTION:'))).toBe(true);
  });

  it('collapses duplicates differing only by repeated whitespace', () => {
    const segments = __orderSegmentsForTest([
      'PHOTO_MODE_ATMOSPHERE: Soft atmospheric depth separation behind the product.',
      'PHOTO_MODE_ATMOSPHERE:  Soft   atmospheric   depth separation behind the product.',
    ]);

    const matching = segments.filter((s) => s.content.startsWith('PHOTO_MODE_ATMOSPHERE:'));
    expect(matching.length).toBe(1);
  });
});
