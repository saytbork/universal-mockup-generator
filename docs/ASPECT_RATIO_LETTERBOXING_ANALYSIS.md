# Análisis: Problema de Letterboxing/Pillarboxing en Aspect Ratio

## 🔍 Problema Identificado (ACTUALIZADO)

**CAUSA RAÍZ CONFIRMADA:** El aspect ratio de salida está siendo determinado por las dimensiones de la imagen de referencia del producto, no por el aspect ratio seleccionado por el usuario en la UI.

Síntomas:
- Franjas blancas/negras (letterbox/pillarbox)
- Imagen distorsionada
- Bandas de color lateral
- El aspect ratio seleccionado en UI es ignorado

Esto ocurre porque:
1. Usuario sube una imagen de producto con dimensiones específicas (ej: 800x1200 = vertical)
2. Usuario selecciona aspect ratio diferente en UI (ej: 16:9 = horizontal)
3. El modelo intenta respetar AMBAS restricciones (producto vertical + output horizontal)
4. **RESULTADO:** Letterboxing o distorsión para forzar el fit

## 📊 Estado Actual del Sistema

### 1. **Configuración en `imageGenerationService.ts`** (líneas 167-175)
```typescript
generationConfig: {
    responseMimeType: "image/png",
    aspectRatio,                      // ← Se pasa el aspect ratio
    preserveReferenceImage,           // ← FALSE por defecto
    temperature: 0.25,
    topP: 0.9,
    seed,
}
```

### 2. **Configuración en `api/generate.ts`** (líneas 399-407)
```typescript
generationConfig: {
    responseMimeType: 'image/png',
    aspectRatio,                      // ← Se pasa el aspect ratio
    preserveReferenceImage,           // ← FALSE por defecto  
    temperature: 0.25,
    topP: 0.9,
    seed: crypto.randomUUID(),
}
```

### 3. **Prompt incluye instrucciones anti-letterbox**
Del log proporcionado:
```
FRAME_EDGE_POLICY: Maintain real scene continuity to all four edges. 
No white lateral padding, no pillarbox/letterbox bars, no mirrored edge extension, 
no duplicated side strips, and no synthetic side-fill bands.
```

## 🎯 Causa Raíz del Problema

### **Conflicto entre Aspect Ratio del Producto vs Aspect Ratio de Output**

El flujo actual en `App.tsx`:

**Línea 5196-5199:**
```typescript
const aspectRatio =
  isProductPlacement
    ? resolveOutputAspectRatio()  // ← Lee del store del usuario
    : (promptOptions.aspectRatio || options.aspectRatio || '1:1');
```

**Línea 1902:**
```typescript
const productRatio = String(useProductStudioStore.getState().aspectRatio || '').trim();
```

El problema ocurre cuando:
1. **Imagen del producto es vertical** (ej: botella 500x1000px)
2. **Usuario selecciona aspect ratio horizontal** (ej: 16:9)
3. **El modelo recibe ambas referencias:**
   - `aspectRatio: '16:9'` en generationConfig
   - Imagen de producto vertical como `reference: true`

**Resultado:** El modelo está tratando de:
- Respetar las dimensiones/proporción del producto (vertical)
- Generar en aspect ratio horizontal (16:9)
- **CONFLICTO INEVITABLE** → letterboxing/pillarboxing

## 💡 Soluciones Propuestas

### **Opción A: NO enviar imagen de producto como referencia al API**

La más segura y directa:

```typescript
// En imageGenerationService.ts línea 30-37
export function shouldSendProductReferenceImages(prompt: string, products: ActiveProduct[]): boolean {
    if (!Array.isArray(products) || products.length === 0) return false;
    const lower = String(prompt || '').toLowerCase();
    
    // NUEVO: No enviar si el prompt ya describe el producto detalladamente
    // El modelo lo generará desde cero respetando el aspect ratio solicitado
    if (lower.includes('no product visible')) return false;
    
    // CAMBIO CRÍTICO: En modo Studio, confiar en el prompt, no en la referencia
    if (lower.includes('studio_visual_intent')) return false;  // ← NUEVA LÍNEA
    
    return true;
}
```

**Ventajas:**
- ✅ El modelo respeta el aspect ratio solicitado
- ✅ No hay conflicto entre dimensiones de referencia vs output
- ✅ El prompt ya incluye toda la info del producto

**Desventajas:**
- ⚠️ Puede perder fidelidad exacta al producto original
- ⚠️ Depende 100% de la calidad del prompt

### **Opción B: Forzar aspect ratio compatible con el producto**

Analizar dimensiones del producto y ajustar automáticamente:

