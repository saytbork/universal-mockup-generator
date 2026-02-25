# 🔐 WINE ENGINE HERMETIC LOCK

Este cierre elimina cualquier posibilidad de que V3 se ejecute para wine y blinda el pipeline ante refactors futuros.

---

## 1️⃣ BLOQUEO DURO EN ROUTER

**Archivo:** `promptRouter.ts`

```typescript
// 🔒 WINE HARD LOCK — V3 COMPLETAMENTE BLOQUEADO
if (state.visualProfile === 'wine') {
  state.wineEngineVersion = 4;
  return resolveWineV4(state);
}
```
- Esto debe estar ANTES de cualquier lógica que evalúe tiers, flags, proMode, advancedControls, legacy, feature toggles.
- Wine sale del router inmediatamente.

---

## 2️⃣ ELIMINAR CUALQUIER CHECK POSTERIOR

Buscar en todo el proyecto:

```typescript
if (visualProfile === 'wine')
```

Verificar que ninguno redirija a:
- `resolveWineConfig(...)`
- `resolveWineLegacy(...)`
- `resolveWineV3(...)`

Si existe alguno → eliminarlo.

---

## 3️⃣ BLOQUEO DEFENSIVO EN V3

**Archivo:** `wineConfigResolver.ts` (V3)

Agregar arriba:

```typescript
if (state.visualProfile === 'wine' && state.wineEngineVersion === 4) {
  throw new Error('Wine V3 execution blocked. V4 enforced.');
}
```

Esto evita ejecución accidental si alguien toca el router.

---

## 4️⃣ FORZAR STRICT GUARDRAILS LOCAL A WINE

No confiar en variable global.

Dentro de `resolveWineV4` agregar al inicio:

```typescript
segments.push('STRICT_GUARDRAILS: true.');
```

Así queda explícito en el prompt final.

---

## 5️⃣ BLOQUEO DE SEGMENTS LEGACY

En el constructor global del prompt, antes de hacer push de segmentos legacy, agregar:

```typescript
if (state.visualProfile === 'wine') {
  legacySegments = [];
}
```

Esto evita que:
- wine-prestige
- wine-neutral
- packaging behavior
- physics narrative
se mezclen accidentalmente.

---

## 6️⃣ TEST DE BLOQUEO V3

Agregar test:

```typescript
it('wine v3 blocked when profile is wine', () => {
  const state = {
    visualProfile: 'wine',
    wineEngineVersion: 4
  };

  expect(() => resolveWineLegacy(state as any)).toThrow();
});
```

---

## 7️⃣ VALIDACIÓN FINAL ESPERADA EN LOG

Debe mostrar SOLO:

```
WINE_ENGINE_VERSION: v4-deterministic
STRICT_GUARDRAILS: true
```

Y jamás:
- v3
- v3-physical
- PACKAGING_BEHAVIOR
- WINE_LIQUID_PHYSICS
- wine-prestige
- wine-neutral

---

# 🧱 ESTADO FINAL ARQUITECTÓNICO

Wine queda:

• Motor independiente
• Sin narrativa
• Sin física heredada
• Sin modifiers
• Sin fallback
• Sin flags
• Sin modo permisivo
• Determinista
• Freeze estructural

---

⚠️ **Advertencia importante**

Si después de esto vuelve a aparecer V3 en logs, el problema ya no es Wine.
Es que el pipeline global está reconstruyendo el prompt después del resolver.

En ese caso hay que aislar Wine en un namespace completamente separado del ProductStudioV2.

Si querés, el siguiente nivel es:

👉 Separar Wine en un módulo totalmente independiente fuera del builder general.

Eso elimina cualquier riesgo de recontaminación futura.

Decime si vamos a ese nivel o si cerramos aquí.
