// Freeze guard: respect protected lighting resolution priority chain.
import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

type LightingState = StudioUIState & {
  lighting?: string;
  lightingPreset?: string;
  lightingMode?: string;
  customLightColor?: string;
  accentLightIntensity?: number;
};

/** Maps basic lighting selector values to natural-language descriptions for the image model. */
const BASIC_LIGHTING_MAP: Record<string, string> = {
  'natural-light': 'natural diffused daylight with realistic directional shadow falloff',
  'overcast': 'overcast diffused daylight with flat soft shadows and even illumination',
  'cozy-indoors': 'warm indoor ambient light with gentle mixed-source shadows and soft highlights',
  'ring-light': 'ring light frontal fill with even exposure and circular catchlights',
  'clinical-softbox': 'conversion softbox wrap with label-priority separation',
};

const PRESET_ALIAS_MAP: Record<string, string> = {
  'natural-light': 'natural light',
  'soft-diffused': 'soft diffused',
  'studio-high-key': 'studio high key',
  'studio-low-key': 'studio low key',
  'overcast-natural': 'overcast natural',
  'golden-hour': 'golden hour',
  'sunny-day': 'sunny day',
};

export function buildLighting(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  const lightingState = state as LightingState | undefined;
  const industryProfile = String(state?.industryProfile || '').trim().toLowerCase();
  if (state?.visualProfile === 'coffee') {
    const mood = state.coffeeMoodProfile || 'ritual-editorial';
    if (mood === 'coffee-cinematic-luxury') {
      return [
        'COFFEE_LIGHTING_PROFILE: cinematic-directional-warm.',
        'COFFEE_LIGHTING_TEMPERATURE: warm-ritual.',
        'COFFEE_SHADOW_PROFILE: deep-layered-soft.',
        'COFFEE_CONTRAST_PROFILE: cinematic-depth.',
        'COFFEE_LIGHTING_FINE: cinematic ritual shaping with deep layered gradients and warm directional falloff.',
      ].join(' ');
    }
    return [
      `STUDIO_LIGHTING_PROFILE: coffee-${mood}.`,
      `COFFEE_LIGHTING_TEMPERATURE: ${state.lightingTemperatureProfile || 'neutral-daylight'}.`,
      `COFFEE_SHADOW_PROFILE: ${state.shadowProfile || 'controlled-soft'}.`,
      `COFFEE_CONTRAST_PROFILE: ${state.contrastProfile || 'medium'}.`,
      'COFFEE_LIGHTING_FINE: lighting refinement follows coffee mood profile and steam visibility level.',
    ].join(' ');
  }

  if (state?.winePrestigeMode) {
    const mood = String(state.wineMoodProfile || 'prestige').trim();
    return `STUDIO_LIGHTING_MODEL: wine-${mood}.`;
  }

  const isSupplementIndustry = industryProfile === 'supplements' || industryProfile === 'supplement';
  const override = String(state?.lightingModelOverride || '').trim();
  const basicLighting = String(state?.basicLighting || '').trim().toLowerCase();
  const rawPresetLighting = String(
    lightingState?.lighting ||
      lightingState?.lightingPreset ||
      lightingState?.lightingMode ||
      ''
  )
    .trim()
    .toLowerCase();
  const normalizedPreset = PRESET_ALIAS_MAP[rawPresetLighting] ?? rawPresetLighting;
  const photoMode = String(state?.photoMode || '').trim().toLowerCase();
  const isBeachFoamMode = photoMode === 'beach foam splash';
  const splashAdMode = Boolean(state?.splashAdMode);
  const parts: string[] = [];
  
  if (override) {
    parts.push(`STUDIO_LIGHTING_PROFILE: ${override}.`);
  } else if (basicLighting && BASIC_LIGHTING_MAP[basicLighting]) {
    // Basic lighting selector — user explicit choice, always wins over world inference
    parts.push(`STUDIO_LIGHTING_PROFILE: ${BASIC_LIGHTING_MAP[basicLighting]}.`);
  } else if (normalizedPreset) {
    if (normalizedPreset === 'sunny day' || normalizedPreset === 'natural light') {
      parts.push('STUDIO_LIGHTING_PROFILE: sunny day window light.');
      parts.push('STUDIO_LIGHT_DIRECTION: natural side illumination.');
      parts.push('STUDIO_SHADOW_STYLE: soft daylight shadows.');
    } else if (normalizedPreset === 'golden hour') {
      parts.push('STUDIO_LIGHTING_PROFILE: golden hour directional sunlight with warm rim falloff.');
    } else if (normalizedPreset === 'soft diffused') {
      parts.push('STUDIO_LIGHTING_PROFILE: soft diffused studio daylight with gentle wrap.');
    } else if (normalizedPreset === 'overcast natural') {
      parts.push('STUDIO_LIGHTING_PROFILE: overcast natural daylight with low-contrast diffuse shadows.');
    } else if (normalizedPreset === 'studio high key') {
      parts.push('STUDIO_LIGHTING_PROFILE: studio high-key lighting with bright even exposure.');
    } else if (normalizedPreset === 'studio low key') {
      parts.push('STUDIO_LIGHTING_PROFILE: studio low-key lighting with controlled deep shadow contrast.');
    } else {
      parts.push(`STUDIO_LIGHTING_PROFILE: ${normalizedPreset}.`);
    }
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

    parts.push(`STUDIO_LIGHTING_PROFILE: ${lightingModel}.`);

    // V1 hero studio lighting guardrail — inject for default studio hero mode
    const isHeroPhotoMode = !photoMode || photoMode === 'hero landing page';
    const isDefaultStudio =
      authority.world === 'studio' &&
      !splashAdMode &&
      !isBeachFoamMode &&
      authority.creativeIntent !== 'clinical';
    if (isHeroPhotoMode && isDefaultStudio) {
      parts.push(
        'HERO_STUDIO_LIGHTING: Use controlled studio lighting with softbox wrap and subtle rim separation. Highlight label readability. Maintain clean shadow under the product. Avoid dramatic directional lighting.'
      );
    }
  }

  // Accent/gel light color injection (from Pro Mode controls)
  const customColor = String(lightingState?.customLightColor || '').trim().toUpperCase();
  const intensity = Number(lightingState?.accentLightIntensity ?? 50);
  if (customColor && customColor !== '#FFFFFF' && /^#[0-9A-F]{6}$/.test(customColor)) {
    const intensityDesc = intensity <= 20 ? 'subtle' : intensity <= 40 ? 'moderate' : intensity <= 60 ? 'strong' : intensity <= 80 ? 'dramatic' : 'intense';
    parts.push(`ACCENT LIGHT GEL: ${customColor} at ${intensity}% intensity (${intensityDesc}). Add colored edge/rim lighting with this gel color on the product edges and contours, creating ${intensityDesc} colored highlights and atmospheric glow.`);
  }

  if (splashAdMode) {
    parts.push(
      'SPLASH_AD_LIGHTING: slightly elevated contrast ratio, crisp specular highlights, and micro edge highlights on droplets. Preserve product geometry lock and reference integrity.'
    );
  }

  if (isSupplementIndustry) {
    parts.push(
      'SUPPLEMENT_AD_LIGHTING_REALISM: Hyper-real commercial lighting with disciplined specular control, true lens behavior, natural highlight roll-off, and optical depth that feels captured in-camera. No fake composite look.'
    );
  }

  return parts.join(' ');
}
