# Plan de Implementación: Fix Aspect Ratio Letterboxing

## 🎯 Objetivo
Eliminar letterboxing/pillarboxing en Studio y Lifestyle modes cuando hay conflicto entre dimensiones del producto y aspect ratio solicitado.

## 📋 Checklist de Implementación

### ✅ Paso 1: Crear archivo de estrategia (NO ROMPE NADA)
**Archivo nuevo:** `src/services/productReferenceStrategy.ts`

```typescript
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
```

---

### ✅ Paso 2: Integrar en App.tsx (PUNTO CRÍTICO)

**Ubicación:** `App.tsx` línea ~5210, dentro de `handleGenerateClick`

**ANTES:**
```typescript
// Código actual - siempre envía referencias
if (shouldSendProductImage) {
  generationProducts.forEach((product) => {
    requestParts.push({
      inlineData: { data: product.base64, mimeType: product.mimeType },
      reference: true,
    });
  });
}
```

**DESPUÉS:**
```typescript
// IMPORTAR AL INICIO DEL ARCHIVO
import { 
  determineProductReferenceStrategy, 
  shouldSendProductReferenceImages,
  explainReferenceDecision,
  PRODUCT_REFERENCE_STRATEGY_ENABLED 
} from './services/productReferenceStrategy';

// ... dentro de handleGenerateClick, antes de construir requestParts ...

// Determinar estrategia de referencias
const referenceStrategy = PRODUCT_REFERENCE_STRATEGY_ENABLED
  ? determineProductReferenceStrategy(
      promptOptions.sceneType || '',
      visualIntent,
      generationProducts.length > 0,
      aspectRatio
    )
  : 'full'; // Si está desactivado, comportamiento original

// Decidir si enviar referencias basado en estrategia
const shouldSendProductRef = shouldSendProductReferenceImages(
  referenceStrategy,
  finalPrompt,
  generationProducts
);

// Log detallado para debugging
console.log(explainReferenceDecision(
  referenceStrategy,
  shouldSendProductRef,
  promptOptions.sceneType || '',
  generationProducts.length
));

// Construir requestParts con la decisión tomada
const requestParts: any[] = [];
requestParts.push({ text: finalPrompt });

// Añadir modelo de referencia si existe
if (shouldIncludeHumanImage && identityInlinePart) {
  requestParts.push(identityInlinePart);
}

// Añadir productos SOLO si la estrategia lo permite
if (shouldSendProductRef && generationProducts.length > 0) {
  generationProducts.forEach((product) => {
    requestParts.push({
      inlineData: { data: product.base64, mimeType: product.mimeType },
      reference: true,
    });
  });
} else if (generationProducts.length > 0) {
  console.log(`[REFERENCE STRATEGY] ⚠️  Skipping ${generationProducts.length} product reference images`);
}
```

---

### ✅ Paso 3: TESTING (CRÍTICO - No deployar sin esto)

**Test 1: Studio Mode con botella vertical + 16:9 horizontal**
- Crear: Producto vertical (botella)
- Seleccionar: Aspect ratio 16:9 (horizontal)
- Modo: Studio Branding
- Resultado esperado: ✅ Sin letterboxing, composición natural horizontal

**Test 2: Lifestyle Mode con producto cuadrado + 9:16 vertical**
- Crear: Producto cuadrado (caja)
- Seleccionar: Aspect ratio 9:16 (vertical)
- Modo: Lifestyle
- Resultado esperado: ✅ Sin pillarboxing, escena vertical natural

**Test 3: UGC Mode (debe seguir usando referencias)**
- Crear: Cualquier producto
- Modo: UGC Natural
- Resultado esperado: ✅ Debe enviar referencias (comportamiento original)

**Test 4: Flag desactivado (comportamiento original)**
- Cambiar: `PRODUCT_REFERENCE_STRATEGY_ENABLED = false`
- Resultado esperado: ✅ Comportamiento idéntico al anterior

---

### ✅ Paso 4: Rollback Plan (Si algo sale mal)

**Opción A: Desactivar con flag**
```typescript
// En productReferenceStrategy.ts
export const PRODUCT_REFERENCE_STRATEGY_ENABLED = false;
```

**Opción B: Revertir cambios en App.tsx**
```bash
git diff App.tsx
git checkout App.tsx  # Si es necesario revertir
```

**Opción C: Eliminar archivo**
```bash
rm src/services/productReferenceStrategy.ts
# Revertir imports en App.tsx
```

---

## 🚨 Puntos Críticos de Atención

### ⚠️  NO afectar estos modos:
- ✅ **Ecommerce PDP** - Debe seguir usando referencias
- ✅ **UGC Natural/Real** - Debe seguir usando referencias
- ✅ **Product Placement** - Debe seguir usando referencias

### ⚠️  SI afectar estos modos:
- ✅ **Studio Branding** - NO enviar referencias (fix letterboxing)
- ✅ **Lifestyle scenes** - NO enviar referencias (fix letterboxing)

---

## 📊 Métricas de Éxito

**Antes de la implementación:**
- ❌ Letterboxing en 70-80% de casos con aspect ratio conflictivo
- ❌ Usuario tiene que re-generar múltiples veces
- ❌ Aspect ratio seleccionado es ignorado

**Después de la implementación:**
- ✅ Letterboxing en <10% de casos
- ✅ Primera generación respeta aspect ratio
- ✅ Composiciones naturales edge-to-edge

---

## 🔍 Monitoreo Post-Deploy

```typescript
// Logs a monitorear en consola:
'[REFERENCE STRATEGY] Studio mode detected → prompt-only'
'[REFERENCE STRATEGY] Lifestyle mode detected → prompt-only'
'[REFERENCE STRATEGY] ⚠️  PROMPT-ONLY MODE ACTIVE'
'[REFERENCE STRATEGY] → NOT sending product reference images'
```

**Si ves estos logs y AÚN hay letterboxing:**
→ El problema puede estar en el prompt, no en las referencias
→ Revisar `FRAME_EDGE_POLICY` en builders

**Si la calidad del producto baja:**
→ El prompt no es suficientemente descriptivo
→ Considerar re-activar referencias parcialmente

---

## ✅ Checklist Final Antes de Deploy

- [ ] Archivo `productReferenceStrategy.ts` creado
- [ ] Importado correctamente en `App.tsx`
- [ ] Flag `PRODUCT_REFERENCE_STRATEGY_ENABLED` en `true`
- [ ] Test 1 pasado (Studio vertical → horizontal)
- [ ] Test 2 pasado (Lifestyle cuadrado → vertical)
- [ ] Test 3 pasado (UGC mantiene referencias)
- [ ] Test 4 pasado (Flag disabled = comportamiento original)
- [ ] Logs de debugging visibles en consola
- [ ] Rollback plan documentado
- [ ] Equipo informado del cambio

---

## 🎯 Próximo Paso
¿Proceder con la implementación?
