#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const strictRuntime = process.argv.includes('--runtime');
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(join(root, path), 'utf8');
const incidentIds = Array.from({ length: 65 }, (_, index) => `HNT-${String(index + 1).padStart(3, '0')}`);

function validateIncidentLedger(document, label) {
  if (!document.includes('LATEST-MIGRATION-INCIDENT-LEDGER')) fail(`${label} is missing the latest-migration incident ledger.`);
  for (const heading of ['Problem encountered', 'Solution applied', 'Permanent prevention', 'Evidence']) {
    if (!document.includes(heading)) fail(`${label} incident ledger is missing column ${heading}.`);
  }
  const rows = document.split(/\r?\n/).filter((line) => /^\| HNT-\d{3} \|/.test(line));
  for (const id of incidentIds) {
    const matches = rows.filter((line) => line.startsWith(`| ${id} |`));
    if (matches.length !== 1) fail(`${label} must contain exactly one complete incident row ${id}; found ${matches.length}.`);
    else {
      const cells = matches[0].split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells.length !== 5 || cells.some((cell) => !cell)) fail(`${label} incident row ${id} must contain non-empty ID, problem, solution, prevention and evidence cells.`);
    }
  }
  const unexpected = rows.map((line) => line.split('|')[1].trim()).filter((id) => !incidentIds.includes(id));
  if (unexpected.length) fail(`${label} contains unexpected incident rows: ${unexpected.join(', ')}.`);
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(root, path).replaceAll('\\', '/');
    if (['.git', 'node_modules', 'dist', '.astro'].includes(name) || rel === 'public/admin' || rel.startsWith('public/admin/')) continue;
    if (statSync(path).isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function loadDotEnv() {
  const explicit = String(process.env.SITE_ENV_FILE || '').trim();
  if (explicit && !existsSync(resolve(explicit))) {
    fail(`SITE_ENV_FILE does not exist: ${explicit}.`);
    return;
  }
  const candidates = [
    explicit ? resolve(explicit) : '',
    join(root, '.env'),
    join(process.cwd(), '.env'),
  ].filter(Boolean);
  const envPath = candidates.find((path, index) => existsSync(path) && candidates.indexOf(path) === index);
  if (!envPath) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const blogSchema = read('tina/collections/blog.ts');
if (!/name:\s*["']categories["'][\s\S]{0,300}type:\s*["']string["'][\s\S]{0,300}list:\s*true[\s\S]{0,300}CategoryCheckboxGroupField/.test(blogSchema)) {
  fail('Blog categories must use the collection-backed CategoryCheckboxGroupField with a string-list schema.');
}
if (/CATEGORY_OPTIONS|src\/content\/category\/[A-Za-z0-9_-]+\.json/.test(blogSchema)) fail('Blog collection contains hardcoded category options or document paths.');
const categoryFieldPath = join(root, 'tina/fields/category-checkbox-group.tsx');
if (!existsSync(categoryFieldPath)) fail('Collection-backed category field is missing.');
else {
  const field = readFileSync(categoryFieldPath, 'utf8');
  if (!/cms\.api\.tina\.request/.test(field) || !/categoryConnection/.test(field) || !/pageInfo/.test(field)) {
    fail('Category UI must paginate the authenticated Tina Category collection.');
  }
  if (/CATEGORY_OPTIONS|updateBlog|fetch\s*\(/.test(field)) fail('Category UI contains hardcoded options or its own mutation transport.');
  if (!/input\.onChange/.test(field)) fail('Category UI must update Tina form state through input.onChange.');
}

const proxy = read('src/pages/tina-content-proxy.ts');
if (/updateBlog|category-overrides|normalizeCategories|persistLocal|stripConfig|overrideBlogResponse/.test(proxy)) {
  fail('Tina proxy contains collection-specific compatibility or persistence logic.');
}
if (/request\.headers\.get\(['"]x-api-key['"]\)\s*\|\|\s*env\(['"]TINA_TOKEN['"]\)/.test(proxy)) {
  fail('Tina proxy must not elevate anonymous requests with the server-side Tina token.');
}

const forbidden = [
  [/First\s*For\s*News|First\s*for\s*News|FirstForNews/gi, 'former publication brand'],
  [/firstfornews\.net/gi, 'former publication domain'],
  [/boilerplate\.blissdrive\.net/gi, 'starter deployment domain baked into source'],
  [/40bc8cd1-d0fe-4061-b99c-d91be2de59e0/gi, 'starter Tina client ID'],
  [/xppwzoep/gi, 'starter Formspree form ID'],
  [/bliss-tinacms\/boilerplate/gi, 'starter repository baked into runtime source'],
  [/Splash\s*News\s*Wire/gi, 'former publication brand'],
  [/[A-Z]:\\\\Users\\\\/g, 'machine-specific Windows path'],
];
const textExtensions = new Set(['.ts', '.tsx', '.astro', '.js', '.mjs', '.json', '.md', '.mdx', '.py', '.yml', '.yaml', '.css']);
for (const path of walk(root)) {
  if (!textExtensions.has(extname(path))) continue;
  const rel = relative(root, path).replaceAll('\\', '/');
  if (['scripts/validate-starter.mjs', 'scripts/provision-site.mjs'].includes(rel)) continue;
  const text = readFileSync(path, 'utf8');
  for (const [pattern, label] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) fail(`${rel}: contains ${label}.`);
  }
  if (/NEXT_PUBLIC_TINA_TOKEN|PUBLIC_TINA_TOKEN|TINA_PUBLIC_TINA_TOKEN/.test(text) && !rel.startsWith('tina/__generated__/')) {
    fail(`${rel}: uses a public-prefixed Tina token variable.`);
  }
}

for (const path of walk(join(root, 'src/content'))) {
  if (!['.md', '.mdx', '.json'].includes(extname(path))) continue;
  const text = readFileSync(path, 'utf8');
  for (const match of text.matchAll(/src\/content\/(category|user)\/([^\s'"\]]+\.(?:json|mdx))/g)) {
    const target = join(root, 'src/content', match[1], match[2]);
    if (!existsSync(target)) fail(`${relative(root, path)}: missing reference ${match[0]}.`);
  }
}

if (!existsSync(join(root, 'pnpm-lock.yaml'))) fail('pnpm-lock.yaml is required for reproducible provisioning.');
if (!existsSync(join(root, 'tina/tina-lock.json'))) fail('tina/tina-lock.json is required after schema changes.');
if (!existsSync(join(root, 'scripts/provision-site.mjs'))) fail('scripts/provision-site.mjs is required for repeatable site provisioning.');
if (!existsSync(join(root, 'scripts/install-runtime-env.mjs'))) fail('scripts/install-runtime-env.mjs is required for zero-omission runtime installation.');
if (!existsSync(join(root, 'scripts/test-runtime-env.mjs'))) fail('scripts/test-runtime-env.mjs is required for runtime-install regression protection.');
if (!existsSync(join(root, 'site.manifest.example.json'))) fail('site.manifest.example.json is required for repeatable site provisioning.');
if (!existsSync(join(root, 'scripts/tina-build-safe.mjs'))) fail('scripts/tina-build-safe.mjs is required for direct Cloud schema checks and secret-safe generation.');
if (!existsSync(join(root, 'scripts/sanitize-generated-client.mjs'))) fail('scripts/sanitize-generated-client.mjs is required to keep generated credentials out of source control.');
if (!existsSync(join(root, 'scripts/validate-demo-lock-preflight.mjs'))) fail('scripts/validate-demo-lock-preflight.mjs is required for fail-closed ASTRO-DEMO-LOCK readiness.');
if (!existsSync(join(root, 'scripts/test-demo-lock-preflight-negative.mjs'))) fail('scripts/test-demo-lock-preflight-negative.mjs is required to prove ASTRO-DEMO-LOCK preflight rejection.');
if (!existsSync(join(root, 'TINA-MIGRATION-GOLD.md'))) fail('TINA-MIGRATION-GOLD.md is required as the canonical migration and acceptance process.');
else {
  const processDocument = read('TINA-MIGRATION-GOLD.md');
  validateIncidentLedger(processDocument, 'TINA-MIGRATION-GOLD.md');
  const requiredGates = [
    ['Source-release ready', 'source-release and cloud/live acceptance separation'],
    ['USER-PROVIDED-EVERYTHING-001', 'permanent global prerequisite truth control'],
    ['user_provided_everything_user_tested=true', 'standing supplied-and-tested declaration'],
    ['agent_assumption_cannot_override_user_verified_resources=true', 'agent-assumption override prohibition'],
    ["Agent assumptions have zero authority", 'explicit user-evidence precedence clause'],
    ['RESOURCE_EXISTENCE=PASS_USER_VERIFIED', 'user-verified resource existence invariant'],
    ['general `BLOCKED_ON_RESOURCES` status', 'general resource-blocked status prohibition'],
    ['Only one exact operation may be `AUTH_BLOCKED`', 'exact-operation-only auth blocker rule'],
    ['ZERO-OMISSION SUPPLIED-INPUT RULE', 'top-level supplied-input non-omission rule'],
    ['ASTRO-DEMO-LOCK', 'named exact-demo process gate'],
    ['design/styling is locked; Tina values stay dynamic', 'design-versus-dynamic-content contract'],
    ['Mandatory preflight before implementation', 'no-assumption source preflight gate'],
    ['Keep visible output Tina-driven', 'dynamic Tina content authority gate'],
    ['Make runtime environment authoritative', 'application-root environment precedence gate'],
    ['ZERO-OMISSION SUPPLIED-CREDENTIAL INSTALLATION GATE', 'mandatory supplied-credential installation gate'],
    ['pnpm runtime:install', 'executable active/rollback runtime installer gate'],
    ['SUPPLIED_CREDENTIAL_INSTALL_PASS', 'secret-safe supplied-credential acceptance evidence'],
    ['Query the verified Tina destination first', 'destination Tina endpoint and identity gate'],
    ['Treat schema changes as migrations', 'schema/lock/cloud migration gate'],
    ['MULTICAT-LOCK', 'multi-category preservation gate'],
    ['Keep public email addresses ordinary', 'public email anti-obfuscation gate'],
    ['Build and deploy one immutable release', 'atomic immutable deployment gate'],
    ['TINA-FULLCHECK', 'collection-complete fullcheck gate'],
    ['PUBLISHER-ADMIN-GATE', 'authenticated live-admin acceptance gate'],
    ['CLOUDINARY_ROOT_FOLDER', 'complete Cloudinary runtime environment gate'],
    ['authenticated Media Manager', 'authenticated Media Manager list/UI acceptance gate'],
    ['direct Cloudinary SDK', 'direct-SDK false-pass warning'],
    ['fail closed', 'runtime startup fail-closed gate'],
    ['exact restoration', 'reversible cleanup gate'],
    ['FAILURE-DERIVED EXECUTION GATES', 'failure-derived executable prevention section'],
    ['NO-PREMATURE-COMPLETION', 'no-premature-completion gate'],
    ['AUTHORITY-FIRST', 'authoritative-source identity gate'],
    ['GATE-SELF-TEST', 'controlled-negative validator self-test gate'],
    ['PRODUCTION-DATA-SHAPE', 'production Tina representation gate'],
    ['DESTINATION-ENV-ONLY', 'clean destination-environment gate'],
    ['FRESH-PROCESS-AND-SHUTDOWN', 'fresh-server and orderly-shutdown gate'],
    ['SERIAL-BROWSER-GATES', 'serial browser-suite gate'],
    ['RESOURCE-PREFLIGHT', 'disk/memory/browser resource gate'],
    ['DETERMINISTIC-TOOLCHAIN', 'explicit toolchain path gate'],
    ['AUTHENTICATED-GIT-PREFLIGHT', 'authenticated Git transport gate'],
    ['PUBLISHER-BEFORE-FINAL-SHA', 'Publisher-before-final-release lineage gate'],
    ['PROJECT-SECRET-MAP', 'project-specific protected-input lookup gate'],
    ['CPANEL-ENDPOINT-NORMALIZATION', 'cPanel host and port normalization gate'],
    ['CPANEL-RESPONSE-NORMALIZATION', 'cPanel API shape normalization gate'],
    ['TRUE-ORIGIN-PROOF', 'real origin and vhost proof gate'],
    ['AUTHENTICATED-ISLAND-POST', 'authenticated Tina island POST gate'],
    ['CANONICAL-ADMIN-LOGIN', 'canonical admin authentication gate'],
    ['SELF-CONTAINED-RUNTIME', 'release runtime-dependency ownership gate'],
    ['RETENTION-CLEANUP', 'post-release retention and cron cleanup gate'],
    ['STRUCTURED-EVIDENCE', 'machine-readable evidence gate'],
    ['EVIDENCE-ARTIFACT', 'sanitized admin transaction evidence gate'],
    ['CHECKPOINT-NOT-COMPLETION', 'ordered end-to-end acceptance gate'],
    ['MINIMAL-RETRY-DIAGNOSTICS', 'diagnostic-harness-before-product-change gate'],
    ['LITERAL-VISUAL-NON-APPROXIMATION', 'literal visual parity gate'],
    ['SHA-HTTP-NOT-VISUAL-PROOF', 'identity is not visual proof gate'],
    ['CLOUD-SOURCE-PRECEDENCE', 'Cloud source-precedence gate'],
    ['REAL-WHEEL-STICKY-PROOF', 'settled real-wheel sticky gate'],
    ['RESPONSIVE-RAIL-TOC-CONTRACT', 'desktop/mobile rail and TOC gate'],
    ['COMPLETE-TEMPLATE-FAMILY-MATRIX', 'all-template-family coverage gate'],
    ['FIXTURE-INTEGRITY-FIRST', 'immutable fixture integrity gate'],
    ['unique normalized manifest paths', 'unique normalized fixture-manifest path gate'],
    ['symlinked authority roots, manifests, fixture files or directories', 'symlinked authority rejection gate'],
    ['segment-safe lexical containment plus realpath containment', 'fixture authority containment gate'],
    ['reject every unmanifested file', 'complete fixture-corpus enumeration gate'],
    ['DUAL-ARTIFACT-SECRET-SCAN', 'dist and archive secret-scan gate'],
    ['EXACT-SHA-PACKAGE-POINTER-PARITY', 'exact immutable package and pointer parity gate'],
    ['FINAL-POST-CLEANUP-ACCEPTANCE', 'post-cleanup acceptance gate'],
    ['EXECUTABLE-LOCK-READINESS', 'executable lock readiness gate'],
    ['SCOPED-GATE-NOT-ACCEPTANCE', 'scoped Publisher non-acceptance gate'],
    ['COMPLETE-DOCUMENT-RESTORATION', 'complete-document restoration gate'],
    ['PRODUCTION-RUNTIME-DEPENDENCY-CLOSURE', 'production dependency closure gate'],
    ['RESPONSIVE-NAVIGATION-INTERACTION-CONTRACT', 'responsive navigation interaction gate'],
    ['FRONTEND-ROUTE-RESOLUTION', 'frontend route-resolution gate'],
    ['CANONICAL-ALIAS-PARITY', 'canonical alias parity gate'],
    ['DETERMINISTIC-ADMIN-LOCATORS', 'deterministic admin locator gate'],
    ['CATEGORY-ISLAND-EDITABILITY', 'category island editability gate'],
    ['REPRESENTATION-SHAPE-MATRIX', 'production representation-shape matrix gate'],
    ['MANDATORY-RELEASE-COMMAND-SEQUENCE', 'mandatory release command sequence gate'],
  ];
  for (const [needle, label] of requiredGates) {
    if (!processDocument.includes(needle)) fail(`TINA-MIGRATION-GOLD.md is missing the ${label}.`);
  }
}
if (!existsSync(join(root, 'ASTRO-DEMO-LOCK.md'))) fail('ASTRO-DEMO-LOCK.md is required as the repository-level exact-demo contract.');
else {
  const demoLock = read('ASTRO-DEMO-LOCK.md');
  validateIncidentLedger(demoLock, 'ASTRO-DEMO-LOCK.md');
  const requiredDemoControls = [
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
    'RESPONSIVE-NAVIGATION-INTERACTION-CONTRACT', 'FRONTEND-ROUTE-RESOLUTION',
    'CANONICAL-ALIAS-PARITY', 'DETERMINISTIC-ADMIN-LOCATORS', 'CATEGORY-ISLAND-EDITABILITY',
    'REPRESENTATION-SHAPE-MATRIX', 'MANDATORY-RELEASE-COMMAND-SEQUENCE',
  ];
  for (const marker of requiredDemoControls) {
    if (!demoLock.includes(marker)) fail(`ASTRO-DEMO-LOCK.md is missing mandatory control ${marker}.`);
  }
  for (const [needle, label] of [
    ['unique normalized manifest paths', 'unique normalized fixture-manifest paths'],
    ['symlinked authority roots, manifests, fixture files or directories', 'symlinked authority rejection'],
    ['segment-safe lexical containment plus realpath containment', 'fixture authority containment'],
    ['reject every unmanifested file', 'complete fixture-corpus enumeration'],
  ]) {
    if (!demoLock.includes(needle)) fail(`ASTRO-DEMO-LOCK.md is missing ${label}.`);
  }
  for (const marker of ['AUTHENTICATED-GIT-PREFLIGHT', 'PROJECT-SECRET-MAP', 'CPANEL-ENDPOINT-NORMALIZATION', 'CPANEL-RESPONSE-NORMALIZATION']) {
    if (!demoLock.includes(marker)) fail(`ASTRO-DEMO-LOCK.md is missing inherited GOLD blocker ${marker}.`);
  }
}
for (const path of walk(root)) {
  const rel = relative(root, path).replaceAll('\\', '/');
  if (/(?:\.before-|\.bak(?:-|\/))[0-9-]*/.test(rel)) fail(`${rel}: backup files must not be tracked or shipped.`);
  if (/^_hermes-/.test(rel) || rel === 'nulmkdir') fail(`${rel}: one-off migration helper/scratch files must not be tracked or shipped.`);
}
const gitignore = read('.gitignore');
if (/^pnpm-lock\.yaml$/m.test(gitignore)) fail('pnpm-lock.yaml must be tracked.');
if (!/^\.env$/m.test(gitignore) && !/^\.env\*$/m.test(gitignore)) fail('.env secrets must be ignored.');
if (!/^site\.manifest\.json$/m.test(gitignore)) fail('Filled site.manifest.json files must be ignored.');
const packageJson = JSON.parse(read('package.json'));
for (const command of ['site:provision', 'runtime:install', 'runtime:test', 'sanitize:generated', 'validate:starter', 'validate:site', 'tina:fullcheck', 'astro:demo-lock:preflight', 'astro:demo-lock:preflight:negative']) {
  if (!packageJson.scripts?.[command]) fail(`package.json is missing ${command}.`);
}
for (const [command, expected] of Object.entries({
  'astro:demo-lock:preflight': 'node scripts/validate-demo-lock-preflight.mjs',
  'astro:demo-lock:preflight:negative': 'node scripts/test-demo-lock-preflight-negative.mjs',
})) {
  if (packageJson.scripts?.[command] !== expected) fail(`package.json ${command} must equal ${expected}.`);
}
const demoLockPreflight = read('scripts/validate-demo-lock-preflight.mjs');
const demoLockPreflightNegative = read('scripts/test-demo-lock-preflight-negative.mjs');
for (const marker of ['duplicate-manifest-path', 'non-normalized-manifest-path', 'fixture-hash-drift', 'unmanifested-fixture', 'fixture-symlink', 'fixture-realpath-outside-authority']) {
  if (!demoLockPreflight.includes(marker)) fail(`ASTRO-DEMO-LOCK preflight is missing fixture-integrity marker ${marker}.`);
}
for (const mutation of ['duplicate-manifest-path', 'non-normalized-manifest-path', 'fixture-hash-drift', 'unmanifested-fixture', 'fixture-symlink']) {
  if (!demoLockPreflightNegative.includes(mutation)) fail(`ASTRO-DEMO-LOCK negative suite is missing fixture-integrity mutation ${mutation}.`);
}
for (const marker of ['LATEST-MIGRATION-INCIDENT-LEDGER', 'missing-incident-ledger-row', 'length: 65']) {
  if (!demoLockPreflight.includes(marker)) fail(`ASTRO-DEMO-LOCK preflight is missing incident-ledger enforcement marker ${marker}.`);
}
if (!demoLockPreflightNegative.includes('missing-incident-ledger-row')) fail('ASTRO-DEMO-LOCK negative suite is missing the incident-ledger row-removal mutation.');
const astroConfig = read('astro.config.mjs');
if (!/loadEnv\s*\(/.test(astroConfig) || !/configuredEnv\(['"]SITE_URL['"]\)/.test(astroConfig)) {
  fail('astro.config.mjs must load SITE_URL from the active .env mode before generating absolute URLs.');
}
const baseHead = read('src/components/BaseHead.astro');
if (!/declaredIsLocal/.test(baseHead) || !/requestIsPublic/.test(baseHead)) {
  fail('BaseHead must replace only a localhost placeholder with the public request origin.');
}
if (packageJson.scripts?.['provision:clone']) fail('Legacy clone/search-replace provisioning command must not exist.');
const runtimeInstaller = read('scripts/install-runtime-env.mjs');
for (const marker of ['REQUIRED_RUNTIME_KEYS', 'CLOUDINARY_ROOT_FOLDER', 'renameSync', '0o600', 'SUPPLIED_CREDENTIAL_INSTALL_PASS']) {
  if (!runtimeInstaller.includes(marker)) fail(`Runtime installer is missing enforcement marker ${marker}.`);
}
const runtimeRegression = read('scripts/test-runtime-env.mjs');
for (const marker of ['INCOMPLETE_SOURCE_NO_TARGET_MODIFICATION_PASS', 'INCOMPLETE_RUNTIME_STARTUP_BLOCK_PASS', 'SECRET_SAFE_CLI_EVIDENCE_PASS']) {
  if (!runtimeRegression.includes(marker)) fail(`Runtime regression suite is missing ${marker}.`);
}
const startup = read('app.mjs');
for (const name of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'CLOUDINARY_ROOT_FOLDER']) {
  if (!startup.includes(`'${name}'`) && !startup.includes(`"${name}"`)) fail(`app.mjs must fail closed when ${name} is missing.`);
}
if (!/missing required runtime variables/.test(startup) || !/throw new Error/.test(startup)) {
  fail('app.mjs must fail closed before server startup when required runtime variables are missing.');
}

for (const relative of ['tina/__generated__/client.ts', 'tina/__generated__/types.ts', 'tina/__generated__/types.js']) {
  const generated = read(relative);
  if (/\/home\/[^/]+\//.test(generated)) fail(`${relative} contains a machine-specific home path.`);
  if (/token:\s*['"][A-Za-z0-9_-]{20,}['"]/.test(generated)) fail(`${relative} contains a generated credential literal.`);
}

const globalConfig = JSON.parse(read('src/content/config/config.json'));
const endpoint = String(globalConfig.contactForm?.formspreeEndpoint || '');
if (endpoint && !/^https:\/\/formspree\.io\/f\/[A-Za-z0-9_-]+$/.test(endpoint)) fail('Global Formspree endpoint is malformed.');

if (strictRuntime) {
  loadDotEnv();
  const required = [
    'SITE_PROVISION_MODE', 'SITE_URL', 'NEXT_PUBLIC_TINA_CLIENT_ID', 'TINA_TOKEN', 'NEXT_PUBLIC_TINA_BRANCH',
    'GITHUB_CONTENT_REPO', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET', 'CLOUDINARY_ROOT_FOLDER', 'NEXT_PUBLIC_TINA_CONTENT_API_URL',
  ];
  for (const name of required) if (!String(process.env[name] || '').trim()) fail(`Missing runtime variable ${name}.`);
  for (const name of required) {
    const value = String(process.env[name] || '').toLowerCase();
    if (/replace-with|example\.com|placeholder|your[_-]/.test(value)) fail(`Runtime variable ${name} still contains a placeholder.`);
  }
  const siteUrl = String(process.env.SITE_URL || '');
  const provisionMode = String(process.env.SITE_PROVISION_MODE || '');
  if (!['independent', 'same-site-migration'].includes(provisionMode)) fail('SITE_PROVISION_MODE must be independent or same-site-migration.');
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.protocol !== 'https:' || parsed.origin !== siteUrl || parsed.username || parsed.password) {
        fail('SITE_URL must be a valid HTTPS origin without credentials, path, query, or fragment.');
      }
    } catch {
      fail('SITE_URL must be a valid HTTPS origin without credentials, path, query, or fragment.');
    }
  }
  const repo = String(process.env.GITHUB_CONTENT_REPO || '');
  if (repo && !/^[^/\s]+\/[^/\s]+$/.test(repo)) fail('GITHUB_CONTENT_REPO must use owner/repository format.');
  const folder = String(process.env.CLOUDINARY_ROOT_FOLDER || '').toLowerCase();
  if (provisionMode === 'independent' && ['boilerplate', 'starter', 'default'].includes(folder)) fail('CLOUDINARY_ROOT_FOLDER must be unique to the independent site.');
  const apiUrl = String(process.env.NEXT_PUBLIC_TINA_CONTENT_API_URL || '');
  if (siteUrl && apiUrl !== `${siteUrl}/tina-content-proxy`) fail('NEXT_PUBLIC_TINA_CONTENT_API_URL must use this site origin.');
}

if (failures.length) {
  console.error(`Starter validation failed (${new Set(failures).size}):`);
  for (const item of [...new Set(failures)]) console.error(`- ${item}`);
  process.exit(1);
}
console.log(`Starter validation passed${strictRuntime ? ' (provisioned site runtime)' : ' (neutral source)'}.`);
