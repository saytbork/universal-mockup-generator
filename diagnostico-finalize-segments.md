# Diagnóstico: estructura de segments y resultado de finalizePromptFromSegments

## Instrumentación
Se imprimió la estructura completa de `segments` y la longitud del resultado de `finalizePromptFromSegments` en legacy y modular (genericPipeline).

---

## Resultados del test comparativo

### Coffee
**LEGACY SEGMENTS STRUCTURE:**
```json
[
  { "type": "guardrail", "content": "STUDIO_VISUAL_INTENT: luxury." },
  { "type": "guardrail", "content": "STUDIO_WORLD: controlled studio environment with bounded physical set interactions." },
  { "type": "guardrail", "content": "STUDIO_COMPOSITION_PROFILE: hero.    FRAME_CONSTRAINT: Hero framing. Product fills most vertical frame (85–92% height) with controlled side margins.    FRAME_EDGE_POLICY: Maintain real scene continuity to all four edges. No white lateral padding, no pillarbox/letterbox bars, no mirrored edge extension, no duplicated side strips, and no synthetic side-fill bands. NEGATIVE_SPACE_POLICY: Controlled and minimal. HORIZONTAL_BALANCE: controlled. VERTICAL_BALANCE: hero emphasis. Lateral splash expansion follows world constraints." },
  { "type": "guardrail", "content": "STUDIO_PRODUCT_MOTION: static." },
  { "type": "guardrail", "content": "STUDIO_MODIFIERS: none." },
  { "type": "guardrail", "content": "STUDIO_LIGHTING_PROFILE: coffee-ritual-editorial. COFFEE_LIGHTING_TEMPERATURE: neutral-daylight. COFFEE_SHADOW_PROFILE: controlled-soft. COFFEE_CONTRAST_PROFILE: medium. COFFEE_LIGHTING_FINE: lighting refinement follows coffee mood profile and steam visibility level." },
  { "type": "guardrail", "content": "STUDIO_MATERIAL_PROFILE: coffee-ceramic-priority. COFFEE_MATERIAL_PROFILE: Micro specular edge on liquid rim. Soft ceramic highlight rolloff. Controlled reflective hotspots. No plastic gloss. High realism surface diffusion. COFFEE_LIQUID_SURFACE: dark core absorption with soft surface diffusion and meniscus coherence. COFFEE_GLASS_GUARD: no wine-style glass refraction priority and no cork rendering logic." },
  { "type": "guardrail", "content": "GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Preserve proportions independent of selected lens profile. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry. Maintain rigid orthographic proportions for all products shown." }
]
```
**LEGACY FINALIZE RESULT LENGTH:** 1842

### Generic
**LEGACY SEGMENTS STRUCTURE:**
```json
[
  { "type": "guardrail", "content": "STUDIO_VISUAL_INTENT: luxury." },
  { "type": "guardrail", "content": "STUDIO_WORLD: controlled studio environment with bounded physical set interactions." },
  { "type": "guardrail", "content": "STUDIO_COMPOSITION_PROFILE: hero.    FRAME_CONSTRAINT: Hero framing. Product fills most vertical frame (85–92% height) with controlled side margins.    FRAME_EDGE_POLICY: Maintain real scene continuity to all four edges. No white lateral padding, no pillarbox/letterbox bars, no mirrored edge extension, no duplicated side strips, and no synthetic side-fill bands. NEGATIVE_SPACE_POLICY: Controlled and minimal. HORIZONTAL_BALANCE: controlled. VERTICAL_BALANCE: hero emphasis. Lateral splash expansion follows world constraints." },
  { "type": "guardrail", "content": "STUDIO_PRODUCT_MOTION: static." },
  { "type": "guardrail", "content": "STUDIO_MODIFIERS: none." },
  { "type": "guardrail", "content": "STUDIO_LIGHTING_PROFILE: sculpted directional luxury key/fill/rim with micro-specular control." },
  { "type": "guardrail", "content": "STUDIO_MATERIAL_PROFILE: premium tactile materials with controlled atmospheric layering and optical realism." },
  { "type": "guardrail", "content": "GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Preserve proportions independent of selected lens profile. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry. Maintain rigid orthographic proportions for all products shown." }
]
```
**LEGACY FINALIZE RESULT LENGTH:** 1369

**MODULAR SEGMENTS STRUCTURE:**
```json
[
  ["guardrail", "STUDIO_VISUAL_INTENT: luxury."],
  ["guardrail", "STUDIO_WORLD: controlled studio environment with bounded physical set interactions."],
  ["guardrail", "STUDIO_COMPOSITION_PROFILE: hero.    FRAME_CONSTRAINT: Hero framing. Product fills most vertical frame (85–92% height) with controlled side margins.    FRAME_EDGE_POLICY: Maintain real scene continuity to all four edges. No white lateral padding, no pillarbox/letterbox bars, no mirrored edge extension, no duplicated side strips, and no synthetic side-fill bands. NEGATIVE_SPACE_POLICY: Controlled and minimal. HORIZONTAL_BALANCE: controlled. VERTICAL_BALANCE: hero emphasis. Lateral splash expansion follows world constraints."],
  ["guardrail", "STUDIO_PRODUCT_MOTION: static."],
  ["guardrail", "STUDIO_MODIFIERS: none."],
  ["guardrail", "STUDIO_LIGHTING_PROFILE: sculpted directional luxury key/fill/rim with micro-specular control."],
  ["guardrail", "STUDIO_MATERIAL_PROFILE: premium tactile materials with controlled atmospheric layering and optical realism."],
  ["guardrail", "GEOMETRY_LOCK: Product references are provided in normalized frames matching the output aspect ratio. Each product maintains its exact intended width-to-height ratio. Preserve proportions independent of selected lens profile. Fill any empty canvas space with environmental context (surfaces, backgrounds, props, atmospheric lighting effects), NEVER by stretching, compressing, or warping the product geometry. Maintain rigid orthographic proportions for all products shown."]
]
```
**MODULAR FINALIZE RESULT LENGTH:** 0

---

## Conclusión factual
- En legacy, los segmentos son objetos `{ type, content }`.
- En modular, los segmentos son arrays `[type, content]`.
- La función `finalizePromptFromSegments` espera objetos con propiedades, no arrays.
- Por eso, en modular, `.map(segment => segment.content)` retorna `undefined` y el prompt final es vacío.

## Siguiente paso sugerido
Corregir la construcción de segmentos en el pipeline modular para que sean objetos `{ type, content }`, igual que en legacy.
