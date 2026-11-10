#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const cases = [
  { mutation: 'missing-control', expected: 'missing-control:NO-PREMATURE-COMPLETION' },
  { mutation: 'missing-multicat-exception-clause', expected: 'missing-multicat-exception-clause:ASTRO-DEMO-LOCK.md:The demo category count never controls frontend cardinality' },
  { mutation: 'missing-incident-ledger-row', expected: 'missing-incident-row:ASTRO-DEMO-LOCK.md:HNT-001:found-0' },
  { mutation: 'authority-manifest', expected: 'authority-manifest' },
  { mutation: 'positive-browser-validator', expected: 'positive-browser-validator' },
  { mutation: 'controlled-negative-suite', expected: 'controlled-negative-suite' },
  { mutation: 'positive-command-target', expected: 'miswired-package-command:astro:demo-lock' },
  ...(existsSync(resolve(process.cwd(), 'tests/fixtures/astro-demo-lock/authoritative/SHA256SUMS')) ? [
    { mutation: 'duplicate-manifest-path', expected: 'duplicate-manifest-path:' },
    { mutation: 'non-normalized-manifest-path', expected: 'non-normalized-manifest-path:' },
    { mutation: 'fixture-hash-drift', expected: 'fixture-hash-drift:' },
    { mutation: 'unmanifested-fixture', expected: 'unmanifested-fixture:' },
    { mutation: 'fixture-symlink', expected: 'fixture-symlink:' },
  ] : []),
];
const results = [];
for (const item of cases) {
  const run = spawnSync(process.execPath, ['scripts/validate-demo-lock-preflight.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, DEMO_LOCK_PREFLIGHT_MUTATION: item.mutation },
    encoding: 'utf8',
    timeout: 30000,
  });
  const output = `${run.stdout || ''}\n${run.stderr || ''}`;
  if (run.error) {
    console.error(`ASTRO_DEMO_LOCK_PREFLIGHT_NEGATIVE_ERROR ${item.mutation}: ${run.error.message}`);
    process.exit(1);
  }
  if (run.status === 0 || !output.includes(item.expected)) {
    console.error(`ASTRO_DEMO_LOCK_PREFLIGHT_NEGATIVE_FAIL ${item.mutation} exit=${run.status} expected=${item.expected}`);
    console.error(output.slice(-3000));
    process.exit(1);
  }
  results.push({ mutation: item.mutation, expected: item.expected, exit: run.status, rejected: true });
  console.log(`ASTRO_DEMO_LOCK_PREFLIGHT_NEGATIVE_PASS ${item.mutation}`);
}
console.log(JSON.stringify({
  schema: 'astro-demo-lock-preflight-negative-v1',
  serial: true,
  completedAt: new Date().toISOString(),
  results,
}, null, 2));
console.log(`ASTRO_DEMO_LOCK_PREFLIGHT_NEGATIVE_OK ${results.length}`);
