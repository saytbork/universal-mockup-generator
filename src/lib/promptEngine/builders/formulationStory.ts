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
            'The person is introduced as a real individual who worked on the formulation of the product, shown in an approachable, everyday setting instead of a staged production.',
            'Their expertise is communicated through practical detail and natural posture rather than grand authority.'
        ];

        const roleLabel = story.expertRoleLabel || 'medical expert';
        parts.push(`The expert is described as a ${roleLabel}.`);

        const attireSentence = story.expertAttireDescription
            ? `They wear ${story.expertAttireDescription} that stays true to real medical workwear without slick polish.`
            : 'They wear practical medical attire that feels worn-in and ready for hands-on work.';
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

        if (story.labVibeCustom) {
            parts.push(
                `The background environment reflects: ${story.labVibeCustom}, kept subtle and believable, avoiding staged set dressing.`
            );
        } else if (story.labVibe && story.labVibe !== 'none') {
            const hint = LAB_VIBE_HINTS[story.labVibe];
            if (hint) {
                parts.push(
                    `Subtle background hints such as ${hint} may appear, keeping the space cozy yet focused rather than sterile or theatrical.`
                );
            }
        } else if (story.labVibe === 'none') {
            parts.push('Background stays clean and minimal like a hero set: no lab props, no tools, no extra elements.');
        }

        parts.push('No hero language or cinematic polish—just an approachable expert who keeps the person-first focus.');

        return parts.filter(Boolean).join(' ');
    }
}
