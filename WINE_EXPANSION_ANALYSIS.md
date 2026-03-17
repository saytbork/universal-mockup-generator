# Análisis Completo: Wine en Studio V2 - Estructura y Estrategia de Expansión

**Relevado en**: branch `preview-v2` | **Commit**: Actual  
**Objetivo**: Entender arquitectura de Wine y proponer estrategia escalable de expansión

---

## 📍 1. CONFIGURACIÓN ACTUAL DE WINE

### Archivos Principales
```
src/components/industry-modules/WineModule.tsx              ← UI Controls
src/lib/productStudio/winePrestige.ts                       ← Presets & Archetypes (HARDCODED)
src/lib/productStudioV2/builders/buildWineIndustryLayerV2.ts ← V2 Layer Logic
src/lib/productStudioV2/wineConfigResolver.ts               ← Truth Layer
src/lib/productStudio/photoModeSchema.ts                    ← Photo Modes
src/lib/productStudioV2/types/studioTypes.ts                ← Types
src/lib/productStudio/store.ts                              ← State (línea 1324)
src/lib/productStudio/industryPresets.ts                    ← Industry Defaults
```

### Estado por Defecto (store.ts)
```typescript
wineAction: 'static-presentation'
winePourStyle: 'mid-flow-elegance'
wineLightingTone: 'Warm Lateral'
wineMoodModifier: 'None'
wineEnvironmentVariation: (random | from contextPreset)
```

---

## 📊 2. ESTRUCTURA COMPLETA - OPCIONES DISPONIBLES

### 2.1 Photo Modes (Wine-Específicos) — 10 Opciones
```
Wine Macro Label           → Label-focused detailed shot
Bottle + Glass             → Product + serving vessel
Bottle + Glass Pour        → Action moment + service
Hands Pouring Wine         → Human interaction shot
Wine Lineup Comparison     → Multi-bottle display
Editorial Bottle Tabletop  → Narrative setting
Bottle In Hand Cutout      → Lifestyle interaction
Rose Tasting Table         → Specific to rosé
Editorial Table            → Generic tabletop context
Winery Scene               → Environmental context
```

### 2.2 Environment Presets

#### UI Level (4 Opciones)
**Ubicación**: `winePrestige.ts` → `WINE_ENVIRONMENT_PRESETS`
```
Vineyard Golden Hour       → Vineyard landscape, golden hour
Oak Barrel Cellar          → Moody cellar with barrels
Fine Dining Table          → Restaurant/dining context
Dark Luxury Studio         → Controlled studio setting
```

#### V2 Expanded (9+ Variaciones)
**Ubicación**: `buildWineIndustryLayerV2.ts` → `buildWineEnvironmentContext()`
```
vineyard              → Vineyard rows, warm distance haze
dark-cellar          → Cellar with barrel depth, aged oak
marble-bar           → Luxury bar backdrop, dark marble
minimal-gradient     → Minimal gradient backdrop, neutral
black-studio         → Black studio void, controlled falloff
modern-kitchen       → Modern kitchen depth, polished counter
luxury-dining        → Fine dining atmosphere, premium table
moody-backlight       → Backlit depth, refined dark plane
sunlit-table         → Sunlit interior, warm wood
architectural-shadow → Architectural geometry, stone/mineral
```

**⚠️ PROBLEMA**: Solo 4 de 9 están expuestas en UI. V2 elige automáticamente otras.

### 2.3 Lighting Tones (4 Opciones)
**Ubicación**: `winePrestige.ts` → `WINE_LIGHTING_TONES`
```
Warm Lateral          → Warm key light from side, soft falloff
Golden Ambient        → Diffused golden light, glowing atmosphere
Cellar Dramatic       → Low-key, deep shadows, theatrical contrast
Candle Intimate       → Warm candlelight, flickering orange-amber
```

### 2.4 Mood Modifiers (6 Opciones)
**Ubicación**: `winePrestige.ts` → `WINE_MODIFIERS`
```
None                              → Plain treatment
Vintage Film Grain                → Aesthetic texture
Terroir Mood Tone                 → Regional/heritage feeling
Deep Burgundy Contrast Boost      → Wine-specific deepening
Soft Barrel Ambient Haze          → Cellar/aging atmosphere
Elegant Reflection Layer          → Glass/surface refinement
```

