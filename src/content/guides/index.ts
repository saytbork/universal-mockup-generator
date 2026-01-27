export type GuideHeroImage = {
    url?: string;
    prompt: string;
    alt: string;
};

export type GuideSection = {
    heading: string;
    body: string;
    imagePrompt?: string;
    imageAlt?: string;
};

export type GuideCTA = {
    title: string;
    text: string;
    button: string;
};

export type GuideSEO = {
    title: string;
    description: string;
};

export type Guide = {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    category: string;
    seo: GuideSEO;
    heroImage: GuideHeroImage;
    sections: GuideSection[];
    cta: GuideCTA;
};

const guideModules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: Guide }>;

const guides = Object.values(guideModules).map(module => module.default);

const slugOrder = [
    'ai-product-mockups',
    'ai-ugc-for-ads',
    'shopify-product-images-ai',
    'how-to-generate-ugc-with-ai',
    'how-to-create-ai-lifestyle-images',
    'shopify-product-photos-ai-workflow',
    'amazon-listing-images-ai-guide',
    'ecommerce-packshots-masterclass',
];

const guidesBySlug = new Map<string, Guide>(guides.map(guide => [guide.slug, guide]));

const orderedGuides = slugOrder
    .map(slug => guidesBySlug.get(slug))
    .filter((guide): guide is Guide => Boolean(guide));

export const getAllGuides = (): Guide[] => [...orderedGuides];

export const getGuideBySlug = (slug: string | undefined): Guide | null => {
    if (!slug) return null;
    return guidesBySlug.get(slug) ?? null;
};
