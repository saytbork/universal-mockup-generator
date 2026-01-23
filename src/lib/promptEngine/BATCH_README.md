# Batch/Gallery System

> **Deterministic multi-render generation**

## How It Works

```
Preset → UIState → BatchSpec → BatchExpander → N × UIStates → N × Prompts
                                    ↓
                              GalleryItems
                              (metadata)
```

## Quick Start

```typescript
import { applyCustomizationsToPreset } from './presets';
import { createBatchFromPreset, expandBatch } from './batchExpander';
import { buildContractFromUI } from './uiContractBuilder';
import { deterministicPromptBuilder } from './deterministicPromptBuilder';

// 1. Create base state from preset
const baseState = applyCustomizationsToPreset('hero_packshot', {
  productType: 'skincare serum'
});

// 2. Create batch spec (4 variations)
const batchSpec = createBatchFromPreset('hero_packshot', baseState, 4);

// 3. Expand batch
const batchResult = expandBatch(batchSpec);

// 4. Generate prompts for each item
for (const item of batchResult.items) {
  const contract = buildContractFromUI(item.uiState);
  const result = deterministicPromptBuilder.build(contract);
  console.log(`Render ${item.index}:`, result.prompt);
}
```

---

## Variation Axes

| Axis | Values |
|------|--------|
| `angle` | eye level, slight top-down, top-down, low angle, three-quarter |
| `distance` | close, medium-close, medium, medium-wide, wide |
| `framing` | centered, rule of thirds, off-center, full scene, tight crop |
| `lighting` | natural window light, golden hour, soft ambient, natural soft light |
| `aspectRatio` | 1:1, 4:5, 9:16, 16:9, 3:4 |

---

## Preset Batch Limits

| Preset | Max | Default Axes | Locked |
|--------|-----|--------------|--------|
| hero_packshot | 6 | angle, framing | lighting |
| quick_studio | 4 | angle | lighting, distance |
| pdp_ecommerce | 4 | aspectRatio | angle, framing, lighting |
| lifestyle_hero | 8 | angle, lighting | — |
| ugc_testimonial | 6 | angle, framing | lighting |
| story_ad | 6 | angle | aspectRatio, lighting |
| social_square | 6 | angle, lighting | aspectRatio |
| editorial_flat_lay | 8 | lighting, framing | angle |
| premium_editorial | 12 | angle, lighting, framing | — |
| bundle_cross_sell | 4 | angle | lighting, framing |

---

## Scene Type Rules

| Scene Type | Max Batch | Allowed Axes |
|------------|-----------|--------------|
| studio_packshot | 6 | angle, distance, framing |
| editorial_product | 12 | all axes |
| lifestyle_product | 8 | all axes |
| ugc_phone | 6 | angle, distance, framing |
| ecommerce_blank_space | 4 | aspectRatio only |
| bundle_kit | 6 | angle, distance, framing |

---

## GalleryItem Metadata

Each render in a batch includes:

```typescript
{
  id: string;           // Unique render ID
  batchId: string;      // Batch this belongs to
  index: number;        // Position in batch
  uiState: UIState;     // Expanded state
  deltas: Record;       // What changed from base
  presetId?: string;    // Original preset
  createdAt: number;    // Timestamp
}
```

---

## Validation

```bash
# Validate all batch expansions
npx tsx tests/batch/validateBatch.ts
```

All 10 presets × 4 variations = **40 renders validated**.
