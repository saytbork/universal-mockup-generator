# 🎲 RANDOMIZACIÓN FORZADA - UGC 100% RANDOM

## 🔥 CAMBIO IMPORTANTE: TODO ES RANDOM AHORA

Basado en tu feedback: **"la ropa debe ser random al igual que los ambientes... siempre debe ser random, cara ropa etc."**

---

## ✅ CAMBIOS IMPLEMENTADOS

### 1. ROPA → SIEMPRE RANDOM (incluso si el usuario especifica wardrobe)

**ANTES:**
```typescript
// Solo randomizaba si el usuario NO especificaba wardrobe
if (isUgcMode && !options.wardrobeStyle) {
    const clothing = randomizer.getClothing();
    parts.push(`CLOTHING: ${clothing}`);
}
```

**AHORA:**
```typescript
// SIEMPRE randomiza ropa en UGC mode
if (isUgcMode) {
    const clothing = randomizer.getClothing();
    if (options.wardrobeStyle) {
        // Usuario especificó wardrobe: lo usamos como "dirección de estilo"
        // pero añadimos variación casual random
        parts.push(`CLOTHING BASE: ${wardrobeStyle}, but ${clothing.toLowerCase()}`);
    } else {
        // No hay wardrobe: 100% random
        parts.push(`CLOTHING: ${clothing}`);
    }
}
```

**Ejemplos:**
- Usuario especifica "athletic wear" → Genera: "athletic wear, but plain t-shirt, clearly slept in"
- Usuario NO especifica → Genera: "loose pajama top, worn look"

**Resultado:** Ropa SIEMPRE tiene variación casual, nunca es "perfecta"

---

### 2. AMBIENTE/BACKGROUND → SIEMPRE RANDOM

**NUEVO:**
```typescript
// SIEMPRE randomiza lighting y background en UGC mode
if (isUgcMode) {
    const lighting = randomizer.getLightingEnvironment();
    parts.push(`LIGHTING: ${lighting}`);
    
    const backgroundElements = randomizer.getBackgroundElements();
    if (options.sceneEnvironment && options.sceneEnvironment.trim()) {
        // Usuario especificó environment: blend con elementos casuales random
        parts.push(`BACKGROUND: ${sceneEnvironment}, with ${backgroundElements.toLowerCase()}`);
    } else {
        // No hay environment: 100% random
        parts.push(`BACKGROUND: ${backgroundElements}`);
    }
}
```

**Ejemplos:**
- Usuario especifica "bedroom" → Genera: "bedroom, with unmade bed visible in background"
- Usuario especifica "kitchen" → Genera: "kitchen, with kitchen counter with dishes in sink"
- Usuario NO especifica → Genera: "clothes pile on chair or floor"

**Resultado:** Backgrounds SIEMPRE tienen elementos desordenados casuales

---

### 3. CARA → SIEMPRE RANDOM (ya estaba implementado)

**Código actual:**
```typescript
// ALWAYS randomize facial structure (user has no control over this)
const facialStructure = randomizer.getFacialStructure();
parts.push(`FACIAL STRUCTURE: ${facialStructure}`);
```

**Resultado:** Cada generación tiene cara diferente (nariz, mandíbula, pómulos únicos)

---

## 📊 TABLA DE RANDOMIZACIÓN

