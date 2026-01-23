# UI → Deterministic Engine Mapping

> **v1.0.0** — Este documento define qué ve el usuario, qué se oculta, y qué se autogenera.

---

## Regla Base

```
UI Input → Filtering → Contract → Engine → Output
         ↑                        ↑
         │                        │
    UI Validation            Hard Fails
    (previene ABORTs)        (si llega acá, fallo UI)
```

**Objetivo:** El usuario NUNCA debería ver un ABORT. La UI debe prevenir todos los estados inválidos.

---

## Scene Type → UI Config

### `studio_packshot`

| Campo | Visible | Default | Editable | Notas |
|-------|---------|---------|----------|-------|
| `productType` | ✅ | - | ✅ Required | |
| `packaging` | ✅ | - | ✅ | |
| `physicalScale` | ✅ | "tabletop" | ✅ | |
| `productContentColor` | ✅ | - | ✅ | |
| `handsAllowed` | ❌ | `false` | ❌ | Bloqueado en UI |
| `quantity` | ❌ | `1` | ❌ | Siempre 1 |
| `arrangement` | ❌ | "centered" | ❌ | Auto |
| `interactionObjects` | ❌ | `[]` | ❌ | No props |
| `environment` | ❌ | `{}` | ❌ | Oculto, no existe |
| `lightingStyle` | ✅ | "soft studio light" | ✅ | Solo estilos studio |
| `creativity.level` | ❌ | `0` | ❌ | SIEMPRE 0 |
| `camera.cameraSystem` | ✅ | "DSLR" | ✅ Basic: DSLR only |
| `ecommerce.enabled` | ❌ | `false` | ❌ | |

---

### `editorial_product`

| Campo | Visible | Default | Editable | Notas |
|-------|---------|---------|----------|-------|
| `productType` | ✅ | - | ✅ Required | |
| `packaging` | ✅ | - | ✅ | |
| `handsAllowed` | ❌ | `false` | ❌ | Bloqueado |
| `quantity` | ✅ | `1` | ✅ | 1-4 permitido |
| `arrangement` | ✅ | "staggered" | ✅ | |
| `interactionObjects` | ✅ | `[]` | ✅ | Pro: hasta 3 |
| `environment` | ✅ | - | ✅ | |
| `lightingStyle` | ✅ | "golden hour" | ✅ | |
| `creativity.level` | ✅ | `5` | ✅ | 0-10 |
| `camera.cameraSystem` | ✅ | "medium format" | ✅ | |

---

### `lifestyle_product`

| Campo | Visible | Default | Editable | Notas |
|-------|---------|---------|----------|-------|
| `productType` | ✅ | - | ✅ Required | |
| `handsAllowed` | ✅ | `true` | ✅ | Toggle visible |
| `quantity` | ❌ | `1` | ❌ | Solo 1 |
| `interactionObjects` | ✅ | `[]` | ✅ | Pro: hasta 5 |
| `environment` | ✅ | Required | ✅ | |
| `lightingStyle` | ✅ | "natural window light" | ✅ | |
| `creativity.level` | ✅ | `4` | ✅ | 0-10 |

---

### `ugc_phone`

| Campo | Visible | Default | Editable | Notas |
|-------|---------|---------|----------|-------|
| `productType` | ✅ | - | ✅ Required | |
| `handsAllowed` | ✅ | `true` | ✅ | |
| `quantity` | ❌ | `1` | ❌ | |
| `interactionObjects` | ❌ | `[]` | ❌ | UGC = sin props |
| `environment` | ✅ | Required | ✅ | Solo real-world |
| `lightingStyle` | ✅ | "natural window light" | ✅ | NO ring light |
| `creativity.level` | ✅ | `2` | ✅ | **MAX 3** |
| `camera.cameraSystem` | ❌ | "smartphone" | ❌ | SIEMPRE smartphone |

---

### `ecommerce_blank_space`

| Campo | Visible | Default | Editable | Notas |
|-------|---------|---------|----------|-------|
| `productType` | ✅ | - | ✅ Required | |
| `handsAllowed` | ❌ | `false` | ❌ | |
| `quantity` | ❌ | `1` | ❌ | |
| `interactionObjects` | ❌ | `[]` | ❌ | |
| `environment` | ❌ | `{}` | ❌ | Oculto |
| `lightingStyle` | ✅ | "even lighting" | ✅ | Solo estilos neutros |
| `creativity.level` | ❌ | `1` | ❌ | **MAX 2, oculto** |
| `ecommerce.enabled` | ❌ | `true` | ❌ | Auto-activo |
| `ecommerce.blankSpacePosition` | ✅ | "left" | ✅ | |
| `ecommerce.overlaySafeArea` | ✅ | `true` | ✅ | |

---

### `bundle_kit`

