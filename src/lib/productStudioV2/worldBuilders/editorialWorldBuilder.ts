import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';
import { buildStudioBackground } from '../builders/buildStudioBackground';

const PHOTO_MODE_SCENE_STYLE_MAP: Record<string, string> = {
  'Ingredient Stack': 'SCENE_STYLE: clean studio surface with curated ingredient elements arranged naturally around the product, editorial commercial framing',
  'Ingredient Flat Lay': 'SCENE_STYLE: top-down flat lay on clean studio surface with ingredients arranged in controlled layout around the product',
  'Acrylic Blocks': 'SCENE_STYLE: clean studio with geometric acrylic block props as compositional accents, premium minimal editorial look',
  'Glass Pedestal Studio': 'SCENE_STYLE: clean studio with transparent glass pedestal elevating the product, premium material contrast and reflections',
  'Splash Shot': 'SCENE_STYLE: grounded open-air splash collision scene, product center-frame with directional impact energy, visible base-adjacent origin, clean readability, no enclosure context',
  'Beach Foam Splash': 'SCENE_STYLE: sunlit tropical shoreline with white foam wash at product base, wet compact sand, turquoise water background, clean product grounding',
  'Pool Water': 'SCENE_STYLE: sunlit pool edge scene with clear blue pool water beside the product, premium outdoor hydration atmosphere',
  'Cheers (Hands Clink)': 'SCENE_STYLE: social beverage scene with hands clinking products, warm lifestyle ambient lighting, natural celebratory energy',
  'Ice Cubes': 'SCENE_STYLE: clean studio surface with scattered ice cubes around the product, cold premium refreshment look with controlled condensation',
  'Condensation Droplets': 'SCENE_STYLE: clean studio scene with realistic condensation droplets on the product surface, cold-premium hydration look',
  'Fruit Garnish / Citrus Accents': 'SCENE_STYLE: clean studio surface with fresh citrus and fruit accent elements arranged around the product, vibrant premium editorial',
  'Floating Particles': 'SCENE_STYLE: clean dark studio background with fine floating particles creating depth and premium atmospheric energy around the product',
  'Caustic Light Ripples': 'SCENE_STYLE: clean premium studio with refracted caustic light ripples across the set, controlled reflective movement on surface and background, crisp product readability',
  'Prism Rainbow Refractions': 'SCENE_STYLE: premium studio scene with subtle prism rainbow refractions, spectral edge highlights, and controlled editorial light breakup around the product',
  'Glass Refraction Panels': 'SCENE_STYLE: premium studio composition with transparent glass refraction panels creating elegant optical distortion, layered reflections, and luxury depth cues',
  'Micro Mist Halo': 'SCENE_STYLE: clean studio scene with a fine mist halo localized around the product, fresh premium atmosphere, disciplined diffusion, and clear packaging visibility',
  'Shadow Pattern Projection': 'SCENE_STYLE: modern studio composition with projected graphic shadow patterns across the set, bold editorial contrast, and product-first readability',
  'Foam & Texture': 'SCENE_STYLE: premium cosmetic material-state scene with grounded product contact and physically plausible foam/cream/gel/powder behavior',
  'Routine Carousel': 'SCENE_STYLE: clean studio carousel composition with multiple connected panels, routine-sequence storytelling, product-first multi-frame layout, editorial spacing, consistent panel alignment',
  'Luxury Editorial Tabletop': 'SCENE_STYLE: luxury editorial advertising studio surface composition, premium rigid surface materials with minimal glass acrylic or stone accents, product remains the focal point',
  'Candy Gradient Lab': 'SCENE_STYLE: studio gradient background with candy-like color transitions, smooth blends and controlled saturation, clean abstraction with physical grounding',
  'Golden Mist Aura': 'SCENE_STYLE: atmospheric advertising studio lighting, subtle haze for depth separation, soft highlights, label clarity remains mandatory',
  'UGC Premium Simulation': 'SCENE_STYLE: premium studio simulation with subtle realism, controlled advertising studio, clean purpose-built studio surfaces, brand-safe polish, controlled imperfections with studio-grade clarity',
  'Gel Smear Editorial': 'SCENE_STYLE: premium editorial gel-smear composition on neutral stone/concrete cosmetic slab, real tactile smear material with visible thickness and controlled gloss, product adjacent in hero zone, balanced negative space, no props, no clutter, no background gradients',
  'Citrus Fresh Flat Lay': 'SCENE_STYLE: fresh ingredient-led flat lay composition with clean circular rhythm around the product, bright premium commercial styling, top-down discipline',
  'Stones & Crystals Flat Lay': 'SCENE_STYLE: neutral tactile flat lay with curated stones and crystal accents, balanced spacing and premium wellness editorial tone',
  'Dried Citrus Earth': 'SCENE_STYLE: earthy warm flat lay on textured natural surface with curated dried botanical accents, premium grounded composition and clear product hierarchy',
  'Golden Hour Lifestyle': 'SCENE_STYLE: warm advertising lighting inspired by golden-hour tones, soft directional glow and natural color warmth, controlled editorial set with aspirational mood',
  'Pastel Picnic': 'SCENE_STYLE: pastel-toned advertising composition, soft color palette with playful balance, clean brand-safe environment',
  'Hands Application Clean': 'SCENE_STYLE: clean premium skincare application moment with realistic hands, clear product handling, product and label remain readable and central',
  'Underwater Split': 'SCENE_STYLE: sunlit split-waterline composition: product intersects the water surface with upper section in bright clean air and lower section submerged in clear luminous aqua water, realistic curved meniscus at waterline, visible underwater caustics and light rays, crisp micro-bubbles around submerged edges, premium hydration look with strong product readability',
};

