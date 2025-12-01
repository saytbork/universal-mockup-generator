
import { Option, MockupOptions } from './types';

const getOptionValue = (options: Option[], label: string, fallbackIndex = 0) =>
  options.find(option => option.label === label)?.value ?? options[fallbackIndex].value;

export const DOWNLOAD_CREDIT_CONFIG = {
  original: 1,
  downloadCost2K: 2,
  downloadCost4K: 4,
} as const;

export type DownloadCreditConfig = typeof DOWNLOAD_CREDIT_CONFIG;
export type DownloadResolution = 'original' | '2k' | '4k';

export const HIGH_RES_UNAVAILABLE_MESSAGE =
  'High resolution export is not available at the moment. Credits were not charged.';

export const CONTENT_STYLE_OPTIONS: Option[] = [
  { label: 'UGC Lifestyle', value: 'ugc' },
  { label: 'Product Placement', value: 'product' },
];

export const PLACEMENT_STYLE_OPTIONS: Option[] = [
  { label: 'Luxury Editorial', value: 'luxury editorial set with high-end props and reflections' },
  { label: 'On-White Studio', value: 'clean white sweep background with soft gradients' },
  { label: 'Splash Shot', value: 'dynamic splash of water or liquid around the product' },
  { label: 'Acrylic Blocks', value: 'stacked acrylic blocks and geometric props' },
  { label: 'Lifestyle Flatlay', value: 'styled flatlay with curated props and textures' },
  { label: 'Nature Elements', value: 'organic stones, leaves, and water droplets' },
];

export const PLACEMENT_CAMERA_OPTIONS: Option[] = [
  { label: 'Cinema Camera', value: 'shot on a cinema camera with cinematic lighting' },
  { label: 'Macro Lens', value: 'shot on a macro lens for crisp product detail' },
  { label: 'Product Tabletop Rig', value: 'captured on a tabletop product rig with perfect symmetry' },
  { label: 'Overhead Rig', value: 'captured from an overhead rig for flatlay precision' },
  { label: 'Studio Strobe Setup', value: 'lit with studio strobes and softboxes for glossy highlights' },
];
// Simplified 8-option version focused on practical UGC lighting styles.
export const LIGHTING_OPTIONS: Option[] = [
  { label: 'Natural Light', value: 'soft, natural window light' },
  { label: 'Sunny Day', value: 'bright, direct outdoor sunlight' },
  { label: 'Golden Hour', value: 'warm, golden hour glow' },
  { label: 'Overcast', value: 'diffused, even light from a cloudy sky' },
  { label: 'Cozy Indoors', value: 'warm, ambient indoor lamplight' },
  { label: 'Ring Light', value: 'direct, flattering ring light, vlogger style' },
  { label: 'Mood Lighting', value: 'dim, moody, ambient lighting' },
  { label: 'Night Mode', value: 'nighttime city glow with neon signage and deep contrasting shadows' },
  { label: 'Flash Photo', value: 'direct on-camera flash, creating a candid, party-like feel' },
];

// Curated 8-option version featuring everyday lifestyle environments.
export const SETTING_OPTIONS: Option[] = [
  { label: 'Living Room', value: 'a cozy, lived-in living room' },
  { label: 'Kitchen', value: 'a bright, modern kitchen' },
  { label: 'Bedroom', value: 'a stylish, tidy bedroom' },
  { label: 'Bathroom', value: 'a clean, minimalist bathroom counter' },
  { label: 'Home Office', value: 'a personalized home office desk' },
  { label: 'Café', value: 'a trendy, bustling café' },
  { label: 'Outdoors', value: 'a natural, outdoor park or garden setting' },
  { label: 'In the Car', value: 'the interior of a car, casual and on-the-go' },
  { label: 'Beach', value: 'a sunny beach with sand, umbrellas, and ocean breeze' },
  { label: 'Boutique Hotel', value: 'a chic boutique hotel room or lobby' },
  { label: 'Poolside', value: 'a pool deck with lounge chairs and shimmering water' },
  { label: 'Garden Party', value: 'a lush backyard or botanical garden set up for entertaining' },
  { label: 'Rooftop', value: 'an urban rooftop terrace with skyline views' },
  { label: 'Wellness Spa', value: 'a serene spa setting with steam, plants, and soft towels' },
  { label: 'Farmer’s Market', value: 'an open-air market with fresh produce and rustic tables' },
  { label: 'Mountain Cabin', value: 'a woodsy cabin interior with natural textures' },
  { label: 'Laundry Room Reality', value: 'a laundry room corner with baskets, detergent, and clothes stacked up' },
  { label: 'Bursting Entryway', value: 'a busy apartment entry cluttered with shoes, tote bags, and parcels' },
  { label: 'Subway Platform', value: 'a city subway platform with benches, posters, and commuters' },
  { label: 'Home Studio Chaos', value: 'a cramped creative studio with canvases, cables, and open notebooks' },
];

// Reduced 5-option version covering only visually distinct materials.
export const PRODUCT_MATERIAL_OPTIONS: Option[] = [
    { label: 'Matte Plastic', value: 'matte plastic' },
    { label: 'Glossy Plastic', value: 'glossy plastic' },
    { label: 'Glass & Liquid', value: 'transparent glass, may contain liquid' },
    { label: 'Metal', value: 'reflective metal' },
    { label: 'Paper & Cardboard', value: 'textured paper or cardboard' },
];

