export type GenerationRoutingInput = {
  isProductPlacement: boolean;
  optionsContentStyle?: string;
  optionsSceneIntent?: 'environment' | 'ecommerce';
  step3ContentStyle?: string;
  step3SceneType?: string;
};

export type GenerationRoutingResolution = {
  forceStudioByProductContent: boolean;
  isLifestyleScene: boolean;
  isStudioBrandingScene: boolean;
  isStudioEngine: boolean;
  resolvedSceneIntent: 'environment' | 'ecommerce' | undefined;
  resolvedSceneType: string;
};

export function resolveGenerationRouting({
  isProductPlacement,
  optionsContentStyle,
  optionsSceneIntent,
  step3ContentStyle,
  step3SceneType,
}: GenerationRoutingInput): GenerationRoutingResolution {
  const isLifestyleScene = step3SceneType === 'lifestyle-real';
  const isStudioBrandingScene = step3SceneType === 'studio-branding';
  const forceStudioByProductContent =
    optionsContentStyle === 'product' || step3ContentStyle === 'product';
  const isStudioEngine =
    isStudioBrandingScene ||
    (!isLifestyleScene && (forceStudioByProductContent || isProductPlacement));

  const resolvedSceneType = isStudioEngine
    ? 'studio-branding'
    : step3SceneType && step3SceneType !== 'studio-branding'
      ? step3SceneType
      : 'lifestyle-real';

  const resolvedSceneIntent = isStudioEngine
    ? 'ecommerce'
    : (optionsSceneIntent === 'ecommerce' ? undefined : optionsSceneIntent);

  return {
    forceStudioByProductContent,
    isLifestyleScene,
    isStudioBrandingScene,
    isStudioEngine,
    resolvedSceneIntent,
    resolvedSceneType,
  };
}
