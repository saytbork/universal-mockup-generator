import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../../services/firebaseAdmin.js';

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
    const snap = await userRef.get();
    const data = snap.data() || {};
    const currentCredits = data.credits ?? 0;

    if (currentCredits < cost) {
      return res.status(400).json({ error: 'Not enough credits' });
    }

    await userRef.update({
      credits: currentCredits - cost,
      updatedAt: Date.now(),
    });

    return res.status(200).json({ ok: true, remaining: currentCredits - cost });
  } catch (error) {
    console.error('Error consuming credits', error);
    return res.status(500).json({ error: 'Unable to consume credits' });
  }
}
