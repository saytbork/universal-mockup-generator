/**
 * PRODUCT MODE PROMPT MAPPER
 * Additive, state-driven mapper with no fixed base prompt text.
 */

import type { ProductStudioStep3Values } from '@/lib/productStudio/state';
import type { PromptOptions } from './types';

export interface PromptLayer {
  id: string;
  category:
    | 'world'
    | 'composition'
    | 'material'
    | 'motion'
    | 'environment'
    | 'lighting'
    | 'interaction'
    | 'modifier';
  content: string;
  priority: number;
}

export type SceneState = ProductStudioStep3Values & {
  visualStyle?: string;
  visualIntent?: string;
  composition?: string;
  productStateMotion?: string;
  specialEffects?: string[] | string;
  lighting?: string;
  viewpoint?: string;
  productAssets?: { id: string }[];
  studioPhotoMode?: string;
  studioLightingRig?: string;
  contentStyle?: string;
  creationIntent?: string;
  creationMode?: string;
  personIncluded?: boolean;
  ingredients?: string[];
  customIngredients?: Array<{ name?: string } | string>;
};

const normalizeSidePlacement = (raw?: string): 'left' | 'center' | 'right' => {
  const lower = String(raw || '').toLowerCase();
  if (lower.includes('left')) return 'left';
  if (lower.includes('right')) return 'right';
  return 'center';
};

const clampHex = (value: string | undefined, fallback: string): string => {
  const normalized = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : fallback;
};

const normalizeAspectRatio = (value?: string): string => {
  const raw = String(value || '').trim();
  if (!raw) return '1:1';

  const normalized = raw.replace(/\s+/g, '');
  const allowed = new Set(['1:1', '4:5', '9:16', '16:9', '3:4']);
  if (allowed.has(normalized)) return normalized;

  const labelMap: Record<string, string> = {
    '1:1 (Square)': '1:1',
    '4:5 (Portrait)': '4:5',
    '9:16 (Story)': '9:16',
    '16:9 (Landscape)': '16:9',
    '3:4 (Portrait)': '3:4',
  };
  return labelMap[raw] || '1:1';
};

const mapCreationMode = (raw: string): PromptOptions['creationMode'] => {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'aesthetic builder' || value === 'aesthetic') return 'aesthetic';
  if (value === 'lifestyle ugc' || value === 'lifestyle') return 'lifestyle';
  if (value === 'background replace' || value === 'bg-replace') return 'bg-replace';
  if (value === 'ecommerce blank space' || value === 'ecom-blank') return 'ecom-blank';
  return 'studio';
};