// Simplified 3-option version (Clean, Natural, Casual).
export const ENVIRONMENT_ORDER_OPTIONS: Option[] = [
  { label: 'Clean', value: 'clean, tidy, and organized' },
  { label: 'Natural', value: 'natural and realistically lived-in' },
  { label: 'Casual', value: 'casually messy, spontaneous and authentic' },
  { label: 'Creative Chaos', value: 'creative chaos with open notebooks, coffee cups, and props scattered everywhere' },
  { label: 'Post-Launch Mess', value: 'post-launch hustle with packaging, shipping boxes, and marker scribbles left around' },
];

export const PRODUCT_PLANE_OPTIONS: Option[] = [
  {
    label: 'Hero Close-Up (Primer plano)',
    value: 'tight foreground hero framing where the product is inches from the lens with creamy falloff behind it',
  },
  {
    label: 'Mid-Ground Focus (Segundo plano)',
    value: 'balanced mid-ground framing where the product sits slightly back from the lens, keeping both subject and environment in focus',
  },
  {
    label: 'Background Story (Tercer plano)',
    value: 'deeper background placement where the environment leads and the product sits farther back with cinematic depth of field',
  },
];

export const AGE_GROUP_OPTIONS: Option[] = [
  { label: '6-12', value: '6-12' },
  { label: '13-17', value: '13-17' },
  { label: '18-25', value: '18-25' },
  { label: '26-35', value: '26-35' },
  { label: '36-45', value: '36-45' },
  { label: '46-60', value: '46-60' },
  { label: '60-75', value: '60-75' },
  { label: '75+', value: '75+' },
  { label: 'No Person', value: 'no person' },
];

export const GENDER_OPTIONS: Option[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
];

// Concise 3-option version (Regular, Well-Groomed, Styled).
export const PERSON_APPEARANCE_OPTIONS: Option[] = [
  { label: 'Regular', value: 'a regular, everyday appearance' },
  { label: 'Well-Groomed', value: 'a well-groomed, put-together appearance' },
  { label: 'Styled', value: 'a trendy, styled, influencer-like appearance' },
  { label: 'Messy / Just Woke Up', value: 'a slightly messy, just woke up appearance with authentic flyaways and relaxed wardrobe' },
  { label: 'Running Late', value: 'a running-late look with imperfect eyeliner, tousled hair, and layered street clothes' },
];

export const HAIR_COLOR_OPTIONS: Option[] = [
  { label: 'Deep Brown', value: 'deep chocolate brown hair color' },
  { label: 'Rich Black', value: 'rich jet black hair color' },
  { label: 'Warm Auburn', value: 'warm auburn hair with copper undertones' },
  { label: 'Golden Blonde', value: 'golden blonde hair with sunlit highlights' },
  { label: 'Platinum Blonde', value: 'cool platinum blonde hair color' },
  { label: 'Silver / Gray', value: 'natural silver gray hair color' },
  { label: 'Fantasy Pastel', value: 'soft pastel dyed hair color' },
];

export const EYE_COLOR_OPTIONS: Option[] = [
  { label: 'Brown', value: 'warm brown eyes' },
  { label: 'Hazel', value: 'hazel eyes with amber flecks' },
  { label: 'Green', value: 'vibrant green eyes' },
  { label: 'Blue', value: 'bright blue eyes' },
  { label: 'Gray', value: 'cool gray eyes' },
  { label: 'Dark Amber', value: 'dark amber eyes' },
];

export const SKIN_TONE_OPTIONS: Option[] = [
  { label: 'Fair Cool', value: 'fair cool-toned skin with rosy undertones' },
  { label: 'Fair Warm', value: 'fair warm-toned skin with peach undertones' },
  { label: 'Medium Neutral', value: 'medium neutral skin tone' },
  { label: 'Olive', value: 'olive skin tone with golden undertones' },
  { label: 'Tan', value: 'tan sun-kissed skin tone' },
  { label: 'Deep Golden', value: 'deep golden-brown skin tone' },
  { label: 'Deep Cool', value: 'deep cool espresso skin tone' },
];

// 6-option version focused on realistic user actions.
export const PRODUCT_INTERACTION_OPTIONS: Option[] = [
  { label: 'Holding', value: 'holding it naturally' },
  { label: 'Using', value: 'using it' },
  { label: 'Showing to Camera', value: 'showing to camera' },
  { label: 'Unboxing', value: 'unboxing it' },
  { label: 'Applying', value: 'applying it' },
  { label: 'Placing on Surface', value: 'placing on surface' },
];

export const PERSON_POSE_OPTIONS: Option[] = [
  { label: 'Relaxed Portrait', value: 'a relaxed, natural portrait pose with soft eye contact and casual posture' },
  { label: 'Dynamic Mid-Action', value: 'a dynamic mid-action pose, body slightly in motion as if caught candidly' },
  { label: 'Over-the-Shoulder', value: 'an over-the-shoulder glance back toward the camera while engaging with the product' },
  { label: 'Leaned-In Close', value: 'leaned in toward the camera with the product close to frame for intimacy' },
  { label: 'Hands-Only Crop', value: 'hands prominently in frame with the body cropped near the torso, emphasizing touch and texture' },
  { label: 'Face Frame Hero', value: 'framing the product against their cheek while leaning toward the lens for a personable hero crop' },
  { label: 'Grounded Lounge', value: 'lounging on the floor or picnic blanket with limbs extended while the product rests near their face' },
  { label: 'Offer-to-Lens Reach', value: 'extending one arm fully toward the camera so the product hovers closest to the lens' },
];

