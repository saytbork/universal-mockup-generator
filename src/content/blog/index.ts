export type BlogHeroImage = {
  prompt: string;
  alt: string;
};

export type BlogSection = {
  heading: string;
  body: string;
  imagePrompt?: string;
  imageAlt?: string;
};

export type BlogCTA = {
  title: string;
  text: string;
  button: string;
};

export type BlogSEO = {
  title: string;
  description: string;
};

export type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  seo: BlogSEO;
  heroImage: BlogHeroImage;
  sections: BlogSection[];
  cta: BlogCTA;
};

const articleModules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: BlogArticle }>;

const articles = Object.values(articleModules).map(module => module.default);

const slugOrder = [
  'how-to-create-scroll-stopping-ugc-with-ai',
  'shopify-product-photos-ai-tactics',
  'amazon-listing-images-ai',
  'dtc-ad-creatives-ai-ugc',
  'background-replacement-ecommerce',
  'cinematic-lifestyle-shots-ai',
  'ai-product-mockups-launch-pages',
  'ab-testing-ai-ugc',
  'ai-photography-supplements-beauty',
  'ugc-content-engine-ai-firebase',
];

const articlesBySlug = new Map<string, BlogArticle>(articles.map(article => [article.slug, article]));

const orderedArticles = slugOrder
  .map(slug => articlesBySlug.get(slug))
  .filter((article): article is BlogArticle => Boolean(article));

export const getAllBlogArticles = (): BlogArticle[] => [...orderedArticles];

export const getBlogArticleBySlug = (slug: string | undefined): BlogArticle | null => {
  if (!slug) return null;
  return articlesBySlug.get(slug) ?? null;
};
