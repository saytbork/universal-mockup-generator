import type { StudioUIState } from '../types/studioTypes';

const INGREDIENT_MODES = new Set(['Ingredient Stack', 'Ingredient Flat Lay', 'Textured Bed / Scatter Base']);

export function buildIngredients(state?: StudioUIState): string {
  const photoMode = String(state?.photoMode || '').trim();
  if (!INGREDIENT_MODES.has(photoMode)) return '';

  const objects = String(state?.ingredientObjects || '').trim();
  if (!objects) {
    if (photoMode === 'Textured Bed / Scatter Base') {
      return [
        'TEXTURED_BED_REQUIREMENT: User-defined ingredients are mandatory. No default materials allowed.',
        'TEXTURED_BED_VALIDATION: Missing user-defined ingredients. Do not generate textured bed until ingredients are provided by the user.',
      ].join(' ');
    }
    return '';
  }

  if (photoMode === 'Textured Bed / Scatter Base') {
    return [
      `TEXTURED_BED_INGREDIENT_AUTHORITY: Build the textured bed exclusively from: ${objects}.`,
      'TEXTURED_BED_INGREDIENT_POLICY: No substitutions. No generic textures. No category defaults.',
      'TEXTURED_BED_PROHIBITED_DEFAULTS: No coffee beans. No seeds. No sand. No stones. No crystals. No powders. No fillers.',
      'TEXTURED_BED_MANDATORY_VISUALIZATION: Every listed ingredient must be visibly present as part of the bed around the product.',
    ].join(' ');
  }

  const layoutRaw = String(state?.ingredientLayout || 'grounded').trim().toLowerCase();
  const layoutDirective =
    layoutRaw === 'top-view'
      ? 'arranged in top-down flat lay formation around the product'
      : layoutRaw === 'auto'
        ? 'arranged naturally around the product'
        : 'grounded on the same physical surface plane as the product';

  return [
    `INGREDIENT_OBJECTS: The following ingredient elements must physically appear in the scene: ${objects}.`,
    `INGREDIENT_LAYOUT: ${layoutDirective}.`,
    'INGREDIENT_MANDATORY: These objects are mandatory — do not omit, do not substitute, do not summarize.',
    'INGREDIENT_VISUALIZATION: Each ingredient listed must be visually represented exactly as named. Do NOT substitute with generic or cosmetic ingredients. Do NOT hallucinate ingredients not listed here.',
  ].join(' ');
}
