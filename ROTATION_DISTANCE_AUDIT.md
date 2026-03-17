# ROTATION & DISTANCE Selectors - Complete Audit

## 🎯 Ubicación de los Selectores

### 1. ROTATION Selector
**Ruta exacta**: [src/components/step3/Step3Legacy.tsx](src/components/step3/Step3Legacy.tsx#L7311-L7330)
**Líneas**: 7311-7330

```tsx
{([0, 5, 10, 15] as const).map(option => (
  <Chip
    key={option}
    onClick={() => {
      updateValue('productCameraRotation', option);
      productStore.setRotation(option);
      productStore.setCameraUiLabels({ rotation: `${option}°` });
      markSectionTouched('product-camera');
    }}
    selected={values.productCameraRotation === option}
  >
    {option}°
  </Chip>
))}
```

**UI Labels**: `0°, 5°, 10°, 15°`
**State Field Name**: `values.productCameraRotation`

---

### 2. DISTANCE Selector
**Ruta exacta**: [src/components/step3/Step3Legacy.tsx](src/components/step3/Step3Legacy.tsx#L7277-L7306)
**Líneas**: 7277-7306

```tsx
{(['Wide', 'Standard', 'Tight', 'Macro'] as const).map(option => (
  <Chip
    key={option}
    disabled={false}
    onClick={() => {
      updateValue('productCameraDistance', option);
      const distanceMap: Record<string, ProductStudioState['distance']> = {
        Wide: 'wide',
        Standard: 'standard',
        Tight: 'tight',
        Macro: 'macro',
      };
      const mapped = distanceMap[option];
      if (mapped) productStore.setDistance(mapped);
      productStore.setCameraUiLabels({ distance: option });
      markSectionTouched('product-camera');
    }}
    selected={values.productCameraDistance === option}
  >
    {option}
  </Chip>
))}
```

**UI Labels**: `Wide, Standard, Tight, Macro`
**State Field Name**: `values.productCameraDistance`

---

## 🔄 Actualización de Estado - Zustand Store

**Store Location**: [src/lib/productStudio/store.ts](src/lib/productStudio/store.ts)

### setDistance() - Línea 1475
```ts
setDistance: (distance) =>
    set((state) => {
        const next: Partial<ProductStudioState> = { distance };

        // VALIDATION: Si es macro, valida compatibilidad con interacción
        if (isMacroFraming(state, { distance }) && isInteractionIncompatibleWithMacro(state.interaction)) {
            next.interaction = reinterpretMacroInteraction({ ...state, distance });
            next.handsHolding = next.interaction !== 'none';
            Object.assign(next, withInterpretationNote(state, 'distance', INTERPRETATION_MESSAGES.macroInteraction));
        }

        // VALIDATION: Macro + Telephoto no pueden coexistir
        if (distance === 'macro' && isTelephotoCompressionLens(state.lens)) {
            next.lens = '100mm Macro Prime';
            Object.assign(next, withInterpretationNote(state, 'distance', INTERPRETATION_MESSAGES.cameraOverridesFraming));
        }

        return next;
    }),
```

**Características**:
- ✅ Validación de macro + interaction compatibility
- ✅ Override automático de lentes telephoto cuando se selecciona macro
- ✅ Genera interpretation notes para el usuario
- ✅ NO tiene debounce (actualización inmediata)

### setRotation() - Línea 1493
```ts
setRotation: (rotation) => set({ rotation }),
```

**Características**:
- ✅ Actualización directa (sin lógica adicional)
- ✅ NO tiene debounce
- ✅ NO tiene validaciones complejas

---

## 📡 Flujo de onChange/onClick

### ROTATION - Flujo Completo

```
User clicks Chip (0° | 5° | 10° | 15°)
    ↓
onClick handler triggers
    ↓
1. updateValue('productCameraRotation', option)
   └─→ Actualiza form state local (Formik/React.useState)
    ↓
2. productStore.setRotation(option)
   └─→ Zustand store update (DIRECT, no debounce)
    ↓
3. productStore.setCameraUiLabels({ rotation: `${option}°` })
   └─→ Actualiza UI labels display
    ↓
4. markSectionTouched('product-camera')
   └─→ Marca sección como tocada (para validación)
```

### DISTANCE - Flujo Completo

```
User clicks Chip (Wide | Standard | Tight | Macro)
    ↓
onClick handler triggers
    ↓
1. updateValue('productCameraDistance', option)
   └─→ Actualiza form state local (Formik/React.useState)
    ↓
2. const mapped = distanceMap[option]
   └─→ Traduce UI label → state value
        Wide → 'wide'
        Standard → 'standard'
        Tight → 'tight'
        Macro → 'macro'
    ↓
3. if (mapped) productStore.setDistance(mapped)
   └─→ Zustand store update + validación (ver arriba)
    ↓
4. productStore.setCameraUiLabels({ distance: option })
   └─→ Actualiza UI labels display
    ↓
5. markSectionTouched('product-camera')
   └─→ Marca sección como tocada
```

---

## 🚨 PROBLEMAS ENCONTRADOS

### 1. ⚠️ FALTA DEBOUNCE EN VALIDACIONES
**Severidad**: MEDIA

- `updateValue()` se ejecuta en cada click **sin debounce**
- Si el usuario clickea muy rápido múltiples chips, pueden haber race conditions
- Las validaciones en `setDistance()` pueden ejecutarse fuera de orden

**Ubicación del problema**:
- [Step3Legacy.tsx](src/components/step3/Step3Legacy.tsx#L7283) - No hay `useCallback` con dependencias memoizadas

---

### 2. ⚠️ INCONSISTENCIA EN MAPPING DISTANCE
**Severidad**: BAJA

`updateValue()` recibe string "Wide" | "Standard" | "Tight" | "Macro"
Pero `setDistance()` en store espera type `'wide' | 'standard' | 'tight' | 'macro'`

El mapping está hecho a mano en el onClick:
```tsx
const distanceMap: Record<string, ProductStudioState['distance']> = {
  Wide: 'wide',
  Standard: 'standard',
  Tight: 'tight',
  Macro: 'macro',
};
```

**Problema**: Si se agrega un nuevo distance option, hay que actualizar 3 lugares:
1. El mapping en Step3Legacy.tsx
2. La UI labels 
3. El tipo en store.ts

---

### 3. ⚠️ FALTA VALIDACIÓN DE CAMBIOS EN ROTATION
**Severidad**: BAJA-MEDIA

A diferencia de `setDistance()`, `setRotation()` **NO valida** nada:
- No valida de rotación + otros parámetros
- No genera interpretation notes
- PERO: Rotation tiene menos constraints que Distance, así que puede ser intencional

---

### 4. ⚠️ EVENT PROPAGATION - NO ES PROBLEMA
**Severidad**: NINGUNA ✅

Los Chips tienen `onClick` handlers bien aislados:
- No hay event.stopPropagation() pero tampoco hay nesting que lo requiera
- La sección de ROTATION/DISTANCE está en `div.flex.flex-wrap.gap-3`
- No hay parent handlers conflictivos

---

### 5. ⚠️ NO HAY LISTENERS DE onCHANGE - ESTÁ BIEN ✅
**Severidad**: NINGUNA

Se usa `onClick` handlers en lugar de `onChange`. Esto es correcto porque:
- Los Chips son buttons, no inputs
- El onChange estaría en un `<input>` type="radio" o similar
- El onClick es el patrón correcto aquí

---

## 🔍 Estado Management - Síntesis

| Aspecto | ROTATION | DISTANCE | Notas |
|---------|----------|----------|-------|
| **Store Type** | Zustand | Zustand | Ambos usan el mismo store |
| **Débounce** | ❌ NO | ❌ NO | Problemático para updates rápidos |
| **Validación** | ❌ Ninguna | ✅ Sí (macro checks) | Distance es más estricta |
| **UI → State Mapping** | Directo (0 → 0) | Traducción (Wide → wide) | Distance más complejo |
| **Interpretation Notes** | ❌ NO | ✅ SÍ | Distance comunica cambios forzados |
| **Async Updates** | ❌ Sync | ❌ Sync | Ambos son síncronos inmediatos |

---

## 📋 CHECKLIST DE ESTADO

- ✅ Selectores UI encontrados y mapeados
- ✅ Estado management identificado (Zustand)
- ⚠️ Debounce NO implementado - **RIESGO** (race conditions on rapid clicks)
- ⚠️ Distance tiene validaciones, Rotation NO
- ✅ Event propagation: SIN PROBLEMAS
- ✅ onChange listeners: NO REQUERIDOS (uses onClick correctamente)
- ⚠️ Mapping Distance: múltiples lugares donde se mantiene la lógica

---

## 🎬 Puntos Clave para Debugging

Si hay issues con ROTATION/DISTANCE:

1. **No se actualiza el valor**: Revisar `markSectionTouched()` - puede estar fallando
2. **Updates lentos/desfasados**: Debería ser immediatamente. Revisar si hay race conditions
3. **Validación inesperada**: Está en `setDistance()` línea 1475-1491. Check macro constraints.
4. **UI no refleja cambios**: Ver `setCameraUiLabels()` - line 1505 del store
5. **Interpretation notes no aparecen**: Verificar `getInterpretationNote('distance')` render condition

