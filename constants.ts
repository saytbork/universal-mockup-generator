
import { Option, MockupOptions } from './types';

const getOptionValue = (options: Option[], label: string, fallbackIndex = 0) =>
  options.find(option => option.label === label)?.value ?? options[fallbackIndex].value;

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

export const AGE_GROUP_OPTIONS: Option[] = [
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
];

export const HAIR_STYLE_OPTIONS: Option[] = [
  { label: 'Natural Texture', value: 'natural hair texture with minimal styling and movement' },
  { label: 'Loose Waves', value: 'loose, polished waves with a glossy finish' },
  { label: 'Sleek Bun', value: 'a sleek low bun with clean lines and editorial polish' },
  { label: 'Messy Updo', value: 'a messy updo with playful flyaways for realism' },
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
  { label: 'Sofa Corner', value: 'tucked into a cozy sofa corner with throws and cushions' },
  { label: 'Kitchen Island', value: 'gathered around a bright kitchen island with everyday clutter' },
  { label: 'Vanity Mirror', value: 'standing at a vanity mirror with beauty products scattered around' },
  { label: 'Boutique Shelf', value: 'posed near a boutique retail shelf with curated props' },
  { label: 'Rooftop Lounge', value: 'on a rooftop lounge with string lights and skyline ambience' },
];

export type PropBundle = {
  label: string;
  description: string;
  settings: Partial<MockupOptions>;
};

export const PROP_BUNDLES: PropBundle[] = [
  {
    label: 'Coffee Run',
    description: 'Cafe vibes with a latte prop and warm ambience.',
    settings: {
      personProps: PERSON_PROP_OPTIONS[2].value,
      microLocation: MICRO_LOCATION_OPTIONS[1].value,
      personMood: PERSON_MOOD_OPTIONS[3].value,
    },
  },
  {
    label: 'Desk Creator',
    description: 'Notebook + tech props in a home office.',
    settings: {
      personProps: PERSON_PROP_OPTIONS[3].value,
      microLocation: MICRO_LOCATION_OPTIONS[0].value,
      setting: SETTING_OPTIONS[4].value,
    },
  },
  {
    label: 'Beauty Vanity',
    description: 'Mirror setup with makeup tools nearby.',
    settings: {
      personProps: PERSON_PROP_OPTIONS[4].value,
      microLocation: MICRO_LOCATION_OPTIONS[2].value,
      wardrobeStyle: WARDROBE_STYLE_OPTIONS[2].value,
      personMood: PERSON_MOOD_OPTIONS[1].value,
    },
  },
  {
    label: 'Premium Retail',
    description: 'Boutique shelf, tote bag, confident mood.',
    settings: {
      personProps: PERSON_PROP_OPTIONS[5].value,
      microLocation: MICRO_LOCATION_OPTIONS[3].value,
      personMood: PERSON_MOOD_OPTIONS[2].value,
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
];

// 5-option version representing common human-view compositions.
export const PERSPECTIVE_OPTIONS: Option[] = [
  { label: 'Eye-Level', value: 'eye-level shot' },
  { label: 'POV', value: 'point-of-view (POV) from the user\'s perspective' },
  { label: 'High Angle', value: 'shot from a high angle, looking down' },
  { label: 'Low Angle', value: 'shot from a low angle, looking up' },
  { label: 'Close-Up', value: 'a detailed close-up on the product' },
];

export const ASPECT_RATIO_OPTIONS: Option[] = [
    { label: '16:9 (Widescreen)', value: '16:9' },
    { label: '9:16 (Vertical)', value: '9:16' },
    { label: '1:1 (Square)', value: '1:1' },
];

export const SELFIE_TYPE_OPTIONS: Option[] = [
  { label: 'None', value: 'none' },
  { label: 'Frontal Selfie', value: 'frontal selfie' },
  { label: 'From Below', value: 'selfie taken from below' },
  { label: 'From Above', value: 'selfie taken from above' },
  { label: 'Angled ¾', value: 'angled 3/4 selfie' },
  { label: 'Mirror Reflection', value: 'mirror reflection selfie' },
  { label: 'Hand-Holding Close-Up', value: 'close-up shot of a hand holding the product' },
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
