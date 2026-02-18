import type { ProductStudioState, ProductPlacement, CameraAngle } from './types';

export type PhysicsResolution = {
  corrected: boolean;
  correctedPlacement?: ProductPlacement;
  correctedCameraAngle?: CameraAngle;
  reason: string | null;
  promptFragment: string;
};

const normalize = (v: unknown) => String(v || '').toLowerCase().trim();

const isUnderwater = (photoMode: string) =>
  normalize(photoMode).includes('underwater');

const isSplash = (photoMode: string) =>
  normalize(photoMode).includes('splash');

const isHighAngle = (angle?: CameraAngle) =>
  angle === 'top_down' || angle === 'high_angle';

export function resolvePhysicsCoherence(
  state: ProductStudioState
): PhysicsResolution {
  const { placement, angle, sceneType, photoMode } = state;

  // UNDERWATER cannot use top/overhead camera
  if (isUnderwater(photoMode) && isHighAngle(angle)) {
    return {
      corrected: true,
      correctedCameraAngle: 'eye_level',
      reason: 'Underwater scenes cannot use aerial or top-down camera geometry.',
      promptFragment:
        'Camera angle adjusted from overhead to eye-level to maintain underwater optical plausibility and depth refraction consistency.',
    };
  }

  // AIR + top angle = volumetric collapse
  if (placement === 'air' && isHighAngle(angle)) {
    return {
      corrected: true,
      correctedCameraAngle: '45_hero',
      reason: 'Air placement requires volumetric hero readability.',
      promptFragment:
        'Camera angle adjusted to 45-degree hero to preserve volumetric suspension and gravitational coherence.',
    };
  }

  // FLOATING not allowed in studio
  if (placement === 'floating' && sceneType === 'studio-branding') {
    return {
      corrected: true,
      correctedPlacement: 'surface',
      reason: 'Floating water-physics placement is incoherent in studio context.',
      promptFragment:
        'Floating water-physics placement converted to grounded studio surface to preserve physical realism.',
    };
  }

  return {
    corrected: false,
    reason: null,
    promptFragment: '',
  };
}
