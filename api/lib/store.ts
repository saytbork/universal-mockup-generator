type UserRecord = {
  plan?: string | null;
  credits: number;
  updatedAt: number;
};

const memoryStore = new Map<string, UserRecord>();

export const getUser = (email: string): UserRecord => {
  const existing = memoryStore.get(email);
  if (existing) return existing;
  const fresh: UserRecord = { plan: null, credits: 20, updatedAt: Date.now() };
  memoryStore.set(email, fresh);
  return fresh;
};

export const setUser = (email: string, data: Partial<UserRecord>) => {
  const current = getUser(email);
  const next = { ...current, ...data, updatedAt: Date.now() };
  memoryStore.set(email, next);
  return next;
};
