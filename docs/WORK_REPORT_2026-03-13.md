# Work Report - March 13, 2026

## Scope

This report summarizes the main work completed recently in the app, the current state of the product, and the most important pending items.

It focuses on:

- Studio/Product V2 rollout
- Step 3 UX cleanup
- Industry-specific UX improvements
- Onboarding guidance
- Trust/clarity fixes between UI and generation
- Build/CI/runtime fixes

---

## Current Product State

### What is true now

- `Studio` is effectively running on the V2 pipeline in `main`.
- `Lifestyle` still uses the legacy prompt engine path.
- Step 3 is still largely powered by `Step3Legacy`, but several UX and structural cleanups were already applied.
- `wine`, `coffee`, and `supplements` now have clearer industry surfaces than before.
- The app is more transparent about resolved generation settings and automatic adjustments.

### Main architectural reality

- The prompt/generation core for Studio is stronger than the UI shell around it.
- The biggest remaining structural debt is still the shared Step 3 surface and its reactive/coercive logic.

---

## Completed Work

## 1. Studio / V2 Direction

- Locked Studio runtime to V2 behavior in `main`.
- Removed fake Step 3 routing layers that were only cosmetic.
- Reduced ambiguity around whether Studio is still feature-flag-driven.

Relevant files:

- [App.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/App.tsx)
- [src/lib/productStudio/promptRouter.ts](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/lib/productStudio/promptRouter.ts)
- [src/components/step3/README.md](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/step3/README.md)

---

## 2. Step 3 Cleanup

### Structural cleanup

- Removed fake `Step3Router` / fake engine layers from runtime.
- Simplified the actual entry path so the app no longer pretends there is a deep Studio/Lifestyle split in Step 3 when there isn't.

### UX cleanup

- Improved labels across Step 3 to reduce internal-engine wording.
- Added interpretation notes where the system auto-resolves values.
- Added a compact `Resolved State` summary before generation.
- Later simplified that summary so it no longer looked like a huge card dashboard.

Relevant files:

- [App.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/App.tsx)
- [src/components/step3/Step3Legacy.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/step3/Step3Legacy.tsx)

---

## 3. Industry UX Improvements

## Wine

- Reordered the wine menu to prioritize wine-first controls.
- Hid supplement-oriented sections for wine.
- Removed duplicated `Winery Scene` panel behavior.
- Renamed wine setup labels into simpler creator-facing language.
- Improved wine-specific flow order:
  - `Wine Setup`
  - `Scene`
  - `Bottle Action`
  - `Camera`
  - `Export`
  - `Content Overlay`
- Strengthened prompt constraints so hero bottles stay upright and do not tilt casually.

Relevant files:

- [src/components/industry-modules/WineModule.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/industry-modules/WineModule.tsx)
- [src/components/step3/Step3Legacy.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/step3/Step3Legacy.tsx)
- [src/lib/productStudioV2/pipelines/winePipeline.ts](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/lib/productStudioV2/pipelines/winePipeline.ts)

## Coffee

- Renamed the coffee module surface into simpler, more readable labels.
- Reduced internal/technical naming in the coffee setup block.

Relevant file:

- [src/components/industry-modules/CoffeePackagingModule.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/industry-modules/CoffeePackagingModule.tsx)

## Supplements

- Added an explicit supplements industry module instead of leaving supplements as an implicit fallback only.
- Simplified many supplement-oriented labels:
  - capsule-related labels
  - drops labels
  - powder labels

Relevant files:

- [src/components/industry-modules/SupplementsModule.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/industry-modules/SupplementsModule.tsx)
- [src/components/industry-modules/industryModuleRegistry.ts](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/industry-modules/industryModuleRegistry.ts)
- [src/components/step3/Step3Legacy.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/step3/Step3Legacy.tsx)

---

## 4. Industry Identity / Fast Recognition

- Added visual identity to industry profile chips:
  - Supplements
  - Wine Prestige
  - Coffee Ritual
- Each industry now has its own color treatment, icon, and microcopy.
- The active module also inherits the industry color direction.

Relevant files:

- [src/components/step3/Step3Legacy.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/step3/Step3Legacy.tsx)
- [src/components/industry-modules/WineModule.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/industry-modules/WineModule.tsx)
- [src/components/industry-modules/CoffeePackagingModule.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/industry-modules/CoffeePackagingModule.tsx)
- [src/components/industry-modules/SupplementsModule.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/industry-modules/SupplementsModule.tsx)

---

## 5. Trust / Transparency Fixes

- Added a `Resolved Generation State` surface so users can see what the app will really use.
- Added `Auto` source markers for resolved/defaulted values.
- Added interpretation notes in Step 3 for auto-applied changes, including:
  - photo mode
  - interaction
  - placement
  - composition
  - industry-applied defaults
- Stopped auto-rotating products when switching industry.
- Made the industry selector behave more like a true single-choice selector.

Relevant files:

