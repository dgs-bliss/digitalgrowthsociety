#!/usr/bin/env node
import {
  chmodSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
  fsyncSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED_RUNTIME_KEYS = [
  'SITE_PROVISION_MODE',
  'SITE_URL',
  'DEPLOY_ADAPTER',
  'NEXT_PUBLIC_TINA_CLIENT_ID',
  'TINA_TOKEN',
  'NEXT_PUBLIC_TINA_BRANCH',
  'NEXT_PUBLIC_TINA_CONTENT_API_URL',
  'GITHUB_CONTENT_REPO',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_ROOT_FOLDER',
];

function fail(message) {
  throw new Error(message);
}

export function parseEnv(text) {
  const values = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    values.set(match[1], value);
  }
  return values;
}

export function validateRuntimeEnv(text) {
  const values = parseEnv(text);
  const missing = REQUIRED_RUNTIME_KEYS.filter((key) => !String(values.get(key) || '').trim());
  if (missing.length) fail(`Canonical runtime environment is missing required variables: ${missing.join(', ')}`);

  const placeholders = REQUIRED_RUNTIME_KEYS.filter((key) =>
    /^(?:change[-_ ]?me|placeholder|example|todo|your[-_]|xxx)/i.test(String(values.get(key) || '').trim()),
  );
  if (placeholders.length) fail(`Canonical runtime environment contains placeholder variables: ${placeholders.join(', ')}`);

  const folder = String(values.get('CLOUDINARY_ROOT_FOLDER')).trim();
  if (/^(?:media|uploads?|images?|assets?|cloudinary|default|root)$/i.test(folder)) {
    fail('CLOUDINARY_ROOT_FOLDER must be unique to the destination site, not a generic folder.');
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9_./-]*$/.test(folder)) {
    fail('CLOUDINARY_ROOT_FOLDER contains unsupported characters.');
  }

  return values;
}

function parseArgs(argv) {
  let source = '';
  const targets = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') source = argv[++index] || '';
    else if (arg === '--target') targets.push(argv[++index] || '');
    else fail(`Unknown argument: ${arg}`);
  }
  if (!source) fail('Usage requires --source /protected/site.env.');
  if (!targets.length) fail('Usage requires at least one --target /absolute/app/.env.');
  return { source, targets };
}

function safeRemove(path) {
  try {
    rmSync(path, { force: true });
  } catch {}
}

export function installRuntimeEnv({ source, targets }) {
  const sourcePath = resolve(source);
  const targetPaths = targets.map((target) => resolve(target));

  if (!existsSync(sourcePath)) fail(`Canonical source environment does not exist: ${sourcePath}`);
  if (new Set(targetPaths).size !== targetPaths.length) fail('Every runtime target path must be unique.');
  if (targetPaths.includes(sourcePath)) fail('Canonical source environment cannot also be a runtime target.');

  // Complete validation happens before creating or changing any target.
  const canonical = readFileSync(sourcePath, 'utf8');
  validateRuntimeEnv(canonical);
  const payload = canonical.endsWith('\n') ? canonical : `${canonical}\n`;
  const expected = parseEnv(payload);

  const plans = targetPaths.map((targetPath, index) => {
    const parent = dirname(targetPath);
    mkdirSync(parent, { recursive: true, mode: 0o700 });
    const existed = existsSync(targetPath);
    return {
      targetPath,
      tempPath: `${targetPath}.install-${process.pid}-${index}`,
      existed,
      previous: existed ? readFileSync(targetPath) : null,
      previousMode: existed ? statSync(targetPath).mode & 0o777 : null,
    };
  });

  try {
    for (const plan of plans) {
      safeRemove(plan.tempPath);
      const fd = openSync(plan.tempPath, 'wx', 0o600);
      try {
        writeFileSync(fd, payload, { encoding: 'utf8' });
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      chmodSync(plan.tempPath, 0o600);
      const staged = readFileSync(plan.tempPath, 'utf8');
      if (staged !== payload) fail('Staged runtime target failed canonical source byte equality.');
      const stagedValues = parseEnv(staged);
      for (const key of REQUIRED_RUNTIME_KEYS) {
        if (stagedValues.get(key) !== expected.get(key)) fail(`Staged runtime target failed value equality for ${key}.`);
      }
    }

    for (const plan of plans) renameSync(plan.tempPath, plan.targetPath);

    for (const plan of plans) {
      const installed = readFileSync(plan.targetPath, 'utf8');
      if (installed !== payload) fail('Installed runtime target failed canonical source byte equality.');
      const installedValues = parseEnv(installed);
      for (const key of REQUIRED_RUNTIME_KEYS) {
        if (installedValues.get(key) !== expected.get(key)) fail(`Installed runtime target failed value equality for ${key}.`);
      }
      if ((statSync(plan.targetPath).mode & 0o777) !== 0o600) fail('Installed runtime target does not have mode 0600.');
    }
  } catch (error) {
    for (const plan of plans) {
      safeRemove(plan.tempPath);
      if (plan.existed) {
        writeFileSync(plan.targetPath, plan.previous, { mode: plan.previousMode });
        chmodSync(plan.targetPath, plan.previousMode);
      } else {
        safeRemove(plan.targetPath);
      }
    }
    throw error;
  }

  return { targetCount: plans.length, requiredKeys: [...REQUIRED_RUNTIME_KEYS] };
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) {
  try {
    const result = installRuntimeEnv(parseArgs(process.argv.slice(2)));
    console.log(`SUPPLIED_CREDENTIAL_INSTALL_PASS targets=${result.targetCount} required_keys=${result.requiredKeys.length}`);
  } catch (error) {
    console.error(`SUPPLIED_CREDENTIAL_INSTALL_BLOCKED: ${error.message}`);
    process.exit(1);
  }
}
