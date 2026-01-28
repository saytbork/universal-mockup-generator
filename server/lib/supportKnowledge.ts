import { PLAN_CONFIG, type PlanTier } from '../../src/constants/planConfig';
import { TOOLTIP_MAP } from '../../src/system/tooltipMap';
import { ALL_TOOLTIPS, MANDATORY_COPY } from '../../src/lib/ux/config';

export type SupportDoc = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const unique = (arr: string[]) => Array.from(new Set(arr));

const buildPlanDoc = (): SupportDoc => {
  const tiers = Object.keys(PLAN_CONFIG) as PlanTier[];
  const lines = [
    'Plans & limits (summary):',
    ...tiers.map(tier => {
      const plan = PLAN_CONFIG[tier];
      return `- ${plan.label} (${tier}): ${plan.description} (credit limit: ${plan.creditLimit})`;
    }),
    '',
    'Notes:',
    '- Credits limit how many generations/exports you can do.',
    '- Free plan includes watermark.',
    '- Some actions can cost more than 1 credit (e.g. multiple outputs/slots).',
  ];
  return { id: 'plans', title: 'Plans & credits', content: lines.join('\n'), tags: ['credits', 'plans', 'watermark'] };
};

const buildCreationModeDoc = (): SupportDoc => {
  const creationMode = TOOLTIP_MAP['Creation Mode'];
  const lines: string[] = [
    'Modes: Lifestyle vs Product (Studio)',
    '- Lifestyle: creates scenes with people + real environments (UGC / lifestyle content).',
    '- Product (Studio): focused product placement shots; person controls are typically disabled.',
    '',
    'Creation Mode options:',
  ];

  if (creationMode && typeof creationMode === 'object') {
    for (const [label, tip] of Object.entries(creationMode)) {
      lines.push(`- ${label}: ${tip}`);
    }
  }

  lines.push(
    '',
    'Raw Domestic UGC (when enabled):',
    `- ${MANDATORY_COPY.raw_ugc.intro}`,
    `- ${MANDATORY_COPY.raw_ugc.depth_locked}`
  );

  return {
    id: 'modes',
    title: 'Modes & creation modes',
    content: lines.join('\n'),
    tags: ['lifestyle', 'studio', 'product', 'creation mode', 'ugc'],
  };
};

const buildTooltipsDoc = (): SupportDoc => {
  const lines: string[] = ['Option tooltips (selected):'];

  const sortedKeys = Object.keys(TOOLTIP_MAP).filter(k => k !== 'Creation Mode').sort();
  for (const key of sortedKeys) {
    const entry = TOOLTIP_MAP[key];
    if (typeof entry === 'string') {
      lines.push(`- ${key}: ${entry}`);
    }
  }

  lines.push('', 'System tooltips (behavioral):');
  const sysKeys = Object.keys(ALL_TOOLTIPS).sort() as (keyof typeof ALL_TOOLTIPS)[];
  for (const key of sysKeys) {
    lines.push(`- ${key}: ${ALL_TOOLTIPS[key]}`);
  }

  return {
    id: 'tooltips',
    title: 'Option explanations',
    content: lines.join('\n'),
    tags: ['options', 'tooltips', 'explain'],
  };
};

const buildGettingStartedDoc = (): SupportDoc => ({
  id: 'getting-started',
  title: 'Getting started',
  tags: ['start', 'upload', 'generate', 'download'],
  content: [
    'Quick start:',
    '1) Sign in at /login (magic link).',
    '2) Go to /app.',
    '3) Upload a product image (required for most presets).',
    '4) Choose Lifestyle or Product (Studio), then pick a Creation Mode.',
    '5) Click Generate.',
    '6) Download/export once you like the result.',
    '',
    'Common blockers:',
    '- “Please upload a product image first.” → upload a product image.',
    '- “Not enough credits” → check your remaining credits / upgrade plan.',
  ].join('\n'),
});

const buildTroubleshootingDoc = (): SupportDoc => ({
  id: 'troubleshooting',
  title: 'Troubleshooting',
  tags: ['error', 'failed', 'download', 'export', 'login'],
  content: [
    'Sign-in issues:',
    '- Check Spam/Promotions for the magic link.',
    '- Open the link in the same browser/device and allow cookies.',
    '',
    'Generation failed:',
    '- Retry once, then disable VPN/ad blockers and refresh.',
    '',
    'Export/download issues:',
    '- Refresh, disable ad blockers, try another browser.',
  ].join('\n'),
});

export const SUPPORT_DOCS: SupportDoc[] = [
  buildGettingStartedDoc(),
  buildCreationModeDoc(),
  buildPlanDoc(),
  buildTooltipsDoc(),
  buildTroubleshootingDoc(),
];

type RetrievalOptions = {
  topK: number;
  maxChars: number;
};

export const retrieveSupportContext = (question: string, opts: RetrievalOptions) => {
  const q = normalize(question);
  if (!q) return { context: '', matchedDocIds: [] as string[] };
  const qWords = unique(q.split(' ').filter(w => w.length >= 3));
  const scoreDoc = (doc: SupportDoc) => {
    const hay = normalize(`${doc.title} ${doc.tags?.join(' ') ?? ''} ${doc.content}`);
    let score = 0;
    for (const w of qWords) {
      if (hay.includes(w)) score += 1;
    }
    return score;
  };

  const ranked = SUPPORT_DOCS
    .map(doc => ({ doc, score: scoreDoc(doc) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, opts.topK));

  const chunks: string[] = [];
  const matchedDocIds: string[] = [];

  for (const { doc } of ranked) {
    const chunk = `### ${doc.title}\n${doc.content}`.trim();
    chunks.push(chunk);
    matchedDocIds.push(doc.id);
  }

  const joined = chunks.join('\n\n');
  const context = joined.length > opts.maxChars ? joined.slice(0, opts.maxChars) : joined;
  return { context, matchedDocIds };
};

