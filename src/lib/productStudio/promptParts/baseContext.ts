export type BaseContextOptions = {
  allowStudio?: boolean;
  studioClosedDomain?: boolean;
};

export function buildBaseContext(options: BaseContextOptions = {}): string {
  if (options.studioClosedDomain) {
    return [
      'Ultra-realistic premium advertising photography.',
      'Controlled advertising studio with purpose-built surfaces and deliberate lighting.',
      'No lifestyle, home, or outdoor context.',
      'Product is physically grounded with realistic contact shadows and natural reflections.',
      'No generic stock look. No flat mockups. No catalog-style isolation.',
      'Professional composition, magazine-level quality.',
    ].join(' ');
  }

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
