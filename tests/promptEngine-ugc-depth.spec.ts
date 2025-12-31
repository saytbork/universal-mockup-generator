import { test, expect } from 'playwright/test';
import { promptEngine } from '../src/lib/promptEngine/index';
import type { PromptOptions } from '../src/lib/promptEngine/types';

test('UGC always enforces flat depth (no pro separation)', () => {
  const options: PromptOptions = {
    contentStyle: 'ugc',
    creationIntent: 'ugc',
    creationMode: 'lifestyle',
    aspectRatio: '1:1',
    camera: 'smartphone camera',
    setting: 'Kitchen',
    lighting: 'Natural ambient',
    perspective: 'front',
    environmentOrder: 'Kitchen',
    productPlane: 'mid',
    personIncluded: true,
  };

  const prompt = promptEngine.build(options);
  const lower = prompt.toLowerCase();

  expect(lower).toContain('flat focus across the entire frame');
  expect(lower).toContain('no background separation');
  expect(lower).toContain('no shallow depth of field');
  expect(lower).toContain('no bokeh');
  expect(lower).toContain('no portrait mode');
});

test('UGC degrades pro camera selections to avoid depth conflicts', () => {
  const options: PromptOptions = {
    contentStyle: 'ugc',
    creationIntent: 'ugc',
    creationMode: 'lifestyle',
    aspectRatio: '1:1',
    camera: 'smartphone camera',
    setting: 'Kitchen',
    lighting: 'Natural ambient',
    perspective: 'front',
    environmentOrder: 'Kitchen',
    productPlane: 'mid',
    personIncluded: true,
  };

  (options as any).cameraType = 'DSLR / mirrorless camera';

  const prompt = promptEngine.build(options);
  const lower = prompt.toLowerCase();

  expect(lower).toContain('flat focus across the entire frame');
  expect(lower).not.toContain('captured with a professional dslr');
});
