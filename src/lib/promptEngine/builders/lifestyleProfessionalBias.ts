import type { PromptOptions } from '../types';

const ACTIVATION_SCENE_TYPE = 'lifestyle-real';

function isLifestyleProBiasActive(options: PromptOptions): boolean {
  const sceneType = String((options as any).sceneType || '').trim().toLowerCase();
  const creationMode = String(options.creationMode || '').trim().toLowerCase();
  const contentStyle = String((options as any).contentStyle || '').trim().toLowerCase();
  const ugcActive = Boolean(options.ugcRealModeActive);
  const advertisingProfile = String((options as any).lifestyleAdvertisingProfile || '').trim();

  return (
    sceneType === ACTIVATION_SCENE_TYPE &&
    (advertisingProfile.length > 0 || ((creationMode === 'aesthetic' || creationMode === 'lifestyle') && contentStyle === 'brand')) &&
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

    const parts: string[] = [
      'LIFESTYLE_PRO_BIAS_LAYER: active.',
      'Lifestyle editorial photography standard.',
      'Environment discipline: editorial-grade interior environment, controlled set styling, intentional background simplification, no clutter unless explicitly requested.',
      'Background depth: subtle cinematic blur with controlled falloff and stabilized framing.',
      'Camera reinforcement: set-lit enhancement even under natural light, commercial dynamic range, precision framing, and brand-safe compositional control.',
      'Signal suppression: remove user-generated framing drift, domestic storytelling tone, handheld instability, and phone-capture aesthetics.',
      'Skin discipline: real human skin only. Preserve pores, micro-texture, fine lines, slight asymmetry, and natural tonal shifts. No porcelain smoothing, no mannequin finish, no waxy highlights, no beauty-filter skin, and no CGI facial polish.',
      'Grooming discipline: hair must read clean, dry, styled, and campaign-ready. No wet hair, greasy roots, damp strands on the face, post-shower texture, accidental flyaway clumps, or sweaty grooming cues.',
      'Styling discipline: appearance must feel polished advertising/editorial, never bathroom realism, never domestic cleanup moment, never after-workout, and never just-woke-up.',
    ];

    if (skinRealism.includes('raw / real') || skinRealism.includes('raw') || skinRealism.includes('real')) {
      parts.push(
        'Person realism calibration: preserve authentic skin realism while applying commercial-grade grooming, intentional wardrobe styling, and brand-neutral clothing language.'
      );
    }

    if (productInteraction === 'holding') {
      parts.push(
        'Holding directive: structured grip, pose-directed positioning, controlled wrist alignment, and product-forward hand geometry.'
      );
    }

    return parts.join(' ');
  }
}
