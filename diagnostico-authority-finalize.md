# Diagnóstico: uso de authority y finalizePromptFromSegments

## 1️⃣ Legacy: llamada a finalizePromptFromSegments y construcción de authority

```typescript
// Dentro de generateStudioPromptV2_legacy
const effectiveState: StudioUIState = state;
const authority = resolveStudioAuthority(effectiveState);
...
const finalPrompt = finalizePromptFromSegments(segments, authority);
```
- En todos los casos (wine, coffee, generic), authority se resuelve una sola vez al inicio con el estado original o effectiveState.
- finalizePromptFromSegments siempre recibe ese authority.

## 2️⃣ Modular genericPipeline: llamada a finalizePromptFromSegments y construcción de authority

```typescript
// Dentro de genericPipeline.build
const authority = resolveStudioAuthority(state);
...
return finalizePromptFromSegments(segments, authority);
```
- authority se resuelve localmente en el build del pipeline, usando el state recibido.
- finalizePromptFromSegments recibe ese authority.

## 3️⃣ Modular winePipeline: (referencia)

En winePipeline, se suele pasar:
```typescript
finalizePromptFromSegments(segments, resolveStudioAuthority(wineEffectiveState))
```

## Conclusión factual
- En legacy, authority se resuelve una sola vez y se reutiliza en todos los bloques y en la finalización.
- En modular, cada pipeline resuelve authority localmente, pero usando el mismo state que recibe (que debería ser equivalente si el state no fue mutado).
- Si hay diferencia en el resultado, puede deberse a que el state pasado a resolveStudioAuthority no es exactamente igual (por ejemplo, si se muta en el pipeline o si se usa un state derivado).

## Siguiente paso sugerido
Comparar el contenido de authority en legacy vs modular justo antes de llamar a finalizePromptFromSegments, para ver si hay diferencias estructurales o de flags.
