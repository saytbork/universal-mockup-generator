export type SupportArticle = {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
};

export const SUPPORT_KB: SupportArticle[] = [
  {
    id: 'login',
    title: 'No puedo iniciar sesión',
    keywords: ['login', 'iniciar sesión', 'codigo', 'código', 'email', 'correo', 'verificación', 'verification'],
    answer:
      [
        'Si no podés entrar:',
        '1) Andá a /login y pedí el código por email.',
        '2) Revisá spam/promociones. Si no llega, probá reenviar y esperá 1–2 minutos.',
        '3) Si estás en modo incógnito, asegurate de permitir cookies para este sitio.',
        '4) Si sigue fallando, decime qué error te aparece y con qué email (sin reenviar el código).',
      ].join('\n'),
  },
  {
    id: 'credits',
    title: 'Créditos y límites',
    keywords: ['creditos', 'créditos', 'credits', 'limite', 'límite', 'plan', 'free', 'trial'],
    answer:
      [
        'Los límites dependen del plan:',
        '- En el plan gratis, suele haber créditos limitados y algunas exportaciones con watermark.',
        '- En planes pagos, los créditos se renuevan según tu suscripción.',
        '',
        'Tip: si te aparece “no credits remaining”, revisá /pricing.',
      ].join('\n'),
  },
  {
    id: 'watermark',
    title: '¿Por qué sale watermark?',
    keywords: ['watermark', 'marca de agua', 'marca', 'logo'],
    answer:
      [
        'El watermark aparece cuando estás en el plan gratis o en una exportación sin upgrade.',
        'Para quitarlo: revisá /pricing y activá un plan pago.',
      ].join('\n'),
  },
  {
    id: 'export',
    title: 'No puedo exportar / descargar',
    keywords: ['export', 'exportar', 'download', 'descargar', 'png', 'jpeg', 'jpg', 'video', 'mp4'],
    answer:
      [
        'Si la descarga falla:',
        '1) Probá recargar la página y reintentar.',
        '2) Probá otro navegador o desactivá adblock para este sitio.',
        '3) Si el archivo queda en blanco, contame qué preset usaste y si subiste una imagen de referencia.',
      ].join('\n'),
  },
  {
    id: 'billing',
    title: 'Pagos / Suscripción',
    keywords: ['pago', 'pagos', 'stripe', 'suscripcion', 'suscripción', 'factura', 'billing', 'portal'],
    answer:
      [
        'Para cambiar o cancelar tu plan:',
        '- Entrá a /pricing y usá el botón de tu plan.',
        '- Si ya pagaste y no se refleja, decime el email de compra (sin datos de tarjeta).',
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

