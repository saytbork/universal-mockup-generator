# Wine Expansion: Plan de Implementación Práctico

**Objetivo**: Expandir variedad de wine de 192 a 1,500+ combinaciones en 2-3 semanas  
**Enfoque**: Quick wins primero, sin refactoring arquitectónico

---

## FASE 1: Quick Wins (1-2 semanas)

### ✅ Tarea 1: Exponer 9 Environments en UI

**Archivo a editar**: `src/components/industry-modules/WineModule.tsx`

**Cambio**:
```typescript
// Importar lo que falta
import { WINE_ENVIRONMENT_V4_MAP } from '@/lib/productStudio/winePrestige';

// En el render del panel, después de Lighting Tone, agregar:
<div>
  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">
    Background Context
  </p>
  <div className="flex flex-wrap gap-2">
    {WINE_ENVIRONMENT_V4_LABELS.map((option) => (
      <Chip
        key={option}
        selected={wineEnvironmentVariation === option}
        onClick={() => setWineEnvironmentVariation(option)}
      >
        {option === 'vineyard' ? 'Vineyard' 
         : option === 'dark-cellar' ? 'Dark Cellar'
         : option === 'marble-bar' ? 'Marble Bar'
         : option === 'minimal-gradient' ? 'Minimal Gradient'
         : option === 'black-studio' ? 'Black Studio'
         : option === 'modern-kitchen' ? 'Modern Kitchen'
         : option === 'luxury-dining' ? 'Luxury Dining'
         : option === 'moody-backlight' ? 'Moody Backlight'
         : option === 'sunlit-table' ? 'Sunlit Table'
         : option === 'architectural-shadow' ? 'Architectural Shadow'
         : option}
      </Chip>
    ))}
  </div>
</div>
```

**Archivo a actualizar**: `src/lib/productStudio/store.ts`

```typescript
// Agregar acción para controlar
setWineEnvironmentVariation: (variation: string) => 
  set({ wineEnvironmentVariation: variation }),
```

**Archivo a actualizar**: `src/lib/productStudio/types.ts`

```typescript
// Si no existe, agregar en StudioUIState:
wineEnvironmentVariation?: string;
```

**Impacto**: 
- Combinaciones: 192 → 1,920 (10 photo modes × 9 envs × 4 light × 6 mood × 2 action)
- Tiempo: 1-2 hours
- Complejidad: Baja

---

### ✅ Tarea 2: Wine Type Selector

**Archivo a editar**: `src/components/industry-modules/WineModule.tsx`

**Agregar al inicio del módulo**:
```typescript
// 1. Import types
import type { WineType, WineGlassType } from '@/lib/productStudio/types';

// 2. En el render, agregar sección NEW al inicio:
<div className="mb-4">
  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">
    Wine Type
  </p>
  <div className="flex flex-wrap gap-2">
    {[
      { value: 'red', label: 'Red' },
      { value: 'white', label: 'White' },
      { value: 'rosé', label: 'Rosé' },
      { value: 'sparkling-white', label: 'Sparkling' },
    ].map((opt) => (
      <Chip
        key={opt.value}
        selected={wineType === opt.value}
        onClick={() => {
          setWineType(opt.value as WineType);
          // Auto-suggest glass type
          if (opt.value === 'sparkling-white') {
            setWineGlassType('sparkling-flute');
          }
        }}
      >
        {opt.label}
      </Chip>
    ))}
  </div>
</div>

// 3. Wire back to store
const wineType = state.wineType || 'auto';
const setWineType = (type: WineType) => {
  useProductStudioStore.getState().setWineType?.(type);
};
```

**Actualizar store** (`src/lib/productStudio/store.ts`, ~line 1360):
```typescript
setWineType: (type: WineType) => set({ wineType: type }),
```

**Impacto**:
- UX improvement + type-specific suggestions
- Tiempo: 1.5-2 hours
- Complejidad: Baja

---

### ✅ Tarea 3: Micro-Variations Toggles

**Archivo a editar**: `src/components/industry-modules/WineModule.tsx`

