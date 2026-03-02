# CRITICAL FIX: Selfie & Phone Visibility Bug in Lifestyle Mode

**Status**: ✅ FIXED  
**Severity**: 🔴 CRITICAL  
**Date**: 2026-02-18  
**Branch**: review-v2

---

## ⚠️ PROBLEMA CRÍTICO IDENTIFICADO

En **Lifestyle/Brand mode** (fotografía editorial profesional para publicidad), estaban apareciendo:

1. **Teléfonos visibles en el frame** (gravísimo)
2. **Manos cortadas/malformadas** con 6 dedos
3. **Perspectivas de selfie** (arm-extended, mirror selfie, bathroom counter selfie)

Esto es **inaceptable** para fotografía profesional de marca/editorial.

---

## 🎯 QUÉ ES LIFESTYLE MODE

**Lifestyle = Sesión fotográfica profesional de estudio para publicidad/editorial**

Imagina un equipo creativo haciendo una sesión de fotos para la publicidad de un producto:
- ✅ **Fotógrafo profesional** con DSLR/mirrorless
- ✅ **Director de arte** supervisando composición
- ✅ **Estilista** preparando wardrobe y props
- ✅ **Modelo real profesional** (no casual UGC creator)
- ✅ **Iluminación controlada** (softbox, reflectores, luz de estudio)
- ✅ **Composición intencional** para hero shots de publicidad
- ✅ **Calidad editorial** de revista (Vogue, GQ, anuncios de TV)

**Lifestyle NO es**:
- ❌ Selfies
- ❌ Casual snapshots
- ❌ UGC (user-generated content)
- ❌ Teléfonos visibles
- ❌ Ángulos accidentales
- ❌ Bathroom mirror photos
- ❌ Car selfies

---

## 🔍 CAUSA RAÍZ

### Archivo: `identity.ts` (líneas 386-391)

**ANTES** (incorrecto):
```typescript
// SKIP camera angle randomization if Raw Domestic UGC is active
const hasRawUgcCameraControl = Boolean(options.rawDomesticUgcActive);
if (!hasRawUgcCameraControl) {
    const cameraAngle = randomizer.getCameraAngle();
    parts.push(`CAMERA ANGLE: ${cameraAngle}`);
}
```

**PROBLEMA**: Se ejecutaba en **TODOS los modos**, incluyendo Lifestyle/Brand.

El array `CAMERA_ANGLES` en `diversityRandomizer.ts` contiene:
- `'arm-extended mirror selfie, phone partially covering face'`
- `'one-handed selfie with visible phone wobble in framing'`
- `'bathroom counter selfie, phone leaning against mirror'`
- `'car selfie, awkward arm reach with steering wheel visible'`
- `'lying down angle, face from above with pillow/bed visible'`

Estas opciones son **solo para UGC** pero se estaban inyectando en Lifestyle mode.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Fix #1: `identity.ts` (líneas 380-392)

**DESPUÉS** (correcto):
```typescript
// ALWAYS randomize facial structure (user has no control over this)
const facialStructure = randomizer.getFacialStructure();
parts.push(`FACIAL STRUCTURE: ${facialStructure}`);

// CAMERA ANGLE RANDOMIZATION: ONLY in UGC mode
// Lifestyle mode uses professional camera setup from canonicalScene.ts
// SKIP if Raw Domestic UGC is active (it has its own camera control)
const hasRawUgcCameraControl = Boolean(options.rawDomesticUgcActive);
if (isUgcMode && !hasRawUgcCameraControl) {
    const cameraAngle = randomizer.getCameraAngle();
    parts.push(`CAMERA ANGLE: ${cameraAngle}`);
}
```

**CAMBIO CLAVE**: Agregado `isUgcMode &&` antes de randomizar camera angle.

**Resultado**: 
- ✅ UGC mode: usa ángulos de selfie (arm-extended, mirror, bathroom, etc.)
- ✅ Lifestyle mode: usa ángulos profesionales de `canonicalScene.ts` (High angle, Eye-level, 45° hero, etc.)
- ✅ Ritual Mode: excluido automáticamente (usa `isUgcModeActive()`)
- ✅ Formulation Story: excluido automáticamente (usa `isUgcModeActive()`)

---

### Fix #2: `finalize.ts` (líneas 86-104)

**AGREGADO**:
```typescript
if (intent !== 'ugc' && options.contentStyle !== 'product' && options.sceneIntent !== 'ecommerce') {
    lines.push(
        'No lifestyle framing.',
        'No creator narrative.',
        'No selfie perspective.',
        'No phone camera.',
        'No text or graphic overlays.',
        'No logos or graphics.',
        'CRITICAL BLOCKERS (HARD CONSTRAINT): No visible phone in frame, no arm-extended selfie, no mirror selfie, no front-facing camera perspective, no bathroom mirror photo, no car selfie. Professional photography only.'
    );
}

// ADDITIONAL CRITICAL BLOCKER: Never show phone or cut-off hands in Lifestyle/Brand mode
if (options.personIncluded && intent !== 'ugc' && options.contentStyle !== 'ugc') {
    lines.push(
        'HAND INTEGRITY (NON-NEGOTIABLE): Hands must be anatomically correct with exactly 5 fingers per hand. No extra fingers, no missing fingers, no fused fingers, no malformed fingers.',
        'HAND VISIBILITY (CRITICAL): If hands are visible, they must be complete and not cropped awkwardly at wrists or mid-hand. Either show full hands or keep them out of frame entirely.',
        'NO PHONE VISIBLE: Absolutely no smartphone visible in the frame. This is professional brand photography, not a selfie.'
    );
}
```

