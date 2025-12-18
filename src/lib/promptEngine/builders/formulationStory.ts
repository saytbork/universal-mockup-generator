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
        const attire = (options.formulationExpertAttire || '').trim();
        const badgeEnabled = Boolean((options as any).formulationBadgeEnabled);
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

        if (attire) {
            lines.push(
                `They wear ${attire.toLowerCase()}, styled for practical, real-world work rather than a staged uniform.`
            );
        }

        if (professionalContext) {
            lines.push(
                `The scene subtly reflects this professional context (${professionalContext}) through clothing, posture, and surrounding details, without exaggeration or visual emphasis.`
            );
        }

        if (embroideredName) {
            lines.push(
                `A single embroidered name reading "${embroideredName}" sits just above the chest pocket on one side only, stitched directly into the fabric without any mirrored duplicate.`
            );
        } else {
            lines.push(
                'A single embroidered name label sits above the chest pocket on one side only, stitched directly into the fabric with no mirrored duplicate.'
            );
        }

        if (badgeEnabled) {
            lines.push(
                'A single minimal ID badge is clipped near the chest pocket to reference a real institution.'
            );
        } else {
            lines.push('No additional badges, icons, or decorative patches appear on the clothing.');
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
