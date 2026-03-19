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
const MAX_PROMPT_CHARS = 4000;
const MAX_META_STRING_CHARS = 600;

type GenerationLogPatch = Partial<GenerationLogEntry>;

const safeNowIso = () => new Date().toISOString();

const isQuotaExceededError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const name = String((error as { name?: string }).name || '');
  const message = String((error as { message?: string }).message || '').toLowerCase();
  return (
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    message.includes('quota exceeded') ||
    (message.includes('storage') && message.includes('quota'))
  );
};

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

const compactPrompt = (value?: string): string | undefined => {
  if (!value) return value;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= MAX_PROMPT_CHARS) return normalized;
  return `${normalized.slice(0, MAX_PROMPT_CHARS)}…`;
};

const compactText = (value: string, maxChars: number): string => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars)}…`;
};

const compactUnknown = (value: unknown): unknown => {
  if (value == null) return value;
  if (typeof value === 'string') return compactText(value, MAX_META_STRING_CHARS);
  if (Array.isArray(value)) return value.slice(0, 12).map(item => compactUnknown(item));
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, next]) => {
      acc[key] = compactUnknown(next);
      return acc;
    }, {});
  }
  return value;
};

const compactLogEntry = (entry: GenerationLogEntry): GenerationLogEntry => ({
  ...entry,
  prompt: compactPrompt(entry.prompt),
  promptPreview: compactPrompt(entry.promptPreview),
  payloadMeta: compactUnknown(entry.payloadMeta) as Record<string, unknown> | undefined,
  responseMeta: compactUnknown(entry.responseMeta) as Record<string, unknown> | undefined,
  error: entry.error ? compactText(entry.error, MAX_META_STRING_CHARS) : entry.error,
});

const readLogs = (): GenerationLogEntry[] => {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

const buildStorageCandidates = (logs: GenerationLogEntry[]): GenerationLogEntry[][] => {
  const trimmed = logs.slice(-MAX_LOGS).map(compactLogEntry);
  const medium = trimmed.slice(-120).map(log => ({
    ...log,
    prompt: undefined,
  }));
  const small = trimmed.slice(-60).map(log => ({
    ...log,
    prompt: undefined,
    promptPreview: undefined,
    payloadMeta: undefined,
    responseMeta: undefined,
  }));
  return [trimmed, medium, small, []];
};

const writeLogs = (logs: GenerationLogEntry[]) => {
  if (typeof window === 'undefined') return;
  let lastError: unknown = null;
  for (const candidate of buildStorageCandidates(logs)) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      return;
    } catch (error) {
      lastError = error;
      if (!isQuotaExceededError(error)) {
        throw error;
      }
    }
  }
  if (lastError && !isQuotaExceededError(lastError)) {
    throw lastError;
  }
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
  try {
    const logs = readLogs();
    logs.push(next);
    writeLogs(logs);
  } catch (error) {
    console.warn('[GENERATION_LOG] create skipped', error);
    return '';
  }
  return id;
};

export const updateGenerationLog = (id: string, patch: GenerationLogPatch) => {
  if (!id) return;
  try {
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
      payloadMeta: compactUnknown(patch.payloadMeta ?? current.payloadMeta) as Record<string, unknown> | undefined,
      responseMeta: compactUnknown(patch.responseMeta ?? current.responseMeta) as Record<string, unknown> | undefined,
      error: patch.error ? compactText(patch.error, MAX_META_STRING_CHARS) : current.error,
    };
    writeLogs(logs);
  } catch (error) {
    console.warn('[GENERATION_LOG] update skipped', error);
  }
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
