import crypto from 'crypto';
import nodemailer from 'nodemailer';

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const COOKIE_NAME = 'ugc_verify';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const getSecret = () =>
  process.env.EMAIL_VERIFICATION_SECRET ||
  process.env.API_KEY ||
  'fallback-secret';

const signPayload = (payload: string) =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');

export const buildVerificationCookie = (email: string, code: string) => {
  const expiresAt = Date.now() + CODE_TTL_MS;
  const payload = JSON.stringify({ email: normalizeEmail(email), code, expiresAt });
  const token = Buffer.from(payload).toString('base64url');
  const signature = signPayload(payload);
  const value = `${token}.${signature}`;
  return `${COOKIE_NAME}=${value}; Max-Age=${Math.floor(
    CODE_TTL_MS / 1000
  )}; Path=/; HttpOnly; SameSite=Lax; Secure`;
};

export const clearVerificationCookie = () =>
  `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure`;

type ParsedCookie = {
  email: string;
  code: string;
  expiresAt: number;
};

export const parseVerificationCookie = (cookieHeader?: string | null): ParsedCookie | null => {
  if (!cookieHeader) return null;
  const cookie = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return null;
  const rawValue = cookie.slice(COOKIE_NAME.length + 1);
  const [token, signature] = rawValue.split('.');
  if (!token || !signature) return null;
  try {
    const payloadStr = Buffer.from(token, 'base64url').toString('utf8');
    if (signPayload(payloadStr) !== signature) return null;
    const parsed = JSON.parse(payloadStr) as ParsedCookie;
    if (!parsed.email || !parsed.code || !parsed.expiresAt) return null;
    return parsed;
  } catch (err) {
    console.error('Failed to parse verification cookie', err);
    return null;
  }
};

let transport: nodemailer.Transporter | null | undefined;

export const getMailTransport = () => {
  if (transport !== undefined) return transport;
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not set. Codes will be logged, not emailed.');
    transport = null;
    return transport;
  }
  try {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  } catch (err) {
    console.error('Failed to initialize SMTP transport', err);
    transport = null;
  }
  return transport;
};

export const MAIL_FROM =
  process.env.SMTP_FROM || process.env.EMAIL_FROM || 'Amisano Design <no-reply@amisano-design.com>';
