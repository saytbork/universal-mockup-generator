export type SeoConfig = {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
};

const DEFAULT_OG_IMAGE = 'https://perfectmockup.com/preview.png';

const setMeta = (key: string, content: string, attr: 'name' | 'property' = 'name') => {
  let element = document.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setLink = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export const applySeo = (config: SeoConfig) => {
  document.title = config.title;
  setMeta('description', config.description);

  const ogImage = config.ogImage || DEFAULT_OG_IMAGE;
  setLink('canonical', config.canonical);

  setMeta('og:title', config.title, 'property');
  setMeta('og:description', config.description, 'property');
  setMeta('og:url', config.canonical, 'property');
  setMeta('og:image', ogImage, 'property');
  setMeta('og:type', 'website', 'property');

  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);
  setMeta('twitter:image', ogImage);
};

