export type BaseContextOptions = {
  allowStudio?: boolean;
};

export function buildBaseContext(options: BaseContextOptions = {}): string {
  const base = [
    'Ultra-realistic premium advertising photography.',
    'High-end editorial or cinematic look.',
    'Real physical environment with believable materials and realistic scale.',
    'Product fully integrated into the scene with physical weight, grounded contact shadows, and natural reflections.',
    'Atmosphere must feel produced by a professional creative team.',
    'No generic stock look. No flat mockups. No catalog-style isolation.',
    'Professional composition, magazine-level quality.'
  ];

  if (options.allowStudio) {
    base.push('Studio product photography is allowed only for Acrylic Blocks mode, but must still feel dimensional and premium.');
  }

  return base.join(' ');
}
