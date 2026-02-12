import type { CanonicalScene } from './atmosphereResolver';

export type ValidationError = {
  code: string;
  message: string;
  severity: 'warning' | 'critical';
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

const normalize = (value: unknown): string => String(value || '').toLowerCase();

const countOccurrences = (source: string, token: string): number => {
  if (!token) return 0;
  let count = 0;
  let index = 0;
  while (true) {
    const found = source.indexOf(token, index);
    if (found === -1) break;
    count += 1;
    index = found + token.length;
  }
  return count;
};

const resolveWorldId = (scene: CanonicalScene): 'studio' | 'underwater' | 'splash-tank' | 'outdoor' => {
  const visualWorld = normalize(scene.visualWorld).trim();
  if (visualWorld === 'underwater') return 'underwater';
  if (visualWorld === 'splash-tank' || visualWorld === 'splash tank') return 'splash-tank';
  if (visualWorld === 'outdoor' || visualWorld === 'environment') return 'outdoor';
  if (visualWorld === 'studio' || visualWorld === 'photo studio') return 'studio';

  const mode = normalize(scene.photoMode);
  const env = normalize(scene.environmentSettings);
  if (mode.includes('underwater') || env.includes('underwater')) return 'underwater';
  if (mode.includes('splash') || mode.includes('foam') || mode.includes('pool water')) return 'splash-tank';
  if (normalize(scene.photoType).includes('environment')) return 'outdoor';
  return 'studio';
};

const addError = (
  errors: ValidationError[],
  code: string,
  message: string,
  severity: 'warning' | 'critical'
) => {
  errors.push({ code, message, severity });
};

export function validateAtmosphere(
  scene: CanonicalScene,
  prompt: string
): ValidationResult {
  const errors: ValidationError[] = [];
  const text = String(prompt || '');
  const lower = text.toLowerCase();
  const world = resolveWorldId(scene);
  const mode = String(scene.photoMode || '').trim();

  if (
    mode === 'Hero Landing Page' ||
    mode === 'Color Pop Hero' ||
    mode === 'Ingredient Stack' ||
    mode === 'Ingredient Flat Lay'
  ) {
    if (!lower.includes('locked module')) {
      addError(errors, 'LOCKED_COMPOSITION_MISSING', 'Locked composition requires "locked module" marker.', 'critical');
    }
  }

  if (world === 'underwater' && (lower.includes('softbox') || lower.includes('studio'))) {
    addError(errors, 'WORLD_LIGHTING_CONFLICT_UNDERWATER', 'Underwater world cannot use softbox/studio lighting.', 'critical');
  }
  if (world === 'studio' && lower.includes('underwater')) {
    addError(errors, 'WORLD_LIGHTING_CONFLICT_STUDIO', 'Studio world cannot use underwater lighting semantics.', 'critical');
  }
  if (world === 'outdoor' && lower.includes('clinical softbox')) {
    addError(errors, 'WORLD_LIGHTING_WARNING_OUTDOOR', 'Outdoor world with clinical softbox may be visually inconsistent.', 'warning');
  }

  if (world === 'outdoor') {
    const indoorProps = ['kitchen', 'bathroom', 'bedroom', 'nightstand', 'desk', 'indoor'];
    if (indoorProps.some(token => lower.includes(token))) {
      addError(errors, 'OUTDOOR_INDOOR_PROPS_WARNING', 'Outdoor world includes indoor prop language.', 'warning');
    }
  }

  const customIngredients = Array.isArray(scene.customIngredients) ? scene.customIngredients : [];
  const defaultIngredients = Array.isArray(scene.defaultIngredients)
    ? scene.defaultIngredients.filter(item => String(item || '').trim().length > 0)
    : [];
  const hasCustomIngredients = customIngredients.length > 0;
  const hasDefaultIngredients = defaultIngredients.length > 0;
  const hasIngredients = hasCustomIngredients || hasDefaultIngredients;

  if (text.includes('INGREDIENT_RESOLUTION') && !hasIngredients) {
    addError(errors, 'INGREDIENT_BLOCK_WITHOUT_INGREDIENTS', 'INGREDIENT_RESOLUTION exists but no ingredients are present in scene.', 'critical');
  }

  if (hasCustomIngredients) {
    if (!text.includes('INGREDIENT_RESOLUTION')) {
      addError(errors, 'INGREDIENT_BLOCK_MISSING', 'Custom ingredients require INGREDIENT_RESOLUTION block.', 'critical');
    }
    const seen = new Set<string>();
    for (const ingredient of customIngredients) {
      const name = String(ingredient?.name || '').trim();
      const key = name.toLowerCase();
      if (!name) continue;
      if (seen.has(key)) {
        addError(errors, 'INGREDIENT_DUPLICATE', `Duplicate ingredient detected: ${name}`, 'warning');
      }
      seen.add(key);
      if (!lower.includes(key)) {
        addError(errors, 'INGREDIENT_NOT_FOUND_IN_PROMPT', `Ingredient "${name}" not found in prompt.`, 'warning');
      }
    }
    if (customIngredients.length > 6) {
      addError(errors, 'INGREDIENT_LIMIT_EXCEEDED', 'Ingredient count is above 6.', 'warning');
    }
  }

  const special = (scene.specialEffects || []).map(v => normalize(v));
  if (special.some(v => v.includes('splash shot')) && !lower.includes('gravity arc')) {
    addError(errors, 'EFFECT_SPLASH_MISMATCH', 'Splash Shot requires "gravity arc" language.', 'critical');
  }
  if (special.some(v => v.includes('condensation droplets')) && !lower.includes('cold-surface')) {
    addError(errors, 'EFFECT_CONDENSATION_MISMATCH', 'Condensation Droplets requires "cold-surface" language.', 'warning');
  }
  if (special.some(v => v.includes('underwater split')) && !lower.includes('waterline')) {
    addError(errors, 'EFFECT_UNDERWATER_MISMATCH', 'Underwater Split requires "waterline" language.', 'critical');
  }

  if (!lower.includes('no floating')) {
    addError(errors, 'PHYSICS_NO_FLOATING_MISSING', 'Physics rules must include "no floating".', 'critical');
  }
  if (!lower.includes('respect real-world scale')) {
    addError(errors, 'PHYSICS_SCALE_MISSING', 'Physics rules must include "respect real-world scale".', 'critical');
  }
  if (lower.includes('floating') && !lower.includes('shadow anchor') && !lower.includes('anchor shadow') && !lower.includes('buoyancy')) {
    addError(errors, 'GRAVITY_INCONSISTENT_FLOATING', 'Floating behavior detected without anchor/buoyancy coherence.', 'critical');
  }
  if ((lower.includes('ground') || lower.includes('surface') || lower.includes('placement')) && !lower.includes('contact shadow')) {
    addError(errors, 'PLACEMENT_NO_CONTACT_SHADOW', 'Placement appears grounded but no contact shadow is defined.', 'critical');
  }

  if (
    !lower.includes('label') &&
    !lower.includes('label visibility') &&
    !lower.includes('label protection')
  ) {
    addError(errors, 'LABEL_PROTECTION_MISSING', 'Prompt should include label protection language.', 'warning');
  }

  const productStructure = normalize(scene.productStructure);
  const hasFruitLikeEffect = special.some(v => v.includes('fruit') || v.includes('garnish'));
  if (productStructure.includes('device') && hasFruitLikeEffect) {
    addError(errors, 'PRODUCT_TYPE_EFFECT_CONFLICT_DEVICE', 'Device product structure cannot mix with fruit/garnish effects.', 'critical');
  }
  if (productStructure.includes('powder') && special.some(v => v.includes('underwater'))) {
    addError(errors, 'PRODUCT_TYPE_EFFECT_WARNING_POWDER', 'Powder products with underwater effects may be unstable.', 'warning');
  }

  if (countOccurrences(text, 'ATMOSPHERE_RESOLUTION:') > 1) {
    addError(errors, 'DUPLICATE_ATMOSPHERE_BLOCK', 'Only one ATMOSPHERE_RESOLUTION block is allowed.', 'critical');
  }
  if (countOccurrences(text, 'INGREDIENT_RESOLUTION:') > 1) {
    addError(errors, 'DUPLICATE_INGREDIENT_BLOCK', 'Only one INGREDIENT_RESOLUTION block is allowed.', 'critical');
  }
  if (countOccurrences(text, 'PHYSICS_RULES') > 1) {
    addError(errors, 'DUPLICATE_PHYSICS_BLOCK', 'Only one PHYSICS_RULES block is allowed.', 'critical');
  }

  if (text.length > 5000) {
    addError(errors, 'PROMPT_TOO_LONG', 'Prompt length exceeds 5000 characters.', 'warning');
  }

  const valid = errors.every(item => item.severity !== 'critical');
  return { valid, errors };
}
