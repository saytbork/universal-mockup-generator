# Wine - Inventario Completo (UI + Pipeline + Prompts + Ambiente + Luz)

Estado relevado en branch `preview-v2`, commit actual `36c0df0`.

## 1) Archivos Wine (fuente principal)

- `src/components/industry-modules/WineModule.tsx`
- `src/components/industry-modules/industryModuleRegistry.ts`
- `src/components/LifestyleStep3.tsx`
- `src/lib/productStudio/winePrestige.ts`
- `src/lib/productStudio/mapSceneToPrompt.ts` (legacy wine-prestige path)
- `src/lib/productStudio/promptRouter.ts` (router + coerción a V2)
- `src/lib/productStudio/store.ts` (estado/actions wine)
- `src/lib/productStudioV2/index.ts` (pipeline V2 y overrides wine)
- `src/lib/productStudioV2/wineConfigResolver.ts` (truth layer determinística)
- `src/lib/productStudioV2/builders/buildWineIndustryLayerV2.ts`
- `src/lib/productStudioV2/builders/buildComposition.ts` (reglas tilt/composición wine)
- `src/lib/productStudioV2/builders/buildModifiers.ts` (modificadores/pour)
- `src/lib/productStudioV2/builders/buildLighting.ts` (modelo de luz wine)
- `src/lib/productStudioV2/types/studioTypes.ts` (tipos wine V2)

## 2) UI Wine (qué se renderiza y qué controla)

### Render y wiring

- Registro de módulo: `industryModuleRegistry.wine = WineModule`.
- Render en Step3: `LifestyleStep3.tsx` bajo `industryProfile === 'wine'`.

### Controles del panel Wine (`WineModule.tsx`)

- `Wine Action`: `static-presentation`, `controlled-pour`
- `Environment Preset`: presets desde `WINE_ENVIRONMENT_PRESETS`
- `Pour Style` (solo si controlled-pour): `slow-ribbon`, `mid-flow-elegance`, `peak-glass-impact`
- `Lighting Tone`: presets desde `WINE_LIGHTING_TONES`
- `Mood Modifier`: presets desde `WINE_MODIFIERS`

### Catálogos (`winePrestige.ts`)

- Presets ambiente:
  - `Vineyard Golden Hour`
  - `Oak Barrel Cellar`
  - `Fine Dining Table`
  - `Dark Luxury Studio`
- Tonos de luz:
  - `Warm Lateral`
  - `Golden Ambient`
  - `Cellar Dramatic`
  - `Candle Intimate`
- Modificadores:
  - `None`
  - `Vintage Film Grain`
  - `Terroir Mood Tone`
  - `Deep Burgundy Contrast Boost`
  - `Soft Barrel Ambient Haze`
  - `Elegant Reflection Layer`

## 3) Estado Wine en store

### Defaults (`DEFAULT_PRODUCT_STUDIO_STATE`)

- `visualProfile: 'default'`
- `wineLightingTone: 'Warm Lateral'`
- `wineMoodModifier: 'None'`
- `wineAction: 'static-presentation'`
- `winePourStyle: 'mid-flow-elegance'`

### Actions relevantes

- `setVisualProfile('wine'|'wine-prestige')` fuerza:
  - `visualProfile: 'wine-prestige'`
  - `visualIntent: 'campaign'`
  - composición centrada -> thirds
  - normaliza `wineAction` y `winePourStyle`
- `setWineAction`, `setWinePourStyle`, `setWineLightingTone`, `setWineMoodModifier`, `setContextPreset`.

## 4) Router Wine -> Studio V2 (`promptRouter.ts`)

### Detección y mapeo

- `resolveIndustryProfile`: `wine-prestige => wine`.
- `toStudioV2State` para wine:
  - `winePrestigeMode: true`
  - `winePrestigeV2Mode: false` (actual)
  - `wineEnvironmentVariation` (mapea `contextPreset` o randomiza)
  - `wineMoodProfile` (prestige/editorial/ecommerce/dark-luxury/modern-minimal)
  - fuerza `wineAction: 'static-presentation'`
  - interaction forzada a `none`
  - productType forzado a `Custom`

### Variaciones de ambiente wine

- `vineyard`
- `dark-cellar`
- `marble-bar`
- `minimal-gradient`
- `black-studio`
- `modern-kitchen`
- `luxury-dining`
- `moody-backlight`
- `sunlit-table`
- `architectural-shadow`

### Sanitización Wine

- Elimina patrones de interacción/dinámica en prompt final wine:
  - `INTERACTION_*`, `HAND_*`, `FRAMING_BIAS`
  - `POUR`, `SPILL`, `FALL`, `DISPENSE`, `GRAVITY`

## 5) Pipeline V2 Wine (`productStudioV2/index.ts`)

Orden principal en rama wine:

1. `buildIntent`
2. `buildWineTruthLayer` (determinístico)
3. `buildCameraOverrides`
4. `buildComposition`
5. `buildMotion`
6. `buildPhysics` (omitido si `winePrestigeMode`)
7. `buildModifiers`
8. `buildWorld` (si no hay wineEnvironment)
9. `buildLighting` (si no hay wineEnvironment)
10. `buildMaterials`
11. guardrails
12. overrides wine world/light (si hay wineEnvironment)

### Tokens world/light hard override actualmente emitidos

Cuando existe `wineEnvironmentVariation`, inyecta:

