# ASTRO-DEMO-LOCK

This is the repository-level, fail-closed implementation contract for exact Astro + Tina demo migrations. `TINA-MIGRATION-GOLD.md` is the parent migration and release policy. GOLD must be updated and validated first; this lock receives every mechanically applicable design, browser, data-shape and release control afterward.

A build, SHA, `RELEASE_COMMIT`, HTTP `200`, screenshot taken at the wrong viewport, or verbal review cannot pass this lock. A required check that cannot run is `BLOCKED`, never silently skipped.

## Mandatory controls

1. **NO-PREMATURE-COMPLETION** — Local build, local capture, upload, extraction, restart, marker and route smoke are intermediate checkpoints. Completion requires the immutable live SHA, identical production lock, admin/island proof, cleanup and post-cleanup health.
2. **AUTHORITY-FIRST** — Name and hash one supplied authority before implementation. Reject unrelated themes, inherited designs, destination-derived expectations and approximations.
3. **GATE-SELF-TEST** — Keep a controlled negative mutation for every template family and shared structural area. Each must fail for its intended invariant.
4. **PRODUCTION-DATA-SHAPE** — Preserve wrappers across rich-text objects, strings, absent blocks and fallbacks; test with destination Tina production-shaped data.
5. **DESTINATION-ENV-ONLY** — Start build, preview and validation from a clean child environment containing only the approved destination Tina identity and origin.
6. **FRESH-PROCESS-AND-SHUTDOWN** — Prove PID, cwd and release-specific output; never validate a process that survived a rebuild; close browser work before orderly termination.
7. **SERIAL-BROWSER-GATES** — Run positive, controlled-negative and authenticated browser suites serially and retain each parsed exit result.
8. **RESOURCE-PREFLIGHT** — Measure `/`, `/tmp`, `/dev/shm`, memory and stale browser processes before browser-heavy work; resource exhaustion is a harness failure.
9. **DETERMINISTIC-TOOLCHAIN** — Use explicit verified Node/package-manager paths and record versions; shell-path failures block the build.
10. **PUBLISHER-BEFORE-FINAL-SHA** — Finish reversible Publisher save → backend → unique public reflection → exact restoration before final immutable packaging; post-cutover checks are read-only.
11. **TRUE-ORIGIN-AND-LIVE-PROOF** — Prove authoritative origin/vhost separately from CDN delivery, authenticate through canonical `/admin/`, and require a real authenticated island POST with non-empty query, variables, data and form metadata.
12. **SELF-CONTAINED-RUNTIME-AND-CLEANUP** — Own or explicitly map runtime dependencies; retain required dependency releases; remove stale archives, extraction directories, locks, diagnostics, obsolete links and owned cron jobs.
13. **STRUCTURED-EVIDENCE** — Emit sanitized machine-readable target, timestamp, source hash, final commit, route, viewport, browser dimensions, assertions, screenshot metric, interactions and exit status.
14. **CHECKPOINT-NOT-COMPLETION** — Enforce authority/hash → implementation → Publisher transaction → final branch tip → clean build/secret scan → fresh local positive → local negative → immutable deploy → live fingerprint → live positive → live negative → read-only admin/island → SHA parity → cleanup → post-cleanup health.
15. **MINIMAL-RETRY-DIAGNOSTICS** — Repair malformed methods, URLs, auth flows, shell paths, resource state, server identity and harness configuration before changing product code or weakening assertions.
16. **LITERAL-VISUAL-NON-APPROXIMATION** — Preserve the supplied demo’s authoritative DOM/classes, declarations, font binaries/imports/axes, exact heading and body font families, weights, sizes, line heights, letter spacing, text/background/border colours, dimensions, margins, padding, gaps, imagery, states, scripts/JavaScript, breakpoints and interactions exactly. The demo’s typography, palette and spacing must replace every conflicting old, inherited, boilerplate or destination style; an existing global font, CSS variable, theme palette or spacing token is never permission to retain it. Tina values may differ only inside locked wrappers. Any missing or mismatched font, colour, spacing, script or geometry check is `BLOCKED`, never accepted as visually close.
17. **SHA-HTTP-NOT-VISUAL-PROOF** — Build success, process health, matching SHA and HTTP `200` prove identity/availability only; they cannot replace DOM, computed-style, geometry, screenshot, responsive and interaction evidence.
18. **CLOUD-SOURCE-PRECEDENCE** — Run against destination Tina Cloud records and assert field-by-field precedence. Cloud-only editorial body, wrapper or hierarchy drift is a hard failure.
19. **REAL-WHEEL-STICKY-PROOF** — Require computed sticky state plus settled real-wheel geometry over multiple steps and containing-boundary release when practical; in-motion smooth scrolling is invalid evidence.
20. **RESPONSIVE-RAIL-TOC-CONTRACT** — Test both sides of the source breakpoint: desktop preserves the full sticky rail/card/TOC contract; compact/mobile hides it and exposes the intended static in-article TOC.
21. **COMPLETE-TEMPLATE-FAMILY-MATRIX** — Map and test home sections, archives, article, generic/editorial page, contact, sitemap, catch-all/404, CTA, global chrome and every supplied specialty family at all source breakpoints.
22. **FIXTURE-INTEGRITY-FIRST** — Keep authority fixtures outside implementation output with a checked SHA-256 manifest. Require unique normalized manifest paths; reject duplicate entries before hashing. Reject symlinked authority roots, manifests, fixture files or directories; require segment-safe lexical containment plus realpath containment inside the authority root. Enumerate the complete fixture tree and reject every unmanifested file. Reject missing, changed, extra, escaped, symlinked or destination-generated authority before opening a browser.
23. **DUAL-ARTIFACT-SECRET-SCAN** — After the final Tina command and sanitization, scan both completed `dist/` and the exact release archive for protected values, generated credentials, machine paths and `.env` inclusion.
24. **EXACT-SHA-PACKAGE-POINTER-PARITY** — Package from exact full `HEAD`, embed it in `RELEASE_COMMIT`, reopen the archive, and require equality across local HEAD, remote tip, archive marker, physical release and active pointer.
25. **FINAL-POST-CLEANUP-ACCEPTANCE** — After cleanup, rerun route/asset health, pointer/rollback/runtime dependency proof, canonical admin shell and required read-only live lock checks. Final reporting must use this state.
26. **EXECUTABLE-LOCK-READINESS** — Policy markers alone cannot pass this lock. Require validator-enforced executable preflight and controlled-negative preflight, all lock controls, a complete no-extra-file SHA-256 authority manifest, a real positive browser validator, a controlled-negative browser suite and real positive/negative lock commands. Missing authority or browser gates is machine-readable `BLOCKED` with exit `2`; never derive authority from the destination or point the positive lock command only at preflight.