| Elemento | Random? | ¿Respeta selección del usuario? | Probabilidad |
|----------|---------|----------------------------------|--------------|
| **Facial Structure** | ✅ SIEMPRE | ❌ NO (usuario no puede controlar) | 100% |
| **Camera Angle** | ✅ SIEMPRE | ⚠️ Solo si Raw UGC desactivado | 100% |
| **Skin Texture** | ✅ SIEMPRE | ❌ NO | 70% |
| **Hair Styling** | ✅ SIEMPRE | ❌ NO | 100% |
| **Overall Vibe** | ✅ SIEMPRE | ❌ NO | 100% (solo UGC) |
| **Accessories** | ✅ SIEMPRE | ⚠️ Solo si no hay model reference | 50% |
| **Clothing** | ✅ **AHORA SIEMPRE** | ⚠️ **Blend con wardrobe si especifica** | 100% (solo UGC) |
| **Facial Hair** | ✅ SIEMPRE | ❌ NO (solo masculino) | 100% |
| **Ethnicity** | ✅ SIEMPRE | ⚠️ Solo si "Non-specific" | 100% |
| **Lighting** | ✅ **NUEVO SIEMPRE** | ❌ NO | 100% (solo UGC) |
| **Background** | ✅ **NUEVO SIEMPRE** | ⚠️ **Blend con environment si especifica** | 100% (solo UGC) |

---

## 🎬 EJEMPLOS DE GENERACIÓN

### EJEMPLO 1: Usuario NO especifica nada
```
Input:
- Age: 30, Female, Non-specific ethnicity
- No wardrobe
- No environment

Output:
FACIAL STRUCTURE: heart-shaped face, tapered V-shaped jawline, sharp defined cheekbones
CAMERA ANGLE: extreme low angle, phone held below chin pointing up (double chin visible)
SKIN TEXTURE: active breakouts, small pimples on chin and forehead
HAIR STYLING: greasy unwashed hair, slicked look
OVERALL VIBE: just woke up, visibly tired with pillow marks on face
ACCESSORIES: no visible accessories or jewelry
CLOTHING: old sweatshirt with stretched neck
LIGHTING: harsh overhead bedroom light, yellow tint
BACKGROUND: unmade bed visible in background
ETHNICITY VARIATION: Southeast Asian descent
```

**Resultado:** 100% random, super casero

---

### EJEMPLO 2: Usuario especifica wardrobe "athletic wear" y environment "bedroom"
```
Input:
- Age: 30, Female, Non-specific ethnicity
- Wardrobe: "athletic wear"
- Environment: "bedroom"

Output:
FACIAL STRUCTURE: oval face, soft rounded jawline, high prominent cheekbones
CAMERA ANGLE: awkward side angle, arm extended to the side with off-center framing
SKIN TEXTURE: oily T-zone with visible shine
HAIR STYLING: messy bun, falling apart
OVERALL VIBE: post-workout sweaty with hair stuck to forehead
ACCESSORIES: hair scrunchie on wrist
CLOTHING BASE: athletic wear, but workout clothes, not fresh
LIGHTING: bright bathroom lighting, washed out skin
BACKGROUND: bedroom, with clothes pile on chair or floor
ETHNICITY VARIATION: Latin American descent
```

**Resultado:** Respeta "athletic wear" y "bedroom" pero añade variación casual/desordenada

---

### EJEMPLO 3: Usuario especifica wardrobe "casual" y environment "kitchen"
```
Input:
- Age: 25, Male, Non-specific ethnicity
- Wardrobe: "casual"
- Environment: "kitchen"

Output:
FACIAL STRUCTURE: square face, strong square jawline, flat cheekbones
CAMERA ANGLE: sitting down holding phone at chest level pointing up
SKIN TEXTURE: visible large pores on nose, cheeks, and forehead
HAIR STYLING: completely unstyled, natural bedhead
OVERALL VIBE: lazy weekend energy, hasn't showered yet
ACCESSORIES: old glasses with smudges on lenses
CLOTHING BASE: casual, but baggy t-shirt with stains
FACIAL HAIR: light stubble (1-2 days growth)
LIGHTING: fluorescent kitchen lighting, greenish cast
BACKGROUND: kitchen, with kitchen counter with dishes in sink
ETHNICITY VARIATION: Eastern European descent
```

**Resultado:** Respeta "casual" y "kitchen" pero añade mugre y desorden

---

## 🎯 FILOSOFÍA DEL CAMBIO

### ANTES (V2.1):
- Randomización **selectiva**
- Si el usuario especificaba wardrobe → NO randomizar ropa
- Si el usuario especificaba environment → NO randomizar background
- Respeto total a las selecciones del usuario

