import crypto from "crypto";
import { cookies } from "next/headers";

const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_COOKIE = "boost_session";

type PlanId =
  | "free"
  | "creator-monthly"
  | "creator-yearly"
  | "studio-monthly"
  | "studio-yearly"
  | "none";

type SessionPayload = {
  email: string;
  plan: PlanId;
  credits: number;
  publicDefault: boolean;
  ts: number;
};

const codeStore = new Map<
  string,
  { code: string; expiresAt: number; attempt: number }
>();

const defaultCredits: Record<PlanId, number> = {
  "free": 10,
  "creator-monthly": 20,
  "creator-yearly": 240,
  "studio-monthly": 60,
  "studio-yearly": 720,
  "none": 0,
};

const getSecret = () => process.env.APP_SECRET || "boostugc-demo-secret";

const sign = (payload: SessionPayload) => {
  const raw = JSON.stringify(payload);
  const token = Buffer.from(raw).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(token)
    .digest("base64url");
  return `${token}.${sig}`;
};

const verify = (token: string): SessionPayload | null => {
  const [raw, sig] = token.split(".");
  if (!raw || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(raw)
    .digest("base64url");
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload?.email) return null;
    return payload;
  } catch {
    return null;
  }
};

export const generateCode = (email: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codeStore.set(email, {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attempt: 0,
  });
  return code;
};

export const validateCode = (email: string, submitted: string) => {
  const entry = codeStore.get(email);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    codeStore.delete(email);
    return false;
  }
  const ok = entry.code === submitted;
  entry.attempt += 1;
  if (ok || entry.attempt > 5) {
    codeStore.delete(email);
  } else {
    codeStore.set(email, entry);
  }
  return ok;
};

export const createSession = (email: string, plan: PlanId = "none") => {
  const credits = defaultCredits[plan] ?? 0;
  const payload: SessionPayload = {
    email,
    plan,
    credits,
    publicDefault: plan === "free",
    ts: Date.now(),
  };
  return sign(payload);
};

export const setSessionCookie = async (token: string) => {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
};

export const clearSessionCookie = async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
};

export const getSession = async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  return verify(cookie.value);
};

export const updateSession = async (updates: Partial<SessionPayload>) => {
  const current = await getSession();
  if (!current) return null;
  const next: SessionPayload = { ...current, ...updates, ts: Date.now() };
  const token = sign(next);
  await setSessionCookie(token);
  return next;
};

export const setPlan = async (plan: PlanId) => {
  const credits = defaultCredits[plan] ?? 0;
  return updateSession({
    plan,
    credits,
    publicDefault: plan === "free",
  });
};

export const consumeCredit = async (sharePublic = false) => {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authenticated" };
  if (session.credits <= 0) return { ok: false, error: "No credits left" };
  const remaining = session.credits - 1;
  const next = await updateSession({
    credits: remaining,
    publicDefault: session.publicDefault,
  });
  return {
    ok: true,
    session: next || undefined,
    isPublic: sharePublic || next?.publicDefault,
  };
};

export type SessionData = SessionPayload;
