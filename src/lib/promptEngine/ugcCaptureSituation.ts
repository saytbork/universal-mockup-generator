export type UGCCaptureSituationId =
  | 'lying-bed-phone-above-face'
  | 'lying-bed-phone-too-close'
  | 'phone-resting-on-chest'
  | 'walking-handheld-motion'
  | 'standing-slight-handshake'
  | 'sitting-casually-tilted'
  | 'mirror-shot-partial'
  | 'bathroom-selfie-overhead'
  | 'car-interior-awkward'
  | 'over-the-shoulder-obstructed'
  | 'face-partial-cutoff'
  | 'finger-invading-lens'
  | 'phone-too-low-chin'
  | 'phone-too-high-forehead'
  | 'accidental-off-center';

export interface UGCCaptureSituationOption {
  id: UGCCaptureSituationId;
  label: string;
}

export const UGCCaptureSituationOptions: UGCCaptureSituationOption[] = [
  { id: 'lying-bed-phone-above-face', label: 'Lying in bed, phone above face' },
  { id: 'lying-bed-phone-too-close', label: 'Lying in bed, phone too close' },
  { id: 'phone-resting-on-chest', label: 'Phone resting on chest' },
  { id: 'walking-handheld-motion', label: 'Walking, handheld motion' },
  { id: 'standing-slight-handshake', label: 'Standing still, slight hand shake' },
  { id: 'sitting-casually-tilted', label: 'Sitting casually, phone tilted' },
  { id: 'mirror-shot-partial', label: 'Mirror shot, partial reflection' },
  { id: 'bathroom-selfie-overhead', label: 'Bathroom selfie, harsh overhead light' },
  { id: 'car-interior-awkward', label: 'Car interior, awkward angle' },
  { id: 'over-the-shoulder-obstructed', label: 'Over-the-shoulder, arm blocking frame' },
  { id: 'face-partial-cutoff', label: 'Face partially cut off' },
  { id: 'finger-invading-lens', label: 'Finger invading lens' },
  { id: 'phone-too-low-chin', label: 'Phone too low, chin dominant' },
  { id: 'phone-too-high-forehead', label: 'Phone too high, forehead dominant' },
  { id: 'accidental-off-center', label: 'Accidental framing, subject off-center' }
];

