# Hero Section Visual Structure

## 📐 Layout Breakdown (Mobile → Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                    HERO SECTION                              │
│                                                              │
│  [✓] Built for ecommerce    [✓] Product & UGC    [✓] Scale │
│                                                              │
│                                                              │
│              Upload one product photo.                       │
│         Generate sell-ready ecommerce                        │
│              visuals instantly.                              │
│                   [HEADLINE - 7xl]                           │
│                                                              │
│                                                              │
│      Turn a single product image into AI-generated          │
│    studio and lifestyle photos in under 60 seconds.         │
│              No prompts. No redesign.                        │
│                 [SUBHEADLINE - 2xl]                          │
│                                                              │
│                                                              │
│           ┌──────────────────────────────────┐              │
│           │  Generate 2 Free Images    →     │              │
│           │     [PRIMARY CTA - LARGE]        │              │
│           └──────────────────────────────────┘              │
│                                                              │
│         No email required · Ready in under 60 seconds       │
│                   [MICROCOPY - small]                        │
│                                                              │
│                See the Before → After                        │
│                [SECONDARY LINK - subtle]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              CAROUSEL SECTION                                │
│                                                              │
│  All visuals below are generated automatically from a        │
│           single product upload.                             │
│              [SUPPORT LINE - small]                          │
│                                                              │
│                  [Real World Results]                        │
│         From product upload to sell-ready visuals            │
│                                                              │
│              [BEFORE/AFTER CAROUSEL]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Hierarchy (Eye Flow)

```
Priority 1 → HEADLINE (largest text)
              ↓
Priority 2 → SUBHEADLINE (secondary size)
              ↓
Priority 3 → PRIMARY CTA (high contrast button)
              ↓
Priority 4 → MICROCOPY (friction reducers)
              ↓
Priority 5 → SECONDARY ACTION (subtle link)
              ↓
Priority 6 → SUPPORT LINE (bridge to proof)
              ↓
Priority 7 → CAROUSEL (social proof)
```

---

## 📊 Sizing Reference

### Desktop (sm: breakpoint and above):
- **Headline:** 4.5rem (72px) - `text-7xl`
- **Subheadline:** 1.5rem (24px) - `text-2xl`
- **CTA Button:** 1.125rem (18px) - `text-lg`
- **Microcopy:** 0.875rem (14px) - `text-sm`
- **Support Line:** 0.875rem (14px) - `text-sm`

### Mobile (below sm: breakpoint):
- **Headline:** 2.25rem (36px) - `text-4xl`
- **Subheadline:** 1.25rem (20px) - `text-xl`
- **CTA Button:** 1.125rem (18px) - `text-lg` (same)
- **Microcopy:** 0.875rem (14px) - `text-sm` (same)
- **Support Line:** 0.875rem (14px) - `text-sm` (same)

---

## 🎯 Click Target Sizes

### Primary CTA Button:
- **Mobile:** Full width × 96px height (px-12 py-6)
- **Desktop:** Auto width × 96px height
- **Padding:** 48px horizontal, 24px vertical
- **Minimum touch target:** ✅ 48×48px (WCAG compliant)

### Secondary Link:
- **Height:** ~48px (px-6 py-3)
- **Interactive area:** Full width of text + padding
- **Underline animation on hover**

---

## 🔤 Typography Scale

```css
Headline:
  font-size: clamp(2.25rem, 8vw, 4.5rem);
  font-weight: 700 (bold);
  line-height: 1.1;
  letter-spacing: -0.025em (tight);

Subheadline:
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 400 (normal);
  line-height: 1.5 (relaxed);
  letter-spacing: normal;

Primary CTA:
  font-size: 1.125rem (18px);
  font-weight: 700 (bold);
  letter-spacing: normal;

Microcopy:
  font-size: 0.875rem (14px);
  font-weight: 500 (medium);
  color: gray-500;
```

---

## 🌈 Color Contrast (Accessibility)

### Light Mode:
- **Headline:** `text-gray-900` on white = 20.7:1 ✅
- **Subheadline:** `text-gray-600` on white = 7.2:1 ✅
- **CTA:** White text on `bg-indigo-600` = 6.8:1 ✅
- **Microcopy:** `text-gray-500` on white = 5.7:1 ✅

### Dark Mode:
- **Headline:** `text-white` on black = 21:1 ✅
- **Subheadline:** `text-gray-400` on black = 9.5:1 ✅
- **CTA:** White text on `bg-indigo-600` = 6.8:1 ✅
- **Microcopy:** `text-gray-400` on black = 9.5:1 ✅

All ratios exceed WCAG AA standards (4.5:1 for body text, 3:1 for large text).

---

## 📱 Responsive Breakpoints

### Mobile First Approach:
```scss
// Base (mobile): < 640px
.hero-headline {
  font-size: 2.25rem; // text-4xl
  padding: 1.5rem;    // px-6
}

// Tablet/Desktop: >= 640px (sm:)
@media (min-width: 640px) {
  .hero-headline {
    font-size: 4.5rem; // sm:text-7xl
    padding: 1.5rem;
  }
  
  .cta-button {
    width: auto; // sm:w-auto (no longer full width)
  }
}
```

---

## 🎬 Animation Timing

```javascript
Headline:
  - delay: 0s
  - duration: 1s
  - effect: fade + scale from 0.95 to 1

Subheadline:
  - delay: 0.3s
  - duration: 1s
  - effect: fade in

CTA Block:
  - delay: 0.5s
  - duration: 0.8s
  - effect: fade + slide up (y: 20 → 0)

Total animation sequence: 1.3 seconds
User can interact during animations (non-blocking)
```

---

## 🧪 A/B Test Variations (Future)

### Version A (Current):
```
Headline: Upload one product photo.
CTA: Generate 2 Free Images
```

### Version B (Test idea):
```
Headline: Upload one product photo.
CTA: Start Free — No Sign Up
Microcopy: Generate 2 images instantly
```

### Version C (Test idea):
```
Headline: Upload one product photo.
CTA: Get 2 Free Product Visuals →
Microcopy: No email · Under 60 sec
```

---

## ✅ Checklist Before Launch

Visual:
- [x] CTA is the most prominent element
- [x] Text hierarchy is clear (headline > sub > CTA > micro)
- [x] Sufficient white space around CTA
- [x] Dark mode colors are accessible
- [x] Support line bridges hero to carousel

Functional:
- [x] CTA links to /app
- [x] Secondary link scrolls to #before-after
- [x] Animations are smooth (60fps)
- [x] Responsive on all screen sizes
- [x] Touch targets are 48×48px minimum

Copy:
- [x] Exact copy from CRO brief used
- [x] No creative variations added
- [x] All friction reducers present
- [x] Speed mentioned 3 times (instantly, 60 sec, 60 sec)
- [x] Value prop is crystal clear

---

**Last Updated:** February 16, 2026
**Status:** ✅ Ready for deployment
