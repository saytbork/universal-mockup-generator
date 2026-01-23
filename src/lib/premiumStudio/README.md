# Premium Studio

> **🔒 VERSION 1.0.0 — FROZEN**
>
> This version is LOCKED. Any changes require v2.x.
> See [CHANGELOG.md](./CHANGELOG.md) for freeze rules.

## Purpose

Premium product image generator targeting OLLY / AG1 / Neuro quality level.

## SceneTypes

| Type | Output |
|------|--------|
| `studio_branding` | Clean product shot, no environment |
| `editorial_product` | Styled shot, abstract background |
| `lifestyle_real` | Real environment, natural light |
| `ugc_phone` | Phone camera, person present |
| `bundle_hero` | 2-5 products, clear hierarchy |

## Quick Start

```typescript
import { validatePremiumInput } from './validation';
import { generatePremiumPrompt, CANONICAL_EXAMPLES } from './prompts';

// Validate
const validation = validatePremiumInput(input);
if (!validation.valid) throw new Error(validation.errors[0]);

// Generate
const { prompt, negativePrompt } = generatePremiumPrompt(input);
```

## Files

| File | Purpose |
|------|---------|
| `schema.ts` | Types, enums, SceneTypeRules |
| `validation.ts` | Hard fail validation |
| `prompts.ts` | Prompt generation |
| `CHANGELOG.md` | Freeze rules |

## Test

```bash
npx tsx tests/premiumStudio/validateCanonical.ts
```

Expected: **5/5 PASS**
