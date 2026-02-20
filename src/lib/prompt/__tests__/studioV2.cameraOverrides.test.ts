import { describe, expect, test } from 'vitest';
import { generateStudioPromptV2 } from '../../productStudioV2/index.ts';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes.ts';

const baseState: StudioUIState = {
  creativeIntent: 'conversion',
  motion: 'static',
  composition: 'hero',
};

describe('Studio V2 camera overrides', () => {
  test('injects single authoritative studio camera block', () => {
    const prompt = generateStudioPromptV2({
      ...baseState,
      cameraSystem: 'Telephoto compression camera system',
      cameraAngle: 'Low angle',
      cameraDistance: 'Tight',
      cameraRotation: '10°',
      framingGuide: 'Rule of thirds',
    });

    expect(prompt).toContain('STUDIO_CAMERA_SYSTEM: Telephoto compression camera system.');
    expect(prompt).toContain('STUDIO_CAMERA_ANGLE: Low angle.');
    expect(prompt).toContain('STUDIO_CAMERA_DISTANCE: Tight.');
    expect(prompt).toContain('STUDIO_CAMERA_ROTATION: 10°.');
    expect(prompt).toContain('STUDIO_FRAMING_GUIDE: Rule of thirds.');
    expect(prompt).not.toContain('CAMERA_SYSTEM_OVERRIDE:');
    expect(prompt).not.toContain('ANGLE_OVERRIDE:');
    expect(prompt).not.toContain('DISTANCE_OVERRIDE:');
    expect(prompt).not.toContain('ROTATION_OVERRIDE:');
    expect(prompt).not.toContain('FRAMING_GUIDE_OVERRIDE:');
  });

  test('does not inject fallback camera block without resolved camera state', () => {
    const prompt = generateStudioPromptV2(baseState);

    expect(prompt).toContain('Render the scene as if using a 50mm prime lens with zero optical distortion.');
    expect(prompt).not.toContain('STUDIO_CAMERA_SYSTEM:');
    expect(prompt).not.toContain('STUDIO_CAMERA_ANGLE:');
    expect(prompt).not.toContain('STUDIO_CAMERA_DISTANCE:');
    expect(prompt).not.toContain('STUDIO_CAMERA_ROTATION:');
    expect(prompt).not.toContain('STUDIO_FRAMING_GUIDE:');
  });
});
