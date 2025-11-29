export function checkAuth(req: any) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/session_email=([^;]+)/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}
