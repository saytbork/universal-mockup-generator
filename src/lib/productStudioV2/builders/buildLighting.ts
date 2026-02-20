import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildLighting(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  if (state?.winePrestigeMode) {
    const tone = String(state.wineLightingTone || '').trim() || 'Warm Lateral';
    return [
      'STUDIO_LIGHTING_MODEL: wine-prestige.',
      `WINE_LIGHTING_TONE: ${tone}.`,
      'LIGHTING_MODEL: warm lateral key light, soft shadow falloff, controlled specular highlights, low-intensity rim separation, and subtle ambient fill (never flat).',
      'TONE_MAPPING: slight warmth bias with deep shadow preservation and strict highlight control. Do not overexpose label typography.',
      'LIGHTING_DETAIL: allow crisp micro-edge highlights on droplets/reflections while preserving product geometry lock.',
      'HARD_DISABLES: hyper-clinical lighting and flat ecommerce lighting are forbidden.',
    ].join(' ');
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
