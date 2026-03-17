# 🍷 Wine Studio V2: Mapa Rápido de Configuración

**[Ver análisis completo: WINE_EXPANSION_ANALYSIS.md]**

---

## ESTRUCTURA ACTUAL EN 60 SEGUNDOS

### Archivos Principales
```
┌─ src/components/industry-modules/
│  └─ WineModule.tsx                    ← UI Controls (4 selectors)
│
├─ src/lib/productStudio/
│  ├─ winePrestige.ts                  ← Presets (HARDCODED - 8 archetypes)
│  ├─ types.ts                         ← Type definitions
│  ├─ store.ts                         ← State + Actions
│  ├─ industryPresets.ts               ← Defaults
│  └─ photoModeSchema.ts               ← Photo modes (10 wine-specific)
│
└─ src/lib/productStudioV2/
   ├─ builders/buildWineIndustryLayerV2.ts  ← V2 Logic (esconde 9 environments)
   ├─ wineConfigResolver.ts            ← Truth layer
   └─ types/studioTypes.ts             ← V2 types (9 environment variations)
```

### Opciones Disponibles (Hoy)
```
Dimensión              Opciones    Visible?   Seleccionable?
────────────────────────────────────────────────────────────
Photo Modes            10          ✅         ✅ (UI buttons)
Environments           4           ✅         ✅ (UI buttons)
Lighting Tones         4           ✅         ✅ (UI buttons)
Mood Modifiers         6           ✅         ✅ (UI buttons)
Wine Actions           2           ✅         ✅ (UI buttons)
Pour Styles            3           ✅         ✅ (conditional)
Style Archetypes       8           ✅         ❌ (used internally)
─────────────────────────────────────────────────────────
Environments (V2)      9           ✅         ❌ (HIDDEN!)
Mood Profiles          5           ✅         ❌ (auto-chosen)
Composition Modes      6           ✅         ❌ (auto-chosen)
Luxury Tiers           5           ✅         ❌ (auto-chosen)
Lighting Rigs          5 total     ✅         ❌ (1 used)
Wine Types             6           ✅         ❌ (NO UI!)
Micro-Variations       6 dims      ✅         ❌ (NO UI!)
```

---

## HARDCODING MAP

### Dónde Están los Valores Literales

#### 1. Environment Presets (2 lugares)
```typescript
// LUGAR A: winePrestige.ts (UI level)
export const WINE_ENVIRONMENT_PRESETS = [
  'Vineyard Golden Hour',
  'Oak Barrel Cellar',
  'Fine Dining Table',
  'Dark Luxury Studio'
];

// LUGAR B: winePrestige.ts (narratives)
export function getWineEnvironmentNarrative(preset: string): string {
  switch (preset) {
    case 'Vineyard Golden Hour':
      return 'WINE_ENVIRONMENT: Vineyard Golden Hour. ...180 chars...';
    // etc
  }
}

// LUGAR C: buildWineIndustryLayerV2.ts (V2 mapping - 9 options!)
const map = {
  vineyard: 'background context: vineyard rows...',
  'dark-cellar': 'background context: dark cellar...',
  // etc 7 more
};
```

**Problema**: 3 lugares distintos = maintenance hellscape

#### 2. Lighting Tones (2 lugares)
```typescript
// LUGAR A: winePrestige.ts (types)
export const WINE_LIGHTING_TONES = [
  'Warm Lateral',
  'Golden Ambient',
  'Cellar Dramatic',
  'Candle Intimate'
];

// LUGAR B: buildWineIndustryLayerV2.ts / buildLighting()
const toneMap = {
  'Warm Lateral': 'Warm lateral key light from the side...',
  // etc
};
```

#### 3. Mood Modifiers (2 lugares)
```typescript
// LUGAR A: types.ts (union type)
export type WineMoodModifier =
  | 'None'
  | 'Vintage Film Grain'
  | 'Terroir Mood Tone'
  | 'Deep Burgundy Contrast Boost'
  | 'Soft Barrel Ambient Haze'
  | 'Elegant Reflection Layer';

// LUGAR B: winePrestige.ts (array)
export const WINE_MODIFIERS = [
  'None',
  'Vintage Film Grain',
  // etc
];
```

#### 4. Style Archetypes (1 lugar, pero enorme)
```typescript
// winePrestige.ts - Diccionario completo con narratives
const ARCHETYPE_PATCHES: Record<WineStyleArchetype, WineArchetypePatch> = {
  'Minimal Editorial Studio': {
    contextPreset: 'Dark Luxury Studio',
    wineLightingTone: 'Warm Lateral',
    wineMoodModifier: 'None',
    composition: 'centered',
    lightStyle: 'soft',
    negativeSpace: 'subtle',
    _archetypeNarrative: '...200 char manual narrative...'
  },
  // x 7 más
};
```

---

## FLUJO DE GENERACIÓN DE PROMPT

### User en UI hace esto:
```
Click: Environment = "Oak Barrel Cellar"
Click: Lighting Tone = "Golden Ambient"
Click: Mood Modifier = "Terroir Mood Tone"
Click: Action = "static-presentation"
```

### State updates:
```typescript
state = {
  wineAction: 'static-presentation',
  wineLightingTone: 'Golden Ambient',
  wineMoodModifier: 'Terroir Mood Tone',
  contextPreset: 'Oak Barrel Cellar',
}
```