const UGCCaptureSituationText: Record<UGCCaptureSituationId, string> = {
  'lying-bed-phone-above-face': `UGC capture situation: Lying in bed, phone above face. Subject reclines on soft pillows, shoulders curling toward the mattress. Camera obeys the head, hanging just above the forehead. Phone is held loosely by both hands, so it drifts toward the headboard. Temples and chin creep into the frame while the top border closes in. Crop risk is high and focus wobble feels inevitable.`,
  'lying-bed-phone-too-close': `UGC capture situation: Lying in bed, phone too close. Subject is flattened against the pillow with eyes barely open. Camera obeys the mouth, pressed tight to the bridge of the nose. The phone breathes on skin, causing lens haze and nose cover. Lips and hair invade the frame while the forehead disappears. This tight proximity spikes crop and focus failure chances.`,
  'phone-resting-on-chest': `UGC capture situation: Phone resting on chest. Subject sits upright, collarbones acting as the workstation. Camera obeys the sternum, tilting as the phone rides the torso. Breathing nudges the device so the chin drifts upward and the upper edge wobbles. Shoulders and collarbones slice into the frame while the torso tries to stay centered. Crop risk is high and focus keeps chasing the movement.`,
  'walking-handheld-motion': `UGC capture situation: Walking, handheld motion. Subject strides sideways, arm swinging with each footfall. Camera obeys the legs, tilting to keep pace with the gait. Footfalls bounce light across the glass and the lens trails behind the torso. Motion blur stretches the cheek and the wrist slams the border. Crop risk is moderate and focus smears with every step.`,
  'standing-slight-handshake': `UGC capture situation: Standing still, slight hand shake. Subject holds the phone at arm's length with a tired grip, shoulders tensing. Camera obeys the elbow tremor, making the frame dip toward one shoulder. The phone sways, so the shot tilts and the background climbs over the chin. Nose and wrist nudge the edges while the arms fan into view. Crop risk grows as the axis leans and focus struggles to settle.`,
  'sitting-casually-tilted': `UGC capture situation: Sitting casually, phone tilted. Subject lounges with knees apart, phone angled from hip level. Camera obeys the body tilt so the frame leans toward the floor. The phone drifts, bouncing the chin into the lower border while the legs stay wide. Kneecaps and hip bones press against the edges, creating a diagonal slice. Crop risk is high and focus prefers the thighs over the face.`,
  'mirror-shot-partial': `UGC capture situation: Mirror shot, partial reflection. Subject leans toward the mirror, shoulders framing their own reflection. Camera obeys the glass, trapping the phone between mirror and body. Reflections double the frame while the edge of the mirror clips the cheek. Fingers and forearms sneak into view as the subject repositions. Crop risk climbs along the mirror frame and focus fights smudges.`,
  'bathroom-selfie-overhead': `UGC capture situation: Bathroom selfie, harsh overhead light. Subject stands hunched over the sink, eyes searching the phone display. Camera obeys the ceiling, casting hard light across forehead and nose. The phone drifts down, so the center of the frame is upper chest and wash of light. Hair and the towel bar invade while the background bleeds. Crop risk is moderate and focus keeps hunting for the face.`,
  'car-interior-awkward': `UGC capture situation: Car interior, awkward angle. Subject sits in the passenger seat, phone near the center console. Camera obeys the seatbelt, tilting the shot across the dashboard. Reflections on the window and the steering wheel clip the frame. Shoulder and window trim invade while the forehead scrambles to stay centered. Crop risk rises and focus battles low light.`,
  'over-the-shoulder-obstructed': `UGC capture situation: Over-the-shoulder, arm blocking frame. Subject turns away, back toward the camera with one arm crossing the view. Camera obeys the shoulder twist, peeking above the arm. The phone slips behind the shoulder so the product or face vanishes. Arm, elbow, and hair strand invade the lens. Crop risk is high and focus lags behind the obstruction.`,
  'face-partial-cutoff': `UGC capture situation: Face partially cut off. Subject leans half out of frame, only half the cheek visible. Camera obeys the body tilt, so the face sits on the edge. The phone drifts, snipping the jawline and forehead. Ear and hairline threaten to exit while the chin stays in. Crop risk is severe and focus hovers between the visible elements.`,
  'finger-invading-lens': `UGC capture situation: Finger invading lens. Subject grips the phone with fingers curling toward the glass. Camera obeys the fingertip, so the field of view is marred by the pad. The phone shifts as the finger brushes the frame, cropping the lower face. Knuckles and nail edges steal space while the nose fights for light. Crop risk spikes and focus stutters whenever the finger moves.`,
  'phone-too-low-chin': `UGC capture situation: Phone too low, chin dominant. Subject lifts the chin while the phone rests on a low surface. Camera obeys the chin, pushing the jaw into the upper border. The phone slices off the forehead leaving the sternum prominent. Chin, neck, and collarbone dominate while the rest vanishes. Crop risk is high and focus drifts toward the jaw.`,
  'phone-too-high-forehead': `UGC capture situation: Phone too high, forehead dominant. Subject tilts the head back while the phone hovers above. Camera obeys the forehead, so the chin retreats from the frame. The phone keeps sliding forward, so only scalp, forehead, and brows remain. Eyebrows and hairline invade the top edge while the mouth disappears. Crop risk climbs and focus fixates on the brow ridge.`,
  'accidental-off-center': `UGC capture situation: Accidental framing, subject off-center. Subject carries the phone late, so the body sits at the very edge. Camera obeys the shoulder, aligning the frame along the border. The phone drifts outward, cutting the body in half. Shoulder, arm, and ear kiss the frame's edge while the lens chases stability. Crop risk is extreme and focus never settles.`
};

export function buildUGCCaptureSituationText(situationId: UGCCaptureSituationId): string {
  const text = UGCCaptureSituationText[situationId];
  if (!text) {
    throw new Error(`Missing capture situation definition for "${situationId}".`);
  }
  return text;
}
