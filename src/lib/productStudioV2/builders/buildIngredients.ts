import type { StudioUIState } from '../types/studioTypes';

const INGREDIENT_MODES = new Set(['Ingredient Stack', 'Ingredient Flat Lay']);

export function buildIngredients(state?: StudioUIState): string {
  const photoMode = String(state?.photoMode || '').trim();
  if (!INGREDIENT_MODES.has(photoMode)) return '';

  const objects = String(state?.ingredientObjects || '').trim();
  if (!objects) return '';

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
