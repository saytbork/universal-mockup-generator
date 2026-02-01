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

export type CameraOverride = {
  text: string;
};

export type CameraBuildOptions = {
  override?: CameraOverride;
};

export function buildCamera(mode: PhotoModeKey, randomizer: Randomizer, options: CameraBuildOptions = {}): string {
  if (mode === 'INGREDIENT_STACK') {
    const base = [
      'CAMERA:',
      'Straight-on or slight elevation (10–15°).',
      'Vertical or centered composition.',
      'Ingredients stacked with deliberate spacing.',
      'No top-down angle.'
    ];
    if (options.override?.text) {
      base.push(options.override.text);
    }
    return base.join(' ');
  }

  const angle = randomizer.pick(ANGLES);
  const distance = randomizer.pick(DISTANCES);
  const lens = randomizer.pick(LENSES);
  const composition = randomizer.pick(COMPOSITIONS);

  const modeNotes: Partial<Record<PhotoModeKey, string>> = {
    FOAM_AND_TEXTURE: 'Avoid top-down or flat-lay framing; keep a frontal or three-quarter view.',
    SPLASH_SHOT: 'Capture the motion with a dynamic angle that preserves label readability.',
    ACRYLIC_BLOCKS: 'Keep perspective clean to emphasize acrylic geometry.',
  };

  const base = [
    'CAMERA:',
    `Randomized camera angle: ${angle}.`,
    `Randomized distance: ${distance}.`,
    `Lens choice: ${lens}.`,
    `${composition}.`,
    modeNotes[mode] ?? 'Avoid symmetrical default framing.'
  ];

  if (options.override?.text) {
    base.push(options.override.text);
  }

  return base.join(' ');
}
