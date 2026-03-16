import type { StudioUIState } from '../types/studioTypes';

function resolvePhysicalPresence(state?: StudioUIState): string {
  const explicit = String(state?.physicalPresence || '').trim().toLowerCase();
  if (explicit) return explicit;

  const placement = String(state?.physicalPlacement || '').trim().toLowerCase();
  if (placement === 'held') return 'held';
  if (placement === 'air-suspended') return 'suspended';
  if (placement === 'supported') return 'supported';
  return 'surface';
}

function resolvePlacementContext(state?: StudioUIState): string {
  const explicit = String(state?.placementContext || '').trim();
  if (explicit) return explicit;

  const placement = String(state?.physicalPlacement || '').trim().toLowerCase();
  if (placement === 'held') return 'hand-supported hold with natural ergonomic contact';
  if (placement === 'air-suspended') return 'air-suspended placement with no base contact';
  if (placement === 'supported') return 'supported lean or prop contact on a stable base';
  return 'grounded base contact on a stable surface';
}

function resolveGroundingMode(state?: StudioUIState): string {
  const explicit = String(state?.groundingMode || '').trim().toLowerCase();
  if (explicit) return explicit;

  const presence = resolvePhysicalPresence(state);
  if (presence === 'suspended') return 'controlled-floating';
  if (presence === 'held') return 'hand-grounded';
  return 'surface-grounded';
}

function resolveSurfaceType(state?: StudioUIState): string {
  return String(state?.physicalSurfaceType || '').trim();
}

export function buildPhysicalPresence(state?: StudioUIState): string {
  const presence = resolvePhysicalPresence(state);
  const context = resolvePlacementContext(state);
  const grounding = resolveGroundingMode(state);
  const surfaceType = resolveSurfaceType(state);
  const surfaceRule =
    (presence === 'surface' || presence === 'supported') && surfaceType && surfaceType !== 'None'
      ? surfaceType === 'Wood'
        ? 'SUPPORT_SURFACE: grounded on a continuous warm natural wood surface plane with visible fine grain and believable tactile realism. No pedestal or separate base object.'
        : surfaceType === 'Stone'
          ? 'SUPPORT_SURFACE: grounded on a continuous rigid natural stone surface plane with mineral grain, dense cool material behavior, and crisp base contact. No pedestal, no separate slab object, no textile weave, no felt, no carpet pile, and no soft fabric reading.'
          : surfaceType === 'Marble'
            ? 'SUPPORT_SURFACE: grounded on a continuous polished marble surface plane with restrained veining, controlled reflectance, and premium base realism. No pedestal or separate marble block.'
            : ''
      : '';

  return [
    `PHYSICAL_PRESENCE: ${presence}.`,
    `PHYSICAL_PLACEMENT_CONTEXT: ${context}.`,
    `GROUNDING_MODE: ${grounding}.`,
    surfaceRule,
  ].join(' ');
}
