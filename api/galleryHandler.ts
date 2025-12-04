import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/admin';

type GalleryMeta = {
  width?: number;
  height?: number;
  modelReferenceUsed?: boolean;
  productsUsed?: number;
};

type ListEntry = {
  id: string;
  imageUrl: string;
  userId: string;
  plan: string;
  createdAt: string | Date;
  width?: number;
  height?: number;
  modelReferenceUsed?: boolean;
  productsUsed?: number;
};

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString().toLowerCase() ?? '';
  }
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req);
  try {
    if (!db) {
      throw new Error('Firebase configuration is missing');
    }
    switch (action) {
      case 'add': {
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }
        const { imageUrl, userId, plan, meta } = req.body || {};
        if (!imageUrl || typeof imageUrl !== 'string') {
          res.status(400).json({ error: 'Missing imageUrl' });
          return;
        }
        if (!userId || typeof userId !== 'string') {
          res.status(400).json({ error: 'Missing userId' });
          return;
        }
        if (!plan || typeof plan !== 'string') {
          res.status(400).json({ error: 'Missing plan' });
          return;
        }
        const docRef = await addDoc(collection(db, 'gallery'), {
          imageUrl: imageUrl.trim(),
          userId,
          plan,
          createdAt: serverTimestamp(),
          width: meta?.width,
          height: meta?.height,
          modelReferenceUsed: meta?.modelReferenceUsed,
          productsUsed: meta?.productsUsed,
        });
        res.status(201).json({ id: docRef.id });
        return;
      }
      case 'list': {
        if (req.method !== 'GET') {
          res.setHeader('Allow', 'GET');
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }
        const snapshot = await getDocs(
          query(
            collection(db, 'gallery'),
            orderBy('createdAt', 'desc'),
            limit(200)
          )
        );
        const images: ListEntry[] = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<ListEntry, 'id'>;
          return {
            id: doc.id,
            imageUrl: data.imageUrl,
            userId: data.userId,
            plan: data.plan,
            createdAt: data.createdAt ?? null,
            width: data.width,
            height: data.height,
            modelReferenceUsed: data.modelReferenceUsed,
            productsUsed: data.productsUsed,
          };
        });
        res.status(200).json({ images });
        return;
      }
      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('Gallery handler error', error);
    if (error.message.includes('Firebase configuration')) {
      res.status(500).json({ error: 'Firebase is not configured' });
      return;
    }
    res.status(500).json({ error: error?.message ?? 'Internal server error' });
  }
}