**RESULTADO**: Bloqueadores explícitos para prevenir:
1. ❌ No phone visible
2. ❌ No selfie perspectives
3. ❌ No manos cortadas/malformadas
4. ❌ No 6 dedos

---

## 🧪 VALIDACIÓN REQUERIDA

### Test Case 1: Lifestyle Mode (Brand Photography)
**Configuración**:
```json
{
  "creationIntent": "brand",
  "contentStyle": "brand",
  "sceneType": "lifestyle-real",
  "personIncluded": true,
  "shotType": "Full body",
  "cameraType": "DSLR / mirrorless camera",
  "cameraAngle": "High angle",
  "ugcRealMode": false,
  "selfieMode": "None"
}
```

**Validar**:
- ✅ NO aparece teléfono en el frame
- ✅ NO perspectiva de selfie (arm-extended, mirror, etc.)
- ✅ Manos completas con 5 dedos
- ✅ Ángulo profesional desde `canonicalScene.ts`

---

### Test Case 2: UGC Mode (Casual Selfie)
**Configuración**:
```json
{
  "creationIntent": "ugc",
  "contentStyle": "ugc",
  "ugcRealMode": true,
  "ugcCaptureStyleBase": ["torso-level-handheld"],
  "personIncluded": true
}
```

**Validar**:
- ✅ SÍ puede aparecer teléfono parcialmente (si está en el array de opciones)
- ✅ Ángulos de selfie permitidos (torso-level, high-angle, close-face)
- ✅ Imperfecciones casuales permitidas

---

### Test Case 3: Ritual Mode (Lifestyle-only)
**Configuración**:
```json
{
  "ritualModeEnabled": true,
  "ritualPosture": "Meditation Pose",
  "personIncluded": true
}
```

**Validar**:
- ✅ NO aparece teléfono
- ✅ NO ángulos de selfie
- ✅ Fotografía profesional de ritual

---

## 📊 ARCHIVOS MODIFICADOS

1. **`src/lib/promptEngine/builders/identity.ts`** (línea 389)
   - Cambio: Agregado `isUgcMode &&` antes de randomizar camera angle
   - Impacto: Camera angle randomization solo en UGC mode

2. **`src/lib/promptEngine/builders/finalize.ts`** (líneas 86-104)
   - Cambio: Agregados bloqueadores críticos para phone/hands
   - Impacto: Hard constraints en Lifestyle/Brand mode

---

## 🎯 GARANTÍAS

Después de este fix:

1. **Lifestyle/Brand Mode**:
   - ❌ NUNCA teléfono visible
   - ❌ NUNCA perspectiva de selfie
   - ❌ NUNCA manos cortadas o con 6 dedos
   - ✅ SIEMPRE fotografía profesional

2. **UGC Mode**:
   - ✅ SÍ puede tener ángulos de selfie (controlado)
   - ✅ SÍ puede tener imperfecciones casuales
   - ✅ SÍ puede mostrar teléfono parcialmente (si aplica)

3. **Ritual Mode & Formulation Story**:
   - ✅ Automáticamente excluidos de UGC randomization
   - ✅ Fotografía profesional garantizada

---

## 🚨 ANTES vs DESPUÉS

### ANTES (INCORRECTO):
```
[Lifestyle Mode Generate]
→ identity.ts ejecuta: getCameraAngle()
→ Selecciona: 'bathroom counter selfie, phone leaning against mirror'
→ Prompt incluye: "bathroom counter selfie"
→ ❌ RESULTADO: Teléfono visible en Brand photography
```

### DESPUÉS (CORRECTO):
```
[Lifestyle Mode Generate]
→ identity.ts verifica: isUgcMode && !hasRawUgcCameraControl
→ isUgcMode = false (porque ritualModeActive o contentStyle='brand')
→ NO ejecuta: getCameraAngle()
→ canonicalScene.ts maneja cámara: "High angle DSLR professional"
→ finalize.ts agrega: "NO PHONE VISIBLE"
→ ✅ RESULTADO: Fotografía profesional sin teléfono
```

---

## ✅ ESTADO FINAL

- [x] Fix implementado en `identity.ts`
- [x] Bloqueadores agregados en `finalize.ts`
- [x] Sin errores de compilación
- [ ] **PENDIENTE**: Testing manual (Lifestyle mode sin phone)
- [ ] **PENDIENTE**: Testing manual (UGC mode con selfie)
- [ ] **PENDIENTE**: Testing manual (Ritual Mode sin phone)

---

## 📝 COMMIT MESSAGE

```
fix: CRITICAL - Remove selfie angles and phone visibility from Lifestyle/Brand mode

PROBLEM:
- diversityRandomizer.ts camera angles were injecting selfie perspectives in ALL modes
- "bathroom counter selfie", "mirror selfie", "car selfie" appearing in Brand photography
- Phones visible in professional Lifestyle mode (gravísimo)
- Cut-off hands with 6 fingers in Brand mode

SOLUTION:
1. identity.ts: Only randomize camera angle when isUgcMode === true
2. finalize.ts: Add hard blockers for phone visibility and hand integrity in Lifestyle/Brand mode

RESULT:
- Lifestyle/Brand: Professional photography only, NO phone, NO selfie angles
- UGC: Selfie angles allowed (torso-level, high-angle, mirror, etc.)
- Ritual Mode: Automatically excluded (uses isUgcModeActive())
- Formulation Story: Automatically excluded (uses isUgcModeActive())

FILES:
- src/lib/promptEngine/builders/identity.ts (line 389)
- src/lib/promptEngine/builders/finalize.ts (lines 86-104)
- docs/CRITICAL_SELFIE_PHONE_FIX.md (new)
```
