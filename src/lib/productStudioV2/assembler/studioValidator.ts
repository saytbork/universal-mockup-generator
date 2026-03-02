import type { StudioAuthorityBundle } from '../types/studioTypes.ts';
import { studioMotionIsDynamic } from '../authority/studioAuthorityResolver.ts';

const blockCount = (blocks: string[], prefix: string): number =>
  blocks.filter((block) => block.startsWith(prefix)).length;

export function validateStudioPrompt(prompt: string, authority: StudioAuthorityBundle): void {
  const blocks = prompt.split('\n\n').map((item) => item.trim()).filter(Boolean);
  const expectedPrefixes = [
    'STUDIO_VISUAL_INTENT:',
    'STUDIO_WORLD:',
    'STUDIO_COMPOSITION_PROFILE:',
    'STUDIO_PRODUCT_MOTION:',
    'STUDIO_PHYSICS_MODEL:',
    'STUDIO_MODIFIERS:',
    'STUDIO_LIGHTING_PROFILE:',
    'STUDIO_MATERIAL_PROFILE:',
    'STUDIO_ULTRA_REAL_GUARDRAIL:',
  ];

  for (const prefix of expectedPrefixes) {
    if (blockCount(blocks, prefix) > 1) {
      throw new Error(`Invalid prompt: duplicate block detected for ${prefix}`);
    }
  }

  const visualIntentCount = blockCount(blocks, 'STUDIO_VISUAL_INTENT:');
  if (visualIntentCount > 1) {
    throw new Error('Invalid prompt: duplicate STUDIO_VISUAL_INTENT blocks.');
  }

  const lightingCount = blockCount(blocks, 'STUDIO_LIGHTING_PROFILE:');
  if (lightingCount > 1) {
    throw new Error('Invalid prompt: duplicate STUDIO_LIGHTING_PROFILE blocks.');
  }

  const motionBlocks = blocks.filter((block) => block.startsWith('STUDIO_PRODUCT_MOTION:'));
  const hasStaticMotion = motionBlocks.some((block) => block.includes('static'));
  const hasDynamicMotion = motionBlocks.some(
    (block) => block.includes('dispensed') || block.includes('pouring') || block.includes('falling')
  );
  if (hasStaticMotion && hasDynamicMotion) {
    throw new Error('Invalid prompt: static and dynamic motion are mixed simultaneously.');
  }

  const hasPhysics = blockCount(blocks, 'STUDIO_PHYSICS_MODEL:') > 0;
  const hasSplashModifier = /STUDIO_MODIFIER_SPLASH:/i.test(prompt);
  const hasTexturedBedModifier = /STUDIO_MODIFIER_TEXTUREDBED:/i.test(prompt);
  const hasClinicalIntent = /STUDIO_VISUAL_INTENT:\s*clinical\./i.test(prompt);
  const hasStaticMotionOnly = /STUDIO_PRODUCT_MOTION:\s*static\./i.test(prompt) && !hasDynamicMotion;

  if (hasStaticMotionOnly && hasPhysics) {
    throw new Error('Invalid prompt: STUDIO_PHYSICS_MODEL cannot exist when motion is static.');
  }

  if (hasSplashModifier && !hasPhysics) {
    throw new Error('Invalid prompt: STUDIO_MODIFIER_SPLASH cannot exist without STUDIO_PHYSICS_MODEL.');
  }

  if (hasClinicalIntent && hasPhysics) {
    throw new Error('Invalid prompt: clinical intent cannot coexist with STUDIO_PHYSICS_MODEL.');
  }

  if (authority.world === 'underwater' && hasTexturedBedModifier) {
    throw new Error('Invalid prompt: underwater world cannot include STUDIO_MODIFIER_TEXTUREDBED.');
  }

  if (authority.permissions.allowSplash && studioMotionIsDynamic(authority.motion) && !hasPhysics) {
    throw new Error('Invalid prompt: splash motion without STUDIO_PHYSICS_MODEL.');
  }

  if ((!authority.permissions.allowSplash || !studioMotionIsDynamic(authority.motion)) && hasPhysics) {
    throw new Error('Invalid prompt: STUDIO_PHYSICS_MODEL present without splash context.');
  }
}
