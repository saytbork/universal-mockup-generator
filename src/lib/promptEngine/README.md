# Deterministic Prompt Engine

> **🔒 VERSION 1.0.0 — FROZEN**
>
> This version is LOCKED. Any changes require v2.x.
> See [CHANGELOG.md](./CHANGELOG.md) for freeze rules.

> **STRICT, NON-CREATIVE, DETERMINISTIC prompt generation for product photography.**

## What It Is

A rule-based prompt engine that generates image generation prompts from structured JSON input.

## What It Is NOT

- ❌ Not a creative assistant
- ❌ Does not interpret intent
- ❌ Does not infer missing data
- ❌ Does not invent elements
- ❌ Does not compensate for invalid input

---

## Scene Types

| Scene Type | Environment | Hands | Creativity | Camera |
|------------|-------------|-------|------------|--------|
| `studio_packshot` | ❌ | ❌ | 0 only | DSLR |
| `editorial_product` | ✅ | ❌ | Any | Any |
| `lifestyle_product` | ✅ | ✅ | Any | Any |
| `ugc_phone` | ✅ (real only) | ✅ | ≤ 3 | Smartphone only |
| `ecommerce_blank_space` | ❌ | ❌ | ≤ 2 | Any |
| `bundle_kit` | ✅ | ❌ | Any | Any |

---

## Hard Fail Conditions (ABORT)

| # | Condition | ABORT |
|---|-----------|-------|
| 1 | `sceneType` missing | ✅ |
| 2 | `productType` missing | ✅ |
| 3 | Environment where forbidden | ✅ |
| 4 | Hands where not allowed | ✅ |
| 5 | Creativity exceeds sceneType limit | ✅ |
| 6 | `quantity > 1` outside bundle/editorial | ✅ |
| 7 | `bundle_kit` with `quantity ≤ 1` | ✅ |
| 8 | UGC with non-smartphone camera | ✅ |
| 9 | Lighting contradicts sceneType | ✅ |
| 10 | Ecommerce outside `ecommerce_blank_space` | ✅ |

---

## Prompt Construction Order (Fixed)

1. Scene Type declaration
2. Product description
3. Physical composition
4. Environment (if allowed)
5. Lighting
6. Camera & framing
7. Creativity modulation
8. Ecommerce overrides
9. Constraints
10. Negative prompt

---

## Usage

```typescript
import { deterministicPromptBuilder } from './lib/promptEngine/deterministicPromptBuilder';

const result = deterministicPromptBuilder.build({
  sceneType: 'studio_packshot',
  productSetup: {
    productType: 'vitamin bottle',
    packaging: 'plastic bottle',
    handsAllowed: false
  },
  compositionRules: {
    quantity: 1,
    arrangement: 'centered',
    interactionObjects: []
  },
  environment: {},
  lighting: { lightingStyle: 'soft studio light' },
  creativity: { level: 0 },
  camera: {
    cameraSystem: 'DSLR',
    angle: 'eye level',
    distance: 'medium'
  },
  ecommerce: { enabled: false },
  outputFormat: { aspectRatio: '1:1' }
});

if (result.validationStatus === 'pass') {
  console.log(result.prompt);
  console.log(result.negativePrompt);
} else {
  console.error(result.validationErrors);
}
```

---

## Output Format

```typescript
interface DeterministicPromptResult {
  prompt: string;
  negativePrompt: string;
  validationStatus: 'pass' | 'fail';
  validationErrors?: string[];
  validationWarnings?: string[];
}
```

---

## Files

| File | Purpose |
|------|---------|
| `sceneTypes.ts` | Type definitions |
| `sceneTypeRules.ts` | Rules registry |
| `deterministicPromptBuilder.ts` | Main orchestrator |
| `validation/hardFails.ts` | 10 abort conditions |
| `handlers/` | 8 handler modules |
| `abortMessages.ts` | UX error messages |

---

## Tests

```bash
# Run all tests
npx playwright test tests/deterministicPromptBuilder.spec.ts

# Run canonical fixtures
npx tsx tests/fixtures/validateFixtures.ts

# Run smoke tests
npx tsx tests/canonical-smoke-tests.ts
```

---

## Version

**v1.0** — If any fixture changes result, v1 is broken.