function resolveMacroDewDropletMode(state?: StudioUIState): 'clean' | 'wet' | 'drops' {
  const configMode = String((state as any)?.photoModeConfig?.macroDewLabel?.dropletMode || '').trim().toLowerCase();
  if (configMode === 'clean' || configMode === 'wet' || configMode === 'drops') return configMode;

  const settingsMode = String(state?.photoModeDynamicSettings?.dropletMode || '').trim().toLowerCase();
  if (settingsMode === 'clean' || settingsMode === 'wet' || settingsMode === 'drops') return settingsMode;

  const rootMode = String((state as any)?.dropletMode || '').trim().toLowerCase();
  if (rootMode === 'clean' || rootMode === 'wet' || rootMode === 'drops') return rootMode;

  return 'clean';
}

function buildMacroDewSceneStyle(state?: StudioUIState): string {
  const dropletMode = resolveMacroDewDropletMode(state);
  if (dropletMode === 'wet') {
    return 'SCENE_STYLE: true macro close-up of primary label area and adjacent product surface, subtle moisture presence, label texture and print fidelity prioritized, controlled commercial highlight behavior, no medium-shot fallback';
  }
  if (dropletMode === 'drops') {
    return 'SCENE_STYLE: true macro close-up of primary label area and adjacent product surface, visible droplets attached with realistic surface tension, label texture and print fidelity prioritized, controlled commercial highlight behavior, no medium-shot fallback';
  }
  return 'SCENE_STYLE: true macro close-up of primary label area and adjacent product surface, clean dry premium finish, label texture and print fidelity prioritized, controlled commercial highlight behavior, no medium-shot fallback';
}

function buildTexturedBedScene(state?: StudioUIState): string {
  const ingredient = String(state?.ingredientObjects || '').trim();
  const depthRaw = String(state?.photoModeDynamicSettings?.depthLevel || '').trim().toLowerCase();
  if (!ingredient) {
    throw new Error(
      '[buildWorld] Textured Bed invariant violation: ingredient is mandatory. ' +
      'No fallback surface is allowed for Textured Bed / Scatter Base.'
    );
  }
  const depthInteractionRule =
    depthRaw === 'subtle'
      ? 'TEXTURED_BED_DEPTH_LEVEL: Subtle. Product lightly embedded with shallow ingredient contact at base only; product remains fully visible.'
      : depthRaw === 'immersive'
        ? `TEXTURED_BED_DEPTH_LEVEL: Immersive. Product is deeply seated into ${ingredient} with dense wrap around the lower perimeter and clear compression marks, but the full product silhouette and primary label remain visible.`
        : 'TEXTURED_BED_DEPTH_LEVEL: Balanced. Product moderately embedded with visible ingredient wrap and clear readability.';

  return [
    `TEXTURED_BED_SCENE: The user ingredient "${ingredient}" defines the full physical ground plane.`,
    `TEXTURED_BED_SURFACE_AUTHORITY: Ground surface must be made from ${ingredient} only. No studio floor, no marble, no neutral stone, no abstract generic texture, and no substitutions unless explicitly requested by user.`,
    'TEXTURED_BED_VISUAL_DOMINANCE: The ingredient provided by the user defines the physical surface. It must be visually dominant and clearly identifiable across the entire base plane.',
    'TEXTURED_BED_PRODUCT_CONTACT: Product must obey gravity and physically interact with ingredient surface. Allowed interaction includes partial sinking, loose-particle support, compression indentation, and light displacement around the base.',
    depthInteractionRule,
    'TEXTURED_BED_VISIBILITY_RULE: Product must be clearly visible as hero subject. Ingredient bed can wrap the lower product silhouette/perimeter but must not hide the product or obstruct the primary label zone.',
    'TEXTURED_BED_FLOATING_BAN: No floating. No hovering. No detached product placement above the ingredient bed.',
    'TEXTURED_BED_RECOGNIZABILITY: Ingredient texture must remain recognizable and material-accurate in color/particle form.',
    'TEXTURED_BED_OVERRIDE: This mode fully overrides default studio material profile and clean-surface defaults.',
  ].join(' ');
}

export function buildEditorialWorld(
  authority: StudioAuthorityBundle,
  state?: StudioUIState
): string {
  const photoMode = String(state?.photoMode || '').trim();

  if (photoMode === 'Hero Landing Page' || photoMode === 'Color Pop Hero') {
    const bgResolution = buildStudioBackground(authority, state!);
    if (bgResolution) {
      return `PHOTO_MODE_SCENE: ${bgResolution.backgroundString} SCENE_AUTHORITY: Photo Mode defines material behavior and interaction physics only. Environment presets define spatial context. Lighting presets define illumination architecture.`;
    }
  }
  if (photoMode === 'Macro Dew Label') {
    return `PHOTO_MODE_SCENE: ${buildMacroDewSceneStyle(state)} SCENE_AUTHORITY: Photo Mode defines material behavior and interaction physics only. Environment presets define spatial context. Lighting presets define illumination architecture.`;
  }

  if (photoMode === 'Textured Bed / Scatter Base') {
    return `PHOTO_MODE_SCENE: ${buildTexturedBedScene(state)} SCENE_AUTHORITY: Photo Mode defines material behavior and interaction physics only. Environment presets define spatial context. Lighting presets define illumination architecture.`;
  }

  const sceneStyle = photoMode ? PHOTO_MODE_SCENE_STYLE_MAP[photoMode] : '';
  if (sceneStyle) {
    return `PHOTO_MODE_SCENE: ${sceneStyle} SCENE_AUTHORITY: Photo Mode defines material behavior and interaction physics only. Environment presets define spatial context. Lighting presets define illumination architecture.`;
  }

  return '';
}
