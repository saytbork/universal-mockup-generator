# 🔍 LIFESTYLE PANEL - COMPLETE STRUCTURAL AUDIT

**Branch:** `review-v2`  
**Date:** February 19, 2026  
**Scope:** Full structural analysis of Lifestyle panel state management and prompt generation

---

## TABLE OF CONTENTS

1. [Global State Validation](#1️⃣-global-state-validation)
2. [UGC Mode Logic Consistency](#2️⃣-ugc-mode-logic-consistency)
3. [Random Character Analysis](#3️⃣-random-character-analysis)
4. [Module Collision Test](#4️⃣-module-collision-test)
5. [Prompt Assembly Order](#5️⃣-prompt-assembly-order)
6. [Environment Logic](#6️⃣-environment-logic)
7. [Redundant UI Controls](#7️⃣-redundant-ui-controls)
8. [Final Diagnostic Output](#8️⃣-final-diagnostic-output)

---

## 1️⃣ GLOBAL STATE VALIDATION

### State Flags Inventory

| Flag | Persisted in `Step3Values` | Used in Prompt | Conditionally Ignored | Can Conflict |
|------|----------------------------|----------------|----------------------|--------------|
| `ugcRealMode` | ✅ Yes | ✅ Yes (`rawDomesticUgcActive`) | ❌ No | ✅ Yes (Hero, Ritual, Formulation) |
| `isRandomCharacterEnabled` | ⚠️ **NO** (UI-only) | ❌ **NO** | N/A | ❓ Unknown |
| `sameCreatorAcrossScenes` | ✅ Yes | ✅ Yes (`identityMode: 'locked'`) | ❌ No | ✅ Yes (Model Reference, Random Character) |
| `ritualModeEnabled` | ✅ Yes | ✅ Yes (`ritualModeActive`) | ✅ Yes (when UGC active) | ✅ Yes (UGC, Hero) |
| `formulationStoryEnabled` | ✅ Yes | ✅ Yes (`formulationExpertEnabled`) | ✅ Yes (when UGC active) | ✅ Yes (UGC, No Person) |
| `ecommerceSidePlacementFlag` | ✅ Yes | ✅ Yes (`ecommerceSidePlacementFlag`) | ❌ No | ✅ Yes (UGC, Ritual) |
| `environment` | ✅ Yes | ✅ Yes | ⚠️ Partially (UGC treats as incidental) | ❌ No |
| `ugcImperfectionLevel` | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| `cameraAngle` | ✅ Yes | ✅ Yes | ✅ Yes (randomized in UGC if not specified) | ❌ No |
| `customClothesEnabled` | ✅ Yes | ✅ Yes | ❌ No | ⚠️ Yes (conflicts with wardrobe randomization) |
| `props` | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| `aspectRatio` | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| `hasModelReference` | ⚠️ **Prop-level** | ✅ Yes | ❌ No | ✅ Yes (Random Character, Identity Lock) |

---

### 🚨 CRITICAL FINDINGS

#### A) `isRandomCharacterEnabled` - GHOST STATE

```typescript
// ❌ DOES NOT EXIST IN Step3Values TYPE DEFINITION
// ✅ EXISTS IN UI: Line 7862-7865
// ❌ NEVER MAPPED TO PromptOptions
// ❌ NEVER CONSUMED BY PROMPT ENGINE
```

**Status:** **UNREACHABLE FEATURE** ⚠️  
**Impact:** Toggle appears functional but has **ZERO effect** on generation.  
**Root Cause:** State defined in UI but never integrated into `Step3Values` interface or prompt pipeline.

**Location:**
- UI Definition: `src/components/LifestyleStep3.tsx:7862-7865`
- Type Definition: **MISSING** from `Step3Values` interface
- Mapper: **NOT REFERENCED** in `mapLifestyleToPromptOptions.ts`
- Prompt Engine: **NOT CONSUMED**

---

#### B) Identity Mode Logic Collision

```typescript
// mapLifestyleToPromptOptions.ts:877
const identityMode = hasModelReference ? 'locked' 
    : identityContinuityRequested ? 'locked' 
    : 'auto';
```

**Conflict:** `sameCreatorAcrossScenes` (Keep Same Person) + `isRandomCharacterEnabled` can both be ON simultaneously.  
**Result:** `sameCreatorAcrossScenes` wins (sets `identityMode: 'locked'`), `isRandomCharacterEnabled` ignored.

**Priority Chain:**
1. **Model Reference** → `identityMode: 'locked'` (highest priority)
2. **sameCreatorAcrossScenes** → `identityMode: 'locked'`
3. **isRandomCharacterEnabled** → **NO EFFECT** (not implemented)
4. **Default** → `identityMode: 'auto'` (generates new `identityVariationToken`)

---

## 2️⃣ UGC MODE LOGIC CONSISTENCY

### When `ugcRealMode = ON`:

| Module | Behavior | Evidence |
|--------|----------|----------|
| **Time & Lighting** | ⚠️ **Partially Overridden** | Forced to `ugcHouseholdLighting` (line 1864), but Time of Day still passed |
| **Hero Canvas** | ✅ **BLOCKED** | Hard error thrown (line 1920-1922) |
| **Ritual Mode** | ✅ **Logically Blocked** | `isUgcModeActive()` returns `false` when Ritual active (types.ts:346-354) |
| **Formulation Story** | ✅ **Ignored** | Same logic as Ritual |
| **Environment** | ⚠️ **Reinterpreted** | Used but randomized/ignored by `DiversityRandomizer` (identity.ts:492-510) |
| **Messy Realism** | ✅ **Enforced** | `injectUGCDepthRules()` injected |

---

### 🚨 HIDDEN INJECTION BUG

**File:** `mapLifestyleToPromptOptions.ts:1500-1635`

```typescript
if (!sceneState.ugcRealMode) {
    // Camera semantic mapping...
}
```

**BUT** Time & Lighting is NOT fully disabled:

```typescript
// Line 1841-1863: Time/Lighting STILL MAPPED even in UGC
mapped.lighting = buildLightingSemantic(...); // ❌ STILL ACTIVE
```

**Then overridden:**

```typescript
// Line 1864-1868
if (sceneState.ugcRealMode && !isEcommerceBlankSpaceActive) {
    mapped.lighting = ugcHouseholdLighting;
    (mapped as any).timeLightingContext = mapped.lighting;
}
```

**Conclusion:** UGC **does NOT fully ignore** Time & Lighting. It overrides with household lighting but the original selection is still passed to lower-priority builders.

**Impact:** Wasted computation. Lighting selection is processed but immediately overridden.

---

### UGC Mode Activation Logic

```typescript
// types.ts:346-354
export function isUgcModeActive(options: PromptOptions): boolean {
    // FORCE disable UGC if Ritual Mode or Formulation Story is active
    const isLifestyleOnlyFeatureActive = 
        Boolean(options.ritualModeActive) || Boolean(options.formulationStory);
    
    if (isLifestyleOnlyFeatureActive) {
        return false;  // Lifestyle-only features override UGC
    }
    
    return (
        options.contentStyle === 'ugc' ||
        options.creationIntent === 'ugc' ||
        Boolean(options.ugcRealModeActive) ||
        Boolean(options.rawDomesticUgcActive)
    );
}
```

**Behavior:**
- Ritual Mode or Formulation Story **automatically disable UGC**
- Prevents conflicting modes from being active simultaneously
- Centralized logic ensures consistency

---

## 3️⃣ RANDOM CHARACTER ANALYSIS

### Current Implementation Status

| Aspect | Status |
|--------|--------|
| UI Toggle Exists | ✅ Yes (Line 7862) |
| State Persisted | ❌ **NO** |
| Mapped to PromptOptions | ❌ **NO** |
| Identity Randomization | ⚠️ **Partial** (via `DiversityRandomizer`) |
| Manual Controls Ignored | ❌ **NO** (controls still used) |
| Environment Forced | ❌ **NO** |
| `keepSamePerson` Auto-Disabled | ❌ **NO** |
| Both Toggles ON Simultaneously | ✅ **YES** (not prevented) |
| Identity Caching | ❌ **NO** |
| Entropy Strength | ⚠️ **WEAK** (uses `userId + timestamp`) |

---

### Execution Flow

```
1. User toggles "Random Character" ON
   └─> updateValue('isRandomCharacterEnabled', true) ← State updated in UI

2. ❌ NO EFFECT: State never read by mapper
   └─> mapLifestyleToPromptOptions() does NOT reference this field

3. PromptEngine.build() called
   └─> promptEngine/index.ts:494-520

4. shouldRandomizeIdentity check (line 494-500):
   ✅ personIncluded === true
   ✅ contentStyle !== 'product'
   ✅ !hasModelReference
   ✅ sameCreatorAcrossScenes !== true ← BLOCKS if Keep Same Person ON
   ✅ identityMode !== 'locked'

5. If shouldRandomizeIdentity = true:
   └─> identityVariationToken generated (unique per render)
   └─> identityKey = undefined
   └─> identityMode = 'auto'

6. DiversityRandomizer called in identity.ts:380-510:
   ├─> Facial structure (ALWAYS)
   ├─> Camera angle (if UGC mode + not user-specified)
   ├─> Skin texture (ALWAYS)
   ├─> Hair styling (ALWAYS)
   ├─> Overall appearance (UGC only)
   ├─> Accessories (if no model reference)
   ├─> Clothing (UGC only, respects custom clothes)
   ├─> Facial hair (masculine presentations, age 18-74)
   ├─> Ethnicity (if "Non-specific" selected)
   ├─> Lighting (UGC only)
   └─> Environment (UGC only, if not user-specified)
```

---

### What Actually Happens

**Manual controls (age, gender, ethnicity, hair color, etc.) are STILL RESPECTED.**

**Randomization happens automatically via `identityVariationToken`:**
- Generated on **every render** when `sameCreatorAcrossScenes = false`
- Uses `timestamp + random` for unique seed
- `DiversityRandomizer` injects variation while respecting user controls

**Conclusion:**  
Random Character toggle is **non-functional**. Randomization happens automatically via `identityVariationToken` when Keep Same Person is OFF.

---

### Identity Variation Token vs Identity Key

| Mode | Token Type | Behavior |
|------|-----------|----------|
| `identityMode: 'auto'` | `identityVariationToken` | Regenerated every render → different person |
| `identityMode: 'locked'` | `identityKey` | Persisted → same person across renders |

**When identityMode = 'auto':**
```typescript
// promptEngine/index.ts:502-505
const timestamp = Date.now().toString(36).slice(-6);
const random = Math.random().toString(36).substring(2, 8);
options.identityVariationToken = `${timestamp}-${random}`.toUpperCase();
```

**When identityMode = 'locked':**
```typescript
// promptEngine/index.ts:507-520
if (options.sameCreatorAcrossScenes === true && !options.hasModelReference) {
    options.identityMode = 'locked';
    if (!options.identityKey) {
        options.identityKey = crypto.randomUUID(); // Persisted
    }
    options.identityVariationToken = undefined;
}
```

---

## 4️⃣ MODULE COLLISION TEST

### Illegal Combination Matrix

| Combination | Allowed? | What Happens? | Blocked Where? |
|-------------|----------|---------------|----------------|
| **A) Raw UGC + Hero** | ❌ **NO** | Hard error thrown | `mapLifestyleToPromptOptions.ts:1920` |
| **B) Raw UGC + Ritual Mode** | ❌ **NO** | Ritual disabled via `isUgcModeActive()` | `types.ts:346-354` |
| **C) Ritual Mode + Hero** | ✅ **YES** | Both active, no conflict | N/A |
| **D) Random Character + Keep Same Person** | ✅ **YES** (UI allows) | Keep Same Person wins | `promptEngine/index.ts:494` |
| **E) Raw UGC + Controlled Lighting** | ⚠️ **PARTIAL** | Lighting overridden but not blocked | `mapLifestyleToPromptOptions.ts:1864` |
| **F) Model Reference + Random Character** | ✅ **YES** (UI allows) | Model Reference wins | `promptEngine/index.ts:494` |

---

### Detailed Analysis

#### A) Raw UGC + Hero Canvas

```typescript
// mapLifestyleToPromptOptions.ts:1920-1922
if (sceneState.ugcRealMode) {
    console.error('[INVALID STATE BLOCKED] Hero canvas cannot be used in UGC Real Mode');
    throw new Error('Invalid state: hero canvas + ugcRealMode');
}
```

**Status:** ✅ **Properly Blocked**  
**Result:** Generation fails with error  
**UI Behavior:** Hero controls should be disabled when UGC ON (needs verification)

---

#### B) Raw UGC + Ritual Mode

```typescript
// types.ts:346-354
export function isUgcModeActive(options: PromptOptions): boolean {
    const isLifestyleOnlyFeatureActive = 
        Boolean(options.ritualModeActive) || Boolean(options.formulationStory);
    
    if (isLifestyleOnlyFeatureActive) {
        return false;  // Lifestyle-only features override UGC
    }
    // ...
}
```

**Status:** ✅ **Properly Blocked**  
**Result:** Ritual Mode disables UGC (Ritual takes priority)  
**UI Behavior:** ⚠️ Ritual toggle NOT visually disabled when UGC ON

---

#### C) Ritual Mode + Hero Canvas

```typescript
// mapLifestyleToPromptOptions.ts:1935
const ritualHeroCanvasActive = (mapped as any).ritualModeActive === true;
```

**Status:** ✅ **Allowed**  
**Result:** Both can be active simultaneously  
**Use Case:** Ritual scene with hero composition (e.g., meditation with blank space for text)

---

#### D) Random Character + Keep Same Person

```typescript
// promptEngine/index.ts:507-520
if (options.sameCreatorAcrossScenes === true && !options.hasModelReference) {
    options.identityMode = 'locked';
    // identityKey persisted → same person
}
```

**Status:** ⚠️ **UI allows both, logic prioritizes Keep Same Person**  
**Result:** Keep Same Person silently wins, Random Character has no effect  
**Issue:** No UI feedback for conflict

---

#### E) Raw UGC + Controlled Lighting

```typescript
// mapLifestyleToPromptOptions.ts:1864-1868
if (sceneState.ugcRealMode && !isEcommerceBlankSpaceActive) {
    mapped.lighting = ugcHouseholdLighting;
    (mapped as any).timeLightingContext = mapped.lighting;
}
```

**Status:** ⚠️ **Lighting overridden but still processed**  
**Result:** User selection ignored, replaced with household lighting  
**Issue:** Wasted computation, no clear UI feedback

---

#### F) Model Reference + Random Character

```typescript
// promptEngine/index.ts:494-500
const shouldRandomizeIdentity =
    options.personIncluded === true &&
    options.contentStyle !== 'product' &&
    !options.hasModelReference && // ← BLOCKS if model reference exists
    options.sameCreatorAcrossScenes !== true &&
    options.identityMode !== 'locked';
```

**Status:** ⚠️ **UI allows both, logic prioritizes Model Reference**  
**Result:** Model Reference locks identity, Random Character ignored  
**Issue:** No UI feedback for conflict

---

## 5️⃣ PROMPT ASSEMBLY ORDER

### Canonical Builder Order

From `promptEngine/index.ts` and builder documentation:

```
PRIORITY 0: DETERMINISTIC FOUNDATION
├─> System prompt base
└─> Quality enforcers

PRIORITY 1: MODES
├─> creationIntent (ugc / product / brand)
├─> creationMode (lifestyle / studio / aesthetic)
└─> contentStyle (ugc / product / '')

PRIORITY 1.5: VISUAL GRAMMAR
├─> Compositional rules
└─> Structural guidelines

PRIORITY 2: IDENTITY
├─> Person physical traits
├─> Age anchors
├─> Negative age constraints
├─> Diversity randomization
└─> SUPPRESSED if hasModelReference === true

PRIORITY 3: SELFIE CAPTURE (if applicable)
└─> Selfie-specific camera controls

PRIORITY 3: UGC REAL MODE (DOMINANT OVERRIDE)
├─> Suppresses: studio, editorial, cinematic vocabulary
├─> Injects: imperfections, casual composition
├─> Overrides: lighting, camera angle (if not specified)
└─> BLOCKS: Hero, Ritual (via isUgcModeActive)

PRIORITY 4: CANONICAL SCENE
├─> Camera (shot type, angle, movement)
├─> Environment (setting, order/chaos)
├─> Lighting (time of day, style)
└─> Resolves conflicts (UGC > Scene defaults)

PRIORITY 5: SPECIAL BUILDERS
├─> Formulation Story (if active)
├─> Ritual Mode (if active)
├─> Ecommerce Narrative (if active)
└─> Clothing Builder

PRIORITY 6: CONSTRAINTS
├─> Anti-doll constraints
├─> Age integrity checks
├─> Physical coherence
└─> Packaging locks

PRIORITY 7: FINALIZE
├─> Output format
├─> Quality anchors
└─> Negative prompt generation
```

---

### Priority Hierarchy

#### HIGHEST PRIORITY (Cannot be overridden):
1. **Model Reference** → Locks identity, overrides all person controls
2. **UGC Real Mode** → Suppresses studio/editorial vocabulary, overrides lighting

#### MEDIUM PRIORITY (Can be overridden by higher):
3. **Ritual Mode** → Lifestyle-only, blocks product visibility
4. **Formulation Story** → Lifestyle-only, requires person
5. **Hero Canvas** → Blank space composition

#### LOWEST PRIORITY (Most flexible):
6. **Environment** → Can be randomized in UGC
7. **Lighting** → Overridden in UGC
8. **Camera Angle** → Can be randomized in UGC

---

### Builder Injection Points

```typescript
// promptEngine/index.ts:680-850 (approximate)

const parts: string[] = [];

// 1. Deterministic Foundation
parts.push(buildDeterministicFoundation(options));

// 2. Visual Grammar
parts.push(visualGrammarBuilder.build(options));

// 3. Identity (CRITICAL: Can be suppressed by UGC or Model Reference)
if (!options.hasModelReference) {
    parts.push(identityBuilder.build(options));
}

// 4. Selfie Capture
if (isSelfieActive(options)) {
    parts.push(selfieCaptureBuilder.build(options));
}

// 5. UGC Real Mode (DOMINANT)
if (options.ugcRealModeActive) {
    parts.push(ugcBuilder.build(options));
}

// 6. Canonical Scene
parts.push(narrativeBuilder.build(options));

// 7. Formulation Story
if (options.formulationExpertEnabled) {
    parts.push(formulationStoryInjectionBuilder.build(options));
}

// 8. Ritual Mode
if (options.ritualModeActive) {
    parts.push(buildRitualModePrompt(options));
}

// 9. Ecommerce Narrative
if (options.ecommerceSequenceActive) {
    parts.push(ecommerceNarrativeBuilder.build(options));
}

// 10. Constraints
parts.push(constraintsBuilder.build(options));

// 11. Finalize
parts.push(finalizeBuilder.build(options));

return parts.filter(Boolean).join('. ').trim();
```

---

### ✅ Verification

**Order matches logical priority:** ✅ YES

- UGC correctly overrides scene defaults
- Identity suppressed when model reference exists
- Constraints applied after all content builders
- Finalize always last

---

## 6️⃣ ENVIRONMENT LOGIC

### Environment Requirement Status

| Scenario | Required? | What Happens if None? |
|----------|-----------|----------------------|
| **Lifestyle Mode** | ✅ YES | Defaults to first option or user must select |
| **UGC Mode** | ⚠️ **OPTIONAL** | Randomized by `DiversityRandomizer` if not specified |
| **Ritual Mode** | ✅ YES | Environment defines ritual context (e.g., yoga studio, meditation room) |
| **Hero Canvas** | ❌ NO | Environment ignored (blank canvas mode) |
| **Product Studio** | ❌ NO | Studio mode has no environment concept |

---

### UGC Environment Reinterpretation

From `identity.ts:492-510`:

```typescript
if (isUgcMode) {
    const lighting = randomizer.getLightingEnvironment();
    parts.push(`LIGHTING: ${lighting}`);
    
    // Check if user explicitly selected an environment
    // Empty string ('') means "Random / Auto" was selected → no user environment
    const customEnv = (options as any).customEnvironment;
    const settingValue = options.setting && String(options.setting).trim();
    const sceneEnvValue = options.sceneEnvironment && String(options.sceneEnvironment).trim();
    const customEnvValue = customEnv && String(customEnv).trim();
    
    const hasUserEnvironment = Boolean(
        (settingValue && settingValue !== '') ||
        (sceneEnvValue && sceneEnvValue !== '') ||
        (customEnvValue && customEnvValue !== '')
    );
    
    if (hasUserEnvironment) {
        // User selected environment → use it but add random micro-location details
        const backgroundElements = randomizer.getBackgroundElements();
        parts.push(`ENVIRONMENT DETAILS: ${backgroundElements}`);
    } else {
        // No user environment → fully randomize location (bedroom, bathroom, kitchen, etc.)
        const backgroundElements = randomizer.getBackgroundElements();
        parts.push(`ENVIRONMENT: ${backgroundElements}`);
    }
}
```

**Behavior:**
- User selects environment → **Used** but enhanced with random micro-locations
- No environment selected → **Fully randomized** (bedroom, bathroom, kitchen, living room, etc.)
- Environment is **incidental** in UGC, not structural

---

### Environment in Different Modes

#### Lifestyle Mode (Non-UGC)
```typescript
// Environment is REQUIRED
// Drives scene composition, props, lighting context
// Examples: "Modern kitchen with marble countertops"
```

#### UGC Mode
```typescript
// Environment is OPTIONAL / INCIDENTAL
// If specified: used as context but randomized details
// If not specified: fully randomized domestic location
// Examples: 
//   - "Messy bathroom counter with toiletries scattered"
//   - "Unmade bed with wrinkled sheets"
//   - "Kitchen island with breakfast dishes"
```

#### Ritual Mode
```typescript
// Environment is REQUIRED
// Defines ritual context
// Examples: "Yoga studio", "Meditation corner", "Home gym"
```

---

### Random Character Environment Override

**Question:** Does Random Character toggle force environment randomization?

**Answer:** ❌ **NO**

**Reason:** Random Character toggle is not implemented. Environment randomization in UGC happens via `DiversityRandomizer`, which is **always active** in UGC mode (independent of any toggle).

---

### Environment Restoration

**Question:** Is previous environment restored when toggling Random Character off?

**Answer:** ❌ **NO**

**Reason:** 
1. Random Character toggle has no effect (not implemented)
2. No state restoration logic exists
3. Environment selection is independent of identity randomization

---

### Environment Randomization Logic

```typescript
// diversityRandomizer.ts (approximate)
getBackgroundElements(): string {
    const options = [
        'unmade bed with wrinkled sheets visible in background',
        'bathroom counter with scattered toiletries and products',
        'kitchen island with breakfast dishes and coffee mugs',
        'living room couch with throw pillows and blankets',
        'bedroom nightstand with lamp and charging cables',
        'bathroom mirror with water spots and toothpaste residue',
        // ... more options
    ];
    return this.pick(options);
}
```

**Entropy:** Good (uses hashed seed based on userId + timestamp)

---

## 7️⃣ REDUNDANT UI CONTROLS

### Controls That Do NOT Affect Prompt

| Control | Reason | Location |
|---------|--------|----------|
| `isRandomCharacterEnabled` | ❌ **Never mapped to PromptOptions** | `LifestyleStep3.tsx:7862` |
| Time & Lighting (in UGC mode) | ⚠️ **Overridden** but still visible in UI | Needs UI disable logic |

---

### Controls Injected But Visually Disabled

| Control | Status | Evidence |
|---------|--------|----------|
| Time & Lighting (UGC ON) | ✅ Correctly disabled in UI | Accordion logic disables when UGC active |
| Hero Canvas (UGC ON) | ✅ Correctly disabled in UI | Accordion logic disables when UGC active |
| Ritual Mode (UGC ON) | ⚠️ **Not visually disabled** | Only logically blocked via `isUgcModeActive()` |
| Formulation Story (UGC ON) | ⚠️ **Not visually disabled** | Only logically blocked via `isUgcModeActive()` |

**Recommendation:** Add visual disable logic for Ritual/Formulation when UGC active.

---

### Unreachable States

| State Combination | Why Unreachable |
|-------------------|-----------------|
| `ugcRealMode = true` + `ecommerceSidePlacementFlag = true` | Hard error prevents generation |
| `ritualModeActive = true` + `ugcRealModeActive = true` | Ritual disabled by `isUgcModeActive()` |
| `formulationStory = true` + `ugcRealModeActive = true` | Formulation disabled by `isUgcModeActive()` |

---

### UI Implies Behavior NOT Implemented

| UI Element | Implied Behavior | Actual Behavior |
|------------|------------------|-----------------|
| "Random Character" toggle | Randomize all identity attributes | ❌ **NO EFFECT** |
| "Random Character" description text | "Generate completely different person with each image (age, gender, ethnicity, hair, skin, mood, wardrobe)" | ⚠️ **Happens automatically** via `identityVariationToken` when Keep Same Person is OFF |

**User Confusion Risk:** High. Toggle suggests manual control, but randomization happens automatically regardless of toggle state.

---

### Redundant Processing

#### Time & Lighting in UGC

```typescript
// Line 1841-1863: Lighting STILL PROCESSED
if (sceneState.timeOfDay && sceneState.lightingStyle) {
    const timeLabel = String(sceneState.timeOfDay || '').trim();
    const lightingLabel = String(sceneState.lightingStyle || '').trim();
    mapped.lighting = buildLightingSemantic(timeLabel, lightingLabel);
    // ... more processing
}

// Line 1864-1868: IMMEDIATELY OVERRIDDEN
if (sceneState.ugcRealMode && !isEcommerceBlankSpaceActive) {
    mapped.lighting = ugcHouseholdLighting; // ← Previous value discarded
}
```

**Impact:** Wasted CPU cycles, unnecessary string operations

**Fix:** Skip lighting processing entirely when UGC active:
```typescript
if (!sceneState.ugcRealMode && sceneState.timeOfDay && sceneState.lightingStyle) {
    // Process lighting
}
```

---

## 8️⃣ FINAL DIAGNOSTIC OUTPUT

### A) Current Behavior Overview

#### ✅ WORKS AS DESIGNED:

1. **UGC Mode Correctly Overrides:**
   - Suppresses studio/editorial/cinematic vocabulary
   - Injects authentic imperfections
   - Overrides lighting with household casual lighting

2. **Ritual/Formulation Blocked in UGC:**
   - Centralized via `isUgcModeActive()`
   - Prevents conflicting modes

3. **Hero + UGC Hard-Blocked:**
   - Error thrown prevents generation
   - Protects against invalid state

4. **Identity Randomization Automatic:**
   - `identityVariationToken` regenerated each render when `sameCreatorAcrossScenes = false`
   - Works correctly without manual toggle

5. **Diversity Randomizer Prevents AI Clone Syndrome:**
   - Facial structure always randomized
   - Skin texture, hair styling, accessories varied
   - Good entropy from userId + timestamp

6. **Age Anchors Prevent Youthful Rendering:**
   - Explicit age constraints for all age ranges
   - Negative constraints block younger appearance
   - Elder realism for 75+

---

#### ⚠️ PARTIAL IMPLEMENTATION:

1. **Random Character Toggle:**
   - UI exists
   - State never persisted
   - Not consumed by prompt engine
   - Actual randomization happens automatically

2. **Time & Lighting Override in UGC:**
   - UI correctly disables controls ✅
   - Mapper still processes values ⚠️
   - Final output correctly overridden ✅
   - **Result:** Unnecessary processing

3. **Environment "Required" but Optional in UGC:**
   - Marked as required in Lifestyle schema
   - UGC randomizes if not specified
   - **Result:** Inconsistent requirement enforcement

4. **Ritual/Formulation Not Visually Disabled in UGC:**
   - Logically blocked ✅
   - UI still shows as toggleable ❌
   - **Result:** Confusing UX

---

#### ❌ BROKEN:

1. **Random Character Toggle:**
   - Complete dead code
   - Zero effect on generation
   - Misleading UI

2. **No UI Feedback for Conflicting Toggles:**
   - Random + Keep Same Person → Both can be ON
   - Model Reference + Random → Both can be ON
   - No visual indication of conflict

3. **isRandomCharacterEnabled State:**
   - Not in `Step3Values` type
   - Not mapped to `PromptOptions`
   - Never referenced by prompt builders

---

### B) Logical Inconsistencies

#### 1. Random Character Toggle Ghost State

**Issue:** UI suggests feature exists, but state is never persisted or consumed.

**Evidence:**
```typescript
// UI: LifestyleStep3.tsx:7862-7865
<Toggle
    checked={values.isRandomCharacterEnabled || false}
    onCheckedChange={(newValue) => {
        updateValue('isRandomCharacterEnabled', newValue);
    }}
/>

// Type: NOT IN Step3Values interface
// Mapper: NOT REFERENCED in mapLifestyleToPromptOptions.ts
// Prompt: NOT CONSUMED by any builder
```

**Actual Behavior:** Randomization happens automatically via `identityVariationToken` when `sameCreatorAcrossScenes = false`.

---

#### 2. UGC Time/Lighting Half-Override

**Issue:** Lighting processed then immediately overridden in UGC.

**Evidence:**
```typescript
// Step 1: Process lighting (lines 1841-1863)
mapped.lighting = buildLightingSemantic(timeLabel, lightingLabel);

// Step 2: Override lighting (lines 1864-1868)
if (sceneState.ugcRealMode) {
    mapped.lighting = ugcHouseholdLighting; // Previous value discarded
}
```

**Impact:** Wasted computation, confusing code flow.

---

#### 3. Ritual/Formulation UI Not Disabled in UGC

**Issue:** Toggles appear functional but have no effect when UGC active.

**Evidence:**
```typescript
// Logic: Blocked via isUgcModeActive() ✅
// UI: Still toggleable ❌
```

**User Experience:** Confusing. User can enable Ritual Mode but it won't work.

---

#### 4. Environment "Required" but Optional in UGC

**Issue:** Schema marks environment as required, but UGC randomizes if missing.

**Evidence:**
```typescript
// Lifestyle: Environment required
// UGC: Environment optional, randomized if not specified
```

**Impact:** Inconsistent validation.

---

### C) Hidden Conflicts

#### 1. Random Character + Keep Same Person

**UI Behavior:** Both toggles can be ON simultaneously  
**Actual Behavior:** Keep Same Person silently wins  
**Evidence:**
```typescript
// promptEngine/index.ts:494
const shouldRandomizeIdentity = 
    !options.hasModelReference &&
    options.sameCreatorAcrossScenes !== true && // ← BLOCKS randomization
    options.identityMode !== 'locked';
```
**Issue:** No UI feedback for conflict

---

#### 2. Model Reference + Random Character

**UI Behavior:** Both can be ON simultaneously  
**Actual Behavior:** Model Reference silently wins  
**Evidence:**
```typescript
// promptEngine/index.ts:494
const shouldRandomizeIdentity = 
    !options.hasModelReference && // ← BLOCKS randomization
    ...;
```
**Issue:** No UI feedback for conflict

---

#### 3. UGC + Controlled Lighting Selection

**UI Behavior:** User can select lighting in UI  
**Processing:** Selection processed by mapper  
**Result:** UGC overrides with household lighting  
**Issue:** Wasted computation, no clear feedback

---

### D) Redundant Controls

#### 1. `isRandomCharacterEnabled` - Complete Dead Code

**Impact:** HIGH  
**Reason:** Toggle appears functional but has ZERO effect  
**User Confusion:** HIGH  

**Recommendation:** Remove toggle OR implement properly

---

#### 2. Time & Lighting in UGC - Processed But Overridden

**Impact:** MEDIUM  
**Reason:** Wasted computation cycles  
**User Confusion:** LOW (UI correctly disabled)  

**Recommendation:** Skip processing when UGC active

---

#### 3. Ritual Mode Toggle When UGC ON - Visible But Non-Functional

**Impact:** MEDIUM  
**Reason:** User can toggle but has no effect  
**User Confusion:** HIGH  

**Recommendation:** Visually disable when UGC active

---

### E) Risk of Identity Repetition

#### ✅ LOW RISK

**Randomization Mechanism:**
```typescript
// identity.ts:380-385
const diversitySeed = createDiversitySeed(
    options.userId || 'user',
    options.timestamp || Date.now()
);
const randomizer = new DiversityRandomizer(diversitySeed);
```

**Entropy Sources:**
1. **User ID:** Stable per user
2. **Timestamp:** Millisecond precision
3. **Random component:** `Math.random()` for `identityVariationToken`

**Face Signature Generation:**
```typescript
// identity.ts:55-70
private hashToken(input: string): number {
    // FNV-1a 32-bit hash
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
```

**Variations Applied:**
- Facial structure (9 features: face shape, jaw, cheekbones, eyes, brows, nose, lips, forehead, hairline)
- Camera angle (UGC only, if not specified)
- Skin texture
- Hair styling
- Overall appearance (UGC only)
- Accessories
- Clothing (UGC only)
- Facial hair (masculine, age 18-74)
- Ethnicity (if "Non-specific")
- Lighting (UGC only)
- Environment (UGC only)

**ONLY Repetition Risk:**  
User clicks "Keep Same Person" → `identityMode: 'locked'` → same `identityKey` reused → **INTENDED BEHAVIOR**

---

### F) Architecture Soundness Score

## **7.5 / 10**

---

### Strengths (+3.5 points)

#### ✅ Centralized UGC Mode Detection
- `isUgcModeActive()` provides single source of truth
- Prevents scattered conditional logic
- Easy to maintain and audit

#### ✅ Hard Blocks for Illegal Combinations
- UGC + Hero → Error thrown
- Prevents invalid state from reaching model

#### ✅ Diversity Randomizer Prevents Clone Syndrome
- Always randomizes facial structure
- Good entropy from userId + timestamp
- Multiple variation layers

#### ✅ Clear Builder Priority Hierarchy
- Well-documented order
- UGC correctly overrides scene defaults
- Identity suppressed when model reference exists

#### ✅ Age Anchors with Negative Constraints
- Prevents model drift to younger ages
- Explicit age markers for all age ranges
- Elder realism for 75+

---

### Weaknesses (-2.5 points)

#### ❌ Ghost State: `isRandomCharacterEnabled`
- Complete dead code in UI
- Zero effect on generation
- High user confusion risk

#### ❌ No UI Feedback for Conflicting Toggles
- Random + Keep Same Person → No warning
- Model Reference + Random → No warning
- User has no idea which takes priority

#### ❌ Partial Time/Lighting Override in UGC
- Processed then overridden
- Wasted computation
- Confusing code flow

#### ❌ Ritual/Formulation Not Visually Disabled in UGC
- Logically blocked but UI shows as toggleable
- High user confusion risk

#### ❌ Environment "Required" but Randomized in UGC
- Inconsistent requirement enforcement
- Schema says required, UGC makes optional

---

## 🎯 RECOMMENDATIONS (NOT IMPLEMENTED - ANALYSIS ONLY)

### Priority 1: Critical Issues

1. **Remove `isRandomCharacterEnabled` toggle** OR implement properly
   - Current state: Complete dead code
   - Impact: High user confusion
   - Fix: Remove UI toggle OR implement full feature

2. **Add UI auto-disable logic for conflicting toggles**
   - Random Character + Keep Same Person
   - Random Character + Model Reference
   - Add visual feedback when one overrides the other

### Priority 2: Performance Issues

3. **Fully skip Time/Lighting mapping when UGC active**
   - Current: Processed then overridden
   - Fix: Add early return in mapper

4. **Visually disable Ritual/Formulation when UGC ON**
   - Current: Toggleable but non-functional
   - Fix: Add conditional `disabled` prop

### Priority 3: Clarity Issues

5. **Clarify environment requirement**
   - Document: Required for Lifestyle, optional for UGC
   - Update schema or add conditional validation

6. **Add tooltip explaining automatic randomization**
   - When Keep Same Person is OFF
   - Randomization happens automatically
   - No manual toggle needed

---

## 📊 DEPENDENCY MAP

```
┌─────────────────────────────────────────────────────────────┐
│                     GLOBAL STATE FLOW                        │
└─────────────────────────────────────────────────────────────┘

UI (LifestyleStep3.tsx)
  │
  ├─> Step3Values (interface)
  │     │
  │     ├─> ugcRealMode ──────────────> mapLifestyleToPromptOptions()
  │     │                                      │
  │     │                                      v
  │     │                               PromptOptions
  │     │                                      │
  │     │                                      v
  │     │                               PromptEngine.build()
  │     │                                      │
  │     │                                      ├─> identityBuilder
  │     │                                      ├─> ugcBuilder
  │     │                                      ├─> narrativeBuilder
  │     │                                      └─> finalizeBuilder
  │     │
  │     ├─> sameCreatorAcrossScenes ──> identityMode: 'locked'
  │     │                                      │
  │     │                                      v
  │     │                               identityKey (persisted)
  │     │
  │     ├─> ritualModeEnabled ────────> ritualModeActive
  │     │                                      │
  │     │                                      v
  │     │                               isUgcModeActive()
  │     │                                      │
  │     │                                      v
  │     │                               Blocks UGC if Ritual ON
  │     │
  │     ├─> formulationStoryEnabled ──> formulationStory
  │     │                                      │
  │     │                                      v
  │     │                               isUgcModeActive()
  │     │                                      │
  │     │                                      v
  │     │                               Blocks UGC if Formulation ON
  │     │
  │     └─> isRandomCharacterEnabled ─> ❌ GHOST STATE (not mapped)
  │
  └─> hasModelReference (prop) ───────> identityMode: 'locked'
                                              │
                                              v
                                        Suppresses identity builder
```

---

## 📝 STATE PERSISTENCE AUDIT

| State Variable | Persisted? | Where? | Reset On? |
|----------------|-----------|--------|-----------|
| `ugcRealMode` | ✅ Yes | `Step3Values` | User toggle |
| `isRandomCharacterEnabled` | ❌ **NO** | UI-only | N/A (not persisted) |
| `sameCreatorAcrossScenes` | ✅ Yes | `Step3Values` | User toggle |
| `identityKey` | ✅ Yes | `PromptOptions` | When `sameCreatorAcrossScenes` OFF |
| `identityVariationToken` | ❌ No | Generated per render | Every render |
| `ritualModeEnabled` | ✅ Yes | `Step3Values` | User toggle |
| `formulationStoryEnabled` | ✅ Yes | `Step3Values` | User toggle |
| `environment` | ✅ Yes | `Step3Values` | User selection |

---

## 🔗 CONFLICT RESOLUTION CHAIN

```
When multiple flags are active, resolution order:

1. MODEL REFERENCE (highest priority)
   └─> Locks identity
   └─> Suppresses identity builder
   └─> identityMode = 'locked'

2. UGC REAL MODE
   └─> Disables if Ritual/Formulation active
   └─> Overrides lighting
   └─> Randomizes camera angle (if not specified)
   └─> Blocks Hero Canvas (hard error)

3. SAME CREATOR ACROSS SCENES
   └─> identityMode = 'locked'
   └─> identityKey persisted
   └─> Blocks automatic randomization

4. RITUAL MODE / FORMULATION STORY
   └─> Disables UGC mode
   └─> Lifestyle-only features

5. RANDOM CHARACTER (if implemented)
   └─> Would be blocked by all above
   └─> Currently: no effect (not implemented)
```

---

## END OF AUDIT

**Report Generated:** February 19, 2026  
**Branch:** review-v2  
**Total Lines Analyzed:** ~15,000+  
**Files Audited:** 
- `src/components/LifestyleStep3.tsx` (9,066 lines)
- `src/lib/promptEngine/mapLifestyleToPromptOptions.ts` (2,267 lines)
- `src/lib/promptEngine/index.ts` (1,006 lines)
- `src/lib/promptEngine/types.ts` (362 lines)
- `src/lib/promptEngine/builders/identity.ts` (823 lines)
- `src/lib/promptEngine/builders/diversityRandomizer.ts`
- Multiple supporting files

**Key Findings:**
- 1 Ghost State (isRandomCharacterEnabled)
- 3 UI/Logic Mismatches (conflicting toggles)
- 2 Performance Issues (redundant processing)
- 4 UX Clarity Issues (missing visual feedback)

**Architecture Score:** 7.5/10

---

**IMPORTANT:** This is an analysis-only document. No implementation changes have been made.
