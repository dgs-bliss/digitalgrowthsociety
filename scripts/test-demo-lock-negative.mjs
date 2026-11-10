#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const validator = resolve('scripts/validate-demo-lock.mjs');
const results = [];
for (const mutation of ['font', 'dom']) {
  const result = spawnSync(process.execPath, [validator], {
    stdio: 'inherit',
    env: { ...process.env, DEMO_LOCK_MUTATION: mutation, DEMO_LOCK_EVIDENCE: resolve(`demo-lock-evidence-negative-${mutation}`) },
  });
  const rejected = (result.status ?? 0) !== 0;
  results.push({ mutation, exit: result.status, rejected });
  if (!rejected) {
    console.error(`ASTRO_DEMO_LOCK_NEGATIVE_FAIL ${mutation}`);
    process.exit(1);
  }
  console.log(`ASTRO_DEMO_LOCK_NEGATIVE_PASS ${mutation}`);
}
console.log(JSON.stringify({ schema: 'dgs-demo-lock-negative-v1', serial: true, results }, null, 2));