### 2.5 Wine Actions (2 Base, +3 Pour Styles)
```
static-presentation           → Bottle positioned statically
  
controlled-pour               → Dynamic pour action enabled
  ├→ slow-ribbon             → Elegant, controlled flow
  ├→ mid-flow-elegance       → Natural, mid-speed arc
  └→ peak-glass-impact       → High-energy, dramatic pour
```

### 2.6 Style Archetypes (8 Presets Visuales)
**Ubicación**: `winePrestige.ts` → `ARCHETYPE_PATCHES`

Cada archetype es un patch visual pre-definido:
```
Minimal Editorial Studio       → Beige background, soft lighting, centered
Ultra Minimal Black Luxury     → Deep charcoal, high contrast, architectural
Backlit Premium Studio         → Backlight glow-through, warm gradient
Moody Wood Editorial           → Top-down, dark wood, flat lay, high contrast
Macro Label Branding           → Label-focused, clinical lighting
Action Pour Photography        → Motion-frozen moment, high contrast, drama
Cinematic Vineyard             → Golden hour backdrop, soft cinematic
Warm Tasting Room              → Tasting room depth, warm shelving
```

**Cada archetype define**:
- contextPreset
- wineLightingTone
- wineMoodModifier
- composition
- lightStyle
- negativeSpace
- _archetypeNarrative (injected in prompt)

### 2.7 Mood Profiles (5 Tiers de Lujo)
**Ubicación**: `buildWineIndustryLayerV2.ts` → `buildWineMoodProfile()`
```
prestige              → Default, warm restrained light, strong dominance
editorial             → Neutral-to-warm, medium contrast
ecommerce             → Neutral daylight, clean label, minimal atmosphere
dark-luxury           → Low-key, deep shadows, restrained
modern-minimal        → Clean neutral, refined contrast, low atmosphere
```

### 2.8 Composition Modes (6 Opciones)
**Ubicación**: `types.ts` → `WineCompositionMode`
```
single-hero           → Uno bottle, centered focus
bottle-and-glass      → Product + serving vessel
horizontal-editorial  → Landscape-oriented multi-element
premium-lineup        → Multiple bottles, arranged
gift-celebration      → Festive arrangement
macro-label           → Label extreme close-up
```

### 2.9 Luxury/Intensity Tiers (5 Niveles)
**Ubicación**: `types.ts` → `WineLuxuryIntensity`
```
Editorial             → Basic editorial polish
Premium               → Higher contrast, DOF, prop density
Ultra Premium         → Maximum visual drama
Heritage Luxury       → Vintage/terroir emphasis
Modern Architectural Luxury → Contemporary luxury aesthetic
```

---

## 🧮 3. ANÁLISIS CUANTITATIVO DE VARIEDAD

### Combinaciones Teóricas Máximas
```
Photo Modes                    10
× Environments (UI)             4
× Lighting Tones               4
× Mood Modifiers              6
× Actions                      2
× Pour Styles (if pour)        3
× Style Archetypes             8
× Mood Profiles                5
× Composition Modes            6
× Luxury Tiers                 5
_________________________________________
= 414,720 combinaciones teóricas
```

### Realmente Implementado en UI
```
Photo Modes         10
× Environments       4 (sólo UI, de 9 disponibles)
× Lighting Tones     4
× Mood Modifiers     6
× Actions            2
= 192 combinaciones directamente controlables
```

### Con Pour Styles
```
192 × 1 (static) + (1 × 3 pour styles) = 195 base
```

### Presets Visuales Pre-Configurados
```
8 Archetypes (hard-wired combinations)
4 Archetype × 2 Actions = 16 si Action Pour compatible
```

### Conclusión de Variedad
| Métrica | Valor | Nota |
|---------|-------|------|
| Teórico máximo | 414K | Sin restricciones |
| Realmente disponible | ~195 | User-facing UI |
| Archetypes presets | 8 | Hard-coded |
| Photo modes propios | 10 | Wine-exclusive |
| Ambientes expuestos | 4/9 | **50% no visible** |
| Granularidad controls | Baja | No hay wine-type selector |

---

## 🔄 4. COMPARACIÓN: WINE vs COFFEE vs SUPPLEMENTS

