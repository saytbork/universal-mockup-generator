import type { StudioUIState } from '../types/studioTypes.ts';

/**
 * Physical Presence + Interaction builder for the V2 studio engine.
 *
 * Reads `state.interaction` and emits a coherent photographic constraint
 * block. Covers three real-world scenarios:
 *   - none        → product-only frame, no limbs
 *   - surface     → same as none (product resting on surface)
 *   - holding     → single-hand cradle / wrap
 *   - two-hand-hold → both hands visible, product between
 *   - presenting  → one or two hands raising/extending product toward camera
 *   - applying    → fingertip/palm contact with product skin-side
 *   - capsule-display → cupped palm with capsules/pills
 *   - framed-presentation → product framed by hands, editorial
 */

const INTERACTION_FRAGMENTS: Record<string, string[]> = {
  none: [
    'PHYSICAL_PRESENCE: surface.',
    'INTERACTION_PROFILE: none.',
    'No limbs in frame. No fingers. No skin contact. No shadows implying grip or hold.',
    'Product rests on surface under gravity. Contact shadow present and physically coherent.',
  ],
  surface: [
    'PHYSICAL_PRESENCE: surface.',
    'INTERACTION_PROFILE: none.',
    'No limbs in frame. No fingers. No skin contact.',
    'Product rests on surface under gravity. Contact shadow present and physically coherent.',
  ],
  holding: [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: single-grip.',
    'One set of fingers wraps the container naturally — thumb on one side, fingers opposite.',
    'Grip posture must obey real-world ergonomics: no hyper-extended joints, no floating digits.',
    'Only one interaction set visible. No additional limbs in frame.',
    'Product label and cap must remain fully readable within the grip composition.',
  ],
  'supported-hold': [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: supported-hold.',
    'One hand supports the product from below in a relaxed open-palm support posture.',
    'No tight grip. Fingers relaxed, product centered on palm.',
    'No additional limbs in frame.',
  ],
  'two-hand-hold': [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: two-hand-hold.',
    'Both hands hold the product simultaneously — one on each side or one top and one bottom.',
    'Both grip postures must obey real-world ergonomics.',
    'Product centered between the two contact points.',
    'No additional limbs beyond these two sets of hands.',
    'Product label must remain readable despite the grip coverage.',
  ],
  presenting: [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: presenting.',
    'One or both hands extend the product forward toward camera with a deliberate display posture.',
    'Wrist and arm angle implies intentional product showcase.',
    'Fingers flat or gently curved behind product — not wrapping it.',
    'No additional limbs beyond the presenting hands.',
    'Product must be the visual focal point, fully legible.',
  ],
  'framed-presentation': [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: framed-presentation.',
    'Two hands frame the product without fully gripping — palms form a soft cradle or bookend.',
    'Product is elevated, centered in the frame created by the hands.',
    'Minimal occlusion of label or product face.',
    'Editorial posture: controlled, intentional, clean energy.',
  ],
  applying: [
    'PHYSICAL_PRESENCE: contact.',
    'INTERACTION_PROFILE: applying.',
    'One or two fingers or palm is in direct skin-to-product contact, as if dispensing or spreading.',
    'Physical contact must be visually plausible — fingers press slightly against the product surface.',
    'No tight wrapping grip. Contact area only.',
    'Product must remain recognizable and label readable where not in contact with fingertips.',
  ],
  'applying-opening': [
    'PHYSICAL_PRESENCE: contact.',
    'INTERACTION_PROFILE: applying-opening.',
    'One hand grips cap or pump — other hand stabilizes the container.',
    'Wrist posture implies active dispensing or opening action.',
    'Product must remain recognizable and both cap region and label visible.',
  ],
  'capsule-display': [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: capsule-display.',
    'An open cupped palm holds 2–4 loose capsules or pills.',
    'Capsules rest naturally in the center of the palm.',
    'Palm is oriented upward, slightly tilted toward camera for product legibility.',
    'No other product container in the same shot unless explicitly intended.',
  ],
  cheers: [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: cheers.',
    'Two containers held by two separate sets of hands, angled slightly inward as if toasting.',
    'Light contact or near-contact between containers.',
    'Both containers must remain upright and label-readable.',
    'No additional limbs beyond the two holding sets.',
  ],
  'passive-presence': [
    'PHYSICAL_PRESENCE: surface.',
    'INTERACTION_PROFILE: passive.',
    'Product rests passively. Limbs may be present in background but do not interact with product.',
    'Product must remain the dominant visual element with clear separation from any background limbs.',
  ],
  'cropped-hand': [
    'PHYSICAL_PRESENCE: held.',
    'INTERACTION_PROFILE: cropped-hold.',
    'A partially cropped hand enters frame from edge — only fingers or wrist visible.',
    'Product held naturally. Crop point is compositionally intentional.',
    'One cropped contact point only.',
  ],
  'resting-interaction': [
    'PHYSICAL_PRESENCE: surface.',
    'INTERACTION_PROFILE: resting.',
    'Product rests on surface. A hand or fingers may rest nearby without directly gripping.',
    'No active grip. Soft incidental contact or proximity only.',
  ],
};

const FALLBACK_FRAGMENT = [
  'PHYSICAL_PRESENCE: surface.',
  'INTERACTION_PROFILE: none.',
  'No limbs in frame. Product rests on surface under gravity.',
];

/**
 * Returns the INTERACTION_PROFILE + PHYSICAL_PRESENCE block for the V2 prompt.
 * Returns empty string when interaction is 'none' or undefined (surface-only shot).
 * For wine profiles, always returns '' (wine engine controls its own scene).
 */
export function buildInteraction(_authority: unknown, state?: StudioUIState): string {
  // Wine engine controls its own scene composition — skip interaction layer entirely.
  if (state?.winePrestigeMode) return '';

  const raw = String(state?.interaction || '').trim().toLowerCase();

  // Surface/none → emit the no-hands guardrail
  if (!raw || raw === 'none' || raw === 'surface') {
    return INTERACTION_FRAGMENTS['none'].join(' ');
  }

  const lines = INTERACTION_FRAGMENTS[raw] ?? FALLBACK_FRAGMENT;
  return lines.join(' ');
}