| Campo | Visible | Default | Editable | Notas |
|-------|---------|---------|----------|-------|
| `productType` | ✅ | - | ✅ Required | |
| `handsAllowed` | ❌ | `false` | ❌ | |
| `quantity` | ✅ | `3` | ✅ | **MIN 2** |
| `arrangement` | ✅ | "grouped" | ✅ | |
| `interactionObjects` | ❌ | `[]` | ❌ | |
| `environment` | ✅ | - | ✅ | |
| `lightingStyle` | ✅ | "natural soft light" | ✅ | |
| `creativity.level` | ✅ | `3` | ✅ | 0-10 |

---

## Basic vs Pro

| Feature | Basic | Pro |
|---------|-------|-----|
| Scene Types | `studio_packshot`, `lifestyle_product` | All 6 |
| `interactionObjects` | 0 | Hasta 5 |
| `creativity.level` | 0-3 | 0-10 |
| `quantity` | 1 | 1-6 |
| Custom lighting | ❌ | ✅ |
| Environment options | Limited | Full |
| `ecommerce` mode | ❌ | ✅ |
| `bundle_kit` | ❌ | ✅ |

---

## UI Pre-Validations (Antes del Motor)

La UI debe bloquear ANTES de enviar al engine:

| Validación | Acción UI |
|------------|-----------|
| `productType` vacío | Botón Generate disabled + tooltip |
| `ugc_phone` + creativity > 3 | Slider limitado a 3 |
| `studio_packshot` + creativity > 0 | Slider oculto o disabled |
| `ecommerce` sin blankSpacePosition | Default auto a "left" |
| `bundle_kit` + quantity < 2 | Slider min = 2 |
| `ugc_phone` + DSLR selected | Opción no disponible |
| `studio_packshot` + environment | Sección no visible |

---

## UX Copy por Estado

### Pre-generation
| Estado | Copy |
|--------|------|
| productType vacío | "Describe your product to continue" |
| Ready | "Generate Image" |

### During generation
| Estado | Copy |
|--------|------|
| Processing | "Creating your image..." |

### Post-generation (si llega ABORT, es bug de UI)
| Estado | Copy |
|--------|------|
| Success | "[Image]" |
| ABORT (no debería pasar) | "Something went wrong. Please try again." |

---

## Flujo de Conversión UI → Contract

```typescript
function buildContractFromUI(uiState: UIState): DeterministicPromptInput {
  const sceneType = uiState.sceneType;
  
  return {
    sceneType,
    productSetup: {
      productType: uiState.productType, // Required
      packaging: uiState.packaging || undefined,
      physicalScale: uiState.physicalScale || 'tabletop',
      productContentColor: uiState.productColor || undefined,
      handsAllowed: isHandsAllowed(sceneType) ? uiState.handsAllowed : false
    },
    compositionRules: {
      quantity: getDefaultQuantity(sceneType, uiState.quantity),
      arrangement: uiState.arrangement || getDefaultArrangement(sceneType),
      interactionObjects: isPropsAllowed(sceneType) ? uiState.props : []
    },
    environment: isEnvironmentAllowed(sceneType)
      ? { macroEnvironment: uiState.environment, microPlace: uiState.place }
      : {},
    lighting: {
      lightingStyle: uiState.lighting || getDefaultLighting(sceneType)
    },
    creativity: {
      level: clampCreativity(sceneType, uiState.creativityLevel)
    },
    camera: {
      cameraSystem: getCameraSystem(sceneType, uiState.camera),
      angle: uiState.angle || 'eye level',
      distance: uiState.distance || 'medium',
      framing: uiState.framing || 'centered'
    },
    ecommerce: sceneType === 'ecommerce_blank_space'
      ? { enabled: true, blankSpacePosition: uiState.blankSpace || 'left' }
      : { enabled: false },
    outputFormat: {
      aspectRatio: uiState.aspectRatio || '1:1'
    }
  };
}
```

---

## Helpers

```typescript
function isHandsAllowed(sceneType: SceneType): boolean {
  return sceneType === 'lifestyle_product' || sceneType === 'ugc_phone';
}

function isEnvironmentAllowed(sceneType: SceneType): boolean {
  return !['studio_packshot', 'ecommerce_blank_space'].includes(sceneType);
}

function clampCreativity(sceneType: SceneType, level: number): number {
  if (sceneType === 'studio_packshot') return 0;
  if (sceneType === 'ecommerce_blank_space') return Math.min(level, 2);
  if (sceneType === 'ugc_phone') return Math.min(level, 3);
  return level;
}

function getCameraSystem(sceneType: SceneType, userChoice: string): string {
  if (sceneType === 'ugc_phone') return 'smartphone';
  return userChoice || 'DSLR';
}

function getDefaultQuantity(sceneType: SceneType, userChoice: number): number {
  if (sceneType === 'bundle_kit') return Math.max(userChoice, 2);
  if (!['bundle_kit', 'editorial_product'].includes(sceneType)) return 1;
  return userChoice;
}
```

---

## Resultado

Con este mapping:
- ✅ Usuario nunca ve opciones inválidas
- ✅ Motor nunca recibe input inválido
- ✅ 0 ABORTs en producción
- ✅ UX percibida como "inteligente"
