export interface UGCCustomClothingPreset {
  id: string;
  label: string;
  prompt: string;
}

export interface UGCExpressionPreset {
  id: string;
  label: string;
  prompt: string;
}

export interface UGCCameraFramingOption {
  id: string;
  label: string;
  prompt: string;
}

export const UGC_REAL_MODE_BASE_PROMPT =
  'real UGC photo, not a model, everyday person, unposed, spontaneous moment, imperfect lighting, slightly blurry, grainy texture, low resolution feel, messy composition, raw smartphone photo aesthetic, casual imperfect framing';

export const UGC_CLOTHING_PRESETS: UGCCustomClothingPreset[] = [
  {
    id: 'tired-hoodie',
    label: 'tired hoodie with wrinkles',
    prompt: 'Dress them in an old, tired hoodie with visible creases and fabric wrinkles, like they just rolled off the couch.',
  },
  {
    id: 'oversized-sweater',
    label: 'oversized home sweater',
    prompt: 'Style the person with an oversized home sweater that looks cozy, slouchy, and slightly stretched at the cuffs.',
  },
  {
    id: 'messy-casual',
    label: 'messy casual outfit',
    prompt: 'Put them in a messy casual outfit with mismatched layers, untucked shirt hems, and relaxed fabrics.',
  },
  {
    id: 'loose-tshirt',
    label: 'loose imperfect t-shirt',
    prompt: 'Use a loose, imperfect t-shirt showing collar ripples and sleeve wrinkles as if it has been worn all day.',
  },
  {
    id: 'no-makeup-home',
    label: 'no-makeup natural home clothes',
    prompt: 'Keep their outfit to simple, no-makeup home clothes—soft tank, sweatpants, barefoot energy.',
  },
];

export const UGC_EXPRESSION_PRESETS: UGCExpressionPreset[] = [
  { id: 'tired-eye-bags', label: 'tired with eye bags', prompt: 'Facial expression should show exhaustion with gentle eye bags and drooping eyelids.' },
  { id: 'emotionally-drained', label: 'emotionally drained', prompt: 'Capture an emotionally drained look—soft mouth, almost blank stare, plenty of vulnerability.' },
  { id: 'messy-unposed', label: 'messy unposed expression', prompt: 'Expression should feel messy and unposed, mouth slightly open like they were caught mid-sentence.' },
  { id: 'stressed-overwhelmed', label: 'stressed overwhelmed face', prompt: 'Eyes tight, brows knit inward, and subtle forehead lines to show stressed overwhelm.' },
  { id: 'distracted-moment', label: 'distracted natural moment', prompt: 'Let them look slightly off to the side, distracted by something else in the room.' },
  { id: 'unfocused-casual', label: 'slightly unfocused casual look', prompt: 'Let their gaze be slightly unfocused, as if staring past the camera casually.' },
  { id: 'fatigued-low-energy', label: 'fatigued low-energy expression', prompt: 'Give them a soft, fatigued expression with relaxed jaw and heavy cheeks, like low energy is catching up.' },
];

export const UGC_OFF_CENTER_OPTIONS: UGCCameraFramingOption[] = [
  { id: 'left-heavy', label: 'Off-center left heavy', prompt: 'Frame the subject off-center leaning heavily toward the left third of the canvas.' },
  { id: 'right-heavy', label: 'Off-center right heavy', prompt: 'Push the subject to the right third with negative space on the left for messy context.' },
  { id: 'center-loose', label: 'Loose center (default)', prompt: 'Keep them loosely centered but allow asymmetry in the room tone.' },
];

export const UGC_SPONTANEOUS_FRAMING_OPTIONS: UGCCameraFramingOption[] = [
  { id: 'arm-length', label: "Arm's length selfie", prompt: "Use an arm's length selfie framing with the phone slightly above eye level." },
  { id: 'mirror', label: 'Mirror snap', prompt: 'Frame as a mirror snap, phone covering part of the face, reflections slightly warped.' },
  { id: 'tilted-phone', label: 'Tilted phone angle', prompt: 'Tilt the phone diagonally so horizons are a touch crooked like a quick capture.' },
  { id: 'couch-slump', label: 'Couch slump POV', prompt: 'Shoot from a couch slump POV with the phone angled downward toward their lap.' },
];
