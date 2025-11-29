import {
  CAMERA_PRESETS,
  ENVIRONMENT_ORDER_PRESETS,
  LIGHTING_PRESETS,
  PHOTO_MODE_PRESETS,
  PRODUCT_MATERIAL_PRESETS,
  PRODUCT_PLANE_PRESETS,
  SCENE_PRESETS,
} from './presets.js';

const mapPreset = (value, mapping) => {
  if (!value) return null;
  return (mapping && mapping[value]) || value;
};

export function buildPrompt(options = {}) {
  const {
    scene,
    environmentOrder,
    productMaterial,
    productPlane,
    photoMode,
    lighting,
    cameraType,
    backgroundColor,
    accentProps,
    ingredientProps,
    customCue,
    includeHand,
  } = options;

  const parts = [];

  const lightingText = mapPreset(lighting, LIGHTING_PRESETS);
  const cameraText = mapPreset(cameraType, CAMERA_PRESETS);
  if (lightingText && cameraText) {
    parts.push(`A highly realistic photo in ${lightingText}, taken with a ${cameraText}.`);
  }

  const sceneText = mapPreset(scene, SCENE_PRESETS);
  const envText = mapPreset(environmentOrder, ENVIRONMENT_ORDER_PRESETS);
  if (sceneText && envText) {
    parts.push(`The scene is set in a ${sceneText} with a ${envText} style.`);
  }

  const planeText = mapPreset(productPlane, PRODUCT_PLANE_PRESETS);
  const materialText = mapPreset(productMaterial, PRODUCT_MATERIAL_PRESETS);
  if (planeText && materialText) {
    parts.push(`The product appears as ${planeText} and is made of ${materialText}.`);
  }

  const photoModeText = mapPreset(photoMode, PHOTO_MODE_PRESETS);
  if (photoModeText) {
    parts.push(`Shot in a ${photoModeText} style. Clean, detailed, natural shadows, aesthetic composition.`);
  }

  if (backgroundColor && backgroundColor.trim()) {
    parts.push(`Background color: ${backgroundColor}.`);
  }
  if (accentProps && accentProps.trim()) {
    parts.push(`Accent props: ${accentProps}.`);
  }
  if (ingredientProps && ingredientProps.trim()) {
    parts.push(`Ingredient props: ${ingredientProps}.`);
  }
  if (customCue && customCue.trim()) {
    parts.push(`Custom cue: ${customCue}.`);
  }
  if (includeHand) {
    parts.push('Include a cropped hand interacting naturally with the product.');
  }

  parts.push('No logos, no visible brand text, no trademarks, high fidelity, focus on realism and composition.');

  return parts.join(' ');
}
