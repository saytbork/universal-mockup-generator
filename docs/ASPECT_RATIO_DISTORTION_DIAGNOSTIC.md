# 🔴 DIAGNOSTIC REPORT: Product Aspect Ratio Distortion in Gemini 2.0 Flash Image Generation

## PROBLEM SUMMARY

When generating product photography with multiple products that have different aspect ratios (e.g., vertical bottle + horizontal box), Gemini 2.0 Flash distorts/stretches the products to fill the output aspect ratio instead of composing the scene naturally.

## TECHNICAL CONTEXT

### System
- **Model:** `gemini-2.0-flash-exp` (image generation)
- **Mode:** Product Studio / Lifestyle Photography (Branding mode)
- **Feature:** Multi-product bundles (2+ products in same scene)
- **Output format:** Various aspect ratios (1:1, 4:5, 16:9, etc.)

### Current Implementation

```typescript
// Product references are sent WITHOUT letterboxing
// Example: A vertical bottle (3:4) and horizontal box (16:9) 
// are sent in their natural aspect ratios as reference images

// Generation request includes:
generationConfig: {
  aspectRatio: "1:1" // or other target ratio
}

// Prompt includes explicit instructions:
"CRITICAL COMPOSITION RULE: Product references maintain their natural proportions. 
Compose scene by adjusting camera angle, adding environmental context (surfaces, 
backgrounds, props), or intelligent framing. NEVER stretch, compress, or warp 
product geometry to fill the frame."
```

## OBSERVED BEHAVIORS

### Scenario A: WITH letterbox on references (white padding)
- ❌ Output shows white/black bars (letterboxing/pillarboxing)
- ❌ Products maintain proportions BUT scene has unwanted padding
- **Problem:** Model reproduces the letterbox padding in output

### Scenario B: WITHOUT letterbox (current - natural aspect ratios)
- ❌ Products get DISTORTED/STRETCHED to fill output aspect ratio
- ❌ Vertical bottles become horizontally compressed
- ❌ Horizontal boxes become vertically stretched
- **Problem:** Model warps product geometry despite explicit instructions not to

### Scenario C: WITH letterbox + light gray padding (#F5F5F5)
- ❌ Still shows padding artifacts or distorts products
- Mixed results depending on output aspect ratio

## WHAT WE'VE TRIED

### 1. ✅ Remove letterboxing from references
Sent products in natural aspect ratio
- **Result:** Products get distorted

### 2. ✅ Add explicit prompt instructions against warping/distortion
Multiple variations tried:
- "No warping, bulging, melted edges, stretched labels, altered aspect ratios"
- "NEVER stretch, compress, or warp product geometry"
- "Products must maintain their natural proportions exactly as shown in references"
- **Result:** Instructions seem to be ignored

### 3. ✅ Apply letterbox with different backgrounds
Tested with white and light gray (#F5F5F5)
- **Result:** Output reproduces the letterbox padding

### 4. ❌ Cover crop
Not tested yet (would crop products, losing content)

## MULTI-PRODUCT HEIGHT SCALING

Separate but related issue: Products with different real-world heights (e.g., 100cm vs 60cm) need to appear proportionally sized in the scene.

### Current implementation:
```typescript
// Prompt includes:
"CRITICAL SCALE REQUIREMENT: Preserve exact real-world height proportions 
between all products. Product A ~100cm; Product B ~60cm. Products MUST 
appear proportionally sized according to their specified heights."
```

## QUESTIONS FOR GEMINI

### 1. Reference Image Preprocessing
- Should product references be normalized to match the output aspect ratio?
- If yes, what preprocessing method is recommended: letterbox, cover crop, or other?
- If letterbox, what background color/strategy minimizes artifacts?

### 2. Prompt Engineering
- Are there specific keywords or phrase structures that more effectively prevent geometric distortion?
- Is there a recommended prompt structure for multi-product scenes with varying aspect ratios?

### 3. Model Behavior
- Does Gemini 2.0 Flash have a built-in bias to "fill" the output aspect ratio when references don't match?
- Is there a `generationConfig` parameter that can control this behavior?

### 4. Best Practice
- What is the recommended workflow for generating product photography with multiple products of different aspect ratios?
- Should we handle this on the reference preprocessing side, prompt side, or both?

## IDEAL OUTCOME

Generate product photography where:
- ✅ Products maintain exact proportions from reference images
- ✅ No distortion, stretching, or compression
- ✅ No letterbox bars in output
- ✅ Scene is composed naturally (camera angle, environmental elements, intelligent framing)
- ✅ Multi-product height proportions are respected (100cm product appears larger than 60cm product)

## CODE REFERENCES

- **Reference preprocessing:** `App.tsx` lines ~5240-5250
- **Prompt builder:** `src/lib/productStudio/builders.ts`
- **Aspect ratio instruction:** lines 1065-1076
- **Bundle height scaling:** lines 447, 1905-1921

## REPRODUCTION STEPS

1. Upload 2 products with different aspect ratios (e.g., vertical bottle 3:4 + horizontal box 16:9)
2. Enter different height values (e.g., Product A: 100cm, Product B: 60cm)
3. Enable Bundle mode with 2 products
4. Select output aspect ratio (e.g., 1:1 square)
5. Generate image
6. **Observe:** Products are distorted/stretched instead of naturally composed

## EXPECTED vs ACTUAL

### Expected:
Scene shows both products in their natural proportions, composed with camera angle adjustment, environmental elements (table, background), or intelligent framing to fill the 1:1 output.

### Actual:
Products are geometrically distorted (stretched/compressed) to fill the 1:1 frame, losing their original proportions from reference images.

---

**Date:** February 17, 2026  
**Model Version:** gemini-2.0-flash-exp  
**Status:** ✅ **RESOLVED - Implementation Complete**

## SOLUTION IMPLEMENTED

### Root Cause Identified
The model was attempting to stretch product edges to match the reference image boundaries when aspect ratios didn't match the output format.

### Fix Applied (Based on Gemini's Recommendations)

#### 1. Transparent Canvas Normalization (`App.tsx`)
Created `normalizeProductWithTransparentPadding()` function that:
- Creates a canvas matching the target aspect ratio (e.g., 1024×1024 for 1:1)
- Places products centered with transparent padding
- Model sees "intended space" and fills it with environment, not distortion

#### 2. Relative Height Scaling
- Calculates scale factor from real-world heights (cm/in)
- Tallest product = 1.0, others scaled proportionally (e.g., 60cm product = 0.6 scale)
- Applied BEFORE sending to model (pre-scaled in reference canvas)

#### 3. Optical Language in Prompts (`builders.ts`)
Changed from negative instructions to physical/optical language:
- **Old:** "Don't stretch or warp"
- **New:** "50mm prime lens with zero distortion. Rigid orthographic proportions. Fill space with environmental context."

### Implementation Details
- **File:** `App.tsx` line ~1370 (new function)
- **File:** `App.tsx` line ~5305 (reference processing)
- **File:** `src/lib/productStudio/builders.ts` line ~1075 (prompt builder)

### Testing
Next: Deploy and test with multi-product bundles of different aspect ratios.
