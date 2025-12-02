import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';
import { checkAuth } from '../../server/lib/checkAuth.js';

type GalleryPayload = {
  imageUrl: string;
  aspectRatio?: string;
  productMaterial?: string;
  planType: 'free' | 'invitation' | 'creator' | 'studio';
};

const ALLOWED_PLAN_TYPES = new Set(['free', 'invitation', 'creator', 'studio']);

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

  const entry = {
    id: randomUUID(),
    url: imageUrl.trim(),
    plan: planType,
    createdAt: Date.now(),
    userId: email,
    aspectRatio: typeof aspectRatio === 'string' ? aspectRatio : '',
    productMaterial: typeof productMaterial === 'string' ? productMaterial : '',
  };

  try {
    await kv.rpush('community_gallery', JSON.stringify(entry));
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Failed to save community gallery image', error);
    res.status(500).json({ error: 'Unable to save community image' });
  }
}