### 4.1 COFFEE (Para contexto comparativo)

**UI Location**: `CoffeePackagingModule.tsx`

**Controles Disponibles**:
- **Packaging Intent**: 6 opciones (pdp-clean, premium-campaign, dark-roast-luxury, modern-minimal, cold-brew-fresh, bundle-hero)
- **Surface Style**: 5 opciones
- **Lighting Tone**: 3+ opciones
- **Mood Modifier**: 7 opciones
- **Action**: 2 opciones (static, controlled-pour)
- **Steam Level**: 3 opciones (none, subtle, visible)
- **Beans Scatter**: 3 opciones
- **Cup Accent**: 3 opciones
- **Espresso Splash**: 2+ opciones
- **Ice Mode**: 2+ opciones

**Total Combinaciones**: 6 × 5 × 3 × 7 × 2 × 3 × 3 × 3 × 2 × 2 = **45,360**

**Características**:
- ✅ Micro-controls muy granulares (beans, ice, steam, splash)
- ✅ Cada parámetro es independiente
- ✅ Escalable agregando nuevas opciones a arrays
- ❌ Todavía tiene hardcoding en arrays

### 4.2 SUPPLEMENTS

**Location**: `src/lib/productStudioV2/industryProfiles/supplements/`

**Controles**:
- **No UI específica de industry** — usa genéricos (color, composition, etc.)
- **30+ Photo Modes** dinamicos basados en `allowedPhotoModes`
- **Comportamiento dinámico** según tipo de producto (capsules, drops, powders, tablets)
- **No presets pre-configurados** — todo es dinámicamente derivado

**Características**:
- ✅ Altamente escalable
- ✅ Sin hardcoding de presets
- ✅ Reglas dinámicas por tipo
- ✅ Fácil agregar nuevas opciones
- ❌ Menos específico visualmente

### 4.3 Comparación Tabla

| Aspecto | Wine | Coffee | Supplements |
|---------|------|--------|-------------|
| **UI Controls** | 4 (ambient, light, mood, action) | 8+ (beans, steam, ice, surface, etc.) | 0 (generic) |
| **Pre-built Presets** | 8 archetypes | 6 intents | 0 (dynamic) |
| **Photo Modes** | 10 wine-specific | Generic | 30+ dynamic |
| **Escalabilidad** | Baja | Media | Alta |
| **Hardcoding** | Extremo | Medio | Bajo |
| **Granularidad** | Macro | Micro | Variable |
| **Facilidad Expansión** | Difícil (5+ files) | Media (2-3 files) | Fácil (1 file) |
| **User Flexibility** | Media | Alta | Muy Alta |

### 4.4 Insight Clave

**Coffee es más flexible que Wine porque**:
1. Cada "micro-control" (beans, steam, ice) es **independiente**
2. Pueden combinarse **libremente** sin conflictos
3. Agregar nueva opción = agregar a array (simple)
4. No hay "arquetipos fijos" que limiten combinations

**Supplements es más escalable que Wine porque**:
1. **No hay UI presets** — todo derivado de reglas
2. **Dinámico por tipo** — diferentes comportamientos para diferentes formatos
3. **Fácil agregar** tipos de producto sin tocar código existente
4. **Arquitectura modular** (industryProfiles/)

---

## 🎯 5. LIMITACIONES Y PUNTOS DÉBILES

### 5.1 HARDCODING EXTREMO

#### A. winePrestige.ts — Valores Literales

```typescript
// 8 Archetypes hardcoded en diccionario
const ARCHETYPE_PATCHES: Record<WineStyleArchetype, WineArchetypePatch> = {
  'Minimal Editorial Studio': {
    contextPreset: 'Dark Luxury Studio',         // ← String literal
    wineLightingTone: 'Warm Lateral',            // ← String literal
    wineMoodModifier: 'None',                    // ← String literal
    _archetypeNarrative: '...',                  // ← Texto de 180 caracteres
  },
  // + 7 más...
};
```

**Problema**: Para agregar uno nuevo:
- Editar type en `types.ts`
- Editar array en `winePrestige.ts`
- Crear narrative string manualmente
- 3 archivos, múltiples toques

