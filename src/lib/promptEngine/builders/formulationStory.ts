import type { PromptOptions, PromptBuilder } from '../types';

const DEFAULT_TONE = 'calm, grounded, everyday';

export class FormulationStoryBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        if (!options.formulationExpertEnabled) {
            return '';
        }

        const isLifestyleMode = options.creationMode === 'lifestyle';
        const isEcommerceComposition =
            (options.compositionMode || '').toLowerCase().includes('ecommerce') ||
            options.creationMode === 'ecom-blank';

        if (!isLifestyleMode || isEcommerceComposition) {
            return '';
        }

        if (!options.personIncluded) {
            return '';
        }

        const customEnvironment = (((options as any).customEnvironment as string) || '').trim();
        const environmentSelection = (((options as any).selectedEnvironment as string) || '').trim();
        const environment = (customEnvironment || options.setting || '').trim();

        if (!environment) {
            return '';
        }

        const productName =
            (((options as any).productName as string) ||
                ((options.productAssets?.[0] as any)?.name as string) ||
                (options.productAssets?.[0]?.label as string) ||
                'the product').trim();

        const timeLighting =
            (((options as any).timeLightingContext as string) || options.lighting || '').trim();
        const profession = (options.formulationExpertRole || '').trim();
        const professionalContext = (((options as any).professionalContext as string) || '').trim();
        const embroideredName = (options.formulationExpertName || '').trim();
        const tone = (((options as any).formulationTone as string) || DEFAULT_TONE).trim();

        const lines: string[] = [];
        lines.push(
            `This scene includes a quiet, natural moment that reflects how ${productName} fits into everyday life.`
        );

        if (customEnvironment) {
            lines.push(
                `Set within the following real environment: ${environment}, the product appears as part of a natural, everyday moment rather than a staged presentation.`
            );
        } else {
            const normalizedEnvironment = environmentSelection || environment;
            lines.push(
                `Set within a real ${normalizedEnvironment} setting, the product appears as part of a normal routine rather than a staged presentation. The context feels familiar, lived-in, and believable.`
            );
        }

        if (timeLighting) {
            lines.push(
                `The moment takes place during ${timeLighting}, reinforcing a genuine sense of time and atmosphere without drawing attention to technical lighting or setup.`
            );
        }

        if (profession) {
            lines.push(
                `The person appears in their everyday role as a ${profession}, naturally situated within this environment. Their presence feels authentic and unperformed, as if captured during a real moment rather than posed for a photo.`
            );
        }

        if (professionalContext) {
            lines.push(
                `The scene subtly reflects this professional context (${professionalContext}) through clothing, posture, and surrounding details, without exaggeration or visual emphasis.`
            );
        }

        if (embroideredName) {
            lines.push(
                `A small embroidered name reading "${embroideredName}" is visible on the clothing, reinforcing realism and personal identity without drawing focus.`
            );
        }

        lines.push(
            `Rather than emphasizing features or claims, the scene focuses on presence and intention. ${productName} is simply there, supporting a small, human moment, calm, personal, and unforced.`
        );
        lines.push(
            `The overall tone is ${tone}, grounded in realism and subtlety, allowing the product to feel integrated into life instead of presented as a centerpiece.`
        );

        const result = lines.filter(Boolean).join(' ');
        console.log('[FORMULATION STORY] Injected lifestyle narrative block');
        return result;
    }
}
