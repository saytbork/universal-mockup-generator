import { verifySessionToken } from "./session.js";

export function checkAuth(req: any) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/session_email=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  const parsed = verifySessionToken(token);
  return parsed?.email || null;
}
