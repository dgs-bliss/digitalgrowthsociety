#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { sanitizeGeneratedClient } from './sanitize-generated-client.mjs';

const local = process.argv.includes('--local');
const run = (args, env = process.env) => spawnSync('pnpm', ['exec', 'tinacms', ...args], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

let status = 1;
try {
  if (local) {
    status = run(['build', '--local', '--skip-cloud-checks', '--noTelemetry', '-c', 'astro build']).status ?? 1;
  } else {
    // A same-origin proxy is correct for the deployed editor, but Tina's schema
    // status endpoint must be checked directly against Tina Cloud first.
    const cloudEnv = { ...process.env, TINA_DIRECT_CLOUD_CHECK: '1' };
    const cloudCheck = run(['build', '--noTelemetry', '-c', 'node --version'], cloudEnv);
    if ((cloudCheck.status ?? 1) !== 0) {
      status = cloudCheck.status ?? 1;
    } else {
      status = run(['build', '--skip-cloud-checks', '--noTelemetry', '-c', 'astro build']).status ?? 1;
    }
  }
} finally {
  sanitizeGeneratedClient();
}
process.exit(status);
