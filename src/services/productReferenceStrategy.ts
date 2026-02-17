// src/services/productReferenceStrategy.ts

export type ReferenceStrategy = 'full' | 'prompt-only' | 'conditional';

/**
 * Determina si debemos enviar las imágenes de referencia del producto al modelo
 * o confiar únicamente en la descripción del prompt.
 * 
 * Contexto del problema:
 * - Cuando enviamos imagen de producto vertical + solicitamos aspect ratio horizontal
 * - El modelo genera letterboxing/pillarboxing para hacer fit
 * - En Studio/Lifestyle los prompts son tan detallados que no necesitan la referencia visual
 */
export function determineProductReferenceStrategy(
  sceneType: string,
  visualIntent: string,
  hasProducts: boolean,
  aspectRatio: string
): ReferenceStrategy {
  
  if (!hasProducts) return 'full';
  
  // STUDIO MODE: El prompt describe el producto en detalle extremo
  // No necesita referencia visual, evitamos conflicto de aspect ratio
  if (sceneType === 'studio-branding') {
    console.log('[REFERENCE STRATEGY] Studio mode detected → prompt-only');
    return 'prompt-only';
  }
  
  // LIFESTYLE MODE: Similar a Studio, el prompt es muy descriptivo
  // Evitamos letterboxing causado por conflicto dimensional
  if (sceneType.includes('lifestyle')) {
    console.log('[REFERENCE STRATEGY] Lifestyle mode detected → prompt-only');
    return 'prompt-only';
  }
  
  // UGC NATURAL/REAL: Necesita fidelidad exacta al producto real
  // Aquí SI enviamos las referencias
  if (sceneType.includes('ugc')) {
    console.log('[REFERENCE STRATEGY] UGC mode detected → full references');
    return 'full';
  }
  
  // Default: enviar referencias
  console.log('[REFERENCE STRATEGY] Default mode → full references');
  return 'full';
}

/**
 * Decide si enviar o no las imágenes de referencia basado en la estrategia
 */
export function shouldSendProductReferenceImages(
  strategy: ReferenceStrategy,
  prompt: string,
  products: any[]
): boolean {
  // Si no hay productos, no hay nada que enviar
  if (!Array.isArray(products) || products.length === 0) {
    return false;
  }
  
  const lower = String(prompt || '').toLowerCase();
  
  // Si el prompt explícitamente dice que no debe haber producto visible
  if (lower.includes('no product visible anywhere in frame')) {
    console.log('[REFERENCE STRATEGY] Prompt requires no product → not sending references');
    return false;
  }
  
  // Estrategia prompt-only: NO enviar referencias visuales
  if (strategy === 'prompt-only') {
    console.log('[REFERENCE STRATEGY] ⚠️  PROMPT-ONLY MODE ACTIVE');
    console.log('[REFERENCE STRATEGY] → NOT sending product reference images');
    console.log('[REFERENCE STRATEGY] → Model will generate product from prompt description');
    console.log('[REFERENCE STRATEGY] → This avoids letterboxing from dimension conflicts');
    return false;
  }
  
  // Para todos los demás casos, enviar referencias
  console.log('[REFERENCE STRATEGY] → Sending product reference images');
  return true;
}

/**
 * Flag de control para activar/desactivar la estrategia fácilmente
 */
export const PRODUCT_REFERENCE_STRATEGY_ENABLED = true;

/**
 * Para debugging: explica la decisión tomada
 */
export function explainReferenceDecision(
  strategy: ReferenceStrategy,
  willSend: boolean,
  sceneType: string,
  productCount: number
): string {
  const lines = [
    '━━━ PRODUCT REFERENCE STRATEGY ━━━',
    `Scene Type: ${sceneType}`,
    `Products: ${productCount}`,
    `Strategy: ${strategy}`,
    `Will Send References: ${willSend ? 'YES ✓' : 'NO ✗'}`,
  ];
  
  if (!willSend && strategy === 'prompt-only') {
    lines.push('');
    lines.push('Reason: Avoiding letterboxing from dimension conflicts');
    lines.push('The prompt description is detailed enough for generation');
  }
  
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return lines.join('\n');
}
