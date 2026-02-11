type OutputQualityProfile = 'luxury-brand' | 'ecommerce-conversion' | 'clinical';

export function buildQualityEnforcers(profile: OutputQualityProfile = 'luxury-brand'): string {
  const profileRules: Record<OutputQualityProfile, string[]> = {
    'luxury-brand': [
      'Luxury campaign polish with refined highlight rolloff and premium tonal depth.',
      'Material richness prioritized while keeping the product dominant.',
      'Luxury finish must remain believable: no waxy surfaces, no plastic-looking reflections, no synthetic gloss bloom.'
    ],
    'ecommerce-conversion': [
      'Conversion-first clarity: label readability and product silhouette are non-negotiable.',
      'Keep background and secondary elements subordinate to purchase-focused legibility.',
      'Hyper-real clarity without artifacting: no smeared edges, no text warping, no fake sharpen halos.'
    ],
    'clinical': [
      'Clinical-grade visual character with precise framing and controlled neutrality.',
      'Maintain evidence-first readability and scientifically clean presentation.',
      'Clinical stylization must remain physically believable with no synthetic rendering cues.'
    ]
  };

  return [
    'QUALITY ENFORCERS:',
    'Ultra-realistic textures with luxury advertising finish and ecommerce readiness.',
    'Hyper-real material rendering with authentic micro-roughness, subtle surface variance, and true contact occlusion.',
    'Crisp micro-contrast, controlled highlights, and premium tonal separation.',
    'Realistic physics and grounded contact points with coherent shadow geometry.',
    'Photographic realism guardrails: natural lens behavior, coherent depth transitions, and non-CGI highlight behavior.',
    'Product remains the hero with tack-sharp, fully readable label and clean silhouette.',
    'No generic stock look. No repetition. No flat lighting. No visual noise.',
    'Never appear as a cutout, pasted object, CGI render, or synthetic composite.',
    'Hard negatives: no wax skin/plastic texture look, no repeated procedural patterns, no impossible reflections, no floating-shadow mismatch.',
    'Frame integrity lock: no letterbox bars, no pillarbox bars, no mirrored edge extension, no duplicated side panels, and no blurred side-fill bands.',
    'Composition must occupy the full requested aspect ratio with native scene content edge-to-edge; never simulate padding, borders, or canvas filler.',
    'No centered narrow-subject framing with artificial side expansion. Native scene detail must continue naturally to every frame edge.'
    ,
    ...profileRules[profile]
  ].join(' ');
}