27. **SCOPED-GATE-NOT-ACCEPTANCE** — Scoped Publisher runs are diagnostic and must emit a distinct non-acceptance marker. Only an unscoped schema-complete run may satisfy final acceptance.
28. **COMPLETE-DOCUMENT-RESTORATION** — Snapshot and hash each complete source document before mutation; require exact or explicitly normalized whole-document restoration, marker absence, and no unrelated drift after save/restore.
29. **RESPONSIVE-NAVIGATION-INTERACTION-CONTRACT** — Prove closed mobile navigation through 1024px, desktop navigation from 1025px, pointer and keyboard open/close, Escape focus return, link/outside close, resize reset, ARIA correctness, CMS links and zero overflow; include a controlled negative.
30. **PRODUCTION-RUNTIME-DEPENDENCY-CLOSURE** — Every SSR, generated-admin, startup and deployed-runtime import must resolve from production dependencies after a frozen production-only install and target-Node CMS-route startup.
31. **FRONTEND-ROUTE-RESOLUTION** — Protect permalink → `_sys` → document ID/hash → title-fallback priority with executable tests, including root, encoded and nested paths.
32. **CANONICAL-ALIAS-PARITY** — Lock every compatibility alias to an explicit canonical target and status while independently proving the canonical route.
33. **DETERMINISTIC-ADMIN-LOCATORS** — Admin gates must target a unique configured field/document identity and fail before mutation on ambiguous, stale or missing locators.
34. **CATEGORY-ISLAND-EDITABILITY** — Category islands require the same real-query, exact-variable, authoritative-data, stable-form and primary-form proof as Author islands.
35. **REPRESENTATION-SHAPE-MATRIX** — Prove object-rich-text, string, absent and fallback body representations preserve one DOM/style wrapper; include a wrapper-removal controlled negative.
36. **MANDATORY-RELEASE-COMMAND-SEQUENCE** — Validators must require and the release must execute preflight, positive/negative lock, responsive positive/negative, complete Publisher, post-Publisher lineage rebuild, live recheck and post-cleanup acceptance in order.