#### B. Environment Presets — 2 Lugares Distintos

```typescript
// UI Level (winePrestige.ts)
export const WINE_ENVIRONMENT_PRESETS: WineEnvironmentPreset[] = [
  'Vineyard Golden Hour',
  'Oak Barrel Cellar',
  'Fine Dining Table',
  'Dark Luxury Studio',
];

// Function Mapping (winePrestige.ts)
export function getWineEnvironmentNarrative(preset: string): string {
  switch (preset) {
    case 'Vineyard Golden Hour':
      return 'WINE_ENVIRONMENT: Vineyard Golden Hour. Golden hour...';  // ← Duplication
    case 'Oak Barrel Cellar':
      return 'WINE_ENVIRONMENT: Oak Barrel Cellar. Moody...';           // ← Duplication
    // ...
  }
}

// V2 Mapping (buildWineIndustryLayerV2.ts)
const map: Record<string, string> = {
  vineyard: 'background context: vineyard rows...',   // ← Different format
  'dark-cellar': 'background context: dark cellar...', // ← Different naming
  // ...
};
```

**Problema**: 3 fuentes distintas = 3 lugares para mantener.

#### C. Lighting Tones — Hardcoded Descriptions

```typescript
const toneMap: Record<string, string> = {
  'Warm Lateral': 'Warm lateral key light from the side...',
  'Golden Ambient': 'Diffused golden ambient light...',
  'Cellar Dramatic': 'Dramatic low-key side light...',
  'Candle Intimate': 'Intimate warm candlelight...',
};
```

**Problema**: Agregar tone nuevo = editar array + descripción + posiblemente adjustar lighting rigs.

### 5.2 FALTA DE DIMENSIONES DE VARIEDAD

#### No existe diferencia por Tipo de Vino

```typescript
// Tipos definidos en types.ts:
wineType?: 'auto' | 'white' | 'red' | 'rosé' | 'sparkling-white' | 'sparkling-rosé';
```

**Pero en UI**: No hay selector de wine type en `WineModule.tsx`

**Impacto**: 
- No puedo hacer Red Wine → Dark lighting, Burgundy context
- No puedo hacer Sparkling → Flute glass, celebratory lighting
- No puedo hacer Rosé → Provence cellar, pale pink emphasis

#### No existe diferencia Regional

```typescript
// Podría existir pero NO existe:
// Bordeaux → Châteaux context, classic label, deep reds
// Burgundy → Cellar auction house, pinot focus
// Rioja → Spanish architecture, oaken barrels
// Champagne → Celebratory, flutes, bubble emphasis
// Tuscany → Tuscan villa, terracotta, sunset light
```

#### No existe diferencia por Contexto de Uso

```typescript
// Falta:
// Retail Display  → Bottle on shelf, clean studio
// Wine Bar        → Social setting, glasses, bottles shared
// Wine Store      → Shelving, inventory, educational
// Wine Club       → Curated selection, gift boxes
// Tasting Flight  → 3-5 glasses in line
// Cellar Tour     → Environmental, educational
```

#### Falta diferencia en "Formato de Presentación"

```typescript
// Solo bottle + glass
// Falta:
// - Wine bottle solo (no glass)
// - Multiple bottles (flight)
// - Bottle + food pairing
// - Bottle + bottle opener/accessories
// - Bottle + corkscrews, wine keys
// - Label macro close-up + additional bottles blurred
```

### 5.3 PHOTO MODES LIMITADOS

**Comparativa**:
- **Wine**: 10 photo modes
- **Supplements**: 30+ photo modes  
- **Generic**: 20+ photo modes

**Falta crear**:
- Wine Shelf Display
- Wine Pairing Scene
- Wine Tasting Panel
- Wine Bottle Series
- Wine Label Texture Detail
- Wine Cork & Accessories

### 5.4 V2 FEATURES NO EXPUESTOS EN UI

**buildWineIndustryLayerV2.ts** define:
- 9 environment variations
- 5 mood profiles
- Multiple composition modes
- Luxury intensity tiers

**Pero usuario NUNCA elige explícitamente**:
```typescript
// El usuario NO ve estos controles:
wineEnvironmentVariation: 'marble-bar'    // Auto-chosen
wineMoodProfile: 'dark-luxury'            // Auto-chosen
wineCompositionMode: 'bottle-and-glass'   // Auto-chosen
wineLuxuryTier: 'Premium'                 // Auto-chosen
```

