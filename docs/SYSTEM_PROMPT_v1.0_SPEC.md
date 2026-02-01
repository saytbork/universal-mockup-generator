# SYSTEM PROMPT v1.0 — Specification Snapshot

**Status:** 🔒 FROZEN  
**Lock Date:** 2026-01-31  
**Contract File:** `src/lib/promptEngine/deterministicSystemPrompt.ts`

---

## 12 Sections

| # | Section | Purpose |
|---|---------|---------|
| 01 | Quality Enforcer | Hard foundation for 3D reconstruction, label fidelity |
| 02 | Product Identity | Brand/form locked, no reinterpretation |
| 03 | Product Type | Defines allowed behaviors (capsules, drops, etc.) |
| 04 | Physical Properties | Scale, weight, material rigidity |
| 05 | Product Structure | Single vs bundle, grouping, spacing |
| 06 | Product Placement | Mandatory physics: surface, held, supported, air |
| 07 | Product Interaction | One interaction only, human realism rules |
| 08 | Viewpoint & Vantage | Spatial logic relative to gravity |
| 09 | Photo Mode / Environment | Schema-driven only |
| 10 | Camera & Framing | Optical only, no geometry distortion |
| 11 | Lighting | Physics-based, consistent direction |
| 12 | Final Validation | Hard-fail conditions |

---

## Hard-Fail Checks (hardFails.ts)

| ID | Rule | Trigger |
|----|------|---------|
| 01 | Missing sceneType | `sceneType` undefined |
| 02 | Environment forbidden | Environment in studio mode |
| 03 | Hands forbidden | `handsAllowed=true` in no-hand mode |
| 04 | Lighting contradiction | Lighting incompatible with sceneType |
| 05 | Ecommerce misuse | `ecommerce.enabled` outside ecommerce mode |
| 06 | Creativity violation | Wrong creativity level for sceneType |
| 07 | Missing productType | `productSetup.productType` undefined |
| 08 | Quantity restriction | `quantity > 1` outside bundle modes |
| 09 | Bundle requires multi | `bundle_kit` with `quantity = 1` |
| 10 | UGC camera violation | DSLR/studio camera in `ugc_phone` mode |
| **11** | **PhotoMode × Placement** | PhotoMode requires specific placement (schema-driven) |
| **12** | **ProductType × Interaction** | Forbidden combos (gummies+capsule-display, etc.) |
| **13** | **Placement × Viewpoint** | Full matrix validation |
| **14** | **Viewpoint × Camera** | Full matrix validation |
| **15** | **Placement × Interaction** | Hand interactions require held/supported |

---

## Conflict Matrices (Full Coverage)

### Placement × Viewpoint
| Placement | Allowed Viewpoints |
|-----------|-------------------|
| surface | eye-level, top-down, display-view |
| held | human-pov, eye-level |
| supported | eye-level, top-down, display-view |
| air | suspended, eye-level |

### Viewpoint × Camera
| Viewpoint | Forbidden Camera Angles |
|-----------|------------------------|
| top-down | eye-level, low, front, 45-degree |
| eye-level | top, aerial, top-down |
| human-pov | top, aerial, top-down, low |
| suspended | top-down |

---

## Extension Rules

1. **DO NOT** modify `deterministicSystemPrompt.ts`
2. **DO NOT** add auto-sync or auto-fix logic
3. **DO NOT** add soft warnings that bypass hard-fails
4. Extensions go in `deterministicSystemPrompt.v1.1.ts` (new file)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-31 | v1.0 frozen with 12 sections |
| 2026-01-31 | HF11-14 initial implementation |
| 2026-01-31 | Option B: HF11-14 expanded, HF15 added |
| 2026-01-31 | **ENGINE BLINDADO** - Zero invalid states possible |
