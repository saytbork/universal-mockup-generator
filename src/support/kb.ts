export type SupportArticle = {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
};

export const SUPPORT_KB: SupportArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    keywords: ['start', 'getting started', 'how to use', 'how does it work', 'new', 'begin'],
    answer: [
      'Quick start:',
      '1) Sign in at `/login`.',
      '2) Go to `/app`.',
      '3) Upload a product image (required for most presets).',
      '4) Pick a style/preset and click Generate.',
      '5) Download/export when you like the result.',
    ].join('\n'),
  },
  {
    id: 'login',
    title: 'I can’t sign in',
    keywords: [
      'login',
      'sign in',
      'signin',
      'log in',
      'magic link',
      'link',
      'email',
      'not received',
      'did not receive',
      "didn't receive",
      'not getting',
      'spam',
      'cookies',
      'logged out',
      'session',
    ],
    answer: [
      'If you can’t sign in:',
      '1) Go to `/login` and request a magic link.',
      '2) Check Spam/Promotions. If it doesn’t arrive, resend and wait 1–2 minutes.',
      '3) Open the link in the same browser + device you will use.',
      '4) Allow cookies for this site (incognito can break sessions).',
      '5) If the link opens but you still look logged out, refresh and then go to `/dashboard`.',
    ].join('\n'),
  },
  {
    id: 'invite-code',
    title: 'Invitation code (+10 credits)',
    keywords: ['invitation', 'invitation code', 'invite', 'bonus', '10 credits', '+10', 'gift'],
    answer: [
      'The “Invitation Code” on `/login` is optional and adds +10 credits to the Free plan.',
      '',
      'Notes:',
      '- Use a real email (no temporary inboxes).',
      '- The bonus applies once per account.',
      '- It does not apply if you are already on a paid plan.',
    ].join('\n'),
  },
  {
    id: 'access-code',
    title: 'Upgrade / access code (redeem)',
    keywords: ['access code', 'upgrade code', 'redeem', 'checkout', 'receipt', 'email receipt'],
    answer: [
      'To redeem an upgrade/access code:',
      '1) Go to `/app`',
      '2) Open “Manage plan”',
      '3) Paste the code and click Apply',
      '',
      'Common errors:',
      '- “Invalid code”: the code does not match.',
      '- “Code already used”: already redeemed for that account.',
      '- “Only free plan”: this code only applies to Free.',
    ].join('\n'),
  },
  {
    id: 'credits',
    title: 'Credits & limits',
    keywords: ['credits', 'limit', 'plan', 'free', 'creator', 'studio', 'no credits', 'remaining', 'not enough'],
    answer: [
      'Limits depend on your plan:',
      '- Free: 2 credits (watermark).',
      '- Creator: 20 credits + 2 videos/month (no watermark).',
      '- Studio: 60 credits + 6 videos/month (no watermark).',
      '',
      'Note: some actions can cost more than 1 credit (e.g. multiple outputs/slots).',
    ].join('\n'),
  },
  {
    id: 'watermark',
    title: 'Why is there a watermark?',
    keywords: ['watermark', 'logo', 'brand mark'],
    answer: [
      'On the Free plan, exports include a watermark.',
      'To remove it, upgrade to Creator or Studio from `/pricing` or the “Manage plan” modal.',
    ].join('\n'),
  },
  {
    id: 'upload',
    title: 'Upload / product image required',
    keywords: ['upload', 'product image', 'no product', 'please upload', 'required', 'missing image'],
    answer: [
      'Most flows require a product image first.',
      'If you see “Please upload a product image first.”:',
      '1) Upload a clear product shot (front-facing, good lighting).',
      '2) Try PNG/JPG, under ~10MB.',
      '3) If it still fails, try another browser or disable ad blockers.',
    ].join('\n'),
  },
  {
    id: 'generation-failed',
    title: 'Generation failed',
    keywords: ['generation failed', 'failed', 'error', '500', 'network', 'failed to fetch'],
    answer: [
      'If generation fails:',
      '1) Retry once (temporary network issues happen).',
      '2) Disable VPN/ad blockers and refresh.',
      '3) If you pasted an API key, re-check it (or remove & re-add).',
      '4) If it keeps failing, tell support the exact error text and the time it happened.',
    ].join('\n'),
  },
  {
    id: 'export',
    title: 'Export / download issues',
    keywords: ['export', 'download', 'png', 'jpeg', 'jpg', 'video', 'mp4', 'blank', 'error', 'failed'],
    answer: [
      'If download fails:',
      '1) Refresh the page and try again.',
      '2) Try another browser or disable ad blockers for this site.',
      '3) If the file is blank, tell us which preset you used and whether you uploaded a reference image.',
    ].join('\n'),
  },
  {
    id: 'billing',
    title: 'Billing / subscription',
    keywords: ['stripe', 'billing', 'upgrade', 'plan', 'cancel', 'invoice', 'receipt'],
    answer: [
      'To change your plan:',
      '- Go to `/pricing` or open “Manage plan” from `/dashboard`.',
      '',
      'To cancel/downgrade:',
      '- Use the Stripe receipt email or Stripe portal (if available).',
      '',
      'If you paid but it does not reflect:',
      '- Make sure you are logged in with the same purchase email.',
    ].join('\n'),
  },
  {
    id: 'gallery',
    title: 'Gallery / history',
    keywords: ['gallery', 'history', 'missing', 'delete', 'remove'],
    answer: [
      'If your gallery is missing images:',
      '1) Go to `/dashboard` and check your history.',
      '2) If you switched browser/device, local history may not be there.',
      '3) Disable privacy/adblock extensions and refresh.',
    ].join('\n'),
  },
];

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const answerFromKb = (question: string) => {
  const q = normalize(question);
  if (!q) return null;

  let best: { score: number; article: SupportArticle } | null = null;

  for (const article of SUPPORT_KB) {
    const keys = article.keywords.map(normalize);
    let score = 0;
    for (const key of keys) {
      if (!key) continue;
      if (q.includes(key)) score += Math.min(5, Math.max(1, key.split(' ').length));
    }
    if (!best || score > best.score) {
      best = { score, article };
    }
  }

  if (!best || best.score <= 0) return null;
  return best.article.answer;
};
