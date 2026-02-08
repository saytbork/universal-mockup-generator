import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuth } from "../../server/lib/checkAuth.js";
import { listActivity } from "../../server/lib/activity.js";
import { isUnlimitedCreditsEmail } from "../../server/lib/store.js";
import { listDebugLogs } from "../../server/lib/debugLog.js";

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) return raw[0]?.toString().toLowerCase() ?? '';
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const action = parseAction(req);
  if (action === "debug") {
    if (!isUnlimitedCreditsEmail(email)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const limit = Number(req.query.limit) || 50;
    const kind = typeof req.query.kind === 'string' ? req.query.kind : undefined;
    const items = await listDebugLogs(limit, kind);
    res.status(200).json({ logs: items });
    return;
  }

  const limit = Number(req.query.limit) || 20;
  const items = await listActivity(email, limit);
  res.status(200).json({ activity: items });
}
