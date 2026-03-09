import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { __buildPromptForTest } from '../pipelines/genericPipeline';
import type { StudioUIState } from '../types/studioTypes';

function base(overrides: Record<string, unknown> = {}): StudioUIState {
  return {
    industryProfile: 'supplements',
    motion: 'static',
    composition: 'hero',
    creativeIntent: 'conversion',
    photoMode: 'Hero Landing Page',
    ...overrides,
  } as StudioUIState;
}

describe('Visual Style injection', () => {
  it('Clinical Lab Counter emits studio visual style contract', () => {
    const prompt = __buildPromptForTest(
      base({
        visualStyle: 'Clinical Lab Counter',
        visualStyleCategory: 'studio',
      })
    );
    expect(prompt).toContain('VISUAL_STYLE_MODE: active.');
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: studio.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: clinical-lab-counter.');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
  });

  it('Dark Premium Studio normalizes to studio category and name', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Dark Premium Studio', visualStyleCategory: 'studio' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: studio.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: dark-premium-studio.');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
    expect(prompt).toContain('DARK_PREMIUM_STUDIO_ATMOSPHERE:');
    expect(prompt).toContain('No crushed blacks.');
    expect(prompt).toContain('DARK_PREMIUM_RENDER_GUARD:');
  });

  it('Brand Campaign normalizes to brand category', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Brand Campaign', visualStyleCategory: 'brand' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: brand.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: brand-campaign.');
  });

  it('Soft Wellness Morning normalizes to lifestyle category', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Soft Wellness Morning', visualStyleCategory: 'lifestyle' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: lifestyle.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: soft-wellness-morning.');
  });

  it('Outdoor Energy Boost normalizes to lifestyle category', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Outdoor Energy Boost', visualStyleCategory: 'lifestyle' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: lifestyle.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: outdoor-energy-boost.');
  });

  it('Wet Rock Ripples normalizes to lifestyle category', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: 'Wet Rock Ripples', visualStyleCategory: 'lifestyle' }));
    expect(prompt).toContain('VISUAL_STYLE_CATEGORY: lifestyle.');
    expect(prompt).toContain('VISUAL_STYLE_NAME: wet-rock-ripples.');
    expect(prompt).toContain('VISUAL_STYLE_SCENE:');
  });

  it('Brand Campaign clears core photo mode in V2 when visual style is selected', () => {
    const mapped = toStudioV2State({
      photoMode: 'Hero Landing Page',
      visualStyle: 'Brand Campaign',
      industryProfile: 'supplements',
      definition: { type: 'skincare' },
      packagingMode: 'without-box',
      contextPreset: '',
      controlTier: 'basic',
      advancedModeEnabled: false,
      proMode: false,
      stateMotion: 'static',
      photoModeConfig: {},
      creativityLevel: 1,
      composition: 'centered',
      angle: '45_hero',
      distance: 'standard',
      rotation: 0,
      framing: 'centered_hero',
      cameraSystem: 'dslr_mirrorless',
      environmentContext: null,
      lighting: 'natural-light',
      ambientLighting: 'natural-light',
      environmentMacro: 'studio',
      microPlace: 'neutral-surface',
      customEnvironmentText: '',
      customMicroPlaceText: '',
      visualProfile: 'default',
      visualIntent: 'conversion',
      energyLevel: 'low',
      creativeTheme: 'clinical-minimal',
      propDensity: 'none',
      selectedProps: [],
      negativeSpace: 'none',
      scale: 'dominant',
      spacing: 'balanced',
      lightStyle: 'soft',
      products: [],
      activeProductId: null,
      mode: 'studio',
      handsHolding: false,
      palette: { source: 'auto', primaryColor: null, secondaryColor: null, accentColor: null, brandPresetId: null },
      sceneType: 'studio-branding',
      surface: 'neutral',
      category: '',
      wineLightingTone: 'Warm Lateral',
      wineMoodModifier: 'None',
      wineAction: 'static-presentation',
      winePourStyle: 'mid-flow-elegance',
      coffeeMode: 'studio',
      coffeeAction: 'static',
      coffeeLightingTone: 'auto',
      coffeeMoodModifier: 'coffee-cinematic-luxury',
      coffeeSteamLevel: 'auto',
      coffeeLiquidPhysics: true,
      blankSpaceEnabled: false,
      blankSpaceSide: 'right',
      aspectRatio: '4:3',
      ecommercePdp: null,
      bundle: { enabled: false, mode: 'single', products: [], layout: 'horizontal', spacing: 'tight' },
      interpretationNotes: {},
      qualityProfile: 'ecommerce-conversion',
      ultraRealStrict: true,
      splashStyle: 'Basic',
      backgroundColor: '#FFFFFF',
      accentColor: '#000000',
      colorLocks: { background: false, accent: false, gradientStart: false, gradientEnd: false, gradientMid: false },
      heroLandingAuto: { backgroundType: true },
      alignment: 'center',
      shadow: 'soft-drop',
      gradientEnabled: false,
      gradientStart: '#FFFFFF',
      gradientEnd: '#FFFFFF',
      gradientMid: '',
      gradientAngle: 180,
      props: '',
      ingredientLayout: 'grounded',
      interaction: 'none',
      placement: 'surface',
      viewpoint: 'eye-level',
      lens: '50mm Product Prime',
      lightingRig: 'Softbox Wrap',
      lightColorTemp: 'Neutral (5000K)',
      customLightColor: '',
      accentLightIntensity: 50,
      finish: 'High-Gloss Commercial',
      physicalScaleLabel: 'medium-tabletop',
    } as any);

    expect(mapped.photoMode).toBeUndefined();
    expect(mapped.visualStyle).toBe('Brand Campaign');
    expect(mapped.visualStyleCategory).toBe('brand');
  });

  it('Clinical Lab Counter clears Hero Landing Page in V2 when both exist in raw state', () => {
    const mapped = toStudioV2State({
      photoMode: 'Hero Landing Page',
      visualStyle: 'Clinical Lab Counter',
      industryProfile: 'supplements',
      definition: { type: 'skincare' },
      packagingMode: 'without-box',
      contextPreset: '',
      controlTier: 'basic',
      advancedModeEnabled: false,
      proMode: false,
      stateMotion: 'static',
      photoModeConfig: {},
      creativityLevel: 1,
      composition: 'centered',
      angle: '45_hero',
      distance: 'standard',
      rotation: 0,
      framing: 'centered_hero',
      cameraSystem: 'dslr_mirrorless',
      environmentContext: null,
      lighting: 'natural-light',
      ambientLighting: 'natural-light',
      environmentMacro: 'studio',
      microPlace: 'neutral-surface',
      customEnvironmentText: '',
      customMicroPlaceText: '',
      visualProfile: 'default',
      visualIntent: 'conversion',
      energyLevel: 'low',
      creativeTheme: 'clinical-minimal',
      propDensity: 'none',
      selectedProps: [],
      negativeSpace: 'none',
      scale: 'dominant',
      spacing: 'balanced',
      lightStyle: 'soft',
      products: [],
      activeProductId: null,
      mode: 'studio',
      handsHolding: false,
      palette: { source: 'auto', primaryColor: null, secondaryColor: null, accentColor: null, brandPresetId: null },
      sceneType: 'studio-branding',
      surface: 'neutral',
      category: '',
      wineLightingTone: 'Warm Lateral',
      wineMoodModifier: 'None',
      wineAction: 'static-presentation',
      winePourStyle: 'mid-flow-elegance',
      coffeeMode: 'studio',
      coffeeAction: 'static',
      coffeeLightingTone: 'auto',
      coffeeMoodModifier: 'coffee-cinematic-luxury',
      coffeeSteamLevel: 'auto',
      coffeeLiquidPhysics: true,
      blankSpaceEnabled: false,
      blankSpaceSide: 'right',
      aspectRatio: '4:3',
      ecommercePdp: null,
      bundle: { enabled: false, mode: 'single', products: [], layout: 'horizontal', spacing: 'tight' },
      interpretationNotes: {},
      qualityProfile: 'ecommerce-conversion',
      ultraRealStrict: true,
      splashStyle: 'Basic',
      backgroundColor: '#FFFFFF',
      accentColor: '#000000',
      colorLocks: { background: false, accent: false, gradientStart: false, gradientEnd: false, gradientMid: false },
      heroLandingAuto: { backgroundType: true },
      alignment: 'center',
      shadow: 'soft-drop',
      gradientEnabled: false,
      gradientStart: '#FFFFFF',
      gradientEnd: '#FFFFFF',
      gradientMid: '',
      gradientAngle: 180,
      props: '',
      ingredientLayout: 'grounded',
      interaction: 'none',
      placement: 'surface',
      viewpoint: 'eye-level',
      lens: '50mm Product Prime',
      lightingRig: 'Softbox Wrap',
      lightColorTemp: 'Neutral (5000K)',
      customLightColor: '',
      accentLightIntensity: 50,
      finish: 'High-Gloss Commercial',
      physicalScaleLabel: 'medium-tabletop',
    } as any);

    expect(mapped.photoMode).toBeUndefined();
    expect(mapped.visualStyle).toBe('Clinical Lab Counter');
    expect(mapped.visualStyleCategory).toBe('studio');
  });

  it('legacy visual style in photoMode migrates to visualStyle instead of staying in photoMode', () => {
    const mapped = toStudioV2State({
      photoMode: 'Wet Rock Ripples',
      industryProfile: 'supplements',
      definition: { type: 'skincare' },
      packagingMode: 'without-box',
      contextPreset: '',
      controlTier: 'basic',
      advancedModeEnabled: false,
      proMode: false,
      stateMotion: 'static',
      photoModeConfig: {},
      creativityLevel: 1,
      composition: 'centered',
      angle: '45_hero',
      distance: 'standard',
      rotation: 0,
      framing: 'centered_hero',
      cameraSystem: 'dslr_mirrorless',
      environmentContext: null,
      lighting: 'natural-light',
      ambientLighting: 'natural-light',
      environmentMacro: 'studio',
      microPlace: 'neutral-surface',
      customEnvironmentText: '',
      customMicroPlaceText: '',
      visualProfile: 'default',
      visualIntent: 'conversion',
      energyLevel: 'low',
      creativeTheme: 'clinical-minimal',
      propDensity: 'none',
      selectedProps: [],
      negativeSpace: 'none',
      scale: 'dominant',
      spacing: 'balanced',
      lightStyle: 'soft',
      products: [],
      activeProductId: null,
      mode: 'studio',
      handsHolding: false,
      palette: { source: 'auto', primaryColor: null, secondaryColor: null, accentColor: null, brandPresetId: null },
      sceneType: 'studio-branding',
      surface: 'neutral',
      category: '',
      wineLightingTone: 'Warm Lateral',
      wineMoodModifier: 'None',
      wineAction: 'static-presentation',
      winePourStyle: 'mid-flow-elegance',
      coffeeMode: 'studio',
      coffeeAction: 'static',
      coffeeLightingTone: 'auto',
      coffeeMoodModifier: 'coffee-cinematic-luxury',
      coffeeSteamLevel: 'auto',
      coffeeLiquidPhysics: true,
      blankSpaceEnabled: false,
      blankSpaceSide: 'right',
      aspectRatio: '4:3',
      ecommercePdp: null,
      bundle: { enabled: false, mode: 'single', products: [], layout: 'horizontal', spacing: 'tight' },
      interpretationNotes: {},
      qualityProfile: 'ecommerce-conversion',
      ultraRealStrict: true,
      splashStyle: 'Basic',
      backgroundColor: '#FFFFFF',
      accentColor: '#000000',
      colorLocks: { background: false, accent: false, gradientStart: false, gradientEnd: false, gradientMid: false },
      heroLandingAuto: { backgroundType: true },
      alignment: 'center',
      shadow: 'soft-drop',
      gradientEnabled: false,
      gradientStart: '#FFFFFF',
      gradientEnd: '#FFFFFF',
      gradientMid: '',
      gradientAngle: 180,
      props: '',
      ingredientLayout: 'grounded',
      interaction: 'none',
      placement: 'surface',
      viewpoint: 'eye-level',
      lens: '50mm Product Prime',
      lightingRig: 'Softbox Wrap',
      lightColorTemp: 'Neutral (5000K)',
      customLightColor: '',
      accentLightIntensity: 50,
      finish: 'High-Gloss Commercial',
      physicalScaleLabel: 'medium-tabletop',
    } as any);

    expect(mapped.photoMode).toBeUndefined();
    expect(mapped.visualStyle).toBe('Wet Rock Ripples');
    expect(mapped.visualStyleCategory).toBe('lifestyle');
  });

  it('integrity validator does not throw when visual style is selected', () => {
    expect(() =>
      __buildPromptForTest(base({ visualStyle: 'Dark Premium Studio', visualStyleCategory: 'studio' }))
    ).not.toThrow();
  });

  it('no visual style selected does not require visual style block', () => {
    const prompt = __buildPromptForTest(base({ visualStyle: undefined }));
    expect(prompt).not.toContain('VISUAL_STYLE_MODE: active.');
    expect(prompt).not.toContain('VISUAL_STYLE_NAME:');
  });

  it('visual-style-owned options do not remain in Special Effects list', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/step3/Step3Legacy.tsx'), 'utf8');
    const specialEffectsBlock = source.match(/const specialEffectsOptions:[\s\S]*?\];/);
    const block = specialEffectsBlock?.[0] || '';

    expect(block).not.toContain('Wet Rock Ripples');
    expect(block).not.toContain('Botanical Water Garden');
    expect(block).not.toContain('Sky Float Minimal');
    expect(block).not.toContain('Sand Palm Shadows');
    expect(block).not.toContain('Sunlit Stone Editorial');
    expect(block).not.toContain('Golden Sunset Backlit');
    expect(block).not.toContain('Bathroom Daylight Clean');
    expect(block).not.toContain('Warm Window Wood');
    expect(block).not.toContain('Soft Wellness Morning');
    expect(block).not.toContain('Outdoor Energy Boost');
    expect(block).not.toContain('Brand Campaign');
    expect(block).not.toContain('Creator Premium Simulation');
  });

  it('removed lifestyle visual styles no longer appear in the UI source', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/step3/Step3Legacy.tsx'), 'utf8');

    expect(source).not.toContain('Lifestyle Worlds');
    expect(source).not.toContain("{ label: 'Soft Wellness Morning', mode: 'Soft Wellness Morning' }");
    expect(source).not.toContain("{ label: 'Outdoor Energy Boost', mode: 'Outdoor Energy Boost' }");
  });

  it('special effects UI is grouped by commercial impact', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/step3/Step3Legacy.tsx'), 'utf8');

    expect(source).toContain("label: 'Fresh / Hydration'");
    expect(source).toContain("label: 'Luxury / Editorial'");
    expect(source).toContain("label: 'Bold / Campaign'");
  });
});
