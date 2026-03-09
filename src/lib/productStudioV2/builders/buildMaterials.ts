import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

/** Maps Physical Presence material values to descriptive material profiles. */
const MATERIAL_PROFILE_MAP: Record<string, string> = {
  'plastic': 'matte/satin plastic with controlled specular hotspots and label-safe diffuse surface',
  'metal': 'brushed or polished metal with directional reflective highlights and edge specular clarity',
  'glass': 'transparent glass with realistic refraction, transmission highlights, and controlled caustics',
  'rubber': 'soft matte rubber with high diffuse absorption, minimal specular, and tactile edge definition',
  'mixed': 'mixed-material product surface with per-zone material differentiation and coherent reflectance',
};

/** Maps Physical Presence placement values for the material/contact zone context. */
const PLACEMENT_SURFACE_MAP: Record<string, string> = {
  'surface': 'grounded surface contact with physically correct shadow and ambient occlusion at base',
  'held': 'hand-held in-use — floating with natural grip shadow, no ground plane required',
  'supported': 'propped or leaned against support surface — natural lean shadow and contact point',
  'air-suspended': 'air-suspended with zero ground contact — clean floating isolation, no shadow base',
};

export function buildMaterials(authority: StudioAuthorityBundle, state?: StudioUIState): string {
  const industryProfile = String(state?.industryProfile || '').trim().toLowerCase();
  if (state?.visualProfile === 'coffee') {
    return [
      'STUDIO_MATERIAL_PROFILE: coffee-ceramic-priority.',
      'COFFEE_MATERIAL_PROFILE: Micro specular edge on liquid rim. Soft ceramic highlight rolloff. Controlled reflective hotspots. No plastic gloss. High realism surface diffusion.',
      'COFFEE_LIQUID_SURFACE: dark core absorption with soft surface diffusion and meniscus coherence.',
      'COFFEE_GLASS_GUARD: no wine-style glass refraction priority and no cork rendering logic.',
    ].join(' ');
  }

  if (state?.winePrestigeMode) {
    return 'STUDIO_MATERIAL_MODEL: premium wine materials with controlled reflections and strict geometry-preserving integration.';
  }

  const isSupplementIndustry = industryProfile === 'supplements' || industryProfile === 'supplement';
  const materialModel = (() => {
    if (authority.world === 'beach-daylight') {
      return 'natural Caribbean shoreline materials: clean white sand grain, turquoise shallows, sea-foam edge behavior, and physically coherent wet contact zones';
    }
    if (authority.world === 'underwater') {
      return 'submerged materials with coherent caustics, depth haze, and water-contact realism';
    }
    if (authority.creativeIntent === 'clinical') {
      return 'sterile controlled surfaces with contamination-free reflectance and high legibility';
    }
    if (authority.creativeIntent === 'luxury' || authority.creativeIntent === 'campaign') {
      return 'premium tactile materials with controlled atmospheric layering and optical realism';
    }
    return 'clean conversion-grade surfaces optimized for label clarity and edge integrity';
  })();

  const parts: string[] = [`STUDIO_MATERIAL_PROFILE: ${materialModel}.`];

  if (isSupplementIndustry) {
    parts.push(
      'SUPPLEMENT_MATERIAL_REALISM: Commercial-grade packaging materials with controlled specular highlights, believable micro-surface variation, true contact shadows, and no fake composite sheen. Optical behavior must read as photographed, not rendered.'
    );
  }

  // Physical Presence — container material override (last-selection-wins)
  const productMaterial = String(state?.productMaterial || '').trim().toLowerCase();
  if (productMaterial && MATERIAL_PROFILE_MAP[productMaterial]) {
    parts.push(`PRODUCT_MATERIAL_OVERRIDE: ${MATERIAL_PROFILE_MAP[productMaterial]}.`);
  }

  // Physical Presence — product color reference
  const productColor = String(state?.productColor || '').trim();
  if (productColor) {
    parts.push(`PRODUCT_COLOR_REFERENCE: ${productColor}. Preserve this color reference on the product container and label area.`);
  }

  // Physical Presence — form scale
  const formScale = String(state?.productFormScale || '').trim().toLowerCase();
  if (formScale) {
    const scaleDesc = formScale === 'small' ? 'small compact product — render noticeably smaller than a standard bottle, approximately hand-palm size'
      : formScale === 'large' ? 'large format product — render prominently sized, occupying majority of frame height'
      : 'medium standard product size';
    parts.push(`PRODUCT_FORM_SCALE: ${scaleDesc}.`);
  }

  // Physical placement — surface contact context
  const placement = String(state?.physicalPlacement || '').trim().toLowerCase();
  if (placement && PLACEMENT_SURFACE_MAP[placement]) {
    parts.push(`PHYSICAL_PLACEMENT_CONTEXT: ${PLACEMENT_SURFACE_MAP[placement]}.`);
  }

  return parts.join(' ');
}