export const WARDROBE_STYLE_OPTIONS: Option[] = [
  { label: 'Casual Streetwear', value: 'casual streetwear layers in soft neutrals—tees, denim, and relaxed jackets' },
  { label: 'Athleisure Set', value: 'a coordinated athleisure set in performance fabrics with subtle branding' },
  { label: 'Minimal Luxe', value: 'a minimal luxe outfit in monochrome tailoring with sleek accessories' },
  { label: 'Cozy Knitwear', value: 'cozy knitwear with textured sweaters, soft scarves, and relaxed pants' },
  { label: 'Bold Color Pop', value: 'a bold, color-blocked outfit with playful statement accessories' },
  { label: 'Errand-Day Layers', value: 'mismatched errand-day layers with hoodies, tote bags, and lived-in denim' },
];

export const PERSON_MOOD_OPTIONS: Option[] = [
  { label: 'Calm & Serene', value: 'a calm, serene mood with gentle expressions and controlled breathing' },
  { label: 'Joyful & High-Energy', value: 'a joyful, high-energy vibe with big smiles and expressive gestures' },
  { label: 'Confident & Editorial', value: 'a confident, editorial attitude with poised expression and strong gaze' },
  { label: 'Playful & Candid', value: 'a playful, candid mood with spontaneous laughter and informal gestures' },
  { label: 'Hustle & Juggle', value: 'a hustle-and-juggle energy with multitasking gestures and focused eyes' },
  { label: 'Stressed but Determined', value: 'a slightly stressed yet determined mood, trying to get everything done' },
];

export const PERSON_EXPRESSION_OPTIONS: Option[] = [
  { label: 'Soft Smile', value: 'a soft smile with relaxed eyes' },
  { label: 'Full Smile', value: 'a full, teeth-showing smile with bright eye contact' },
  { label: 'Serious Focus', value: 'a serious, focused expression as if concentrating on the product' },
  { label: 'Excited Surprise', value: 'an excited, slightly surprised expression capturing delight' },
  { label: 'Stressed but Hopeful', value: 'slightly furrowed brows with a tired smile, like someone juggling tasks but optimistic' },
  { label: 'Caffeinated Crash', value: 'subtle eye bags, relaxed jaw, and a low-energy grin that still feels friendly' },
  { label: 'Real-Life Calm', value: 'neutral face with light under-eye shadows, no contouring, just a normal rested expression' },
  { label: 'UGC Reality', value: 'messy hair, under-eye bags, slightly chapped lips, relaxed facial muscles, like someone who just woke up or is finishing a long day' },
];

export const HAIR_STYLE_OPTIONS: Option[] = [
  { label: 'Natural Texture', value: 'natural hair texture with minimal styling and movement' },
  { label: 'Loose Waves', value: 'loose, polished waves with a glossy finish' },
  { label: 'Sleek Bun', value: 'a sleek low bun with clean lines and editorial polish' },
  { label: 'Messy Updo', value: 'a messy updo with playful flyaways for realism' },
];

export const SKIN_REALISM_OPTIONS: Option[] = [
  { label: 'Real Raw Photo', value: 'raw' },
  { label: 'Natural Clean Retouch', value: 'clean' },
  { label: 'Beauty Editorial Soft Skin', value: 'beauty' },
];

export const PERSON_PROP_OPTIONS: Option[] = [
  { label: 'None', value: 'no extra handheld props; keep focus purely on the product' },
  { label: 'Smartphone / Tech', value: 'a modern smartphone or small gadget as a supporting prop' },
  { label: 'Coffee / Beverage', value: 'a ceramic coffee cup or beverage glass adding warmth' },
  { label: 'Notebook / Journal', value: 'a notebook or open journal on the table for lifestyle context' },
  { label: 'Makeup Tool', value: 'a makeup brush or beauty applicator reinforcing product usage' },
  { label: 'Shopping Tote', value: 'a reusable shopping tote or bag for an on-the-go vibe' },
];

export const MICRO_LOCATION_OPTIONS: Option[] = [
  { label: 'None / Natural', value: 'no specific micro-location; keep the placement organic and flexible' },
  { label: 'Sofa Corner', value: 'tucked into a cozy sofa corner with throws and cushions' },
  { label: 'Kitchen Island', value: 'gathered around a bright kitchen island with everyday clutter' },
  { label: 'Vanity Mirror', value: 'standing at a vanity mirror with beauty products scattered around' },
  { label: 'Boutique Shelf', value: 'posed near a boutique retail shelf with curated props' },
  { label: 'Rooftop Lounge', value: 'on a rooftop lounge with string lights and skyline ambience' },
];

export const MICRO_LOCATION_NONE_VALUE = MICRO_LOCATION_OPTIONS[0].value;

export type PropBundle = {
  label: string;
  description: string;
  settings: Partial<MockupOptions>;
};

const getOptionValueByLabel = (options: Option[], label: string, fallbackIndex = 0) =>
  options.find(option => option.label === label)?.value ?? options[fallbackIndex].value;