**Resultado**: Usuario tiene MENOS control de lo que técnicamente existe.

### 5.5 Micro-Variations Dormidas

**Existe pero no usado**:
```typescript
export type WineMicroVariation = {
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'none';
  dewOnGlass?: boolean;
  atmosphericHaze?: 'none' | 'subtle' | 'moderate';
  floralProps?: boolean;
  microProps?: 'none' | 'cork-and-corkscrew' | 'vine-leaves' | 'cheese-board' | 'linen-napkin';
  backgroundDepthBoost?: boolean;
};
```

**Pero**: No hay UI para controlar. Usuario no puede elegir "Quiero autumn + dew + vine leaves".

### 5.6 Lighting Rig Limitado

**Actual**: Solo `sculptural-studio-luxury` en use

**Existe pero no se usa**:
```typescript
export const WINE_LIGHTING_RIGS: Record<string, LightingRig> = {
  'natural-luxury': { ... },
  'architectural-winery': { ... },
  'sculptural-studio-luxury': { ... },    // ← Only this used
  // Más definidos pero no utilizados
};
```

**Falta en UI**: Selector de rigo de iluminación.

### 5.7 Restricciones No Documentadas

```typescript
// Para Action Pour Photography, solo compatible si:
function isActionPourCompatible(
  state: Pick<ProductStudioState, 'wineBottleState' | 'wineClosureType'>
): boolean {
  const closure = normalize(state.wineClosureType ?? '');
  if (closure === 'crown-cap') return false;  // ← No floating para sparkling
  if (bottleState === 'sealed') return false; // ← No pour si sellado
  return true;
}
```

**Problema**: Estas lógicas están esparcidas. No hay documentación centralizada de qué archetype es compatible con qué wine type/closure.

---

## 🔧 6. CÓMO AGREGAR NUEVAS OPCIONES ACTUALMENTE

### Agregar Nuevo Environment Preset

**Hoy (3+ steps)**:
1. Editar `src/lib/productStudio/types.ts` — expand `WineEnvironmentPreset` union type
2. Editar `src/lib/productStudio/winePrestige.ts`:
   - Add to `WINE_ENVIRONMENT_PRESETS[]` array
   - Add case en `getWineEnvironmentNarrative()` switch statement
3. Opcionalmente: Actualizar V2 mapping en `buildWineIndustryLayerV2.ts`
4. Opcionalmente: Actualizar UI en `WineModule.tsx`

**Problemas**:
- Strings hardcoded en 2-3 lugares
- Cambio tipado requiere recompile
- No hay validación de consistencia
- Si se olvida un caso → typecheck pasa pero falla en runtime

### Agregar Nuevo Lighting Tone

**Hoy (4+ steps)**:
1. Editar `src/lib/productStudio/types.ts` — expand `WineLightingTone` union
2. Editar `src/lib/productStudio/winePrestige.ts`:
   - Add to `WINE_LIGHTING_TONES[]`
   - Add description en `buildWineLighting()` toneMap
   - Add description en `buildWineLighting()` del builder V2
3. Probablemente agregar a `buildLighting()` en V2
4. Test to verify nuevo tone no breaks existing combinations

**Problemas**:
- Descripción manual de luz = quality inconsistente
- Múltiples lugares para agregar mismo tone
- Si tone no está en toneMap → fallback genérico

### Agregar Nuevo Style Archetype

**Hoy (4 steps)**:
1. Editar `src/lib/productStudio/types.ts` — expand `WineStyleArchetype` union
2. Editar `src/lib/productStudio/winePrestige.ts`:
   - Add to `WINE_STYLE_ARCHETYPES[]`
   - Add full patch in `ARCHETYPE_PATCHES{}` diccionario (must include _archetypeNarrative)
3. Manualmente escribir narrative string (~150-200 chars)
4. Test que patch no conflicta con wine physics

**Problemas**:
- Narrative requiere manual copy-writing
- No hay validación de narrative quality
- Si patch references unknown field → silent failure

### Agregar Nuevo Photo Mode Wine

