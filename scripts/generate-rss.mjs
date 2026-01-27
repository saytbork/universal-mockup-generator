import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const SITE_URL = process.env.SITE_URL || 'https://perfectmockup.com';

const blogDir = path.join(repoRoot, 'src', 'content', 'blog');

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

const escapeXml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');

const normalizeUrl = (base, pathname) => {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = `/${String(pathname || '').replace(/^\/+/, '')}`;
  return `${cleanBase}${cleanPath}`;
};

const entries = fs
  .readdirSync(blogDir, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.json'))
  .map((e) => path.join(blogDir, e.name))
  .map((filePath) => readJson(filePath))
  .filter((post) => post && typeof post.slug === 'string');

// Keep deterministic order if possible (mirrors app ordering when present).
entries.sort((a, b) => String(a.slug).localeCompare(String(b.slug)));

const itemsXml = entries
  .map((post) => {
    const link = normalizeUrl(SITE_URL, `/blog/${post.slug}`);
    const title = escapeXml(post.title);
    const description = escapeXml(post.seo?.description || post.subtitle || '');
    return [
      '  <item>',
      `    <title>${title}</title>`,
      `    <link>${link}</link>`,
      `    <guid isPermaLink=\"true\">${link}</guid>`,
      `    <description>${description}</description>`,
      '  </item>',
    ].join('\n');
  })
  .join('\n');

const now = new Date().toUTCString();
const channel = [
  ' <channel>',
  `  <title>Perfect Mockup Blog</title>`,
  `  <link>${normalizeUrl(SITE_URL, '/blog')}</link>`,
  `  <description>Guides, tutorials, and AI insights for ecommerce product visuals.</description>`,
  `  <lastBuildDate>${now}</lastBuildDate>`,
  itemsXml,
  ' </channel>',
].join('\n');

const rss = [
  '<?xml version=\"1.0\" encoding=\"UTF-8\"?>',
  '<rss version=\"2.0\">',
  channel,
  '</rss>',
  '',
].join('\n');

const outPath = path.join(repoRoot, 'public', 'rss.xml');
fs.writeFileSync(outPath, rss, 'utf8');
console.log(`[rss] wrote ${outPath} (${entries.length} items)`);

