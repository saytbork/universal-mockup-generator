# 🧘 RITUAL MODE - PROMPT INJECTION PER ACTIVITY

**Date:** February 19, 2026  
**Branch:** `review-v2`  
**Source:** `canonicalScene.ts:238-293`

---

## 📋 PROMPT INJECTIONS BY RITUAL ACTIVITY

### 1. **Meditation**

**With Objects Allowed:**
```
Show a clear meditation posture (seated cross-legged or on a chair), relaxed shoulders, hands resting on knees; keep the setting minimal and calm.
```

**No Objects Mode (`ritualNoObjects = true`):**
```
Show a clear meditation posture (seated cross-legged or on a chair), relaxed shoulders, hands resting on knees; empty hands, no props.
```

---

### 2. **Breathwork**

**With Objects Allowed:**
```
Show an obvious breathwork action: seated posture, one hand on belly and one on chest, slow exhale, calm focused breathing.
```

**No Objects Mode:**
```
Show an obvious breathwork action: seated posture, one hand on belly and one on chest, slow exhale; no props, empty hands.
```

---

### 3. **Yoga**

**With Objects Allowed:**
```
Show a recognizable yoga pose (sun salutation, downward dog, warrior pose); body posture must read as actively practicing.
```

**No Objects Mode:**
```
Show a recognizable yoga pose (sun salutation, downward dog, warrior pose); body posture must read as actively practicing; no props.
```

---

### 4. **Running**

**With Objects Allowed:**
```
Show a running moment (mid-stride) or a pre/post-run action (stretching calves) with athletic wear.
```

**No Objects Mode:**
```
Show a running moment (mid-stride) with athletic wear; no handheld items.
```

---

### 5. **Strength Training**

**With Objects Allowed:**
```
Show a clear strength training action: dumbbells/kettlebell, squat/lunge/press, or resistance bands; visible exertion and proper form.
```

**No Objects Mode:**
```
Show a clear strength training action using bodyweight only (squats, lunges, push-ups) with visible exertion and proper form; no equipment.
```

---

### 6. **Stretching**

**With Objects Allowed:**
```
Show a visible stretching action (hamstring stretch, quad stretch, shoulder stretch); body position must read as actively stretching.
```

**No Objects Mode:**
```
Show a visible stretching action (hamstring stretch, quad stretch, shoulder stretch); body position must read as actively stretching; no props.
```

---

### 7. **Digestive Relief**

**With Objects Allowed:**
```
Show a digestive relief moment: gentle belly breathing, hands resting on abdomen, slow exhale, relaxed posture; calm comfortable setting.
```

**No Objects Mode:**
```
Show a digestive relief moment: gentle belly breathing, hands resting on abdomen, slow exhale, relaxed posture; no props.
```

---

### 8. **Morning Routine**

**With Objects Allowed:**
```
Show a morning routine action: making coffee/tea, opening curtains, journaling at a table, or preparing breakfast; warm morning light and tidy setting.
```

**No Objects Mode:**
```
Show a morning routine action without props: opening curtains, stretching, or preparing to leave the house; warm morning light; no items in hands.
```

---

### 9. **Journaling**

**With Objects Allowed:**
```
Show an obvious journaling action: notebook open, pen in hand, writing mid-sentence at a table; soft morning/afternoon light.
```

**No Objects Mode:**
```
Show a reflective journaling moment without props: seated posture, thoughtful pause, hands relaxed; no notebook/pen.
```

---

### 10. **Hydration / Water Intake**

**With Objects Allowed:**
```
Show a hydration action: person actively drinking water or filling a glass; natural casual moment.
```

**No Objects Mode:**
```
Show a hydration-focused lifestyle moment without props: post-workout breathing and reset; no bottles or cups.
```

---

### 11. **Smoothie Prep**

**With Objects Allowed:**
```
Show smoothie prep action: blender on counter, ingredients visible, pouring into a glass; hands mid-action.
```

**No Objects Mode:**
```
Show a wellness kitchen moment without props: moving through the kitchen, preparing for a routine; no blender, no food items.
```

---

### 12. **Meal Prep**

**With Objects Allowed:**
```
Show meal prep action: chopping vegetables, assembling bowls, using cutting board; kitchen counter with ingredients in-use (tidy but active).
```

**No Objects Mode:**
```
Show a wellness kitchen routine without props: moving through a tidy kitchen, setting intentions; no food items, no tools.
```

---

### 13. **Nature Walk**