**Hoy (5+ steps)**:
1. Editar `src/lib/productStudio/types.ts` — expand `PhotoMode` union
2. Editar `src/lib/productStudio/photoModeSchema.ts` — add schema definition
3. Editar photo mode router/resolver
4. Potencialmente actualizar `industryRules.wine.allowedPhotoModes`
5. Add base prompt and sub-options

**Problemas**:
- Muy acoplado con schema system
- Múltiples archivos requieren cambio
- Alta probabilidad de romper compatibility

---

## 💡 7. RECOMENDACIONES DE EXPANSIÓN

### Short Term (1-2 weeks, Low Effort)

#### 7.1 Exponer 9 Environments en UI
**Impact**: +5x variedad visual sin cambios arquitectónicos

**Cambio**:
```typescript
// En WineModule.tsx, agregar selector:
<select value={wineEnvironmentVariation} onChange={setWineEnvironmentVariation}>
  <option value="vineyard">Vineyard Garden</option>
  <option value="dark-cellar">Dark Cellar</option>
  <option value="marble-bar">Marble Bar</option>
  <option value="minimal-gradient">Minimal Gradient</option>
  <option value="black-studio">Black Studio</option>
  <option value="modern-kitchen">Modern Kitchen</option>
  <option value="luxury-dining">Luxury Dining</option>
  <option value="moody-backlight">Moody Backlight</option>
  <option value="sunlit-table">Sunlit Table</option>
</select>
```

**Esfuerzo**: 30 mins
**Variedad**: 10 × 4 × 4 × 6 × 2 × 9 = 6,912 combinaciones (vs 192)

#### 7.2 Agregar Wine Type Selector
**Impact**: Permite diferentes contexts por type

**Cambio**:
```typescript
// Add buttons in WineModule.tsx
const wineTypes = ['Red', 'White', 'Rosé', 'Sparkling'];

// Wire to state:
// If Red → suggest "Oak Barrel Cellar", "Burgundy"
// If White → suggest "Fine Dining", "Light tone"
// If Sparkling → glass type forced to "sparkling-flute"
```

**Esfuerzo**: 1-2 hours
**Benefit**: Type-specific UI context, better UX

#### 7.3 Exponer Micro-Variations Toggles
**Impact**: Fácil acceso a features dormidas

**Cambio**:
```typescript
// Add checkboxes in WineModule.tsx
<Checkbox label="Dew on Glass" checked={microVar.dewOnGlass} onChange={() => ...} />
<Checkbox label="Floral Props" checked={microVar.floralProps} onChange={() => ...} />
<Checkbox label="Cork Details" checked={microVar.microProps === 'cork-and-corkscrew'} onChange={() => ...} />

<select value={microVar.season}>
  <option>No Season Variation</option>
  <option>Spring</option>
  <option>Summer</option>
  <option>Autumn</option>
  <option>Winter</option>
</select>
```

**Esfuerzo**: 1-2 hours
**Benefit**: +2-3x visual variety for same photo mode

### Medium Term (2-4 weeks, Medium Effort)

#### 7.4 Refactor Wine Config to JSON
**Impact**: Elimina hardcoding, hace escalable

**Cambio**: Crear `src/config/wine-presets.json`
```json
{
  "environments": [
    { "id": "vineyard", "label": "Vineyard Golden Hour", "narrative": "..." },
    { "id": "dark-cellar", "label": "Oak Barrel Cellar", "narrative": "..." }
  ],
  "lightingTones": [
    { "id": "warm-lateral", "label": "Warm Lateral", "description": "..." }
  ],
  "moods": [
    { "id": "vintage-film", "label": "Vintage Film Grain", "description": "..." }
  ],
  "archetypes": [
    { 
      "id": "minimal-studio", 
      "label": "Minimal Editorial Studio",
      "patch": { "contextPreset": "...", "wineLightingTone": "..." },
      "narrative": "..."
    }
  ]
}
```

**Benefit**:
- No need TypeScript changes to add option
- Validation at load time
- Can hot-reload in dev

**Esfuerzo**: 4-6 hours

#### 7.5 Create Wine Family System
**Impact**: Estructura +domain knowledge

