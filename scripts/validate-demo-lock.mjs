#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const candidates = [
  process.env.PYTHON_PLAYWRIGHT,
  process.env.HOME ? join(process.env.HOME, 'work', 'logo-venv', 'bin', 'python') : '',
  '/usr/bin/python3',
  'python3',
].filter(Boolean);
let python = null;
for (const candidate of candidates) {
  if (candidate.includes('/') && !existsSync(candidate)) continue;
  const probe = spawnSync(candidate, ['-c', 'import playwright'], { stdio: 'ignore' });
  if (probe.status === 0) { python = candidate; break; }
}
if (!python) {
  console.error('ASTRO_DEMO_LOCK_BLOCKED no Python Playwright runtime found');
  process.exit(2);
}
const script = resolve('scripts/validate_demo_lock_browser.py');
const result = spawnSync(python, [script], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