export const PROP_BUNDLES: PropBundle[] = [
  {
    label: 'Coffee Run',
    description: 'Cafe vibes with a latte prop and warm ambience.',
    settings: {
      personProps: getOptionValueByLabel(PERSON_PROP_OPTIONS, 'Coffee / Beverage'),
      microLocation: getOptionValueByLabel(MICRO_LOCATION_OPTIONS, 'Kitchen Island', 2),
      personMood: getOptionValueByLabel(PERSON_MOOD_OPTIONS, 'Playful & Candid'),
    },
  },
  {
    label: 'Desk Creator',
    description: 'Notebook + tech props in a home office.',
    settings: {
      personProps: getOptionValueByLabel(PERSON_PROP_OPTIONS, 'Notebook / Journal'),
      microLocation: getOptionValueByLabel(MICRO_LOCATION_OPTIONS, 'Sofa Corner', 1),
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Home Office', 4),
    },
  },
  {
    label: 'Beauty Vanity',
    description: 'Mirror setup with makeup tools nearby.',
    settings: {
      personProps: getOptionValueByLabel(PERSON_PROP_OPTIONS, 'Makeup Tool'),
      microLocation: getOptionValueByLabel(MICRO_LOCATION_OPTIONS, 'Vanity Mirror', 3),
      wardrobeStyle: getOptionValueByLabel(WARDROBE_STYLE_OPTIONS, 'Minimal Luxe'),
      personMood: getOptionValueByLabel(PERSON_MOOD_OPTIONS, 'Joyful & High-Energy'),
    },
  },
  {
    label: 'Premium Retail',
    description: 'Boutique shelf, tote bag, confident mood.',
    settings: {
      personProps: getOptionValueByLabel(PERSON_PROP_OPTIONS, 'Shopping Tote'),
      microLocation: getOptionValueByLabel(MICRO_LOCATION_OPTIONS, 'Boutique Shelf', 4),
      personMood: getOptionValueByLabel(PERSON_MOOD_OPTIONS, 'Confident & Editorial'),
    },
  },
];

export const PERSPECTIVE_OPTIONS: Option[] = [
  { label: 'Eye-Level', value: 'eye-level shot' },
  { label: 'POV', value: "point-of-view (POV) from the user's perspective" },
  { label: 'High Angle', value: 'shot from a high angle, looking down' },
  { label: 'Low Angle', value: 'shot from a low angle, looking up' },
  { label: 'Close-Up', value: 'a detailed close-up on the product' },
];

export type HeroLandingAlignment = 'left' | 'center' | 'right';
export type HeroLandingShadowStyle = 'softDrop' | 'hardDrop' | 'floating';

export type HeroLandingConfigDefaults = {
  backgroundColor: string;
  accentColor: string | null;
  productAlignment: HeroLandingAlignment;
  productScale: number;
  shadowStyle: HeroLandingShadowStyle;
  forcedLighting: string;
  forcedAngle: string;
  noEnvironment: boolean;
};

export type SupplementPhotoPreset = {
  label: string;
  value: string;
  description: string;
  settings: Partial<MockupOptions>;
  promptCue: string;
  heroLandingConfig?: HeroLandingConfigDefaults;
};

