# sceneType Mutation Bug Fix Report

**Date:** March 3, 2026
**Branch:** `preview-v2`
**Commit:** `b52b6c0`
**Tests:** 283/283 passing

---

## Bug Description

Activating Physical Presence caused `sceneType` to change from `"studio-branding"` to `"lifestyle-real"`.

This broke routing in `App.tsx` — `isStudioBrandingScene` became `false`, `isStudioEngine` became `false`, and `generateProductJobs` was no longer called. The world authority was rebuilt from scratch using the lifestyle pipeline, replacing the active Photo Mode world.

**Observed:**
- Before enabling Physical Presence: `sceneType = "studio-branding"`
- After enabling Physical Presence: `sceneType = "lifestyle-real"`

---

## Root Cause

**File:** `src/components/step3/Step3Legacy.tsx`
**Lines:** 2160–2165 (pre-fix) — Phase 3 emit effect

```ts
// PRE-FIX
const sceneType: 'studio-branding' | 'lifestyle-real' =
  normalizedCreationMode === 'aesthetic' ||
  normalizedCreationMode === 'lifestyle' ||
  normalizedCreationMode === 'ugc'
    ? 'lifestyle-real'
    : 'studio-branding';
```

The emitted `sceneType` was derived **exclusively from `values.creationMode`**.

When `isProductMode = false`, `values.creationMode` is initialized to `'Aesthetic Builder'` (line 1289):

```ts
creationMode: initialSceneIntent === 'ecommerce' ? 'Lifestyle UGC' : 'Aesthetic Builder',
```

`normalizeCreationModeForEmit('Aesthetic Builder')` returns `'aesthetic'` → `sceneType = 'lifestyle-real'` — **on every single emit**, regardless of what the user clicked or whether `productStore.sceneType` was `'studio-branding'`.

Physical Presence toggles trigger a re-render → the Phase 3 emit fires → `sceneType: 'lifestyle-real'` is emitted → `App.tsx` receives it → `isStudioBrandingScene = false` → V2 engine bypassed.

`productStore.sceneType` — the authoritative flag set when the user chose a studio scene — was **never consulted** in the emit.

---

## Trace

| Step | What happens |
|------|-------------|
| User is in `studio-branding` scene (`isProductMode = false`) | `productStore.sceneType = 'studio-branding'` |
| User clicks any Physical Presence chip | `productStore.setPhysicalProperty(...)` → React re-render |
| Phase 3 emit effect fires | `values.creationMode = 'Aesthetic Builder'` → `normalizeCreationModeForEmit` → `'aesthetic'` |
| `sceneType` computed as `'lifestyle-real'` | `productStore.sceneType` not read |
| `onValuesChange(payload)` emits `sceneType: 'lifestyle-real'` | `lifestyleStep3Values.sceneType = 'lifestyle-real'` in App.tsx |
| `isStudioBrandingScene = false` | `isStudioEngine = false` |
| `generateProductJobs` NOT called | Lifestyle pipeline runs instead |
| Photo Mode world replaced | Bug visible to user |

---

## Fix

**File:** `src/components/step3/Step3Legacy.tsx`

```diff
  // PHASE 3: Emit sceneState on EVERY change
  useEffect(() => {
    const normalizedCreationMode = normalizeCreationModeForEmit(values.creationMode);
-   const sceneType: 'studio-branding' | 'lifestyle-real' =
+   const creationModeSceneType: 'studio-branding' | 'lifestyle-real' =
      normalizedCreationMode === 'aesthetic' ||
        normalizedCreationMode === 'lifestyle' ||
        normalizedCreationMode === 'ugc'
        ? 'lifestyle-real'
        : 'studio-branding';
+   // When the V2 studio engine is active (productStore.sceneType === 'studio-branding'),
+   // Physical Presence and other studio controls must NOT mutate sceneType to 'lifestyle-real'.
+   // productStore.sceneType is the authoritative signal — it never changes on Physical Presence toggles.
+   const sceneType: 'studio-branding' | 'lifestyle-real' =
+     productStore.sceneType === 'studio-branding' ? 'studio-branding' : creationModeSceneType;
```

Also added `productStore.sceneType` to the effect's dependency array:

```diff
- }, [values, onValuesChange]);
+ }, [values, onValuesChange, productStore.sceneType]);
```

### Why this works

`productStore.sceneType` is set to `'studio-branding'` when the user selects a studio scene. It is:
- **Never mutated** by Physical Presence chips (`setPhysicalProperty` only)
- **Never mutated** by Photo Mode chips (`setPhotoMode` only)
- **Never mutated** by interaction chips (`setInteraction` only)
- **Only changed** by explicit `productStore.setSceneType(...)` calls

Using it as the authority means no studio UI interaction can accidentally emit `sceneType: 'lifestyle-real'`, regardless of what `values.creationMode` is.

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/step3/Step3Legacy.tsx` | Phase 3 emit: `sceneType` uses `productStore.sceneType` as authority when V2 engine is active |

## Commit History (session)

| Commit | Description |
|--------|-------------|
| `40ecaf4` | `mode` derives from `uiActiveEngine` — photo mode chips render when `isProductMode=false` |
| `c19bc99` | `[SET PHOTO MODE]` diagnostic log in `setPhotoMode` |
| `b52b6c0` | **This fix** — emit uses `productStore.sceneType` as authority for `sceneType` |
