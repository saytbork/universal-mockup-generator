import { randomUUID } from "crypto";

export type DebugLogRecord = {
  id: string;
  timestamp: number;
  kind: string;
  email?: string;
  data?: Record<string, any>;
};

const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const DEBUG_KEY = "debug:events";
const DEBUG_TTL_SECONDS = 60 * 60 * 24; // 24h
const DEBUG_MAX_ITEMS = 1000;
const memoryStore: DebugLogRecord[] = [];

const getKv = async () => {
  const mod = await import("@vercel/kv");
  return mod.kv;
};

const sanitizeData = (data?: Record<string, any>) => {
  if (!data || typeof data !== "object") return undefined;
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value == null) continue;
    if (typeof value === "string") {
      sanitized[key] = value.slice(0, 800);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.slice(0, 20).map((item) =>
        typeof item === "string" ? item.slice(0, 200) : item
      );
    } else if (typeof value === "object") {
      sanitized[key] = JSON.parse(JSON.stringify(value));
    }
  }
  return sanitized;
};

export async function addDebugLog(
  kind: string,
  data?: Record<string, any>,
  email?: string
): Promise<DebugLogRecord> {
  const record: DebugLogRecord = {
    id: randomUUID(),
    timestamp: Date.now(),
    kind: String(kind || "unknown").slice(0, 120),
    email: email ? String(email).trim().toLowerCase().slice(0, 254) : undefined,
    data: sanitizeData(data),
  };

  if (hasKV) {
    const kv = await getKv();
    await kv.lpush(DEBUG_KEY, JSON.stringify(record));
    await kv.ltrim(DEBUG_KEY, 0, DEBUG_MAX_ITEMS - 1);
    await kv.expire(DEBUG_KEY, DEBUG_TTL_SECONDS);
  } else {
    memoryStore.unshift(record);
    if (memoryStore.length > DEBUG_MAX_ITEMS) {
      memoryStore.length = DEBUG_MAX_ITEMS;
    }
  }

  return record;
}

export async function listDebugLogs(limit = 50, kind?: string): Promise<DebugLogRecord[]> {
  const safeLimit = Math.max(1, Math.min(300, Number(limit) || 50));
  const kindFilter = String(kind || "").trim().toLowerCase();

  let rows: DebugLogRecord[] = [];
  if (hasKV) {
    const kv = await getKv();
    const raw = await kv.lrange<string>(DEBUG_KEY, 0, Math.max(200, safeLimit * 3) - 1);
    rows = raw
      .map((item) => {
        try {
          return JSON.parse(item) as DebugLogRecord;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as DebugLogRecord[];
  } else {
    rows = memoryStore.slice();
  }

  if (kindFilter) {
    rows = rows.filter((row) => String(row.kind || "").toLowerCase() === kindFilter);
  }

  return rows.slice(0, safeLimit);
}
