This is a [TinaCMS](https://tina.io/) starter project.

Edit your site visually in the browser, ship it as fast static HTML.

## Getting started

Clone this repository into a new repository for the site. Do not copy a deployed
cPanel directory: this repository is the migration source of truth.

Install dependencies:

> [!NOTE]
> **[Which package manager is best for Node.js?](https://www.ssw.com.au/rules/best-package-manager-for-node)** The right one makes a real difference to your workflow. We recommend pnpm for its speed and efficient dependency handling — this SSW rule explains why.

```sh
pnpm install
```

Start the dev server, then edit visually at `localhost:4321/admin/`:

```sh
pnpm dev
```

## Features

- Visual editing via [`@tinacms/astro`](https://www.npmjs.com/package/@tinacms/astro) — a vanilla-JS bridge, with no React in the page tree
- Tailwind CSS v4 block builder: Hero, CTA, Features, Stats, Testimonial, Callout, Content, Split, and Video
- Light/dark theme toggle with a Tina-ember space theme
- Markdown and MDX with `<TinaMarkdown>` rich-text rendering
- Collections for Pages, Blog, Category, User, Navigation, and global Config
- Astro view transitions, SEO meta, OpenGraph, sitemap, and RSS
- Icons via [`astro-icon`](https://github.com/natemoo-re/astro-icon) and the Tabler set

## Deploying

The starter is host-neutral — it isn't tied to any one platform. Every content page is prerendered to static HTML; the only on-demand route is the `/tina-island` endpoint that powers live visual editing.

`astro.config.mjs` picks the right adapter automatically from the platform's build environment — [Vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/), [Cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) (Pages or Workers) and [Netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/) are detected and configured with no changes, and anywhere else falls back to a portable [Node](https://docs.astro.build/en/guides/integrations-guide/node/) server started with `pnpm start` / `node app.mjs`.

Set `SITE_URL` to your production URL — it feeds the sitemap, RSS, and OpenGraph tags; see `.env.example`. Most platforms inject their own deploy URL as a fallback, but Cloudflare Workers exposes none, so set `SITE_URL` there to avoid `localhost` canonicals.

### Before your first deploy: TinaCloud credentials

The default `pnpm build` compiles the CMS against TinaCloud, so it needs the complete per-site runtime configuration. Create a project at [app.tina.io](https://app.tina.io), then provision the site as described below. The required variables include `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, `NEXT_PUBLIC_TINA_BRANCH`, `GITHUB_CONTENT_REPO`, all four Cloudinary variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and a unique `CLOUDINARY_ROOT_FOLDER`), and `NEXT_PUBLIC_TINA_CONTENT_API_URL`.

To build without TinaCloud — a purely local/offline build with no auth — run `pnpm build:local` instead, which skips the cloud checks.

## Provisioning many independent sites

The canonical release and acceptance procedure is
[`TINA-MIGRATION-GOLD.md`](./TINA-MIGRATION-GOLD.md). It is mandatory for every
new migration and separates a locally verified source candidate from a fully
cloud/live-accepted deployment. The protected rollback baseline tag remains
`tina-migration-gold-2026-10-17`; improvements are committed above it rather
than moving or rewriting that tag.

Each new publisher must have its own repository, Tina project/client ID and token,
site URL, and Cloudinary folder. A shared Cloudinary account is supported, but use
a unique root folder and preferably a named per-site API key. Never copy the
boilerplate's `.env`, generated `public/admin/` directory, Tina identity,
Formspree form, or source-site API key/secret pair.

1. Clone this repository into the new site's repository.
2. Copy `site.manifest.example.json` to an ignored file such as
   `site.manifest.json` and replace every placeholder. Use
   `"mode": "independent"` for a new site. `"same-site-migration"` is only for
   moving an existing domain while deliberately preserving that site's service
   identities.
3. Run the source checks before the first push:

   ```sh
   pnpm install --frozen-lockfile
   pnpm site:provision -- --manifest site.manifest.json
   pnpm validate:site
   pnpm build:local
   pnpm astro check
   ```

   Provisioning writes a mode-`0600`, ignored `.env` and updates the neutral site
   identity in `src/content/config/config.json`. It refuses placeholders and, for
   independent sites, rejects the source boilerplate's domain, Tina project,
   repository and Cloudinary root folder.

4. Commit the new site's source and push its Tina branch. Wait for Tina Cloud to
   index that branch, then run `pnpm build`. The production build intentionally
   checks the schema directly against Tina Cloud before generating the proxy-based
   deployed admin bundle, so a stale or unauthorized branch fails instead of
   silently shipping.
5. Create a unique Formspree form and set its endpoint in the manifest or through
   Tina Global Config. Test that exact endpoint before enabling submissions.
6. Deploy `dist/server/`, `dist/client/`, `public/admin/`, `src/content/`,
   `app.mjs`, package files and the site's untracked environment as one atomic
   release. Never reuse a generated admin bundle from another site.
7. Complete the logged-in Tina acceptance test: collections and SEO fields,
   existing multi-category selections, a temporary dynamic Category, Save →
   public reflection → exact reversion, navigation references, media upload and
   cleanup, and the live Formspree endpoint. Before restart, run
   `SITE_ENV_FILE=/absolute/path/to/application-root/.env pnpm validate:site`
   against the exact active and retained-rollback host environments. The Node
   startup entry fails closed if any required runtime variable is absent. For
   media, require an authenticated Media Manager list request returning `200`,
   visible controls with no error state, and a reversible UI upload/delete; a
   direct Cloudinary SDK test does not certify the Tina Media Manager.

Before committing the source boilerplate itself, follow the complete
`TINA-MIGRATION-GOLD.md` source-release gate and run `pnpm validate:starter`,
`pnpm build:local`, `pnpm astro check`, a tracked-secret scan, and `git diff --check`.
After push/deploy, complete the cloud-connected build, collection-complete
Publisher save → backend → public → exact-restore gate, integration checks, and
desktop/mobile live proof before describing the migration as stable.

## A note on React

`react` and `react-dom` are both pinned to the same version (`^19.2.7`) in `devDependencies` for the TinaCMS admin UI build only — the site itself ships zero React. The pin keeps the two packages locked in lockstep; without it, pnpm's peer auto-install can pair mismatched `react` / `react-dom` versions and the admin crashes on init (`Cannot read properties of undefined (reading 'ReactCurrentDispatcher')`). This is tracked in [tinacms#6985](https://github.com/tinacms/tinacms/issues/6985); remove the pin once Tina declares `react` / `react-dom` as direct dependencies.

## Want to learn more?

Read the [TinaCMS documentation](https://tina.io/docs) and the [Astro documentation](https://docs.astro.build), or come and say hello in the [TinaCMS Discord server](https://discord.gg/cG2UNREu).
