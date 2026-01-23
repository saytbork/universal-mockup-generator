# Premium Studio v1 — CHANGELOG

## [1.0.0] - 2026-01-06

### 🔒 FROZEN

This version is **LOCKED**. Any modification requires v2.x.

---

## What's Included

### Schema (`schema.ts`)
- 5 SceneTypes: `studio_branding`, `editorial_product`, `lifestyle_real`, `ugc_phone`, `bundle_hero`
- ProductDefinition with category, packaging, colors, scale
- EnvironmentConfig with MacroEnvironment + MicroPlace (required when environment allowed)
- LightingStyle (11 options, 2 engine-level)
- BundleConfig with type, layout, spacing, hero product
- PersonConfig for UGC
- CameraConfig
- SceneTypeRules with requires/allows matrix

### Validation (`validation.ts`)
- 7 hard fail conditions
- Product → Environment compatibility blocks
- Bundle validation (2-5 products, 1 hero, sequential positions)
- Lighting compatibility per SceneType
- Quick check helpers for UI

### Prompts (`prompts.ts`)
- 5 deterministic prompt builders
- 5 canonical examples
- Negative prompts per SceneType
- Constraints per SceneType

---

## Freeze Rules

### ❌ DO NOT MODIFY
- `schema.ts` - Types and SceneTypeRules
- `validation.ts` - Hard fail conditions
- `prompts.ts` - Prompt templates and negative prompts

### ❌ DO NOT ADD
- New SceneTypes
- New Environments
- New Lighting styles
- New validation rules

### ✅ ALLOWED
- Bugfix if generation breaks
- Documentation updates
- Test additions

---

## Files Frozen

```
src/lib/premiumStudio/
├── schema.ts          🔒
├── validation.ts      🔒
└── prompts.ts         🔒
```

---

## Test Baseline

Run validation:
```bash
npx tsx tests/premiumStudio/validateCanonical.ts
```

**Expected: 5/5 PASS**

If any test fails after a change, **v1 is broken**.

---

## SceneType Summary

| SceneType | Environment | Person | Bundle | Max Creativity |
|-----------|-------------|--------|--------|----------------|
| studio_branding | ❌ | ❌ | ❌ | Low |
| editorial_product | ❌ | ❌ | ❌ | High |
| lifestyle_real | ✅ Required | ❌ | ❌ | Medium |
| ugc_phone | ✅ Optional | ✅ Required | ❌ | Low |
| bundle_hero | ✅ Optional | ❌ | ✅ Required | Medium |

---

## Sign-off

- [x] Schema complete
- [x] Validation complete
- [x] Prompts complete
- [x] 5/5 canonical tests pass
- [x] Documentation complete

**Status: LOCKED 🔒**
