import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';

function buildCoffeeMotionRules(variant: StudioUIState['coffeeVariant']): string {
  if (variant === 'coffee-premium-minimal') {
    return 'COFFEE_MOTION_RULES: conversion mode allows static or dispensed only. No chaotic splash energy.';
  }
  if (variant === 'coffee-color-pop-luxury') {
    return 'COFFEE_MOTION_RULES: campaign mode allows static or controlled-stream pouring only. No gravity violation and no floating particles.';
  }
  return 'COFFEE_MOTION_RULES: editorial ritual allows static, dispensed, pouring, and subtle steam drift upward only. Steam must stay gravity compliant.';
}

function buildCoffeeLightingProfile(variant: StudioUIState['coffeeVariant']): string {
  if (variant === 'coffee-premium-minimal') {
    return 'COFFEE_LIGHTING_PROFILE: neutral soft daylight, controlled shadow edge, and refined highlight discipline.';
  }
  if (variant === 'coffee-color-pop-luxury') {
    return 'COFFEE_LIGHTING_PROFILE: higher contrast, refined specular control, and studio-grade color separation.';
  }
  return 'COFFEE_LIGHTING_PROFILE: warm ambient key, soft deep shadows, and low harsh specular response.';
}

export function buildCoffeeIndustryLayer(
  authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  if (state?.visualProfile !== 'coffee' || !state.coffeeIndustryLayer) return '';

  const variant = state.coffeeVariant || 'coffee-editorial-ritual';
  const coverage = String(state.coffeeCompositionCoverage || '').trim();

  return [
    `COFFEE_INDUSTRY_LAYER: ${variant}.`,
    'COFFEE_LIQUID_PHYSICS: dark brown absorption core, light diffusion near the surface, subtle meniscus at the rim, optional micro crema texture, no wine-style translucency, and no glass refraction priority.',
    'COFFEE_MATERIAL_MODEL: ceramic-priority surfaces with matte porcelain reflection response, soft highlight rolloff, and no high-gloss wine glass rendering.',
    'COFFEE_ATMOSPHERIC_LAYER: subtle ambient haze allowed, steam drift upward only, gravity compliant motion, and no chaotic splash energy.',
    `COFFEE_COMPOSITION_PROFILE: ${state.compositionProfile || 'ritual-balance'}.`,
    coverage ? `COFFEE_COMPOSITION_COVERAGE: ${coverage}.` : '',
    buildCoffeeLightingProfile(variant),
    buildCoffeeMotionRules(variant),
    authority.world === 'splash-tank'
      ? 'COFFEE_WORLD_GUARD: do not apply wine splash physics or wine bottle behavior.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}
