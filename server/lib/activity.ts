import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

export type ActivityRecord = {
  id: string;
  email: string;
  type: "login" | "image" | "invite" | "upgrade" | "logout";
  timestamp: number;
  meta?: Record<string, any>;
};

const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const activityKey = (email: string) => `activity:${email}`;
const memoryStore = new Map<string, ActivityRecord[]>();

export async function addActivity(
  email: string,
  type: ActivityRecord["type"],
  meta: Record<string, any> = {}
) {
  const record: ActivityRecord = {
    id: randomUUID(),
    email,
    type,
    timestamp: Date.now(),
    meta,
  };
  if (hasKV) {
    await kv.lpush(activityKey(email), JSON.stringify(record));
    // keep latest 200
    await kv.ltrim(activityKey(email), 0, 199);
  } else {
    const list = memoryStore.get(email) || [];
    list.unshift(record);
    memoryStore.set(email, list.slice(0, 200));
  }
  return record;
}

export async function listActivity(email: string, limit = 20): Promise<ActivityRecord[]> {
  if (hasKV) {
    const raw = await kv.lrange<string>(activityKey(email), 0, limit - 1);
    return raw
      .map((item) => {
        try {
          return JSON.parse(item) as ActivityRecord;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ActivityRecord[];
  }
  const list = memoryStore.get(email) || [];
  return list.slice(0, limit);
}
