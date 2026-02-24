# Diagnóstico: Diferencia Wine V4 modular vs legacy tras fix de segmentos

## Resumen
- Coffee y Generic: 100% idénticos (output y longitud)
- Wine V4: mismatch, misma longitud pero diferencia en el prompt

## Detalle del diff relevante

### Prompt legacy (inicio relevante):
```
WINE_ENGINE_STATUS: active. deterministic. WINE_CONFIG_RESOLVED: wineType=auto; closureType=from-reference; bottleState=open; glassFillLevel=none; carbonationLevel=none; VOLUME_LOCK: Glass contains liquid. Bottle liquid level must be visibly lower than unopened reference. Bottle must not appear near full. Clear visible reduction required. If bottle appears full, result is incorrect. CLOSURE_LOCK: Bottle is open. No cap attached to bottle. Exactly one detached crown-cap visible on surface. No duplicate caps. If bottle appears closed, result is incorrect. COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma. GEOMETRY_LOCK: Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching. Bottle perfectly vertical. Zero roll. No tilt. Stable upright orientation. COMPOSITION: Product-first framing. Rule of thirds alignment. Bottle upright at 0° tilt unless pouring. Elegant negative space. STUDIO_WORLD: controlled studio environment with bounded physical set interactions. STUDIO_LIGHTING_MODEL: wine-prestige. MATERIALS: Real glass. Natural liquid translucency. Label fidelity. PHYSICAL_REALISM: Coherent optics. Material integrity. Gravity consistency.
```

### Prompt modular (inicio relevante):
```
WINE_ENGINE_STATUS: active. deterministic. WINE_CONFIG_RESOLVED: wineType=auto; closureType=from-reference; bottleState=open; glassFillLevel=none; carbonationLevel=none; VOLUME_LOCK: Glass contains liquid. Bottle liquid level must be visibly lower than unopened reference. Bottle must not appear near full. Clear visible reduction required. If bottle appears full, result is incorrect. CLOSURE_LOCK: Bottle is open. No cap attached to bottle. Exactly one detached crown-cap visible on surface. No duplicate caps. If bottle appears closed, result is incorrect. COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma. GEOMETRY_LOCK: Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching. COMPOSITION: Product-first framing. Rule of thirds alignment. Bottle upright at 0° tilt unless pouring. Elegant negative space. STUDIO_WORLD: controlled studio environment with bounded physical set interactions. STUDIO_LIGHTING_MODEL: wine-prestige. MATERIALS: Real glass. Natural liquid translucency. Label fidelity. PHYSICAL_REALISM: Coherent optics. Material integrity. Gravity consistency.
```

## Observación
- El prompt es casi idéntico, pero en el modular falta la frase:
  `Bottle perfectly vertical. Zero roll. No tilt. Stable upright orientation.`
- En legacy, esa frase aparece después de `GEOMETRY_LOCK: ...`.
- En modular, no aparece.

## Hipótesis
- El bloque `winePhysicsBlock` en modular no está incluyendo la frase extra cuando corresponde.
- Revisar la lógica:
  ```ts
  if (wineEngineVersion >= 4 && !winePhysicsBlock.includes('Bottle perfectly vertical. Zero roll. No tilt. Stable upright orientation.')) {
    winePhysicsBlock += ' Bottle perfectly vertical. Zero roll. No tilt. Stable upright orientation.';
  }
  ```
- Puede que el orden de los segmentos o la lógica de concatenación esté alterando el resultado.

## Siguiente paso sugerido
- Revisar el contenido real de `winePhysicsBlock` en ambos flujos.
- Confirmar si la frase extra se agrega correctamente en modular.
- Si no, ajustar la lógica para que el prompt final sea idéntico.
