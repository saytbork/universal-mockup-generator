# Changelog

All notable changes to the Deterministic Prompt Engine.

## [1.0.0] - 2026-01-06

### 🔒 FROZEN — v1.0.0

This version is **LOCKED**. Any modification requires a new major version (v2.x).

### Added
- Deterministic prompt generation from structured JSON input
- 6 scene types: `studio_packshot`, `editorial_product`, `lifestyle_product`, `ugc_phone`, `ecommerce_blank_space`, `bundle_kit`
- 10 hard fail conditions with ABORT
- Canonical 10-step prompt construction order
- Auto-generated negative prompts per scene type
- Scene type rules registry
- 8 handler modules
- Validation layer with hard fails and warnings
- UX abort messages
- JSON Schema contract
- 22 unit tests
- 6 scene type fixtures
- 4 canonical smoke tests

### Freeze Rules
- ❌ NO changes to `hardFails.ts`
- ❌ NO changes to `sceneTypeRules.ts`
- ❌ NO changes to prompt construction order
- ❌ NO changes to handler output format
- ❌ NO new scene types without v2

### Files Frozen
```
src/lib/promptEngine/
├── sceneTypes.ts
├── sceneTypeRules.ts
├── deterministicPromptBuilder.ts
├── validation/
│   └── hardFails.ts
├── handlers/
│   ├── productSetup.ts
│   ├── compositionRules.ts
│   ├── environment.ts
│   ├── lighting.ts
│   ├── creativity.ts
│   ├── camera.ts
│   ├── ecommerce.ts
│   ├── negativePrompt.ts
│   └── index.ts
├── abortMessages.ts
└── schema/
    └── deterministicPromptInput.schema.json
```

### Test Baseline
- 22 unit tests MUST pass
- 6 fixtures MUST pass
- 4 smoke tests MUST pass

If any test fails after a change, **v1 is broken**.