export const SUPPLEMENT_PHOTO_PRESETS: SupplementPhotoPreset[] = [
  {
    label: 'Color Pop Hero',
    value: 'color-pop',
    description: 'Bold monochrome backdrop with drop shadow and energy.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Boutique Hotel', 9),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Creative Chaos'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Sunny Day', 1),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)'),
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'On-White Studio', 1),
    },
    promptCue:
      ' Style this like a modern supplement hero shot with a high-saturation seamless background, clean drop shadows, and premium retouching inspired by upbeat gummy launches.',
  },
  {
    label: 'Ingredient Stack',
    value: 'ingredient-stack',
    description: 'Prop the product with fresh fruits & botanicals.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Café', 5),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Natural'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Natural Light'),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Mid-Ground Focus (Segundo plano)'),
    },
    promptCue:
      ' Surround the product with sliced fruit, herbs, and bubbly textures that hint at flavor benefits. Keep everything vibrant, fresh, and ready for DTC supplement landing pages.',
  },
  {
    label: 'Tile & Spa',
    value: 'tile-spa',
    description: 'Pink ceramic tiles, bathroom counter, spa props.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Bathroom'),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Clean'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Cozy Indoors', 4),
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'Luxury Editorial'),
    },
    promptCue:
      ' Place the product on a glossy tile surface with soft bathroom lighting, subtle suds, and a spa-like palette. Channel premium body-care launches.',
  },
  {
    label: 'Foam & Texture',
    value: 'foam-texture',
    description: 'Close-up goop smears and foam art.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Boutique Hotel', 9),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Flash Photo', 8),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)'),
    },
    promptCue:
      ' Showcase creamy swatches, foamy textures, and macro droplets next to the product for a high-end cleanser/serum vibe. Use playful gradients similar to colorful body-care editorials.',
  },
  {
    label: 'Routine Carousel',
    value: 'routine-carousel',
    description: 'Multiple SKUs lined up on gradient plinths.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Home Office', 4),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Clean'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Ring Light', 5),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Background Story (Tercer plano)'),
    },
    promptCue:
      ' Arrange every product in a neat lineup with gradient back panels, like a DTC carousel slide. Add subtle typography space and glowing edge lights for a premium storefront feel.',
  },
  {
    label: 'Pastel Picnic',
    value: 'pastel-picnic',
    description: 'Playful floor flatlay with fruit, nails, and gummy spills.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Garden Party', 12),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Golden Hour', 2),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Casual', 2),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Mid-Ground Focus (Segundo plano)', 1),
    },
    promptCue:
      ' Style the supplements on a pastel picnic blanket with sliced fruit, manicured hands arranging gummies, and playful shadows reminiscent of upbeat lifestyle shoots.',
  },
  {
    label: 'Face Pop Close-Up',
    value: 'face-pop-close',
    description: 'Tight crop where the jar floats near a model’s face on a color-pop background.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Boutique Hotel', 9),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Ring Light', 5),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Clean', 0),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)', 0),
    },
    promptCue:
      ' If a person is present, float the supplement jar near their cheek with seamless blending; otherwise, keep a bold monochrome background with a cropped hand lifting the jar plus floating flavor props.',
  },
  {
    label: 'Sunrise Ritual Counter',
    value: 'sunrise-counter',
    description: 'Sunrise kitchen bar with frosted glass, shaker, and leafy greens.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Kitchen'),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Clean'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Natural Light'),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)'),
    },
    promptCue:
      ' Style the product like a functional wellness ritual: place it beside a clear glass of frothy drink, fresh citrus, and a chrome scoop on stone counters with sharp morning sun beams.',
  },
  {
    label: 'Clinical Lab Counter',
    value: 'clinical-lab',
    description: 'Clinical marble countertop with glass beakers and botanicals.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Home Office', 4),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Clean'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Overcast'),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Mid-Ground Focus (Segundo plano)'),
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'Acrylic Blocks'),
    },
    promptCue:
      ' Emulate science-forward imagery: chrome lab tools, floating capsules in glass tubes, muted green palette, and soft volumetric light that feels like a microbiome lab.',
  },
  {
    label: 'Golden Mist Aura',
    value: 'golden-mist',
    description: 'Molten gold gradients, glass pedestals, and swirling dust motes.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Boutique Hotel', 9),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Creative Chaos'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Mood Lighting', 6),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)'),
    },
    promptCue:
      ' Surround the hero jar with metallic arches, velvet plinths, and gold mist. Add tiny sparks or cosmic dust swirling behind the product for an ethereal, premium feel.',
  },
  {
    label: 'Outdoor Energy Boost',
    value: 'outdoor-energy',
    description: 'Vivid outdoor fitness deck with kettlebells, mats, and sweat towel.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Outdoors', 6),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Natural'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Sunny Day', 1),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Mid-Ground Focus (Segundo plano)'),
    },
    promptCue:
      ' Stage the bottle on a workout mat with kettlebells, citrus slices, and water spray to capture high-energy motion. Include sun flares and lens haze to feel like an IRL workout break.',
  },
  {
    label: 'Crown Ritual Vanity',
    value: 'crown-ritual',
    description: 'Marble vanity, chrome combs, and hair wellness cues with lush greenery.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Bedroom', 2),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Clean'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Golden Hour', 2),
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'Luxury Editorial'),
    },
    promptCue:
      ' Render the hero supplements beside a jade comb, glass water dropper, and gentle steam ribbons on a white marble counter with foliage bokeh—perfect for hair and skin wellness storytelling.',
  },
  {
    label: 'Candy Gradient Lab',
    value: 'candy-lab',
    description: 'Candy-coated gradient lab with gummy spills and chrome labware.',
    settings: {
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Home Office', 4),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Creative Chaos'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Ring Light', 5),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Background Story (Tercer plano)'),
    },
    promptCue:
      ' Style like a playful gummy launch: translucent jars on mirrored pedestals, holographic gradients, chrome droppers, and floating gummy trails that feel whimsical yet premium.',
  },
  {
    label: 'Hero Landing Page',
    value: 'hero-landing',
    description: 'Pure white seamless hero module with adjustable alignment for ecommerce landings.',
    settings: {
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'On-White Studio', 1),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)'),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Clean'),
      lighting: getOptionValueByLabel(LIGHTING_OPTIONS, 'Ring Light', 5),
    },
    promptCue:
      ' Build a high-contrast landing hero on a seamless white set. Keep everything minimal, with typography-safe negative space and crisp retouching.',
    heroLandingConfig: {
      backgroundColor: '#FFFFFF',
      accentColor: null,
      productAlignment: 'center',
      productScale: 1,
      shadowStyle: 'softDrop',
      forcedLighting: 'studio',
      forcedAngle: 'front',
      noEnvironment: true,
    },
  },
];

export const PRO_LENS_OPTIONS: Option[] = [
  { label: '100mm Macro Prime', value: 'captured on a 100mm macro prime lens for tack-sharp detail and creamy bokeh' },
  { label: '50mm Product Prime', value: 'shot on a 50mm prime lens with natural perspective and gentle depth of field' },
  { label: 'Tilt-Shift Hero', value: 'captured with a tilt-shift lens for perfect verticals and premium catalog polish' },
  { label: 'Ultra-Wide Stylized', value: 'shot on an ultra-wide 24mm lens for dramatic perspective and sweeping background' },
  { label: 'Cinema Zoom', value: 'captured on a cinema zoom lens with controlled focus pulls and smooth transitions' },
  { label: '70-200mm Compression', value: 'captured on a 70-200mm telephoto zoom to compress background elements like large-format wellness billboards' },
  { label: '35mm Anamorphic Glow', value: 'shot on a 35mm anamorphic lens with cinematic oval bokeh and subtle barrel warp for high-end hero shots' },
];

export const PRO_LIGHTING_RIG_OPTIONS: Option[] = [
  { label: '3-Point Beauty Dish', value: 'three-point lighting with beauty dish key, fill bounce, and rim kicker for glossy highlights' },
  { label: 'Softbox Wrap', value: 'giant softbox wrap light with diffusion panels for zero shadows and cosmetic smoothness' },
  { label: 'Hard Edge Gels', value: 'hard strobes with colored gels hitting the background to create gradients and drama' },
  { label: 'Backlit Acrylic', value: 'backlit translucent acrylic table for glowing bottles and floating reflections' },
  { label: 'High-Speed Splash Rig', value: 'strobe rig tuned for high-speed splashes, freezing liquid midair' },
  { label: 'Gradient Cyclorama', value: 'giant cyclorama wash with dual RGB gradients inspired by premium hero backdrops' },
  { label: 'Prism Spotlight Duo', value: 'two specular spotlights firing through prisms to create rainbow streaks and glossy kickers' },
];

