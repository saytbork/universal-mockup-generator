import type { StudioUIState } from '../types/studioTypes';

export function buildFoamTextureMode(state?: StudioUIState): string {
  const root = state as StudioUIState & {
    textureType?: string;
    textureDensity?: string;
  };

  const textureType = String(root?.textureType || 'Foam').trim().toLowerCase();
  const textureDensity = String(root?.textureDensity || 'Light').trim().toLowerCase();

  return [
    'INTERACTION_MODE: surface texture interaction.',
    'MATERIAL_MODE: cosmetic texture.',
    `TEXTURE_TYPE: ${textureType}.`,
    `TEXTURE_DENSITY: ${textureDensity}.`,
    'APPLICATION_ZONE: product base perimeter.',
    'CONTACT_SURFACE: support plane.',
    'PRODUCT_GROUNDING: true.',
    'LOCAL_DEFORMATION: surface only.',
    'NO_SPLASH_POLICY: active.',
  ].join(' ');
}
