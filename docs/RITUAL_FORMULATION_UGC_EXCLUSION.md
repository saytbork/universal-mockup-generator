# 🚨 CRÍTICO: Ritual Mode y Formulation Story - Exclusividad Lifestyle

## ⚠️ PROBLEMA IDENTIFICADO

**Ritual Mode** y **Formulation Story** son características **EXCLUSIVAS de Lifestyle** pero no estaban desactivando automáticamente el modo UGC, lo que causaba conflictos.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Función Centralizada: `isUgcModeActive()`

**Archivo:** `/src/lib/promptEngine/types.ts`

```typescript
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

### 2. Integración en Builders

**Archivos modificados:**
- `/src/lib/promptEngine/builders/identity.ts`
- `/src/lib/promptEngine/builders/selfieCapture.ts`

**Antes:**
```typescript
const isUgcMode = 
    contentStyle === 'ugc' || creationIntent === 'ugc' || Boolean(ugcRealModeActive);
```

**Después:**
```typescript
import { isUgcModeActive } from '../types';

const isUgcMode = isUgcModeActive(options);
```

---

## 🎯 COMPORTAMIENTO GARANTIZADO

### Escenario 1: Ritual Mode Activo
```typescript
{
    contentStyle: 'ugc',         // Usuario intenta activar UGC
    ritualModeActive: true,      // Ritual Mode está activo
    // ...
}

// RESULTADO: isUgcMode = false ❌
// Ritual Mode tiene prioridad absoluta
```

### Escenario 2: Formulation Story Activo
```typescript
{
    creationIntent: 'ugc',       // Usuario intenta activar UGC
    formulationStory: {          // Formulation Story está activo
        expertPreset: 'chemist',
        // ...
    },
    // ...
}

// RESULTADO: isUgcMode = false ❌
// Formulation Story tiene prioridad absoluta
```

### Escenario 3: Solo UGC (sin Ritual/Formulation)
```typescript
{
    contentStyle: 'ugc',
    // NO ritualModeActive
    // NO formulationStory
}

// RESULTADO: isUgcMode = true ✅
// UGC funciona normalmente
```

---

## 📋 CHECKLIST DE VALIDACIÓN

### Testing Manual:

- [ ] **Test 1: Ritual Mode override**
  - Activar Ritual Mode
  - Intentar activar UGC
  - Verificar que NO se aplique randomización UGC
  - Verificar que NO se aplique lighting/background casual
  - Verificar que Ritual Mode funcione correctamente

- [ ] **Test 2: Formulation Story override**
  - Activar Formulation Story (cualquier preset)
  - Intentar activar UGC
  - Verificar que NO se aplique randomización UGC
  - Verificar que Formulation Story funcione correctamente

- [ ] **Test 3: UGC puro (sin Ritual/Formulation)**
  - Activar UGC sin Ritual Mode ni Formulation Story
  - Verificar que toda la randomización UGC funcione:
    - ✅ Facial structure random
    - ✅ Camera angles exaggerated
    - ✅ Clothing random
    - ✅ Lighting random (20 opciones)
    - ✅ Background random (25 opciones)

- [ ] **Test 4: Lifestyle sin UGC**
  - Activar Lifestyle mode SIN UGC
  - Activar Ritual Mode o Formulation Story
  - Verificar que funcionen sin interferencia

---

## 🔍 ARCHIVOS AFECTADOS

### Modificados:
1. `/src/lib/promptEngine/types.ts` - Función centralizada `isUgcModeActive()`
2. `/src/lib/promptEngine/builders/identity.ts` - Usa función centralizada
3. `/src/lib/promptEngine/builders/selfieCapture.ts` - Usa función centralizada

### Requieren verificación manual:
- `/src/lib/promptEngine/builders/ugcRealMode.ts` - Verificar integración
- `/src/lib/promptEngine/builders/canonicalScene.ts` - Verificar lógica UGC
- `/src/lib/promptEngine/builders/finalize.ts` - Verificar constraints
- `/src/lib/promptEngine/builders/visualGrammar.ts` - Verificar grammar rules

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **HECHO**: Función centralizada creada
2. ✅ **HECHO**: Identity Builder actualizado
3. ✅ **HECHO**: Selfie Capture Builder actualizado
4. ⏳ **PENDIENTE**: Testing manual con Ritual Mode
5. ⏳ **PENDIENTE**: Testing manual con Formulation Story
6. ⏳ **PENDIENTE**: Actualizar otros builders si es necesario

---

## 💡 NOTAS IMPORTANTES

### ¿Por qué esta exclusividad?

**Ritual Mode** y **Formulation Story** están diseñados para:
- Lifestyle photography profesional
- Ambientes controlados y estéticos
- Iluminación cuidada
- Composición intencional

**UGC Mode** está diseñado para:
- Contenido casual y auténtico
- Iluminación mala/casera
- Ambientes desordenados
- Ángulos awkward

**SON CONCEPTUALMENTE OPUESTOS** y no pueden coexistir sin crear conflictos visuales.

### Jerarquía de Prioridades:
1. **Ritual Mode** (más alta)
2. **Formulation Story** (más alta)
3. **UGC Mode** (baja - se desactiva si 1 o 2 están activos)

---

## 📞 CONTACTO

Si encuentras algún problema con esta integración, revisar:
1. Logs de `isUgcModeActive()` en consola
2. Valores de `options.ritualModeActive` y `options.formulationStory`
3. Prompt final generado para verificar que NO contenga elementos UGC cuando Ritual/Formulation están activos
