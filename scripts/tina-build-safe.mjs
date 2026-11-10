#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { sanitizeGeneratedClient } from './sanitize-generated-client.mjs';

const local = process.argv.includes('--local');

const parseEnvFile = (path) => {
  if (!existsSync(path)) return {};
  const values = {};
  for (const raw of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');
    values[key] = value;
  }
  return values;
};

// Never let a token exported by another migration override this repository.
const siteEnv = { ...process.env };
for (const key of Object.keys(siteEnv)) {
  if (/^(TINA_|NEXT_PUBLIC_TINA_|PUBLIC_TINA_)/.test(key)) delete siteEnv[key];
}
Object.assign(siteEnv, parseEnvFile(resolve('.env')));

const protectedEntries = Object.entries(siteEnv).filter(([key, value]) =>
  /(TOKEN|PASSWORD|SECRET|PRIVATE_KEY|API_KEY)/i.test(key)
  && typeof value === 'string'
  && value.length >= 6,
);
const protectedValues = [...new Set(protectedEntries.map(([, value]) => value))];
const redact = (value = '') => {
  let output = String(value);
  for (const secret of protectedValues) output = output.split(secret).join('[REDACTED]');
  output = output.replace(/(token:\s+)([^\s]+)/gi, '$1[REDACTED]');
  return output;
};
const run = (args, env = siteEnv) => {
  const result = spawnSync('pnpm', ['exec', ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env,
    shell: process.platform === 'win32',
  });
  if (result.stdout) process.stdout.write(redact(result.stdout));
  if (result.stderr) process.stderr.write(redact(result.stderr));
  if (result.error) process.stderr.write(`${redact(result.error.message)}\n`);
  return result.status ?? 1;
};
const withoutTinaTokens = (source) => {
  const clean = { ...source };
  for (const key of Object.keys(clean)) {
    if (/TINA/i.test(key) && /TOKEN/i.test(key)) delete clean[key];
  }
  return clean;
};
const scanDirectory = (root) => {
  const findings = [];
  const walk = (path) => {
    for (const name of readdirSync(path)) {
      const child = join(path, name);
      const stat = statSync(child);
      if (stat.isDirectory()) walk(child);
      else {
        const body = readFileSync(child);
        protectedEntries.forEach(([key, secret]) => {
          if (body.includes(Buffer.from(secret))) findings.push({ key, file: child });
        });
      }
    }
  };
  if (existsSync(root)) walk(root);
  return findings;
};

let status = 1;
try {
  if (local) {
    status = run(['tinacms', 'build', '--local', '--skip-cloud-checks', '--noTelemetry', '-c', 'node --version']);
  } else {
    const cloudEnv = { ...siteEnv, TINA_DIRECT_CLOUD_CHECK: '1' };
    status = run(['tinacms', 'build', '--noTelemetry', '-c', 'node --version'], cloudEnv);
  }
  if (status === 0) {
    sanitizeGeneratedClient();
    const tokenFreeEnv = withoutTinaTokens(siteEnv);
    if (!local) status = run(['tinacms', 'build', '--skip-cloud-checks', '--noTelemetry', '-c', 'node --version'], tokenFreeEnv);
    if (status === 0) {
      sanitizeGeneratedClient();
      status = run(['astro', 'build'], tokenFreeEnv);
    }
  }
  if (status === 0) {
    const findings = scanDirectory(resolve('dist'));
    if (findings.length) {
      for (const finding of findings) process.stderr.write(`Secret scan failed: ${finding.key} found in ${finding.file}\n`);
      status = 1;
    } else {
      process.stdout.write(`Secret scan passed (${protectedEntries.length} protected values, zero dist matches).\n`);
    }
  }
} finally {
  sanitizeGeneratedClient();
}
process.exit(status);
