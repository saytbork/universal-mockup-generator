export type PromptValidationResult = {
  ok: boolean;
  errors: string[];
};

const normalizePromptText = (prompt: string): string =>
  String(prompt || '')
    .replace(/,\s*\./g, '.')
    .replace(/\.\s*,/g, '. ')
    .replace(/,\s*,/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();

function dedupePromptText(prompt: string): string {
  return prompt
    .replace(/(Physics coherence adjustment applied\.)+/g, 'Physics coherence adjustment applied.')
    .replace(
      /(Clinical softbox lighting with clean reflections and neutral color\.\s*){2,}/g,
      'Clinical softbox lighting with clean reflections and neutral color. '
    )
    .replace(/(VISUAL INTENT:[^.]+\.)(?:\s*\1)+/g, '$1')
    .replace(/(PRODUCT_STATE_MOTION:[^.]+\.)(?:\s*\1)+/g, '$1')
    .replace(/(COMPOSITION AUTHORITY:[^.]+\.)(?:\s*\1)+/g, '$1')
    .replace(/(LIGHTING AUTHORITY:[^.]+\.)(?:\s*\1)+/g, '$1')
    .replace(/(SPLASH_PHYSICS_MODEL:[\s\S]*?Environmental Boundaries:[^.]+\.)\s*(?:\1)+/g, '$1');
}

export function validatePromptConsistency(prompt: string): PromptValidationResult {
  const errors: string[] = [];

  const visualIntentCount = (prompt.match(/VISUAL INTENT:/g) || []).length;
  if (visualIntentCount > 1) errors.push('Duplicate VISUAL INTENT lines detected.');

  const motionBlocks = (prompt.match(/PRODUCT_STATE_MOTION:/g) || []).length;
  if (motionBlocks > 1) errors.push('Multiple PRODUCT_STATE_MOTION blocks detected.');

  const lightingBlocks = (prompt.match(/LIGHTING AUTHORITY:/g) || []).length;
  if (lightingBlocks > 1) errors.push('Multiple LIGHTING AUTHORITY blocks detected.');
  const splashPhysicsBlocks = (prompt.match(/SPLASH_PHYSICS_MODEL:/g) || []).length;
  if (splashPhysicsBlocks > 1) errors.push('Multiple SPLASH_PHYSICS_MODEL blocks detected.');

  if (/PRODUCT_STATE_MOTION:\s*static\./i.test(prompt) && /PRODUCT_STATE_MOTION:\s*(falling|pouring|spilled|dispensed)\./i.test(prompt)) {
    errors.push('Contradictory motion blocks detected: static and dynamic states co-exist.');
  }

  if (/natural directional sunlight/i.test(prompt) && /clinical softbox/i.test(prompt) && /LIGHTING AUTHORITY:/i.test(prompt)) {
    errors.push('Contradictory lighting authority detected: sunlight and clinical softbox co-exist.');
  }

  if (/controlled horizontal environmental spread/i.test(prompt) && /allow vertical subject dominance\./i.test(prompt)) {
    errors.push('Contradictory composition rules detected: horizontal spread and vertical-dominance exception co-exist.');
  }

  const splashContext = /(splash|foam|pool water|underwater)/i.test(prompt);
  const hasSplashPhysics = /SPLASH_PHYSICS_MODEL:/i.test(prompt);
  const isClinicalIntent = /VISUAL INTENT:\s*Clinical/i.test(prompt);
  if (splashContext && /PRODUCT_STATE_MOTION:\s*(pouring|falling|spilled|dispensed)\./i.test(prompt) && !hasSplashPhysics && !isClinicalIntent) {
    errors.push('Splash motion is active without SPLASH_PHYSICS_MODEL authority.');
  }
  if (!splashContext && hasSplashPhysics) {
    errors.push('SPLASH_PHYSICS_MODEL present outside splash context.');
  }

  const bannedSplashPhrases = [
    /Allow crossing splash arcs/i,
    /irregular foam shapes/i,
    /wind interaction/i,
    /environment-driven motion/i,
    /directional splash sheet with high-speed droplet separation/i,
  ];
  for (const phrase of bannedSplashPhrases) {
    if (phrase.test(prompt)) {
      errors.push(`Ambiguous splash phrase detected: ${phrase}`);
    }
  }

  if (errors.length > 0) {
    console.error('[PROMPT_VALIDATION] FAIL', {
      errors,
      sample: prompt.slice(0, 420),
    });
  }

  return { ok: errors.length === 0, errors };
}

export function assemblePrompt(parts: Array<string | undefined | null>): { prompt: string; validation: PromptValidationResult } {
  const assembled = normalizePromptText(parts.filter(Boolean).join(' '));
  const deduped = dedupePromptText(assembled);
  const validation = validatePromptConsistency(deduped);
  return {
    prompt: deduped,
    validation,
  };
}
