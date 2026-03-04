# Background Color Resolver Fix — Hero Landing Page & Color Pop Hero

**Branch:** `preview-v2`
**Date:** 2026-03-04
**Tests:** 289/289 passing

---

## Problem

Hero Landing Page and Color Pop Hero were not injecting product-derived background colors into the final prompt.

### Root Causes

**1. Color Pop Hero — wrong execution branch**
`photoModeResult.isValid = true` because Color Pop Hero has a `basePrompt` registered in `photoModeSchema`.
The engine was taking the `else if (photoModeResult.isValid && photoModeResult.basePrompt)` branch in `mapSceneToPrompt.ts` and bypassing `buildColorPopHeroScene` entirely.
The `sceneInput` override (with resolved brand color) was computed but never consumed.

**2. No shared resolver**
There was no unified function that enforced the brand palette priority chain for both modes.
Each mode had its own fragmented logic scattered across `store.ts`, `sceneBuilders.ts`, and `mapSceneToPrompt.ts`.

**3. `buildColorPopHeroScene` used random aesthetic logic**
It used `palette`, random `structures[]`, random `amplifiers[]`, and emitted `"No flat solid backgrounds."` — directly contradicting deterministic brand color injection.

---

## Changes

### `src/lib/productStudio/mapSceneToPrompt.ts`

**Added:** `resolveStudioBackgroundColor(photoMode, state)` — shared deterministic resolver.

Priority chain:
1. `paletteSource === 'Custom'` → use `state.backgroundColor` / `state.gradientStart` / `state.gradientEnd` only. No brand extraction.
2. Product label palette → `activeProduct.palette.dominant` (primary), `.secondary`, `.accent`
3. Brand system palette → `state.palette.primaryColor`, `.secondaryColor`, `.accentColor`
4. Fallback → `#FFFFFF`

**Hero Landing Page:**
- `backgroundType === 'Solid'` → primary color as solid
- `backgroundType === 'Gradient'` → primary + secondary + tertiary stops

**Color Pop Hero:**
- Always solid, primary color only, `gradientEnabled = false`

**Fixed execution branch:**
```typescript
// BEFORE — Color Pop Hero fell through to photoModeResult.basePrompt
} else if (photoModeResult.isValid && photoModeResult.basePrompt) {
  scene = photoModeResult.basePrompt;

// AFTER — Color Pop Hero explicitly routed before photoModeResult check
} else if (state.photoMode === 'Color Pop Hero') {
  scene = buildColorPopHeroScene(sceneInput);
} else if (photoModeResult.isValid && photoModeResult.basePrompt) {
  scene = photoModeResult.basePrompt;
```

**`sceneInput` fields overridden for both modes:**
```typescript
backgroundColor: isHeroOrColorPop ? resolvedBg.backgroundColor : state.backgroundColor,
gradientEnabled: isHeroOrColorPop ? resolvedBg.gradientEnabled : state.gradientEnabled,
gradientStart:   isHeroOrColorPop ? resolvedBg.gradientStart   : state.gradientStart,
gradientEnd:     isHeroOrColorPop ? resolvedBg.gradientEnd     : state.gradientEnd,
gradientMid:     isHeroOrColorPop ? resolvedBg.gradientMid     : state.gradientMid,
```

---

### `src/lib/productStudio/promptParts/sceneBuilders.ts`

**`buildColorPopHeroScene`** — replaced random-aesthetic implementation with deterministic brand-color builder:

```typescript
// BEFORE
export function buildColorPopHeroScene({ randomizer, palette }: SceneBuildInput): string {
  // random structures[], random amplifiers[], paletteDescriptor(palette)
  // "No flat solid backgrounds."
}

// AFTER
export function buildColorPopHeroScene({ backgroundColor }: SceneBuildInput): string {
  const color = backgroundColor || '#FFFFFF';
  return [
    `Vivid color-field studio background in ${color}.`,
    'High-contrast product silhouette against the brand color background.',
    'Bold, clean, product fully centered.',
    'No random palette guessing. No vibrant heuristics. Color derived from brand palette only.',
    'Flat solid brand color background with subtle depth from lighting only.',
  ].join(' ');
}
```

---

## Validation Logs

Test file: `src/lib/prompt/__tests__/bgResolver.validate.test.ts`

### Hero Landing Page — Gradient (label colors)
```
[DEBUG][STUDIO_BG_RESOLVER] finalColorSource= label  photoMode= Hero Landing Page
resolved= {"backgroundColor":"#C0392B","gradientEnabled":true,"gradientStart":"#C0392B","gradientEnd":"#2980B9","gradientMid":"#F1C40F"}

buildStudioHeroScene output:
"Clean studio hero composition. Soft three-color gradient background blending #C0392B, #F1C40F, and #2980B9. No environment, no props, no setting. Subtle studio gradient only. Negative space is balanced; clear copy-safe area reserved for overlays. Product isolated and positioned for hero landing page."
```

