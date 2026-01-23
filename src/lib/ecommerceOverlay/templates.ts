import type { EcommerceOverlaySpec, EcommerceSlotKey, EcommerceSlotsConfig } from './types';

export type RequiredBlankSpaceDirection = 'left' | 'right' | 'center';

export interface EcommerceSlotTemplate {
  slotKey: EcommerceSlotKey;
  label: string;
  requiredBlankSpaceDirection: RequiredBlankSpaceDirection;
  spec: EcommerceOverlaySpec;
}

const baseSpec = (): EcommerceOverlaySpec => ({
  globalStyle: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    headingWeight: 800,
    bodyWeight: 500,
    radius: 18,
    cardBgStyle: 'glass',
    textColor: '#FFFFFF',
    accentColor: '#8B5CF6',
    baseScale: 1,
  },
  blocks: [],
});

export const ECOMMERCE_SLOT_TEMPLATES: EcommerceSlotTemplate[] = [
  {
    slotKey: 'WHAT_IS_PRODUCT',
    label: 'What is it?',
    requiredBlankSpaceDirection: 'right',
    spec: {
      ...baseSpec(),
      blocks: [
        {
          type: 'headline',
          text: 'Meet your new daily essential',
          subheadline: 'Clean, simple, and designed to fit your routine.',
          position: { x: 0.52, y: 0.14 },
          width: 0.44,
          fontSize: 56,
          subFontSize: 24,
          align: 'left',
          bgOn: false,
          borderOn: false,
          shadowOn: false,
          padding: 18,
        },
        {
          type: 'bullets',
          items: [
            { iconName: 'Sparkles', text: 'Minimal formula, maximum impact' },
            { iconName: 'ShieldCheck', text: 'Made for everyday use' },
            { iconName: 'Leaf', text: 'No harsh extras' },
          ],
          position: { x: 0.52, y: 0.34 },
          width: 0.44,
          fontSize: 22,
          align: 'left',
          iconSize: 22,
          gap: 14,
          bgOn: true,
          borderOn: true,
          shadowOn: true,
          padding: 18,
        },
        {
          type: 'badge',
          badgeStyle: 'pill',
          text: 'Best Seller',
          color: '#8B5CF6',
          position: { x: 0.52, y: 0.08 },
          size: 18,
        },
      ],
    },
  },
  {
    slotKey: 'WHAT_DOES_IT_DO',
    label: 'What does it do?',
    requiredBlankSpaceDirection: 'left',
    spec: {
      ...baseSpec(),
      blocks: [
        {
          type: 'headline',
          text: 'What you’ll notice',
          subheadline: 'Benefits that show up in real life.',
          position: { x: 0.06, y: 0.16 },
          width: 0.44,
          fontSize: 56,
          subFontSize: 24,
          align: 'left',
          bgOn: false,
          borderOn: false,
          shadowOn: false,
          padding: 18,
        },
        {
          type: 'bullets',
          items: [
            { iconName: 'Check', text: 'Visible, consistent results' },
            { iconName: 'Zap', text: 'Fast, no-fuss routine' },
            { iconName: 'Heart', text: 'Feels great day-to-day' },
          ],
          position: { x: 0.06, y: 0.38 },
          width: 0.44,
          fontSize: 22,
          align: 'left',
          iconSize: 22,
          gap: 14,
          bgOn: true,
          borderOn: true,
          shadowOn: true,
          padding: 18,
        },
        {
          type: 'badge',
          badgeStyle: 'tag',
          text: 'Before & After Friendly',
          color: '#22C55E',
          position: { x: 0.06, y: 0.10 },
          size: 18,
        },
      ],
    },
  },
  {
    slotKey: 'HOW_IT_WORKS_3_STEPS',
    label: 'How it works (3 steps)',
    requiredBlankSpaceDirection: 'right',
    spec: {
      ...baseSpec(),
      blocks: [
        {
          type: 'headline',
          text: 'How it works',
          subheadline: 'Three simple steps.',
          position: { x: 0.52, y: 0.14 },
          width: 0.44,
          fontSize: 56,
          subFontSize: 24,
          align: 'left',
          bgOn: false,
          borderOn: false,
          shadowOn: false,
          padding: 18,
        },
        {
          type: 'steps',
          steps: [
            { iconName: 'Hand', title: 'Step 1', body: 'Apply a small amount.' },
            { iconName: 'Clock', title: 'Step 2', body: 'Let it absorb for 60 seconds.' },
            { iconName: 'Smile', title: 'Step 3', body: 'Go live your day.' },
          ],
          position: { x: 0.52, y: 0.34 },
          width: 0.44,
          layout: 'col',
          headingSize: 22,
          bodySize: 18,
          iconSize: 22,
          gap: 14,
          bgOn: true,
          borderOn: true,
          shadowOn: true,
          padding: 18,
        },
      ],
    },
  },
  {
    slotKey: 'RESULTS_TESTIMONIALS',
    label: 'Results + testimonials',
    requiredBlankSpaceDirection: 'left',
    spec: {
      ...baseSpec(),
      blocks: [
        {
          type: 'headline',
          text: 'Real people. Real results.',
          subheadline: 'What customers are saying.',
          position: { x: 0.06, y: 0.14 },
          width: 0.44,
          fontSize: 54,
          subFontSize: 24,
          align: 'left',
          bgOn: false,
          borderOn: false,
          shadowOn: false,
          padding: 18,
        },
        {
          type: 'testimonials',
          cards: [
            { quote: '“I noticed a difference within the first week.”', name: 'Taylor' },
            { quote: '“Simple to use and it actually works.”', name: 'Jordan' },
          ],
          position: { x: 0.06, y: 0.34 },
          width: 0.44,
          quoteSize: 18,
          nameSize: 16,
          stars: 5,
          showAvatar: true,
          gap: 14,
          bgOn: true,
          borderOn: true,
          shadowOn: true,
          padding: 18,
        },
        {
          type: 'badge',
          badgeStyle: 'seal',
          text: '5.0',
          color: '#F59E0B',
          position: { x: 0.40, y: 0.09 },
          size: 22,
        },
      ],
    },
  },
  {
    slotKey: 'DIFFERENTIATION',
    label: 'Differentiation',
    requiredBlankSpaceDirection: 'right',
    spec: {
      ...baseSpec(),
      blocks: [
        {
          type: 'headline',
          text: 'Why this one?',
          subheadline: 'The details that make the difference.',
          position: { x: 0.52, y: 0.14 },
          width: 0.44,
          fontSize: 56,
          subFontSize: 24,
          align: 'left',
          bgOn: false,
          borderOn: false,
          shadowOn: false,
          padding: 18,
        },
        {
          type: 'bullets',
          items: [
            { iconName: 'FlaskConical', text: 'Clinically-inspired approach' },
            { iconName: 'Ban', text: 'No unnecessary fillers' },
            { iconName: 'Sun', text: 'Daily-use friendly' },
          ],
          position: { x: 0.52, y: 0.36 },
          width: 0.44,
          fontSize: 22,
          align: 'left',
          iconSize: 22,
          gap: 14,
          bgOn: true,
          borderOn: true,
          shadowOn: true,
          padding: 18,
        },
      ],
    },
  },
  {
    slotKey: 'BACK_IT_UP_GUARANTEE',
    label: 'Guarantee',
    requiredBlankSpaceDirection: 'left',
    spec: {
      ...baseSpec(),
      globalStyle: {
        ...baseSpec().globalStyle,
        accentColor: '#22C55E',
      },
      blocks: [
        {
          type: 'headline',
          text: 'Backed by a guarantee',
          subheadline: 'Try it risk-free.',
          position: { x: 0.06, y: 0.18 },
          width: 0.44,
          fontSize: 54,
          subFontSize: 24,
          align: 'left',
          bgOn: false,
          borderOn: false,
          shadowOn: false,
          padding: 18,
        },
        {
          type: 'bullets',
          items: [
            { iconName: 'ShieldCheck', text: '30-day money-back guarantee' },
            { iconName: 'Truck', text: 'Fast shipping' },
            { iconName: 'MessageCircle', text: 'Support that actually responds' },
          ],
          position: { x: 0.06, y: 0.40 },
          width: 0.44,
          fontSize: 22,
          align: 'left',
          iconSize: 22,
          gap: 14,
          bgOn: true,
          borderOn: true,
          shadowOn: true,
          padding: 18,
        },
        {
          type: 'badge',
          badgeStyle: 'seal',
          text: '30-Day',
          color: '#22C55E',
          position: { x: 0.38, y: 0.11 },
          size: 22,
        },
      ],
    },
  },
];

export const ECOMMERCE_SLOT_KEYS: EcommerceSlotKey[] = ECOMMERCE_SLOT_TEMPLATES.map(t => t.slotKey);

export const ECOMMERCE_SLOT_LABELS: Record<EcommerceSlotKey, string> = ECOMMERCE_SLOT_TEMPLATES.reduce(
  (acc, template) => {
    acc[template.slotKey] = template.label;
    return acc;
  },
  {} as Record<EcommerceSlotKey, string>
);

export function buildDefaultEcommerceSlotsConfig(): EcommerceSlotsConfig {
  return ECOMMERCE_SLOT_TEMPLATES.reduce((acc, template) => {
    acc[template.slotKey] = template.spec;
    return acc;
  }, {} as EcommerceSlotsConfig);
}

export const ECOMMERCE_SLOT_REQUIRED_BLANK_SPACE: Record<EcommerceSlotKey, RequiredBlankSpaceDirection> =
  ECOMMERCE_SLOT_TEMPLATES.reduce((acc, template) => {
    acc[template.slotKey] = template.requiredBlankSpaceDirection;
    return acc;
  }, {} as Record<EcommerceSlotKey, RequiredBlankSpaceDirection>);