**Cambio**: Crear categorías
```typescript
type WineFamily = 
  | 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Dessert';

interface WineFamilyConfig {
  family: WineFamily;
  glassType: 'auto' | 'red-bowl' | 'white-stem' | 'sparkling-flute';
  variants: string[];           // Cabernet, Merlot, Pinot Noir, etc.
  preferredEnvironments: string[];
  preferredLighting: string[];
  temperatureProfile: 'cool' | 'neutral' | 'warm';
  tasting_notes: string;
}
```

**Benefit**:
- UI can suggest "If Red, try Oak Barrel"
- Different photo modes per family
- Documented wine knowledge

**Esfuerzo**: 6-8 hours

#### 7.6 Add Lighting Rig Selector (UI-Exposed)
**Impact**: Advanced control + more variety

**Cambio**:
```typescript
// Expose existing rigs in UI
const rigsAvailable = [
  'natural-luxury',
  'architectural-winery',
  'sculptural-studio-luxury',
  'candlelight-intimate',
  'restaurant-ambient',
];
```

**Benefit**: +5x lighting options without code
**Esfuerzo**: 2-3 hours

### Long Term (4-8 weeks, High Effort)

#### 7.7 Migrate to Industry Profile Module Pattern
**Impact**: Parity con supplements/coffee, future-proof

**Cambio**: Refactor como `src/lib/productStudioV2/industryProfiles/wine/`
```typescript
export const wineProfile: IndustryProfileModule = {
  id: 'wine',
  allowedPhotoModes: [...],
  allowedVisualStyles: [...],
  truthLayer: (state) => [...],
  resolveWineCharacteristics: (state) => ({...}),
  compositionRules: () => [...],
  industryProps: () => ({}),
  physicalRules: (state) => [...],
};
```

**Benefit**:
- Centralizes all wine logic
- Easier to add photo modes
- Follows established pattern

**Esfuerzo**: 8-12 hours

#### 7.8 Wine Series Capability
**Impact**: Support multi-bottle compositions

**Cambio**: Struktur
```typescript
type WineSeries = {
  name: string;
  bottles: WineBottleSpec[];  // 3-5 bottles
  arrangement: 'vertical' | 'diagonal' | 'clustered';
  theme: 'vertical-tasting' | 'flight' | 'winery-selection';
};

// Pre-defined series:
// "Sélection Burgundy"  → 3 Pinot Noirs diferentes
// "Tasting Flight"     → 5 wines mismo region
// "Wine Club Box"      → 4 varietal selection
```

**Benefit**: +compositional variety
**Esfuerzo**: 10-15 hours

#### 7.9 Photo Mode Sub-Options for Wine
**Impact**: Fine-grained control per mode

**Uso de schema**:
```typescript
// For "Wine Tasting Panel":
subOptions: [
  { key: 'bottleCount', label: 'Number of Bottles', values: ['3', '5', '7'] },
  { key: 'arrangement', label: 'Arrangement', values: ['line', 'triangle', 'scattered'] },
];

// For "Hands Pouring Wine":
subOptions: [
  { key: 'glassFillPercent', label: 'Glass Fill %', values: ['25%', '50%', '75%'] },
  { key: 'pourHeight', label: 'Pour Height', values: ['low', 'medium', 'high'] },
];
```

**Benefit**: Deep customization per mode
**Esfuerzo**: 6-10 hours

---

## 📈 8. MATRIZ DE IMPACTO vs ESFUERZO

```
                    IMPACTO
         Bajo          Medio          Alto
ESFUERZO
Bajo     •             • Wine Type    • Environments
         •             • Micro-vars   • Toggles
                       
Medio    • Lighting Rig • JSON Config  • Micro-vars
                       • Wine Family
                       
Alto                                  • Industry Module
                                      • Wine Series
                                      • Photo Modes
```

**Quick Wins** (empezar aquí):
1. Exponer 9 environments → 3x variedad
2. Wine type selector → mejor UX
3. Micro-variations toggles → más granular

**Next Phase** (después):
4. JSON config → escalable
5. Wine family system → structured

**Future** (roadmap largo):
6. Industry module migration → parity
7. Wine series → compositions
8. Photo mode sub-options → depth

---

## 🎯 9. COMPARACIÓN FINAL: Por Qué Wine es Menos Flexible

