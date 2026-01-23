# Creativity v2 — Art Direction Engine

> **Status: ACTIVE**

## Purpose

CreativeMode is a **FIRST-CLASS CONTROLLER** that governs visual intelligence:
- Composition (position, camera, layering, space)
- Enrichment (textures, elements, materials)
- Visual Energy (chroma, contrast, density, tone)
- Brand Language (implicit visual signals)

## Hierarchy

```
1. SceneType (what is allowed)
2. CreativeMode (how it looks, feels, communicates)
3. Product / Environment / Bundle (content)
```

## Creative Modes

| Mode | Signal | Use Case |
|------|--------|----------|
| `high_end_studio` | Luxury, premium | Hero images, brand campaigns |
| `vibrant_brand_explosion` | Bold, playful | Social ads, OLLY-style |
| `minimal_editorial` | Editorial, refined | Skincare, magazines |
| `natural_organic` | Natural, organic | Wellness, sustainable |
| `scientific_clean` | Clinical | Pharma, tech supplements |
| `lifestyle_cinematic` | Aspirational | Homepage, storytelling |
| `playful_bold` | Bold, approachable | Youth brands, social |

## Scene Compatibility

| SceneType | Allowed Modes |
|-----------|---------------|
| studio_branding | high_end_studio, minimal_editorial, vibrant_brand_explosion, scientific_clean |
| editorial_product | minimal_editorial, high_end_studio, natural_organic |
| lifestyle_real | lifestyle_cinematic, natural_organic |
| bundle_hero | high_end_studio, vibrant_brand_explosion |
| ugc_phone | ❌ No creativity (authentic only) |

## Usage

```typescript
import { 
  injectCreativity, 
  validateCreativity,
  getCreativeModeOptions 
} from './creativity';

// Validate compatibility
const result = validateCreativity('studio_branding', 'high_end_studio');
if (result.valid) {
  const injection = injectCreativity(result.normalizedMode);
  // Append injection.fullInjection to prompt
}

// Get UI options
const options = getCreativeModeOptions('studio_branding');
// Returns available modes with names and descriptions
```

## Test

```bash
npx tsx tests/creativity/validateCreativity.ts
```

**Expected: 13/13 PASS**
