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
  const secret = process.env.MAGIC_TOKEN_SECRET;
  if (!secret) throw new Error("MAGIC_TOKEN_SECRET is not set");
  return secret;
};

export const createMagicToken = (
  email: string,
  invitationCode?: string | null,
  ttlMs = 15 * 60 * 1000
) => {
  const payload = {
    email,
    invitationCode: invitationCode || null,
    exp: Date.now() + ttlMs,
  };
  const payloadStr = JSON.stringify(payload);
  const body = toB64Url(payloadStr);
  const sig = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
};

export const verifyMagicToken = (
  token: string
): { email: string; invitationCode?: string | null } | null => {
  if (!token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  const payloadStr = fromB64Url(body);
  const payload = JSON.parse(payloadStr) as { email: string; invitationCode?: string | null; exp: number };
  if (!payload.email || !payload.exp) return null;
  if (Date.now() > payload.exp) return null;
  return { email: payload.email, invitationCode: payload.invitationCode };
};
