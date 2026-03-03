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
  if (!settings || typeof settings !== 'object') return '';

  const entries = Object.entries(settings).filter(([, v]) => String(v).trim());
  if (entries.length === 0) return '';

  const photoMode = String(state?.photoMode || '').trim();
  const ingredientStackBackgroundOverride = (() => {
    if (photoMode !== 'Ingredient Stack') return '';
    const enabled = String(settings.backgroundEnabled || '').trim().toLowerCase() === 'true';
    if (!enabled) return '';
    const rawType = String(settings.backgroundType || '').trim().toLowerCase();
    const backgroundType = rawType === 'gradient' ? 'gradient' : 'solid';
    const colorSource = String(settings.colorSource || '').trim() || 'Brand Colors';
    const solidColor = String(settings.backgroundColor || '').trim();
    const gradientStart = String(settings.gradientStart || '').trim();
    const gradientEnd = String(settings.gradientEnd || '').trim();
    const gradientStyle = String(settings.gradientStyle || '').trim();

    if (backgroundType === 'gradient') {
      const start = gradientStart || solidColor || '#FFFFFF';
      const end = gradientEnd || gradientStart || solidColor || '#FFFFFF';
      const style = gradientStyle || 'Soft';
      return `INGREDIENT_STACK_BACKGROUND_OVERRIDE: type=gradient; colorSource=${colorSource}; gradientStyle=${style}; startColor=${start}; endColor=${end}; Apply this as the explicit studio background for Ingredient Stack.`;
    }

    const color = solidColor || gradientStart || '#FFFFFF';
    return `INGREDIENT_STACK_BACKGROUND_OVERRIDE: type=solid; colorSource=${colorSource}; solidColor=${color}; Apply this as the explicit studio background for Ingredient Stack.`;
  })();

  const parts = entries.map(([key, value]) => {
    const safeKey = key.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    const safeValue = String(value).trim();
    return `PHOTO_MODE_SETTING_${safeKey}: ${safeValue}.`;
  });

  const dynamicBlock = `PHOTO_MODE_DYNAMIC_CONTROLS: ${parts.join(' ')}`;
  return ingredientStackBackgroundOverride
    ? `${dynamicBlock} ${ingredientStackBackgroundOverride}`
    : dynamicBlock;
}
