# 🎭 ANALYSIS: "Doll Face" Problem in Lifestyle Mode (Non-UGC)

## PROBLEM SUMMARY

When generating lifestyle photos with people in **Lifestyle mode (NOT UGC mode)**, the model produces faces that look "too perfect", doll-like, or CGI-rendered instead of real photographic subjects.

## ROOT CAUSE IDENTIFIED

### Current Lifestyle Prompt (Line 4385 in App.tsx):

```typescript
prompt += isUgcStyle
  ? `The shot should feel candid, emotional, and cinematic, as if taken by a real person...`
  : `The shot should feel refined and advertising-ready, with deliberate staging...`;
```

**Problem Keywords:**
- ✅ "cinematic" - Triggers polished, editorial-style rendering
- ✅ "refined" - Encourages perfect features
- ✅ "advertising-ready" - Model interprets as "retouched/perfect"
- ❌ **MISSING**: Anti-doll constraints
- ❌ **MISSING**: Skin texture realism instructions
- ❌ **MISSING**: Natural imperfection guidance

### Comparison with UGC Mode

**UGC Mode HAS** (from `PromptEngine`):
```typescript
const ANTI_DOLL_CONSTRAINT = `
The person must look like a real unedited smartphone photo of a real subject. 
Avoid CGI, 3D render, synthetic appearance, mannequin, or doll-like appearance.
`;
```

**Lifestyle Mode LACKS**:
- No anti-doll constraints
- No skin texture requirements
- No CGI prevention
- Only has generic "REALISM HARD RULE" at line 5254, which comes AFTER scene description

## OBSERVED BEHAVIORS

### Lifestyle Mode (Current):
- ❌ Faces look "plastic" or "porcelain"
- ❌ Skin too smooth, no pores visible
- ❌ Perfect symmetry (unnatural)
- ❌ Eyes too glossy/reflective
- ❌ Lighting too perfect (beauty dish effect)
- ❌ No natural skin variation (no freckles, blemishes, texture)

### UGC Mode (Has protections):
- ✅ Natural skin texture
- ✅ Visible pores and natural imperfections
- ✅ Real human appearance
- ✅ Unedited photo quality

## TECHNICAL ANALYSIS

### Code Flow:

1. **Line 4377**: Base prompt created with "cinematic" keyword
2. **Line 4384-4387**: Lifestyle branch adds "refined, advertising-ready"
3. **Line 5254**: "REALISM HARD RULE" added BUT:
   - Only when `!isProductPlacement && personIncluded`
   - Comes very late in prompt (model already has "cinematic" bias)
   - Doesn't include specific skin texture instructions

### Why "Cinematic" is Problematic:

In AI image generation, "cinematic" often means:
- Beauty lighting (three-point, softbox)
- Post-processed skin (retouched)
- Editorial makeup looks
- Perfect facial symmetry
- Studio-grade color grading

This conflicts with "photorealistic real human photo" instruction.

## PROPOSED SOLUTIONS

### Option 1: Add Anti-Doll Layer Early in Lifestyle Prompt

Inject after line 4387, before scene description:

```typescript
if (isUgcStyle && personIncluded) {
  prompt += `CRITICAL REALISM REQUIREMENT: The person must appear as a real, unretouched human subject captured in an authentic photo. Visible skin texture with natural pores, slight asymmetries, real lighting (not beauty dish or three-point studio), and natural coloring. Absolutely NO CGI rendering, 3D model appearance, doll-like plastic skin, porcelain finish, synthetic textures, or game-engine quality. This is a photograph of a real person, not a digital creation. `;
}
```

### Option 2: Replace "Cinematic" with Better Keywords

Change line 4385:

```typescript
// OLD:
`The shot should feel candid, emotional, and cinematic, as if taken by a real person`

// NEW:
`The shot should feel candid, emotional, and authentic, as if taken by a real person with natural lighting and unedited results`
```

### Option 3: Enhanced Negative Prompt

Add to negative prompt for Lifestyle+Person:
- "CGI face"
- "3D rendered person"  
- "doll skin"
- "plastic appearance"
- "porcelain skin"
- "beauty retouching"
- "airbrushed skin"
- "synthetic face"

### Option 4: Skin Texture Enforcement

Add specific instruction:

```typescript
`SKIN TEXTURE REQUIREMENT: Visible skin pores, natural texture variation, subtle color shifts (not uniform), real human epidermis. Do not apply smoothing, gaussian blur, or beauty filters to skin.`
```

## RECOMMENDED FIX (Combination Approach)

1. **Remove "cinematic" keyword** from Lifestyle prompt
2. **Add early anti-doll constraint** before scene description
3. **Include skin texture requirements** explicitly
4. **Move REALISM HARD RULE earlier** in prompt chain

### Proposed Code Change:

```typescript
// After line 4384
prompt += isUgcStyle
  ? `The shot should feel candid, emotional, and authentic, as if taken by a real person with a ${cleanCamera}. `
  : `The shot should feel refined and editorial, with deliberate staging captured on a ${cleanCamera}. `;

// NEW: Add anti-doll constraint early for Lifestyle with person
if (isUgcStyle && personIncluded) {
  prompt += `REALISM REQUIREMENT: The person is a real human subject photographed naturally. Visible skin texture with pores, natural asymmetries, authentic lighting (no beauty dish), real coloring. Absolutely NO: CGI rendering, 3D model look, doll-like plastic skin, porcelain finish, synthetic textures, overly perfect symmetry, or game-engine quality. `;
}

// Then continue with scene description...
prompt += `Embrace believable imperfections...`;
```

## TESTING CRITERIA

After fix, generated images with people should have:

✅ Visible skin pores (when zoomed)  
✅ Slight facial asymmetries (natural)  
✅ Natural color variation in skin  
✅ Real lighting (not beauty dish)  
✅ Human-looking eyes (not too glossy)  
✅ Natural hair texture (not "cinematic hair")  
✅ Believable skin tone (not airbrushed)  
❌ No plastic/porcelain appearance  
❌ No 3D render quality  
❌ No overly perfect symmetry

## FILES TO MODIFY

1. **`App.tsx`** line ~4384-4387: Remove "cinematic", add anti-doll early
2. **`App.tsx`** line ~5254: Consider moving REALISM HARD RULE earlier
3. **`src/lib/promptEngine/handlers/negativePrompt.ts`**: Add CGI terms

## PRIORITY

🔴 **HIGH** - This affects user perception of image quality and authenticity in Lifestyle mode.

---

**Date:** February 17, 2026  
**Status:** 🔴 Analysis Complete - Awaiting Implementation  
**Impact:** All Lifestyle generations with people (non-UGC mode)
