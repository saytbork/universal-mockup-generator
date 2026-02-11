const DEFAULT_TRIAL_COUPON_MAX_REDEMPTIONS = 3;

const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const memoryUsage = new Map<string, number>();

const normalizeCode = (code: string) => String(code || '').trim().toLowerCase();

const usageKey = (code: string) => `trial_coupon_usage:${normalizeCode(code)}`;

const getKv = async () => {
  const mod = await import('@vercel/kv');
  return mod.kv;
};

export const getTrialCouponMaxRedemptions = (): number => {
  const parsed = Number(process.env.TRIAL_COUPON_MAX_REDEMPTIONS || DEFAULT_TRIAL_COUPON_MAX_REDEMPTIONS);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_TRIAL_COUPON_MAX_REDEMPTIONS;
  return Math.floor(parsed);
};

export const tryConsumeTrialCouponRedemption = async (
  code: string
): Promise<{ ok: boolean; used: number; limit: number }> => {
  const normalized = normalizeCode(code);
  const limit = getTrialCouponMaxRedemptions();
  if (!normalized) return { ok: false, used: 0, limit };

  if (hasKV) {
    const kv = await getKv();
    const key = usageKey(normalized);
    const next = await kv.incr(key);
    if (next > limit) {
      await kv.decr(key);
      const currentRaw = await kv.get<number>(key);
      const current = Number(currentRaw || 0);
      return { ok: false, used: Math.max(0, current), limit };
    }
    return { ok: true, used: Number(next), limit };
  }

  const current = Number(memoryUsage.get(normalized) || 0);
  if (current >= limit) {
    return { ok: false, used: current, limit };
  }
  const next = current + 1;
  memoryUsage.set(normalized, next);
  return { ok: true, used: next, limit };
};

export const rollbackTrialCouponRedemption = async (code: string): Promise<void> => {
  const normalized = normalizeCode(code);
  if (!normalized) return;

  if (hasKV) {
    const kv = await getKv();
    const key = usageKey(normalized);
    const current = Number((await kv.get<number>(key)) || 0);
    if (current <= 0) return;
    await kv.decr(key);
    return;
  }

  const current = Number(memoryUsage.get(normalized) || 0);
  if (current <= 0) return;
  if (current === 1) {
    memoryUsage.delete(normalized);
    return;
  }
  memoryUsage.set(normalized, current - 1);
};

