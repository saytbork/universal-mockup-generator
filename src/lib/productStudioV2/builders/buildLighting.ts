import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildLighting(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.visualProfile === 'coffee') {
    if (state.coffeeVariant === 'coffee-premium-minimal' || state.visualIntent === 'conversion') {
      return [
        'STUDIO_LIGHTING_MODEL: coffee-premium-minimal.',
        'COFFEE_LIGHTING_RIG: neutral daylight key with controlled soft fill and disciplined highlight rolloff.',
        'COFFEE_LIGHTING_TEMPERATURE: neutral-daylight.',
        'COFFEE_SHADOW_PROFILE: controlled-soft.',
        'COFFEE_CONTRAST_PROFILE: medium-high.',
      ].join(' ');
    }
    if (state.coffeeVariant === 'coffee-color-pop-luxury' || state.visualIntent === 'campaign') {
      return [
        'STUDIO_LIGHTING_MODEL: coffee-color-pop-luxury.',
        'COFFEE_LIGHTING_RIG: refined studio key with higher contrast, controlled specular response, and premium color separation.',
        'COFFEE_LIGHTING_TEMPERATURE: studio-color-separation.',
        'COFFEE_SHADOW_PROFILE: refined-contrast.',
        'COFFEE_CONTRAST_PROFILE: high.',
      ].join(' ');
    }
    if (state.coffeeVariant === 'coffee-editorial-ritual' || state.visualIntent === 'editorial-ritual') {
      return [
        'STUDIO_LIGHTING_MODEL: coffee-editorial-ritual.',
        'COFFEE_LIGHTING_RIG: warm lateral ambient key with soft fill recovery and premium atmospheric falloff.',
        'COFFEE_LIGHTING_TEMPERATURE: warm-ambient.',
        'COFFEE_SHADOW_PROFILE: soft-deep.',
        'COFFEE_CONTRAST_PROFILE: medium.',
        'COFFEE_SHADOW_GRADIENT_DEPTH: slightly increased for editorial ritual mood.',
      ].join(' ');
    }
  }

  if (state?.winePrestigeMode) {
    const mood = String(state.wineMoodProfile || 'prestige').trim();
    return `STUDIO_LIGHTING_MODEL: wine-${mood}.`;
  }

  const override = String(state?.lightingModelOverride || '').trim();
  const photoMode = String(state?.photoMode || '').trim().toLowerCase();
  const isBeachFoamMode = photoMode === 'beach foam splash';
  const splashAdMode = Boolean(state?.splashAdMode);
  const parts: string[] = [];
  
  if (override) {
    parts.push(`STUDIO_LIGHTING_MODEL: ${override}.`);
  } else {
    const lightingModel = (() => {
      if (photoMode === 'underwater split') {
        return 'split-level sunlit underwater lighting with clean air-above-water brightness, refracted underwater directional light, visible caustics, and crisp hydration clarity';
      }
      if (authority.world === 'beach-daylight' || isBeachFoamMode) {
        return 'bright tropical daylight with sun directionality, warm beach bounce from white sand, and crisp turquoise-water reflections';
      }
      if (authority.world === 'underwater') return 'underwater refracted directional light with depth-coherent caustics';
      if (authority.creativeIntent === 'clinical') return 'clinical sterile softbox precision with neutral reflectance';
      if (authority.creativeIntent === 'campaign') return 'natural directional campaign lighting with environmental bounce';
      if (authority.creativeIntent === 'luxury') return 'sculpted directional luxury key/fill/rim with micro-specular control';
      return 'conversion softbox wrap with label-priority separation';
    })();

    parts.push(`STUDIO_LIGHTING_MODEL: ${lightingModel}.`);
  }

  // Accent/gel light color injection (from Pro Mode controls)
  const customColor = String((state as any)?.customLightColor || '').trim().toUpperCase();
  const intensity = Number((state as any)?.accentLightIntensity ?? 50);
  if (customColor && customColor !== '#FFFFFF' && /^#[0-9A-F]{6}$/.test(customColor)) {
    const intensityDesc = intensity <= 20 ? 'subtle' : intensity <= 40 ? 'moderate' : intensity <= 60 ? 'strong' : intensity <= 80 ? 'dramatic' : 'intense';
    parts.push(`ACCENT LIGHT GEL: ${customColor} at ${intensity}% intensity (${intensityDesc}). Add colored edge/rim lighting with this gel color on the product edges and contours, creating ${intensityDesc} colored highlights and atmospheric glow.`);
  }

  if (splashAdMode) {
    parts.push(
      'SPLASH_AD_LIGHTING: slightly elevated contrast ratio, crisp specular highlights, and micro edge highlights on droplets. Preserve product geometry lock and reference integrity.'
    );
  }

  return parts.join(' ');
}
