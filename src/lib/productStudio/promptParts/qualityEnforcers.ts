type OutputQualityProfile = 'luxury-brand' | 'ecommerce-conversion' | 'editorial';

export function buildQualityEnforcers(profile: OutputQualityProfile = 'luxury-brand'): string {
  const profileRules: Record<OutputQualityProfile, string[]> = {
    'luxury-brand': [
      'Luxury campaign polish with refined highlight rolloff and premium tonal depth.',
      'Material richness prioritized while keeping the product dominant.'
    ],
    'ecommerce-conversion': [
      'Conversion-first clarity: label readability and product silhouette are non-negotiable.',
      'Keep background and secondary elements subordinate to purchase-focused legibility.'
    ],
    'editorial': [
      'Editorial-grade visual character with deliberate framing and controlled drama.',
      'Allow expressive styling while preserving brand-safe realism and product truth.'
    ]
  };

  return [
    'QUALITY ENFORCERS:',
    'Ultra-realistic textures with luxury advertising finish and ecommerce readiness.',
    'Crisp micro-contrast, controlled highlights, and premium tonal separation.',
    'Realistic physics and grounded contact points with coherent shadow geometry.',
    'Product remains the hero with tack-sharp, fully readable label and clean silhouette.',
    'No generic stock look. No repetition. No flat lighting. No visual noise.',
    'Never appear as a cutout, pasted object, CGI render, or synthetic composite.'
    ,
    ...profileRules[profile]
  ].join(' ');
}
