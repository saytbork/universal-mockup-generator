export type UGCCaptureCategory = 'body' | 'motion' | 'framing' | 'context';

export type UGCCaptureSituationId =
  | 'lying-bed-phone-above-face'
  | 'phone-resting-on-chest'
  | 'phone-too-low-chin'
  | 'phone-too-high-forehead'
  | 'walking-handheld-motion'
  | 'standing-slight-handshake'
  | 'sitting-casually-tilted'
  | 'face-partial-cutoff'
  | 'finger-invading-lens'
  | 'accidental-off-center'
  | 'over-the-shoulder-obstructed'
  | 'mirror-shot-partial'
  | 'bathroom-selfie-overhead'
  | 'car-interior-awkward';

export interface UGCCaptureSituationOption {
  id: UGCCaptureSituationId;
  label: string;
  category: UGCCaptureCategory;
}

export const UGCCaptureSituationOptions: UGCCaptureSituationOption[] = [
  { id: 'lying-bed-phone-above-face', label: 'Lying in bed, phone above face', category: 'body' },
  { id: 'phone-resting-on-chest', label: 'Phone resting on chest', category: 'body' },
  { id: 'phone-too-low-chin', label: 'Phone too low, chin dominant', category: 'body' },
  { id: 'phone-too-high-forehead', label: 'Phone too high, forehead dominant', category: 'body' },
  { id: 'walking-handheld-motion', label: 'Walking, handheld motion', category: 'motion' },
  { id: 'standing-slight-handshake', label: 'Standing still, slight hand shake', category: 'motion' },
  { id: 'sitting-casually-tilted', label: 'Sitting casually, phone tilted', category: 'motion' },
  { id: 'face-partial-cutoff', label: 'Face partially cut off', category: 'framing' },
  { id: 'finger-invading-lens', label: 'Finger invading frame', category: 'framing' },
  { id: 'accidental-off-center', label: 'Accidental framing, subject off-center', category: 'framing' },
  { id: 'over-the-shoulder-obstructed', label: 'Over-the-shoulder, arm blocking frame', category: 'framing' },
  { id: 'mirror-shot-partial', label: 'Mirror shot, partial reflection', category: 'context' },
  { id: 'bathroom-selfie-overhead', label: 'Bathroom selfie, harsh overhead light', category: 'context' },
  { id: 'car-interior-awkward', label: 'Car interior, awkward angle', category: 'context' }
];

const UGCCaptureSituationText: Record<UGCCaptureSituationId, string> = {
  'lying-bed-phone-above-face': `UGC capture situation: Lying in bed, phone above face. Subject reclines on soft pillows, shoulders curling toward the mattress. Camera obeys the head, hanging just above the forehead. Phone is held in one hand above the face, the device itself remains off-frame. The free hand lifts the product toward the chin while keeping the arm cropped. Temples and chin creep into the frame while the top border closes in. Crop risk is high and clarity wobbles with the handheld angle.`,
  'phone-resting-on-chest': `UGC capture situation: Phone resting on chest. Subject sits upright, collarbones acting as the workstation. Camera obeys the sternum, tilting as the phone rides the torso. Breathing nudges the device so the chin drifts upward and the upper edge wobbles. Shoulders and collarbones slice into the frame while the torso tries to stay centered. Crop risk is high and clarity shifts with the movement.`,
  'phone-too-low-chin': `UGC capture situation: Phone too low, chin dominant. Subject lifts the chin while the phone rests on a low surface. Camera obeys the chin, pushing the jaw into the upper border. The phone slices off the forehead leaving the sternum prominent. Chin, neck, and collarbone dominate while the rest vanishes. Crop risk is high and details drift toward the jaw.`,
  'phone-too-high-forehead': `UGC capture situation: Phone too high, forehead dominant. Subject tilts the head back while the phone hovers above. Camera obeys the forehead, so the chin retreats from the frame. The phone keeps sliding forward, so only scalp, forehead, and brows remain. Eyebrows and hairline invade the top edge while the mouth disappears. Crop risk climbs and detail drifts toward the brow ridge.`,
  'walking-handheld-motion': `UGC capture situation: Walking, handheld motion. Subject strides sideways, arm swinging with each footfall. Camera obeys the legs, tilting to keep pace with the gait. Footfalls bounce light across the glass and the frame trails behind the torso. Motion blur stretches the cheek and the wrist slams the border. Crop risk is moderate and details smear with every step.`,
  'standing-slight-handshake': `UGC capture situation: Standing still, slight hand shake. Subject holds the phone at arm's length with a tired grip, shoulders tensing. Camera obeys the elbow tremor, making the frame dip toward one shoulder. The phone sways, so the shot tilts and the background climbs over the chin. Nose and wrist nudge the edges while the arms fan into view. Crop risk grows as the axis leans and clarity never fully settles.`,
  'sitting-casually-tilted': `UGC capture situation: Sitting casually, phone tilted. Subject lounges with knees apart, phone angled from hip level. Camera obeys the posture tilt so the frame leans toward the floor. The phone drifts, bouncing the chin into the lower border while the legs stay wide. Kneecaps and hip bones press against the edges, creating a diagonal slice. Crop risk is high and clarity favors the thighs over the face.`,
  'face-partial-cutoff': `UGC capture situation: Face partially cut off. Subject leans half out of frame, only half the cheek visible. Camera obeys the posture tilt, so the face sits on the edge. The phone drifts, snipping the jawline and forehead. Ear and hairline threaten to exit while the chin stays in. Crop risk is severe and clarity hovers between the visible elements.`,
  'finger-invading-lens': `UGC capture situation: Finger invading frame. Subject grips the phone with fingers curling toward the glass. Camera obeys the fingertip, so the view is partially blocked by the pad. The phone shifts as the finger brushes the frame, cropping the lower face. Knuckles and nail edges steal space while the nose fights for light. Crop risk spikes and details stutter whenever the finger moves.`,
  'accidental-off-center': `UGC capture situation: Accidental framing, subject off-center. Subject carries the phone late, so the torso sits at the very edge. Camera obeys the shoulder, aligning the frame along the border. The phone drifts outward, cutting the torso in half. Shoulder, arm, and ear kiss the frame's edge while the view chases stability. Crop risk is extreme and clarity never settles.`,
  'over-the-shoulder-obstructed': `UGC capture situation: Over-the-shoulder, arm blocking frame. Subject turns away, back toward the camera with one arm crossing the view. Camera obeys the shoulder twist, peeking above the arm. The phone slips behind the shoulder so the product or face vanishes. Arm, elbow, and hair strand invade the frame. Crop risk is high and clarity lags behind the obstruction.`,
  'mirror-shot-partial': `UGC capture situation: Mirror shot, partial reflection. Subject leans toward the mirror, shoulders framing their own reflection. Camera obeys the glass, trapping the phone between mirror and torso. Reflections double the frame while the edge of the mirror clips the cheek. Fingers and forearms sneak into view as the subject repositions. Crop risk climbs along the mirror frame and details fight smudges.`,
  'bathroom-selfie-overhead': `UGC capture situation: Bathroom selfie, harsh overhead light. Subject stands hunched over the sink, eyes searching the phone display. Camera obeys the ceiling, casting hard light across forehead and nose. The phone drifts down, so the center of the frame is upper chest and wash of light. Hair and the towel bar invade while the background bleeds. Crop risk is moderate and details keep hunting for the face.`,
  'car-interior-awkward': `UGC capture situation: Car interior, awkward angle. Subject sits in the passenger seat, phone near the center console. Camera obeys the seatbelt, tilting the shot across the dashboard. Reflections on the window and the steering wheel clip the frame. Shoulder and window trim invade while the forehead scrambles to stay centered. Crop risk rises and details struggle in low light.`
};

