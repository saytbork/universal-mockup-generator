type TooltipEntry = string | Record<string, string>;

export const TOOLTIP_MAP: Record<string, TooltipEntry> = {
  'Clean Natural Wellness Look': 'A balanced, natural photographic style with soft shadows and realistic colors.',
  'Soft Natural Wellness Look': 'Soft tones, natural texture, minimal contrast, realistic lighting.',
  'Minimal Modern Interior': 'Bright, minimal indoor setting with clean lines and soft light.',
  'Beauty Editorial Soft Skin': 'Soft gradients, even tone, realistic beauty lighting, no plastic artifacts.',
  'Soft Studio Light': 'Diffuse, even studio lighting ideal for product photography.',
  'Beauty Editorial Look': 'Polished editorial feel with refined lighting and premium styling.',
  'Sunrise Wellness Counter': 'Early morning countertop light with clean wellness styling and glass details.',
  'Crown Wellness Vanity': 'Luxe vanity styling with marble, chrome, and botanicals for a premium feel.',
  'Dawn Wellness Scene': 'Warm dawn light with soft shadows and calm wellness atmosphere.',
  'Ecommerce Blank Space': 'Creates a clean marketing layout with solid background color, product + creator on one side and empty space for text or badges.',
  'Creation Mode': {
    'Lifestyle UGC': 'Realistic people + product in authentic environments.',
    'Studio Hero': 'Clean hero shots with premium studio lighting.',
    'Aesthetic Builder': 'Curated props and palettes for brand vibes.',
    'Background Replace': 'Swap the environment while preserving product fidelity.',
    'Ecommerce Blank Space': 'Solid background with space for marketing text.',
  },
};

export const tooltipMap = TOOLTIP_MAP;
