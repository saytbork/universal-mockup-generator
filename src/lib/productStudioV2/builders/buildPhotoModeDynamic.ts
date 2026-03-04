import type { StudioUIState } from '../types/studioTypes.ts';

/**
 * Injects Photo Mode dynamic sub-settings (macroTightness, dropletMode, etc.)
 * into the V2 prompt. These come from the user's per-Photo-Mode controls in the UI.
 * Each key→value pair is emitted as a PHOTO_MODE_SETTING_<KEY>: <value> block.
 * Last-selection-wins: if the same key appears multiple times, the last write wins (guaranteed
 * by the Record<string,string> deduplication in toStudioV2State).
 */
export function buildPhotoModeDynamic(state?: StudioUIState): string {
  const settings = state?.photoModeDynamicSettings;
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildPhotoModeDynamic] EXECUTED. photoMode=', state?.photoMode, '| photoModeDynamicSettings=', JSON.stringify(settings));
  if (!settings || typeof settings !== 'object') return '';

  const entries = Object.entries(settings).filter(([, v]) => String(v).trim());
  if (entries.length === 0) return '';

  const parts = entries.map(([key, value]) => {
    const safeKey = key.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    const safeValue = String(value).trim();
    return `PHOTO_MODE_SETTING_${safeKey}: ${safeValue}.`;
  });

  const result = `PHOTO_MODE_DYNAMIC_CONTROLS: ${parts.join(' ')}`;
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildPhotoModeDynamic] emitted:', JSON.stringify(result));
  return result;
}
