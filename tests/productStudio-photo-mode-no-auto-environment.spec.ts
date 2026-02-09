import { test, expect } from 'playwright/test';
import { useProductStudioStore, DEFAULT_PRODUCT_STUDIO_STATE } from '../src/lib/productStudio/store';

test.describe('Product Studio Photo Mode environment behavior', () => {
  test.afterEach(() => {
    useProductStudioStore.setState({ ...DEFAULT_PRODUCT_STUDIO_STATE });
  });

  test('environment-style photo modes do not auto-enable environment when Studio is active', () => {
    useProductStudioStore.setState({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      sceneType: 'studio-branding',
      mode: 'studio',
      environmentContext: null,
      photoMode: 'Hero Landing Page',
    });

    useProductStudioStore.getState().setPhotoMode('Sand Palm Shadows');
    const stateAfter = useProductStudioStore.getState();

    expect(stateAfter.sceneType).toBe('studio-branding');
    expect(stateAfter.mode).toBe('studio');
    expect(stateAfter.environmentContext).toBeNull();
  });

  test('environment remains enabled if user had it enabled before changing photo mode', () => {
    useProductStudioStore.setState({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      sceneType: 'lifestyle-real',
      mode: 'lifestyle-real',
      environmentContext: { macro: 'kitchen', micro: 'countertop' },
      photoMode: 'Warm Window Wood',
    });

    useProductStudioStore.getState().setPhotoMode('Wet Rock Ripples');
    const stateAfter = useProductStudioStore.getState();

    expect(stateAfter.sceneType).toBe('lifestyle-real');
    expect(stateAfter.mode).toBe('lifestyle-real');
    expect(stateAfter.environmentContext).not.toBeNull();
    expect(stateAfter.environmentContext?.macro).toBe('kitchen');
  });

  test('setMode(studio) clears stale environment context to avoid unintended lifestyle switching', () => {
    useProductStudioStore.setState({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      sceneType: 'lifestyle-real',
      mode: 'lifestyle-real',
      environmentContext: { macro: 'kitchen', micro: 'countertop' },
      photoMode: 'Warm Window Wood',
    });

    useProductStudioStore.getState().setMode('studio');
    const afterMode = useProductStudioStore.getState();

    expect(afterMode.mode).toBe('studio');
    expect(afterMode.sceneType).toBe('studio-branding');
    expect(afterMode.environmentContext).toBeNull();

    // Changing photo mode after forcing Studio must keep Studio.
    useProductStudioStore.getState().setPhotoMode('Sand Palm Shadows');
    const afterPhotoMode = useProductStudioStore.getState();
    expect(afterPhotoMode.sceneType).toBe('studio-branding');
    expect(afterPhotoMode.mode).toBe('studio');
    expect(afterPhotoMode.environmentContext).toBeNull();
  });

  test('photo mode change does not switch to lifestyle when stale env exists but current mode is studio', () => {
    useProductStudioStore.setState({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      sceneType: 'studio-branding',
      mode: 'studio',
      // Simulate legacy/stale residue.
      environmentContext: { macro: 'kitchen', micro: 'countertop' },
      photoMode: 'Hero Landing Page',
    });

    useProductStudioStore.getState().setPhotoMode('Sand Palm Shadows');
    const stateAfter = useProductStudioStore.getState();

    expect(stateAfter.sceneType).toBe('studio-branding');
    expect(stateAfter.mode).toBe('studio');
  });

  test('setSceneType(lifestyle-real) is ignored when environment context is missing', () => {
    useProductStudioStore.setState({
      ...DEFAULT_PRODUCT_STUDIO_STATE,
      sceneType: 'studio-branding',
      mode: 'studio',
      environmentContext: null,
    });

    useProductStudioStore.getState().setSceneType('lifestyle-real');
    const stateAfter = useProductStudioStore.getState();

    expect(stateAfter.sceneType).toBe('studio-branding');
    expect(stateAfter.mode).toBe('studio');
  });
});
