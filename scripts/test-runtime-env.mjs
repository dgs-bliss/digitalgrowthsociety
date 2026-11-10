#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { installRuntimeEnv, parseEnv, REQUIRED_RUNTIME_KEYS } from './install-runtime-env.mjs';

const workspace = mkdtempSync(join(tmpdir(), 'tina-runtime-install-'));
const source = join(workspace, 'canonical.env');
const active = join(workspace, 'active', '.env');
const rollback = join(workspace, 'rollback', '.env');
const secretMarker = 'regression-secret-must-never-be-logged';

const completeEntries = {
  SITE_PROVISION_MODE: 'independent',
  SITE_URL: 'https://runtime-regression.invalid',
  DEPLOY_ADAPTER: 'node',
  NEXT_PUBLIC_TINA_CLIENT_ID: 'regression-client-92a1',
  TINA_TOKEN: 'regression-token-92a1',
  NEXT_PUBLIC_TINA_BRANCH: 'main',
  NEXT_PUBLIC_TINA_CONTENT_API_URL: 'https://runtime-regression.invalid/tina-content-proxy',
  GITHUB_CONTENT_REPO: 'destination-owner/destination-repository',
  CLOUDINARY_CLOUD_NAME: 'destination-cloud',
  CLOUDINARY_API_KEY: '123456789012345',
  CLOUDINARY_API_SECRET: secretMarker,
  CLOUDINARY_ROOT_FOLDER: 'destination-site-92a1',
  OPTIONAL_SUPPLIED_SERVICE_SETTING: 'must-also-be-preserved',
};

function envText(entries) {
  return `${Object.entries(entries)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;
}

writeFileSync(source, envText(completeEntries), { mode: 0o600 });
mkdirSync(join(workspace, 'active'), { recursive: true, mode: 0o700 });
writeFileSync(active, 'ORIGINAL_ACTIVE=preserve-if-validation-fails\n', { mode: 0o640, flag: 'w' });

const installed = installRuntimeEnv({ source, targets: [active, rollback] });
assert.equal(installed.targetCount, 2);
for (const target of [active, rollback]) {
  assert.equal(readFileSync(target, 'utf8'), envText(completeEntries));
  const values = parseEnv(readFileSync(target, 'utf8'));
  for (const key of REQUIRED_RUNTIME_KEYS) assert.equal(values.get(key), completeEntries[key]);
  assert.equal(statSync(target).mode & 0o777, 0o600);
}
console.log('COMPLETE_ACTIVE_ROLLBACK_INSTALL_PASS');

const beforeActive = readFileSync(active, 'utf8');
const beforeRollback = readFileSync(rollback, 'utf8');
const incomplete = join(workspace, 'missing-root.env');
const { CLOUDINARY_ROOT_FOLDER: _omitted, ...withoutRoot } = completeEntries;
writeFileSync(incomplete, envText(withoutRoot), { mode: 0o600 });
assert.throws(
  () => installRuntimeEnv({ source: incomplete, targets: [active, rollback] }),
  /CLOUDINARY_ROOT_FOLDER/,
);
assert.equal(readFileSync(active, 'utf8'), beforeActive);
assert.equal(readFileSync(rollback, 'utf8'), beforeRollback);
console.log('INCOMPLETE_SOURCE_NO_TARGET_MODIFICATION_PASS');

const genericFolder = join(workspace, 'generic-folder.env');
writeFileSync(genericFolder, envText({ ...completeEntries, CLOUDINARY_ROOT_FOLDER: 'media' }), { mode: 0o600 });
assert.throws(
  () => installRuntimeEnv({ source: genericFolder, targets: [active, rollback] }),
  /unique to the destination site/,
);
assert.equal(readFileSync(active, 'utf8'), beforeActive);
assert.equal(readFileSync(rollback, 'utf8'), beforeRollback);
console.log('GENERIC_FOLDER_NO_TARGET_MODIFICATION_PASS');

const appResult = spawnSync(process.execPath, [resolve('app.mjs')], {
  cwd: workspace,
  encoding: 'utf8',
  env: { PATH: process.env.PATH, SITE_ENV_FILE: incomplete },
});
const appOutput = `${appResult.stdout || ''}${appResult.stderr || ''}`;
assert.notEqual(appResult.status, 0);
assert.match(appOutput, /CLOUDINARY_ROOT_FOLDER/);
assert.ok(!appOutput.includes(secretMarker), 'Startup failure must never print supplied secret values.');
console.log('INCOMPLETE_RUNTIME_STARTUP_BLOCK_PASS');

const cliResult = spawnSync(
  process.execPath,
  [resolve('scripts/install-runtime-env.mjs'), '--source', source, '--target', active, '--target', rollback],
  { encoding: 'utf8', env: { PATH: process.env.PATH } },
);
const cliOutput = `${cliResult.stdout || ''}${cliResult.stderr || ''}`;
assert.equal(cliResult.status, 0, cliOutput);
assert.match(cliOutput, /SUPPLIED_CREDENTIAL_INSTALL_PASS/);
assert.ok(!cliOutput.includes(secretMarker), 'Installer output must never print supplied secret values.');
console.log('SECRET_SAFE_CLI_EVIDENCE_PASS');

rmSync(workspace, { recursive: true, force: true });
console.log('RUNTIME_INSTALL_REGRESSION_PASS');
