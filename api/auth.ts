import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail } from '../server/lib/sendEmail.js';
import { createMagicToken, verifyMagicToken } from '../server/lib/magicToken.js';
import { getStripe } from '../server/lib/stripeClient.js';
import { getUser, setUser, touchUserLogin } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';
import { checkAuth } from '../server/lib/checkAuth.js';
import { createSessionToken } from '../server/lib/session.js';
import { rateLimit } from '../server/lib/rateLimit.js';
import {
  rollbackTrialCouponRedemption,
  tryConsumeTrialCouponRedemption,
} from '../server/lib/trialCouponLimit.js';

const DASHBOARD_REDIRECT_PATH = '/app';
const DEFAULT_REGISTRATION_NOTIFY_EMAIL = 'juanamisano@gmail.com';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_INVITE_BONUS_CREDITS = 10;
const DEFAULT_TRIAL_COUPON_CODE = '2999';
const DEFAULT_TRIAL_COUPON_BONUS_CREDITS = 30;

const parseBonus = (value: string | undefined, fallback: number) => {
  const parsed = Number(value || fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString().toLowerCase() ?? '';
  }
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

const getRequestOrigin = (req: VercelRequest): string => {
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:3000';
  const normalizedHost = String(host || '').trim().toLowerCase();
  const vercelEnv = String(process.env.VERCEL_ENV || '').trim().toLowerCase();
  const isPreviewHost =
    normalizedHost === 'projects.vercel.app' ||
    normalizedHost.endsWith('.projects.vercel.app') ||
    normalizedHost.endsWith('.vercel.app');
  const envBase = process.env.BASE_URL?.trim();
  if (envBase && vercelEnv !== 'preview' && !isPreviewHost) {
    return envBase.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || (host.includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`.replace(/\/+$/, '');
};

const buildSessionCookie = (email: string, req: VercelRequest) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.headers.host?.includes('localhost') ? 'http' : 'https');
  const secureFlag = proto === 'https' ? '; Secure' : '';
  const token = createSessionToken(email);
  return `session_email=${encodeURIComponent(token)}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=604800`;
};

const clearSessionCookie = (req: VercelRequest) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.headers.host?.includes('localhost') ? 'http' : 'https');
  const secureFlag = proto === 'https' ? '; Secure' : '';
  return `session_email=; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=0`;
};

const getClientIp = (req: VercelRequest): string => {
  const xfwd = String(req.headers['x-forwarded-for'] || '').split(',')[0]?.trim();
  const realIp = String(req.headers['x-real-ip'] || '').trim();
  return xfwd || realIp || 'unknown';
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
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
        res.status(400).json({ error: 'Email required' });
        return;
      }

      const ip = getClientIp(req);
      const byIp = await rateLimit({ key: `auth-login-ip:${ip}`, max: 20, windowSeconds: 600, namespace: 'auth' });
      const byEmail = await rateLimit({
        key: `auth-login-email:${normalizedEmail}`,
        max: 6,
        windowSeconds: 600,
        namespace: 'auth',
      });
      if (!byIp.ok || !byEmail.ok) {
        res.status(429).json({ error: 'Too many attempts. Please try again in a few minutes.' });
        return;
      }
      const requiredCode = process.env.INVITATION_CODE;
      const trialCouponCode = process.env.TRIAL_COUPON_CODE || DEFAULT_TRIAL_COUPON_CODE;
      const inviteBonus = parseBonus(process.env.INVITATION_BONUS_CREDITS, DEFAULT_INVITE_BONUS_CREDITS);
      const trialCouponBonus = parseBonus(process.env.TRIAL_COUPON_BONUS_CREDITS, DEFAULT_TRIAL_COUPON_BONUS_CREDITS);
      const disposableDomains = ['mailinator.com', 'yopmail.com', '10minutemail', 'guerrillamail.com'];
      const domain = String(normalizedEmail).split('@')[1] || '';
      const isDisposable = disposableDomains.some((d) => domain.toLowerCase().includes(d));
      const normalizedCode = typeof invitationCode === 'string' ? invitationCode.trim() : '';
      const matchesRequired = Boolean(requiredCode && normalizedCode === requiredCode);
      const matchesTrialCoupon = normalizedCode === trialCouponCode;
      const isRecognizedCode = matchesRequired || matchesTrialCoupon;
      const shouldAllowMagicLinkCode = Boolean(isRecognizedCode && !isDisposable);
      const codeForToken = shouldAllowMagicLinkCode ? normalizedCode : undefined;

      const token = createMagicToken(normalizedEmail, codeForToken);
      const magicLink = `${origin}/api/auth?action=verify&token=${encodeURIComponent(token)}`;

      await sendEmail({
        to: normalizedEmail,
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
        Need help? Contact support from the in-app chat.
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
      const ip = getClientIp(req);
      const byIp = await rateLimit({ key: `auth-verify-ip:${ip}`, max: 40, windowSeconds: 600, namespace: 'auth' });
      if (!byIp.ok) {
        res.status(429).send('Too many attempts. Please try again in a few minutes.');
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
        const trialCouponCode = process.env.TRIAL_COUPON_CODE || DEFAULT_TRIAL_COUPON_CODE;
        const inviteBonus = parseBonus(process.env.INVITATION_BONUS_CREDITS, DEFAULT_INVITE_BONUS_CREDITS);
        const trialCouponBonus = parseBonus(process.env.TRIAL_COUPON_BONUS_CREDITS, DEFAULT_TRIAL_COUPON_BONUS_CREDITS);
        const disposableDomains = ['mailinator.com', 'yopmail.com', '10minutemail', 'guerrillamail.com'];
        const domain = email.split('@')[1] || '';
        const isDisposable = disposableDomains.some((d) => domain.toLowerCase().includes(d));
        const bonusCredits = invitationCode === trialCouponCode ? trialCouponBonus : inviteBonus;

        const shouldApplyBonus =
          Boolean(
            invitationCode &&
            !isDisposable &&
            (
              (requiredCode && invitationCode === requiredCode) ||
              invitationCode === trialCouponCode
            )
          );

        if (shouldApplyBonus) {
          const user = await getUser(email);
          const plan = String(user.plan ?? 'free').trim().toLowerCase();
          const alreadyClaimed = Boolean(user.inviteUsed);

          if (plan === 'free' && !alreadyClaimed) {
            const isTrialCoupon = invitationCode === trialCouponCode;
            if (isTrialCoupon) {
              const redemption = await tryConsumeTrialCouponRedemption(invitationCode);
              if (!redemption.ok) {
                // Coupon exhausted globally; proceed with login but skip bonus.
              } else {
                try {
                  await setUser(email, {
                    inviteRemaining: (user.inviteRemaining || 0) + bonusCredits,
                    inviteUsed: true,
                  });
                  await addActivity(email, 'invite', { bonus: bonusCredits, code: invitationCode });
                } catch (claimError) {
                  await rollbackTrialCouponRedemption(invitationCode);
                  throw claimError;
                }
              }
            } else {
              await setUser(email, {
                inviteRemaining: (user.inviteRemaining || 0) + bonusCredits,
                inviteUsed: true,
              });
              await addActivity(email, 'invite', { bonus: bonusCredits, code: invitationCode });
            }
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
