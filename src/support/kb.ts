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
    keywords: [
      'login',
      'iniciar sesion',
      'iniciar sesión',
      'magic link',
      'link',
      'enlace',
      'correo',
      'email',
      'no llega',
      'no me llega',
      'no recibo',
      'no recibi',
      'spam',
      'promociones',
      'cookie',
      'cookies',
    ],
    answer:
      [
        'Si no podés entrar:',
        '1) Andá a /login y pedí el link de acceso por email.',
        '2) Revisá spam/promociones. Si no llega, reenviá y esperá 1–2 minutos.',
        '3) Abrí el link en el mismo navegador (y dispositivo) donde vas a usar la app.',
        '4) Permití cookies para este sitio (si estás en incógnito puede fallar).',
        '5) Si el link abre pero te vuelve a /login, probá recargar y después ir a /dashboard.',
      ].join('\n'),
  },
  {
    id: 'invite-code',
    title: 'Invitation Code (bonus +10)',
    keywords: ['invitation', 'invitation code', 'codigo invitacion', 'código invitación', 'invite', 'bonus', '10 credits', '+10', 'gift'],
    answer:
      [
        'El “Invitation Code” (en /login) es opcional y sirve para sumar +10 créditos en el plan Free.',
        '',
        'Tips:',
        '- Usá un email real (no temporales tipo mailinator/yopmail).',
        '- El bonus se aplica una sola vez por cuenta.',
        '- Si ya estás en plan pago, el código no aplica.',
      ].join('\n'),
  },
  {
    id: 'access-code',
    title: 'Código de acceso (redeem)',
    keywords: ['access code', 'codigo acceso', 'código acceso', 'redeem', 'canjear', 'checkout', 'receipt', 'recibo', 'email receipt'],
    answer:
      [
        'Si tenés un código de acceso, podés canjearlo desde la app:',
        '1) Entrá a /app',
        '2) Abrí “Plan / Upgrade”',
        '3) Pegá el código y confirmá',
        '',
        'Errores típicos:',
        '- “Invalid code”: el código no coincide.',
        '- “Code already used”: ya fue usado en esa cuenta.',
        '- “Only free plan”: ese código solo aplica al plan Free.',
      ].join('\n'),
  },
  {
    id: 'credits',
    title: 'Créditos y límites',
    keywords: [
      'creditos',
      'créditos',
      'credits',
      'limite',
      'límite',
      'plan',
      'free',
      'creator',
      'studio',
      'no credits',
      'sin creditos',
      'sin créditos',
      'remaining',
    ],
    answer:
      [
        'Los límites dependen del plan:',
        '- Free: 2 créditos (con watermark).',
        '- Creator: 20 créditos + 2 videos/mes (sin marca).',
        '- Studio: 60 créditos + 6 videos/mes (sin marca).',
        '',
        'Si ves “no credits” o “not enough credits”: te quedaste sin créditos o tu plan no alcanza para esa acción. Revisá /pricing.',
      ].join('\n'),
  },
  {
    id: 'watermark',
    title: '¿Por qué sale watermark?',
    keywords: ['watermark', 'marca de agua', 'marca', 'logo'],
    answer:
      [
        'En el plan Free las exportaciones llevan watermark.',
        'Para quitarlo: activá Creator o Studio desde /pricing o desde el modal de plan dentro de la app.',
      ].join('\n'),
  },
  {
    id: 'export',
    title: 'No puedo exportar / descargar',
    keywords: [
      'export',
      'exportar',
      'download',
      'descargar',
      'png',
      'jpeg',
      'jpg',
      'video',
      'mp4',
      'blank',
      'en blanco',
      'fallo',
      'error',
    ],
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
    keywords: [
      'pago',
      'pagos',
      'stripe',
      'suscripcion',
      'suscripción',
      'factura',
      'billing',
      'upgrade',
      'plan',
      'cancelar',
      'cancelación',
      'cancelacion',
    ],
    answer:
      [
        'Para cambiar de plan:',
        '- Entrá a /pricing o abrí el modal “Manage plan” desde /dashboard.',
        '',
        'Para cancelar/downgrade:',
        '- Cancelalo desde el email/recibo de Stripe (o el portal de Stripe si lo tenés).',
        '',
        'Si pagaste y no se refleja:',
        '- Confirmá que estás logueado con el mismo email de compra.',
      ].join('\n'),
  },
  {
    id: 'gallery',
    title: 'Galería / historial',
    keywords: ['galeria', 'galería', 'gallery', 'historial', 'history', 'no aparece', 'missing', 'borrar', 'delete'],
    answer:
      [
        'Si la galería no muestra imágenes:',
        '1) Probá /dashboard y revisá tu historial.',
        '2) Si cambiaste de navegador/dispositivo, el historial local puede no estar.',
        '3) Desactivá extensiones de privacidad/adblock y recargá.',
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
