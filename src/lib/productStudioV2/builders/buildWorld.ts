import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes.ts';
import { buildStudioBackground } from './buildStudioBackground.ts';

const WORLD_LABELS: Record<StudioAuthorityBundle['world'], string> = {
  studio: 'controlled studio environment with bounded physical set interactions',
  underwater: 'underwater environment with refraction-consistent optical depth',
  'splash-tank': 'splash tank environment with bounded liquid containment',
  'beach-daylight': 'sunlit tropical shoreline environment with turquoise water and clean white sand',
  'water-surface': 'pool water surface environment with clear turquoise water, sunlit caustics, and natural refraction',
};

/** Maps contextPreset to a studio background description for supplement products */
const CONTEXT_PRESET_STUDIO_BACKGROUND: Record<string, string> = {
  'Dark Luxury Studio': 'deep dark background with subtle gradient depth and premium low-key atmosphere',
  'Clean White Studio': 'pure white seamless studio background with clean gradient and high-key commercial finish',
  'Warm Neutral Studio': 'warm neutral beige/cream background with soft studio lighting and premium lifestyle feel',
  'Soft Gray Studio': 'soft gray seamless background with controlled tonal rolloff and clean commercial finish',
  'Natural Light Window': 'natural window-lit background with soft warm daylight and airy lifestyle atmosphere',
  'Marble Surface': 'polished marble surface as base with clean studio background and premium material contrast',
  'Wood Surface': 'natural wood surface as base with warm lifestyle studio background',
  'Black Matte': 'matte black seamless background with minimal studio lighting and premium dark-mode finish',
};

/**
 * Full scene descriptions for every Photo Mode.
 * Source: PHOTO_MODE_SCHEMAS[mode].basePrompt from photoModeSchema.ts
 * These are injected as PHOTO_MODE_SCENE to override the generic studio world.
 */