- `WINE_WORLD_AUTHORITY: absolute.`
- `WINE_ENVIRONMENT_PRESET: <preset>.`
- `WORLD_OVERRIDE_MODE: HARD_REPLACEMENT.`
- `INVALIDATE_PREVIOUS_WORLD_TOKENS: true.`
- `ONLY_USE_WINE_ENVIRONMENT_DESCRIPTION.`
- `WINE_LIGHTING_AUTHORITY: active.`
- `LIGHTING_SOURCE: derived from wine environment preset.`
- `IGNORE_STUDIO_LIGHTING_PROFILE.`
- `IGNORE_PHOTO_MODE_LIGHTING.`
- `FINAL_WORLD_LOCK: Wine environment preset is the only valid background source.`

## 6) Truth Layer determinística Wine (`wineConfigResolver.ts`)

Siempre inyecta:

- `WINE_ENGINE_STATUS: active. deterministic.`
- `WINE_CONFIG_RESOLVED: wineType=...; closureType=...; bottleState=...; glassFillLevel=...; carbonationLevel=...;`
- `WINE_COLOR_LOCK: ...`
- `GEOMETRY_LOCK: Preserve exact bottle proportions...`

Locks condicionales:

- `SERVE_VOLUME_CONSERVATION_LOCK_V3` (open + half)
- `SPARKLING_PHYSICS_LOCK_V3` (sparkling + carbonation != none)
- `CROWN_CAP_REMOVAL_LOCK_V3` (crown-cap + open)
- `WINE_STRUCTURAL_LOCK_V3` (agrega Apply: ... según locks activos)

## 7) Composición Wine (`buildComposition.ts`)

Si `winePrestigeMode`:

- `STUDIO_COMPOSITION_MODEL: wine-premium.`
- `WINE_ACTION: ...`
- `COMPOSITION_OVERRIDE: Product First composition is mandatory.`
- `RULE_OF_THIRDS_DEFAULT: enabled.`
- `NEGATIVE_SPACE_POLICY: elegant breathing room is mandatory.`
- `BOTTLE_TILT_RULE`:
  - static: `0° tilt, perfectly upright`
  - controlled-pour: `gentle tilt in physically valid range`

## 8) Modificadores Wine (`buildModifiers.ts`)

Si `winePrestigeMode`:

- `STUDIO_MODIFIERS: wine-prestige.`
- `WINE_PRESTIGE_MODIFIER: <mood>` (si aplica)
- Si `winePrestigeV2Mode` activo: bloque `WINE_POUR_MODEL` + `POUR_STYLE`

## 9) Luz y ambiente Wine

### A) Legacy wine (`mapSceneToPrompt.ts` + `winePrestige.ts`)

- `getWineEnvironmentNarrative(preset)` devuelve bloques `WINE_ENVIRONMENT: ...`
- `buildWinePrestigeLegacyPrompt` inyecta:
  - `LIGHTING MODEL: <wineLightingTone>. Warm lateral key light...`
  - `LIQUID_RENDERING: ...` (white vs red profile)
  - `WINE_ACTION: ...`
  - `POUR_STYLE: ...` (solo V2 mode legacy)
  - `WINE_POUR_MODEL: ...` (solo V2 mode legacy)

### B) V2 wine (`buildWineIndustryLayerV2.ts` + `buildLighting.ts`)

- `WINE_MOOD_PROFILE: <preset>` (prestige/editorial/ecommerce/dark-luxury/modern-minimal)
- `WINE_LIQUID_PHYSICS: Deep burgundy translucency...`
- `WINE_GLASS_BEHAVIOR: Realistic refraction...`
- `WINE_ENVIRONMENT_VARIATION: ...`
- `WINE_ENVIRONMENT_CONTEXT: ...`
- `buildLighting` para wine retorna `STUDIO_LIGHTING_MODEL: wine-<mood>.`

## 10) Tipos Wine V2 (`studioTypes.ts`)

Campos Wine clave:

- `winePrestigeMode`, `winePrestigeV2Mode`
- `wineContextPreset`, `wineLightingTone`, `wineMoodModifier`, `wineMoodProfile`
- `wineEnvironmentVariation`, `autoRandomizeWineEnvironment`
- `wineAction`, `winePourStyle`

## 11) Tests Wine existentes (cobertura)

- `promptRouter.wineEnforcement.test.ts`:
  - wine fuerza `productType = Custom`.
- `wineTruthLock.test.ts`:
  - verifica truth layer V3 y no-leak a coffee.
- `wineEngineV3.matrix.test.ts`:
  - matriz de locks: volumen/sparkling/crown-cap.
- `wineEnvironmentVariation.test.ts`:
  - randomización de variación + inyección de tokens wine.
- `wineMotionIsolation.test.ts`:
  - motion wine se estabiliza y limpia tokens dinámicos.
- `wineInteractionIsolation.test.ts`:
  - interaction wine en `none`, sin tokens de manos/framing.
- `wineCameraSafety.test.ts`:
  - reglas de cámara según estado (opened/static).
- `studioV2.wineTilt.test.ts`:
  - reglas de `BOTTLE_TILT_RULE`.
- `promptRouter.coffeeWineIsolation.test.ts`:
  - aislamiento fuerte coffee vs wine tokens.

## 12) Resumen ejecutivo

Qué inyecta/ejecuta Wine hoy:

- UI específica de industry module (acción, ambiente, luz, mood, pour style).
- Router que fuerza estado wine seguro/determinista.
- Truth layer V3 con locks estructurales/volumen/sparkling/closure.
- Composición y tilt rules específicos wine.
- Capas de ambiente y luz wine (incluyendo hard world replacement en V2 actual).
- Sanitización para evitar fuga de interacción/motion no deseada.
- Cobertura de tests de aislamiento y consistencia física.
