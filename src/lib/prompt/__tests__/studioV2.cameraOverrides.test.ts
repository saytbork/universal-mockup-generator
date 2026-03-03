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
    expect(prompt).toContain('LENS_PROFILE: 85mm equivalent.');
    expect(prompt).toContain('DISTORTION: minimal distortion with telephoto compression.');
    expect(prompt).toContain('DEPTH_STYLE: compressed depth with cinematic optical falloff.');
    expect(prompt).toContain('STUDIO_CAMERA_ROTATION: 10°.');
    expect(prompt).toContain('ROTATION: 10°.');
    expect(prompt).toContain('STUDIO_FRAMING_GUIDE: Rule of thirds.');
    expect(prompt).toContain('FRAMING: Rule of thirds.');
    expect(prompt).not.toContain('CAMERA_SYSTEM_OVERRIDE:');
    expect(prompt).not.toContain('ANGLE_OVERRIDE:');
    expect(prompt).not.toContain('DISTANCE_OVERRIDE:');
    expect(prompt).not.toContain('ROTATION_OVERRIDE:');
    expect(prompt).not.toContain('FRAMING_GUIDE_OVERRIDE:');
  });

  test('injects default camera block when resolved camera state is absent', () => {
    const prompt = generateStudioPromptV2(baseState);

    expect(prompt).toContain('Preserve proportions independent of selected lens profile.');
    expect(prompt).toContain('STUDIO_CAMERA_SYSTEM: DSLR / mirrorless.');
    expect(prompt).toContain('STUDIO_CAMERA_ANGLE: 45° hero.');
    expect(prompt).toContain('STUDIO_CAMERA_DISTANCE: Standard.');
    expect(prompt).toContain('STUDIO_CAMERA_ROTATION: 0°.');
    expect(prompt).toContain('STUDIO_FRAMING_GUIDE: Centered hero.');
    expect((prompt.match(/STUDIO_CAMERA_SYSTEM:/g) || []).length).toBe(1);
  });
});
