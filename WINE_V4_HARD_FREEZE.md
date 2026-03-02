# 🔒 WINE V4 HARD FREEZE — IMPLEMENTACIÓN COMPLETA

## 1️⃣ FORZAR ROUTER A V4 (SIN FALLBACK)
**Archivo:** `promptRouter.ts`

```typescript
// WINE ENGINE HARD ROUTE — NO FALLBACK
if (state.visualProfile === 'wine') {
  state.wineEngineVersion = 4;
}
```
- Eliminar cualquier fallback a v3, chequeo por tier o dependencia de STRICT_MODE global.
- Wine siempre usa V4.

---

## 2️⃣ BLOQUEAR STRICT_GUARDRAILS PARA WINE

En donde se calcula `STRICT_GUARDRAILS`:

```typescript
if (state.visualProfile === 'wine') {
  STRICT_GUARDRAILS = true;
}
```
- Wine no puede correr en modo permisivo.

---

## 3️⃣ AISLAR V4 DEL PIPELINE V3

En el punto donde se construye el prompt:

```typescript
if (state.visualProfile === 'wine' && state.wineEngineVersion === 4) {
  return resolveWineV4(state);
}
```
- Eliminar cualquier merge posterior con:
  - `wine-prestige`
  - `wine-neutral`
  - `PACKAGING_BEHAVIOR`
  - `WINE_LIQUID_PHYSICS`
  - V3 modifiers
- Si existe algo tipo: `segments.push(...legacyWineSegments)` → eliminarlo para V4.

---

## 4️⃣ REESCRIBIR RESOLVER V4 COMO MOTOR PURO
**Archivo:** `wineConfigResolverV4.ts`

```typescript
// WINE V4 STRUCTURAL LOCK
// Deterministic physics engine
// No narrative injection
// No V3 fallback allowed
// Do not expand without architectural review

import type { StudioUIState } from '../types';

export function resolveWineV4(state: StudioUIState): string[] {
  const segments: string[] = [];

  segments.push('WINE_ENGINE_STATUS: active. deterministic.');
  segments.push('WINE_ENGINE_VERSION: v4-deterministic.');

  // COLOR LOCK
  if (!state.wineColor) {
    throw new Error('Wine V4 requires explicit wineColor.');
  }
  segments.push(
    `COLOR_LOCK: ${state.wineColor} wine. No reinterpretation allowed.`
  );

  // CLOSURE LOCK
  if (!state.wineClosureType) {
    throw new Error('Wine V4 requires explicit wineClosureType.');
  }
  const isOpen = state.bottlePresentationMode === 'open';
  if (isOpen) {
    segments.push(
      `CLOSURE_LOCK: ${state.wineClosureType}. Bottle open. Detached closure must be visible on surface.`
    );
  } else {
    segments.push(
      `CLOSURE_LOCK: ${state.wineClosureType}. Bottle sealed. Closure attached.`
    );
  }

  // VOLUME LOCK
  if (state.glassFillLevel && state.glassFillLevel !== 'None') {
    segments.push(
      'VOLUME_LOCK: Bottle liquid level must be visibly reduced and consistent with glass volume.'
    );
  }

  // CARBONATION LOCK
  if (state.wineStyle === 'sparkling') {
    segments.push(
      'CARBONATION_LOCK: Subtle realistic micro-bubbles only. No chaos.'
    );
  }

  // GEOMETRY LOCK
  segments.push(
    'GEOMETRY_LOCK: Preserve exact product proportions and label geometry. No warping, no distortion.'
  );

  return segments;
}
```

---

## 5️⃣ ELIMINAR COMPLETAMENTE ESTO DE V4

Buscar y eliminar en cualquier punto de V4:
- `WINE_LIQUID_PHYSICS`
- `PACKAGING_BEHAVIOR`
- `wine-prestige`
- `wine-neutral`
- `WINE_MOOD_PROFILE`
- `WINE_ENVIRONMENT_VARIATION` narrativa

---

## 6️⃣ FINALIZE SIN REORDENAMIENTO

Asegurarse que:

```typescript
finalizePromptFromSegments(segments)
```
NO reordena, normaliza, elimina ni muta.  
Debe mantener orden exacto.

---

## 7️⃣ VALIDACIÓN DETERMINISTA REAL

Agregar test:

```typescript
it('wine v4 determinism', () => {
  const state = {
    visualProfile: 'wine',
    wineEngineVersion: 4,
    wineColor: 'white',
    wineStyle: 'sparkling',
    wineClosureType: 'crown-cap',
    bottlePresentationMode: 'open',
    glassFillLevel: 'half'
  };

  const a = finalizePromptFromSegments(resolveWineV4(state));
  const b = finalizePromptFromSegments(resolveWineV4(state));
  const c = finalizePromptFromSegments(resolveWineV4(state));

  expect(a).toBe(b);
  expect(b).toBe(c);
});
```

---

## 8️⃣ RESULTADO ESPERADO EN LOG

Debe decir:

```
WINE_ENGINE_VERSION: v4-deterministic
STRICT_GUARDRAILS = true
```

Y el prompt final debe parecerse a:

```
WINE_ENGINE_STATUS: active. deterministic.
WINE_ENGINE_VERSION: v4-deterministic.
COLOR_LOCK: white wine. No reinterpretation allowed.
CLOSURE_LOCK: crown-cap. Bottle open. Detached closure must be visible on surface.
VOLUME_LOCK: Bottle liquid level must be visibly reduced and consistent with glass volume.
CARBONATION_LOCK: Subtle realistic micro-bubbles only. No chaos.
GEOMETRY_LOCK: Preserve exact product proportions and label geometry. No warping, no distortion.
```

Nada más.

---

## 🚨 IMPORTANTE

Mientras el log muestre:

```
WINE_ENGINE_VERSION: v3-physical
```
No estás en V4.

---

## 🎯 ESTADO FINAL

Después de aplicar esto:

- ✔ Wine aislado
- ✔ V3 eliminado
- ✔ Determinismo real
- ✔ Sin narrativa
- ✔ Sin physics heredado
- ✔ Sin packaging incorrecto
- ✔ Sin cambio de color
- ✔ Sin corcho inventado

---

¿Querés bloquear V3 completamente cuando `visualProfile === 'wine'`?  
Decime y lo cerramos hermético.
