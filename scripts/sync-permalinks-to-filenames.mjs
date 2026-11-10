import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

function slugify(value, collection) {
  if (!value || typeof value !== 'string') return '';
  let input = value.trim().toLowerCase();
  if (!input) return '';
  if (input.startsWith('http://') || input.startsWith('https://')) input = input.split('/').slice(3).join('/');
  input = input.split('?')[0].split('#')[0].replaceAll('\\', '/');
  while (input.startsWith('/')) input = input.slice(1);
  while (input.endsWith('/')) input = input.slice(0, -1);
  if (collection === 'blog' && input.startsWith('blog/')) input = input.slice(5);
  if (collection === 'page' && input.startsWith('blog/')) input = input.slice(5);

  let output = '';
  let dash = false;
  for (const ch of input) {
    const ok = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch === '/' || ch === '-' || ch === '_' || ch === '.';
    if (ok) {
      output += ch;
      dash = false;
    } else if (!dash) {
      output += '-';
      dash = true;
    }
  }
  while (output.startsWith('-')) output = output.slice(1);
  while (output.endsWith('-')) output = output.slice(0, -1);
  while (output.includes('//')) output = output.replaceAll('//', '/');
  return output;
}

function readPermalink(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return '';
  for (const line of match[1].split(/\r?\n/)) {
    const found = line.match(/^permalink\s*:\s*(.*)$/);
    if (!found) continue;
    let value = found[1].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return value.trim();
  }
  return '';
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function backupFile(file) {
  const rel = path.relative(root, file);
  const dest = path.join(root, '_hermes-backups', stamp, rel);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(file, dest);
  return dest;
}

function syncCollection(collection) {
  const dir = path.join(root, 'src', 'content', collection);
  if (!fs.existsSync(dir)) return 0;
  let changed = 0;
  const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  for (const entry of files) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
    const file = path.join(entry.parentPath || dir, entry.name);
    const relFromDir = path.relative(dir, file).replaceAll('\\', '/');
    if (collection === 'page' && relFromDir === 'home.mdx') continue;

    let text = '';
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const permalink = readPermalink(text);
    if (!permalink) continue;
    const slug = slugify(permalink, collection);
    if (!slug) continue;
    const currentSlug = relFromDir.replace(/\.mdx$/, '');
    if (slug === currentSlug) continue;

    const target = path.join(dir, slug + '.mdx');
    if (fs.existsSync(target)) {
      console.warn(`[permalink-sync] SKIP duplicate target: ${collection}/${relFromDir} -> ${slug}.mdx already exists`);
      continue;
    }
    backupFile(file);
    ensureDir(path.dirname(target));
    fs.renameSync(file, target);
    console.log(`[permalink-sync] RENAMED ${collection}: ${relFromDir} -> ${slug}.mdx`);
    changed++;
  }
  return changed;
}

export function syncPermalinksToFilenames() {
  return syncCollection('blog') + syncCollection('page');
}

if (import.meta.url === `file://${process.argv[1].replaceAll('\\', '/')}`) {
  const changed = syncPermalinksToFilenames();
  console.log(`[permalink-sync] Done. Renamed ${changed} file(s).`);
}