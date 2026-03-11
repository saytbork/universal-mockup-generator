type VisualIntent = 'ugc' | 'editorial' | 'brand' | 'luxury';

export type SceneConfig = {
  sceneType?: string;
  visualIntent?: VisualIntent;
};

export type PromptSection = {
  id: string;
  content: string;
};

function upsertSection(
  sections: PromptSection[],
  next: PromptSection
): PromptSection[] {
  const withoutExisting = sections.filter((section) => section.id !== next.id);
  return [...withoutExisting, next];
}

export function applyVisualIntentLayer(
  sceneConfig: SceneConfig,
  masterSections: PromptSection[]
): PromptSection[] {
  if (sceneConfig.sceneType !== 'lifestyle-real') {
    return masterSections;
  }

  const visualIntent: VisualIntent = sceneConfig.visualIntent ?? 'editorial';
  switch (visualIntent) {
    case 'ugc':
      return upsertSection(masterSections, {
        id: 'visual_intent_bias',
        content:
          'VISUAL_INTENT_BIAS: UGC realism mode. Preserve natural lighting variability, allow imperfect micro-behaviors, avoid over-polished commercial tone, maintain casual environmental authenticity.',
      });
    case 'editorial':
      return upsertSection(masterSections, {
        id: 'visual_intent_bias',
        content:
          'VISUAL_INTENT_BIAS: Editorial stabilization. Maintain refined but natural scene discipline. Balanced lighting behavior. Clean professional phrasing. Avoid extreme stylization or heavy commercial exaggeration.',
      });
    case 'brand':
      return upsertSection(masterSections, {
        id: 'visual_intent_bias',
        content:
          'VISUAL_INTENT_BIAS: Brand campaign mode. Enforce product hero dominance. Lighting must feel controlled and intentional. Remove casual or amateur phrasing. Maintain commercial-grade tone, clear hierarchy, and visual discipline consistent with advertising photography.',
      });
    case 'luxury':
      return upsertSection(masterSections, {
        id: 'visual_intent_bias',
        content:
          'VISUAL_INTENT_BIAS: Luxury campaign mode. Apply sculpted high-contrast lighting. Emphasize premium material reflections and subtle rim-light separation. Minimize background clutter. Maintain elevated, high-end commercial tone consistent with luxury brand campaigns.',
      });
    default:
      return masterSections;
  }
}