### AHORA (V2.2 - Forced Random):
- Randomización **AGRESIVA**
- Usuario especifica wardrobe → randomizar ENCIMA del wardrobe (blend)
- Usuario especifica environment → randomizar ENCIMA del environment (blend)
- Las selecciones del usuario son "direcciones de estilo", no reglas absolutas

---

## 🔥 VENTAJAS

1. **1000 generaciones = 1000 imágenes únicas** (incluso con mismo wardrobe/environment)
2. **Nunca dos imágenes iguales** (siempre hay variación)
3. **UGC más auténtico** (ropa arrugada, ambientes desordenados)
4. **Usuario puede "dirigir" el estilo** (athletic, bedroom) pero no "controlar" exactamente

---

## ⚠️ EXCEPCIONES (no se randomiza)

1. **Model Reference:** Si el usuario sube una foto, NADA se randomiza
2. **Raw Domestic UGC activo:** No randomiza ángulo de cámara (usa los controles Raw UGC)
3. **Edad, Género, Etnicidad específica:** Se respetan 100%
4. **Tono de piel, Color de ojos, Largo de pelo:** Se respetan 100%

---

## 📝 RESUMEN DE CAMBIOS EN CÓDIGO

### Archivos modificados:
1. ✅ `/src/lib/promptEngine/builders/identity.ts`
   - Línea ~405: Ropa SIEMPRE random (blend con wardrobe si existe)
   - Línea ~428: Lighting SIEMPRE random (nuevo)
   - Línea ~431: Background SIEMPRE random (blend con environment si existe)

### Archivos sin cambios:
- `/src/lib/promptEngine/builders/diversityRandomizer.ts` (ya tiene todas las pools necesarias)

---

## 🚀 TESTING

Para probar la randomización forzada:

### Test 1: Sin wardrobe, sin environment
```
Settings:
- Age: 30, Female, Non-specific
- Wardrobe: (vacío)
- Environment: (vacío)

Generar 5 imágenes

Verificar:
✅ 5 caras diferentes
✅ 5 ropas diferentes (pijamas, camisetas viejas, etc.)
✅ 5 ambientes diferentes (cama, baño, cocina, etc.)
✅ 5 lighting diferentes (amarillo, verde, brillante, etc.)
```

### Test 2: Con wardrobe "athletic", sin environment
```
Settings:
- Age: 30, Female, Non-specific
- Wardrobe: "athletic wear"
- Environment: (vacío)

Generar 5 imágenes

Verificar:
✅ 5 caras diferentes
✅ 5 variaciones de athletic wear (pero todas "sucias" o "usadas")
✅ 5 ambientes random diferentes
✅ 5 lighting diferentes
```

### Test 3: Con wardrobe "casual" y environment "bedroom"
```
Settings:
- Age: 30, Female, Non-specific
- Wardrobe: "casual"
- Environment: "bedroom"

Generar 5 imágenes

Verificar:
✅ 5 caras diferentes
✅ 5 variaciones de casual wear (pero todas "arrugadas" o "viejas")
✅ 5 variaciones de bedroom (pero con cama deshecha, ropa en el suelo, etc.)
✅ 5 lighting diferentes
```

---

## 🎉 RESULTADO ESPERADO

**ANTES:**
- Usuario especifica "athletic wear" + "bedroom" → 10 generaciones similares
- Misma ropa athletic limpia
- Misma bedroom ordenada

**AHORA:**
- Usuario especifica "athletic wear" + "bedroom" → 10 generaciones ÚNICAS
- Athletic wear pero: sudado, arrugado, viejo, manchado, etc.
- Bedroom pero: cama deshecha, ropa tirada, desorden visible, etc.

---

**Fecha:** 17 de febrero de 2026  
**Versión:** V2.2 (Forced Random)  
**Status:** ✅ Listo para testing  
**Cambio clave:** Randomización agresiva de ropa y ambiente
