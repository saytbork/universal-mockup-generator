export function buildIngredientFlatLayMode(): string {
  return [
    'INTERACTION_MODE: ingredient arrangement.',
    'APPLICATION_ZONE: around product perimeter.',
    'CONTACT_SURFACE: support plane.',
    'PRODUCT_GROUNDING: true.',
    'LOCAL_DEFORMATION: minimal.',
  ].join(' ');
}