export const PRO_POST_TREATMENT_OPTIONS: Option[] = [
  { label: 'High-Gloss Retouch', value: 'high-gloss retouch with specular cleanup and crisp contrast' },
  { label: 'Film Grain Lux', value: 'polished film grain overlay with teal-and-orange color grade' },
  { label: 'Matte Editorial', value: 'matte, desaturated editorial finish with subtle bloom' },
  { label: 'Hyperreal CGI Blend', value: 'hyperreal CGI-style treatment with razor-sharp edges and perfect gradients' },
  { label: 'Clinical Lab Polish', value: 'clean-room clarity with cool whites, chrome accents, and zero color cast like science-backed product pages' },
  { label: 'Vibrant Lifestyle Pop', value: 'punchy saturation, lifted whites, and candy-colored highlights inspired by playful ecommerce banners' },
];

export type ProLookPreset = {
  label: string;
  value: string;
  description: string;
  settings: Partial<MockupOptions> & {
    proLens?: string;
    proLightingRig?: string;
    proPostTreatment?: string;
  };
};

export const PRO_LOOK_PRESETS: ProLookPreset[] = [
  {
    label: 'Beauty Skincare Focus',
    value: 'beauty_pro',
    description: 'Macro lens + softbox wrap for cosmetics and skincare drop shots.',
    settings: {
      proLens: PRO_LENS_OPTIONS[0].value,
      proLightingRig: PRO_LIGHTING_RIG_OPTIONS[1].value,
      proPostTreatment: PRO_POST_TREATMENT_OPTIONS[0].value,
      placementStyle: PLACEMENT_STYLE_OPTIONS[0].value,
    },
  },
  {
    label: 'Luxury Beverage Splash',
    value: 'beverage_splash',
    description: 'High-speed rig with gels for dramatic drink ads.',
    settings: {
      proLens: PRO_LENS_OPTIONS[4].value,
      proLightingRig: PRO_LIGHTING_RIG_OPTIONS[4].value,
      proPostTreatment: PRO_POST_TREATMENT_OPTIONS[1].value,
      placementStyle: PLACEMENT_STYLE_OPTIONS[2].value,
    },
  },
  {
    label: 'Minimal Catalog',
    value: 'catalog_clean',
    description: 'Tilt-shift precision with matte editorial finish.',
    settings: {
      proLens: PRO_LENS_OPTIONS[2].value,
      proLightingRig: PRO_LIGHTING_RIG_OPTIONS[0].value,
      proPostTreatment: PRO_POST_TREATMENT_OPTIONS[2].value,
      placementStyle: PLACEMENT_STYLE_OPTIONS[1].value,
    },
  },
  {
    label: 'Carousel Glow',
    value: 'carousel_glow',
    description: 'Candy-colored acrylic plinths with gummy spills and rim lights.',
    settings: {
      proLens: PRO_LENS_OPTIONS[1].value,
      proLightingRig: PRO_LIGHTING_RIG_OPTIONS[3].value,
      proPostTreatment: PRO_POST_TREATMENT_OPTIONS[0].value,
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'Lifestyle Flatlay'),
    },
  },
  {
    label: 'Clinical Chrome',
    value: 'clinical_chrome',
    description: 'Sterile macro shot with chrome lab props and teal gradients.',
    settings: {
      proLens: PRO_LENS_OPTIONS[2].value,
      proLightingRig: PRO_LIGHTING_RIG_OPTIONS[1].value,
      proPostTreatment: PRO_POST_TREATMENT_OPTIONS[2].value,
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'Acrylic Blocks'),
    },
  },
  {
    label: 'Outdoor Fitness Burst',
    value: 'outdoor_fitness_pro',
    description: 'Ultra-wide hero on a track with sharp sun flare and motion blur.',
    settings: {
      proLens: PRO_LENS_OPTIONS[3].value,
      proLightingRig: PRO_LIGHTING_RIG_OPTIONS[4].value,
      proPostTreatment: PRO_POST_TREATMENT_OPTIONS[1].value,
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'Nature Elements'),
    },
  },
  {
    label: 'Dawn Ritual Compression',
    value: 'dawn_ritual',
    description: 'Telephoto compression with gradient cyclorama wash inspired by modern countertop hero shots.',
    settings: {
      proLens: PRO_LENS_OPTIONS[5].value,
      proLightingRig: PRO_LIGHTING_RIG_OPTIONS[5].value,
      proPostTreatment: PRO_POST_TREATMENT_OPTIONS[4].value,
      placementStyle: getOptionValueByLabel(PLACEMENT_STYLE_OPTIONS, 'Nature Elements'),
    },
  },
];

export type CreatorPreset = {
  label: string;
  value: string;
  description: string;
  settings: Partial<MockupOptions>;
};

