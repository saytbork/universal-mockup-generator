# 📊 WINE EXPANSION: RESUMEN EJECUTIVO

**Estado actual**: 192 combinaciones visibles | **Potencial**: 1,500+ (sin refactoring)

---

## 🎯 Hallazgos Principales

### Estructura Actual
```
✅ Photo Modes:        10 wine-specific
✅ Environments:       4 UI (pero 9 disponibles en V2)
✅ Lighting Tones:     4 opciones
✅ Mood Modifiers:     6 opciones
✅ Actions:            2 (+ 3 pour styles)
✅ Style Archetypes:   8 hardcoded
❌ Wine Types:         No UI selector
❌ Micro-Variations:   Dormidas (sin UI)
❌ Lighting Rigs:      5 definidos, 1 usado
```

### El Problema
| Aspecto | Wine | Coffee | Supplements | Status |
|---------|------|--------|-------------|--------|
| Environments en UI | 4/9 | N/A | N/A | ⚠️ 50% hidden |
| Hardcoding | Extremo | Medio | Bajo | ❌ No escalable |
| UI Granularidad | Baja | Alta | N/A | ❌ Too coarse |
| Photo Modes | 10 | Generic | 30+ | ⚠️ Limited |
| Escalabilidad | Mala | Buena | Muy buena | ❌ Manual edits |

---

## 💡 Soluciones (Sin Refactoring Mayor)

### FASE 1: Quick Wins (1-2 semanas) → +10x variedad

#### 1️⃣ Exponer 9 Environments en UI
```
Cambio: Agregar dropdown con 9 opciones en WineModule.tsx
Impacto: 4 → 9 environments = 2,880 nuevas combinaciones
Tiempo: 1 hora
Complejidad: ⭐
```

#### 2️⃣ Wine Type Selector
```
Cambio: Botones Red/White/Rosé/Sparkling en UI
Impacto: Tipo-specific contexto + auto-glass selection
Tiempo: 1.5 horas
Complejidad: ⭐
```

#### 3️⃣ Micro-Variations Toggles
```
Cambio: Checkboxes para Dew/Floral/Props/Season en panel colapsable
Impacto: +2-3x detalle visual (season, dew, props, haze)
Tiempo: 2-3 horas
Complejidad: ⭐⭐
```

**Resultado después Fase 1**: 192 → **1,920+ combinaciones**

---

### FASE 2: Medium Effort (1-2 semanas) → Escalable

#### 4️⃣ JSON Config Refactor
```
Cambio: Mover hardcoded valores a winePresets.json
Benéfico: Agregar opciones SIN recompilación
Inversión: 3-4 horas (one-time)
Complejidad: ⭐⭐
```

#### 5️⃣ Wine Family System
```
Cambio: Red/White/Rosé/Sparkling → sugerencias de ambiente/luz
Benéfico: UX mejorada, domain knowledge estructurado
Tiempo: 2-3 horas
Complejidad: ⭐⭐
```

**Resultado después Fase 2**: Arquitectura futura-proof + 2,000+ combinaciones

---

## 📈 Comparativa: Por Qué Wine Es Menos Flexible

### Número de Hardcodes
```
Wine:         ___________________________  (mucho)
            |5 lugares distintos        |

Coffee:       __________________         (medio)
            |2-3 lugares              |

Supplements:  (dinámico)               (bajo)
            |0 hardcodes              |
```

### Opciones Ocultas (No Visible al Usuario)
```
Wine:
  ❌ 5/9 environments (50% hidden)
  ❌ WineMicroVariation class (complete dormancy)
  ❌ WINE_LIGHTING_RIGS (4/5 unused)
  ❌ Luxury tiers (auto-chosen)
  ❌ Composition modes (auto-chosen)

Coffee:
  ✅ Todo expuesto en UI

Supplements:
  ✅ Dinámico, nada hardcoded
```

### Granularidad de Controles
```
Wine:     [Action] [Pour] [Env] [Light] [Mood]
          ▼        ▼      ▼     ▼      ▼
          Macro controls (5 parámetros)

Coffee:   [Intent] [Surface] [Lighting] [Mood] [Steam] [Beans] [Cup] [Ice] [Splash]
          ▼        ▼         ▼          ▼      ▼      ▼      ▼    ▼    ▼
          Micro controls (9 parámetros)

Supplements: [Dinámico por tipo de producto]
            (No fixed UI}
```

---

## 🔴 Limitaciones Críticas

### #1: Hardcoding de Archetypes
```typescript
// Hoy: Agregar 1 archetype = editar 3 archivos
const ARCHETYPE_PATCHES = {
  'Minimal Editorial Studio': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    _archetypeNarrative: '...180 chars...',  // ← Manual copy-writing
  },
  // + 7 más
};

// Mañana (JSON): Agregar = copiar/pegar en JSON ✅
```

### #2: Separación de Environment en UI vs V2
```
UI Level (4):        Vineyard Golden Hour, Oak Barrel Cellar, Fine Dining Table, Dark Luxury Studio
V2 Expanded (9):     + marble-bar, minimal-gradient, black-studio, modern-kitchen, ...

Problema: Usuario NO SABE que existen 5 más.
Solución: Dropdown con 9 (completamente visible).
```

