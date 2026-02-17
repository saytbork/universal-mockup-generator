import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

export function buildLighting(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  const override = String(state?.lightingModelOverride || '').trim();
  const parts: string[] = [];
  
  if (override) {
    parts.push(`STUDIO_LIGHTING_MODEL: ${override}.`);
  } else {
    const lightingModel = (() => {
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

  return parts.join(' ');
}
