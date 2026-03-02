# Diagnóstico bug: modular vs legacy prompt

## Datos crudos del test comparativo

---

**Wine V4**
- PROFILE: wine
- LEGACY LENGTH: 1254
- MODULAR LENGTH: 0

**Coffee**
- PROFILE: coffee
- LEGACY LENGTH: 1842
- MODULAR LENGTH: 0

**Generic**
- PROFILE: generic
- LEGACY LENGTH: 1369
- MODULAR LENGTH: 0

---

**Conclusión factual:**
- El legacy está devolviendo prompts completos (longitud > 0) para todos los perfiles.
- El modular está devolviendo string vacío (`length: 0`) para todos los perfiles.

Esto confirma que el problema está en la implementación modular: no está ejecutando ni retornando el prompt, mientras que el legacy sí lo hace.

---

# Return final de cada pipeline

**winePipeline.ts**
```typescript
    const prompt = sanitizeWineV4Prompt(
      sanitizePromptLexicalGuard(
        dedupeWineStructuralTokens(finalizePromptFromSegments(segments, resolveStudioAuthority(wineEffectiveState)))
      )
    );
    return prompt;
```

**coffeePipeline.ts**
```typescript
    const finalPrompt = finalizePromptFromSegments(segments, authority);
    return finalPrompt;
```

**genericPipeline.ts**
```typescript
    return finalizePromptFromSegments(segments, authority);
```

---

# Bloque relevante de generateStudioPromptV2

```typescript
export function generateStudioPromptV2(state: StudioUIState): string {
  const profile = state.visualProfile || 'generic';
  const pipeline = profileRegistry[profile as keyof typeof profileRegistry] || profileRegistry.generic;
  return pipeline.build(state);
}
```

---

# Confirmación de método build en pipelines

Todos los pipelines (`winePipeline`, `coffeePipeline`, `genericPipeline`) exportan exactamente:

```typescript
export const winePipeline = {
  build(state: StudioUIState): string {
    // ...
  }
};
```
y lo mismo para los otros dos.

---

# Estado actual

La función actual en `index.ts` ya es:

```typescript
export function generateStudioPromptV2(state: StudioUIState): string {
  const profile = state.visualProfile || 'generic';
  const pipeline = profileRegistry[profile as keyof typeof profileRegistry] || profileRegistry.generic;
  return pipeline.build(state);
}
```

No hay fallback `|| ''` ni uso de `?.build`. El código ya está correcto y equivalente a legacy.
