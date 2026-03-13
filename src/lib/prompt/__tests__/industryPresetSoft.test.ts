import { describe, expect, test } from 'vitest';
import { applyIndustryProfileSoft } from '../../productStudio/applyIndustryProfileSoft';

describe('industry soft presets', () => {
  test('supplements to wine applies compatible premium defaults softly without changing tilt', () => {
    const current = {
      visualIntent: 'conversion',
      lighting: 'clinical-softbox',
      composition: 'centered',
      photoMode: 'Hero Landing Page',
      tilt: 0,
    };

    const next = applyIndustryProfileSoft(current, 'wine');

    expect(next.lighting).toBe('warm-lateral');
    expect(next.composition).toBe('centered');
    expect(next.tilt).toBe(0);
    expect(next).not.toBe(current);
  });

  test('wine to coffee replaces incompatible fields without normalizing tilt', () => {
    const current = {
      visualIntent: 'campaign',
      lighting: 'warm-lateral',
      composition: 'thirds',
      photoMode: 'Hero Landing Page',
      tilt: 7,
    };

    const next = applyIndustryProfileSoft(current, 'coffee');

    expect(next.lighting).toBe('natural-light');
    expect(next.tilt).toBe(7);
    expect(next).not.toBe(current);
  });

  test('valid values stay intact', () => {
    const current = {
      visualIntent: 'campaign',
      lighting: 'natural-light',
      composition: 'centered',
      photoMode: 'Hero Landing Page',
      tilt: 0,
    };

    const next = applyIndustryProfileSoft(current, 'supplements');

    expect(next.visualIntent).toBe('campaign');
    expect(next.lighting).toBe('natural-light');
    expect(next.composition).toBe('centered');
  });
});
