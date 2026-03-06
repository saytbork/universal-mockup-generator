export function buildGelSmearMode(): string {
  return [
    'INTERACTION_MODE: topical smear interaction.',
    'MATERIAL_MODE: gel smear.',
    'APPLICATION_ZONE: adjacent hero zone.',
    'CONTACT_SURFACE: cosmetic slab.',
    'PRODUCT_GROUNDING: true.',
    'LOCAL_DEFORMATION: smear edge ridges.',
    'GEL_SMEAR_EDITORIAL_SCENE: Premium editorial composition featuring a tactile cosmetic gel smear on a clean stone surface.',
    'GEL_SMEAR_MATERIAL_TRUTH: Smear is a real material application, not a background texture. Must show physical thickness, visible edges, micro-air bubbles, glossy highlights, and subtle translucency.',
    'GEL_SMEAR_SHAPE_DISCIPLINE: Intentional aesthetic smear shape with smooth curved swipe, visible brush/spatula marks, and thicker edge ridges at the smear end.',
    'PRODUCT_PLACEMENT_RULE: Product placed adjacent to smear with controlled interaction only. Allowed placements: leaning near smear, resting beside smear, touching smear edge, or casting shadow over smear.',
    'PRODUCT_PROTECTION_RULE: Smear must not cover product label. No residue on container. No dripping from product.',
    'SURFACE_RULE: Neutral premium stone/concrete/cosmetic slab with subtle texture visibility. No background gradients.',
    'COMPOSITION_RULE: Editorial beauty composition. Smear occupies one zone. Product occupies hero zone. Balanced negative space. No props. No clutter.',
  ].join(' ');
}
