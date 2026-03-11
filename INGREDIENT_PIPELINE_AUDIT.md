# Ingredient Pipeline — Structural Audit
**Branch:** `preview-v2` · **Date:** 2026-03-03

---

## 1. Photo Mode Registry

**File:** `src/lib/productStudio/photoModeSchema.ts`

### `Ingredient Stack`
```
id:          'ingredient-stack'
scope:       'studio'
basePrompt:  'realistic ingredients arranged around the product, physically grounded and
              scaled correctly, clean editorial advertising arrangement, ingredients rest
              on the same surface as the product'
subOptions:
  - ingredientDensity  → ['Low', 'Medium', 'High']
  - surfaceType        → ['None', 'Stone', 'Ceramic', 'Wood']
  - cameraAngle        → ['Eye-level', 'Slight top-down']
requiredPlacement:     'surface'
allowedInteractions:   ['none']
allowsPersonPresence:  false
```

### `Ingredient Flat Lay`
```
id:          'ingredient-flat-lay'
scope:       'studio'
basePrompt:  'top-down advertising flat lay composition with precise spacing, clean
              editorial balance, organized ingredient arrangement'
subOptions:
  - surfaceType      → ['Paper', 'Stone', 'Acrylic']
  - spacingRhythm    → ['Tight', 'Balanced', 'Wide']
  - shadowPresence   → ['Soft', 'Minimal', 'Defined']
  - cameraAngle      → ['Top-down']
requiredPlacement:    'surface'
allowedInteractions:  ['none']
allowsPersonPresence: false
```

---

## 2. Sub-property Types

**File:** `src/lib/productStudio/types.ts`

```typescript
type IngredientStackIngredientFocus    = 'Key active only' | 'Full formula'
type IngredientStackStackStyle         = 'Surround' | 'Split composition'
type IngredientStackIngredientPresence = 'Subtle' | 'Balanced' | 'Hero'
type IngredientStackLabelPriority      = 'Always readable' | 'Secondary to ingredients'
type IngredientStackBackgroundType     = 'Solid' | 'Gradient'
type IngredientStackGradientStyle      = 'Soft' | 'Radial' | 'Vertical'
type IngredientStackColorSource        = 'Brand Colors' | 'Custom Color'
type IngredientStackLayout             = 'auto' | 'grounded' | 'floating' | 'top-view'
```

### Full `PhotoModeConfig.ingredientStack` shape
```typescript
ingredientStack: {
    ingredientFocus:     IngredientStackIngredientFocus
    stackStyle:          IngredientStackStackStyle
    ingredientPresence:  IngredientStackIngredientPresence
    labelPriority:       IngredientStackLabelPriority
    backgroundEnabled:   boolean
    backgroundType:      IngredientStackBackgroundType
    gradientStyle:       IngredientStackGradientStyle
    colorSource:         IngredientStackColorSource
}

ingredientFlatLay?: Record<string, any>   // untyped — no defined shape
```

---

## 3. Store Defaults

**File:** `src/lib/productStudio/store.ts` (lines 567–619)

```typescript
ingredientStack: {
    ingredientFocus:    'Key active only',
    stackStyle:         'Surround',
    ingredientPresence: 'Balanced',
    labelPriority:      'Always readable',
    backgroundEnabled:  false,
    backgroundType:     'Solid',
    gradientStyle:      'Soft',
    colorSource:        'Brand Colors',
},
ingredientFlatLay: {},   // ← empty object, no defaults
```

`ingredientLayout` default lives in `ProductStudioState` at `types.ts` line 952:
```typescript
ingredientLayout: IngredientStackLayout   // default: 'grounded'
```

`props` (free-text ingredient list, e.g. `"mint, lemon, ashwagandha"`) lives in `ProductStudioState` as a `string` field. Cleared to `''` when leaving ingredient modes (`store.ts` `setPhotoMode`).

---

## 4. State → `StudioUIState` Mapping

**File:** `src/lib/productStudio/promptRouter.ts` · function `toStudioV2State()` (line 752)

### What IS mapped
| Source (`ProductStudioState`) | Target (`StudioUIState`) |
|---|---|
| `state.props` | `extras.ingredientObjects` |
| `state.ingredientLayout` | `extras.ingredientLayout` |
| `state.photoModeConfig.dynamic[photoMode].*` | `photoModeDynamicSettings` (key→value) |

### What is NOT mapped
| Field | Reason |
|---|---|
| `state.photoModeConfig.ingredientStack.ingredientFocus` | Only exists under `photoModeConfig.ingredientStack`, not under `dynamic` |
| `state.photoModeConfig.ingredientStack.stackStyle` | Same |
| `state.photoModeConfig.ingredientStack.ingredientPresence` | Same |
| `state.photoModeConfig.ingredientStack.labelPriority` | Same |
| `state.photoModeConfig.ingredientStack.backgroundEnabled/Type/etc` | Handled separately by `buildIngredientStackBackgroundLock` in old engine only |
| `customIngredients` key inside `dynamic[mode]` | **Explicitly stripped** at line 941: `if (k === 'customIngredients') continue;` |

---

## 5. `StudioUIState` Fields (ingredient-relevant)

**File:** `src/lib/productStudioV2/types/studioTypes.ts`

