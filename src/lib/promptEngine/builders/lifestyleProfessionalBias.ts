import type { PromptOptions } from '../types';

const ACTIVATION_SCENE_TYPE = 'lifestyle-real';
const ACTIVATION_CREATION_MODE = 'aesthetic';
const ACTIVATION_CONTENT_STYLE = 'brand';

function isLifestyleProBiasActive(options: PromptOptions): boolean {
  const sceneType = String((options as any).sceneType || '').trim().toLowerCase();
  const creationMode = String(options.creationMode || '').trim().toLowerCase();
  const contentStyle = String((options as any).contentStyle || '').trim().toLowerCase();
  const ugcActive = Boolean(options.ugcRealModeActive);

  return (
    sceneType === ACTIVATION_SCENE_TYPE &&
    creationMode === ACTIVATION_CREATION_MODE &&
    contentStyle === ACTIVATION_CONTENT_STYLE &&
    !ugcActive
  );
}

export class LifestyleProfessionalBiasBuilder {
  build(options: PromptOptions): string {
    if (!isLifestyleProBiasActive(options)) return '';

    const skinRealism = String(
      options.skinRealism ||
        options.personDetails?.skinRealism ||
        ''
    )
      .trim()
      .toLowerCase();
    const productInteraction = String(options.productInteraction || '').trim().toLowerCase();
    const visualIntent = String(options.visualIntent || 'editorial').trim().toLowerCase();

    const intentLine =
      visualIntent === 'luxury'
        ? 'Intent profile: luxury campaign. More elevated, aspirational, sculpted, and materially rich.'
        : visualIntent === 'brand'
          ? 'Intent profile: brand campaign. Cleaner, sharper, more conversion-oriented, and product-legible.'
          : 'Intent profile: editorial campaign. More design-forward, magazine-like, and composition-led.';

    const intentDirection =
      visualIntent === 'luxury'
        ? 'Luxury direction: dramatic premium lighting, richer surfaces, aspirational set styling, and a clearly expensive visual hierarchy.'
        : visualIntent === 'brand'
          ? 'Brand direction: cleaner commercial hierarchy, stronger product readability, sharper selling clarity, and premium conversion-safe composition.'
          : 'Editorial direction: bolder composition, more image-making energy, magazine-grade set balance, and stronger design-led framing.';

    const parts: string[] = [
      'LIFESTYLE_PRO_BIAS_LAYER: active.',
      'Lifestyle editorial photography standard with campaign-grade commercial polish.',
      intentLine,
      intentDirection,
      'Creative advertising direction: premium, art-directed, visually expensive, and clearly built for brand campaign use.',
      'Environment discipline: editorial-grade interior environment, controlled set styling, intentional background simplification, premium prop discipline, no clutter unless explicitly requested.',
      'Background depth: subtle premium separation with controlled falloff and stabilized framing.',
      'Camera reinforcement: set-lit enhancement even under natural light, commercial dynamic range, precision framing, premium ad contrast, and brand-safe compositional control.',
      'Signal suppression: remove user-generated framing drift, domestic storytelling tone, handheld instability, low-tier social-content aesthetics, and phone-capture vibes.',
    ];

    if (skinRealism.includes('raw / real') || skinRealism.includes('raw') || skinRealism.includes('real')) {
      parts.push(
        'Person realism calibration: preserve authentic skin realism while applying commercial-grade grooming, intentional wardrobe styling, premium finish control, and campaign-ready presentation.'
      );
    }

    if (productInteraction === 'holding') {
      parts.push(
        'Holding directive: structured grip, pose-directed positioning, controlled wrist alignment, product-forward hand geometry, and premium hero readability.'
      );
    }

    return parts.join(' ');
  }
}
