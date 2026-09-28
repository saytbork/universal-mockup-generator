import { describe, expect, it } from 'vitest';
import { mapLifestyleToPromptOptions } from '../../promptEngine/mapLifestyleToPromptOptions';
import { ProductBuilder } from '../../promptEngine/builders/product';
import { FinalizeBuilder } from '../../promptEngine/builders/finalize';
import { buildCamera } from '../../promptEngine/builders/camera';

const baseScene = (overrides: Record<string, unknown> = {}) => ({
  sceneType: 'lifestyle-real',
  creationMode: 'Aesthetic Builder',
  contentStyle: 'brand',
  visualMode: 'default',
  environmentContext: { macro: 'Kitchen', micro: 'Countertop' },
  environment: 'Kitchen',
  noPerson: false,
  personIncluded: true,
  personCount: 'single',
  age: 30,
  gender: 'Female',
  skinTone: 'Medium Neutral',
  ethnicity: 'Non-specific',
  bodyType: 'Average',
  hair: 'Medium',
  hairLength: 'Shoulder',
  hairTexture: 'Wavy',
  hairColor: 'Dark brown',
  facialExpression: 'Calm & Serene',
  eyeDirection: 'Looking away',
  appearanceLevel: 'Regular',
  pose: 'Relaxed Portrait',
  skinRealism: 'Raw / Real',
  timeOfDay: 'Golden Hour',
  lightingStyle: 'Golden Hour',
  shotType: 'Full body',
  cameraType: 'DSLR / mirrorless camera',
  cameraAngle: 'Low angle',
  framing: 'Rule of thirds',
  productProminence: 'model-first',
  productInteraction: 'holding',
  productStructure: 'single',
  allowMessiness: true,
  aspectRatio: '9:16',
  ...overrides,
}) as any;

describe('Lifestyle control authority', () => {
  it.each(['editorial', 'brand', 'luxury'])(
    'preserves independent controls for %s intent',
    (visualIntent) => {
      const mapped = mapLifestyleToPromptOptions(
        baseScene({ visualIntent }),
        { productAssets: [{ id: 'p1', name: 'Reference product' }] } as any
      );

      expect(mapped.visualIntent).toBe(visualIntent);
      expect(mapped.productProminence).toBe('model-first');
      expect(mapped.productInteraction).toBe('holding');
      expect(mapped.cameraShot).toMatch(/full-body|head to toe/i);
      expect(mapped.cameraAngle).toMatch(/below the subject|angled up/i);
      expect(mapped.allowMessiness).toBe(true);
      expect(mapped.camera).toBe('DSLR / mirrorless camera');
    }
  );

  it('holding does not silently become foreground/product-first', () => {
    const mapped = mapLifestyleToPromptOptions(
      baseScene({ visualIntent: 'brand', productInteraction: 'holding', productProminence: 'model-first' }),
      { productAssets: [{ id: 'p1', name: 'Reference product' }] } as any
    );

    expect(String(mapped.personDetails?.productInteraction || '')).toMatch(/does not automatically make the product foreground or primary/i);
    expect(String(mapped.personDetails?.productInteraction || '')).not.toMatch(/closer to the camera lens than the face|product is the primary subject/i);
    expect(mapped.productProminence).toBe('model-first');
  });

  it('product builder protects fidelity without overriding Lifestyle hierarchy', () => {
    const output = new ProductBuilder().build({
      contentStyle: 'brand',
      creationMode: 'aesthetic',
      personIncluded: true,
      productAssets: [{ id: 'p1', name: 'Reference product' }],
      productInteraction: 'background',
      productProminence: 'model-first',
    } as any);

    expect(output).toContain('PLACEMENT AUTHORITY');
    expect(output).toContain('background');
    expect(output).toContain('model-first');
    expect(output).not.toContain('Product must be physically closer to the camera than the face/body');
  });

  it('camera builder does not inject product hierarchy', () => {
    const output = buildCamera({
      visualMode: 'default',
      cameraType: 'DSLR / mirrorless camera',
      productAssets: [{ id: 'p1' }],
    });

    expect(output).not.toMatch(/sharpest object|primary subject|lock focus on the product/i);
  });

  it('finalize does not force foreground or recenter Lifestyle product', () => {
    const output = new FinalizeBuilder().build({
      contentStyle: 'brand',
      creationMode: 'aesthetic',
      personIncluded: true,
      productAssets: [{ id: 'p1' }],
      productInteraction: 'background',
      productProminence: 'model-first',
      aspectRatio: '9:16',
    } as any);

    expect(output).toContain('LIFESTYLE FIDELITY LOCK');
    expect(output).not.toMatch(/foreground\/main subject position|product must be centered/i);
  });
});
