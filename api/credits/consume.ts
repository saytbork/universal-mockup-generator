import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../_lib/firebaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, cost } = req.body || {};
  if (!uid || typeof cost !== 'number') {
    return res.status(400).json({ error: 'Missing uid or cost' });
  }

  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async tx => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};
      const currentCredits = data.credits ?? 0;

      if (currentCredits < cost) {
        throw new Error('NOT_ENOUGH_CREDITS');
      }

      tx.update(userRef, {
        credits: currentCredits - cost,
        updatedAt: Date.now(),
      });
    });

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    if (error?.message === 'NOT_ENOUGH_CREDITS') {
      return res.status(400).json({ error: 'Not enough credits' });
    }
    console.error('Error consuming credits', error);
    return res.status(500).json({ error: 'Unable to consume credits' });
  }
}
