import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const SITE_URL = process.env.SITE_URL || 'https://perfectmockup.com';

const CONTENT_DIRS = [
  { dir: path.join(repoRoot, 'src', 'content', 'blog'), prefix: '/blog' },
  { dir: path.join(repoRoot, 'src', 'content', 'guides'), prefix: '/guides' },
];

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

const getSlugsFromDir = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => path.join(dirPath, e.name))
    .map((filePath) => {
      const json = readJson(filePath);
      return typeof json.slug === 'string' ? json.slug.trim() : '';
    })
    .filter(Boolean);
};

const normalizeUrl = (base, pathname) => {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = `/${String(pathname || '').replace(/^\/+/, '')}`;
  return `${cleanBase}${cleanPath}`;
};

const nowIso = new Date().toISOString();

const urls = new Set();

// Core marketing routes (React Router)
[
  '/',
  '/use-cases',
  '/comparisons',
  '/blog',
  '/guides',
  '/faq',
  '/terms',
  '/privacy',
].forEach((p) => urls.add(normalizeUrl(SITE_URL, p)));

// Content routes
for (const { dir, prefix } of CONTENT_DIRS) {
  const slugs = getSlugsFromDir(dir);
  for (const slug of slugs) {
    urls.add(normalizeUrl(SITE_URL, `${prefix}/${slug}`));
  }
}

const urlEntries = Array.from(urls)
  .sort()
  .map((loc) => {
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${nowIso}</lastmod>`,
      '  </url>',
    ].join('\n');
  })
  .join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlEntries,
  '</urlset>',
  '',
].join('\n');

const outPath = path.join(repoRoot, 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log(`[sitemap] wrote ${outPath} (${urls.size} urls)`);

