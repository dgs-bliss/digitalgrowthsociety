import { syncPermalinksToFilenames } from './sync-permalinks-to-filenames.mjs';

const intervalMs = Number(process.env.PERMALINK_WATCH_INTERVAL || 1500);
let running = false;
let lastChangedAt = 0;

async function tick() {
  if (running) return;
  running = true;
  try {
    const changed = syncPermalinksToFilenames();
    if (changed > 0) lastChangedAt = Date.now();
  } catch (error) {
    console.error('[permalink-watch] Error:', error?.message || error);
  } finally {
    running = false;
  }
}

console.log('[permalink-watch] Watching permalink frontmatter and syncing actual filenames.');
console.log('[permalink-watch] Keep this running while editing Tina. Press Ctrl+C to stop.');
await tick();
setInterval(tick, intervalMs);