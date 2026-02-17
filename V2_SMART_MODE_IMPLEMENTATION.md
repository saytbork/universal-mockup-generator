# V2 Smart Mode Implementation - Architecturally Correct

## ⚠️ CRITICAL: Read Before Implementing

**You MUST inspect actual V2 architecture first.**

This guide uses TEMPLATE values. You must replace them with real SceneState fields from your codebase.

**DO NOT copy/paste blindly. You will break the system.**

---

## STEP 0: Inspect Current V2 Architecture (MANDATORY)

Run these commands to understand actual state structure:

```bash
# 1. Check actual SceneState fields
cat src/lib/productStudioV2/store.ts

# 2. Check what builders accept
cat src/lib/productStudioV2/builders/buildLighting.ts
cat src/lib/productStudioV2/builders/buildComposition.ts
cat src/lib/productStudioV2/builders/buildWorld.ts

# 3. Find existing chip values
grep -r "onClick.*sceneState" src/components/
```

**Document actual field names before proceeding.**

---

## STEP 1: Update SceneState (Minimal)

File: `src/lib/productStudioV2/store.ts`

Add ONLY these 3 properties:

```typescript
// Add these type definitions
export type ImagePurpose = 'product_only' | 'with_human' | null;
export type CommercialIntent = 
  | 'pdp_main' 
  | 'premium_studio' 
  | 'hero_banner' 
  | 'ad_creative'
  | 'pdp_lifestyle' 
  | 'social_content' 
  | 'raw_ugc' 
  | 'conversion_ad'
  | null;

// Add to existing SceneState interface
export interface SceneState {
  // ... ALL EXISTING FIELDS UNCHANGED ...
  
  // NEW (only these 3):
  imagePurpose: ImagePurpose;
  commercialIntent: CommercialIntent;
  smartMode: boolean;
}

// Update existing initialSceneState
export const initialSceneState: SceneState = {
  // ... ALL EXISTING DEFAULTS UNCHANGED ...
  
  // NEW (only these 3):
  imagePurpose: null,
  commercialIntent: null,
  smartMode: true,
};
```

**DO NOT ADD ANY OTHER FIELDS.**

---

## STEP 2: Create Smart Presets (TEMPLATE - Must Fill With Real Values)

File: `src/lib/productStudioV2/smartPresets.ts` (NEW FILE)

```typescript
import type { SceneState } from './store';

// CRITICAL: Only chip-controlled fields
// Extract actual field names from SceneState
// DO NOT include: imagePurpose, commercialIntent, smartMode, upload state, derived flags
type ChipControlledFields = Pick<SceneState,
  // TODO: Replace with ACTUAL chip-controlled field names from SceneState
  // Examples (verify these exist):
  // | 'lightingIntensity'
  // | 'lightingDirection'
  // | 'cameraPosition'
  // | 'frameComposition'
  // | 'frameCrop'
  // | 'imperfectionAmount'
  // | 'productPlacement'
  // | 'enableMotion'
  // | 'personaType'      // Only for 'with_human' purpose
  // | 'personaGender'    // Only for 'with_human' purpose
  // etc.
>;

type SmartPreset = Partial<ChipControlledFields>;

// ⚠️ TEMPLATE - Replace ALL values with actual SceneState field names
export const SMART_PRESETS: Record<string, SmartPreset> = {
  pdp_main: {
    // TODO: Fill with actual chip-controlled fields only
  },
  
  premium_studio: {
    // TODO: Fill with actual chip-controlled fields only
  },
  
  hero_banner: {
    // TODO: Fill with actual chip-controlled fields only
  },
  
  ad_creative: {
    // TODO: Fill with actual chip-controlled fields only
  },
  
  pdp_lifestyle: {
    // TODO: Fill with actual chip-controlled fields only
    // May include persona fields (will be stripped if purpose !== 'with_human')
  },
  
  social_content: {
    // TODO: Fill with actual chip-controlled fields only
  },
  
  raw_ugc: {
    // TODO: Fill with actual chip-controlled fields only
  },
  
  conversion_ad: {
    // TODO: Fill with actual chip-controlled fields only
  },
};

// Persona field names (extract from actual SceneState)
const PERSONA_FIELDS = new Set<keyof SceneState>([
  // TODO: Replace with actual persona field names
  // 'personaType',
  // 'personaGender',
  // 'personaAge',
  // etc.
]);

// Returns new state with preset values
// Does NOT mutate input state
// Does NOT call builders
// Strips persona fields if purpose !== 'with_human'
export function getSmartPresetState(
  currentState: SceneState,
  intent: string
): SceneState {
  const preset = SMART_PRESETS[intent];
  if (!preset) return currentState;
  
  // Filter out persona fields if not with_human
  let filteredPreset = preset;
  if (currentState.imagePurpose !== 'with_human') {
    filteredPreset = Object.keys(preset).reduce((acc, key) => {
      if (!PERSONA_FIELDS.has(key as keyof SceneState)) {
        acc[key as keyof ChipControlledFields] = preset[key as keyof ChipControlledFields];
      }
      return acc;
    }, {} as SmartPreset);
  }
  
  // Only override chip-controlled fields
  // Preserve imagePurpose, commercialIntent, smartMode, upload state
  return {
    ...currentState,
    ...filteredPreset,
  };
}
```

