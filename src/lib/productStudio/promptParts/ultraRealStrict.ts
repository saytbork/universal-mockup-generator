type OutputQualityProfile = 'luxury-brand' | 'ecommerce-conversion' | 'editorial';

export function buildUltraRealStrictBlock(
  enabled: boolean,
  profile: OutputQualityProfile = 'luxury-brand'
): string {
  if (!enabled) return '';

  const profileTail =
    profile === 'ecommerce-conversion'
      ? 'Keep this strict realism aligned with conversion clarity and label legibility.'
      : profile === 'editorial'
        ? 'Keep this strict realism while allowing controlled editorial styling.'
        : 'Keep this strict realism aligned with luxury campaign polish.';

  return [
    'ULTRA-REAL STRICT MODE: ON.',
    'Enforce physically plausible optics and material response in every region of the frame.',
    'No artificial smoothing, no plastic-like texture response, no synthetic CGI-like gradients, and no repeated procedural patterns.',
    'Contact shadows, reflection direction, and micro-occlusion must remain coherent with scene geometry.',
    'All surfaces must read as photographed physical matter with natural micro-variation and believable imperfections.',
    profileTail,
  ].join(' ');
}

