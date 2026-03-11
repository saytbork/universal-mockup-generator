import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuth } from "../server/lib/checkAuth.js";
import { addActivity, listActivity, ActivityRecord } from "../server/lib/activity.js";
import { isUnlimitedCreditsEmail } from "../server/lib/store.js";
import { listDebugLogs } from "../server/lib/debugLog.js";

// ── POST: add activity ────────────────────────────────────────────────────────

const ALLOWED_TYPES: ActivityRecord["type"][] = ["login", "image", "invite", "upgrade", "logout"];

async function handleAdd(req: VercelRequest, res: VercelResponse) {
  const sessionEmail = checkAuth(req);
  const { type, meta } = req.body || {};

  if (!sessionEmail) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (!type || !ALLOWED_TYPES.includes(type)) {
    res.status(400).json({ error: "Invalid activity type" });
    return;
  }

  const record = await addActivity(sessionEmail, type, meta || {});
  res.status(200).json({ ok: true, record });
}

// ── GET: list activity ────────────────────────────────────────────────────────

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) return raw[0]?.toString().toLowerCase() ?? "";
  return typeof raw === "string" ? raw.toLowerCase() : "";
};

type AssetCheck = {
  url: string;
  status: number;
  ok: boolean;
  contentType: string;
  looksLikeHtml: boolean;
};

const getOrigin = (req: VercelRequest): string => {
  const host =
    (req.headers["x-forwarded-host"] as string) ||
    req.headers.host ||
    "localhost:3000";
  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`.replace(/\/+$/, "");
};

const extractStylesheets = (html: string): string[] => {
  const matches = Array.from(
    html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)
  );
  return matches.map((m) => m[1]).filter(Boolean);
};

const looksLikeHtmlPayload = (text: string): boolean => {
  const sample = text.slice(0, 300).toLowerCase();
  return sample.includes("<!doctype html") || sample.includes("<html");
};

async function handleList(req: VercelRequest, res: VercelResponse) {
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
    const kind =
      typeof req.query.kind === "string" ? req.query.kind : undefined;
    const items = await listDebugLogs(limit, kind);
    res.status(200).json({ logs: items });
    return;
  }

  if (action === "asset_health") {
    if (!isUnlimitedCreditsEmail(email)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const origin = getOrigin(req);
    const ts = Date.now();
    const indexUrl = `${origin}/index.html?__health=${ts}`;

    try {
      const indexRes = await fetch(indexUrl, {
        cache: "no-store",
        redirect: "follow",
      });
      const indexHtml = await indexRes.text();
      const stylesheets = extractStylesheets(indexHtml);

      const cssChecks: AssetCheck[] = [];
      for (const href of stylesheets) {
        const absolute = href.startsWith("http")
          ? href
          : `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
        const cssRes = await fetch(
          `${absolute}${absolute.includes("?") ? "&" : "?"}__health=${ts}`,
          { cache: "no-store", redirect: "follow" }
        );
        const body = await cssRes.text();
        const contentType = String(cssRes.headers.get("content-type") || "");
        const htmlLike = looksLikeHtmlPayload(body);
        cssChecks.push({
          url: absolute,
          status: cssRes.status,
          ok: cssRes.ok && contentType.includes("text/css") && !htmlLike,
          contentType,
          looksLikeHtml: htmlLike,
        });
      }

      const indexContentType = String(
        indexRes.headers.get("content-type") || ""
      );
      const indexOk =
        indexRes.ok && indexContentType.includes("text/html");
      const cssOk =
        cssChecks.length > 0 && cssChecks.every((c) => c.ok);
      const ok = indexOk && cssOk;

      res.status(ok ? 200 : 503).json({
        ok,
        checkedAt: new Date().toISOString(),
        index: {
          url: indexUrl,
          status: indexRes.status,
          contentType: indexContentType,
          stylesheetCount: cssChecks.length,
        },
        stylesheets: cssChecks,
      });
      return;
    } catch (error: any) {
      res.status(503).json({
        ok: false,
        error: error?.message || "Asset health check failed",
      });
      return;
    }
  }

  const limit = Number(req.query.limit) || 20;
  const items = await listActivity(email, limit);
  res.status(200).json({ activity: items });
}

// ── Router ────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") return handleAdd(req, res);
  if (req.method === "GET") return handleList(req, res);
  res.status(405).json({ error: "Method not allowed" });
}