export const CREATOR_PRESETS: CreatorPreset[] = [
  {
    label: 'Custom Build',
    value: 'custom',
    description: 'Start from scratch and dial every parameter manually.',
    settings: {},
  },
  {
    label: 'Beauty Creator',
    value: 'beauty_creator',
    description: 'Dewy glow, glam wardrobe, close interaction with skincare or makeup.',
    settings: {
      personAppearance: PERSON_APPEARANCE_OPTIONS[2].value,
      personMood: PERSON_MOOD_OPTIONS[1].value,
      personPose: PERSON_POSE_OPTIONS[3].value,
      wardrobeStyle: WARDROBE_STYLE_OPTIONS[2].value,
      productInteraction: 'applying it',
      personProps: PERSON_PROP_OPTIONS[4].value,
      microLocation: MICRO_LOCATION_OPTIONS[2].value,
      personExpression: PERSON_EXPRESSION_OPTIONS[1].value,
      hairStyle: HAIR_STYLE_OPTIONS[1].value,
      gender: GENDER_OPTIONS[0].value,
    },
  },
  {
    label: 'Wellness Coach',
    value: 'wellness_coach',
    description: 'Calm energy, cozy knits, journaling props in a sofa corner.',
    settings: {
      personAppearance: PERSON_APPEARANCE_OPTIONS[0].value,
      personMood: PERSON_MOOD_OPTIONS[0].value,
      personPose: PERSON_POSE_OPTIONS[0].value,
      wardrobeStyle: WARDROBE_STYLE_OPTIONS[3].value,
      productInteraction: 'holding it naturally',
      personProps: PERSON_PROP_OPTIONS[3].value,
      microLocation: MICRO_LOCATION_OPTIONS[0].value,
      personExpression: PERSON_EXPRESSION_OPTIONS[0].value,
      hairStyle: HAIR_STYLE_OPTIONS[0].value,
    },
  },
  {
    label: 'Streetwear Reviewer',
    value: 'streetwear_reviewer',
    description: 'Bold on-the-go look, tech props, high-energy vibe.',
    settings: {
      personAppearance: PERSON_APPEARANCE_OPTIONS[2].value,
      personMood: PERSON_MOOD_OPTIONS[2].value,
      personPose: PERSON_POSE_OPTIONS[1].value,
      wardrobeStyle: WARDROBE_STYLE_OPTIONS[0].value,
      productInteraction: 'showing to camera',
      personProps: PERSON_PROP_OPTIONS[1].value,
      microLocation: MICRO_LOCATION_OPTIONS[4].value,
      personExpression: PERSON_EXPRESSION_OPTIONS[1].value,
      hairStyle: HAIR_STYLE_OPTIONS[3].value,
      gender: GENDER_OPTIONS[1].value,
    },
  },
  {
    label: 'Everyday Hustler',
    value: 'everyday_hustler',
    description: 'Running-late creator juggling errands with a messy-but-real vibe.',
    settings: {
      personAppearance: getOptionValue(PERSON_APPEARANCE_OPTIONS, 'Running Late'),
      personMood: getOptionValue(PERSON_MOOD_OPTIONS, 'Hustle & Juggle'),
      personExpression: getOptionValue(PERSON_EXPRESSION_OPTIONS, 'Serious Focus'),
      personPose: getOptionValue(PERSON_POSE_OPTIONS, 'Dynamic Mid-Action'),
      wardrobeStyle: getOptionValue(WARDROBE_STYLE_OPTIONS, 'Errand-Day Layers'),
      productInteraction: 'holding it naturally',
      personProps: PERSON_PROP_OPTIONS[5].value,
      microLocation: getOptionValue(MICRO_LOCATION_OPTIONS, 'Bursting Entryway'),
      hairStyle: getOptionValue(HAIR_STYLE_OPTIONS, 'Messy Updo'),
      environmentOrder: getOptionValue(ENVIRONMENT_ORDER_OPTIONS, 'Creative Chaos'),
      setting: getOptionValue(SETTING_OPTIONS, 'Bursting Entryway'),
    },
  },
  {
    label: 'Fitness Creator',
    value: 'fitness_creator',
    description: 'Athleisure set, energized expressions, often mid-action.',
    settings: {
      personAppearance: PERSON_APPEARANCE_OPTIONS[1].value,
      personMood: PERSON_MOOD_OPTIONS[1].value,
      personPose: PERSON_POSE_OPTIONS[1].value,
      wardrobeStyle: WARDROBE_STYLE_OPTIONS[1].value,
      productInteraction: 'using it',
      personProps: PERSON_PROP_OPTIONS[5].value,
      microLocation: MICRO_LOCATION_OPTIONS[1].value,
      personExpression: PERSON_EXPRESSION_OPTIONS[1].value,
      hairStyle: HAIR_STYLE_OPTIONS[2].value,
    },
  },
];

// Essential 5-option set representing true UGC shooting styles.
export const CAMERA_OPTIONS: Option[] = [
  { label: 'Modern Smartphone', value: 'shot on a recent smartphone with computational HDR' },
  { label: 'Front Selfie Cam', value: 'shot on a front-facing selfie camera with arm’s length framing' },
  { label: 'Sony Handycam Hi8', value: 'shot on a vintage Sony Handycam Hi8 with interlaced video look and washed colors' },
  { label: 'Disposable Film Camera', value: 'shot on a disposable 35mm film camera with strong flash and grain' },
  { label: 'Polaroid OneStep', value: 'shot on an instant Polaroid camera with soft focus and vignette' },
  { label: 'DSLR/Mirrorless', value: 'shot on a professional DSLR/Mirrorless camera with a shallow depth of field' },
  { label: 'Laptop Webcam', value: 'shot on a built-in laptop webcam with low-light noise' },
  { label: 'Cinema Camera Rig', value: 'captured on a cinema camera rig with PL glass, 6K sensors, and stabilized movement' },
  { label: 'Medium Format Studio Camera', value: 'shot on a medium format studio camera tethered to Capture One for razor-sharp product detail' },
  { label: 'Sony FX3', value: 'captured on a Sony FX3 cinema camera with S-Cinetone color science' },
];

export type HeroPosePreset = {
  label: string;
  value: string;
  description: string;
  settings: Partial<MockupOptions>;
  promptCue: string;
};

