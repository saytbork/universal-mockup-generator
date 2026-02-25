
// winePromptHelpers.ts

export function buildColorLock(color: string): string {
  return `COLOR_LOCK: ${color} wine. No reinterpretation allowed.`;
}

export function buildClosureLock(
  closure: string,
  isOpen: boolean
): string {
  if (isOpen) {
    return `CLOSURE_LOCK: ${closure}. Bottle open. Detached closure must be visible on surface.`;
  }

  return `CLOSURE_LOCK: ${closure}. Bottle sealed. Closure attached.`;
}

export function buildVolumeLock(): string {
  return 'VOLUME_LOCK: Bottle liquid level must be visibly reduced and consistent with glass volume.';
}

export function buildCarbonationLock(): string {
  return 'CARBONATION_LOCK: Subtle realistic micro-bubbles only. No chaos.';
}