### #3: Sin Wine Type Differentiation
```
Actual: Todos los wines usa same UI controls
        No hay "Red" → Dark Cellar preferencia
        No hay "Sparkling" → Flute glass automático

Propuesto:
        Red Wine       → Dark Cellar, Cellar Dramatic light sugeridos
        White Wine     → Marble Bar, Golden Ambient sugeridos
        Rosé Wine      → Sunlit Table, elegant props
        Sparkling      → Flute glass forzado, celebratory context
```

### #4: Micro-Variations Completamente Dormidas
```typescript
// Existe pero NOBODY knows about it
export type WineMicroVariation = {
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  dewOnGlass?: boolean;
  atmosphericHaze?: 'none' | 'subtle' | 'moderate';
  floralProps?: boolean;
  microProps?: 'cork-and-corkscrew' | 'vine-leaves' | 'cheese-board' | 'linen-napkin';
  backgroundDepthBoost?: boolean;
};

// Usuario NOT puede hacer: "Quiero autumn + dew + floral props"
```

---

## ✅ Recomendación de Acción

### Inmediato (Hoy)
```
📋 Review WINE_EXPANSION_ANALYSIS.md para contexto completo
📋 Review WINE_EXPANSION_IMPLEMENTATION.md para pasos exactos
```

### Corto Plazo (1-2 semanas)
```
✅ Implementar Fase 1 (Tareas 1-3)
   - Exponer 9 environments
   - Wine type selector
   - Micro-variations toggles
   
   Resultado: 192 → 1,920 combinaciones
   Esfuerzo: ~5 horas
   Complejidad: Baja
```

### Mediano Plazo (Semanas 2-3)
```
✅ Implementar Fase 2 (Tareas 4-5)
   - JSON config refactor
   - Wine family system
   
   Resultado: 2,000+ combinaciones + arquitectura escalable
   Esfuerzo: ~5-6 horas
   Complejidad: Media
```

### Futuro (Roadmap)
```
⏱️ Industry Profile Module Refactor (parity con Coffee/Supplements)
⏱️ Wine Series Capability (3-7 botellas lineups)
⏱️ Photo Mode Sub-Options (fine-grained control)
```

---

## 📍 Archivos Principales

### Análisis Completo
- [WINE_EXPANSION_ANALYSIS.md](WINE_EXPANSION_ANALYSIS.md) ← **LEER PRIMERO**
  - Estructura actual en detalle
  - Comparativa con Coffee/Supplements
  - Puntos débiles explicados
  - Recomendaciones largas

### Plan de Implementación
- [WINE_EXPANSION_IMPLEMENTATION.md](WINE_EXPANSION_IMPLEMENTATION.md)
  - Tareas específicas con código
  - Pasos de implementación exactos
  - Cronograma
  - Testing checklist

### Documentación Existente
- [docs/WINE_FULL_INVENTORY.md](docs/WINE_FULL_INVENTORY.md) — Inventario técnico

### Archivos a Actualizar
```
✏️ src/components/industry-modules/WineModule.tsx        ← UI
✏️ src/lib/productStudio/store.ts                        ← State
✏️ src/lib/productStudio/types.ts                        ← Types
✏️ src/lib/productStudio/winePrestige.ts                 ← Presets (refactor Fase 2)
✏️ src/lib/productStudio/industryPresets.ts              ← Defaults
```

---

## 🎯 Métricas de Éxito

### Post-Fase 1
- ✅ 1,920+ combinaciones visibles
- ✅ Wine type dropdown funcional
- ✅ Micro-variations panel accesible
- ✅ 9 environments en dropdown
- ✅ Zero hardcoding changes needed

### Post-Fase 2
- ✅ 2,000+ combinaciones stable
- ✅ winePresets.json loadable
- ✅ Wine family recommendations visible
- ✅ Fácil agregar nuevas opciones (JSON only)
- ✅ Architecture future-proof

---

## 💬 Preguntas Frecuentes

**P: ¿Esto requiere refactoring mayor?**  
R: No. Fase 1 es puramente UI + state. Sin cambios arquitectónicos.

**P: ¿Cuánto tiempo toma?**  
R: Fase 1 = 5 horas. Fase 2 = 5-6 horas más. Total ~12 horas.

**P: ¿Riesgo de romper código existente?**  
R: Bajo. Todo aditivo. No eliminaremos valores existentes.

**P: ¿Por qué no refactorizar TODO ahora?**  
R: Porque Wine es estable ahora. Fase 1 da +10x variedad "for free". Refactoring se puede hacer después.

**P: ¿Escalable para el futuro?**  
R: Fase 1 = 80/20 (mucho valor, poco esfuerzo). Fase 2 = Future-proof.

---

## 🚀 Next Steps

1. **Leer documentos**: 20 mins (ANALYSIS + IMPLEMENTATION)
2. **Reunión de alineación**: Validar scope (30 mins)
3. **Implementar Fase 1**: 1 sprint (1-2 semanas)
4. **QA + Testing**: 2-3 days
5. **Deploy**: Cuando listo
6. **Implementar Fase 2**: Next sprint (1-2 semanas)

---

**Documento generado**: 2026-03-17  
**Estado**: Listo para implementación  
**Prioridad**: Media (incrementa variedad, no crítico)
