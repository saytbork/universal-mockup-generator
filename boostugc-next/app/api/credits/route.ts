import { getFirestore } from '../_lib/firebaseAdmin';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const isAdminEmail = (email?: string) => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === 'boostugc@gmail.com' ||
    normalized === 'juanamisano@gmail.com' ||
    normalized.endsWith('@amisano-design.com') ||
    ADMIN_EMAILS.includes(normalized)
  );
};

export async function POST(req: Request) {
  const { uid, cost, amount, test, email } = await req.json();
  const resolvedUid = uid || email;
  const isTest = Boolean(test);
  const delta = typeof amount === 'number'
    ? amount
    : typeof cost === 'number'
      ? -Math.abs(cost)
      : null;

  if (!resolvedUid || delta === null) {
    return new Response(JSON.stringify({ error: 'Missing uid or amount' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (isTest && !isAdminEmail(email)) {
    return new Response(JSON.stringify({ error: 'Admin only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(resolvedUid);

    await db.runTransaction(async tx => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};
      const currentCredits = data.credits ?? 0;

      if (!isTest && delta < 0 && currentCredits < Math.abs(delta)) {
        throw new Error('NOT_ENOUGH_CREDITS');
      }

      const nextCredits = currentCredits + delta;

      tx.set(userRef, {
        credits: nextCredits,
        updatedAt: Date.now(),
      }, { merge: true });
    });

    return new Response(JSON.stringify({ ok: true, added: delta }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error?.message === 'NOT_ENOUGH_CREDITS') {
      return new Response(JSON.stringify({ error: 'Not enough credits' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('Error consuming credits', error);
    return new Response(JSON.stringify({ error: 'Unable to consume credits' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
