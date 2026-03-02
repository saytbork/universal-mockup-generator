# Diagnóstico: comparación de authority legacy vs modular

## Instrumentación
Se imprimió el objeto `authority` justo antes de llamar a `finalizePromptFromSegments` en ambos flujos (legacy y modular).

---

## Resultados del test comparativo

**Coffee**
- LEGACY AUTHORITY:
```json
{"creativeIntent":"luxury","world":"studio","motion":"static","composition":"hero","permissions":{"allowSplash":false,"allowAtmosphere":true,"allowParticles":true,"allowHorizontalSpread":true,"allowVerticalDominance":false}}
```

**Generic**
- LEGACY AUTHORITY:
```json
{"creativeIntent":"luxury","world":"studio","motion":"static","composition":"hero","permissions":{"allowSplash":false,"allowAtmosphere":true,"allowParticles":true,"allowHorizontalSpread":true,"allowVerticalDominance":false}}
```
- MODULAR AUTHORITY:
```json
{"creativeIntent":"luxury","world":"studio","motion":"static","composition":"hero","permissions":{"allowSplash":false,"allowAtmosphere":true,"allowParticles":true,"allowHorizontalSpread":true,"allowVerticalDominance":false}}
```

---

## Conclusión factual
- El objeto `authority` es idéntico en legacy y modular para Coffee y Generic.
- Sin embargo, el modular sigue retornando string vacío (`length: 0`).
- Esto indica que el problema NO está en authority ni en los permisos, sino en otra parte del flujo de ensamblado/finalización del prompt.

## Siguiente paso sugerido
Inspeccionar y comparar la implementación de `finalizePromptFromSegments` en legacy y modular, para detectar diferencias en el procesamiento de los segmentos.
