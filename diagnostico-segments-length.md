# Diagnóstico: segments.length antes de finalizar prompt

## Instrumentación agregada
Se agregó un log en cada pipeline para imprimir la longitud de `segments` justo antes de llamar a `finalizePromptFromSegments`.

---

## Resultados del test comparativo

**Wine V4**
- WINE SEGMENTS LENGTH BEFORE FINALIZE: 9
- PROFILE: wine
- LEGACY LENGTH: 1254
- MODULAR LENGTH: 0

**Coffee**
- COFFEE SEGMENTS LENGTH BEFORE FINALIZE: 9
- PROFILE: coffee
- LEGACY LENGTH: 1842
- MODULAR LENGTH: 0

**Generic**
- GENERIC SEGMENTS LENGTH BEFORE FINALIZE: 8
- PROFILE: generic
- LEGACY LENGTH: 1369
- MODULAR LENGTH: 0

---

## Conclusión factual
- En todos los pipelines, `segments.length` es mayor que 0 antes de finalizar.
- El legacy retorna un string completo.
- El modular sigue retornando string vacío (`length: 0`).

Esto indica que el problema NO está en la construcción de los segmentos, sino en el procesamiento/finalización del prompt (probablemente en `finalizePromptFromSegments` o en cómo se ensambla el string final en el modular).
