import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail } from '../server/lib/sendEmail.js';
import { createMagicToken, verifyMagicToken } from '../server/lib/magicToken.js';
import { getStripe } from '../server/lib/stripeClient.js';
import { getUser, setUser, touchUserLogin } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';
import { checkAuth } from '../server/lib/checkAuth.js';

const DASHBOARD_REDIRECT_PATH = '/dashboard';
const DEFAULT_REGISTRATION_NOTIFY_EMAIL = 'juanamisano@gmail.com';

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString().toLowerCase() ?? '';
  }
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

const getRequestOrigin = (req: VercelRequest): string => {
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:3000';
  const proto = (req.headers['x-forwarded-proto'] as string) || (host.includes('localhost') ? 'http' : 'https');
  const requestOrigin = `${proto}://${host}`.replace(/\/+$/, '');
  const envBase = process.env.BASE_URL?.trim();
  if (envBase) {
    // Keep BASE_URL as fallback only when request host is unavailable or localhost.
    if (!host || host.includes('localhost')) {
      return envBase.replace(/\/+$/, '');
    }
  }
  return requestOrigin;
};

const buildSessionCookie = (email: string, req: VercelRequest) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.headers.host?.includes('localhost') ? 'http' : 'https');
  const secureFlag = proto === 'https' ? '; Secure' : '';
  return `session_email=${encodeURIComponent(email)}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=604800`;
};

const clearSessionCookie = (req: VercelRequest) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.headers.host?.includes('localhost') ? 'http' : 'https');
  const secureFlag = proto === 'https' ? '; Secure' : '';
  return `session_email=; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=0`;
};

