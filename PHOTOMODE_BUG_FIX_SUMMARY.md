# Photo Mode Bug Fix Summary

## Bug Description

Photo Mode selection in the UI had no visible effect on rendered images.
Despite the user clicking a different Photo Mode chip, the generated prompt always contained the same scene description (e.g. `PHOTO_MODE_SCENE: ingredient stack...`).

---

## Root Cause

`productStore.setPhotoMode()` was **never called** when `isProductMode = false`.

The `photoMode` value visible in logs (`"Ingredient Stack"`) was simply the last persisted value in the store — from a previous session or previous chip click that happened to work under `isProductMode = true`. No secondary overwrite was occurring. The store held stale state and was never updated because the chip click handlers didn't exist in the DOM.

### Why

In `Step3Legacy.tsx`, the `mode` variable was derived as:

```ts
const mode: 'studio' | 'lifestyle' = isEcommerceMode ? 'studio' : 'lifestyle';
```

Where:

```ts
const isEcommerceMode = isProductMode || values.sceneIntent === 'ecommerce';
```

When `isProductMode = false` and `values.sceneIntent !== 'ecommerce'` (e.g. the user is in a `studio-branding` scene launched from the lifestyle flow), both conditions evaluated to `false` → `mode = 'lifestyle'`.

The entire studio UI block — including all photo mode chips and their click handlers — is gated by:

```tsx
{mode === 'studio' && (
  <StudioStep3Layout>
    ...
    // applyPhotoMode defined here
    // photo mode chip onClick → applyPhotoMode(mode) → productStore.setPhotoMode(mode)
  </StudioStep3Layout>
)}
```

Since `mode = 'lifestyle'`, this block **was never rendered**. The chips didn't exist in the DOM. `applyPhotoMode` was never called. `productStore.photoMode` stayed at its initial value (`"Ingredient Stack"`) forever, producing an identical hash and identical render on every generation.

---

## Diagnostic: Full Overwrite Trace

A full codebase trace was run to rule out secondary overwrites. Every path that could touch `photoMode` after `setPhotoMode` is called:

| Location | What it does | Overwrites? |
|----------|-------------|-------------|
| `store.ts:720` | Initial state: `'Hero Landing Page'` | Only on first mount |
| `store.ts:1765` | `setPhotoMode` implementation | ✅ The intended write |
| `store.ts:436/455/475/495` | `BRAND_PRESETS` static objects | Not applied automatically |
| `Step3Legacy.tsx:1476/1478` | `applyIndustryProfile` → `setPhotoMode('Hero Landing Page')` | Only on industry switch (wine↔supplements) |
| `Step3Legacy.tsx:2207–2238` | "Phase 3.5" sync: `store → values.studioPhotoMode` | One-way read, does NOT write back |
| `promptRouter.ts:966–967` | `allowedPhotoModes` guard in `toStudioV2State` | Coerces to `allowedPhotoModes[0]` = `'Hero Landing Page'` if mode not in list — NOT `'Ingredient Stack'` |
| `updateProductStudioValue` | switch/case dispatch | No `photoMode` case — cannot write it |
| `resetIndustryFields` | wine/coffee field reset | Does NOT touch `photoMode` |
| `generateProductJobs` / `App.tsx:5221` | Reads `useProductStudioStore.getState()` | Read-only |

**Conclusion:** There is no secondary overwrite. The `"Ingredient Stack"` in logs was stale state from a previous `isProductMode = true` session. The fix at `40ecaf4` is sufficient.

### Diagnostic log added (`c19bc99`)

```ts
// store.ts — setPhotoMode
setPhotoMode: (mode) =>
    set((state) => {
        console.log('[SET PHOTO MODE]', mode);  // ← added
        ...
    })
```

After `40ecaf4`, clicking a chip now produces `[SET PHOTO MODE] <selected_mode>` in console. If this log does NOT appear when clicking a chip, there is a render environment issue (chip not mounted).

---

## Fix

**File:** `src/components/step3/Step3Legacy.tsx`
**Commit:** `40ecaf4`

Extended `mode` to also resolve to `'studio'` when `uiActiveEngine === 'studio'`:

```ts
// Before:
const mode: 'studio' | 'lifestyle' = isEcommerceMode ? 'studio' : 'lifestyle';

// After:
// uiActiveEngine === 'studio' covers the isProductMode=false + studio-branding scene case,
// ensuring the studio UI block (and its photo mode chips) always renders when the V2 engine is active.
const mode: 'studio' | 'lifestyle' = (isEcommerceMode || uiActiveEngine === 'studio') ? 'studio' : 'lifestyle';
```

`uiActiveEngine` is already the canonical flag for "V2 studio engine is active":

```ts
const uiActiveEngine: 'studio' | 'lifestyle' = uiSceneType === 'studio-branding' ? 'studio' : 'lifestyle';
```

Additionally, `applyPhotoMode` itself was cleaned up to always call the store unconditionally:

```ts
// Before:
const applyPhotoMode = (selectedMode: string) => {
  // Only update store if not in lifestyle mode
  if (mode !== 'lifestyle') {
    productStore.setPhotoMode(selectedMode);
  }
};

// After:
const applyPhotoMode = (selectedMode: string) => {
  // Always update ProductStudio store with selected Photo Mode
  productStore.setPhotoMode(selectedMode);
};
```

---

## Effect

With this fix, when a user selects a Photo Mode chip:

1. `applyPhotoMode(selectedMode)` fires
2. `productStore.setPhotoMode(selectedMode)` is called
3. `useProductStudioStore.getState().photoMode` reflects the user's selection
4. `generateProductJobs()` → `toStudioV2State()` → `buildWorld()` emits the correct `PHOTO_MODE_SCENE: ...`
5. The prompt hash changes → a new render is triggered with the correct scene

---

## Tests

283/283 passing after the fix.

---

## Commit History (related)

| Commit | Description |
|--------|-------------|
| `c92a403` | buildProductPhysical in pipeline (gray render fix) |
| `5435522` | buildPackaging removed |
| `cb65955` | MotionInteractionBlock visible when `uiActiveEngine === 'studio'` |
| `138034e` | allowedPhotoModes expanded to 40+ modes |
| `723ed33` | Debug logs |
| `5f07862` | V2 routing fix + store `allowed[]` fix |
| `50feaf1` | `isStudioEngine` canonical refactor in App.tsx |
| `40ecaf4` | **Primary fix** — `mode` derives from `uiActiveEngine` |
| `c19bc99` | Diagnostic `[SET PHOTO MODE]` log in `setPhotoMode` |