### V2 Pipeline genera (buildWineIndustryLayerV2):
```
→ Resuelve environment variation
→ Inyecta "WINE_MOOD_PROFILE: prestige"
→ Inyecta "WINE_ENVIRONMENT_VARIATION: dark-cellar"
→ Inyecta "WINE_ENVIRONMENT_CONTEXT: background context..."
→ Calls buildLighting() que inyecta "STUDIO_LIGHTING_PROFILE: wine-..."
→ Inyecta descriptions de vidrio, física del líquido
```

### Resultado final en PROMPT:
```
WINE_PHYSICS_PROFILE: enabled.
WINE_LIQUID_PHYSICS: Natural wine translucency...
WINE_MOOD_PROFILE: prestige. Real photographed wine bottle...
WINE_ENVIRONMENT_VARIATION: dark-cellar.
WINE_ENVIRONMENT_CONTEXT: background context: dark cellar with barrel depth...
STUDIO_LIGHTING_PROFILE: wine-prestige.
[+ más instructions específicas por lighting tone]
```

---

## QUICK FIXES (Sin Arquitectura)

### Para Exponer 5/9 Environments Escondidos
```typescript
// En WineModule.tsx, agregar dropdown:
<select onChange={(e) => setWineEnvironmentVariation(e.target.value)}>
  {WINE_ENVIRONMENTS_ALL.map(env => <option>{env}</option>)}
</select>
```

**Impacto**: 4 env → 9 env = +12.5x (en esa dimensión)

### Para Agregar Wine Type Selector
```typescript
// En WineModule.tsx, agregar botones:
{['Red', 'White', 'Rosé', 'Sparkling'].map(type => (
  <button onClick={() => setWineType(type)}>{type}</button>
))}
```

**Impacto**: Type-aware context, auto-glass-selection

### Para Activar Micro-Variations
```typescript
// En WineModule.tsx, agregar checkboxes:
<input type="checkbox" onChange={(e) => 
  setMicroVariations({...micro, dewOnGlass: e.target.checked})
} />
```

**Impacto**: +2-3x visual detail (dew, season, props, haze)

---

## STATE SHAPE (Relevante)

```typescript
interface ProductStudioState {
  // Wine-specific fields (UI-visible)
  wineAction: 'static-presentation' | 'controlled-pour';
  winePourStyle: 'slow-ribbon' | 'mid-flow-elegance' | 'peak-glass-impact';
  wineLightingTone: 'Warm Lateral' | 'Golden Ambient' | 'Cellar Dramatic' | 'Candle Intimate';
  wineMoodModifier: WineMoodModifier; // 6 options
  contextPreset: string; // Maps to environment
  wineType?: 'red' | 'white' | 'rosé' | 'sparkling-white' | 'sparkling-rosé';
  wineGlassType?: 'auto' | 'red-bowl' | 'white-stem' | 'sparkling-flute';
  wineClosureType?: string;
  wineStyle?: string;
  
  // Wine V2 fields (NOT in UI, auto-chosen)
  winePrestigeMode?: boolean;
  wineEnvironmentVariation?: string; // 9 options pero no visible
  wineMoodProfile?: 'prestige' | 'editorial' | 'ecommerce' | 'dark-luxury' | 'modern-minimal';
  wineCompositionMode?: WineCompositionMode; // 6 options
  wineLuxuryTier?: WineLuxuryIntensity; // 5 levels
  
  // Dormidos (NEVER used)
  microVariations?: WineMicroVariation; // Completo tipo definido pero ignored
}
```

---

## COMPARATIVA RÁPIDA

```
              Wine       Coffee     Supplements
────────────────────────────────────────────────
UI Controls   4          8+         0-1 (generic)
Hardcoding    ⭐⭐⭐⭐  ⭐⭐       ⭐ (low)
Granular      ⭐⭐      ⭐⭐⭐⭐   ⭐⭐⭐⭐⭐
Scalable      ⭐         ⭐⭐       ⭐⭐⭐⭐⭐
Photo Modes   10         generic    30+
Combos        192        45K+       highly variable
```

---

## REFERENCIA TODO LO Q SE PUEDE HACER

### [Phase 1: Quick Wins](WINE_EXPANSION_IMPLEMENTATION.md#fase-1-quick-wins-1-2-semanas)
✅ Exponer 9 environments  
✅ Wine type selector  
✅ Micro-variations toggles  
→ **Result**: 192 → 1,920 combinaciones

### [Phase 2: Escalable](WINE_EXPANSION_IMPLEMENTATION.md#fase-2-medium-effort-2-3-semanas)
✅ JSON config refactor  
✅ Wine family system  
→ **Result**: 2,000+ + future-proof

### [Phase 3: Future (Roadmap)](WINE_EXPANSION_ANALYSIS.md#7-recomendaciones-de-expansión)
⏱️ Industry module migration  
⏱️ Wine series (3-7 bottles)  
⏱️ Photo mode sub-options  

---

## 📚 Documentos Relacionados

| Doc | Propósito | Duración |
|-----|-----------|----------|
| [WINE_EXPANSION_EXECUTIVE_SUMMARY.md](WINE_EXPANSION_EXECUTIVE_SUMMARY.md) | High-level overview | 5 min |
| [WINE_EXPANSION_ANALYSIS.md](WINE_EXPANSION_ANALYSIS.md) | Deep dive + comparativas | 20 min |
| [WINE_EXPANSION_IMPLEMENTATION.md](WINE_EXPANSION_IMPLEMENTATION.md) | Paso-a-paso de código | 30 min |
| [docs/WINE_FULL_INVENTORY.md](docs/WINE_FULL_INVENTORY.md) | Inventario técnico ultra-detallado | 40 min |
| **THIS FILE** (Quick Reference) | Mapa visual + lookups | 5-10 min |

---

**Last updated**: 2026-03-17
