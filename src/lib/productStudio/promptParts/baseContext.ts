export type BaseContextOptions = {
  allowStudio?: boolean;
  qualityProfile?: 'luxury-brand' | 'ecommerce-conversion' | 'editorial';
};

export function buildBaseContext(options: BaseContextOptions = {}): string {
  const base = [
    'Ultra-realistic high-end commercial product photography.',
    'Luxury advertising direction with ecommerce conversion clarity.',
    'Real physical environment with believable materials, realistic scale, and physically coherent depth.',
    'Product fully integrated into the set with grounded contact shadows, natural reflections, and true material behavior.',
    'Atmosphere must feel art-directed by a senior creative team for a paid campaign.',
    'No generic stock look. No low-effort mockup feel. No amateur capture cues.',
    'Output quality target: premium brand campaign + ecommerce hero asset.'
  ];

  if (options.allowStudio) {
    base.push('Studio product photography is allowed only for Acrylic Blocks mode, but must still feel dimensional and premium.');
  }

  if (options.qualityProfile === 'ecommerce-conversion') {
    base.push('Conversion-first ecommerce intent: maximize product clarity, label readability, and clean visual hierarchy for ad performance.');
  } else if (options.qualityProfile === 'editorial') {
    base.push('Editorial intent: expressive composition and premium visual storytelling while preserving product legibility.');
  } else {
    base.push('Luxury brand intent: polished campaign-grade finish with premium materials and elevated art direction.');
  }

  return base.join(' ');
}
