export type UserRecord = {
  plan?: string | null;
  credits: number;
  trialRemaining: number;
  inviteRemaining: number;
  subscriptionRemaining: number;
  inviteUsed?: boolean;
  trialUsed?: boolean;
  updatedAt: number;
};

const memoryStore = new Map<string, UserRecord>();
const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const userKey = (email: string) => `user:${email}`;

const getKv = async () => {
  const mod = await import("@vercel/kv");
  return mod.kv;
};

const defaultUser = (): UserRecord => ({
  plan: 'free',
  credits: 2,
  trialRemaining: 2,
  inviteRemaining: 0,
  subscriptionRemaining: 0,
  inviteUsed: false,
  trialUsed: false,
  updatedAt: Date.now(),
});

const normalizePlan = (plan?: string | null): string => {
  const raw = String(plan ?? '').trim().toLowerCase();
  return raw || 'free';
};

const computeEffectiveCredits = (user: UserRecord): number => {
  const plan = normalizePlan(user.plan);
  if (plan !== 'free') {
    return Math.max(0, Number(user.subscriptionRemaining || 0));
  }
  return Math.max(0, Number(user.trialRemaining || 0) + Number(user.inviteRemaining || 0));
};

const normalizeUserRecord = (input: UserRecord | any): UserRecord => {
  const plan = normalizePlan(input?.plan);
  const hasBuckets =
    typeof input?.trialRemaining === 'number' ||
    typeof input?.inviteRemaining === 'number' ||
    typeof input?.subscriptionRemaining === 'number';

  const legacyCredits = Number(input?.credits ?? 0);
  let trialRemaining = hasBuckets ? Number(input?.trialRemaining ?? 0) : (plan === 'free' ? Math.min(2, legacyCredits || 2) : 0);
  let inviteRemaining = hasBuckets ? Number(input?.inviteRemaining ?? 0) : (plan === 'free' ? Math.max(legacyCredits - trialRemaining, 0) : 0);
  let subscriptionRemaining = hasBuckets ? Number(input?.subscriptionRemaining ?? 0) : (plan !== 'free' ? Math.max(legacyCredits, 0) : 0);

  trialRemaining = Number.isFinite(trialRemaining) ? Math.max(0, trialRemaining) : 0;
  inviteRemaining = Number.isFinite(inviteRemaining) ? Math.max(0, inviteRemaining) : 0;
  subscriptionRemaining = Number.isFinite(subscriptionRemaining) ? Math.max(0, subscriptionRemaining) : 0;

  const normalized: UserRecord = {
    plan,
    credits: 0,
    trialRemaining,
    inviteRemaining,
    subscriptionRemaining,
    inviteUsed: Boolean(input?.inviteUsed) || inviteRemaining > 0,
    trialUsed: Boolean(input?.trialUsed) || trialRemaining <= 0,
    updatedAt: Number(input?.updatedAt ?? Date.now()),
  };

  normalized.credits = computeEffectiveCredits(normalized);
  return normalized;
};

export const getUser = async (email: string): Promise<UserRecord> => {
  if (hasKV) {
    const kv = await getKv();
    const stored = await kv.get<UserRecord>(userKey(email));
    if (stored) {
      const normalized = normalizeUserRecord(stored);
      if (JSON.stringify(normalized) !== JSON.stringify(stored)) {
        await kv.set(userKey(email), normalized);
      }
      return normalized;
    }
    const fresh = defaultUser();
    await kv.set(userKey(email), fresh);
    return fresh;
  }
  const existing = memoryStore.get(email);
  if (existing) return normalizeUserRecord(existing);
  const fresh = defaultUser();
  memoryStore.set(email, fresh);
  return fresh;
};

export const setUser = async (email: string, data: Partial<UserRecord>) => {
  const current = await getUser(email);
  const next = normalizeUserRecord({ ...current, ...data, updatedAt: Date.now() });
  if (hasKV) {
    const kv = await getKv();
    await kv.set(userKey(email), next);
  } else {
    memoryStore.set(email, next);
  }
  return next;
};

export const getEffectiveCredits = (user: UserRecord): number => computeEffectiveCredits(user);