```typescript
// NUEVO ARCHIVO: src/services/aspectRatioResolver.ts
export function getCompatibleAspectRatio(
  products: ActiveProduct[],
  requestedRatio: string
): string {
  if (!products.length) return requestedRatio;
  
  const primaryProduct = products[0];
  const img = new Image();
  img.src = `data:${primaryProduct.mimeType};base64,${primaryProduct.base64}`;
  
  const productIsVertical = img.height > img.width * 1.1;
  const productIsHorizontal = img.width > img.height * 1.1;
  
  // Si el producto es vertical, forzar ratios verticales
  if (productIsVertical) {
    if (['16:9', '4:3'].includes(requestedRatio)) {
      return '4:5'; // Cambiar a portrait
    }
  }
  
  // Si el producto es horizontal, forzar ratios horizontales  
  if (productIsHorizontal) {
    if (['4:5', '9:16', '3:4'].includes(requestedRatio)) {
      return '16:9'; // Cambiar a landscape
    }
  }
  
  return requestedRatio;
}
```

**Ventajas:**
- ✅ Evita conflictos de orientación
- ✅ Mantiene la referencia del producto

**Desventajas:**
- ⚠️ Ignora la elección del usuario
- ⚠️ Puede sorprender al usuario

### **Opción C: Hacer `preserveReferenceImage = true` condicionalmente**

```typescript
// En App.tsx antes de la llamada a /api/generate
const productOrientation = detectProductOrientation(generationProducts);
const requestedOrientation = detectAspectRatioOrientation(aspectRatio);

// Si hay conflicto de orientación, preservar la referencia
// y dejar que el modelo ajuste la composición
const preserveReferenceImage = 
  productOrientation !== requestedOrientation && 
  generationProducts.length > 0;
```

**Ventajas:**
- ✅ Mantiene fidelidad al producto
- ✅ Evita letterboxing

**Desventajas:**
- ⚠️ El aspect ratio final puede no ser exacto
- ⚠️ Puede ignorar la elección del usuario

## 🎯 RECOMENDACIÓN: Opción A (Más Segura)

**Crear un nuevo archivo para no afectar el comportamiento actual:**

```typescript
// NUEVO ARCHIVO: src/services/productReferenceStrategy.ts

export type ReferenceStrategy = 'full' | 'prompt-only' | 'conditional';

export function determineProductReferenceStrategy(
  sceneType: string,
  visualIntent: string,
  products: ActiveProduct[],
  aspectRatio: string
): ReferenceStrategy {
  
  // Para Studio mode Y Lifestyle mode, confiar en el prompt
  // El problema de letterboxing ocurre en AMBOS casos cuando hay
  // conflicto entre dimensiones del producto y aspect ratio solicitado
  if (sceneType === 'studio-branding' || sceneType.includes('lifestyle')) {
    return 'prompt-only';
  }
  
  // Para UGC real/natural, usar las referencias (necesitan fidelidad exacta)
  if (sceneType.includes('ugc')) {
    return 'full';
  }
  
  // Default: usar referencias
  return 'full';
}

export function shouldSendProductReferenceImages(
  strategy: ReferenceStrategy,
  prompt: string,
  products: any[]
): boolean {
  if (!Array.isArray(products) || products.length === 0) return false;
  
  const lower = String(prompt || '').toLowerCase();
  
  // Si el prompt requiere no mostrar producto, nunca enviar
  if (lower.includes('no product visible anywhere in frame')) return false;
  
  // Si la estrategia es prompt-only, NO enviar referencias
  if (strategy === 'prompt-only') {
    // El prompt de Studio/Lifestyle ya incluye descripción detallada del producto
    console.log('[REFERENCE STRATEGY] prompt-only mode: NO enviando imágenes de referencia del producto');
    console.log('[REFERENCE STRATEGY] Razón: Evitar conflicto entre dimensiones de producto y aspect ratio solicitado');
    return false;
  }
  
  // Para otros casos, enviar referencias
  return true;
}
```

**Integración en App.tsx (sin romper nada):**

```typescript
// Importar
import { determineProductReferenceStrategy, shouldSendProductReferenceImages } from './services/productReferenceStrategy';

// Antes de construir requestParts (línea ~5210)
const referenceStrategy = determineProductReferenceStrategy(
  promptOptions.sceneType || '',
  visualIntent,
  generationProducts,
  aspectRatio
);

const shouldSendProductRef = shouldSendProductReferenceImages(
  referenceStrategy,
  finalPrompt,
  generationProducts
);

console.log('[PRODUCT REFERENCE] Strategy:', referenceStrategy);
console.log('[PRODUCT REFERENCE] Will send images:', shouldSendProductRef);

// Al agregar products a requestParts
if (shouldSendProductRef && generationProducts.length > 0) {
  generationProducts.forEach((product) => {
    requestParts.push({
      inlineData: { data: product.base64, mimeType: product.mimeType },
      reference: true,
    });
  });
}
```