export function mapProductModeToPromptOptions(sceneState: SceneState): PromptOptions {
  console.log('[MAP PRODUCT MODE INPUT]', sceneState);

  const photoMode = String(sceneState.studioPhotoMode || '').trim();
  const visualIntent = String(sceneState.visualIntent || '').trim();
  const visualStyle = String(sceneState.visualStyle || '').trim();
  const productType = String(sceneState.productType || '').trim();
  const productTypeCustom = String(sceneState.productTypeCustom || '').trim();
  const motion = String(sceneState.productStateMotion || '').trim();
  const environment = String((sceneState.customEnvironment || '').trim() || (sceneState.environment || '').trim()).trim();
  const lighting = String(sceneState.lighting || '').trim();
  const lightingStyle = String(sceneState.lightingStyle || '').trim();
  const lightingRig = String(sceneState.studioLightingRig || '').trim();
  const interaction = String(sceneState.productStudioInteraction || '').trim();
  const viewpoint = String(sceneState.viewpoint || '').trim();
  const composition = String((sceneState as any).composition || sceneState.productFramingGuide || '').trim();

  const explicitIngredients = Array.isArray(sceneState.ingredients)
    ? sceneState.ingredients.map((entry) => String(entry).trim()).filter(Boolean)
    : [];
  const customIngredients = Array.isArray(sceneState.customIngredients)
    ? sceneState.customIngredients
        .map((entry) => {
          if (typeof entry === 'string') return entry.trim();
          return String(entry?.name || '').trim();
        })
        .filter(Boolean)
    : [];
  const selectedProps = (sceneState.productPropsSelected || [])
    .map((entry) => String(entry).trim())
    .filter(Boolean);
  const ingredients = [...explicitIngredients, ...customIngredients, ...selectedProps];

  const specialEffects = Array.isArray(sceneState.specialEffects)
    ? sceneState.specialEffects.map((entry) => String(entry).trim()).filter(Boolean)
    : String(sceneState.specialEffects || '').trim()
      ? [String(sceneState.specialEffects).trim()]
      : [];

  const layers: PromptLayer[] = [];
  const addLayer = (
    id: string,
    category: PromptLayer['category'],
    content: string | undefined,
    priority: number
  ) => {
    const clean = String(content || '').trim();
    if (!clean) return;
    layers.push({ id, category, content: clean, priority });
  };

  addLayer('photo-mode', 'composition', photoMode ? `Photo mode: ${photoMode}` : undefined, 10);
  addLayer('composition', 'composition', composition ? `Composition: ${composition}` : undefined, 15);
  addLayer('world', 'world', visualIntent || visualStyle || undefined, 20);
  addLayer(
    'product-type',
    'material',
    productType ? `Product type: ${productType}${productTypeCustom ? ` (${productTypeCustom})` : ''}` : undefined,
    30
  );
  addLayer('environment', 'environment', environment || undefined, 40);
  addLayer('lighting', 'lighting', lightingRig || lighting || lightingStyle || undefined, 50);
  addLayer('motion', 'motion', motion || undefined, 60);
  addLayer('interaction', 'interaction', interaction || undefined, 70);
  addLayer('ingredients', 'modifier', ingredients.length ? `Ingredients: ${ingredients.join(', ')}` : undefined, 80);
  addLayer('effects', 'modifier', specialEffects.length ? `Special effects: ${specialEffects.join(', ')}` : undefined, 90);

  const cameraComposite = [
    sceneState.productCameraSystem ? `Camera: ${sceneState.productCameraSystem}` : '',
    sceneState.productCameraAngle ? `Angle: ${sceneState.productCameraAngle}` : '',
    sceneState.productCameraDistance ? `Distance: ${sceneState.productCameraDistance}` : '',
    sceneState.productFramingGuide ? `Framing: ${sceneState.productFramingGuide}` : '',
    viewpoint ? `Viewpoint: ${viewpoint}` : '',
  ]
    .filter(Boolean)
    .join('; ');
  addLayer('camera', 'interaction', cameraComposite || undefined, 100);

  const sortedLayers = [...layers].sort((a, b) => (a.priority - b.priority) || a.id.localeCompare(b.id));
  const promptParts = sortedLayers.map((layer) => layer.content).filter(Boolean);
  const prompt = promptParts.join(' ');

  console.log('[LAYER STACK]', sortedLayers);

  const mapped: PromptOptions = {
    sceneType: sceneState.sceneType === 'ecommerce-pdp' ? 'ecommerce-pdp' : 'studio-branding',
    contentStyle: (String(sceneState.contentStyle || '').trim() as PromptOptions['contentStyle']) || '',
    creationIntent: (String(sceneState.creationIntent || '').trim() as PromptOptions['creationIntent']) || undefined,
    creationMode: mapCreationMode(String(sceneState.creationMode || '').trim()),
    aspectRatio: normalizeAspectRatio(sceneState.aspectRatio),
    camera: String(sceneState.productCameraSystem || '').trim(),
    setting: environment,
    lighting: lightingRig || lighting || lightingStyle,
    perspective: viewpoint,
    environmentOrder: '',
    productPlane: '',
    sidePlacement: normalizeSidePlacement(sceneState.sidePlacement),
    ecommerceSidePlacement: normalizeSidePlacement(sceneState.sidePlacement),
    ecommerceSidePlacementFlag: sceneState.ecommerceSidePlacementFlag === true,
    ecommerceBlankSpaceMode: sceneState.ecommerceSidePlacementFlag === true,
    compositionMode: sceneState.ecommerceSidePlacementFlag === true ? 'Ecommerce Blank Space' : undefined,
    ugcStyle: 'optimized',
  };

  if (sceneState.ecommerceBackgroundMode === 'gradient') {
    mapped.bgGradient = {
      startColor: clampHex(sceneState.ecommerceGradientStart, '#f7f7f7'),
      endColor: clampHex(sceneState.ecommerceGradientEnd, '#d9d9d9'),
      angle: parseInt(sceneState.ecommerceGradientAngle || '90', 10) || 90,
    };
  } else if (sceneState.ecommerceBackgroundColor) {
    mapped.bgColor = clampHex(sceneState.ecommerceBackgroundColor, '#ffffff').toUpperCase();
  }

  (mapped as any).studioPromptLayers = sortedLayers;
  (mapped as any).studioPromptParts = promptParts;
  (mapped as any).studioLayerPromptText = prompt;
  (mapped as any).photoMode = photoMode || undefined;
  (mapped as any).studioPhotoMode = photoMode || undefined;
  (mapped as any).studioWorld = visualIntent || visualStyle || undefined;
  (mapped as any).studioMotion = motion || undefined;
  (mapped as any).studioLightingModel = lightingRig || lighting || lightingStyle || undefined;
  (mapped as any).studioCompositionModel = composition || viewpoint || undefined;
  (mapped as any).studioModifiers = [...ingredients, ...specialEffects].join(', ') || undefined;
  (mapped as any).studioInteraction = interaction || undefined;
  (mapped as any).ingredients = ingredients;
  (mapped as any).specialEffects = specialEffects;

  console.log('[MAP PRODUCT MODE OUTPUT]', mapped);
  return mapped;
}

export function validateProductModePrompt(prompt: string): boolean {
  const forbidden = [
    'lifestyle',
    'ugc',
    'user-generated',
    'selfie',
    'phone',
    'creator',
    'person',
    'people',
    'human',
    'identity',
    'ethnicity',
    'age',
    'face',
  ];
  const lower = prompt.toLowerCase();
  const hit = forbidden.find((term) => lower.includes(term));
  if (hit) {
    console.error(`[PRODUCT MODE VALIDATION FAILED] Forbidden term detected: "${hit}"`);
    return false;
  }

  return true;
}
