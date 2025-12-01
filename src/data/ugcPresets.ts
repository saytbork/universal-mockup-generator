export interface UGCCustomClothingPreset {
  id: string;
  label: string;
  prompt: string;
}

export interface UGCRealityPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export interface UGCHeroPersonaPreset {
  id: string;
  label: string;
  description: string;
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

export const UGC_REALITY_PRESETS: UGCRealityPreset[] = [
  {
    id: 'stressed-under-eye',
    label: 'stressed tired person with under-eye bags',
    description: 'Adds exhaustion cues and subtle eye puffiness.',
    prompt: 'Highlight visible under-eye bags, gentle swelling, and slightly puffy eyelids that communicate stress and tiredness.',
  },
  {
    id: 'messy-hair-lighting',
    label: 'messy hair, uneven lighting, natural skin texture',
    description: 'Gives messy hair, stray flyaways, and imperfect lighting falloff.',
    prompt: 'Render messy, imperfect hair with random flyaways and uneven lighting that exposes natural skin texture and pores.',
  },
  {
    id: 'blurry-smartphone',
    label: 'slightly blurry casual smartphone photo',
    description: 'Applies mild blur and handheld shake.',
    prompt: 'Add a slight handheld blur like a casual smartphone photo, embracing softness at the edges of the frame.',
  },
  {
    id: 'grainy-low-res',
    label: 'grainy low-res imperfect shot',
    description: 'Adds grain and imperfect details.',
    prompt: 'Overlay grain, pixel softness, and imperfect focus breathing so it feels like a low-resolution phone capture.',
  },
  {
    id: 'real-everyday',
    label: 'real everyday person, not a model, spontaneous moment',
    description: 'Grounds the shot in authenticity.',
    prompt: 'Keep the person looking like a real everyday individual—not a model—with spontaneous posture and natural flaws.',
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

export const UGC_HERO_PERSONA_PRESETS: UGCHeroPersonaPreset[] = [
  {
    id: 'calm-confident-wellness-woman',
    label: 'calm confident wellness woman age 40',
    description: 'Inspired by serene ritual moments with steady breathing and softness.',
    prompt: 'Persona notes: calm confident wellness woman around 40, mindful breathing energy, soft spa robe cues.',
  },
  {
    id: 'energetic-senior-lungs',
    label: 'energetic senior male for lung support',
    description: 'Reflects premium respiratory care storytelling.',
    prompt: 'Persona notes: energetic senior male seeking lung support, silver hair buzz cut, gentle smile, activewear, resilient posture.',
  },
  {
    id: 'tired-sinus-pressure',
    label: 'tired adult with sinus pressure expression (before look)',
    description: 'Before-look persona referencing gentle relief narratives.',
    prompt: 'Persona notes: adult with noticeable sinus pressure expression, red nose tip, tired watery eyes, seeking relief.',
  },
  {
    id: 'exhausted-before-relief',
    label: 'exhausted stressed adult before relief',
    description: 'Matches everyday vitality and wellness stories.',
    prompt: 'Persona notes: exhausted stressed adult before relief, slumped shoulders, visible tension lines, cardigan slipping off.',
  },
  {
    id: 'afro-latina-hair-journey',
    label: 'afro-latina woman hair vitamin journey',
    description: 'For Hair Vitamins hero content.',
    prompt: 'Persona notes: Afro-Latina woman mid hair vitamin journey, fluffy curls, satin bonnet nearby, excited to regrow strength.',
  },
  {
    id: 'busy-parent-low-energy',
    label: 'busy parent with low energy',
    description: 'Links to well-balanced habit stacks and grounded routines.',
    prompt: 'Persona notes: busy parent running on low energy, messy bun, hoodie layered over pajamas, kids toys blurred around.',
  },
  {
    id: 'respiratory-discomfort',
    label: 'everyday person with respiratory discomfort',
    description: 'Connects to SOOTHE and respiratory SKUs.',
    prompt: 'Persona notes: everyday person experiencing respiratory discomfort—shallow breath posture, hand resting on upper chest.',
  },
  {
    id: 'relief-moment',
    label: 'relief moment person after supplement',
    description: 'Captures an after-look moment with refreshed breathing and calm confidence.',
    prompt: 'Persona notes: relief moment after supplement, relaxed shoulders, serene expression, exhaling softly.',
  },
  {
    id: 'ugc-low-energy-individual',
    label: 'UGC low energy exhausted individual',
    description: 'General low-energy persona for diaries.',
    prompt: 'Persona notes: low-energy exhausted individual, slouched, neutral palette clothing, gentle authenticity with imperfections.',
  },
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
