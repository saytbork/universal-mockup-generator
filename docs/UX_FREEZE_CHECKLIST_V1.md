# Product Studio UX v1 — FREEZE CHECKLIST

> **Status: DRAFT → Pending review**

---

## 1. Superficie Visible

### Upload & Product

| Elemento | Status | Notas |
|----------|--------|-------|
| Product image upload | ✅ Exists | |
| Product type input | ✅ Exists | Required field |
| Packaging input | ✅ Exists | Optional |
| Product color input | ✅ Exists | Optional |
| Multiple product upload | ❌ Not exists | v2 |

### Preset Selection

| Elemento | Status | Notas |
|----------|--------|-------|
| Preset selector | ✅ Exists | |
| Preset categories (tabs) | ✅ Exists | Studio, Ecommerce, Social, Editorial, Bundle |
| Preset description | ✅ Exists | |
| Preset tier badge (Basic/Pro) | ✅ Exists | |
| Preset preview thumbnail | ❌ Not exists | v2 |

### Scene Configuration

| Elemento | Status | Notas |
|----------|--------|-------|
| SceneType selector (manual) | ❌ Not exists | Managed by preset |
| Environment selector | 🔒 Blocked | "Managed by preset" — visible only if preset allows |
| Lighting selector | 🔒 Blocked | "Managed by preset" — visible only if preset allows |
| Camera angle selector | 🔒 Blocked | "Managed by preset" unless editable |
| Hands toggle | 🔒 Blocked | Only for lifestyle/UGC presets |
| Props/objects input | 🔒 Blocked | Pro only, lifestyle/editorial only |

### Creativity & Style

| Elemento | Status | Notas |
|----------|--------|-------|
| Creativity slider | 🔒 Blocked | Hidden for studio_packshot, capped per sceneType |
| Theme selector | 🔒 Blocked | Pro only, editorial only |
| Manual prompt input | ❌ Not exists | Never exposed |
| Negative prompt input | ❌ Not exists | Never exposed |

### Batch & Gallery

| Elemento | Status | Notas |
|----------|--------|-------|
| Batch quantity selector | ✅ Exists | Pro only |
| Variation axes selector | ❌ Not exists | Auto from preset |
| Gallery grid | ✅ Exists | |
| Gallery item metadata | ✅ Exists | batchId, index, deltas |
| Download single | ✅ Exists | |
| Download all (zip) | ❌ Not exists | v2 |

### Output

| Elemento | Status | Notas |
|----------|--------|-------|
| Aspect ratio selector | ✅ Exists | |
| Resolution selector | ❌ Not exists | Fixed for v1 |
| Format selector (jpg/png) | ❌ Not exists | v2 |

---

## 2. Estados UX Permitidos

| Estado | Descripción |
|--------|-------------|
| `empty` | No product uploaded, no preset selected |
| `product-ready` | Product uploaded, no preset selected |
| `preset-selected` | Preset chosen, ready to configure |
| `configured` | All required fields filled, ready to generate |
| `generating` | Generation in progress |
| `generated` | Image(s) ready |
| `error` | UX-level error (user-recoverable) |

**Estados NO permitidos en UX:**
- ABORT / Hard fail (UI debe prevenir)
- Engine error (nunca visible)
- Validation error (nunca debe llegar)

> ⚠️ **Regla crítica:** UX error states never surface engine validation details or ABORT terminology. All errors must be user-recoverable with clear, non-technical copy.

---

## 3. Reglas de Bloqueo UX

| Mensaje UI | Cuándo |
|------------|--------|
| "Managed by preset" | Campo controlado por preset seleccionado |
| "Available in Pro" | Feature requiere tier Pro |
| "Not available for this style" | Campo bloqueado por sceneType |
| "Add product to continue" | productType vacío |
| "Select a preset" | No preset seleccionado |

**Nunca mostrar:**
- Errores técnicos
- Referencias al motor ("sceneType", "ABORT")
- Mensajes de validación interna

---

## 4. Flujo Principal v1

```
1. Upload product image
2. Enter product type (required)
3. Select preset
4. (Optional) Adjust preset-allowed settings only
5. (Pro) Select batch quantity
6. Generate
7. View gallery
8. Download
```

---

## 5. Explícitamente FUERA de v1

| Feature | Status |
|---------|--------|
| Provider adapters (Gemini/Claude) | ❌ v2 |
| Monetization / billing UI | ❌ v2 |
| A/B testing | ❌ v2 |
| History / saved sessions | ❌ v2 |
| Team / collaboration | ❌ v2 |
| Custom presets | ❌ v2 |
| API access | ❌ v2 |
| Bulk upload | ❌ v2 |

---

## 6. Tier Matrix v1

| Feature | Basic | Pro |
|---------|-------|-----|
| Presets | 4 | 10 |
| Batch generation | ❌ | ✅ (max per preset) |
| Props/objects | ❌ | ✅ |
| Theme selection | ❌ | ✅ |
| All scene types | ❌ | ✅ |

> ⚠️ **Regla UX:** Basic tier never exposes partially locked controls. If a control is not available, it is not shown — not grayed out, not teased. Pro tier may show locked controls with upgrade prompts.

---

## Sign-off

- [ ] UX reviewed
- [ ] No scope creep
- [ ] No engine references in UI
- [ ] All blocked states have user-friendly copy

**Status:** `DRAFT`
