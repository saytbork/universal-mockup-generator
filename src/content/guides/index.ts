export type GuideHeroImage = {
    src?: string;
    prompt: string;
    alt: string;
};

export type GuideSection = {
    heading: string;
    body: string;
    imageSrc?: string;
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

export type GuideArticle = {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    seo: GuideSEO;
    heroImage: GuideHeroImage;
    sections: GuideSection[];
    cta: GuideCTA;
};

const articleModules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: GuideArticle }>;

const articles = Object.values(articleModules).map(module => module.default);

const slugOrder = [
    'how-to-generate-ugc-with-ai',
    'how-to-create-ai-lifestyle-images',
    'how-to-build-shopify-photos-with-ai',
    'how-to-create-ecommerce-packshots',
    'ai-for-amazon-listing-images',
    'ai-photography-tips-for-beginners',
];

const articlesBySlug = new Map<string, GuideArticle>(articles.map(article => [article.slug, article]));

const orderedArticles = slugOrder
    .map(slug => articlesBySlug.get(slug))
    .filter((article): article is GuideArticle => Boolean(article));

export const getAllGuideArticles = (): GuideArticle[] => [...orderedArticles];

export const getGuideArticleBySlug = (slug: string | undefined): GuideArticle | null => {
    if (!slug) return null;
    return articlesBySlug.get(slug) ?? null;
};