38. **DEMO-CARDINALITY-MULTICAT-EXCEPTION** — `MULTICAT-LOCK` outranks `ASTRO-DEMO-LOCK` cardinality. The demo category count never controls frontend cardinality. A demo showing one category locks one repeated badge's structure, classes, styling, geometry and responsive treatment, not the number of rendered badges. Repeat the demo category badge once for every saved category in exact backend order. The Tina category array controls count, order, labels, slugs and hrefs. This required repetition is not a DOM/source-parity violation. `ASTRO-DEMO-LOCK` may never justify `categories[0]`, `primaryCategory`, `.find(...)`, `.slice(0, 1)`, hidden remainder categories or discarded links. Require a two-or-more-category fixture and exact backend/public tuple proof.

## Transport gates inherited from GOLD

`AUTHENTICATED-GIT-PREFLIGHT`, `PROJECT-SECRET-MAP`, `CPANEL-ENDPOINT-NORMALIZATION` and `CPANEL-RESPONSE-NORMALIZATION` remain transport controls in `TINA-MIGRATION-GOLD.md`. If any prevents live proof, this lock is `BLOCKED`.

## LATEST-MIGRATION-INCIDENT-LEDGER — Herald News Today

The complete `HNT-001` through `HNT-054` problem → solution → prevention → evidence matrix in `TINA-MIGRATION-GOLD.md` is incorporated into this lock by ID and is mandatory here, including transport rows because any transport failure blocks honest live visual proof. The repository validator and lock preflight must require every ID in both documents and must verify the four-column semantics below. This condensed lock ledger preserves the full incident set without weakening any GOLD wording.

