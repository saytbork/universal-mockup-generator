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
        if (story.roleCredentials) {
            parts.push(`Credentials: ${story.roleCredentials}.`);
        }

        const role = (story.expertRoleLabel || story.expertRole || '').trim();
        if (role && role.toLowerCase() !== 'none') {
            parts.push(`Role: ${role}.`);
        }

        if (story.expertAttireDescription) {
            // "None" attire maps to regular clothing; keep the label generic to avoid implying scrubs/coats.
            parts.push(`Attire: ${story.expertAttireDescription}.`);
        } else if (story.expertAttire && story.expertAttire !== 'none') {
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
                    ? 'Badge preference: subtle specialty badge opposite the pocket (no duplicate name).'
                    : 'Badge preference: embroidered name only (name appears once).';
            parts.push(badgeText);
        }

        return parts.join(' ');
    }
}