**IMPORTANTE:** También hay que actualizar `imageGenerationService.ts` para que use la misma lógica:

```typescript
// En imageGenerationService.ts, reemplazar la función existente:
import { determineProductReferenceStrategy, shouldSendProductReferenceImages } from './productReferenceStrategy';

// La función shouldSendProductReferenceImages ya existe (línea 30)
// pero necesita recibir más contexto para tomar la decisión correcta
```

### Por qué esta solución es la mejor:

1. ✅ **Código nuevo aislado** en archivo separado
2. ✅ **Fácil de desactivar** con un flag si no funciona
3. ✅ **Respeta la arquitectura** existente
4. ✅ **Soluciona el problema raíz:** conflicto entre dimensiones del producto y aspect ratio solicitado
5. ✅ **Aplica a Studio Y Lifestyle** - ambos tienen el mismo problema
6. ✅ **Mantiene referencias para UGC** donde la fidelidad exacta es crítica

### Contextos donde SI mantiene referencias de producto:
- ✅ **UGC Natural/Real mode** - Necesita fidelidad exacta al producto
- ✅ **Ecommerce PDP** - Requiere el producto exacto
- ✅ **Casos especiales** donde el prompt lo requiera explícitamente

### **NO MODIFICAR directamente:**
- `imageGenerationService.ts` - Afecta TODA la generación
- `api/generate.ts` - Backend crítico
- Lógica de prompts existente - Ya está optimizada

### **DEBE SER:**
- Una capa de decisión ANTES de llamar a la generación
- Específica por tipo de escena/modo
- Con flags de control granular

## 📋 Próximos Pasos Propuestos

1. **Crear un nuevo archivo:** `src/services/aspectRatioOptimizer.ts`
2. **Implementar lógica de detección:**
   - Analizar dimensiones del producto
   - Detectar mismatch entre producto y aspect ratio solicitado
   - Sugerir mejor configuración
3. **Agregar flag de control:** `SMART_ASPECT_RATIO_OPTIMIZATION`
4. **Testing aislado** antes de integrar al flujo principal

## 🔗 Referencias en el Código

- `App.tsx` línea 5342-5344: Comentario sobre `preserveReferenceImage`
- `imageGenerationService.ts` línea 35: Comentario sobre letterboxing
- `src/lib/productStudioV2/builders/buildComposition.ts` línea 38: FRAME_EDGE_POLICY
- `src/lib/productStudio/builders.ts` línea 1826: CONVERSION_SQUARE_OPTIMIZED

## ⚙️ Variables de Estado Relevantes

Del log:
```javascript
CONVERSION_SQUARE_OPTIMIZED = true  // ← Cuando aspectRatio === '1:1' && visualIntent === 'conversion'
PRO_MODE_ACTIVE = true
VISUAL_INTENT_ACTIVE = conversion
CONTROL_TIER_ACTIVE = pro
```

## 🎨 Contexto del Modo Actual

- **Modo:** studio-branding
- **Visual Intent:** conversion
- **Aspect Ratio solicitado:** Probablemente no es 1:1 (porque menciona el problema)
- **Bundle activo:** lineup mode con 2 productos

El problema aparece cuando:
- Modo de conversión está activo
- Se usa aspect ratio no cuadrado
- Hay múltiples productos (bundle)
- El framing "hero" requiere 85-92% de cobertura vertical

**La tensión está entre:**
- Necesidad de llenar el aspect ratio completo
- Mantener la integridad del producto sin distorsión
- Composición hero con dominancia vertical

---

## 🔑 CONCLUSIÓN FINAL

**El problema NO es un bug en el código, es un conflicto fundamental:**

```
Imagen de producto (ej: 500x1000 vertical)
           +
Aspect ratio solicitado (ej: 16:9 horizontal)
           =
CONFLICTO → Letterboxing/Pillarboxing inevitable
```

**Solución propuesta:**
- Crear `src/services/productReferenceStrategy.ts` (nuevo archivo)
- NO enviar imagen de referencia del producto en modos **Studio Y Lifestyle**
- Mantener referencias en UGC mode (donde se necesita fidelidad exacta)
- Dejar que el modelo genere el producto desde cero basado en el prompt (que ya lo describe en detalle)
- Los prompts de Studio y Lifestyle son suficientemente detallados para mantener fidelidad

**Ventajas:**
- ✅ Respeta el aspect ratio seleccionado por el usuario
- ✅ Resuelve letterboxing en Studio Y Lifestyle
- ✅ Mantiene fidelidad en UGC (donde se necesita)
- ✅ No rompe funcionalidad existente
- ✅ Fácil de revertir si no funciona
- ✅ Código aislado y testeable

**Próximo paso:**
¿Quieres que implemente la solución completa con el nuevo archivo `productReferenceStrategy.ts`?