**YOU MUST MANUALLY INSPECT store.ts AND FILL ACTUAL FIELD NAMES.**

### How to Fill Presets:

```typescript
// 1. Open src/lib/productStudioV2/store.ts
// 2. Find SceneState interface
// 3. Identify ONLY chip-controlled fields (exclude imagePurpose, commercialIntent, smartMode, upload, derived)
// 4. Look for fields like:
export interface SceneState {
  // Chip-controlled fields (example - verify actual)
  lightingIntensity?: 'soft' | 'hard' | 'dramatic';
  lightingDirection?: 'front' | 'side' | 'back';
  cameraAngle?: 'front-45' | 'top-down' | 'hero';
  compositionType?: 'centered' | 'rule-of-thirds';
  
  // Persona fields (only for 'with_human')
  personaType?: 'clean-hands' | 'casual-user' | 'real-user';
  personaGender?: 'male' | 'female' | 'neutral';
  
  // DO NOT include these in ChipControlledFields:
  imagePurpose: ImagePurpose;        // ❌ orchestration field
  commercialIntent: CommercialIntent; // ❌ orchestration field
  smartMode: boolean;                // ❌ orchestration field
  uploadedImage?: string;            // ❌ upload state
  // etc.
}

// 5. Update ChipControlledFields type:
type ChipControlledFields = Pick<SceneState,
  | 'lightingIntensity'
  | 'lightingDirection'
  | 'cameraAngle'
  | 'compositionType'
  | 'personaType'
  | 'personaGender'
  // ... only chip-controlled fields
>;

// 6. Update PERSONA_FIELDS:
const PERSONA_FIELDS = new Set<keyof SceneState>([
  'personaType',
  'personaGender',
  'personaAge',
  // ... all persona-related fields
]);

// 7. Fill presets with exact field names and values:
pdp_main: {
  lightingIntensity: 'soft',      // ✅ exists and is chip-controlled
  lightingDirection: 'front',     // ✅ exists and is chip-controlled
  cameraAngle: 'front-45',        // ✅ exists and is chip-controlled
  compositionType: 'centered',    // ✅ exists and is chip-controlled
  // NOT: imagePurpose: 'product_only'  ❌ orchestration field
  // NOT: lightingMode: 'studio-soft'   ❌ doesn't exist
}

// 8. For 'with_human' presets, include persona fields:
pdp_lifestyle: {
  lightingIntensity: 'soft',
  cameraAngle: 'eye-level',
  personaType: 'clean-hands',     // ✅ will be stripped if purpose !== 'with_human'
  personaGender: 'neutral',       // ✅ will be stripped if purpose !== 'with_human'
}
```

---

## STEP 3: Update UI Component

File: `src/components/ProductStudioV2.tsx`

