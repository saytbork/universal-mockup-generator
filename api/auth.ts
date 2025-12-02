import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail } from '../server/lib/sendEmail.js';
import { createMagicToken, verifyMagicToken } from '../server/lib/magicToken.js';
import { getStripe } from '../server/lib/stripeClient.js';
import { getUser, setUser } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';
import { checkAuth } from '../server/lib/checkAuth.js';

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString().toLowerCase() ?? '';
  }
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req);

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
      const token = createMagicToken(email, invitationCode);
      const magicLink = `${process.env.BASE_URL ?? 'https://boostugc.app'}/api/auth?action=verify&token=${token}`;

      await sendEmail({
        to: email,
        subject: 'Your BoostUGC access link',
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
      <h2 style="color:#6D4AFF; margin-bottom: 16px;">Access your workspace</h2>
      <p>Click the button below to sign in to your BoostUGC workspace:</p>

      <p style="margin: 24px 0;">
        <a href="${magicLink}"
           style="display:inline-block; padding:12px 18px; background:#6D4AFF; color:#ffffff; text-decoration:none; border-radius:8px; font-size:16px;">
           Sign in to BoostUGC
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

      res.status(200).json({ ok: true });
      return;
    }
    case 'verify': {
      const token = req.query.token;
      if (!token || typeof token !== 'string') {
        res.status(400).send('Invalid or expired token');
        return;
      }

      const parsed = verifyMagicToken(token);
      if (!parsed) {
        res.status(400).send('Invalid or expired token');
        return;
      }

      const email = parsed.email;
      const invitationCode = parsed.invitationCode || null;

      res.setHeader('Set-Cookie', [
        `session_email=${encodeURIComponent(email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
      ]);

      try {
        const requiredCode = process.env.INVITATION_CODE;
        const disposableDomains = ['mailinator.com', 'yopmail.com', '10minutemail', 'guerrillamail.com'];
        const domain = email.split('@')[1] || '';
        const isDisposable = disposableDomains.some((d) => domain.toLowerCase().includes(d));

        const shouldApplyBonus =
          invitationCode && requiredCode && invitationCode === requiredCode && !isDisposable;

        if (shouldApplyBonus) {
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
            await setUser(email, { credits: (user.credits || 0) + 20, inviteUsed: true });
            await addActivity(email, 'invite', { bonus: 20 });
          }
        }
      } catch (error) {
        console.error('Invitation bonus error', error);
      }

      await addActivity(email, 'login', {});

      res.writeHead(302, { Location: 'https://boostugc.app/dashboard' });
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
        `session_email=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
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