```typescript
ingredientObjects?: string    // ← added in current session (from state.props)
ingredientLayout?: string     // ← added in current session (from state.ingredientLayout)
photoModeDynamicSettings?: Record<string, string>   // generic key→value from dynamic[mode]
```

---

## 6. `STUDIO_COMPOSITION_PROFILE` injection

**File:** `src/lib/productStudioV2/builders/buildComposition.ts`  
**Function:** `buildComposition(authority, state)`

```typescript
const ingredientStackMode = authority.composition === 'ingredient-stack'

return [
  `STUDIO_COMPOSITION_PROFILE: ${authority.composition}.`,   // ← emitted here

  ingredientStackMode
    ? 'INGREDIENT_STACK_PERSPECTIVE_LOCK: Camera must be front-facing or 45° hero angle. ...'
    : '',

  flatLayMode
    ? 'COMPOSITION_DIRECTIVE: Top-down flat lay composition. ...'
    : '',

  ingredientStackMode
    ? 'CRITICAL_COMPOSITION_GUARD: If composition resembles flat lay, ..., regenerate.'
    : '',
].join(' ')
```

For `Ingredient Stack`: `authority.composition = 'ingredient-stack'`  
For `Ingredient Flat Lay`: `authority.composition = 'flat-lay'`

---

## 7. `buildIngredients` — new builder

**File:** `src/lib/productStudioV2/builders/buildIngredients.ts`

```typescript
const INGREDIENT_MODES = new Set(['Ingredient Stack', 'Ingredient Flat Lay'])

export function buildIngredients(state?: StudioUIState): string {
  // Guard 1: only runs for ingredient photo modes
  if (!INGREDIENT_MODES.has(photoMode)) return ''

  // Guard 2: no-op if ingredientObjects is empty
  if (!objects) return ''

  // Emits:
  // INGREDIENT_OBJECTS: <objects>.
  // INGREDIENT_LAYOUT: <layoutDirective>.
  // INGREDIENT_MANDATORY: ...
  // INGREDIENT_VISUALIZATION: ...
}
```

Reads `state.ingredientObjects` and `state.ingredientLayout`.  
Returns `''` (no-op) for all other photo modes.

---

## 8. Segment Push Order — `genericPipeline.build()`

**File:** `src/lib/productStudioV2/pipelines/genericPipeline.ts`

```
Position  Builder                         Key emitted
────────  ──────────────────────────────  ─────────────────────────────────────────
1         buildIntent                     STUDIO_VISUAL_INTENT / STUDIO_CREATIVE_INTENT
2         buildArtworkImmutability        ARTWORK_IMMUTABILITY
3         buildWorld                      STUDIO_WORLD
4         buildCameraOverrides            STUDIO_CAMERA_* / FRAMING
5         buildComposition                STUDIO_COMPOSITION_PROFILE  ← here
6         buildMotion                     STUDIO_PRODUCT_MOTION
7         buildInteraction                PRODUCT_INTERACTION
8         buildPhysics                    PHYSICS
9         buildModifiers                  STUDIO_MODIFIERS
10        buildLighting                   STUDIO_LIGHTING_PROFILE
11        buildMaterials                  STUDIO_MATERIAL_PROFILE
12        buildProductPhysical            PRODUCT_PHYSICAL_DEF
13        buildPhotoModeDynamic           PHOTO_MODE_DYNAMIC_CONTROLS (ingredientFocus etc via PHOTO_MODE_SETTING_*)
14        buildGeometry                   GEOMETRY
15        buildIngredients                INGREDIENT_OBJECTS / INGREDIENT_LAYOUT ← here
16+       ...protectionLayer              ULTRA_REAL (if STRICT_GUARDRAILS)
last      ...buildAdvancedOverrideParts   LENS_PROFILE / ACCENT_LIGHT_GEL / etc
```

All blocks pass through `sanitizePromptParts` (key-based dedup, **first-occurrence wins**), then wrapped as `{ type: 'guardrail', content }`, then joined with `' '` in `finalizePromptFromSegments`.

---

## 9. Key Deduplication Rule

**File:** `src/lib/productStudioV2/index.ts` · `sanitizePromptParts()`

```typescript
// Key = everything before the first ':'
// If the same key appears twice, the FIRST occurrence is kept, the rest dropped.
if (seen.has(dedupeKey)) continue;
seen.add(dedupeKey);
```

`INGREDIENT_OBJECTS` and `INGREDIENT_LAYOUT` are unique keys — no dedup collision risk.  
`STUDIO_COMPOSITION_PROFILE` is emitted once (position 5) — not duplicated.

---

## 10. Known Gaps

| Gap | Location |
|---|---|
| `ingredientStack.ingredientFocus` / `stackStyle` / `ingredientPresence` / `labelPriority` are never forwarded to `StudioUIState` or `photoModeDynamicSettings` | `toStudioV2State()` in `promptRouter.ts` — `photoModeConfig.ingredientStack` is not iterated |
| `ingredientFlatLay` has no typed shape — always `{}` in store | `store.ts` line 619 |
| `buildPhotoModeDynamic` emits sub-settings only for `dynamic[mode]` keys — `ingredientStack` config lives outside `dynamic` | `promptRouter.ts` lines 938–954 |