| ID | Problem encountered | Solution applied | Permanent prevention | Evidence |
|---|---|---|---|---|
| HNT-001 | Wrong default Tina organization made the supplied project appear missing. | Selected and verified the actual owner organization/project/repository/branch. | Enumerate and verify supplied identities; never substitute resources. | `97df6be`, `9e09e20`, `c4d971a` |
| HNT-002 | SSR runtime packages were development-only. | Moved required packages to production dependencies. | Production-only install and target-Node CMS-route startup. | `b606ff3` |
| HNT-003 | Fullcheck used stale routes and incorrect rendering comparisons. | Aligned canonical routes and field-specific comparison semantics. | Route-map-derived checks with text/asset negative cases. | `5d62c19` |
| HNT-004 | Tina token could be compiled into the server bundle. | Split generation/build, sanitized first and used `process.env`. | Two-stage token-free build plus byte scan. | `c30f0c4` |
| HNT-005 | Manual Page query omitted current schema fields. | Updated the complete fragment. | Schema-to-query field parity and non-empty live output checks. | `2f48557` |
| HNT-006 | Publisher restore was not byte-exact. | Restored the original bytes. | Baseline/restoration hashes and unrelated-drift proof. | `1c76788` |
| HNT-007 | Responsive navigation breakpoint/interactions were broken or unproven. | Fixed CSS/behavior and added pointer/keyboard tests. | Breakpoint, ARIA, focus, resize and overflow interaction matrix. | `7c0aa23` |
| HNT-008 | Template and collection acceptance coverage was incomplete. | Expanded public-family and collection gates. | Complete inventory with positive and negative case per family/collection. | `68f3b27`, `ca65df7` |
| HNT-009 | Author/category edit islands lacked complete proof. | Added queries, fullcheck and Publisher cases. | Authenticated island and reversible public save proof per collection. | `8eb3a7c` |
| HNT-010 | Cloudinary could false-pass without full runtime/UI proof. | Required all runtime values and Media Manager list/upload/delete. | Exact active/rollback env plus UI proof; SDK-only forbidden. | `a96a2b6` |
| HNT-011 | Homepage drifted from source. | Restored exact structure/CSS. | Immutable authority and desktop/mobile DOM/geometry/screenshots. | `2386fae` |
| HNT-012 | “View on site” generated wrong routes. | Added canonical mapper/tests. | Deterministic collection route tests. | `2386fae` |
| HNT-013 | Informational pages were redesigned instead of source-locked. | Restored exact wrappers/assets/geometry. | Per-family desktop/mobile authority. | `496c9c9` |
| HNT-014 | Legacy article URL was lost. | Added one tested canonical alias. | Pre-cutover URL inventory and exact alias tests. | `496c9c9` |
| HNT-015 | Contact-specific accent/geometry defects escaped generic checks. | Added exact DOM/geometry/image assertions. | Template-specific positive and negative locks. | `e6a5828` |
| HNT-016 | Sticky rail declaration did not prove behavior. | Added real behavior and responsive TOC checks. | Settled real-wheel and breakpoint contract. | `e6a5828`, `dabaa37` |
| HNT-017 | Publisher navigation selector was brittle. | Switched to the stable baseline row. | Unique field/baseline-derived selectors only. | `781d4c9` |
| HNT-018 | Authority corpus was partial/self-referential. | Added complete hashed source/DOM/screenshot fixtures. | Separate no-extra-file, non-symlinked authority verified first. | `dabaa37`, `369482e` |
| HNT-019 | Cloud rich text changed body hierarchy. | Kept structural wrapper outside data-shape branches. | Same wrapper contract for object/string/absent/fallback. | `4b175f5` |
| HNT-020 | Token aliases leaked into generated admin/archive. | Stripped all Tina-token aliases and rescanned final/live artifacts. | All-stage alias stripping plus source/dist/archive/live scans. | `dff4174`, `945ca94` |
| HNT-021 | Intermediate checkpoints looked complete. | Continued through final live acceptance. | `NO-PREMATURE-COMPLETION`. | `ce4a025` |
| HNT-022 | Authority was not frozen first. | Named and hashed the source. | `AUTHORITY-FIRST`. | `dabaa37`, `ce4a025` |
| HNT-023 | Validator could not prove it detected claimed defects. | Added intended-failure mutations. | `GATE-SELF-TEST`. | `e6a5828`, `dabaa37` |
| HNT-024 | Local data shape hid Cloud defects. | Tested production shapes and precedence. | `PRODUCTION-DATA-SHAPE`; `CLOUD-SOURCE-PRECEDENCE`. | `4b175f5`, `ce4a025` |
| HNT-025 | Inherited env could select another Tina project. | Used clean destination-only child env. | `DESTINATION-ENV-ONLY`. | `ce4a025` |
| HNT-026 | Stale server/shutdown noise confused verification. | Proved process identity and orderly shutdown. | `FRESH-PROCESS-AND-SHUTDOWN`. | `ce4a025` |
| HNT-027 | Parallel browsers caused contention/ambiguous evidence. | Serialized suites. | `SERIAL-BROWSER-GATES`. | `ce4a025` |
| HNT-028 | Resource exhaustion looked like product failure. | Added resource floors/preflight. | `RESOURCE-PREFLIGHT`. | `ce4a025` |
| HNT-029 | Non-interactive shell missed toolchain paths. | Used explicit verified binaries. | `DETERMINISTIC-TOOLCHAIN`. | `ce4a025` |
| HNT-030 | Local commit existed before remote auth/parity proof. | Verified authenticated push and remote tip. | `AUTHENTICATED-GIT-PREFLIGHT`. | `ce4a025` |
| HNT-031 | Publisher commits made a built/deployed SHA stale. | Rebuilt final restored branch tip; post-cutover read-only. | `PUBLISHER-BEFORE-FINAL-SHA`. | `ce4a025` |
| HNT-032 | Existing protected inputs risked being re-requested/mis-sourced. | Used the project secret map. | `PROJECT-SECRET-MAP`. | `ce4a025` |
| HNT-033 | cPanel port could be appended twice. | Normalized endpoint once. | `CPANEL-ENDPOINT-NORMALIZATION`. | `ce4a025` |
| HNT-034 | cPanel API array/object shapes broke root discovery. | Normalized responses and exact-domain selection. | `CPANEL-RESPONSE-NORMALIZATION`. | `ce4a025` |
| HNT-035 | CDN IP was mistaken for origin proof. | Used authoritative vhost inventory and SNI tests. | `TRUE-ORIGIN-PROOF`. | `ce4a025` |
| HNT-036 | Wrong island request shape produced false 404. | Used correct preview POST and validated payload/forms. | `AUTHENTICATED-ISLAND-POST`; harness-first diagnosis. | Launch #23; `ce4a025` |
| HNT-037 | Noncanonical initial admin URL caused false auth failure. | Authenticated at canonical `/admin/`. | `CANONICAL-ADMIN-LOGIN`. | Launch #23; `ce4a025` |
| HNT-038 | Runtime symlink depended on an older release. | Recorded/protected the owner release. | `SELF-CONTAINED-RUNTIME`. | `ce4a025` |
| HNT-039 | Temporary deploy artifacts/jobs remained. | Removed them and rechecked health. | `RETENTION-CLEANUP`. | `ce4a025` |
| HNT-040 | Truncated/unparsed logs were weak evidence. | Emitted parsed JSON and exits. | `STRUCTURED-EVIDENCE`. | `ce4a025` |
| HNT-041 | Publisher proof lacked durable exact-restoration evidence. | Retained sanitized transaction artifacts. | `EVIDENCE-ARTIFACT`. | `ce4a025` |
| HNT-042 | Out-of-order checks invalidated earlier proof. | Enforced one dependency-ordered sequence. | `CHECKPOINT-NOT-COMPLETION`. | `ce4a025` |
| HNT-043 | Bad probes risked unnecessary product changes. | Fixed harness before product/assertions. | `MINIMAL-RETRY-DIAGNOSTICS`. | `ce4a025` |
| HNT-044 | Approximate design differed from literal source. | Restored literal templates/assets. | `LITERAL-VISUAL-NON-APPROXIMATION`. | `ca65df7`, `dabaa37` |
| HNT-045 | SHA/HTTP health was mistaken for visual proof. | Separated identity and visual gates. | `SHA-HTTP-NOT-VISUAL-PROOF`. | `aae7aca` |
| HNT-046 | Cloud selected a different body hierarchy. | Fixed and declared source precedence. | `CLOUD-SOURCE-PRECEDENCE`. | `4b175f5` |
| HNT-047 | In-motion smooth scroll gave invalid sticky measurements. | Used settled wheel steps/boundary. | `REAL-WHEEL-STICKY-PROOF`. | `dabaa37` |
| HNT-048 | Desktop rail fixes could break compact TOC. | Locked each responsive mode separately. | `RESPONSIVE-RAIL-TOC-CONTRACT`. | `dabaa37` |
| HNT-049 | Highlight-only review omitted template families. | Added complete family matrix. | `COMPLETE-TEMPLATE-FAMILY-MATRIX`. | `dabaa37` |
| HNT-050 | Manifest allowed duplicate/escaped/symlinked/extra authority risks. | Added full integrity and containment checks. | `FIXTURE-INTEGRITY-FIRST`. | `369482e`, `ad6c7fa`, `c324082` |
| HNT-051 | Dist-only scan missed archive/admin secrets. | Scanned dist, members and live JS. | `DUAL-ARTIFACT-SECRET-SCAN`. | `dff4174`, `945ca94` |
| HNT-052 | Upload/short SHA did not prove release identity. | Reopened exact full-SHA archive and compared all pointers. | `EXACT-SHA-PACKAGE-POINTER-PARITY`. | `aae7aca` |
| HNT-053 | Cleanup could invalidate a prior pass. | Repeated acceptance after cleanup. | `FINAL-POST-CLEANUP-ACCEPTANCE`. | `aae7aca` |
| HNT-054 | Policy markers could pass without executable gates. | Added preflight, exact wiring and negative preflight. | `EXECUTABLE-LOCK-READINESS`. | `531166f`–`ef86629` |
| HNT-055 | Scoped Publisher runs emitted the full-success marker. | Added validated scope handling and a distinct scoped result. | `SCOPED-GATE-NOT-ACCEPTANCE`. | `e3af2ef`; delayed audit |
| HNT-056 | `grep -q` plus `pipefail` made archive verification exit 141 on tar SIGPIPE. | Parsed archive members directly. | Direct archive parsing with preserved exits. | Launch #23 packaging evidence |
| HNT-057 | cPanel pointer rename used `dest` instead of `destination`. | Used the documented parameter and verified API status/pointers. | Exact API schema and response validation. | Launch #23 cutover evidence |
| HNT-058 | UAPI could not create Passenger `tmp/restart.txt`. | Extracted a bounded restart-marker archive via API2. | Tested fallback plus live fingerprint proof. | Launch #23 restart evidence |
| HNT-059 | Default `urllib` polling reported errors while browser-like curl returned 200. | Rechecked headers, client and release fingerprint. | Client-fingerprint disagreement is diagnostic, not product failure. | Launch #23 activation evidence |
| HNT-060 | Default `urllib` received 403 fetching the live admin asset. | Resolved the live hashed entry and fetched with browser headers. | Browser-equivalent live-asset secret scan. | Launch #23 admin-scan evidence |
| HNT-061 | A `/tmp` Playwright ESM helper could not resolve project dependencies. | Executed it inside the package tree and cleaned it. | Project-importing helpers run under the package tree. | Resume session |
| HNT-062 | Author/Category islands returned hollow HTTP-200 forms. | Required real query, variables, authoritative data and form identity. | Full island payload contract for both collections. | `8eb3a7c`; Launch #23 |
| HNT-063 | Fullcheck could omit a configured collection and stay green. | Enforced schema/test-map equality and omission-negative failure. | Coverage equality plus negative proof. | Resume session |
| HNT-064 | One mismatched doc hunk cancelled valid code hunks in a combined patch. | Reapplied small independently verified patches. | Multi-file atomic patches require exact pre-read hunks. | Resume session |
| HNT-065 | Non-authoritative fonts allowed fallback typography. | Self-hosted exact Plus Jakarta Sans assets. | Pinned/checksummed fonts plus computed-metric proof. | `ca65df7` |

This ledger is append-only under the same supersession rule as GOLD. Documentation presence alone still does not pass any row.

## Executable acceptance

Documentation presence is insufficient. The project must implement applicable checks in its source validator, demo-lock, controlled-negative suite, Tina/admin fullcheck, immutable packager/deployer and cleanup verification. The repository validator must reject a missing `ASTRO-DEMO-LOCK.md` or any missing mandatory control above.