export function buildUGCCaptureSituationText(situationId: UGCCaptureSituationId): string {
  const text = UGCCaptureSituationText[situationId];
  if (!text) {
    throw new Error(`Missing capture situation definition for "${situationId}".`);
  }
  return text;
}

export const UGC_CAPTURE_BASE_SENTENCE =
  'Casual handheld smartphone capture with imperfect framing, natural person mistakes, non-staged, real-world selfie behavior.';

const UGC_CAPTURE_LAYER_SENTENCES: Record<UGCCaptureSituationId, { category: UGCCaptureCategory; sentence: string }> = {
  'lying-bed-phone-above-face': {
    category: 'body',
    sentence: 'The person is lying in bed, holding the phone above their face.',
  },
  'phone-resting-on-chest': {
    category: 'body',
    sentence: 'The phone rests loosely on the person’s chest while recording.',
  },
  'phone-too-low-chin': {
    category: 'body',
    sentence: 'The phone is held too low, making the chin more prominent.',
  },
  'phone-too-high-forehead': {
    category: 'body',
    sentence: 'The phone is held too high, emphasizing the forehead.',
  },
  'walking-handheld-motion': {
    category: 'motion',
    sentence: 'The person is walking while recording, causing natural handheld motion.',
  },
  'standing-slight-handshake': {
    category: 'motion',
    sentence: 'The person is standing still with slight natural hand shake.',
  },
  'sitting-casually-tilted': {
    category: 'motion',
    sentence: 'The person is sitting casually, with the phone slightly tilted.',
  },
  'face-partial-cutoff': {
    category: 'framing',
    sentence: 'Part of the face is unintentionally cut off by the frame.',
  },
  'finger-invading-lens': {
    category: 'framing',
    sentence: 'A finger from the phone-holding hand partially invades the frame while the opposite hand holds the product.',
  },
  'accidental-off-center': {
    category: 'framing',
    sentence: 'The subject is accidentally off-center.',
  },
  'over-the-shoulder-obstructed': {
    category: 'framing',
    sentence: 'An arm partially blocks the frame over the shoulder.',
  },
  'mirror-shot-partial': {
    category: 'context',
    sentence: 'The shot is taken in a mirror with a partial reflection visible.',
  },
  'bathroom-selfie-overhead': {
    category: 'context',
    sentence: 'The selfie is taken in a bathroom under harsh overhead lighting.',
  },
  'car-interior-awkward': {
    category: 'context',
    sentence: 'The shot is taken inside a car at an awkward angle.',
  },
};

export function buildUGCCaptureLayerSentences(
  situationId?: UGCCaptureSituationId
): string[] {
  if (!situationId) {
    return [];
  }
  const entry = UGC_CAPTURE_LAYER_SENTENCES[situationId];
  if (!entry) {
    return [];
  }
  return [entry.sentence];
}
