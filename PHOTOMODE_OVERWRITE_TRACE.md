# Photo Mode — Full Overwrite Trace Report

**Date:** March 3, 2026
**Branch:** `preview-v2`
**Investigator:** GitHub Copilot
**Trigger:** Logs showing `v2State.photoMode = "Ingredient Stack"` / `raw state.photoMode = "Ingredient Stack"` regardless of UI chip selection.

---

## Question

> Is `setPhotoMode` never called, or is `photoMode` being overwritten after being set?

**Answer: `setPhotoMode` was never called.** There is no secondary overwrite.

---

## Full Trace

### A) Is `setPhotoMode` actually called when clicking a chip?

**No** — before fix `40ecaf4`.

The chip click handlers live inside the `{mode === 'studio' && (<StudioStep3Layout>...)}` block at **`Step3Legacy.tsx:2736`**.

`mode` was derived as:

```ts
// Step3Legacy.tsx:2326 (pre-fix)
const mode: 'studio' | 'lifestyle' = isEcommerceMode ? 'studio' : 'lifestyle';
// isEcommerceMode = isProductMode || values.sceneIntent === 'ecommerce'
```

When `isProductMode = false` AND `values.sceneIntent !== 'ecommerce'` (studio-branding scene launched from the lifestyle flow):
- `isEcommerceMode = false`
- `mode = 'lifestyle'`
- The entire `{mode === 'studio' && ...}` block **does not render**
- Chip `onClick` handlers **do not exist in the DOM**
- `applyPhotoMode` is **never called**
- `productStore.setPhotoMode` is **never called**

### B) What file + line overwrites `photoMode` afterwards?

**None.** Full trace result:

| Location | Description | Overwrites `photoMode`? |
|----------|-------------|------------------------|
| `store.ts:720` | Initial state `photoMode: 'Hero Landing Page'` | Only on first mount |
| `store.ts:1765` | `setPhotoMode(mode)` implementation | ✅ The intended write — was never reached |
| `store.ts:436/455/475/495` | `BRAND_PRESETS` static config objects | Not applied automatically anywhere |
| `Step3Legacy.tsx:1476–1480` | `applyIndustryProfile` → `setPhotoMode('Hero Landing Page')` | Only on explicit industry toggle (wine ↔ supplements) |
| `Step3Legacy.tsx:2207–2238` | "Phase 3.5" sync effect: `productStore.photoMode → values.studioPhotoMode` | **One-way read only.** Does NOT write back to store |
| `updateProductStudioValue` (Step3Legacy) | `switch/case` dispatcher for store updates | No `photoMode` case. Cannot write it |
| `resetIndustryFields` (`utils/resetIndustryFields.ts`) | Resets wine/coffee fields on industry switch | Does NOT touch `photoMode` |
| `promptRouter.ts:966–967` | `allowedPhotoModes` guard in `toStudioV2State` | Coerces to `allowedPhotoModes[0]` = `'Hero Landing Page'` if mode not in list — **not** `'Ingredient Stack'` |
| `App.tsx:5221` | `useProductStudioStore.getState()` | Read-only. Passes state to `generateProductJobs` |

### C) Is there an effect syncing Step3 `values` back into the store?

**No** — for `photoMode`.

The "Phase 3.5" effect at `Step3Legacy.tsx:2207`:

```ts
useEffect(() => {
  setValues(prev => ({
    ...prev,
    studioPhotoMode: productStore.photoMode,  // ← store → local values (read only)
    ...
  }));
}, [productStore.photoMode, ...]);
```

This copies `store.photoMode` INTO local `values.studioPhotoMode`. It does **not** write back. Direction: `store → values`, never `values → store`.

### D) Is the store reinitialized when `sceneType` changes?

**No.** `setSceneType` in `store.ts:1290` only sets `{ sceneType }`. It does not reset `photoMode` or any other field.

### E) Is there a fallback that reassigns default `photoMode`?

**Only in `promptRouter.ts:966–967`:**

```ts
if (rules?.allowedPhotoModes && !rules.allowedPhotoModes.includes(v2State.photoMode || '')) {
    v2State.photoMode = rules.allowedPhotoModes[0];
}
```

For `supplements` industry, `allowedPhotoModes[0]` = `'Hero Landing Page'`. This would coerce an **unlisted** mode to `'Hero Landing Page'` — not to `'Ingredient Stack'`. Since `'Ingredient Stack'` IS in the supplements `allowedPhotoModes` list (added in commit `138034e`), this guard does not fire at all for `'Ingredient Stack'`.

---

## Why the Logs Showed `"Ingredient Stack"`

The value `"Ingredient Stack"` was **stale state** — the last value written to the Zustand store during a previous session where `isProductMode = true` (the old ecommerce flow). The store persisted that value. Because `setPhotoMode` was never called after that (chips not rendering), the store was never updated regardless of what the user clicked.

---

## Fix Applied

**Commit `40ecaf4`** — `src/components/step3/Step3Legacy.tsx`

```diff
- const mode: 'studio' | 'lifestyle' = isEcommerceMode ? 'studio' : 'lifestyle';
+ // uiActiveEngine === 'studio' covers the isProductMode=false + studio-branding scene case,
+ // ensuring the studio UI block (and its photo mode chips) always renders when the V2 engine is active.
+ const mode: 'studio' | 'lifestyle' = (isEcommerceMode || uiActiveEngine === 'studio') ? 'studio' : 'lifestyle';
```

With this fix:
- `uiActiveEngine === 'studio'` when `sceneType === 'studio-branding'`
- `mode = 'studio'` regardless of `isProductMode`
- `{mode === 'studio' && ...}` block renders
- Chips exist in the DOM
- `applyPhotoMode(selectedMode)` fires on click
- `productStore.setPhotoMode(selectedMode)` is called
- `useProductStudioStore.getState().photoMode` reflects the selection
- `generateProductJobs` receives the correct value

---

## Diagnostic Log Added

**Commit `c19bc99`** — `src/lib/productStudio/store.ts`

```ts
setPhotoMode: (mode) =>
    set((state) => {
        console.log('[SET PHOTO MODE]', mode);  // ← added
        ...
    })
```

**Verification instructions:**
1. Open browser console
2. Click any Photo Mode chip
3. Expect: `[SET PHOTO MODE] <selected_mode>` in console
4. If log appears → fix is working correctly
5. If log does NOT appear → chip is not mounted; check `mode` derivation at `Step3Legacy.tsx:2326`

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/step3/Step3Legacy.tsx` | `mode` derivation extended with `uiActiveEngine === 'studio'` |
| `src/lib/productStudio/store.ts` | `[SET PHOTO MODE]` diagnostic log in `setPhotoMode` |

## Tests

283/283 passing after both commits.