- [App.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/App.tsx)
- [src/components/step3/Step3Legacy.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/components/step3/Step3Legacy.tsx)
- [src/lib/productStudio/applyIndustryProfileSoft.ts](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/lib/productStudio/applyIndustryProfileSoft.ts)

---

## 6. Onboarding / Guidance

- Reworked the mode-selection onboarding multiple times away from static banners and confusing cards.
- Current direction:
  - contextual steps
  - smoother transitions
  - guided scroll behavior
  - inactive areas dimmed while the active onboarding target is highlighted
- Final onboarding step now scrolls back to `01 / Input Assets`.

Relevant files:

- [App.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/App.tsx)
- [index.css](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/index.css)

---

## 7. Build / CI / Runtime Fixes

- Fixed multiple TypeScript regressions introduced during recent UX work.
- Updated workflow behavior for GitHub Actions Node deprecations.
- Updated test expectations where industry soft presets changed.
- Gated noisy prompt diagnostics behind `VITE_DEBUG_PROMPT_PIPELINE`.

Relevant files:

- [App.tsx](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/App.tsx)
- [src/lib/prompt/__tests__/industryPresetSoft.test.ts](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/lib/prompt/__tests__/industryPresetSoft.test.ts)
- [src/lib/prompt/__tests__/wineV4.sizeGuard.test.ts](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/src/lib/prompt/__tests__/wineV4.sizeGuard.test.ts)
- [.github/workflows/tests.yml](/Users/juanamisano/dev/boostugc-stable/universal-mockup-generator/.github/workflows/tests.yml)

---

## Recent Commit Snapshot

Recent notable commits:

- `7a42619` Simplify resolved state UI
- `ea87075` Update industry soft preset tilt expectations
- `894b020` Add visual identity to industry profiles
- `89b3d93` Stop auto-rotating products on industry switch
- `7fa3dfb` Show auto-applied industry defaults in step 3
- `d893b60` Add explicit supplements industry module
- `fb91c47` Gate studio prompt diagnostics behind debug flag
- `176e67a` Lock wine hero bottle upright
- `04327b1` Dim inactive areas during onboarding
- `91fbb74` Move onboarding guide to contextual steps

---

## What Still Needs Work

## P0 - Highest Value / Still Active

### 1. UI intent vs final generation intent still needs tighter alignment

Even with the new summary, some runtime coercions still happen late.

Still needed:

- reduce silent overrides further
- make remaining automatic corrections more explicit or remove them

### 2. Step 3 is still too centralized

`Step3Legacy` remains the biggest UX/maintenance bottleneck.

Still needed:

- gradually extract Studio-specific sections out of the monolith
- keep generation contract stable while doing it

### 3. Industry capability model is still distributed

Adding new scenes, styles, or industries still requires touching too many places.

Still needed:

- central registry for:
  - industries
  - photo modes
  - visual styles
  - allowed capabilities

---

## P1 - Strong Next Steps

### 4. Supplements module should grow into a real first-class module

It now exists explicitly, but it is still lighter than wine and coffee.

Still needed:

- richer supplements-only setup
- clearer module contract parity with wine/coffee

### 5. Coffee semantic config should move away from string parsing

This remains one of the more fragile architecture points.

Still needed:

- typed config instead of semantic tags embedded in strings

### 6. Resolved state could still be more useful

The compact summary is visually better now, but it could become more actionable.

Still needed:

- optional expand/collapse details
- direct link from resolved item to originating section

---

## P2 - Later / Structural

### 7. Separate `StudioStep3` and `LifestyleStep3` for real

Not urgent for shipping today, but important for future scalability.

Still needed:

- two real engines/surfaces
- shared blocks only where genuinely common

### 8. Reduce `App.tsx` orchestration burden

`App.tsx` still coordinates too much:

- generation routing
- onboarding
- upload
- summary state
- multiple feature layers

Still needed:

- extract orchestrator logic into smaller domain modules

### 9. Performance work

The app still has a heavy frontend baseline.

Still needed:

- code-splitting
- lazy loading by mode
- Step 3 block deferral where possible

---

## Recommended Next Order

### Do next

1. Continue removing low-value auto-adjustments
2. Build a central Studio capability registry
3. Expand the supplements module into a fuller first-class module

### Do after that

4. Start safe extraction of Studio-specific Step 3 sections
5. Replace coffee semantic string parsing with typed config

### Do later

6. Split Studio/Lifestyle Step 3 fully
7. Reduce `App.tsx`
8. Performance optimization pass

---

## Practical Conclusion

The app is in a better state than before:

- clearer industry UX
- less hidden behavior
- stronger wine flow
- more understandable Step 3
- less production log noise

But the core structural constraint remains:

- Studio V2 is stronger than the UI shell around it.

The most valuable path forward is not a giant rewrite now.
It is:

- keep shipping targeted clarity improvements
- reduce hidden coercions
- centralize capability definitions
- then split Step 3 safely, not all at once

