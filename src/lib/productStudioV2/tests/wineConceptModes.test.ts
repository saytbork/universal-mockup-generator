import { describe, expect, it } from 'vitest';
import { toStudioV2State } from '../../productStudio/promptRouter';
import { generateStudioPromptV2 } from '../index';
import type { ProductStudioState, PhotoMode } from '../../productStudio/types';
import { DEFAULT_PRODUCT_STUDIO_STATE } from '../../productStudio/store';

function makeWineState(photoMode: PhotoMode, overrides: Partial<ProductStudioState> = {}): ProductStudioState {
  return {
    ...structuredClone(DEFAULT_PRODUCT_STUDIO_STATE),
    industryProfile: 'wine',
    visualProfile: 'wine',
    photoMode,
    contextPreset: 'Dark Luxury Studio',
    definition: { type: 'custom' } as ProductStudioState['definition'],
    ...overrides,
  } as ProductStudioState;
}

describe('wine concept modes', () => {
  it('keeps bottle + glass composition aligned with served-open wine physics', () => {
    const mapped = toStudioV2State(makeWineState('Bottle + Glass'));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('served');
    expect(mapped.wineBottleFillMode).toBe('just-opened');
    expect(mapped.wineGlassMode).toBe('filled');
    expect(mapped.wineBottleState).toBe('opened-with-cork-nearby');
    expect(prompt).toContain('bottleState=open; serveState=served;');
    expect(prompt).toContain('COMPOSITION: BOTTLE_AND_GLASS. Opened service bottle and filled wine glass.');
    expect(prompt).toContain('PHOTO_MODE: Bottle + Glass.');
    expect(prompt).not.toContain('Sealed bottle and filled wine glass.');
  });

  it('maps bottle + glass pour to controlled pour wine state', () => {
    const mapped = toStudioV2State(makeWineState('Bottle + Glass Pour'));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('pouring');
    expect(mapped.wineBottleFillMode).toBe('partially-served');
    expect(mapped.wineAction).toBe('controlled-pour');
    expect(mapped.wineGlassMode).toBe('filled');
    expect(mapped.wineBottleState).toBe('opened-with-cork-nearby');
    expect(prompt).toContain('serveState=pouring;');
    expect(prompt).toContain('SCENE_STYLE: real wine hospitality photography with controlled pour motion.');
    expect(prompt).toContain('BOTTLE_TILT_PHYSICS:');
    expect(prompt).toContain('LIQUID_STREAM_PHYSICS:');
    expect(prompt).toContain('must not look suspended');
    expect(prompt).toContain('No levitating bottle.');
    expect(prompt).toContain('supported from off-frame or by a cropped hand');
    expect(prompt).toContain('Never emit liquid from below the bottle rim');
  });

  it('preserves just-opened served bottles as near-full service instead of half-empty', () => {
    const mapped = toStudioV2State(
      makeWineState('Bottle + Glass', {
        wineServeMode: 'served',
        wineBottleFillMode: 'just-opened',
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('freshly opened');
    expect(prompt).not.toContain('visibly below retail-full level because wine has been poured into the glass');
  });

  it('renders partially served bottles as clearly reduced instead of near-full', () => {
    const mapped = toStudioV2State(
      makeWineState('Social Table Served', {
        sceneType: 'lifestyle-real',
        wineServeMode: 'served',
        wineBottleFillMode: 'partially-served',
      } as any)
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('reading approximately half full or meaningfully served down');
    expect(prompt).toContain('Do NOT let the bottle read as just-opened or nearly full.');
    expect(prompt).not.toContain('The bottle remains near retail-full level with only a subtle reduction from first service.');
  });

  it('forbids loose closures in sealed bottle-only scenes', () => {
    const mapped = toStudioV2State(makeWineState('Hero Landing Page'));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('CLOSURE_RULE: No detached closure appears anywhere in the scene.');
    expect(prompt).toContain('No spare cork or cap on the table.');
  });

  it('renders lineup comparison as wine-family comparison instead of hero fallback', () => {
    const mapped = toStudioV2State(
      makeWineState('Wine Lineup Comparison', {
        wineServeMode: 'served',
        wineBottleFillMode: 'partially-served',
        wineGlassMode: 'filled',
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('bottle-only');
    expect(prompt).toContain('SCENE_STYLE: real wine lineup photography with clean varietal spacing and brand-family balance.');
    expect(prompt).toContain('PHOTO_MODE: Wine Lineup Comparison.');
    expect(prompt).toContain('NO_GLASS: No wine glass in the scene.');
    expect(prompt).not.toContain('WINE_GLASS:');
    expect(prompt).not.toContain('PHOTO_MODE_SCENE: Clean studio hero composition.');
  });

  it('forces winery scene environment ownership and emits dedicated winery scene guidance', () => {
    const mapped = toStudioV2State(makeWineState('Winery Scene', { contextPreset: 'Dark Luxury Studio' }));
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineEnvironmentVariation).toBe('dark-cellar');
    expect(prompt).toContain('WINE_ENVIRONMENT: dark-cellar.');
    expect(prompt).toContain('PHOTO_MODE: Winery Scene.');
    expect(prompt).toContain('SCENE_STYLE: real wine photography in an authentic cellar or winery environment.');
    expect(prompt).not.toContain('WINE_ENVIRONMENT: black-studio.');
  });

  it('maps explicit wine environment selection from the wine module into the V2 environment variation', () => {
    const mapped = toStudioV2State(
      makeWineState('Hero Landing Page', {
        contextPreset: '',
        wineEnvironment: 'Marble Bar',
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineEnvironment).toBe('Marble Bar');
    expect(mapped.wineEnvironmentVariation).toBe('marble-bar');
    expect(mapped.autoRandomizeWineEnvironment).toBe(false);
    expect(prompt).toContain('WINE_ENVIRONMENT: marble-bar.');
  });

  it('uses explicit sparkling flute guidance when selected for served wine scenes', () => {
    const mapped = toStudioV2State(
      makeWineState('Bottle + Glass Pour', {
        wineType: 'sparkling-white',
        wineGlassType: 'sparkling-flute' as any,
      })
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('a slender sparkling flute');
  });

  it('renders bottle in hand cutout as cropped-hand wine concept', () => {
    const mapped = toStudioV2State(makeWineState('Bottle In Hand Cutout'));
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('SCENE_STYLE: real cutout wine bottle photography with minimal backdrop and natural capture response.');
    expect(prompt).toContain('PHOTO_MODE: Bottle In Hand Cutout.');
    expect(prompt).toContain('Single cropped hand or forearm only.');
    expect(prompt).toContain('No torso.');
  });

  it('maps hosting pour to a wine lifestyle pouring state instead of static served mode', () => {
    const mapped = toStudioV2State(
      makeWineState('Hosting Pour', {
        sceneType: 'lifestyle-real',
      } as any)
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(mapped.wineServeMode).toBe('pouring');
    expect(mapped.wineAction).toBe('controlled-pour');
    expect(prompt).toContain('serveState=pouring;');
    expect(prompt).toContain('PHOTO_MODE: Hosting Pour.');
    expect(prompt).toContain('HUMAN_PRESENCE: Cropped hands, arms, torso fragments, and real service cues are allowed and often necessary.');
    expect(prompt).toContain('No tack-sharp facial features should become the subject.');
    expect(prompt).toContain('The action may lead the image, with the bottle fully visible or partially cropped');
    expect(prompt).toContain('Editorial lifestyle wine composition.');
    expect(prompt).not.toContain('The scene must remain product-first. Any non-product presence must stay incidental, cropped, or background-only, never the subject.');
    expect(prompt).toContain('No floating bottle.');
    expect(prompt).toContain('WINE_ENVIRONMENT_VARIATION: modern-kitchen.');
    expect(prompt).toContain('WINE_MOOD_PROFILE: hospitality-lifestyle.');
    expect(prompt).toContain('ULTRA_REAL_HUMAN_REALISM_LOCK:');
    expect(prompt).toContain('No waxy skin. No plastic skin. No rubber fingers.');
    expect(prompt).toContain('ANATOMY_LOCK: Exactly five fingers per visible hand');
    expect(prompt).toContain('FACE_SECONDARY_REALISM:');
    expect(prompt).not.toContain('WINE_MOOD_PROFILE: ecommerce.');
    expect(prompt).not.toContain('Keep environment secondary to bottle fidelity.');
    expect(prompt).not.toContain('This is the only addition to the scene');
  });

  it('renders outdoor toast as a wine lifestyle social scene rather than a studio fallback', () => {
    const mapped = toStudioV2State(
      makeWineState('Outdoor Toast', {
        sceneType: 'lifestyle-real',
      } as any)
    );
    const prompt = generateStudioPromptV2(mapped);

    expect(prompt).toContain('PHOTO_MODE: Outdoor Toast.');
    expect(prompt).toContain('SCENE_STYLE: real product-lifestyle outdoor wine photography');
    expect(prompt).toContain('The glasses may take the foreground while the bottle sits on the table');
    expect(prompt).toContain('partial seated bodies are allowed and desirable');
    expect(prompt).toContain('Facial features must stay secondary, soft, cropped, or outside focal priority.');
    expect(prompt).toContain('garden hospitality cues');
    expect(prompt).toContain('Editorial lifestyle wine composition.');
    expect(prompt).toContain('BACKGROUND_HUMAN_REALISM:');
    expect(prompt).toContain('HAND_FOCUS_REALISM:');
    expect(prompt).toContain('FACE_SECONDARY_REALISM:');
    expect(prompt).not.toContain('Keep environment secondary to bottle fidelity.');
    expect(prompt).not.toContain('Product-first framing.');
    expect(prompt).toContain('WINE_ENVIRONMENT_VARIATION: sunlit-table.');
    expect(prompt).toContain('raised-toast context');
    expect(prompt).not.toContain('This is the only addition to the scene');
    expect(prompt).not.toContain('PHOTO_MODE_SCENE: Clean studio hero composition.');
  });

  it('keeps served lifestyle table modes contextual instead of collapsing to bottle-plus-one-glass only', () => {
    const socialPrompt = generateStudioPromptV2(
      toStudioV2State(makeWineState('Social Table Served', { sceneType: 'lifestyle-real' } as any))
    );
    const dinnerPrompt = generateStudioPromptV2(
      toStudioV2State(makeWineState('Dinner Pairing', { sceneType: 'lifestyle-real' } as any))
    );
    const picnicPrompt = generateStudioPromptV2(
      toStudioV2State(makeWineState('Picnic Gathering', { sceneType: 'lifestyle-real' } as any))
    );
    const chillPrompt = generateStudioPromptV2(
      toStudioV2State(makeWineState('Celebration Chill', { sceneType: 'lifestyle-real' } as any))
    );

    expect(socialPrompt).toContain('One or more glasses, restrained food cues, and real hospitality context may appear.');
    expect(socialPrompt).toContain('The bottle may be primary, secondary, upright, or naturally resting within the table composition');
    expect(socialPrompt).toContain('The bottle may stand upright or rest naturally within the spread.');
    expect(socialPrompt).toContain('Facial features must never become tack-sharp focal subjects.');
    expect(socialPrompt).toContain('The environment must read as a real photographed place with tactile materials');
    expect(socialPrompt).toContain('Editorial lifestyle wine composition.');
    expect(socialPrompt).not.toContain('Product-first framing.');
    expect(socialPrompt).not.toContain('BOTTLE_ORIENTATION: Bottle stands perfectly upright. No tilt. No lean. No diagonal.');
    expect(socialPrompt).toContain('WINE_ENVIRONMENT_VARIATION: luxury-dining.');
    expect(socialPrompt).not.toContain('This is the only addition to the scene');
    expect(socialPrompt).not.toContain('Keep environment secondary to bottle fidelity.');

    expect(dinnerPrompt).toContain('One or two credible plated-food cues and tactile table materials may appear.');
    expect(dinnerPrompt).toContain('The bottle can stand, rest, or sit slightly secondary within the editorial food-and-table composition.');
    expect(dinnerPrompt).toContain('The bottle can be upright beside the setting, naturally integrated into the table, or slightly secondary');
    expect(dinnerPrompt).toContain('Any facial features must stay out of focus, cropped, or clearly secondary to the bottle and table moment.');
    expect(dinnerPrompt).toContain('Editorial lifestyle wine composition.');
    expect(dinnerPrompt).not.toContain('Product-first framing.');
    expect(dinnerPrompt).toContain('WINE_ENVIRONMENT_VARIATION: luxury-dining.');
    expect(dinnerPrompt).not.toContain('This is the only addition to the scene');
    expect(dinnerPrompt).not.toContain('Keep environment secondary to bottle fidelity.');

    expect(picnicPrompt).toContain('Simple serveware, bread, fruit, board, blanket, or low-table cues may appear.');
    expect(picnicPrompt).toContain('The bottle may be upright on the spread, casually angled on the table, or integrated as one element of the shared picnic scene.');
    expect(picnicPrompt).toContain('The bottle may be upright, casually placed, or resting within the spread rather than isolated as a hero packshot.');
    expect(picnicPrompt).toContain('No tack-sharp portrait facial features.');
    expect(picnicPrompt).toContain('Editorial lifestyle wine composition.');
    expect(picnicPrompt).not.toContain('Product-first framing.');
    expect(picnicPrompt).not.toContain('BOTTLE_ORIENTATION: Bottle stands perfectly upright. No tilt. No lean. No diagonal.');
    expect(picnicPrompt).toContain('WINE_ENVIRONMENT_VARIATION: sunlit-table.');
    expect(picnicPrompt).not.toContain('This is the only addition to the scene');
    expect(picnicPrompt).not.toContain('Keep environment secondary to bottle fidelity.');

    expect(chillPrompt).toContain('Keep the glassware clean and dry-looking, with no visible condensation beads, water puddles, stray ice, or soaked table surfaces.');
    expect(chillPrompt).toContain('The bottle should feel naturally present within the service ritual rather than isolated as a packshot.');
    expect(chillPrompt).toContain('The bottle can be focal or secondary, but should feel naturally embedded in the service ritual.');
    expect(chillPrompt).toContain('Guests must remain secondary, soft, cropped, or outside focal priority rather than portrait subjects.');
    expect(chillPrompt).toContain('Editorial lifestyle wine composition.');
    expect(chillPrompt).not.toContain('Product-first framing.');
    expect(chillPrompt).toContain('WINE_ENVIRONMENT_VARIATION: marble-bar.');
    expect(chillPrompt).not.toContain('This is the only addition to the scene');
    expect(chillPrompt).not.toContain('Keep environment secondary to bottle fidelity.');
    expect(chillPrompt).not.toContain('ice-bucket or cold-table service realism');
    expect(chillPrompt).not.toContain('Restrained cold-service cues such as an ice bucket, chilled sleeve, or cool tabletop service may appear.');
    expect(chillPrompt).not.toContain('tactile condensation rather than synthetic frost glamour');
  });
});
