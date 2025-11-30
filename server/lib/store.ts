import { kv } from "@vercel/kv";

export type UserRecord = {
  plan?: string | null;
  credits: number;
  inviteUsed?: boolean;
  updatedAt: number;
};

const memoryStore = new Map<string, UserRecord>();
const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const userKey = (email: string) => `user:${email}`;

const defaultUser = (): UserRecord => ({
  plan: null,
  credits: 0,
  inviteUsed: false,
  updatedAt: Date.now(),
});

export const getUser = async (email: string): Promise<UserRecord> => {
  if (hasKV) {
    const stored = await kv.get<UserRecord>(userKey(email));
    if (stored) return stored;
    const fresh = defaultUser();
    await kv.set(userKey(email), fresh);
    return fresh;
  }
  const existing = memoryStore.get(email);
  if (existing) return existing;
  const fresh = defaultUser();
  memoryStore.set(email, fresh);
  return fresh;
};

export const setUser = async (email: string, data: Partial<UserRecord>) => {
  const current = await getUser(email);
  const next = { ...current, ...data, updatedAt: Date.now() };
  if (hasKV) {
    await kv.set(userKey(email), next);
  } else {
    memoryStore.set(email, next);
  }
  return next;
};
