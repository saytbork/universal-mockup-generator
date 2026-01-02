export type EcommerceSlotKey =
  | 'WHAT_IS_PRODUCT'
  | 'WHAT_DOES_IT_DO'
  | 'HOW_IT_WORKS_3_STEPS'
  | 'RESULTS_TESTIMONIALS'
  | 'DIFFERENTIATION'
  | 'BACK_IT_UP_GUARANTEE';

export type OverlayAlign = 'left' | 'center' | 'right';

export interface OverlayPosition {
  /**
   * Normalized coordinates in [0..1], relative to the canvas' top-left.
   */
  x: number;
  y: number;
}

export type CardBgStyle = 'none' | 'solid' | 'glass';

export interface EcommerceOverlayGlobalStyle {
  fontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  radius: number;
  cardBgStyle: CardBgStyle;
  textColor: string;
  accentColor: string;
  baseScale: number;
}

export interface HeadlineBlock {
  type: 'headline';
  text: string;
  subheadline?: string;
  position: OverlayPosition;
  width: number;
  fontSize: number;
  subFontSize?: number;
  align: OverlayAlign;
  bgOn: boolean;
  borderOn: boolean;
  shadowOn: boolean;
  padding: number;
}

export interface BulletsItem {
  iconName: string;
  text: string;
}

export interface BulletsBlock {
  type: 'bullets';
  items: BulletsItem[];
  position: OverlayPosition;
  width: number;
  fontSize: number;
  align: OverlayAlign;
  iconSize: number;
  gap: number;
  bgOn: boolean;
  borderOn: boolean;
  shadowOn: boolean;
  padding: number;
}

export interface StepItem {
  iconName: string;
  title: string;
  body: string;
}

export interface StepsBlock {
  type: 'steps';
  steps: StepItem[];
  position: OverlayPosition;
  width: number;
  layout: 'row' | 'col';
  headingSize: number;
  bodySize: number;
  iconSize: number;
  gap: number;
  bgOn: boolean;
  borderOn: boolean;
  shadowOn: boolean;
  padding: number;
}

export interface TestimonialCard {
  quote: string;
  name: string;
}

export interface TestimonialBlock {
  type: 'testimonials';
  cards: TestimonialCard[];
  position: OverlayPosition;
  width: number;
  quoteSize: number;
  nameSize: number;
  stars: 1 | 2 | 3 | 4 | 5;
  showAvatar: boolean;
  gap: number;
  bgOn: boolean;
  borderOn: boolean;
  shadowOn: boolean;
  padding: number;
}

export type BadgeStyle = 'pill' | 'seal' | 'tag';

export interface BadgeBlock {
  type: 'badge';
  badgeStyle: BadgeStyle;
  text: string;
  color: string;
  position: OverlayPosition;
  size: number;
}

export type OverlayBlock = HeadlineBlock | BulletsBlock | StepsBlock | TestimonialBlock | BadgeBlock;

export interface EcommerceOverlaySpec {
  globalStyle: EcommerceOverlayGlobalStyle;
  blocks: OverlayBlock[];
}

export type EcommerceSlotsConfig = Record<EcommerceSlotKey, EcommerceOverlaySpec>;

