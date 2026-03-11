import type { StudioUIState } from '../types/studioTypes';

export function buildTexturedBedMode(state?: StudioUIState, settings?: Record<string, string>): string {
  const ingredients = String(state?.ingredientObjects || '').trim();
  const depthRaw = String(settings?.depthLevel || '').trim().toLowerCase();

  const depthDirective =
    depthRaw === 'subtle'
      ? 'DEPTH_LEVEL_CONTROL: Subtle -> light immersion, shallow embedding, minimal wrap around base, with product fully visible and label unobstructed.'
      : depthRaw === 'immersive'
        ? 'DEPTH_LEVEL_CONTROL: Immersive -> deep immersion into the user ingredient with dense wrap around the lower product silhouette. Product must still remain clearly visible and readable; ingredient wrap is concentrated at the base/lower perimeter only.'
        : 'DEPTH_LEVEL_CONTROL: Balanced -> moderate immersion with visible ingredient wrap around base while preserving full product readability.';

  const ingredientAuthority = ingredients || '<MISSING_USER_DEFINED_INGREDIENTS>';

  const parts = [
    'INTERACTION_MODE: ingredient bed immersion.',
    'CONTACT_SURFACE: ingredient-defined.',
    'PRODUCT_GROUNDING: true.',
    'LOCAL_DEFORMATION: particle compression.',
    'REFERENCE_PRODUCT_LOCK: The uploaded product image is the single source of truth. Reproduce the exact same object with zero redesign. Preserve exact geometry, silhouette, cap shape, cap color, neck height, proportions, material finish, surface texture, label layout, typography, alignment, and color relationships. Do not reinterpret, regenerate, restyle, substitute category defaults, or redesign packaging.',
    'STUDIO_VISUAL_INTENT: Conversion-grade commercial clarity with strict label readability.',
    'TEXTURED_BED_REQUIREMENT: User-defined ingredients are mandatory. No default materials, no substitutions, no generic textures, and no category-based assumptions.',
    `TEXTURED_BED_INGREDIENT_AUTHORITY: The ingredient bed must be built exclusively from: ${ingredientAuthority}.`,
    'TEXTURED_BED_PROHIBITED_DEFAULTS: No coffee beans. No seeds. No sand. No stones. No crystals. No powders. No fillers. No decorative substitutes.',
    'TEXTURED_BED_CAMERA_LOCK: True top-down flat lay only (90 degrees overhead). Camera optical axis must be perpendicular to the surface. No perspective tilt. No hero angle. No eye-level viewpoint. Override any global camera angle settings.',
    'TEXTURED_BED_IMMERSION_RULE: Product must be visibly immersed into the ingredient bed. Base must sink into ingredients with natural perimeter wrap, visible compression, contact shadow, and ambient occlusion. No floating. No hovering. No artificial on-top placement.',
    depthDirective,
    'LABEL_CLEARANCE_RULE: Label zone must remain fully readable at all times. No ingredient obstruction over the primary label area.',
    'PRODUCT_CLEANLINESS: Container, cap, pump, and label must remain clean and dry. No residue, drips, foam, liquid streaks, or decorative attachments.',
    'VISUAL_DISCIPLINE: No clutter. No unrelated props. No visual noise. Keep composition clean and controlled.',
    'MATERIAL_BEHAVIOR: Ingredients must look real, tactile, and physically plausible. No synthetic CGI-like surfaces.',
    'COMPOSITION: Centered flat lay composition. Product fully visible, no cropping, and scene extends naturally to all frame edges.',
  ];

  if (!ingredients) {
    parts.push('TEXTURED_BED_VALIDATION: Missing user-defined ingredients. Do not generate this mode until ingredients are provided.');
  }

  return parts.join(' ');
}
