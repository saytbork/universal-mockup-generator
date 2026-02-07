type GenerationLogStatus = 'pending' | 'success' | 'http_error' | 'exception';

export type GenerationLogEntry = {
  id: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  status: GenerationLogStatus;
  scope: string;
  sceneType?: string;
  mode?: string;
  aspectRatio?: string;
  promptHash?: string;
  promptPreview?: string;
  prompt?: string;
  payloadMeta?: Record<string, unknown>;
  responseMeta?: Record<string, unknown>;
  error?: string;
  httpStatus?: number;
};

const STORAGE_KEY = 'pm_generation_logs_v1';
const MAX_LOGS = 250;
const MAX_PROMPT_CHARS = 12000;

type GenerationLogPatch = Partial<GenerationLogEntry>;

const safeNowIso = () => new Date().toISOString();

const safeParse = (raw: string | null): GenerationLogEntry[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
};

const readLogs = (): GenerationLogEntry[] => {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

const writeLogs = (logs: GenerationLogEntry[]) => {
  if (typeof window === 'undefined') return;
  const trimmed = logs.slice(-MAX_LOGS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

const compactPrompt = (value?: string): string | undefined => {
  if (!value) return value;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= MAX_PROMPT_CHARS) return normalized;
  return `${normalized.slice(0, MAX_PROMPT_CHARS)}…`;
};

export const createGenerationLog = (
  entry: Omit<GenerationLogEntry, 'id' | 'startedAt' | 'status'> & {
    status?: GenerationLogStatus;
  }
): string => {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const startedAt = safeNowIso();
  const next: GenerationLogEntry = {
    id,
    startedAt,
    status: entry.status ?? 'pending',
    ...entry,
    prompt: compactPrompt(entry.prompt),
    promptPreview: compactPrompt(entry.promptPreview),
  };
  const logs = readLogs();
  logs.push(next);
  writeLogs(logs);
  return id;
};

export const updateGenerationLog = (id: string, patch: GenerationLogPatch) => {
  if (!id) return;
  const logs = readLogs();
  const index = logs.findIndex(log => log.id === id);
  if (index < 0) return;
  const current = logs[index];
  const finishedAt = patch.finishedAt ?? safeNowIso();
  const startedMs = Date.parse(current.startedAt);
  const finishedMs = Date.parse(finishedAt);
  const durationMs =
    Number.isFinite(startedMs) && Number.isFinite(finishedMs) && finishedMs >= startedMs
      ? finishedMs - startedMs
      : current.durationMs;
  logs[index] = {
    ...current,
    ...patch,
    finishedAt,
    durationMs,
    prompt: compactPrompt((patch.prompt as string | undefined) ?? current.prompt),
    promptPreview: compactPrompt((patch.promptPreview as string | undefined) ?? current.promptPreview),
  };
  writeLogs(logs);
};

export const listGenerationLogs = (): GenerationLogEntry[] => readLogs();

export const clearGenerationLogs = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const exportGenerationLogs = () => {
  if (typeof window === 'undefined') return;
  const logs = readLogs();
  const payload = JSON.stringify(logs, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `pm-generation-logs-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const installGenerationLogBridge = () => {
  if (typeof window === 'undefined') return;
  const target = window as Window & {
    __PM_LOGS__?: {
      list: () => GenerationLogEntry[];
      clear: () => void;
      exportJson: () => void;
      latest: () => GenerationLogEntry | null;
    };
  };
  target.__PM_LOGS__ = {
    list: () => listGenerationLogs(),
    clear: () => clearGenerationLogs(),
    exportJson: () => exportGenerationLogs(),
    latest: () => {
      const logs = listGenerationLogs();
      return logs.length ? logs[logs.length - 1] : null;
    },
  };
};
