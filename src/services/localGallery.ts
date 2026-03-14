export type LocalGalleryEntry = {
  id: string;
  userId: string;
  imageUrl: string; // data URL (local) or public URL
  createdAt: number;
  plan?: string;
  width?: number;
  height?: number;
  promptPreview?: string;
  aspectRatio?: string;
};

const DB_NAME = 'ugc-local-gallery';
const DB_VERSION = 1;
const STORE = 'images';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('byUser', 'userId', { unique: false });
        store.createIndex('byCreatedAt', 'createdAt', { unique: false });
        store.createIndex('byUserCreatedAt', ['userId', 'createdAt'], { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

function generateId(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    // ignore
  }
  return `local-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export async function addLocalGalleryEntry(input: Omit<LocalGalleryEntry, 'id'> & { id?: string }) {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
  const userId = String(input.userId || '').trim().toLowerCase();
  if (!userId) return;
  const imageUrl = String(input.imageUrl || '').trim();
  if (!imageUrl) return;

  const createdAt = typeof input.createdAt === 'number' ? input.createdAt : Date.now();
  const id = input.id || generateId();

  const entry: LocalGalleryEntry = {
    id,
    userId,
    imageUrl,
    createdAt,
    plan: input.plan,
    width: input.width,
    height: input.height,
    promptPreview: input.promptPreview,
    aspectRatio: input.aspectRatio,
  };

  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(entry);
  await txDone(tx);
  db.close();
}

export async function listLocalGalleryEntries(userId: string, days = 30): Promise<LocalGalleryEntry[]> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return [];
  const normalized = String(userId || '').trim().toLowerCase();
  if (!normalized) return [];

  const threshold = Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000;
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const store = tx.objectStore(STORE);
  const index = store.index('byUserCreatedAt');
  const range = IDBKeyRange.bound([normalized, threshold], [normalized, Number.MAX_SAFE_INTEGER]);
  const request = index.getAll(range);
  const results = await requestToPromise<LocalGalleryEntry[]>(request);
  await txDone(tx);
  db.close();
  return Array.isArray(results) ? results.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)) : [];
}

export async function pruneLocalGallery(userId: string, days = 30, maxEntries = 120) {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
  const normalized = String(userId || '').trim().toLowerCase();
  if (!normalized) return;

  const entries = await listLocalGalleryEntries(normalized, days);
  const keep = new Set(entries.slice(0, Math.max(1, maxEntries)).map(e => e.id));

  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const index = store.index('byUser');
  const request = index.getAllKeys(normalized);
  const keys = await requestToPromise<IDBValidKey[]>(request);
  for (const key of keys) {
    const id = String(key);
    if (!keep.has(id)) {
      store.delete(id);
    }
  }
  await txDone(tx);
  db.close();
}

export async function deleteLocalGalleryEntry(id: string): Promise<void> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
  const key = String(id || '').trim();
  if (!key) return;
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(key);
  await txDone(tx);
  db.close();
}

export async function deleteLocalGalleryEntriesByImageUrl(
  userId: string,
  imageUrl: string
): Promise<number> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return 0;
  const normalized = String(userId || '').trim().toLowerCase();
  if (!normalized) return 0;
  const targetUrl = String(imageUrl || '').trim();
  if (!targetUrl) return 0;

  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const index = store.index('byUser');
  const entries = await requestToPromise<LocalGalleryEntry[]>(index.getAll(normalized));
  let deleted = 0;
  for (const entry of entries) {
    if (String(entry?.imageUrl || '') === targetUrl) {
      store.delete(String(entry.id));
      deleted += 1;
    }
  }
  await txDone(tx);
  db.close();
  return deleted;
}