```typescript
import { getSmartPresetState } from '../lib/productStudioV2/smartPresets';
import type { ImagePurpose, CommercialIntent } from '../lib/productStudioV2/store';

function ProductStudioV2() {
  const [sceneState, setSceneState] = useState(initialSceneState);
  
  // Purpose selection
  const handlePurposeSelect = (purpose: ImagePurpose) => {
    setSceneState(prev => ({
      ...prev,
      imagePurpose: purpose,
      commercialIntent: null, // reset intent when purpose changes
    }));
  };
  
  // Intent selection
  const handleIntentSelect = (intent: CommercialIntent) => {
    setSceneState(prev => ({
      ...prev,
      commercialIntent: intent,
    }));
  };
  
  // Smart mode toggle
  const handleSmartModeToggle = () => {
    setSceneState(prev => ({
      ...prev,
      smartMode: !prev.smartMode,
    }));
  };
  
  // Generate handler
  const handleGenerate = async () => {
    let finalState = sceneState;
    
    // If smart mode, derive preset state at generation time
    // This does NOT mutate sceneState
    if (sceneState.smartMode && sceneState.commercialIntent) {
      finalState = getSmartPresetState(sceneState, sceneState.commercialIntent);
    }
    
    // EXISTING pipeline - completely unchanged
    const composition = buildComposition(finalState);
    const lighting = buildLighting(finalState);
    const world = buildWorld(finalState);
    
    const payload = { composition, lighting, world };
    await generateImage(payload);
  };
  
  return (
    <div className="studio-v2">
      {/* Layer 1: Purpose */}
      <div className="chip-group">
        <label>Image Purpose</label>
        <div className="chips">
          <button 
            className={`chip ${sceneState.imagePurpose === 'product_only' ? 'selected' : ''}`}
            onClick={() => handlePurposeSelect('product_only')}
          >
            Product Only
          </button>
          <button 
            className={`chip ${sceneState.imagePurpose === 'with_human' ? 'selected' : ''}`}
            onClick={() => handlePurposeSelect('with_human')}
          >
            With Human Context
          </button>
        </div>
      </div>
      
      {/* Layer 2: Intent (dynamic based on purpose) */}
      {sceneState.imagePurpose && (
        <div className="chip-group">
          <label>Commercial Intent</label>
          <div className="chips">
            {sceneState.imagePurpose === 'product_only' ? (
              <>
                <button className={`chip ${sceneState.commercialIntent === 'pdp_main' ? 'selected' : ''}`} onClick={() => handleIntentSelect('pdp_main')}>PDP Main</button>
                <button className={`chip ${sceneState.commercialIntent === 'premium_studio' ? 'selected' : ''}`} onClick={() => handleIntentSelect('premium_studio')}>Premium Studio</button>
                <button className={`chip ${sceneState.commercialIntent === 'hero_banner' ? 'selected' : ''}`} onClick={() => handleIntentSelect('hero_banner')}>Hero Banner</button>
                <button className={`chip ${sceneState.commercialIntent === 'ad_creative' ? 'selected' : ''}`} onClick={() => handleIntentSelect('ad_creative')}>Ad Creative</button>
              </>
            ) : (
              <>
                <button className={`chip ${sceneState.commercialIntent === 'pdp_lifestyle' ? 'selected' : ''}`} onClick={() => handleIntentSelect('pdp_lifestyle')}>PDP Lifestyle</button>
                <button className={`chip ${sceneState.commercialIntent === 'social_content' ? 'selected' : ''}`} onClick={() => handleIntentSelect('social_content')}>Social Content</button>
                <button className={`chip ${sceneState.commercialIntent === 'raw_ugc' ? 'selected' : ''}`} onClick={() => handleIntentSelect('raw_ugc')}>Raw UGC</button>
                <button className={`chip ${sceneState.commercialIntent === 'conversion_ad' ? 'selected' : ''}`} onClick={() => handleIntentSelect('conversion_ad')}>Conversion Ad</button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Layer 3: Smart/Advanced Toggle */}
      {sceneState.commercialIntent && (
        <div className="toggle-group">
          <label>Control Level</label>
          <div className="toggles">
            <button className={`toggle ${sceneState.smartMode ? 'active' : ''}`} onClick={handleSmartModeToggle}>Smart Generate</button>
            <button className={`toggle ${!sceneState.smartMode ? 'active' : ''}`} onClick={handleSmartModeToggle}>Advanced Customize</button>
          </div>
        </div>
      )}
      
      {/* EXISTING V2 CHIPS - Only visible in Advanced mode */}
      {!sceneState.smartMode && (
        <>
          {/* ALL EXISTING CHIP GROUPS - COMPLETELY UNCHANGED */}
          {/* NO structural changes, NO refactoring */}
          {/* Just gate visibility - chips render exactly as before */}
        </>
      )}
      
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}

```

