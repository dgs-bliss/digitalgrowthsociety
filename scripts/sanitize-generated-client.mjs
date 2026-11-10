#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function sanitizeGeneratedClient(root = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const clientPath = resolve(root, 'tina/__generated__/client.ts');
  let changed = false;
  if (existsSync(clientPath)) {
    const source = readFileSync(clientPath, 'utf8');
    const sanitized = source
      .replace(/cacheDir:\s*'[^']*'/, "cacheDir: 'tina/__generated__/.cache'")
      .replace(/url:\s*'[^']*'/, "url: 'http://localhost:4001/graphql'")
      .replace(/token:\s*'[^']*'/, "token: ''");
    writeFileSync(clientPath, sanitized);
    changed ||= sanitized !== source;
  }
  for (const relative of ['tina/__generated__/types.ts', 'tina/__generated__/types.js']) {
    const path = resolve(root, relative);
    if (!existsSync(path)) continue;
    const source = readFileSync(path, 'utf8');
    const sanitized = source.replace(/url:\s*"https?:\/\/[^"\s]+"/g, 'url: "http://localhost:4001/graphql"');
    writeFileSync(path, sanitized);
    changed ||= sanitized !== source;
  }
  return changed;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  sanitizeGeneratedClient();
  console.log('Generated Tina client sanitized for source control.');
}