### Hero Landing Page — Solid (label colors)
```
[DEBUG][STUDIO_BG_RESOLVER] finalColorSource= label  photoMode= Hero Landing Page
resolved= {"backgroundColor":"#C0392B","gradientEnabled":false,"gradientStart":"#C0392B","gradientEnd":"#C0392B","gradientMid":""}

buildStudioHeroScene output:
"Clean studio hero composition. Seamless solid background in color #C0392B. No environment, no props, no setting. Flat studio background with subtle depth only. Negative space is balanced; clear copy-safe area reserved for overlays. Product isolated and positioned for hero landing page."
```

### Hero Landing Page — Custom override
```
[DEBUG][STUDIO_BG_RESOLVER] finalColorSource=Custom  photoMode= Hero Landing Page
resolved= {"backgroundColor":"#112233","gradientEnabled":true,"gradientStart":"#112233","gradientEnd":"#445566","gradientMid":""}
```
`#C0392B` not present in prompt. ✅

### Hero Landing Page — Fallback to brand system palette
```
[DEBUG][STUDIO_BG_RESOLVER] finalColorSource= brand  photoMode= Hero Landing Page
resolved= {"backgroundColor":"#7B1FA2","gradientEnabled":true,"gradientStart":"#7B1FA2","gradientEnd":"#4CAF50","gradientMid":""}
```

### Color Pop Hero — Solid from label palette
```
[DEBUG][STUDIO_BG_RESOLVER] finalColorSource= label  photoMode= Color Pop Hero
resolved= {"backgroundColor":"#C0392B","gradientEnabled":false,"gradientStart":"#C0392B","gradientEnd":"#C0392B","gradientMid":""}

[DEBUG][mapSceneToPrompt] COLOR_POP_HERO scene built (deterministic):
"Vivid color-field studio background in #C0392B. High-contrast product silhouette against the brand color background. Bold, clean, product fully centered. No random palette guessing. No vibrant heuristics. Color derived from brand palette only. Flat solid brand color background with subtle depth from lighting only."
```

### Color Pop Hero — Custom override
```
[DEBUG][STUDIO_BG_RESOLVER] finalColorSource=Custom  photoMode= Color Pop Hero
resolved= {"backgroundColor":"#00BCD4","gradientEnabled":false,"gradientStart":"#FFFFFF","gradientEnd":"#FFFFFF","gradientMid":""}
```
`#C0392B` not present in prompt. ✅

---

## Execution Order (V1 path — `mapSceneToPrompt`)

```
resolveStudioBackgroundColor()         ← runs first, populates resolvedBg
sceneInput constructed                 ← overridden with resolvedBg for Hero/ColorPop
heroStudioLocked check                 ← Hero Landing Page locked path → buildStudioHeroScene(sceneInput)
Color Pop Hero explicit check          ← NEW branch → buildColorPopHeroScene(sceneInput)
photoModeResult.isValid check          ← all other modes
sceneBuilders switch                   ← fallback
```

No other background logic runs after `buildStudioHeroScene` or `buildColorPopHeroScene` for these two modes (the `heroStudioLocked` path returns early; Color Pop Hero path sets `scene` then continues to `assemblePrompt`).

---

## Invariants Guaranteed

| Rule | Enforced |
|---|---|
| Custom always overrides brand extraction | ✅ |
| Label colors take priority over brand system | ✅ |
| Color Pop Hero is always solid (no gradient) | ✅ |
| No aesthetic guessing / random vibrant heuristics | ✅ |
| Hero Landing Page respects `backgroundType` from config | ✅ |
| `gradientMid` (3rd stop) only set when label has 3 colors | ✅ |
| `#FFFFFF` fallback when no colors available | ✅ |
| `store.ts` does NOT mutate background fields | ✅ |

---

## store.ts Stabilization

`applyHeroLandingBackgroundDefaults` was stripped of all background mutation logic.

**Removed:**
- Automatic gradient vs. solid type guessing based on `distinct.length >= 2`
- All mutations of `backgroundColor`, `gradientEnabled`, `gradientStart`, `gradientEnd`, `gradientMid`, `gradientAngle`
- Auto color lock bypass logic (`state.colorLocks.*`)
- Gradient angle defaults from `gradientStyle`
- Debug logs

**Kept:** Function shell — still called at 3 call sites, returns `{}`.

**Also removed:** Post-call mutation in `setPhotoModeConfig`:
```typescript
// REMOVED — was leaking gradientEnabled mutation around applyHeroLandingBackgroundDefaults
if (withAuto.photoMode === 'Hero Landing Page' && patch.heroLandingPage?.backgroundType) {
    heroDerived.gradientEnabled = patch.heroLandingPage.backgroundType === 'Gradient';
}
```

**Guard comment added at function definition:**
```typescript
// Background color resolution moved to resolveStudioBackgroundColor (mapSceneToPrompt.ts)
// Do not reintroduce automatic background mutation here.
```
