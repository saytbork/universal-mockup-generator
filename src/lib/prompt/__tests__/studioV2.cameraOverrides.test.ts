import { describe, expect, test } from 'vitest';
import { generateStudioPromptV2 } from '../../productStudioV2/index.ts';
import type { StudioUIState } from '../../productStudioV2/types/studioTypes.ts';

const baseState: StudioUIState = {
  creativeIntent: 'conversion',
  motion: 'static',
  composition: 'hero',
};

describe('Studio V2 camera overrides', () => {
  test('injects all camera/framing override blocks when advanced controls are on', () => {
    const prompt = generateStudioPromptV2({
      ...baseState,
      advancedControls: true,
      cameraSystemOverride: 'Telephoto compression camera system',
      angleOverride: 'Low angle',
      distanceOverride: 'Tight',
      rotationOverride: '10°',
      framingGuideOverride: 'Rule of thirds',
    });

    expect(prompt).toContain('CAMERA_SYSTEM_OVERRIDE: Telephoto compression camera system.');
    expect(prompt).toContain('ANGLE_OVERRIDE: Low angle.');
    expect(prompt).toContain('DISTANCE_OVERRIDE: Tight.');
    expect(prompt).toContain('ROTATION_OVERRIDE: 10°.');
    expect(prompt).toContain('FRAMING_GUIDE_OVERRIDE: Rule of thirds.');
    expect(prompt).not.toContain('Render the scene as if using a 50mm prime lens with zero optical distortion.');
    expect(prompt).toContain('Lens behavior must be defined by CAMERA_SYSTEM_OVERRIDE when provided.');
  });

  test('keeps default geometry behavior when advanced controls are off', () => {
    const prompt = generateStudioPromptV2(baseState);

    expect(prompt).toContain('Render the scene as if using a 50mm prime lens with zero optical distortion.');
    expect(prompt).not.toContain('CAMERA_SYSTEM_OVERRIDE:');
    expect(prompt).not.toContain('ANGLE_OVERRIDE:');
    expect(prompt).not.toContain('DISTANCE_OVERRIDE:');
    expect(prompt).not.toContain('ROTATION_OVERRIDE:');
    expect(prompt).not.toContain('FRAMING_GUIDE_OVERRIDE:');
  });
});
