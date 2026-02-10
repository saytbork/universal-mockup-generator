import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const VIDEOS_DIR = path.resolve(process.cwd(), 'public', 'videos');

const formatBytes = (bytes) => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

async function main() {
  let entries = [];
  try {
    entries = await readdir(VIDEOS_DIR, { withFileTypes: true });
  } catch (err) {
    // No videos dir: nothing to validate.
    return;
  }

  const offenders = [];
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (!ent.name.toLowerCase().endsWith('.mp4')) continue;
    const full = path.join(VIDEOS_DIR, ent.name);
    const st = await stat(full);
    if (st.size > MAX_BYTES) {
      offenders.push({ file: `public/videos/${ent.name}`, size: st.size });
    }
  }

  if (offenders.length === 0) return;

  // Keep output concise but actionable.
  console.error(`[videos] Size limit exceeded (> ${formatBytes(MAX_BYTES)}):`);
  for (const o of offenders) {
    console.error(`- ${o.file}: ${formatBytes(o.size)}`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error('[videos] size check failed:', err);
  process.exit(1);
});

