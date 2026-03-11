import type { StudioUIState } from '../types/studioTypes';
import type { PhotoModeContractBuilder } from './types';
import { buildFoamTextureMode } from './foamTextureMode';
import { buildTexturedBedMode } from './texturedBedMode';
import { buildGelSmearMode } from './gelSmearMode';
import { buildPoolWaterMode } from './poolWaterMode';
import { buildSplashMode } from './splashMode';
import { buildMacroLabelMode } from './macroLabelMode';
import { buildIngredientFlatLayMode } from './ingredientFlatLayMode';

const PHOTO_MODE_BUILDERS: Record<string, PhotoModeContractBuilder> = {
  'Foam & Texture': buildFoamTextureMode,
  'Textured Bed / Scatter Base': (state?: StudioUIState) =>
    buildTexturedBedMode(state, Object.fromEntries(Object.entries(state?.photoModeDynamicSettings || {}).filter(([, v]) => String(v).trim()))),
  'Gel Smear Editorial': buildGelSmearMode,
  'Pool Water': buildPoolWaterMode,
  'Splash Shot': buildSplashMode,
  'Wine Macro Label': buildMacroLabelMode,
  'Ingredient Flat Lay': buildIngredientFlatLayMode,
  'Ingredient Stack': buildIngredientFlatLayMode,
};

export function resolvePhotoModeBuilder(photoMode: string): PhotoModeContractBuilder | null {
  const key = String(photoMode || '').trim();
  return PHOTO_MODE_BUILDERS[key] || null;
}