### Wine Hardcoding
```typescript
// Todos estos valores están HARDCODED
const WINE_ENVIRONMENT_PRESETS = ['Vineyard Golden Hour', 'Oak Barrel Cellar', ...];
const WINE_LIGHTING_TONES = ['Warm Lateral', 'Golden Ambient', ...];
const ARCHETYPE_PATCHES = { 'Minimal Editorial Studio': {...}, ... };

// vs COFFEE (más flexible)
const INTENT_OPTIONS = [
  { label: 'PDP Clean', value: 'pdp-clean', mood: '...' },
  ...  // ← Easy to add, just array entry
];

// vs SUPPLEMENTS (más escalable)
```
Supplements usa **industryProfiles pattern** que es completamente dinámico.

### Wine Opciones Sin UI
```typescript
// Existen pero NO están en UI:
wineEnvironmentVariation: 'marble-bar'     // Auto-chosen
wineMoodProfile: 'dark-luxury'             // Auto-chosen
WineMicroVariation                         // Completamente dormido
WINE_LIGHTING_RIGS                         // Multiple, 1 usado

// Usuario tiene acceso a solo ~25% de lo que existe
```

### Wine Archetypes Como Silos
```typescript
// Cada archetype es un silo
'Minimal Editorial Studio' REQUIRES:
  contextPreset: 'Dark Luxury Studio'
  wineLightingTone: 'Warm Lateral'
  wineMoodModifier: 'None'

// No puedo combinar:
// - Minimal Editorial Studio + Candle Intimate (incompatible in archetype)
// - Action Pour + Minimal (no Action Pour archetype exists)
// vs COFFEE, cada parámetro es independiente
```

---

## 📋 RESUMEN EJECUTIVO

### Números Clave
- **Actual**: 4 environments UI × 4 lighting × 6 mood × 2 action = 192 combinaciones
- **Teórico**: 414K (con todos los tiers de lujo + compositions)
- **Efectivo**: ~8 archetypes hardcoded

### Principales Limitaciones
1. **Hardcoding extremo** — cambios requieren editar 3+ archivos
2. **Falta Wine categorización** — No hay Red/White/Rosé UI
3. **Photo modes limitados** — 10 vs 30+ supplements
4. **Features V2 dormidas** — 9 environments pero solo 4 visible
5. **Micro-variations ignoradas** — WineMicroVariation sin UI
6. **Sin escalabilidad** — cada opción nueva = trabajo manual

### Recomendación de Acción
**Corto plazo** (2 semanas):
- ✅ Exponer 9 environments en UI → +5x variedad
- ✅ Agregar wine type selector → mejor UX
- ✅ Toggles para micro-variations → +2-3x detalle

**Resultado esperado**: 192 → **1,500-2,000 combinaciones** con valor visible

**Mediano plazo** (1-2 meses):
- Refactor a JSON config (elimina hardcoding)
- Create wine family system (estructura + domain knowledge)

**Largo plazo** (roadmap):
- Migrate a industry profile module (parity con coffee/supplements)
- Wine series capability (multi-bottle compositions)
- Photo mode sub-options (fine-grained control)

---

## 🔗 Referencias de Código

### Archivos Core
- [winePrestige.ts](src/lib/productStudio/winePrestige.ts) — Presets, archetypes
- [WineModule.tsx](src/components/industry-modules/WineModule.tsx) — UI controls
- [buildWineIndustryLayerV2.ts](src/lib/productStudioV2/builders/buildWineIndustryLayerV2.ts) — V2 logic
- [wineConfigResolver.ts](src/lib/productStudioV2/wineConfigResolver.ts) — Truth layer
- [studioTypes.ts](src/lib/productStudioV2/types/studioTypes.ts) — Type definitions

### Comparativas (Para referencia)
- [CoffeePackagingModule.tsx](src/components/industry-modules/CoffeePackagingModule.tsx) — Coffee UI
- [supplements/profile.ts](src/lib/productStudioV2/industryProfiles/supplements/profile.ts) — Supplements pattern

### Documentación Relacionada
- [WINE_FULL_INVENTORY.md](docs/WINE_FULL_INVENTORY.md) — Inventario detallado

---

**Documento generado**: 2026-03-17  
**Status**: Análisis completado y listo para implementación