---

## STEP 4: Validation Before Testing

### Pre-Implementation Checklist:

- [ ] Inspected `store.ts` and documented actual SceneState fields
- [ ] Identified chip-controlled fields (excluded orchestration/upload/derived fields)
- [ ] Created restrictive `ChipControlledFields` type (not `Partial<SceneState>`)
- [ ] Identified all persona-related fields for PERSONA_FIELDS set
- [ ] Verified all preset field names exist in ChipControlledFields
- [ ] Verified all preset values match existing chip option unions
- [ ] No invented enum strings in presets
- [ ] No orchestration fields in presets (imagePurpose, commercialIntent, smartMode)
- [ ] Persona guard implemented in getSmartPresetState
- [ ] Smart mode toggle does NOT mutate state (only toggles boolean)

### Post-Implementation Checklist:

- [ ] Smart mode ON: Only shows 3 decision layers (purpose, intent, toggle)
- [ ] Smart mode ON: Generate button works
- [ ] Smart mode ON: Builders receive correct state structure
- [ ] Advanced mode: Shows all existing V2 chips
- [ ] Advanced mode: All chips function as before
- [ ] Purpose switch: Clears intent selection
- [ ] Product Only: Shows 4 product intent chips
- [ ] With Human: Shows 4 human context intent chips
- [ ] Toggle between Smart/Advanced: No errors
- [ ] No console errors or warnings
- [ ] No builder files were modified
- [ ] Existing V2 users see no changes when in Advanced mode

---

## Architecture Compliance

### ✅ Correct Implementation:
- Presets restricted to ChipControlledFields type (not Partial<SceneState>)
- Presets exclude: imagePurpose, commercialIntent, smartMode, upload, derived flags
- Persona fields stripped when purpose !== 'with_human'
- Smart mode derives preset only at generation time (not on toggle)
- Toggle handler only changes smartMode boolean (no state mutation)
- Builders receive same state structure as before
- No new semantic layer introduced
- Advanced mode = visible chips (existing V2, no refactoring)
- No builder logic modified
- No resolver changes
- Chip components structurally unchanged (visibility gated only)

### ❌ Incorrect Implementation (Will Break System):
- Using `Partial<SceneState>` instead of restricted type
- Including orchestration fields in presets (imagePurpose, commercialIntent, smartMode)
- Including upload state or derived flags in presets
- No persona field guard (leaks persona to product_only mode)
- Mutating state on toggle (pre-populating chips when switching modes)
- Inventing new field names not in SceneState
- Bypassing builder resolvers with direct values
- Modifying builder files
- Refactoring chip component structure
- Creating new state machine abstraction
- Adding orchestration folder

---

## Flow Diagram

```
User uploads → [Product Only] [With Human]
                      ↓
              (selects Product Only)
                      ↓
         [PDP Main] [Premium] [Hero] [Ad]
                      ↓
               (selects PDP Main)
                      ↓
         [Smart Generate ✓] [Advanced]
                      ↓
              (Smart is default ON)
                      ↓
    [Generate] ← 3 clicks total, 0 chip decisions
```

Advanced path:
```
... same 3 clicks above ...
                      ↓
           (toggles Advanced ON)
                      ↓
    [All existing V2 chip groups appear]
                      ↓
    [User configures chips manually]
                      ↓
              [Generate] ← same as current V2
```

---

## Summary

### Files Modified: 2
1. `src/lib/productStudioV2/store.ts` (+10 lines)
2. `src/components/ProductStudioV2.tsx` (~80 lines added)

