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

  // Light color/temperature injection (from Pro Mode controls)
  const customColor = String((state as any)?.customLightColor || '').trim().toUpperCase();
  if (customColor && customColor !== '#FFFFFF' && /^#[0-9A-F]{6}$/.test(customColor)) {
    parts.push(`LIGHT_COLOR: ${customColor}. All light sources must have this exact color tint, creating a colored lighting atmosphere throughout the scene.`);
  } else {
    const temp = String((state as any)?.lightColorTemp || '').trim();
    if (temp && temp !== 'Neutral (5000K)') {
      const tempMap: Record<string, string> = {
        'Warm (3200K)': 'Color temperature: 3200K. Warm, amber-orange light creating a cozy, intimate mood with yellow-red undertones.',
        'Neutral (5000K)': 'Color temperature: 5000K. Neutral white light with balanced color accuracy, no warm or cool bias.',
        'Cool (6500K)': 'Color temperature: 6500K. Cool, slightly blue-tinted light creating a clean, modern atmosphere.',
        'Daylight (5600K)': 'Color temperature: 5600K. Natural daylight white with slight cool undertones, mimicking midday sun.',
        'Tungsten (3000K)': 'Color temperature: 3000K. Warm tungsten light with strong amber-yellow cast, classic interior lighting feel.',
        'LED Cool (7000K)': 'Color temperature: 7000K. Cool LED white with pronounced blue undertones, contemporary clinical aesthetic.',
      };
      parts.push(tempMap[temp] || `Color temperature: ${temp}.`);
    }
  }

  return parts.join(' ');
}
