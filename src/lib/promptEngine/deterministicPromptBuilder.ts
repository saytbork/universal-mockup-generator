/**
 * Deterministic Prompt Builder - Main Orchestrator
 * 
 * Uses sceneType as ROOT CONTROLLER. Fixed canonical construction order.
 */

import type { DeterministicPromptInput, DeterministicPromptResult, SceneType } from './sceneTypes';
import { getSceneTypeRules } from './sceneTypeRules';
import { validateInput, checkHardFails, type ValidationResult } from './validation/hardFails';
import { buildProductSetupSection, buildCompositionSection, buildEnvironmentSection, buildLightingSection, buildCreativitySection, buildCameraSection, buildEcommerceSection, buildNegativePrompt, detectUnauthorizedObjects } from './handlers';

const PROMPT_HEADER = 'High-resolution product photography.';
const CONSTRAINTS_SECTION = `CONSTRAINTS: No extra props beyond those explicitly listed. No people unless explicitly allowed. No branding additions. No invented environments. No stylistic drift from scene type rules.`;

export class DeterministicPromptBuilder {
    validate(input: Partial<DeterministicPromptInput>): ValidationResult {
        return validateInput(input);
    }

    build(input: DeterministicPromptInput): DeterministicPromptResult {
        console.log('[DETERMINISTIC BUILDER] Starting build for sceneType:', input.sceneType);

        const hardFailErrors = checkHardFails(input);
        if (hardFailErrors.length > 0) {
            console.error('[DETERMINISTIC BUILDER] Hard fail detected:', hardFailErrors);
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: hardFailErrors };
        }

        const validation = this.validate(input);
        if (!validation.valid) {
            console.error('[DETERMINISTIC BUILDER] Validation failed:', validation.errors);
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: validation.errors };
        }

        const sceneType = input.sceneType;
        const rules = getSceneTypeRules(sceneType);

        // Step 1: Scene Type Declaration
        const sceneTypeSection = `SCENE TYPE: ${rules.description}`;
        console.log('[DETERMINISTIC BUILDER] Step 1: Scene Type - done');

        // Step 2: Product Description
        const productResult = buildProductSetupSection(input.productSetup, sceneType);
        console.log('[DETERMINISTIC BUILDER] Step 2: Product - done');

        // Step 3: Physical Composition
        const compositionResult = buildCompositionSection(input.compositionRules, sceneType);
        console.log('[DETERMINISTIC BUILDER] Step 3: Composition - done');

        // Step 4: Environment (conditional)
        const environmentResult = buildEnvironmentSection(input.environment, sceneType);
        console.log('[DETERMINISTIC BUILDER] Step 4: Environment -', environmentResult.active ? 'active' : 'skipped (prohibited)');

        // Step 5: Lighting
        const lightingResult = buildLightingSection(input.lighting, sceneType);
        if (!lightingResult.valid) {
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: [lightingResult.error || 'Lighting validation failed'] };
        }
        console.log('[DETERMINISTIC BUILDER] Step 5: Lighting - done');

        // Step 6: Camera & Framing
        const cameraResult = buildCameraSection(input.camera, sceneType);
        console.log('[DETERMINISTIC BUILDER] Step 6: Camera - done');

        // Step 7: Creativity Modulation
        const creativityResult = buildCreativitySection(input.creativity, sceneType);
        console.log('[DETERMINISTIC BUILDER] Step 7: Creativity - done');

        // Step 8: Ecommerce Overrides
        const ecommerceResult = buildEcommerceSection(input.ecommerce, sceneType);
        console.log('[DETERMINISTIC BUILDER] Step 8: Ecommerce -', ecommerceResult.active ? 'active' : 'inactive');

        // Step 9: Assemble Prompt (CANONICAL ORDER)
        const promptParts: string[] = [PROMPT_HEADER, sceneTypeSection, productResult.section, compositionResult.section];
        if (environmentResult.active) promptParts.push(environmentResult.section);
        promptParts.push(lightingResult.section, cameraResult.section, creativityResult.section);
        if (ecommerceResult.active) promptParts.push(ecommerceResult.section);
        promptParts.push(CONSTRAINTS_SECTION);

        const prompt = promptParts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

        // Step 10: Build Negative Prompt
        const negativePrompt = buildNegativePrompt(sceneType);
        console.log('[DETERMINISTIC BUILDER] Step 10: Negative Prompt - done');

        // Step 11: Final Validation (unauthorized objects check)
        const unauthorizedObjects = detectUnauthorizedObjects(prompt, compositionResult.allowedObjects, input.compositionRules);
        if (unauthorizedObjects.length > 0) {
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: [`Unauthorized objects detected in prompt: ${unauthorizedObjects.join(', ')}. Only objects in interactionObjects are allowed: ${input.compositionRules.interactionObjects.join(', ')}`] };
        }

        console.log('[DETERMINISTIC BUILDER] Build complete. Prompt length:', prompt.length);
        console.log('[FINAL DETERMINISTIC PROMPT]', prompt);

        return { prompt, negativePrompt, validationStatus: 'pass', validationWarnings: validation.warnings };
    }

    buildWithNegative(input: DeterministicPromptInput): string {
        const result = this.build(input);
        if (result.validationStatus === 'fail') throw new Error(`Prompt build failed: ${result.validationErrors?.join(', ')}`);
        return `${result.prompt} Negative prompt: ${result.negativePrompt}`;
    }

    getSceneRules(sceneType: SceneType) { return getSceneTypeRules(sceneType); }

    isFeatureAllowed(sceneType: SceneType, feature: 'environment' | 'hands' | 'advanced_creativity'): boolean {
        const rules = getSceneTypeRules(sceneType);
        switch (feature) {
            case 'environment': return rules.allowsEnvironment;
            case 'hands': return rules.allowsHands;
            case 'advanced_creativity': return rules.allowsAdvancedCreativity;
        }
    }
}

export const deterministicPromptBuilder = new DeterministicPromptBuilder();

export type { DeterministicPromptInput, DeterministicPromptResult, SceneType, ProductSetup, CompositionRules, EnvironmentConfig, LightingConfig, CreativityConfig, CameraConfig, EcommerceConfig, OutputFormatConfig } from './sceneTypes';
