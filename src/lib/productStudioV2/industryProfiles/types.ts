import type { IndustryProfile, ProductStateMotion, ProductStudioState } from '@/lib/productStudio/types';
import type { StudioUIState } from '../types/studioTypes';

export interface IndustryProfileModule {
  id: IndustryProfile;
  resetState?(): Partial<ProductStudioState>;
  truthLayer(state: StudioUIState): string[];
  physicalRules(state: StudioUIState): string;
  allowedPhotoModes: string[];
  industryProps(state: StudioUIState): Partial<StudioUIState>;
  compositionRules(state: StudioUIState): string[];
  defaultInteraction?: string;
  sanitizePrompt?(prompt: string): string;
  validatePrompt?(prompt: string): void;
  resolveProductState?(state: ProductStudioState, resolvedCoffeeIntent?: string): ProductStateMotion;
  resolvePackagingBehavior?(state: ProductStudioState, stateMotion: ProductStateMotion): string;
  resolveAllowedInteractions?(interactionWhitelist: string[], resolvedCoffeeIntent?: string): string[];
  resolveCameraByCapability?(camera: {
    cameraSystem: string;
    cameraAngle: string;
    cameraDistance: string;
    cameraRotation: string;
    framingGuide: string;
  }, options?: {
    wineCorkRemovalActive?: boolean;
    distortionRiskThreshold?: number;
  }): {
    cameraSystem: string;
    cameraAngle: string;
    cameraDistance: string;
    cameraRotation: string;
    framingGuide: string;
    warnings: string[];
  };
  getAllowedMotions?(productType: ProductStudioState['definition']['type'], resolvedIntent?: string): ProductStateMotion[];
  resolveStateMotionByCapability?(
    stateMotion: ProductStateMotion,
    stateMotionCapability: 'static-only' | 'limited' | 'extended',
    resolvedIntent?: string
  ): ProductStateMotion;
  forceInteractionNone?: boolean;
}
