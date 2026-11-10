import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const applicationRoot = dirname(fileURLToPath(import.meta.url));
const explicitEnv = String(process.env.SITE_ENV_FILE || '').trim();
if (explicitEnv && !existsSync(resolve(explicitEnv))) {
  throw new Error(`SITE_ENV_FILE does not exist: ${explicitEnv}`);
}

const envCandidates = [
  explicitEnv ? resolve(explicitEnv) : '',
  join(applicationRoot, '.env'),
  join(process.cwd(), '.env'),
].filter(Boolean);
const envFile = envCandidates.find((candidate, index) => existsSync(candidate) && envCandidates.indexOf(candidate) === index);

if (envFile) {
  const content = readFileSync(envFile, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}

const requiredRuntime = [
  'SITE_URL',
  'NEXT_PUBLIC_TINA_CLIENT_ID',
  'TINA_TOKEN',
  'NEXT_PUBLIC_TINA_BRANCH',
  'GITHUB_CONTENT_REPO',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'CLOUDINARY_ROOT_FOLDER',
  'NEXT_PUBLIC_TINA_CONTENT_API_URL',
];
const missingRuntime = requiredRuntime.filter((name) => !String(process.env[name] || '').trim());
if (missingRuntime.length) {
  throw new Error(`Refusing to start: missing required runtime variables: ${missingRuntime.join(', ')}`);
}

const { startServer } = await import('./dist/server/entry.mjs');

startServer();
