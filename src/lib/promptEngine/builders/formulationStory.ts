import type { FormulationStoryOptions, PromptOptions, PromptBuilder } from '../types';

type ProfessionalFocus = NonNullable<FormulationStoryOptions['professionalFocus']>;
type LabVibe = NonNullable<FormulationStoryOptions['labVibe']>;

const PROFESSIONAL_FOCUS_COPY: Record<ProfessionalFocus, string> = {
    pulmonologist: 'hands-on respiratory care and formulation work tied to breathing support',
    nutritionist: 'day-to-day nutritional science that makes supplements feel grounded',
    dermatologist: 'skin-health and dermatology experience that respects human texture',
    pharmacist: 'pharmaceutical formulation and ingredient stewardship from a practical standpoint',
    clinical_researcher: 'clinical research and hands-on testing with real volunteers',
    herbalist: 'botanical and herbal formulation with natural, attainable rituals',
    functional_health_expert: 'practical functional health formulation rooted in everyday routines',
    wellness_practitioner: 'wellness practice and formulation that honors stress-relief rituals',
    research_scientist: 'research scientist background with grounded lab observations and repeated notes',
    custom: 'hands-on formulation work that feels rooted in the creator’s routine'
};

const LAB_VIBE_HINTS: Record<LabVibe, string> = {
    modern_clinical_lab: 'notebooks, research books, and simple ingredient containers',
    r_and_d_studio: 'sketches, ingredient jars, and small glass tools on a lived-in desk',
    apothecary_lab: 'botanical jars, droppers, and amber bottles with handwritten notes',
    none: ''
};

export class FormulationStoryBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        if (!options.formulationExpertEnabled) {
            return '';
        }

        const story = options.formulationStory;
        if (!story) {
            return '';
        }

        const parts: string[] = [
            'The person is presented as a real individual who worked on the formulation of the product, shown in an approachable and human way rather than as a staged professional.',
            'Their expertise is implied through context and demeanor, not explicit authority cues.'
        ];

        const roleLabel = story.expertRoleLabel || 'medical expert';
        parts.push(`The expert is described as a ${roleLabel}.`);

        const attireSentence = story.expertAttireDescription
            ? `They are wearing ${story.expertAttireDescription}, keeping the uniform authentic and grounded.`
            : 'They are wearing professional medical attire that feels real without excessive branding.';
        parts.push(attireSentence);

        if (story.expertName) {
            parts.push(
                `Their name, ${story.expertName}, is embroidered once above the chest pocket on one side and mentioned casually without emphasis.`
            );
        }

        const focus = story.professionalFocus;
        if (focus) {
            parts.push(`Their background aligns with ${PROFESSIONAL_FOCUS_COPY[focus]}.`);
        }

        if (story.roleCredentials) {
            parts.push(
                `Their credentials are woven into the conversation naturally, emphasizing hands-on knowledge rather than grand titles.`
            );
        }

        if (story.labVibe && story.labVibe !== 'none') {
            const hint = LAB_VIBE_HINTS[story.labVibe];
            if (hint) {
                parts.push(
                    `Subtle background hints such as ${hint} may appear, but the space remains a lived-in environment—no sterile benches, white coats, or clinical staging.`
                );
            }
        }

        parts.push('No grand titles, no hero language; just an approachable expert who keeps the person-first focus.');

        return parts.filter(Boolean).join(' ');
    }
}