export const HERO_PERSON_PRESETS: HeroPosePreset[] = [
  {
    label: 'Face Frame Hero',
    value: 'face-frame',
    description: 'Creator cradles the jar next to their cheek with bright, confident eye contact.',
    settings: {
      personPose: getOptionValueByLabel(PERSON_POSE_OPTIONS, 'Face Frame Hero', 3),
      productInteraction: getOptionValueByLabel(PRODUCT_INTERACTION_OPTIONS, 'Showing to Camera', 2),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)', 0),
      perspective: getOptionValueByLabel(PERSPECTIVE_OPTIONS, 'Close-Up', 4),
      camera: getOptionValueByLabel(CAMERA_OPTIONS, 'Modern Smartphone', 0),
    },
    promptCue:
      ' Have the creator lean in and gently hug the supplement jar against their cheek while keeping eyes on the camera. Crop tightly so the face and product fill most of the frame with soft hands supporting the label.',
  },
  {
    label: 'Offer-to-Lens',
    value: 'offer-to-lens',
    description: 'Arm fully extended toward camera so the product feels within reach.',
    settings: {
      personPose: getOptionValueByLabel(PERSON_POSE_OPTIONS, 'Offer-to-Lens Reach', 6),
      productInteraction: getOptionValueByLabel(PRODUCT_INTERACTION_OPTIONS, 'Showing to Camera', 2),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Hero Close-Up (Primer plano)', 0),
      perspective: getOptionValueByLabel(PERSPECTIVE_OPTIONS, 'Eye-Level', 0),
      camera: getOptionValueByLabel(CAMERA_OPTIONS, 'Front Selfie Cam', 1),
    },
    promptCue:
      ' Pose them with one arm reaching straight toward the lens while the other relaxes at their side so the jar hovers closest to viewers, keeping fingers around the lid without covering the logo.',
  },
  {
    label: 'Grounded Duo',
    value: 'grounded-duo',
    description: 'Model lounging on the floor or picnic mat with bottles scattered around.',
    settings: {
      personPose: getOptionValueByLabel(PERSON_POSE_OPTIONS, 'Grounded Lounge', 5),
      productInteraction: getOptionValueByLabel(PRODUCT_INTERACTION_OPTIONS, 'Holding', 0),
      productPlane: getOptionValueByLabel(PRODUCT_PLANE_OPTIONS, 'Mid-Ground Focus (Segundo plano)', 1),
      perspective: getOptionValueByLabel(PERSPECTIVE_OPTIONS, 'High Angle', 2),
      camera: getOptionValueByLabel(CAMERA_OPTIONS, 'DSLR/Mirrorless', 5),
      setting: getOptionValueByLabel(SETTING_OPTIONS, 'Garden Party', 12),
      environmentOrder: getOptionValueByLabel(ENVIRONMENT_ORDER_OPTIONS, 'Casual', 2),
    },
    promptCue:
      ' Place the model reclining on a mat or rug with knees bent, scattering multiple supplement bottles and gummy props around them while they hold one bottle near their face and look up at camera.',
  },
];

// 5-option version representing common human-view compositions.
export const ASPECT_RATIO_OPTIONS: Option[] = [
    { label: '16:9 (Widescreen)', value: '16:9' },
    { label: '9:16 (Vertical)', value: '9:16' },
    { label: '1:1 (Square)', value: '1:1' },
];

export const SELFIE_TYPE_OPTIONS: Option[] = [
  { label: 'None', value: 'none' },
  { label: "Arm's Length Selfie", value: 'arm-length front selfie with the phone held slightly above eye level' },
  { label: 'Mirror Selfie (phone visible)', value: 'mirror selfie with the phone partially covering the face and product in view' },
  { label: 'One-hand product selfie', value: 'one-hand selfie where the same hand holds the phone and frames the product near the lens' },
  { label: 'Overhead in-bed selfie', value: 'overhead selfie taken while lying down, arm extended straight up' },
  { label: 'Low-angle hero selfie', value: 'low-angle selfie from below the chin pointing upward for dramatic perspective' },
  { label: 'Back camera POV', value: 'back camera POV close-up of hands interacting with the product, body cropped' },
];

export const ETHNICITY_OPTIONS: Option[] = [
  { label: 'African Descent', value: 'of African descent' },
  { label: 'Latino', value: 'Latino' },
  { label: 'Asian', value: 'Asian' },
  { label: 'Caucasian', value: 'Caucasian' },
  { label: 'Middle Eastern', value: 'Middle Eastern' },
  { label: 'Mixed', value: 'of mixed ethnicity' },
];

export const REALISM_OPTIONS: Option[] = [
  {
    label: 'Natural Imperfections',
    value: 'introduce authentic flaws: subtle motion blur, slight lens dust, uneven lighting, and a bit of hand shake to mimic real phone footage.',
  },
  {
    label: 'Balanced Realism',
    value: 'keep the realism moderate with organic grain, minor reflections, and a handheld look while still feeling premium.',
  },
  {
    label: 'Messy Space UGC',
    value: 'let the environment feel mildly messy with everyday clutter, scuffed surfaces, and imperfect prop placement so it feels lived-in and unscripted.',
  },
  {
    label: 'Polished Production',
    value: 'keep everything crisp and polished, as if shot on a stabilized rig in a controlled studio.',
  },
];

export const COMPOSITION_MODE_OPTIONS: Option[] = [
  { label: 'Standard UGC', value: 'standard' },
  { label: 'Cinematic UGC', value: 'cinematic' },
  { label: 'Ecommerce Blank Space', value: 'ecom-blank' },
];

export const SIDE_PLACEMENT_OPTIONS: Option[] = [
  { label: 'Left Side', value: 'left' },
  { label: 'Right Side', value: 'right' },
];
