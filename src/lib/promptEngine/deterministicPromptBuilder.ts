/**
 * Deterministic Prompt Builder - Main Orchestrator v1.0
 * 
 * Uses sceneType as ROOT CONTROLLER. Fixed canonical construction order.
 */

import type { DeterministicPromptInput, DeterministicPromptResult, SceneType } from './sceneTypes';
import { getSceneTypeRules } from './sceneTypeRules';
import { validateInput, checkHardFails, type ValidationResult } from './validation/hardFails';
import {
    buildProductSetupSection,
    buildPlacementSection,
    buildCompositionSection,
    buildEnvironmentSection,
    buildLightingSection,
    buildCreativitySection,
    buildCameraSection,
    buildEcommerceSection,
    buildNegativePrompt,
    detectUnauthorizedObjects
} from './handlers';
import { DETERMINISTIC_SECTIONS } from './deterministicSystemPrompt';

export class DeterministicPromptBuilder {
    validate(input: Partial<DeterministicPromptInput>): ValidationResult {
        return validateInput(input);
    }

    build(input: DeterministicPromptInput): DeterministicPromptResult {
        console.log('[DETERMINISTIC BUILDER] Starting build v1.0 for sceneType:', input.sceneType);

        const hardFailErrors = checkHardFails(input);
        if (hardFailErrors.length > 0) {
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: hardFailErrors };
        }

        const validation = this.validate(input);
        if (!validation.valid) {
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: validation.errors };
        }

        const sceneType = input.sceneType;

        // --- Execute Handlers ---

        // 02 & 03: Product Setup
        const productResult = buildProductSetupSection(input.productSetup, sceneType);

        // 05 & 07: Composition & Interaction
        const compositionResult = buildCompositionSection(input.compositionRules, sceneType);

        // 06: Placement
        const placementText = buildPlacementSection(input.placement, sceneType);

        // 08: Viewpoint & Vantage Logic
        const viewpointText = this.buildViewpointSection(input);

        // 09: Environment
        const environmentResult = buildEnvironmentSection(input.environment, sceneType);

        // 10: Camera
        const cameraResult = buildCameraSection(input.camera, sceneType);

        // 11: Lighting
        const lightingResult = buildLightingSection(input.lighting, sceneType);
        if (!lightingResult.valid) {
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: [lightingResult.error || 'Lighting validation failed'] };
        }

        // Additional
        const creativityResult = buildCreativitySection(input.creativity, sceneType);
        const ecommerceResult = buildEcommerceSection(input.ecommerce, sceneType);

        // --- ASSEMBLE 12 SECTIONS (v1.0 SPEC) ---
        const promptParts: string[] = [
            DETERMINISTIC_SECTIONS.SECTION_01_QUALITY,
            `${DETERMINISTIC_SECTIONS.SECTION_02_IDENTITY}\n${productResult.section}`,
            `${DETERMINISTIC_SECTIONS.SECTION_03_TYPE}\nPRIMARY TYPE: ${input.productSetup.productType}`,
            `${DETERMINISTIC_SECTIONS.SECTION_04_PHYSICAL}\nSCALE: ${input.productSetup.physicalScale || 'standard tabletop'}`,
            `${DETERMINISTIC_SECTIONS.SECTION_05_STRUCTURE}\n${compositionResult.section.replace('COMPOSITION:', '').trim()}`,
            `${DETERMINISTIC_SECTIONS.SECTION_06_PLACEMENT}\n${placementText}`,
            `${DETERMINISTIC_SECTIONS.SECTION_07_INTERACTION}\nInteraction: ${input.compositionRules.interactionType || 'None'}`,
            `${DETERMINISTIC_SECTIONS.SECTION_08_VIEWPOINT}\n${viewpointText}`,
        ];

        if (environmentResult.active) {
            promptParts.push(`${DETERMINISTIC_SECTIONS.SECTION_09_PHOTO_MODE}\n${environmentResult.section}`);
        } else {
            promptParts.push(`${DETERMINISTIC_SECTIONS.SECTION_09_PHOTO_MODE}\nNO ENVIRONMENT: Isolated studio setup.`);
        }

        promptParts.push(`${DETERMINISTIC_SECTIONS.SECTION_10_CAMERA}\n${cameraResult.section} ${creativityResult.section}`);
        promptParts.push(`${DETERMINISTIC_SECTIONS.SECTION_11_LIGHTING}\n${lightingResult.section}`);

        if (ecommerceResult.active) {
            promptParts.push(`ECOMMERCE OVERRIDES:\n${ecommerceResult.section}`);
        }

        promptParts.push(DETERMINISTIC_SECTIONS.SECTION_12_VALIDATION);
        promptParts.push(DETERMINISTIC_SECTIONS.OUTPUT_GOAL);

        const prompt = promptParts.join('\n\n').trim();

        // Build Negative Prompt
        const negativePrompt = buildNegativePrompt(sceneType);

        // Unauthorized Objects Check
        const unauthorizedObjects = detectUnauthorizedObjects(prompt, compositionResult.allowedObjects, input.compositionRules);
        if (unauthorizedObjects.length > 0) {
            return { prompt: '', negativePrompt: '', validationStatus: 'fail', validationErrors: [`Unauthorized objects: ${unauthorizedObjects.join(', ')}`] };
        }

        return { prompt, negativePrompt, validationStatus: 'pass', validationWarnings: validation.warnings };
    }

    private buildViewpointSection(input: DeterministicPromptInput): string {
        const p = input.placement || 'surface';
        const angle = input.camera?.angle || 'front';

        if (p === 'surface') {
            if (angle === 'top') return 'Surface — Aerial / Top-Down View: Camera is positioned directly above the product looking down. Gravity applied downward, visible contact shadows.';
            return 'Surface — Eye-Level View: Product rests on a surface, horizon aligns with surface plane. Eye-level perspective.';
        }
        if (p === 'held') return 'Held Object — Human POV: Product is held by hands. Viewer perspective matches natural human eye level. Scale is defined by hand-to-product ratio.';
        if (p === 'supported') return 'Supported Object — Display View: Product rests on a stand or pedestal. Viewer perspective clearly shows support and contact points.';
        if (p === 'air') return 'Suspended View (Abstract Only): Gravity intentionally neutralized. No real-world environment. Floating in abstract studio air.';

        return 'Surface — Eye-Level View';
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
