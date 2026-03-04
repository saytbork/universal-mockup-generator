# Bug Report — Photo Mode & Motion/Interaction not affecting rendered image

**Date:** 2026-03-02  
**Branch:** `preview-v2`  
**HEAD:** `723ed33`  
**Last stable commit (Photo Mode worked):** `9b0eed8`

---

## Summary

In the V2 studio engine, changing the **Photo Mode** selector in the UI produces no visible change in the generated image. The prompt string is built correctly (the correct `PHOTO_MODE_SCENE` block appears in the logged prompt), but the rendered output always looks the same regardless of which Photo Mode is selected.

Additionally, **Motion & Interaction** controls appear in the UI (after a recent fix) but changing them also does not affect the generated image.

---

## Symptom

### 1. Photo Mode — prompt looks correct but image ignores it

The console logs confirm:

```
[STUDIO ROUTER] raw state.photoMode = "Ingredient Stack"
[STUDIO ROUTER] v2State.photoMode = "Ingredient Stack"
[buildWorld] photoMode= "Ingredient Stack" | found= true
```

The generated prompt segment is:
```
PHOTO_MODE_SCENE: clean studio surface with curated ingredient elements arranged naturally around the product, editorial commercial framing. SCENE_AUTHORITY: Photo Mode defines the environment. Do not substitute a plain studio background.
```

This is correct. But when switching to e.g. `Wet Rock Ripples`, the same hash appears:
```
[UGC DEBUG] promptHash: ad9d5ab0f5b542aafc674d467e17384f1fd46e9d375b5efa4bf4374aabd8f720
```

**The hash never changes even when photoMode changes** — suggesting the prompt being sent to the image model is NOT updating, or there is a caching layer that is serving a stale result.

### 2. Motion & Interaction — UI visible but not reflected in output

`STUDIO_PRODUCT_MOTION` and `PHYSICAL_PRESENCE` / `INTERACTION_PROFILE` blocks are present in the prompt and have correct values. But the rendered image does not reflect different interaction states (e.g. `holding`, `capsule-display`).

---

## Full Prompt (latest run — Ingredient Stack, Capsules, static, no interaction)

```
REFERENCE PRODUCT LOCK: The uploaded product image is the single source of truth. Reproduce the exact same object with zero redesign. Preserve exact geometry, silhouette, cap shape, cap color, neck height, proportions, material finish, surface texture, label layout, typography, alignment, and color relationships. Do not reinterpret. Do not regenerate. Do not restyle. Do not substitute category defaults. Do not improve or redesign packaging. The product must remain pixel-faithful to the reference image. GEOMETRY PRESERVATION: Do not stretch, scale, elongate, inflate, compress, morph, or reshape the object to satisfy framing constraints. If size adjustment is required, simulate camera proximity only. Never modify proportions. STUDIO_VISUAL_INTENT: conversion. ARTWORK_IMMUTABILITY: Preserve the product artwork exactly as in the reference image. Do not modify printed text. Do not reinterpret typography. Do not regenerate characters. Do not correct spelling. Do not substitute proper nouns. Do not rewrite geographic names. Do not alter brand names. All printed elements must remain visually identical to the source reference. No invented wording. No semantic correction. No typographic enhancement. PHOTO_MODE_SCENE: clean studio surface with curated ingredient elements arranged naturally around the product, editorial commercial framing. SCENE_AUTHORITY: Photo Mode defines the environment. Do not substitute a plain studio background. STUDIO_CAMERA_SYSTEM: DSLR / mirrorless camera system. STUDIO_CAMERA_ANGLE: 45° hero. STUDIO_CAMERA_DISTANCE: Standard. LENS_PROFILE: 50mm equivalent. DISTORTION: zero distortion baseline. DEPTH_STYLE: balanced optical depth falloff. STUDIO_CAMERA_ROTATION: 0°. ROTATION: 0°. STUDIO_FRAMING_GUIDE: Centered hero. FRAMING: Centered hero. STUDIO_VIEWPOINT: eye-level straight-on — camera at product mid-height, parallel to ground. STUDIO_COMPOSITION_PROFILE: ingredient-stack. [... full INGREDIENT_STACK_PERSPECTIVE_LOCK block ...] STUDIO_PRODUCT_MOTION: static. PHYSICAL_PRESENCE: surface. INTERACTION_PROFILE: none. No limbs in frame. No fingers. No skin contact. No shadows implying grip or hold. Product rests on surface under gravity. Contact shadow present and physically coherent. STUDIO_MODIFIERS: none. STUDIO_LIGHTING_PROFILE: conversion softbox wrap with label-priority separation. STUDIO_MATERIAL_PROFILE: clean conversion-grade surfaces optimized for label clarity and edge integrity. PHYSICAL_PLACEMENT_CONTEXT: grounded surface contact with physically correct shadow and ambient occlusion at base. PRODUCT_PHYSICAL_TYPE: capsules. CAPSULE_STYLE: veggie capsules with beige (#F5DEB3) powder/liquid contents. CAPSULE_QUANTITY: 6 capsules in grouped arrangement. CAPSULE_PROP: glass of water included as companion prop. CAPSULE_PROP: small spoon as surface prop. GEOMETRY_LOCK: [...]
```

---

## Pipeline State (HEAD `723ed33`)

