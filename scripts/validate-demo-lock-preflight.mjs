#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const mutation = process.env.DEMO_LOCK_PREFLIGHT_MUTATION || '';
const isInside = (parent, child) => {
  const rel = relative(parent, child);
  return Boolean(rel) && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
};
const fixtureRoot = resolve(root, 'tests/fixtures/astro-demo-lock/authoritative');
const manifestPath = resolve(fixtureRoot, 'SHA256SUMS');
const requiredControls = [
  'NO-PREMATURE-COMPLETION', 'AUTHORITY-FIRST', 'GATE-SELF-TEST', 'PRODUCTION-DATA-SHAPE',
  'DESTINATION-ENV-ONLY', 'FRESH-PROCESS-AND-SHUTDOWN', 'SERIAL-BROWSER-GATES',
  'RESOURCE-PREFLIGHT', 'DETERMINISTIC-TOOLCHAIN', 'PUBLISHER-BEFORE-FINAL-SHA',
  'TRUE-ORIGIN-AND-LIVE-PROOF', 'SELF-CONTAINED-RUNTIME-AND-CLEANUP', 'STRUCTURED-EVIDENCE',
  'CHECKPOINT-NOT-COMPLETION', 'MINIMAL-RETRY-DIAGNOSTICS', 'LITERAL-VISUAL-NON-APPROXIMATION',
  'SHA-HTTP-NOT-VISUAL-PROOF', 'CLOUD-SOURCE-PRECEDENCE', 'REAL-WHEEL-STICKY-PROOF',
  'RESPONSIVE-RAIL-TOC-CONTRACT', 'COMPLETE-TEMPLATE-FAMILY-MATRIX', 'FIXTURE-INTEGRITY-FIRST',
  'DUAL-ARTIFACT-SECRET-SCAN', 'EXACT-SHA-PACKAGE-POINTER-PARITY', 'FINAL-POST-CLEANUP-ACCEPTANCE',
  'EXECUTABLE-LOCK-READINESS',
  'SCOPED-GATE-NOT-ACCEPTANCE', 'COMPLETE-DOCUMENT-RESTORATION', 'PRODUCTION-RUNTIME-DEPENDENCY-CLOSURE',
  'RESPONSIVE-NAVIGATION-INTERACTION-CONTRACT', 'FRONTEND-ROUTE-RESOLUTION', 'CANONICAL-ALIAS-PARITY',
  'DETERMINISTIC-ADMIN-LOCATORS', 'CATEGORY-ISLAND-EDITABILITY', 'REPRESENTATION-SHAPE-MATRIX',
  'MANDATORY-RELEASE-COMMAND-SEQUENCE',
  'DEMO-CARDINALITY-MULTICAT-EXCEPTION',
];
const incidentIds = Array.from({ length: 65 }, (_, index) => `HNT-${String(index + 1).padStart(3, '0')}`);
const missing = [];
const failures = [];
const passes = [];
const startedAt = new Date().toISOString();
const lockPath = resolve(root, 'ASTRO-DEMO-LOCK.md');
const goldPath = resolve(root, 'TINA-MIGRATION-GOLD.md');
const validatorPath = resolve(root, 'scripts/validate-demo-lock.mjs');
const negativePath = resolve(root, 'scripts/test-demo-lock-negative.mjs');
const packagePath = resolve(root, 'package.json');

function sha256(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
function markRequired(path, code) {
  if (!existsSync(path) || mutation === code) missing.push(code);
  else passes.push(code);
}
function walkFiles(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(path, entry.name);
    return entry.isDirectory() ? walkFiles(child) : [child];
  });
}
function validateIncidentLedger(document, label) {
  if (!document.includes('LATEST-MIGRATION-INCIDENT-LEDGER')) failures.push(`missing-incident-ledger:${label}`);
  for (const heading of ['Problem encountered', 'Solution applied', 'Permanent prevention', 'Evidence']) {
    if (!document.includes(heading)) failures.push(`missing-incident-column:${label}:${heading}`);
  }
  const rows = document.split(/\r?\n/).filter((line) => /^\| HNT-\d{3} \|/.test(line));
  for (const id of incidentIds) {
    const matches = rows.filter((line) => line.startsWith(`| ${id} |`));
    if (matches.length !== 1) failures.push(`missing-incident-row:${label}:${id}:found-${matches.length}`);
    else {
      const cells = matches[0].split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells.length !== 5 || cells.some((cell) => !cell)) failures.push(`malformed-incident-row:${label}:${id}`);
    }
  }
}

