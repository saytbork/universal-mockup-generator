import { describe, expect, it } from 'vitest';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import { coffeePipeline } from '../pipelines/coffeePipeline';
import type { StudioUIState } from '../types/studioTypes';

describe('supplement and coffee advertising realism baseline', () => {
  it('supplement modes inject hyper-real professional advertising scene language', () => {
    const prompt = __buildPromptForTest({
      industryProfile: 'supplements',
      photoMode: 'Acrylic Blocks',
      motion: 'static',
      composition: 'hero',
      creativeIntent: 'conversion',
    } as StudioUIState);

    expect(prompt).toContain('SCENE_STYLE: hyper-real professional supplement advertising photography.');
    expect(prompt).toContain('PRODUCT_CHARACTER_PROFILE: hyper-real professional supplement advertising');
    expect(prompt).toContain('SUPPLEMENT_AD_LIGHTING_REALISM: Hyper-real commercial lighting with disciplined specular control');
    expect(prompt).toContain('SUPPLEMENT_MATERIAL_REALISM: Commercial-grade packaging materials with controlled specular highlights');
  });

  it('coffee pipeline injects hyper-real professional advertising realism target', () => {
    const prompt = coffeePipeline.build({
      industryProfile: 'coffee',
      visualProfile: 'coffee',
      coffeeIndustryLayer: true,
      coffeeVariant: 'coffee-premium-minimal',
      coffeeMoodProfile: 'premium-minimal',
      coffeeEnvironmentVariation: 'minimal-gradient',
      coffeePackagingIntent: 'pdp-clean',
      coffeeSteamVisibility: 'subtle',
      coffeeTemperatureProfile: 'hot',
      coffeeAction: 'static',
      coffeeLiquidPhysicsEnabled: true,
      productReferencePresent: true,
      motion: 'static',
      composition: 'hero',
      creativeIntent: 'conversion',
    } as StudioUIState);

    expect(prompt).toContain('COFFEE_REALISM_TARGET: Hyper-real professional coffee product advertising.');
    expect(prompt).toContain('PRODUCT_CHARACTER_PROFILE: hyper-real professional coffee advertising');
  });
});