**Agregar nueva sección**:
```typescript
// Import types
import type { WineMicroVariation } from '@/lib/productStudio/types';
import { SwitchToggle } from '@/components/ui/SwitchToggle';

// En render, agregar NUEVA SECCIÓN (collapsible):
<div className="border-t border-amber-200 pt-4 mt-4">
  <button
    type="button"
    onClick={() => setMicroVarsOpen(!microVarsOpen)}
    className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold
                hover:text-amber-700 transition"
  >
    {microVarsOpen ? '▼' : '▶'} Scene Details (Optional)
  </button>

  {microVarsOpen && (
    <div className="mt-4 space-y-4">
      {/* Season Selector */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Season</p>
        <div className="flex flex-wrap gap-2">
          {['none', 'spring', 'summer', 'autumn', 'winter'].map((s) => (
            <Chip
              key={s}
              selected={microVars.season === s}
              onClick={() => setMicroVariations({ ...microVars, season: s as any })}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <SwitchToggle
        label="Dew on Glass"
        checked={microVars.dewOnGlass ?? false}
        onChange={(val) => setMicroVariations({ ...microVars, dewOnGlass: val })}
      />
      
      <SwitchToggle
        label="Floral Props"
        checked={microVars.floralProps ?? false}
        onChange={(val) => setMicroVariations({ ...microVars, floralProps: val })}
      />

      {/* Micro Props Selector */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Props Detail</p>
        <div className="flex flex-wrap gap-2">
          {['none', 'cork-and-corkscrew', 'vine-leaves', 'cheese-board', 'linen-napkin'].map((p) => (
            <Chip
              key={p}
              selected={microVars.microProps === p}
              onClick={() => setMicroVariations({ ...microVars, microProps: p as any })}
            >
              {p === 'cork-and-corkscrew' ? 'Cork & Opener'
               : p === 'vine-leaves' ? 'Vine Leaves'
               : p === 'cheese-board' ? 'Cheese Board'
               : p === 'linen-napkin' ? 'Linen Napkin'
               : 'None'}
            </Chip>
          ))}
        </div>
      </div>

      {/* Atmospheric Haze */}
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Atmosphere</p>
        <div className="flex flex-wrap gap-2">
          {['none', 'subtle', 'moderate'].map((h) => (
            <Chip
              key={h}
              selected={microVars.atmosphericHaze === h}
              onClick={() => setMicroVariations({ ...microVars, atmosphericHaze: h as any })}
            >
              {h.charAt(0).toUpperCase() + h.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      <SwitchToggle
        label="Enhance Background Depth"
        checked={microVars.backgroundDepthBoost ?? false}
        onChange={(val) => setMicroVariations({ ...microVars, backgroundDepthBoost: val })}
      />
    </div>
  )}
</div>
```

**Agregar al component**:
```typescript
const [microVarsOpen, setMicroVarsOpen] = useState(false);
const [microVars, setMicroVariations] = useState<WineMicroVariation>(() => ({
  season: state.microVariations?.season || 'none',
  dewOnGlass: state.microVariations?.dewOnGlass || false,
  atmosphericHaze: state.microVariations?.atmosphericHaze || 'none',
  floralProps: state.microVariations?.floralProps || false,
  microProps: state.microVariations?.microProps || 'none',
  backgroundDepthBoost: state.microVariations?.backgroundDepthBoost || false,
}));

// Wire to store
const storeMicroVars = useProductStudioStore((s) => s.microVariations);
useEffect(() => {
  useProductStudioStore.getState().setMicroVariations(microVars);
}, [microVars]);
```

**Actualizar store** (`src/lib/productStudio/store.ts`):
```typescript
microVariations?: WineMicroVariation;
setMicroVariations: (vars: WineMicroVariation) => 
  set({ microVariations: vars }),
```

**Actualizar types** (`src/lib/productStudio/types.ts`):
```typescript
// En ProductStudioState:
microVariations?: WineMicroVariation;
```

**Impacto**:
- +2-3x visual variety (seasonal context, dew, props, haze)
- Tiempo: 2-3 hours
- Complejidad: Media

---

## FASE 2: Medium Effort (2-3 semanas)

### 📋 Tarea 4: JSON Config Refactor

**Crear archivo**: `src/lib/productStudio/winePresets.json`