const PHOTO_MODE_SCENE_MAP: Record<string, string> = {
  // ── Studio modes ──
  // 'Hero Landing Page' → delegated to buildStudioBackground (deterministic brand color)
  // 'Color Pop Hero'    → delegated to buildStudioBackground (deterministic brand color)
  'Ingredient Stack': 'clean studio surface with curated ingredient elements arranged naturally around the product, editorial commercial framing',
  'Ingredient Flat Lay': 'top-down flat lay on clean studio surface with ingredients arranged in controlled layout around the product',
  'Acrylic Blocks': 'clean studio with geometric acrylic block props as compositional accents, premium minimal editorial look',
  'Glass Pedestal Studio': 'clean studio with transparent glass pedestal elevating the product, premium material contrast and reflections',
  'Splash Shot': 'controlled splash tank environment, product center-frame with dynamic liquid splash, freeze-frame energy, clean readability',
  'Beach Foam Splash': 'sunlit tropical shoreline with white foam wash at product base, wet compact sand, turquoise water background, clean product grounding',
  'Pool Water': 'sunlit pool edge scene with clear blue pool water beside the product, premium outdoor hydration atmosphere',
  'Cheers (Hands Clink)': 'social beverage scene with hands clinking products, warm lifestyle ambient lighting, natural celebratory energy',
  'Ice Cubes': 'clean studio surface with scattered ice cubes around the product, cold premium refreshment look with controlled condensation',
  'Condensation Droplets': 'clean studio scene with realistic condensation droplets on the product surface, cold-premium hydration look',
  'Fruit Garnish / Citrus Accents': 'clean studio surface with fresh citrus and fruit accent elements arranged around the product, vibrant premium editorial',
  'Textured Bed / Scatter Base': 'editorial studio surface with textured base material and curated scattered elements supporting the product',
  'Floating Particles': 'clean dark studio background with fine floating particles creating depth and premium atmospheric energy around the product',
  'Foam & Texture': 'editorial studio surface with textured foam and material accents creating tactile contrast around the product',
  'Routine Carousel': 'clean studio multi-product arrangement with editorial spacing, routine lifestyle context, product-first hierarchy',
  'Clinical Lab Counter': 'clean clinical studio surface with precision lab equipment accents, scientific premium atmosphere, product as hero',
  'Minimal Bathroom Vanity': 'minimal clean advertising studio surface, rigid materials like glass metal acrylic and stone, minimal elements, controlled reflections, product-first composition',
  'Dark Premium Studio': 'low-key premium advertising studio with dark background and controlled highlights, product edges remain clearly defined',
  'Monochrome Brand': 'single-color brand world advertising composition, all elements remain within one color family, graphic minimal brand-driven abstraction',
  'Brand Campaign': 'high-end brand campaign advertising studio, architectural composition with premium rigid materials, controlled set design, product remains the focal point',
  'Tech Clean Studio': 'technology-driven advertising studio, precision surfaces, clean geometry, cool neutral tones, modern minimal performance-oriented atmosphere',
  'Luxury Editorial Tabletop': 'luxury editorial advertising studio surface composition, premium rigid surface materials with minimal glass acrylic or stone accents, product remains the focal point',
  'Soft Wellness Morning': 'soft diffused advertising studio lighting, clean rigid materials, minimal set styling, product-first composition with controlled highlights',
  'Outdoor Energy Boost': 'fresh energetic advertising studio lighting, bright highlights, crisp contrast, dynamic framing, controlled set with clean rigid surfaces',
  'Candy Gradient Lab': 'studio gradient background with candy-like color transitions, smooth blends and controlled saturation, clean abstraction with physical grounding',
  'Golden Mist Aura': 'atmospheric advertising studio lighting, subtle haze for depth separation, soft highlights, label clarity remains mandatory',
  'Creator Premium Simulation': 'premium studio simulation with subtle realism, controlled advertising studio, clean purpose-built studio surfaces, brand-safe polish, controlled imperfections with studio-grade clarity',
  'UGC Premium Simulation': 'premium studio simulation with subtle realism, controlled advertising studio, clean purpose-built studio surfaces, brand-safe polish, controlled imperfections with studio-grade clarity',
  'Macro Dew Label': 'true macro close-up of the product label and bottle material texture, label occupying most of frame, realistic dew droplets with optical magnification behavior, ultra-sharp commercial detail and controlled highlights',
  'Gel Smear Editorial': 'premium editorial gel-smear composition on neutral stone/concrete cosmetic slab, real tactile smear material with visible thickness and controlled gloss, product adjacent in hero zone, balanced negative space, no props, no clutter, no background gradients',
  'Citrus Fresh Flat Lay': 'fresh ingredient-led flat lay composition with clean circular rhythm around the product, bright premium commercial styling, top-down discipline',
  'Stones & Crystals Flat Lay': 'neutral tactile flat lay with curated stones and crystal accents, balanced spacing and premium wellness editorial tone',
  'Dried Citrus Earth': 'earthy warm flat lay on textured natural surface with curated dried botanical accents, premium grounded composition and clear product hierarchy',
  // ── Environment / outdoor modes ──
  'Sunlit Stone Editorial': 'architectural stone blocks with sunlit editorial lighting, strong directional shadows, premium warm-neutral palette, clean product-first framing',
  'Golden Sunset Backlit': 'golden-hour backlit hero composition, warm sunset tonal range, controlled flare and edge glow, product remains readable and dominant',
  'Golden Hour Lifestyle': 'warm advertising lighting inspired by golden-hour tones, soft directional glow and natural color warmth, controlled editorial set with aspirational mood',
  'Bathroom Daylight Clean': 'clean bathroom daylight composition, soft window light, premium minimal surfaces, realistic skincare setting with no clutter',
  'Pastel Picnic': 'pastel-toned advertising composition, soft color palette with playful balance, clean brand-safe environment',
  'Sky Float Minimal': 'minimal floating product composition against a real open sky with natural atmospheric depth, subtle cloud variation, believable horizon haze, airy premium look, soft natural daylight and controlled product silhouette',
  'Wet Rock Ripples': 'wet stone surface with controlled shallow water ripples, premium reflective highlights, product grounded and physically coherent',
  'Hands Application Clean': 'clean premium skincare application moment with realistic hands, clear product handling, product and label remain readable and central',
  'Underwater Split': 'sunlit split-waterline composition: product intersects the water surface with upper section in bright clean air and lower section submerged in clear luminous aqua water, realistic curved meniscus at waterline, visible underwater caustics and light rays, crisp micro-bubbles around submerged edges, premium hydration look with strong product readability',
  'Sand Palm Shadows': 'sunlit real-beach sand composition with visible natural grain variation, micro-ridges, and subtle irregular footprints from wind shaping, soft palm shadow patterns, warm premium tones, grounded product placement and controlled negative space',
  'Botanical Water Garden': 'botanical wet environment with shallow water and subtle natural foliage context, premium realistic lighting, clean product focus',
  'Warm Window Wood': 'warm wooden window environment, natural sunlight and soft interior shadows, realistic lifestyle-adjacent premium product scene',
  // ── Wine-exclusive modes ──
  'Wine Macro Label': 'extreme macro close-up cropped to the wine bottle label region only, bottle neck excluded, bottle base excluded, frame centers on label panel, 100mm macro lens simulation, f/4 aperture, ultra-sharp label typography, high micro contrast, natural paper/foil texture, label fully readable with maximum detail fidelity',
  'Bottle + Glass': 'wine bottle and filled wine glass composition, bottle remains sealed, glass positioned at complementary angle, 3/4 camera angle, premium wine photography, label fully legible',
  'Editorial Table': 'premium wine editorial tabletop composition, authentic surface texture, editorial balance, minimal controlled props, bottle as focal point with subtle environmental depth',
  'Winery Scene': 'wine bottle in authentic winery environment, stone cellar or barrel room background, natural imperfect lighting, editorial depth of field, bottle as primary subject',
};