### Files Created: 1
1. `src/lib/productStudioV2/smartPresets.ts` (~100 lines, mostly templates)

### Total New Code: ~190 lines
### Builders Touched: 0
### Breaking Changes: 0
### Architectural Changes: 0

### Implementation Time:
- Step 0 (Architecture inspection): 15 minutes
- Step 1 (SceneState update): 5 minutes
- Step 2 (Fill preset templates): 30 minutes ⚠️ CANNOT BE RUSHED
- Step 3 (UI component): 20 minutes
- Step 4 (Testing): 20 minutes

**Total: ~90 minutes** (most time spent inspecting and filling correct values)

---

## Critical Success Factors

1. **DO NOT skip Step 0** - Architecture inspection is mandatory
2. **DO NOT use Partial<SceneState>** - Use restrictive ChipControlledFields type
3. **DO NOT include orchestration fields** - Exclude imagePurpose, commercialIntent, smartMode
4. **DO NOT mutate on toggle** - Smart mode derives at generation only
5. **DO implement persona guard** - Strip persona fields for product_only mode
6. **DO NOT invent field names** - Only use existing chip-controlled fields
7. **DO NOT modify builders** - Only orchestration layer changes
8. **DO NOT refactor chips** - Only gate visibility, no structural changes
9. **DO NOT rush preset mapping** - Incorrect values = silent failures
10. **DO TEST thoroughly** - Verify builders receive correct state

---

## Final Architectural Confirmations

### 1. Zero Builder Contract Assumptions ✅ **CONDITIONAL**

**Status:** Cannot confirm without inspection.

**Action Required:**
```bash
# MUST run before implementation:
cat src/lib/productStudioV2/store.ts
grep -r "setSceneState\|sceneState\." src/components/
```

**Confirmation Criteria:**
- Every field in `ChipControlledFields` exists in current `SceneState` ✅
- Every field is directly set by existing chip `onClick` handlers ✅
- Every field is consumed by existing builders (`buildLighting`, `buildComposition`, `buildWorld`) ✅
- No inferred fields ✅
- No expected fields ✅
- No renamed fields ✅

**Cannot be confirmed in guide. Must be validated during Step 0 inspection.**

---

### 2. No Default Leakage ✅ **CONFIRMED**

```typescript
// In getSmartPresetState:
const preset = SMART_PRESETS[intent];
if (!preset) return currentState; // ✅ Returns unchanged state

// In handleGenerate:
if (sceneState.smartMode && sceneState.commercialIntent) {
  finalState = getSmartPresetState(sceneState, sceneState.commercialIntent);
}
// ✅ Both conditions must be truthy
```

**Behavioral Contract:**
- `imagePurpose = null` → No preset application ✅
- `commercialIntent = null` → No preset application ✅
- `smartMode = false` → No preset application ✅
- No implicit preset ✅
- No fallback behavior ✅

---

### 3. Persona Guard Exhaustiveness ⚠️ **RISK IDENTIFIED**

**Current Implementation:**
```typescript
const PERSONA_FIELDS = new Set<keyof SceneState>([
  // TODO: Replace with actual persona field names
]);
```

**Problem:** Manual maintenance = silent drift risk.

**Safer Structural Alternative:**

```typescript
// Option A: Nested persona structure (RECOMMENDED if refactoring is acceptable)
// In store.ts:
export interface PersonaFields {
  personaType?: string;
  personaGender?: string;
  personaAge?: string;
}

export interface SceneState {
  // ... other fields ...
  persona?: PersonaFields; // Nested
}

// In smartPresets.ts:
type ChipControlledFields = Pick<SceneState,
  | 'lightingIntensity'
  | 'cameraAngle'
> & {
  persona?: PersonaFields;
};

// Guard becomes structural:
if (currentState.imagePurpose !== 'with_human') {
  delete filteredPreset.persona; // Single deletion, no drift
}

// Option B: Manual maintenance (CURRENT - requires discipline)
// Must document all persona fields and update when adding new ones
const PERSONA_FIELDS = new Set<keyof SceneState>([
  'personaType',
  'personaGender',
  'personaAge',
  // ⚠️ MUST update this list when adding persona fields
]);
```