### `genericPipeline.build()` order:
```typescript
buildIntent(authority, state),
buildArtworkImmutability(),
buildWorld(authority, state.world, state),       // ← emits PHOTO_MODE_SCENE
buildCameraOverrides(state),
buildComposition(authority, state),
buildMotion(authority, state),                   // ← emits STUDIO_PRODUCT_MOTION
buildInteraction(authority, state),              // ← emits PHYSICAL_PRESENCE + INTERACTION_PROFILE
buildPhysics(authority, state),
buildModifiers(modifiers, state),
buildLighting(authority, state),
buildMaterials(authority, state),
buildProductPhysical(state),                     // ← emits PRODUCT_PHYSICAL_TYPE (capsules etc.)
buildPhotoModeDynamic(state),
buildGeometry(authority, state),
...protectionLayer,
...buildAdvancedOverrideParts(state),
```

`GENERIC SEGMENTS LENGTH BEFORE FINALIZE: 12`

### `buildWorld` logic:
```typescript
const photoMode = String(state?.photoMode || '').trim();
const photoModeScene = photoMode ? PHOTO_MODE_SCENE_MAP[photoMode] : undefined;
if (photoModeScene) {
  return `PHOTO_MODE_SCENE: ${photoModeScene}. SCENE_AUTHORITY: ...`;
}
```
`PHOTO_MODE_SCENE_MAP` contains 40+ modes. All confirmed present.

---

## Key Observations

### Observation 1 — `promptHash` never changes
```
[UGC DEBUG] promptHash: ad9d5ab0f5b542aafc674d467e17384f1fd46e9d375b5efa4bf4374aabd8f720
```
This hash is **identical across multiple generations with different Photo Mode selections**. This strongly suggests that either:
- (A) The prompt string being passed to the hash function is not changing between generations, OR
- (B) There is a cache/deduplication layer somewhere that intercepts identical-looking payloads and returns the same image

### Observation 2 — `state.photoMode` is always `"Ingredient Stack"` in logs
Even when a different Photo Mode is selected in the UI, the log shows:
```
[STUDIO ROUTER] raw state.photoMode = "Ingredient Stack"
```
This means the **Zustand store's `photoMode` value is not being read correctly at generation time**, or the component that triggers generation is reading a stale snapshot of the store.

### Observation 3 — Last commit where Photo Mode worked: `9b0eed8`
At that commit, the pipeline was identical except `buildProductPhysical` was not in `build()`. The `industryRules.supplements.allowedPhotoModes` only had 6 modes (Hero Landing Page, Color Pop Hero, Ingredient Stack, Ingredient Flat Lay, Routine Carousel, Macro Dew Label) — so when the user selected another mode, `industryRules` silently forced it back. This means **Photo Mode was only "working" for those 6 modes** at `9b0eed8`.

### Observation 4 — Scene type is `studio-branding`, not `isProductMode`
```
[SCENE TYPE] studio-branding
```
The component renders in `uiActiveEngine = 'studio'` mode but `isProductMode = false`. This means `mode = 'lifestyle'` in Step3Legacy. Many conditional blocks use `mode === 'studio'` — some may still be gating store writes incorrectly.

---

## Suspected Root Cause

**The `generateImage` call (or whatever triggers the V2 pipeline) is capturing a stale `productStore.photoMode` value.** The Zustand store updates correctly when `setPhotoMode` is called, but the component that calls `generateStudioPromptV2` (via `promptRouter`) may be reading from a non-reactive snapshot or a local state copy that doesn't update reactively.

Alternatively: **there is a `useMemo` or `useCallback` somewhere that computes the prompt without `photoMode` in its dependency array**, causing the prompt to be computed once and never recomputed when photoMode changes.

---

## Files to Investigate

| File | Why |
|------|-----|
| `src/components/FinalRender.tsx` | Likely where `generateImage` is called — check if it reads `productStore.photoMode` reactively |
| `src/lib/productStudio/promptRouter.ts` | `toStudioV2State(state)` — verify `state` is fresh at call time |
| `src/components/step3/Step3Legacy.tsx` | Check if `generateImage` call is inside a stale closure / `useCallback` without `photoMode` dependency |
| `src/lib/productStudio/store.ts` | `setPhotoMode` implementation — confirm Zustand state update is synchronous |

---

## What to Look For

1. **In `FinalRender.tsx` or wherever `generateImage` is called**: is `productStore` read via `useProductStore(state => state)` (full snapshot) or via individual selectors? If it's a full snapshot captured at mount, it won't re-read `photoMode` changes.

2. **Is there a `useCallback` or `useMemo` that computes the prompt** with `[]` or incomplete dependencies that excludes `photoMode`?

3. **Is there a prompt cache keyed by something other than the full prompt string** (e.g. keyed by product image URL only) that returns the same image for any prompt?

4. **Is `generateImage` triggered correctly after `setPhotoMode` resolves?** Zustand `set()` is synchronous but React batches renders — if the generate button is clicked before the next render cycle, `state.photoMode` in the closure may be stale.

---

## Context

- Framework: React + Zustand
- Engine: V2 (`genericPipeline.build()`)  
- Industry: supplements  
- Product type: capsules  
- Scene type: `studio-branding` (`uiActiveEngine = 'studio'`, `isProductMode = false`)  
- Control tier: basic (non-PRO)
- Image model: Gemini (via `/api/generate`)