export function buildWorld(
  authority: StudioAuthorityBundle,
  explicitWorld?: StudioAuthorityBundle['world'],
  state?: StudioUIState
): string {
  // Non-studio worlds always emit their world block
  if (authority.world !== 'studio') {
    const worldLine = `STUDIO_WORLD: ${WORLD_LABELS[authority.world]}.`;

    // Pool Water realism lock — appended immediately after the world declaration.
    // Prevents CGI-style splash artifacts, stylized wave crowns, and synthetic water.
    if (authority.world === 'water-surface') {
      const poolWaterGuardrails = [
        'POOL_WATER_REALISM_LOCK: Water must behave like a real swimming pool photographed with a camera. No stylized splash arcs. No symmetric wave explosions. No water crowns. No liquid impact shapes. Surface disturbance must be minimal and physically plausible. Allow only small ripples caused by object displacement. Waterline must intersect the product naturally.',
        'WATER_OPTICS_REALISM: Use photographic refraction and reflection. Avoid CGI-style glassy water. Allow slight surface noise and natural light caustics.',
        'SPLASH_PATTERN_PROHIBITION: Do not generate splash arcs, droplets flying outward, crown splashes, or symmetric liquid bursts.',
      ];
      const result = [worldLine, ...poolWaterGuardrails].join(' ');
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildWorld] FINAL background string emitted (water-surface + realism lock):', JSON.stringify(result));
      return result;
    }

    return worldLine;
  }

  // Photo Mode takes scene authority — if a photo mode has a scene, emit it and skip generic studio
  const photoMode = String(state?.photoMode || '').trim();

  // Hero Landing Page and Color Pop Hero: delegate to deterministic brand color resolver
  if (photoMode === 'Hero Landing Page' || photoMode === 'Color Pop Hero') {
    const bgResolution = buildStudioBackground(authority, state!);
    if (bgResolution) {
      const result = `PHOTO_MODE_SCENE: ${bgResolution.backgroundString} SCENE_AUTHORITY: Photo Mode defines the environment. Do not substitute a plain studio background.`;
      // eslint-disable-next-line no-console
      console.log('[DEBUG][buildWorld] FINAL background string emitted (V2_BG_RESOLVER):', JSON.stringify(result));
      return result;
    }
  }

  const photoModeScene = photoMode ? PHOTO_MODE_SCENE_MAP[photoMode] : undefined;
  // eslint-disable-next-line no-console
  console.log('[buildWorld] photoMode=', JSON.stringify(photoMode), '| found=', !!photoModeScene);
  if (photoModeScene) {
    const result = `PHOTO_MODE_SCENE: ${photoModeScene}. SCENE_AUTHORITY: Photo Mode defines the environment. Do not substitute a plain studio background.`;
    // eslint-disable-next-line no-console
    console.log('[DEBUG][buildWorld] FINAL background string emitted (PHOTO_MODE_SCENE):', JSON.stringify(result));
    return result;
  }

  // Studio world: emit contextPreset background if available
  const contextPreset = String(state?.contextPresetValue || '').trim();
  const backgroundDesc =
    (contextPreset && CONTEXT_PRESET_STUDIO_BACKGROUND[contextPreset]) ||
    (contextPreset ? `studio environment — ${contextPreset}` : '');

  if (backgroundDesc) {
    const result = [
      `STUDIO_WORLD: ${WORLD_LABELS['studio']}.`,
      `BACKGROUND_ENVIRONMENT: ${backgroundDesc}. Fill the entire frame background with this scene — no gray voids, no empty canvas areas.`,
    ].join(' ');
    // eslint-disable-next-line no-console
    console.log('[DEBUG][buildWorld] FINAL background string emitted (contextPreset):', JSON.stringify(result));
    return result;
  }

  // No context preset and no photo mode: emit a generic clean studio background
  const fallback = `STUDIO_WORLD: clean studio environment. BACKGROUND_FILL: seamless neutral studio background with soft gradient depth. No gray borders, no empty canvas corners — fill the entire frame edge-to-edge with the studio environment.`;
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildWorld] FINAL background string emitted (fallback):', JSON.stringify(fallback));
  return fallback;
}
