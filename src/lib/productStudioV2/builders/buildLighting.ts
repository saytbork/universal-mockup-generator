import type { StudioAuthorityBundle } from '../types/studioTypes.ts';

export function buildLighting(authority: StudioAuthorityBundle): string {
  const lightingModel = (() => {
    if (authority.world === 'underwater') return 'underwater refracted directional light with depth-coherent caustics';
    if (authority.creativeIntent === 'clinical') return 'clinical sterile softbox precision with neutral reflectance';
    if (authority.creativeIntent === 'campaign') return 'natural directional campaign lighting with environmental bounce';
    if (authority.creativeIntent === 'luxury') return 'sculpted directional luxury key/fill/rim with micro-specular control';
    return 'conversion softbox wrap with label-priority separation';
  })();

  return `STUDIO_LIGHTING_MODEL: ${lightingModel}.`;
}
