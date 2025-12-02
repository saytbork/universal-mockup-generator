import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../../services/firebaseAdmin.js';
import { checkAuth } from '../../server/lib/checkAuth.js';
import { FieldValue } from 'firebase-admin/firestore';

type GalleryPayload = {
  imageUrl: string;
  aspectRatio?: string;
  productMaterial?: string;
  planType: 'free' | 'invitation';
};

const ALLOWED_PLAN_TYPES = new Set(['free', 'invitation']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { imageUrl, aspectRatio, productMaterial, planType } = req.body as GalleryPayload;
  if (!imageUrl || typeof imageUrl !== 'string') {
    res.status(400).json({ error: 'Missing imageUrl' });
    return;
  }
  if (!planType || !ALLOWED_PLAN_TYPES.has(planType)) {
    res.status(400).json({ error: 'Invalid planType' });
    return;
  }

  try {
    const db = getFirestore();
    await db.collection('community_gallery').add({
      imageUrl,
      createdAt: FieldValue.serverTimestamp(),
      userId: email ?? null,
      planType,
      aspectRatio: typeof aspectRatio === 'string' ? aspectRatio : '',
      productMaterial: typeof productMaterial === 'string' ? productMaterial : '',
    });
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Failed to save community gallery image', error);
    res.status(500).json({ error: 'Unable to save community image' });
  }
}
