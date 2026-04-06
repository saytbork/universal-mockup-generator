import { describe, expect, it } from 'vitest';
import { IdentityBuilder } from '../../promptEngine/builders/identity';
import { ProductBuilder } from '../../promptEngine/builders/product';
import { ConstraintsBuilder } from '../../promptEngine/builders/constraints';
import { mapLifestyleToPromptOptions } from '../../promptEngine/mapLifestyleToPromptOptions';
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

  it('forces mixed-gender groups to also read as ethnically diverse', () => {
    const builder = new IdentityBuilder();
    const output = builder.build(
      makeOptions({
        gender: 'Mix',
        groupDiversityMode: 'mixed-gender-mixed-ethnicity',
        personDetails: {
          age: 30,
          gender: 'Mix',
          facialExpression: 'Calm & Serene',
          eyeDirection: 'Looking at camera' as any,
          skinRealism: 'raw, unretouched skin with gentle natural variation and minimal emphasis on pores',
          productInteraction: 'holding product naturally',
        },
      })
    );

    expect(output).toContain('GROUP DIVERSITY RULE: This must be a visibly mixed-gender group');
    expect(output).toContain('ETHNIC DIVERSITY RULE: The group must show visibly varied ethnic backgrounds');
    expect(output).toContain('MIXED GROUP CASTING: The final group must visibly read as mixed-gender and mixed-ethnicity.');
    expect(output).toContain('ANTI-CLONE GROUP RULE:');
    expect(output).toContain('CAST SPREAD RULE:');
    expect(output).not.toContain('ETHNICITY ANCHOR: Subject MUST visually read as');
  });

  it('forces wardrobe variation across group members instead of repeating the same outfit', () => {
    const builder = new IdentityBuilder();
    const output = builder.build(
      makeOptions({
        personDetails: {
          age: 30,
          gender: 'Mix',
          wardrobeStyle: 'clean premium casual wardrobe',
          facialExpression: 'Calm & Serene',
          eyeDirection: 'Looking at camera' as any,
          skinRealism: 'raw, unretouched skin with gentle natural variation and minimal emphasis on pores',
          productInteraction: 'holding product naturally',
        },
      })
    );

    expect(output).toContain('WARDROBE ANCHOR (GROUP): Person A wears clean premium casual wardrobe.');
    expect(output).toContain('GROUP WARDROBE VARIATION: Every person must have distinct clothing.');
    expect(output).toContain('No uniform outfits.');
    expect(output).toContain('No same-color clone styling across the cast.');
  });

  it('maps group product framing without collapsing into single-hero composition', () => {
    const mapped = mapLifestyleToPromptOptions(
      {
        sceneType: 'lifestyle-real',
        creationMode: 'aesthetic',
        contentStyle: 'brand',
        visualMode: 'default',
        visualIntent: 'brand',
        environmentContext: { macro: 'Kitchen', micro: 'Countertop' },
        environment: 'Kitchen',
        noPerson: false,
        personCount: 'group',
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
        eyeDirection: 'Looking at camera',
        appearanceLevel: 'Regular',
        pose: 'Relaxed Portrait',
        skinRealism: 'Raw / Real',
        timeOfDay: 'Afternoon',
        lightingStyle: 'Natural',
        shotType: 'Medium',
        cameraType: 'DSLR / mirrorless camera',
        cameraAngle: 'Eye level',
        framing: 'Rule of thirds',
        productProminence: 'product-first',
        productInteraction: 'background',
        productStructure: 'single',
        aspectRatio: '1:1 (Square)',
      } as any,
      {
        productAssets: [{ id: 'p1' } as any],
      }
    );

    expect(mapped.personCount).toBe('group');
    expect(mapped.compositionModeStructural).toMatch(/group/i);
    expect(mapped.compositionModeStructural).toMatch(/no foreground hero plus background fillers/i);
  });

  it('clears singular ethnicity anchors for mixed-gender group casting', () => {
    const mapped = mapLifestyleToPromptOptions(
      {
        sceneType: 'lifestyle-real',
        creationMode: 'aesthetic',
        contentStyle: 'brand',
        visualMode: 'default',
        visualIntent: 'brand',
        environmentContext: { macro: 'Kitchen', micro: 'Countertop' },
        environment: 'Kitchen',
        noPerson: false,
        personCount: 'group',
        age: 30,
        gender: 'Mix',
        skinTone: 'Medium Neutral',
        ethnicity: 'Latina',
        bodyType: 'Average',
        hair: 'Medium',
        hairLength: 'Shoulder',
        hairTexture: 'Wavy',
        hairColor: 'Dark brown',
        facialExpression: 'Calm & Serene',
        eyeDirection: 'Looking at camera',
        appearanceLevel: 'Regular',
        pose: 'Relaxed Portrait',
        skinRealism: 'Raw / Real',
        timeOfDay: 'Afternoon',
        lightingStyle: 'Natural',
        shotType: 'Medium',
        cameraType: 'DSLR / mirrorless camera',
        cameraAngle: 'Eye level',
        framing: 'Rule of thirds',
        productProminence: 'product-first',
        productInteraction: 'background',
        productStructure: 'single',
        aspectRatio: '1:1 (Square)',
      } as any,
      {
        productAssets: [{ id: 'p1' } as any],
      }
    );

    expect(mapped.personCount).toBe('group');
    expect(mapped.groupDiversityMode).toBe('mixed-gender-mixed-ethnicity');
    expect(mapped.personDetails?.gender).toBe('Mix');
    expect(mapped.personDetails?.ethnicity).toBeUndefined();
  });

  it('requires every uploaded product in lifestyle multi-product prompts', () => {
    const productOutput = new ProductBuilder().build(
      makeOptions({
        productAssets: [
          { id: 'p1', label: 'Product 1' } as any,
          { id: 'p2', label: 'Product 2' } as any,
          { id: 'p3', label: 'Product 3' } as any,
          { id: 'p4', label: 'Product 4' } as any,
        ],
      })
    );
    const constraintsOutput = new ConstraintsBuilder().build(
      makeOptions({
        creationMode: 'lifestyle',
        productAssets: [
          { id: 'p1', label: 'Product 1' } as any,
          { id: 'p2', label: 'Product 2' } as any,
          { id: 'p3', label: 'Product 3' } as any,
          { id: 'p4', label: 'Product 4' } as any,
        ],
      })
    );

    expect(productOutput).toContain('There are exactly 4 distinct uploaded product cutouts supplied.');
    expect(productOutput).toContain('Every one of those 4 uploaded products must appear in the final scene.');
    expect(productOutput).toContain('Use all 4 uploaded product images as exact products to place in the scene.');
    expect(productOutput).toContain('Do not let one uploaded product inherit another product’s label, shape, cap, flavor, or branding.');
    expect(productOutput).toContain('Do not omit any uploaded product.');
    expect(constraintsOutput).toContain('Exactly 4 uploaded products are provided and all 4 must appear in the final image.');
  });

  it('avoids phantom hand contact and oversized hero scaling in group background/showing scenes', () => {
    const productOutput = new ProductBuilder().build(
      makeOptions({
        productInteraction: 'background',
        handsHolding: false,
        productAssets: [{ id: 'p1', label: 'Wine Bottle' } as any],
      })
    );

    expect(productOutput).toContain('PLACING RULE'.replace('PLACING', 'PLACEMENT'));
    expect(productOutput).toContain('Keep the product at believable tabletop or shared-scene scale within the group.');
    expect(productOutput).toContain('no extra hands, duplicate hands, floating hands, or stray fingers may appear near the product');
    expect(productOutput).toContain('if no one is actively holding it, the product must rest naturally on a surface');
    expect(productOutput).not.toContain('HAND CONTACT INTEGRATION: fingers must wrap around the product');
    expect(productOutput).not.toContain('Product must be physically closer to the camera than the face/body.');
  });
});