```json
{
  "environments": [
    {
      "id": "vineyard",
      "label": "Vineyard Garden",
      "uiLabel": "Vineyard",
      "narrative": "Golden hour vineyard landscape softly out of focus, long vine rows creating natural leading lines toward the horizon, warm backlight grazing the grape leaves, subtle atmospheric haze in the distance, shallow depth of field, natural lens compression, realistic sunlight bloom, slight organic imperfections in foliage, high-end commercial wine photography style."
    },
    {
      "id": "dark-cellar",
      "label": "Oak Barrel Cellar",
      "uiLabel": "Dark Cellar",
      "narrative": "Moody underground wine cellar environment, soft directional side lighting cutting across aged oak barrels, subtle dust particles suspended in the air, deep shadow falloff, textured stone surfaces barely visible in darkness, cinematic low-key lighting, natural color absorption from wood tones, premium editorial wine photography mood."
    },
    // ... resto
  ],
  "lightingTones": [
    {
      "id": "warm-lateral",
      "label": "Warm Lateral",
      "description": "Warm lateral key light from the side. Soft falloff. Controlled glass highlights."
    },
    // ... resto
  ],
  "moods": [
    {
      "id": "none",
      "label": "None",
      "description": "Plain treatment, no special mood modifier."
    },
    // ... resto
  ],
  "archetypes": [
    {
      "id": "minimal-studio",
      "label": "Minimal Editorial Studio",
      "contextPreset": "Dark Luxury Studio",
      "wineLightingTone": "Warm Lateral",
      "wineMoodModifier": "None",
      "narrative": "Premium beige seamless background, soft lateral lighting with high-key but controlled exposure, clean pedestal or cube surface, warm editorial grading, eye-level camera, centered composition, medium-tight framing. Commercial wine photography — restrained, elegant, precision-focused."
    },
    // ... resto
  ]
}
```

**Crear loader**: `src/lib/productStudio/winePresetsLoader.ts`

```typescript
import presets from './winePresets.json';

// Load at runtime
export const WINE_ENVIRONMENTS = presets.environments;
export const WINE_LIGHTING_TONES = presets.lightingTones;
export const WINE_MOODS = presets.moods;
export const WINE_ARCHETYPES = presets.archetypes;

// Validators
export function validateWinePresets() {
  // Check all IDs are unique
  // Check all references exist
  // Check narratives are non-empty
}
```

**Actualizar winePrestige.ts**:
```typescript
// Lazy import instead of hardcoding
import { WINE_ENVIRONMENTS, WINE_LIGHTING_TONES, WINE_MOODS, WINE_ARCHETYPES } from './winePresetsLoader';

export const WINE_ENVIRONMENT_PRESETS = WINE_ENVIRONMENTS.map(e => e.label);
// etc.
```

**Beneficios**:
- No más recompile para agregar opciones
- Validation at load time
- Fácil agregar nuevas opciones

**Tiempo**: 3-4 hours
**Complejidad**: Media

---

### 📋 Tarea 5: Wine Family System

**Crear**: `src/lib/productStudio/wineFamilies.ts`

```typescript
export interface WineFamilyConfig {
  id: string;
  label: string;
  glassType: 'red-bowl' | 'white-stem' | 'sparkling-flute';
  suggestedEnvironments: string[];
  suggestedLighting: string[];
  preferredMoodModifiers: string[];
  description: string;
}

export const WINE_FAMILIES: Record<string, WineFamilyConfig> = {
  red: {
    id: 'red',
    label: 'Red Wine',
    glassType: 'red-bowl',
    suggestedEnvironments: ['dark-cellar', 'oak-barrel', 'luxury-dining'],
    suggestedLighting: ['Warm Lateral', 'Cellar Dramatic'],
    preferredMoodModifiers: ['Terroir Mood Tone', 'Vintage Film Grain'],
    description: 'Deep, aged character with structured tannins and ruby hues.',
  },
  white: {
    id: 'white',
    label: 'White Wine',
    glassType: 'white-stem',
    suggestedEnvironments: ['marble-bar', 'sunlit-table', 'fine-dining'],
    suggestedLighting: ['Golden Ambient', 'Warm Lateral'],
    preferredMoodModifiers: ['Terroir Mood Tone', 'Elegant Reflection Layer'],
    description: 'Bright, crisp character with floral or citrus notes.',
  },
  rose: {
    id: 'rose',
    label: 'Rosé Wine',
    glassType: 'white-stem',
    suggestedEnvironments: ['sunlit-table', 'minimal-gradient', 'marble-bar'],
    suggestedLighting: ['Golden Ambient', 'Warm Lateral'],
    preferredMoodModifiers: ['Terroir Mood Tone'],
    description: 'Delicate, fruity character with pale pink to coral hues.',
  },
  sparkling: {
    id: 'sparkling',
    label: 'Sparkling Wine',
    glassType: 'sparkling-flute',
    suggestedEnvironments: ['minimal-gradient', 'dark-cellar'],
    suggestedLighting: ['Golden Ambient', 'Candle Intimate'],
    preferredMoodModifiers: ['Elegant Reflection Layer'],
    description: 'Effervescent, celebratory character with fine bubbles.',
  },
  dessert: {
    id: 'dessert',
    label: 'Dessert Wine',
    glassType: 'red-bowl',
    suggestedEnvironments: ['dark-cellar', 'fine-dining', 'luxury-dining'],
    suggestedLighting: ['Candle Intimate', 'Warm Lateral'],
    preferredMoodModifiers: ['Deep Burgundy Contrast Boost'],
    description: 'Sweet, rich character with concentrated flavors.',
  },
};

export function getWineFamilyRecommendations(family: string) {
  return WINE_FAMILIES[family] || WINE_FAMILIES.red;
}
```

