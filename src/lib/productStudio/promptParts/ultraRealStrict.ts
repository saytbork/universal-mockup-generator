type OutputQualityProfile = 'luxury-brand' | 'ecommerce-conversion' | 'clinical';

export function buildUltraRealStrictBlock(
  enabled: boolean,
  profile: OutputQualityProfile = 'luxury-brand'
): string {
  if (!enabled) return '';

  const profileTail =
    profile === 'ecommerce-conversion'
      ? 'Keep this strict realism aligned with conversion clarity and label legibility.'
      : profile === 'clinical'
        ? 'Keep this strict realism while enforcing controlled clinical precision.'
        : 'Keep this strict realism aligned with luxury campaign polish. Luxury realism guardrail: expressive styling is allowed, but all optical behavior must remain physically coherent and premium-grade.';

  return [
    'ULTRA-REAL STRICT MODE: ON.',
    'Enforce physically plausible optics and material response in every region of the frame.',
    'No artificial smoothing, no plastic-like texture response, no synthetic CGI-like gradients, and no repeated procedural patterns.',
    'Contact shadows, reflection direction, and micro-occlusion must remain coherent with scene geometry.',
    'All surfaces must read as photographed physical matter with natural micro-variation and believable imperfections.',
    profileTail,
  ].join(' ');
}
