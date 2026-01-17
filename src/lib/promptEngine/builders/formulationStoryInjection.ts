import type { FormulationStoryOptions, PromptBuilder, PromptOptions } from '../types';

const LAB_VIBE_HINTS: Record<string, string> = {
    modern_clinical_lab: 'notebooks, research books, and simple ingredient containers',
    r_and_d_studio: 'sketches, ingredient jars, and small glass tools on a lived-in desk',
    apothecary_lab: 'botanical jars, droppers, and amber bottles with handwritten notes',
    none: ''
};

export class FormulationStoryInjectionBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        if (!options.formulationExpertEnabled) {
            return '';
        }

        const story: FormulationStoryOptions | undefined = options.formulationStory;
        if (!story) {
            return '';
        }

        const parts: string[] = [];
        if (story.expertName) {
            parts.push(`Expert Name: ${story.expertName}.`);
        }

        if (story.roleCredentials) {
            parts.push(`Credentials: ${story.roleCredentials}.`);
        }

        const role = story.expertRoleLabel || story.expertRole || 'formulation expert';
        parts.push(`Role: ${role}.`);

        if (story.expertAttireDescription) {
            parts.push(`Medical Attire: ${story.expertAttireDescription}.`);
        } else if (story.expertAttire) {
            parts.push(`Medical Attire: ${story.expertAttire.replace(/_/g, ' ')}.`);
        }

        if (story.labVibeCustom) {
            parts.push(`Lab vibe (custom): ${story.labVibeCustom}.`);
        } else if (story.labVibe && story.labVibe !== 'none') {
            const hint = LAB_VIBE_HINTS[story.labVibe];
            if (hint) {
                parts.push(`Lab vibe: ${hint}.`);
            }
        } else if (story.labVibe === 'none') {
            parts.push('Lab vibe: none (clean hero background, no lab props or tools).');
        }

        if (story.badgePreference) {
            const badgeText =
                story.badgePreference === 'name_and_badge'
                    ? 'Badge preference: name plus subtle specialty badge opposite the pocket.'
                    : 'Badge preference: embroidered name only.';
            parts.push(badgeText);
        }

        return parts.join(' ');
    }
}