**Always (No Objects mode doesn't change this):**
```
Show an outdoor nature walk action: walking on a trail/park path, casual pace; environment clearly outdoors and green; no handheld items.
```

---

### 14. **Cold Plunge**

**With Objects Allowed:**
```
Show a cold plunge action: stepping into a cold tub, visible cold breath; the action must read as cold immersion.
```

**No Objects Mode:**
```
Show a cold plunge action: stepping into a cold tub, visible cold breath; no props.
```

---

### 15. **Sauna**

**With Objects Allowed:**
```
Show a sauna action: warm wood sauna setting, subtle sweat/steam; relaxing seated posture in a sauna-like environment.
```

**No Objects Mode:**
```
Show a sauna action: warm wood sauna setting, subtle sweat/steam; relaxing seated posture; no props.
```

---

### 16. **Skincare Routine**

**With Objects Allowed:**
```
Show a skincare action: applying a simple routine in front of a bathroom mirror or vanity; hands touching face; action must be clearly skincare.
```

**No Objects Mode:**
```
Show a skincare-style self-care moment without products: gentle face massage at a mirror; no bottles, no jars.
```

---

### 17. **Sleep Wind-Down**

**With Objects Allowed:**
```
Show a sleep wind-down action: dim bedside lamp, reading a book, stretching, or setting an alarm; cozy bedroom mood.
```

**No Objects Mode:**
```
Show a sleep wind-down action: dim bedside lamp, gentle stretching; no books/devices visible.
```

---

## 🔧 ADDITIONAL RITUAL MODE INJECTIONS

### Base Ritual Prompt (Always Injected)

```typescript
'RITUAL MODE: Lifestyle ritual scene.',
`Depict a wellness ritual such as ${ritualList}.`,
actionCopy,  // ← One or more of the prompts above
coupleRitualCopy,  // If couple mode
coupleStagingCopy,  // If couple mode
postureCopy,  // If posture selected
```

### Constraint Injections

**Always:**
```
Ritual must respect selected facial expression and eye direction settings.
```

**If `ritualNoObjects = true`:**
```
CRITICAL: No props or objects in frame. No handheld items. No food, drinks, bottles, cups, books, phones, tools, equipment, candles, plants, appliances, or accessories.
Only people and the environment/architecture. Empty hands.
```

**If Hero Canvas Active:**
```
HERO CANVAS CONTEXT: neutral seamless background only (no location cues, no rooms, no paths, no outdoors, no buildings).
Subjects must be integrated onto a solid hero background with grounded shadows. No environment/storytelling elements.
```

**If `ritualHideProduct = true`:**
```
CRITICAL: No product visible anywhere in frame (no packaging, no bottles, no labels).
```

---

## 👥 COUPLE MODE INJECTIONS

**If Couple:**
```
COUPLE RITUAL: Both subjects must be actively performing the ritual.
They should be coordinated and similar (same ritual theme), but not identical: vary micro-poses, timing, gaze, or hand placement so it feels natural and not mirrored.
Both actions must be readable in-frame at the same time.
```

**Couple Staging Options:**
- `'Together (side-by-side)'`: "Together side-by-side, both clearly visible."
- `'Together (one behind the other)'`: "Together with one person slightly behind the other (stacked depth), both clearly visible."
- `'Facing each other'`: "Facing each other, interacting naturally while performing the ritual."
- `'Separated (different areas)'`: "Separated within the same environment (different areas), both performing the ritual simultaneously; keep both clearly visible."

---

## 🧍 POSTURE INJECTIONS

**If posture selected (not 'Auto'):**

**Single Person:**
```
POSTURE: Subject is ${posture.toLowerCase()}.
```

**Couple:**
```
POSTURE: Both subjects are ${posture.toLowerCase()} (coordinated, not mirrored).
```

---

## 📝 FALLBACK PROMPT (No Activities Selected)

If user doesn't select any ritual activities:
```
RITUAL ACTION (must be clearly visible): Show a clear, recognizable wellness/lifestyle action with appropriate props and body posture (avoid generic standing portraits).
```

With ritualList defaulting to:
```
meditation, yoga, breathwork, or a wellness routine
```

---

## 🔍 CODE LOCATION

**File:** `src/lib/promptEngine/builders/canonicalScene.ts`

**Function:** `buildRitualMode(options: PromptOptions): string`

**Lines:** 193-363

---

## ⚠️ CURRENT ISSUES

1. **Multi-select enabled** but only ONE activity should be selected at a time
2. **UI says "Pick one or more"** - should say "Pick one"
3. Multiple activities create conflicting prompts (e.g., "Show meditation posture" + "Show yoga pose")

---

## ✅ RECOMMENDED FIX

Change UI to **single-select** (radio buttons or single-value ChipSelectGroup) because:
- Each activity has a specific posture/action prompt
- Multiple activities create contradictory instructions
- Model can't perform "meditation + yoga + running" simultaneously
