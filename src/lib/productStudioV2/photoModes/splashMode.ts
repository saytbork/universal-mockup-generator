// Freeze guard: splash mode owns interaction contract tokens; physics model fallback is external.
export function buildSplashMode(): string {
  return [
    'INTERACTION_MODE: liquid impact.',
    'IMPACT_ORIGIN: grounded base-adjacent surface collision.',
    'GRAVITY_VECTOR: downward only.',
    'FORBID_ENCLOSURE_SHAPES: true.',
    'FORBID_HOLLOW_WATER_RINGS: true.',
    'FORBID_FLOATING_DROPLETS: true.',
    'FLOW_DIRECTION: outward arc.',
    'PRODUCT_GROUNDING: optional.',
    'LOCAL_DEFORMATION: fluid-only.',
    'IMPACT_TYPE: liquid_splash.',
    'FLUID_REALISM_CONSTRAINT: physically accurate splash sheets, droplets, and crown formation with gravity-consistent motion freeze.',
  ].join(' ');
}
