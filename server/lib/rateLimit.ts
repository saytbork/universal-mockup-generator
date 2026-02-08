type RateLimitOptions = {
  key: string;
  max: number;
  windowSeconds: number;
  namespace?: string;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
};

const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const memory = new Map<string, { count: number; resetAt: number }>();

const getKv = async () => {
  const mod = await import("@vercel/kv");
  return mod.kv;
};

const clamp = (n: number) => (Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1);

export async function rateLimit({
  key,
  max,
  windowSeconds,
  namespace = "default",
}: RateLimitOptions): Promise<RateLimitResult> {
  const safeKey = String(key || "unknown").trim().slice(0, 180) || "unknown";
  const safeMax = clamp(max);
  const safeWindowSeconds = clamp(windowSeconds);
  const now = Date.now();

  if (hasKV) {
    const bucket = Math.floor(now / (safeWindowSeconds * 1000));
    const kvKey = `rl:${namespace}:${safeKey}:${bucket}`;
    const kv = await getKv();
    const count = await kv.incr(kvKey);
    if (count === 1) await kv.expire(kvKey, safeWindowSeconds);
    return { ok: count <= safeMax, remaining: Math.max(0, safeMax - count) };
  }

  const memKey = `rl:${namespace}:${safeKey}`;
  const existing = memory.get(memKey);
  if (!existing || existing.resetAt <= now) {
    memory.set(memKey, { count: 1, resetAt: now + safeWindowSeconds * 1000 });
    return { ok: true, remaining: Math.max(0, safeMax - 1) };
  }
  existing.count += 1;
  memory.set(memKey, existing);
  return { ok: existing.count <= safeMax, remaining: Math.max(0, safeMax - existing.count) };
}
