type OutputQualityProfile = 'luxury-brand' | 'ecommerce-conversion' | 'clinical';

export function buildUltraRealStrictBlock(
  enabled: boolean,
  profile: OutputQualityProfile = 'luxury-brand',
  authority?: { visualIntent?: 'conversion' | 'campaign' | 'clinical' | 'luxury' }
): string {
  if (!enabled) return '';
  const effectiveProfile: OutputQualityProfile =
    authority?.visualIntent === 'clinical'
      ? 'clinical'
      : authority?.visualIntent === 'luxury' || authority?.visualIntent === 'campaign'
        ? 'luxury-brand'
        : profile;

  const profileTail =
    effectiveProfile === 'ecommerce-conversion'
      ? 'Keep this strict realism aligned with conversion clarity and label legibility.'
      : effectiveProfile === 'clinical'
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