**Recommendation:** Accept manual maintenance OR refactor SceneState structure.

**Current Status:** ⚠️ **Drift risk exists** - requires documentation discipline.

---

### 4. Smart Preset Override Behavior ✅ **CONFIRMED**

**Scenario:**
1. User selects "Premium Studio"
2. Switches to Advanced
3. Modifies lighting manually → `sceneState.lightingIntensity = 'hard'`
4. Switches back to Smart → `sceneState.smartMode = true`
5. Generates

**Behavioral Contract:**
```typescript
// handleSmartModeToggle does NOT mutate:
const handleSmartModeToggle = () => {
  setSceneState(prev => ({
    ...prev,
    smartMode: !prev.smartMode, // ✅ Only toggles boolean
  }));
};

// handleGenerate derives temporary state:
let finalState = sceneState; // ✅ Preserves manual edits
if (sceneState.smartMode && sceneState.commercialIntent) {
  finalState = getSmartPresetState(sceneState, sceneState.commercialIntent);
  // ✅ Creates NEW state object, does NOT mutate sceneState
}
// sceneState.lightingIntensity is still 'hard' ✅
```

**Result:**
- Smart mode derives fresh preset at generation time ✅
- Original `sceneState` preserves manual edits ✅
- If user switches to Advanced again, sees their manual edits ✅
- No permanent mutation ✅

**Smart = derived at generation time only** ✅  
**Advanced = persistent manual state** ✅

---

### 5. No Performance Regression ✅ **CONFIRMED**

**getSmartPresetState Complexity:**
```typescript
// O(p) where p = number of preset fields (~8-12)
const preset = SMART_PRESETS[intent]; // O(1) hash lookup

// O(p) iteration over preset keys
if (currentState.imagePurpose !== 'with_human') {
  filteredPreset = Object.keys(preset).reduce((acc, key) => {
    if (!PERSONA_FIELDS.has(key as keyof SceneState)) { // O(1) Set lookup
      acc[key] = preset[key];
    }
    return acc;
  }, {});
}

// O(s + p) where s = SceneState size, p = preset size
return { ...currentState, ...filteredPreset }; // Shallow spread
```

**Total Complexity:** O(s + p) = O(n) ✅

**No deep cloning** ✅  
**No large state object duplication** ✅  
**No runtime dynamic key scanning beyond preset** ✅  
**Shallow merge only** ✅

---

### 6. UI Integrity ✅ **CONFIRMED**

**Current Implementation:**
```tsx
{!sceneState.smartMode && (
  <>
    {/* ALL EXISTING CHIP GROUPS - COMPLETELY UNCHANGED */}
  </>
)}
```

**Behavioral Contract:**
- Existing chip components render identically ✅
- No new wrapper containers ✅
- No layout changes ✅
- Only visibility gating via conditional rendering ✅
- No structural JSX reordering ✅
- Chips remain in same position when visible ✅

**CSS Impact:** None (conditional rendering, not CSS display changes) ✅

---

## Final Approval Status

| Condition | Status | Note |
|-----------|--------|------|
| 1. Zero builder assumptions | ⚠️ **Conditional** | Must validate in Step 0 |
| 2. No default leakage | ✅ **Confirmed** | - |
| 3. Persona guard exhaustive | ⚠️ **Drift risk** | Manual maintenance required |
| 4. Smart preset override | ✅ **Confirmed** | - |
| 5. No performance regression | ✅ **Confirmed** | - |
| 6. UI integrity | ✅ **Confirmed** | - |

**Overall Status:** ✅ **APPROVED WITH CONDITIONS**

**Mandatory Conditions:**
1. MUST complete Step 0 inspection before filling presets
2. MUST validate all ChipControlledFields exist and are chip-controlled
3. ACCEPT manual persona guard maintenance risk OR refactor to nested structure

**Implementation Ready:** Yes, with Step 0 mandatory.

---

END OF ARCHITECTURALLY CORRECT IMPLEMENTATION GUIDE
