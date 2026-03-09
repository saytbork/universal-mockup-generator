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
    expect(prompt).toContain('DEPTH_STYLE: natural photographic depth. Subtle background tonal separation allowed. Soft atmospheric falloff allowed. Gradual luminance transition across the background. No CGI-style flat gradient fields.');
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

  test('does not inject fallback camera block without resolved camera state', () => {
    const prompt = generateStudioPromptV2(baseState);

    expect(prompt).toContain('Preserve proportions independent of selected lens profile.');
    expect(prompt).not.toContain('STUDIO_CAMERA_SYSTEM:');
    expect(prompt).not.toContain('STUDIO_CAMERA_ANGLE:');
    expect(prompt).not.toContain('STUDIO_CAMERA_DISTANCE:');
    expect(prompt).not.toContain('STUDIO_CAMERA_ROTATION:');
    expect(prompt).not.toContain('STUDIO_FRAMING_GUIDE:');
  });

  test('uses only the manual lens authority when advanced lens override is active', () => {
    const prompt = generateStudioPromptV2({
      ...baseState,
      advancedControls: true,
      cameraSystem: 'DSLR / mirrorless',
      cameraAngle: '45° hero',
      cameraDistance: 'Standard',
      cameraRotation: '0°',
      framingGuide: 'Centered hero',
      lensOverride: '100mm Macro Prime',
    });

    expect(prompt).toContain('LENS_PROFILE: 100mm Macro Prime.');
    expect(prompt).not.toContain('LENS_PROFILE: 50mm equivalent.');
  });

  test('ignores stale accent gel when the selected rig is not gel-compatible', () => {
    const prompt = generateStudioPromptV2({
      ...baseState,
      advancedControls: true,
      cameraSystem: 'DSLR / mirrorless',
      cameraAngle: '45° hero',
      cameraDistance: 'Standard',
      cameraRotation: '0°',
      framingGuide: 'Centered hero',
      lightingModelOverride: '3-Point Beauty Dish',
      customLightColor: '#9966FF',
      accentLightIntensity: 69,
    });

    expect(prompt).toContain('STUDIO_LIGHTING_PROFILE: 3-Point Beauty Dish.');
    expect(prompt).not.toContain('ACCENT_LIGHT_GEL:');
    expect(prompt).not.toContain('ACCENT LIGHT GEL:');
  });
});