export const consumeCredit = async (email: string): Promise<{
  ok: boolean;
  bucket?: 'trial' | 'invite' | 'subscription';
  remaining?: number;
  trialRemaining?: number;
  inviteRemaining?: number;
  subscriptionRemaining?: number;
  plan?: string;
}> => {
  if (hasKV) {
    const kv = await getKv();
    const script = `
      local key = KEYS[1]
      local userJson = redis.call("GET", key)
      if not userJson then return {err="NO_USER"} end
      local user = cjson.decode(userJson)
      local plan = user.plan
      if plan == nil or plan == '' then plan = 'free' end
      local function dec(field)
        local val = tonumber(user[field] or 0)
        if val > 0 then
          user[field] = val - 1
          return field
        end
        return nil
      end
      local consumed = nil
      if plan ~= 'free' then
        consumed = dec('subscriptionRemaining')
      else
        consumed = dec('trialRemaining')
        if not consumed then consumed = dec('inviteRemaining') end
      end
      local trial = tonumber(user.trialRemaining or 0)
      local invite = tonumber(user.inviteRemaining or 0)
      local sub = tonumber(user.subscriptionRemaining or 0)
      local remaining = plan ~= 'free' and sub or (trial + invite)
      if not consumed then
        return {0, remaining, trial, invite, sub, plan}
      end
      user.updatedAt = tonumber(ARGV[1])
      user.trialUsed = (trial <= 0)
      user.inviteUsed = user.inviteUsed or (invite > 0)
      user.credits = remaining
      redis.call("SET", key, cjson.encode(user))
      return {1, consumed, remaining, trial, invite, sub, plan}
    `;
    const now = Date.now();
    const result = await kv.eval<number[] | string[]>(script, [userKey(email)], [String(now)]);
    if (!Array.isArray(result)) {
      return { ok: false };
    }
    if (Number(result[0]) !== 1) {
      return {
        ok: false,
        remaining: Number(result[1] ?? 0),
        trialRemaining: Number(result[2] ?? 0),
        inviteRemaining: Number(result[3] ?? 0),
        subscriptionRemaining: Number(result[4] ?? 0),
        plan: String(result[5] ?? 'free'),
      };
    }
    const bucketRaw = String(result[1] ?? '');
    const bucket =
      bucketRaw === 'trialRemaining' ? 'trial' : bucketRaw === 'inviteRemaining' ? 'invite' : 'subscription';
    return {
      ok: true,
      bucket,
      remaining: Number(result[2] ?? 0),
      trialRemaining: Number(result[3] ?? 0),
      inviteRemaining: Number(result[4] ?? 0),
      subscriptionRemaining: Number(result[5] ?? 0),
      plan: String(result[6] ?? 'free'),
    };
  }

  const user = await getUser(email);
  const plan = normalizePlan(user.plan);
  let bucket: 'trial' | 'invite' | 'subscription' | null = null;
  if (plan !== 'free') {
    if (user.subscriptionRemaining > 0) {
      user.subscriptionRemaining -= 1;
      bucket = 'subscription';
    }
  } else {
    if (user.trialRemaining > 0) {
      user.trialRemaining -= 1;
      bucket = 'trial';
    } else if (user.inviteRemaining > 0) {
      user.inviteRemaining -= 1;
      bucket = 'invite';
    }
  }
  if (!bucket) {
    return {
      ok: false,
      remaining: computeEffectiveCredits(user),
      trialRemaining: user.trialRemaining,
      inviteRemaining: user.inviteRemaining,
      subscriptionRemaining: user.subscriptionRemaining,
      plan,
    };
  }
  user.trialUsed = user.trialRemaining <= 0;
  user.inviteUsed = user.inviteUsed || user.inviteRemaining > 0;
  user.credits = computeEffectiveCredits(user);
  await setUser(email, user);
  return {
    ok: true,
    bucket,
    remaining: user.credits,
    trialRemaining: user.trialRemaining,
    inviteRemaining: user.inviteRemaining,
    subscriptionRemaining: user.subscriptionRemaining,
    plan,
  };
};

export const refundCredit = async (
  email: string,
  bucket: 'trial' | 'invite' | 'subscription'
): Promise<UserRecord> => {
  if (hasKV) {
    const kv = await getKv();
    const script = `
      local key = KEYS[1]
      local userJson = redis.call("GET", key)
      if not userJson then return {err="NO_USER"} end
      local user = cjson.decode(userJson)
      local plan = user.plan
      if plan == nil or plan == '' then plan = 'free' end
      local bucket = ARGV[1]
      local field = bucket == 'trial' and 'trialRemaining' or (bucket == 'invite' and 'inviteRemaining' or 'subscriptionRemaining')
      local val = tonumber(user[field] or 0)
      user[field] = val + 1
      local trial = tonumber(user.trialRemaining or 0)
      local invite = tonumber(user.inviteRemaining or 0)
      local sub = tonumber(user.subscriptionRemaining or 0)
      local remaining = plan ~= 'free' and sub or (trial + invite)
      user.updatedAt = tonumber(ARGV[2])
      user.trialUsed = (trial <= 0)
      user.inviteUsed = user.inviteUsed or (invite > 0)
      user.credits = remaining
      redis.call("SET", key, cjson.encode(user))
      return remaining
    `;
    const now = Date.now();
    await kv.eval(script, [userKey(email)], [bucket, String(now)]);
    return getUser(email);
  }
  const user = await getUser(email);
  if (bucket === 'trial') user.trialRemaining += 1;
  if (bucket === 'invite') user.inviteRemaining += 1;
  if (bucket === 'subscription') user.subscriptionRemaining += 1;
  user.credits = computeEffectiveCredits(user);
  user.trialUsed = user.trialRemaining <= 0;
  user.inviteUsed = user.inviteUsed || user.inviteRemaining > 0;
  return setUser(email, user);
};