markRequired(lockPath, 'lock-document');
markRequired(goldPath, 'gold-document');
markRequired(manifestPath, 'authority-manifest');
markRequired(validatorPath, 'positive-browser-validator');
markRequired(negativePath, 'controlled-negative-suite');

const multicatExceptionClauses = [
  'MULTICAT-LOCK` outranks `ASTRO-DEMO-LOCK` cardinality',
  'The demo category count never controls frontend cardinality',
  'Repeat the demo category badge once for every saved category in exact backend order',
  'The Tina category array controls count, order, labels, slugs and hrefs',
  'not a DOM/source-parity violation',
  '`categories[0]`',
  'two-or-more-category fixture',
];

let controlsPresent = 0;
if (existsSync(lockPath)) {
  let lock = readFileSync(lockPath, 'utf8');
  if (mutation === 'missing-control') lock = lock.replaceAll(requiredControls[0], 'REMOVED-CONTROL');
  if (mutation === 'missing-multicat-exception-clause') lock = lock.replace('The demo category count never controls frontend cardinality', 'REMOVED-MULTICAT-EXCEPTION-CLAUSE');
  if (mutation === 'missing-incident-ledger-row') lock = lock.replace('| HNT-001 |', '| REMOVED-INCIDENT |');
  const controlSection = lock.split('## Mandatory controls')[1]?.split('## Transport gates inherited from GOLD')[0] || '';
  for (const control of requiredControls) {
    if (!controlSection.includes(control)) failures.push(`missing-control:${control}`);
    else controlsPresent += 1;
  }
  for (const clause of multicatExceptionClauses) if (!lock.includes(clause)) failures.push(`missing-multicat-exception-clause:ASTRO-DEMO-LOCK.md:${clause}`);
  validateIncidentLedger(lock, 'ASTRO-DEMO-LOCK.md');
}
if (existsSync(goldPath)) {
  const gold = readFileSync(goldPath, 'utf8');
  for (const clause of multicatExceptionClauses) if (!gold.includes(clause)) failures.push(`missing-multicat-exception-clause:TINA-MIGRATION-GOLD.md:${clause}`);
  validateIncidentLedger(gold, 'TINA-MIGRATION-GOLD.md');
}

