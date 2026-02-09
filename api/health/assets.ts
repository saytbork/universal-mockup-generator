import type { VercelRequest, VercelResponse } from "@vercel/node";

type AssetCheck = {
  url: string;
  status: number;
  ok: boolean;
  contentType: string;
  looksLikeHtml: boolean;
};

const getOrigin = (req: VercelRequest): string => {
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost:3000";
  const proto = (req.headers["x-forwarded-proto"] as string) || (host.includes("localhost") ? "http" : "https");
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const origin = getOrigin(req);
  const ts = Date.now();
  const indexUrl = `${origin}/index.html?__health=${ts}`;

  try {
    const indexRes = await fetch(indexUrl, { cache: "no-store", redirect: "follow" });
    const indexHtml = await indexRes.text();
    const stylesheets = extractStylesheets(indexHtml);

    const cssChecks: AssetCheck[] = [];
    for (const href of stylesheets) {
      const absolute = href.startsWith("http") ? href : `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
      const cssRes = await fetch(`${absolute}${absolute.includes("?") ? "&" : "?"}__health=${ts}`, {
        cache: "no-store",
        redirect: "follow",
      });
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

    const indexContentType = String(indexRes.headers.get("content-type") || "");
    const indexOk = indexRes.ok && indexContentType.includes("text/html");
    const cssOk = cssChecks.length > 0 && cssChecks.every((c) => c.ok);
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
  } catch (error: any) {
    res.status(503).json({
      ok: false,
      error: error?.message || "Health check failed",
    });
  }
}
