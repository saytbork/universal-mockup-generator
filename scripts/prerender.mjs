import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, 'dist');
const SITE_URL = process.env.SITE_URL || 'https://perfectmockup.com';

const escapeHtml = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const normalizeSiteUrl = (base, pathname) => {
  const cleanBase = String(base).replace(/\/+$/, '');
  const cleanPath = `/${String(pathname || '').replace(/^\/+/, '')}`;
  return `${cleanBase}${cleanPath}`;
};

const readSitemapPaths = () => {
  const sitemapCandidates = [
    path.join(distDir, 'sitemap.xml'),
    path.join(repoRoot, 'public', 'sitemap.xml'),
  ];
  const sitemapPath = sitemapCandidates.find((p) => fs.existsSync(p));
  if (!sitemapPath) throw new Error('[prerender] Could not find sitemap.xml in dist/ or public/');

  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => String(m[1]));
  const paths = matches
    .map((u) => {
      try {
        return new URL(u).pathname;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return Array.from(new Set(paths)).sort();
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const getDefaultOgImage = () => 'https://perfectmockup.com/preview.png';

const getBlogArticleBySlug = (slug) => {
  const p = path.join(repoRoot, 'src', 'content', 'blog', `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return readJson(p);
};

const getGuideBySlug = (slug) => {
  const p = path.join(repoRoot, 'src', 'content', 'guides', `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return readJson(p);
};

const getSeoForPath = (routePath) => {
  const p = routePath.replace(/\/+$/, '') || '/';

  // Marketing pages: reuse the exact strings already present in TSX/index.html.
  if (p === '/') {
    return {
      title: 'Product & Lifestyle Mockups for Ecommerce Brands | Perfect Mockup',
      description: 'Create studio-ready product mockups and lifestyle visuals without photoshoots. Built for ecommerce brands, ads and product launches.',
      canonical: 'https://perfectmockup.com/',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p === '/pricing') {
    return {
      title: 'Pricing | Perfect Mockup',
      description: 'Plans and credits for generating premium ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: 'https://perfectmockup.com/pricing',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p === '/use-cases') {
    return {
      title: 'Use Cases | Perfect Mockup',
      description: 'Use cases for AI-generated ecommerce product visuals: Shopify, Amazon, agencies, creators, and performance teams.',
      canonical: 'https://perfectmockup.com/use-cases',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p === '/comparisons') {
    return {
      title: 'Perfect Mockup vs Competitors | Comparisons',
      description: 'Compare Perfect Mockup with other AI tools for ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: 'https://perfectmockup.com/comparisons',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p.startsWith('/comparisons/')) {
    const slug = p.slice('/comparisons/'.length);
    const name = slug
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    return {
      title: `Perfect Mockup vs ${name} | Comparisons`,
      description: 'Compare Perfect Mockup with other AI tools for ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: `https://perfectmockup.com/comparisons/${slug}`,
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p === '/blog') {
    return {
      title: 'Blog | Perfect Mockup',
      description: 'Guides, tutorials, and AI insights for ecommerce product visuals, lifestyle scenes, and UGC-style ads.',
      canonical: 'https://perfectmockup.com/blog',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p.startsWith('/blog/')) {
    const slug = p.slice('/blog/'.length);
    const article = getBlogArticleBySlug(slug);
    if (!article) return null;
    const ogImage =
      article.heroImage?.url
        ? (String(article.heroImage.url).startsWith('http') ? article.heroImage.url : normalizeSiteUrl(SITE_URL, article.heroImage.url))
        : getDefaultOgImage();
    return {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.subtitle || '',
      canonical: `https://perfectmockup.com/blog/${article.slug}`,
      ogType: 'article',
      ogImage,
    };
  }

  if (p === '/guides') {
    return {
      title: 'Guides & Tutorials | Perfect Mockup',
      description: 'Step-by-step guides to create ecommerce visuals, AI UGC, product photography, and launch-ready mockups.',
      canonical: 'https://perfectmockup.com/guides',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p.startsWith('/guides/')) {
    const slug = p.slice('/guides/'.length);
    const guide = getGuideBySlug(slug);
    if (!guide) return null;
    const ogImage =
      guide.heroImage?.url
        ? (String(guide.heroImage.url).startsWith('http') ? guide.heroImage.url : normalizeSiteUrl(SITE_URL, guide.heroImage.url))
        : getDefaultOgImage();
    return {
      title: guide.seo?.title || guide.title,
      description: guide.seo?.description || guide.subtitle || '',
      canonical: `https://perfectmockup.com/guides/${guide.slug}`,
      ogType: 'article',
      ogImage,
    };
  }

  if (p === '/faq') {
    return {
      title: 'FAQ | Perfect Mockup',
      description: 'Frequently asked questions about Perfect Mockup: credits, commercial use, photorealism, and AI UGC.',
      canonical: 'https://perfectmockup.com/faq',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p === '/terms') {
    return {
      title: 'Terms of Service | Perfect Mockup',
      description: 'Terms of Service for Perfect Mockup.',
      canonical: 'https://perfectmockup.com/terms',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  if (p === '/privacy') {
    return {
      title: 'Privacy Policy | Perfect Mockup',
      description: 'Privacy Policy for Perfect Mockup.',
      canonical: 'https://perfectmockup.com/privacy',
      ogType: 'website',
      ogImage: getDefaultOgImage(),
    };
  }

  return null;
};

const replaceOrInsert = (html, pattern, replacement, insertBefore = '</head>') => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  const idx = html.indexOf(insertBefore);
  if (idx === -1) return html + replacement;
  return html.slice(0, idx) + replacement + '\n' + html.slice(idx);
};

const applySeoToHtml = (baseHtml, seo) => {
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const canonical = escapeHtml(seo.canonical);
  const ogImage = escapeHtml(seo.ogImage || getDefaultOgImage());
  const ogType = escapeHtml(seo.ogType || 'website');

  let html = baseHtml;

  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${description}" />`
  );
  html = replaceOrInsert(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonical}" />`
  );

  html = replaceOrInsert(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${ogType}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${ogImage}" />`);

  html = replaceOrInsert(
    html,
    /<meta\s+name=["']twitter:card["'][^>]*>/i,
    `<meta name="twitter:card" content="summary_large_image" />`
  );
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${description}" />`
  );
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${ogImage}" />`);

  return html;
};

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const writeHtmlForPath = (routePath, html) => {
  const clean = routePath.replace(/\/+$/, '') || '/';
  const outDir = clean === '/' ? distDir : path.join(distDir, clean.replace(/^\//, ''));
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
};

const main = () => {
  if (!fs.existsSync(distDir)) throw new Error('[prerender] dist/ not found. Run build first.');

  const baseIndexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(baseIndexHtmlPath)) throw new Error('[prerender] dist/index.html not found.');
  const baseHtml = fs.readFileSync(baseIndexHtmlPath, 'utf8');

  const paths = readSitemapPaths();
  let written = 0;

  for (const p of paths) {
    const seo = getSeoForPath(p);
    if (!seo) continue;
    const nextHtml = applySeoToHtml(baseHtml, seo);
    writeHtmlForPath(p, nextHtml);
    // eslint-disable-next-line no-console
    console.log(`[prerender] wrote ${p}`);
    written += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`[prerender] done (${written} pages)`);
};

main();