let fixtureManifestSha256 = null;
let checkedFixtures = 0;
if (existsSync(manifestPath) && mutation !== 'authority-manifest') {
  if (lstatSync(fixtureRoot).isSymbolicLink()) failures.push('symlink-authority-root');
  if (lstatSync(manifestPath).isSymbolicLink()) failures.push('symlink-authority-manifest');
  const fixtureRootReal = realpathSync(fixtureRoot);
  fixtureManifestSha256 = sha256(manifestPath);
  const expectedPaths = new Set();
  let manifestLines = readFileSync(manifestPath, 'utf8').trim().split('\n').filter(Boolean);
  if (mutation === 'duplicate-manifest-path' && manifestLines[0]) manifestLines = [...manifestLines, manifestLines[0]];
  if (mutation === 'fixture-hash-drift' && manifestLines[0]) manifestLines[0] = manifestLines[0].replace(/^[a-f0-9]{64}/, '0'.repeat(64));
  if (mutation === 'non-normalized-manifest-path' && manifestLines[0]) {
    manifestLines[0] = manifestLines[0].replace(/\s+(.+)$/, (_, listed) => `  ${listed.replace(/^tests\/fixtures\//, 'tests/fixtures/../fixtures/')}`);
  }
  let manifestEntryIndex = 0;
  for (const line of manifestLines) {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
    if (!match) { failures.push(`malformed-manifest-line:${line}`); continue; }
    const [, expected, listed] = match;
    const file = resolve(root, listed);
    if (!isInside(fixtureRoot, file)) { failures.push(`fixture-outside-authority:${listed}`); continue; }
    const normalizedListed = relative(root, file).replaceAll('\\', '/');
    if (listed !== normalizedListed) { failures.push(`non-normalized-manifest-path:${listed}`); continue; }
    if (expectedPaths.has(file)) { failures.push(`duplicate-manifest-path:${listed}`); continue; }
    expectedPaths.add(file);
    if (!existsSync(file) || !statSync(file).isFile()) { failures.push(`missing-fixture:${listed}`); continue; }
    const forceSymlink = mutation === 'fixture-symlink' && manifestEntryIndex === 0;
    manifestEntryIndex += 1;
    if (forceSymlink || lstatSync(file).isSymbolicLink()) { failures.push(`fixture-symlink:${listed}`); continue; }
    const realFile = realpathSync(file);
    if (!isInside(fixtureRootReal, realFile)) { failures.push(`fixture-realpath-outside-authority:${listed}`); continue; }
    if (sha256(file) !== expected) failures.push(`fixture-hash-drift:${listed}`);
    else checkedFixtures += 1;
  }
  if (mutation === 'unmanifested-fixture' && expectedPaths.size) expectedPaths.delete(expectedPaths.values().next().value);
  for (const file of walkFiles(fixtureRoot)) {
    if (file === manifestPath) continue;
    if (lstatSync(file).isSymbolicLink()) failures.push(`fixture-symlink:${relative(root, file)}`);
    if (!expectedPaths.has(file)) failures.push(`unmanifested-fixture:${relative(root, file)}`);
  }
  if (expectedPaths.size === 0) failures.push('empty-authority-manifest');
}

let scripts = {};
if (existsSync(packagePath)) {
  try { scripts = JSON.parse(readFileSync(packagePath, 'utf8')).scripts || {}; }
  catch (error) { failures.push(`invalid-package-json:${error.message}`); }
}
if (mutation === 'positive-command-target') scripts['astro:demo-lock'] = 'true';
for (const command of ['astro:demo-lock', 'astro:demo-lock:negative', 'astro:demo-lock:preflight', 'astro:demo-lock:preflight:negative']) {
  if (!scripts[command]) missing.push(`package-command:${command}`);
}
for (const [command, expected] of Object.entries({
  'astro:demo-lock': 'node scripts/validate-demo-lock.mjs',
  'astro:demo-lock:negative': 'node scripts/test-demo-lock-negative.mjs',
  'astro:demo-lock:preflight': 'node scripts/validate-demo-lock-preflight.mjs',
  'astro:demo-lock:preflight:negative': 'node scripts/test-demo-lock-preflight-negative.mjs',
})) {
  if (scripts[command] && scripts[command] !== expected) failures.push(`miswired-package-command:${command}`);
}
if (scripts['astro:demo-lock']?.includes('validate-demo-lock-preflight')) failures.push('positive-command-points-only-to-preflight');
if (scripts['astro:demo-lock:negative']?.includes('preflight')) failures.push('negative-command-points-only-to-preflight');

const status = failures.length ? 'FAIL' : missing.length ? 'BLOCKED' : 'PASS';
const evidence = {
  schema: 'astro-demo-lock-preflight-v1', status, root, startedAt,
  completedAt: new Date().toISOString(), controlsPresent, controlsRequired: requiredControls.length,
  fixtureManifestSha256, checkedFixtures, passes, missing, failures,
};
console.log(JSON.stringify(evidence, null, 2));
if (status === 'PASS') console.log('ASTRO_DEMO_LOCK_PREFLIGHT_PASS');
else console.error(`ASTRO_DEMO_LOCK_${status} ${[...missing, ...failures].join(',')}`);
process.exit(status === 'PASS' ? 0 : status === 'BLOCKED' ? 2 : 1);
