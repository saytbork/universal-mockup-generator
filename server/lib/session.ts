import crypto from "crypto";

const toB64Url = (input: string) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const fromB64Url = (input: string) =>
  Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();

const getSecret = () => {
  const secret = process.env.SESSION_SECRET || process.env.MAGIC_TOKEN_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET (or MAGIC_TOKEN_SECRET) is not set");
  }
  return secret;
};

export const createSessionToken = (email: string, ttlMs = 7 * 24 * 60 * 60 * 1000) => {
  const payload = {
    email: String(email || "").trim().toLowerCase(),
    exp: Date.now() + ttlMs,
  };
  const body = toB64Url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
};

export const verifySessionToken = (token: string): { email: string } | null => {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  const expectedBuf = Buffer.from(expected);
  const sigBuf = Buffer.from(sig);
  if (expectedBuf.length !== sigBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) return null;

  try {
    const parsed = JSON.parse(fromB64Url(body)) as { email?: string; exp?: number };
    const email = String(parsed?.email || "").trim().toLowerCase();
    const exp = Number(parsed?.exp || 0);
    if (!email || !exp || Date.now() > exp) return null;
    return { email };
  } catch {
    return null;
  }
};