**Usar en WineModule.tsx**:
```typescript
// Cuando user selecciona wine type:
const family = getWineFamilyRecommendations(wineType);

// Sugerir glass type automático
if (!wineGlassType || wineGlassType === 'auto') {
  setWineGlassType(family.glassType);
}

// Mostrar recomendaciones:
<div className="bg-blue-50 border border-blue-200 p-3 rounded mt-2">
  <p className="text-xs font-semibold text-blue-900 mb-2">Recommended for {family.label}:</p>
  <ul className="text-xs text-blue-800 space-y-1">
    <li>Environments: {family.suggestedEnvironments.join(', ')}</li>
    <li>Lighting: {family.suggestedLighting.join(', ')}</li>
    <li>Mood: {family.preferredMoodModifiers.join(', ')}</li>
  </ul>
</div>
```

**Tiempo**: 2-3 hours
**Complejidad**: Baja

---

## FASE 3: Optional Enhancements (Nach demimplementieren Fases 1-2)

### 📋 Tarea 6: Expose Lighting Rigs (if needed)

**En winePrestige.ts**, verificar rigs disponibles:
```typescript
export const WINE_LIGHTING_RIGS: Record<string, LightingRig> = {
  'natural-luxury': { ... },
  'architectural-winery': { ... },
  'sculptural-studio-luxury': { ... },
  'candlelight-intimate': { ... },
  'restaurant-ambient': { ... },
};
```

**Si alguno está subutilizado**, considerar exponer en UI similar a Environments.

**Tiempo**: 1-2 hours si se implementa

---

## CRONOGRAMA DE IMPLEMENTACIÓN

### Semana 1
- **Día 1-2**: Tarea 1 (Exponer 9 Environments) ✅
- **Día 2-3**: Tarea 2 (Wine Type Selector) ✅
- **Día 4-5**: Tarea 3 (Micro-Variations Toggles) ✅
- **Día 5+**: Testing & QA

### Semana 2-3
- **Día 1-2**: Tarea 4 (JSON Config Refactor) 🔵
- **Día 3-4**: Tarea 5 (Wine Family System) 🔵
- **Día 5**: Polish & Documentation

---

## TESTING CHECKLIST

### Post-Implementación de Fase 1
- [ ] Wine Type selector appears in UI
- [ ] Selecting wine type updates state
- [ ] 9 environments visible in dropdown
- [ ] Selecting environment updates `wineEnvironmentVariation`
- [ ] Micro-variations collapsible section appears
- [ ] Toggles update winePrestigeMode state
- [ ] No console errors

### Post-Implementación de Fase 2
- [ ] winePresets.json loads successfully
- [ ] WINE_ARCHETYPES populated from JSON
- [ ] Wine families dropdown/suggestions appear
- [ ] Selecting family auto-suggests glass type
- [ ] Recommendations display correctly

---

## EXPECTED RESULTS

### Before
```
Photo Modes:     10
Environments:    4
Lighting:        4
Moods:           6
Actions:         2
━━━━━━━━━━━━━━━━━━━━━━━━
Total:           192 combinations
Archetypes:      8 hardcoded
```

### After Phase 1
```
Photo Modes:     10
Environments:    9  ← +125%
Lighting:        4
Moods:           6
Actions:         2
Micro-vars:      4+ ← NEW
━━━━━━━━━━━━━━━━━━━━━━━━
Total:           1,920+ combinations
Archetypes:      8 + wine family suggestions
```

### After Phase 2
```
Same as Phase 1, but:
- No hardcoding requirement
- JSON-loadable configs
- Family-driven recommendations
- Future-proof architecture
```

---

## RECOMENDACIÓN FINAL

**Empezar por Fase 1** (Tareas 1-3):
- Sin cambios arquitectónicos
- 1-2 semanas
- +10x variedad visible
- Fácil de revertir si algo falla

**Luego Fase 2** (Tareas 4-5):
- Refactor basado en learnings
- 1-2 semanas más
- Arquitectura escalable
- Preparación para futuras expansiones

---

**Documento generado**: 2026-03-17
