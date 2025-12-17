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

const BADGE_REFERENCE: Record<ProfessionalFocus, string> = {
    pulmonologist: 'respiratory care focus with breathing health cues',
    nutritionist: 'nutrition science focus that highlights ingredient balance',
    dermatologist: 'dermatology focus that honors human texture and skin touch',
    pharmacist: 'pharmacy stewardship focus on precise compounding',
    clinical_researcher: 'clinical trial focus grounded in repeated testing',
    herbalist: 'botanical formulation focus rooted in natural rituals',
    functional_health_expert: 'functional health focus connecting science with daily routines',
    wellness_practitioner: 'wellness practice focus that speaks to stress-relief rituals',
    research_scientist: 'analytic research focus documenting lab notes',
    custom: 'custom expert focus provided by the creator'
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

        const focus = story.professionalFocus;
        const badgeDescriptor = focus ? BADGE_REFERENCE[focus] : 'the selected expert focus';
        const embroideredNameText = story.expertName
            ? `The embroidery reads "${story.expertName}" above the chest pocket and is referenced casually without fanfare.`
            : '';

        const scrubsSentence = [
            'The expert is wearing professional medical scrubs with a single embroidered name above the chest pocket',
            focus ? `and a visible specialty badge opposite the name referencing ${badgeDescriptor}` : 'and a visible specialty badge opposite the name',
            'keeping the uniform authentic and grounded while signaling their role.'
        ].filter(Boolean).join(' ');
        parts.push(scrubsSentence);

        if (embroideredNameText) {
            parts.push(embroideredNameText);
        }

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