const sendRegistrationNotification = async (newUserEmail: string, origin: string) => {
  const notifyEmail = (process.env.REGISTRATION_NOTIFY_EMAIL || DEFAULT_REGISTRATION_NOTIFY_EMAIL).trim();
  if (!notifyEmail) return;
  await sendEmail({
    to: notifyEmail,
    subject: `New user registered: ${newUserEmail}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="margin-bottom: 12px;">New registration</h2>
        <p><strong>Email:</strong> ${newUserEmail}</p>
        <p><strong>App:</strong> ${origin}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      </div>
    `,
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req);
  const origin = getRequestOrigin(req);

  switch (action) {
    case 'login': {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end();
        return;
      }
      const { email, invitationCode } = req.body || {};
      if (!email) {
        res.status(400).json({ error: 'Email required' });
        return;
      }
      const requiredCode = process.env.INVITATION_CODE;
      const disposableDomains = ['mailinator.com', 'yopmail.com', '10minutemail', 'guerrillamail.com'];
      const domain = String(email).split('@')[1] || '';
      const isDisposable = disposableDomains.some((d) => domain.toLowerCase().includes(d));
      const normalizedCode = typeof invitationCode === 'string' ? invitationCode.trim() : '';
      const shouldAutoLogin =
        Boolean(normalizedCode && requiredCode && normalizedCode === requiredCode && !isDisposable);

      if (shouldAutoLogin) {
        const loginEvent = await touchUserLogin(email);
        res.setHeader('Set-Cookie', [
          buildSessionCookie(email, req),
        ]);

        try {
          const stripe = getStripe();
          const customers = await stripe.customers.list({ email, limit: 1 });
          const existing = customers.data[0];
          const customer =
            existing ||
            (await stripe.customers.create({
              email,
              metadata: {},
            }));

          const metadata = customer.metadata || {};
          const alreadyClaimed = metadata.invite_bonus_claimed === 'true';

          if (!alreadyClaimed) {
            await stripe.customers.update(customer.id, {
              metadata: { ...metadata, invite_bonus_claimed: 'true' },
            });
            const user = await getUser(email);
            const plan = String(user.plan ?? 'free').trim().toLowerCase();
            if (plan === 'free') {
              await setUser(email, {
                inviteRemaining: (user.inviteRemaining || 0) + 10,
                inviteUsed: true,
              });
              await addActivity(email, 'invite', { bonus: 10 });
            }
          }
        } catch (error) {
          console.error('Invitation bonus error', error);
        }

        await addActivity(email, 'login', { method: 'invite_auto' });
        if (loginEvent.isNew) {
          try {
            await sendRegistrationNotification(email, origin);
          } catch (notifyError) {
            console.warn('Registration notification failed', notifyError);
          }
        }
        res.status(200).json({ ok: true, autoLoggedIn: true, redirect: DASHBOARD_REDIRECT_PATH });
        return;
      }

      const token = createMagicToken(email, invitationCode);
      const magicLink = `${origin}/api/auth?action=verify&token=${encodeURIComponent(token)}`;

      await sendEmail({
        to: email,
        subject: 'Your Perfect Mockup access link',
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
      <h2 style="color:#6D4AFF; margin-bottom: 16px;">Access your workspace</h2>
      <p>Click the button below to sign in to your Perfect Mockup workspace:</p>

      <p style="margin: 24px 0;">
        <a href="${magicLink}"
           style="display:inline-block; padding:12px 18px; background:#6D4AFF; color:#ffffff; text-decoration:none; border-radius:8px; font-size:16px;">
           Sign in to Perfect Mockup
        </a>
      </p>

      <p>If the button does not work, copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;">${magicLink}</p>

      <hr style="margin: 32px 0; border: 0; border-top: 1px solid #ddd;" />

      <p style="font-size: 13px; color:#666;">
        If you did not request this email, you can safely ignore it.<br>
        Need help? Contact our support at
        <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color:#6D4AFF;">${process.env.SUPPORT_EMAIL}</a>.
      </p>
    </div>
  `,
      });

      res.status(200).json({ ok: true, autoLoggedIn: false });
      return;
    }
    case 'verify': {
      const token = req.query.token;
      if (!token || typeof token !== 'string') {
        res.status(400).send('Invalid or expired token');
        return;
      }

      let parsed: ReturnType<typeof verifyMagicToken> = null;
      try {
        parsed = verifyMagicToken(token);
      } catch (error) {
        console.error('Magic token verification error', error);
        parsed = null;
      }
      if (!parsed) {
        res.status(400).send('Invalid or expired token');
        return;
      }

      const email = parsed.email;
      const invitationCode = parsed.invitationCode || null;
      const loginEvent = await touchUserLogin(email);

      res.setHeader('Set-Cookie', [
        buildSessionCookie(email, req),
      ]);

      try {
        const requiredCode = process.env.INVITATION_CODE;
        const disposableDomains = ['mailinator.com', 'yopmail.com', '10minutemail', 'guerrillamail.com'];
        const domain = email.split('@')[1] || '';
        const isDisposable = disposableDomains.some((d) => domain.toLowerCase().includes(d));

        const shouldApplyBonus =
          invitationCode && !isDisposable && (!requiredCode || invitationCode === requiredCode);

        if (shouldApplyBonus) {
          const user = await getUser(email);
          const plan = String(user.plan ?? 'free').trim().toLowerCase();
          const alreadyClaimed = Boolean(user.inviteUsed);

          if (plan === 'free' && !alreadyClaimed) {
            await setUser(email, {
              inviteRemaining: (user.inviteRemaining || 0) + 10,
              inviteUsed: true,
            });
            await addActivity(email, 'invite', { bonus: 10 });
          }

          // Best-effort: keep Stripe metadata in sync if Stripe is configured.
          try {
            const stripe = getStripe();
            const customers = await stripe.customers.list({ email, limit: 1 });
            const existing = customers.data[0];
            const customer =
              existing ||
              (await stripe.customers.create({
                email,
                metadata: {},
              }));

            const metadata = customer.metadata || {};
            if (metadata.invite_bonus_claimed !== 'true') {
              await stripe.customers.update(customer.id, {
                metadata: { ...metadata, invite_bonus_claimed: 'true' },
              });
            }
          } catch (stripeError) {
            console.warn('Invitation bonus stripe sync skipped', stripeError);
          }
        }
      } catch (error) {
        console.error('Invitation bonus error', error);
      }

      await addActivity(email, 'login', {});
      if (loginEvent.isNew) {
        try {
          await sendRegistrationNotification(email, origin);
        } catch (notifyError) {
          console.warn('Registration notification failed', notifyError);
        }
      }

      res.writeHead(302, { Location: `${origin}${DASHBOARD_REDIRECT_PATH}` });
      res.end();
      return;
    }
    case 'logout': {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end();
        return;
      }

      const email = checkAuth(req);
      res.setHeader('Set-Cookie', [
        clearSessionCookie(req),
      ]);
      if (email) {
        await addActivity(email, 'logout', {});
      }
      res.status(200).json({ ok: true });
      return;
    }
    default:
      res.status(400).json({ error: 'Missing or invalid action' });
  }
}
