import type { StudioUIState } from '../types/studioTypes.ts';
import { buildHeroMode } from '../photoModes/heroMode';
import { resolvePhotoModeBuilder } from '../photoModes/router';
import { emitPhotoModeSettings, getDynamicSettings } from '../photoModes/shared';

function buildGenericDynamicContract(state?: StudioUIState): string {
  const photoMode = String(state?.photoMode || '').trim();
  const settings = getDynamicSettings(state);

  if (Object.keys(settings).length > 0) {
    return emitPhotoModeSettings(settings);
  }

  return buildHeroMode(photoMode);
}

export function buildPhotoModeDynamic(state?: StudioUIState): string {
  const photoMode = String(state?.photoMode || '').trim();
  const builder = resolvePhotoModeBuilder(photoMode);

  // eslint-disable-next-line no-console
  console.log('[PHOTO MODE BUILDER RESOLVED]', builder ? builder.name || photoMode : 'buildGenericDynamicContract');

  let contract = builder ? builder(state) : buildGenericDynamicContract(state);
  if (photoMode === 'Wine Macro Label' && !/INTERACTION_MODE:/i.test(contract)) {
    contract = ['INTERACTION_MODE: label-inspection.', contract].filter(Boolean).join(' ');
  }

  // eslint-disable-next-line no-console
  console.log('[PHOTO MODE CONTRACT GENERATED]', JSON.stringify(contract));

  return contract;
}
