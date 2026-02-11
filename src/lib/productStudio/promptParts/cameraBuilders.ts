import type { PhotoModeKey } from './sceneBuilders';
import type { Randomizer } from './randomizationRules';

const LENSES = [
  '35mm',
  '50mm',
  '85mm',
  '100mm macro',
  '70-200mm compression'
] as const;

const ANGLES = [
  'eye-level',
  'three-quarter angle',
  'slight low angle',
  'elevated 45-degree',
  'subtle high angle'
] as const;

const DISTANCES = [
  'medium distance',
  'close framing',
  'tight hero crop',
  'wider contextual view'
] as const;

const COMPOSITIONS = [
  'asymmetrical editorial framing',
  'rule-of-thirds composition',
  'off-center hero placement',
  'dynamic diagonal alignment'
] as const;

const MODE_LENS_OVERRIDES: Partial<Record<PhotoModeKey, readonly string[]>> = {
  BRAND_CAMPAIGN: ['85mm', '70-200mm compression'],
  UGC_PREMIUM_SIM: ['35mm', '50mm'],
};

const MODE_DISTANCE_OVERRIDES: Partial<Record<PhotoModeKey, readonly string[]>> = {
  BRAND_CAMPAIGN: ['tight hero crop', 'close framing'],
  UGC_PREMIUM_SIM: ['medium distance', 'wider contextual view'],
};

const MODE_COMPOSITION_OVERRIDES: Partial<Record<PhotoModeKey, readonly string[]>> = {
  BRAND_CAMPAIGN: ['off-center hero placement', 'asymmetrical editorial framing'],
  UGC_PREMIUM_SIM: ['rule-of-thirds composition', 'off-center hero placement'],
};

export type CameraOverride = {
  text: string;
};

export type CameraBuildOptions = {
  override?: CameraOverride;
  qualityProfile?: 'luxury-brand' | 'ecommerce-conversion' | 'editorial';
  compactMetadata?: boolean;
  forceLens?: string;
  forceCameraSystem?: string;
  forceAngle?: string;
  forceDistance?: string;
  forceComposition?: string;
  forceRotation?: string;
};

export function buildCamera(mode: PhotoModeKey, randomizer: Randomizer, options: CameraBuildOptions = {}): string {
  if (mode === 'INGREDIENT_STACK') {
    const base = [
      'CAMERA:',
      'Straight-on or slight elevation (10–15°).',
      'Vertical or centered composition.',
      'Ingredients arranged with deliberate spacing around the product.',
      'No top-down angle.'
    ];
    if (options.override?.text) {
      base.push(options.override.text);
    }
    return base.join(' ');
  }

  if (mode === 'INGREDIENT_FLAT_LAY') {
    const distance = options.forceDistance?.trim() ? options.forceDistance.trim() : 'standard framing';
    const lens = options.forceLens?.trim() ? options.forceLens.trim() : '50mm';
    const composition = options.forceComposition?.trim() ? options.forceComposition.trim() : 'grid-ready composition';
    const cameraSystem = options.forceCameraSystem?.trim();
    const rotation = options.forceRotation?.trim();
    const base = [
      'CAMERA:',
      ...(options.compactMetadata ? [] : (cameraSystem ? [`Camera system: ${cameraSystem}.`] : [])),
      'Camera angle: top-down flat lay.',
      `Framing distance: ${distance}.`,
      ...(options.compactMetadata ? [] : [`Lens selection: ${lens}.`]),
      ...(options.compactMetadata ? [] : (rotation ? [`Rotation: ${rotation}.`] : [])),
      `${composition}.`,
      'Strict overhead framing; avoid eye-level, low-angle, or hero 45-degree viewpoints.',
      options.qualityProfile === 'ecommerce-conversion'
        ? 'Camera priority: top-down conversion clarity with clean label legibility.'
        : options.qualityProfile === 'editorial'
          ? 'Camera priority: disciplined overhead editorial layout with controlled spacing rhythm.'
          : 'Camera priority: premium overhead campaign composition with precise balance.',
    ];
    if (options.override?.text) {
      base.push(options.override.text);
    }
    return base.join(' ');
  }

  const angle = options.forceAngle?.trim() ? options.forceAngle.trim() : randomizer.pick(ANGLES);
  const distancePool = MODE_DISTANCE_OVERRIDES[mode] ?? DISTANCES;
  const lensPool = MODE_LENS_OVERRIDES[mode] ?? LENSES;
  const compositionPool = MODE_COMPOSITION_OVERRIDES[mode] ?? COMPOSITIONS;

  const distance = options.forceDistance?.trim() ? options.forceDistance.trim() : randomizer.pick(distancePool);
  const lens = options.forceLens?.trim() ? options.forceLens.trim() : randomizer.pick(lensPool);
  const composition = options.forceComposition?.trim() ? options.forceComposition.trim() : randomizer.pick(compositionPool);
  const cameraSystem = options.forceCameraSystem?.trim();
  const rotation = options.forceRotation?.trim();

  const modeNotes: Partial<Record<PhotoModeKey, string>> = {
    FOAM_AND_TEXTURE: 'Avoid top-down or flat-lay framing; keep a frontal or three-quarter view.',
    SPLASH_SHOT: 'Capture the motion with a dynamic angle that preserves label readability.',
    ACRYLIC_BLOCKS: 'Keep perspective clean to emphasize acrylic geometry.',
    BRAND_CAMPAIGN: 'Use assertive hero framing with premium campaign presence and disciplined negative space.',
    UGC_PREMIUM_SIM: 'Keep realism cues subtle: natural perspective with polished commercial intent.',
  };

  const base = [
    'CAMERA:',
    ...(options.compactMetadata ? [] : (cameraSystem ? [`Camera system: ${cameraSystem}.`] : [])),
    `Camera angle: ${angle}.`,
    `Framing distance: ${distance}.`,
    ...(options.compactMetadata ? [] : [`Lens selection: ${lens}.`]),
    ...(options.compactMetadata ? [] : (rotation ? [`Rotation: ${rotation}.`] : [])),
    `${composition}.`,
    modeNotes[mode] ?? 'Avoid symmetrical default framing; prioritize premium commercial composition.'
  ];

  const profileText = options.qualityProfile === 'ecommerce-conversion'
    ? 'Camera priority: conversion clarity with label-forward framing and minimal ambiguity.'
    : options.qualityProfile === 'editorial'
      ? 'Camera priority: editorial composition with deliberate visual rhythm and premium direction.'
      : 'Camera priority: luxury campaign framing with confident hero emphasis.';
  base.push(profileText);

  if (options.override?.text) {
    base.push(options.override.text);
  }

  return base.join(' ');
}
