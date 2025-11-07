
import { Option } from './types';

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
];

export const AGE_GROUP_OPTIONS: Option[] = [
  { label: '18-25', value: '18-25' },
  { label: '26-35', value: '26-35' },
  { label: '36-45', value: '36-45' },
  { label: '46-60', value: '46-60' },
  { label: '60+', value: '60+' },
  { label: 'No Person', value: 'no person' },
];

// Concise 3-option version (Regular, Well-Groomed, Styled).
export const PERSON_APPEARANCE_OPTIONS: Option[] = [
  { label: 'Regular', value: 'a regular, everyday appearance' },
  { label: 'Well-Groomed', value: 'a well-groomed, put-together appearance' },
  { label: 'Styled', value: 'a trendy, styled, influencer-like appearance' },
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

export const GENDER_OPTIONS: Option[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
];

// Essential 5-option set representing true UGC shooting styles.
export const CAMERA_OPTIONS: Option[] = [
  { label: 'Smartphone', value: 'shot on a modern smartphone' },
  { label: 'Selfie Cam', value: 'shot on a front-facing selfie camera' },
  { label: 'DSLR/Mirrorless', value: 'shot on a professional DSLR/Mirrorless camera with a shallow depth of field' },
  { label: 'Webcam', value: 'shot on a laptop webcam' },
  { label: 'Point & Shoot', value: 'shot on a digital point-and-shoot camera, flash aesthetic' },
];

export const ISO_OPTIONS: Option[] = [
  { label: '100', value: 'ISO 100, no noise, very clean' },
  { label: '200', value: 'ISO 200, clean with great detail' },
  { label: '400', value: 'ISO 400, slight grain, very natural' },
  { label: '800', value: 'ISO 800, noticeable grain, good for low light' },
  { label: '1600', value: 'ISO 1600, prominent grain, documentary style' },
  { label: '3200', value: 'ISO 3200, heavy grain, artistic low light style' },
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
