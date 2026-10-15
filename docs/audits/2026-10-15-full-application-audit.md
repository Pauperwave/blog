# Full application audit — 2026-10-15

Point-in-time audit of the whole blog (build pipeline, content, app code, scripts, CI, dependencies,
docs). Every finding below was verified against the code, a tool run, or the live site; where it was
not verified, it says so.

## Method and baseline

| Check | Result |
|-------|--------|
| `pnpm run lint` | Clean (exit 0) |
| `pnpm run test:run` | 17 files / 171 tests pass |
| `pnpm run typecheck` (app + scripts + modules) | Clean (exit 0) |
| `pnpm run check:loose-types` | Clean (2 accepted `loose-ok`) |
| `pnpm audit --prod` | 60 advisories: 4 critical, 30 high, 18 moderate, 8 low (all transitive, see F7) |
| `pnpm outdated` | 19 packages behind (patch/minor; `@takumi-rs/*` 2.5.2 → 2.15.2 is the biggest gap) |
| Content validator (ad hoc script over `content/`) | 158 files; see F10 |
| Live probe of every URL in production `sitemap.xml` (`curl`, status only) | 35 × 200, **107 × 404** (F1) |

Not done: no browser/visual verification, no Lighthouse/Core Web Vitals run, no full `generate`
build (the `.vercel/output` inspected is a local build from 2026-10-10, i.e. stale relative to
`HEAD`; it was used only to understand routing, and production was probed directly for anything
that depended on it).

## Summary

| # | Finding | Severity |
|---|---------|----------|
| F1 | 107 of 142 sitemap URLs return 404 in production (all articles older than 3 months) | **High** |
| F2 | `::magic-cards` / `::magic-card` fetch Scryfall live in the browser instead of using the build-time DB | Medium |
| F3 | Card-data refresh can commit/deploy an empty or corrupt DB; DB differs on every run | Medium |
| F4 | MDC attributes built by string interpolation without escaping | Medium |
| F5 | Transformer folder/template matching is substring-based and inconsistent between modules | Low–Medium |
| F6 | Scryfall fallback at build time is sequential, uncached and unthrottled | Low–Medium |
| F7 | 60 dependency advisories (all transitive, build-time) | Low (practical) |
| F8 | Card-name trigger is not keyboard accessible | Medium (a11y) |
| F9 | No security headers on the static deployment | Low |
| F10 | Content hygiene: missing descriptions, date/filename mismatches, dead frontmatter | Low |
| F11 | Dead code and duplicated logic | Low |
| F12 | Untested pure logic (violates the repo's own unit-test default) | Low |
| F13 | Documentation drift, including the root `CLAUDE.md` | Low |
| F14 | Convention violations: Italian comments, leftover debug log | Low |

---

## F1 — Older articles 404 in production (High)

**What happens.** `nuxt.config.ts` skips every `/articles/YYYY-MM-DD-*` route older than 3 months
(`prerender:routes` + `prerender:generate` hooks). The documentation (`CLAUDE.md:41`,
`docs/AGENTS.md:8`) says those are "served on-demand / server-rendered on demand". They are not:
the deployment is `vercel-static`, there is no `functions/` directory, and the generated
`.vercel/output/config.json` routes end in `{ "handle": "filesystem" }` with no fallback rewrite to
`200.html`. A route with no prerendered file therefore falls through to `404.html`.

**Evidence.**
- Local `.vercel/output/static/articles/` contains 26 article directories vs. 158 markdown sources.
- Production probe of all 142 `sitemap.xml` URLs: 35 return 200, 107 return 404 — 92 of the 404s are
  articles from 2026 (the cutoff is relative to the build date), the rest are older. Sample:
  `/articles/2019-05-01-vantaggio-carte-vantaggio-tempo`, `/articles/2020-02-18-regole-report`.
- A recent article (`/articles/2026-08-24-combo-class-part-1`) returns 200 with the real `<title>`;
  the 404 response body for an old one is the Nuxt app shell (`404.html`), not article HTML.

**Impact.** In a normal browser the article still *appears*: the response is HTTP 404 but its body is
the generic SPA shell (identical, byte for byte, to the response for a nonexistent URL such as
`/articles/does-not-exist`), and the client router then renders the article from the in-browser
content database. What breaks is everything that does not run JavaScript or that trusts the status
code:
- search engines see a 404 and de-index the page, while the sitemap keeps advertising it;
- link previews (Telegram, WhatsApp, Discord, X) read the HTML only and get no title, description or
  OG image;
- no-JS clients get an empty shell;
- the 404 response is served with `s-maxage=604800`, so the CDN caches it for a week.

Every month the cutoff moves, more articles drop out. Confirmed with `curl -i` on
`/articles/2019-05-01-vantaggio-carte-vantaggio-tempo` (404, 9,964-byte shell, no article title).

**Broken header image (confirmed in Chrome, same URL).** The client-rendered article shows a
broken-image placeholder and a blank gap where the thumbnail should be. The `<NuxtImg>` in
`PageHeader.vue` emits `/_ipx/q_80/assets/blog/arts/vma-70-frantic-search.jpg` (`naturalWidth` 0,
HTTP 404), while the source file `/assets/blog/arts/vma-70-frantic-search.jpg` returns 200. `_ipx`
variants only exist if the crawler hit them while prerendering a page; this deployment has no
runtime ipx function (see the 2026-07-11 audit), so any page that is not prerendered renders image
URLs that were never generated. Body images that use plain `/assets/...` paths or Scryfall URLs load
fine, which is why only the `NuxtImg`-based ones break. Consequence for the options below: option 2
(SPA fallback) would **not** fix images on old articles by itself.

**Why it exists.** The cutoff came from the build-time work in
`docs/audits/2026-07-11-build-performance-investigation.md`; the "on-demand" assumption is the same
kind of mistaken assumption that audit documents for `_ipx`.

**Options (pick one).**
1. Drop the 3-month cutoff and prerender everything; recover build time elsewhere (OG-image cache is
   already on, `buildCache: true`).
2. Keep the cutoff but give old articles a real fallback: a Vercel rewrite of `/articles/(.*)` to
   `/200.html` so the SPA renders them client-side (weak for SEO and first paint, and `NuxtImg`
   thumbnails would still 404 unless they are switched to plain `/assets/...` URLs for these pages).
3. Move to an SSR/ISR deployment for `/articles/**` (changes the "100% static" property the
   `_ipx` handling depends on).

Whatever is chosen, remove the stale claim from `CLAUDE.md` and `docs/AGENTS.md` (F13) and exclude
whatever is not served from `sitemap.xml`.

**Resolution (2026-10-15): option 1 implemented.** A timed full `pnpm run generate` without the
cutoff settled it: 985 routes prerendered in 141.7 s, 3 m 53 s wall total, 0 errors, 0 OG-image
timeouts, 133 article pages (vs 26), 225 MB output — doubling the routes added only ~22 s of
prerender over the cutoff build, because the real July costs (OG cold-start, `_ipx`/filter-query
waste) were fixed separately. `isOldArticleRoute` and the filtering in both prerender hooks were
removed from `nuxt.config.ts` (the authors-route part of `prerender:routes` stays); `CLAUDE.md` and
`docs/AGENTS.md` were corrected (also fixing the `/editor*` leftover in F13). The 404s disappear at
the next production deploy; the week-long `s-maxage=604800` on cached 404 responses expires on its
own or at the next cache-busting deploy.

## F2 — `::magic-cards` resolves card images live in the browser (Medium)

`app/components/magic/Card.vue` uses `useScryfallCard`, which calls `fetch()` against
`api.scryfall.com` from the client (`app/composables/useScryfallCard.ts:67`). 33 `::magic-cards`
blocks across 13 content files depend on it. Consequences: the prerendered HTML contains only a
skeleton, every reader triggers N Scryfall requests (no 429 handling, cache is per-session
`useState` only), and the page breaks if Scryfall is slow or down. Meanwhile `[[Card]]` and
decklists are already resolved at build time from `cards.db`.

**Fix direction.** Resolve `::magic-cards` at build time in a transformer (as for the other two) and
pass `image`/`backImage` as props; keep `useScryfallCard` only as a fallback for cards not in the DB.

## F3 — Card DB refresh has no sanity guard and always changes (Medium)

`scripts/download-bulk-data.ts` + `.github/workflows/update-cards.yml`:

- `importPauperCards` runs `DELETE FROM cards` before inserting. If Scryfall returns an unexpected
  shape (or the legality filter matches nothing), the DB is left empty and the workflow still
  commits and pushes it, which deploys a site whose decklists have no images. There is no minimum
  card-count check anywhere. `fetchBulkDataInfo` also never checks `response.ok`.
- `indexed_at` defaults to `strftime('%s','now')` and `metadata.last_update` is rewritten on every
  run, so `git diff --quiet server/database/cards.db` is never true: a "no changes" run still
  commits a new 2.3 MB binary (19 commits touch the file so far; `.git` pack is ~49 MB).
- No `VACUUM` after the delete/reinsert; no workflow `concurrency` group, so a manual run overlapping
  the monthly one can fail at `git push`.
- `readFile` of the 203 MB JSONL into one string then `split('\n')` is memory-heavy for a runner;
  streaming line by line would avoid it.
- `idx_name` duplicates the `PRIMARY KEY` index on `name`.

**Fix direction.** Fail the script if the card count drops below a threshold (e.g. < 90 % of the
previous count); compare card rows rather than file bytes (or drop `indexed_at`/`last_update` from
the committed file) so unchanged data produces no commit; add a `concurrency` group.

## F4 — Unescaped values in generated MDC (Medium)

The transformers build component attributes by interpolation:

- `card-tooltip-transformer.ts`: `name="${cleanName}"`, `set="${cleanSet}"`, `image="${imageUrl}"`.
- `decklist-transformer.ts` / `sideboard-guide-transformer.ts`: `${key}="${value}"` for every
  frontmatter prop, and the `_decks` frontmatter block (only `"` is escaped there, not `\`).

A card, deck or player name containing `"` (or a `[[...]]` card from outside the Pauper DB, which goes
through Scryfall) produces broken MDC for that block. The small hand-written `parseFrontmatter`
(`^(\w+):\s*(.+)$`) also keeps YAML quotes as part of the value (`name: "Foo"` → `name=""Foo""`)
and does not handle multi-line or nested values. Anchor ids built from
`slugify(name)-slugify(player)` are not checked for duplicates within a file.

**Fix direction.** One shared `escapeAttr()` for every interpolated value, and use the `yaml`
package (already a dependency) instead of the ad-hoc frontmatter parser.

## F5 — Folder and template matching is substring-based (Low–Medium)

- `decklist-transformer.ts` skips any file whose path `includes('template')` — an article about
  "templates" would silently lose its decklist transformation. `sideboard-guide-transformer.ts` has
  no such skip, so the two modules disagree.
- Both use `allowedFolders.some(f => path.includes(f))`; `'articles'` etc. match anywhere in the
  path. `card-tooltip-transformer.ts` has no folder restriction at all (it runs on `content/docs`
  too, protected only by the fence check).
- `0000-00-00-` is already the project's template convention (used by `sitemap.exclude`); matching
  on that prefix would be exact.

## F6 — Scryfall fallback at build time (Low–Medium)

`getCardImages` awaits one `fetch` per `[[Card|set]]` occurrence, sequentially, with no in-memory
cache and no delay, so a card used in several files is fetched several times. Scryfall asks for
50–100 ms between requests. `failOnError: false` plus the "last resort" `format=image` redirect URL
means a typo in a card name never fails the build — it only shows up in verbose logs
(`PW_VERBOSE_BUILD_LOGS=1`). A `Map<string, CardImages>` keyed by `name|set` and a small delay would
remove the repeats; an unconditional `console.warn` for unresolved names (as `getCardsByNames`
already does) would make them visible.

## F7 — Dependency advisories (Low in practice)

`pnpm audit --prod`: 60 advisories (4 critical, 30 high). All are transitive, reached through
`@nuxtjs/seo` → `nuxt-site-config`/robots (simple-git, seroval, shell-quote, undici, devalue,
brace-expansion), `@nuxt/image` → `ipx` (sharp, svgo), `@nuxt/content` (js-yaml, nanoid,
minimatch), `@nuxt/ui` (`@tiptap/core`) and `@nuxtjs/seo` (image-size). The deployment is static and
these packages run only at build time on repository-controlled inputs, so exposure is small; the
cost of leaving them is noise in every audit run and a harder real signal later. Bumping the Nuxt
modules (`@nuxt/content` 3.15 → 3.16, `@nuxt/ui` 4.10 → 4.11, `@nuxt/image` 2.0 → 2.1, `nuxt` 4.5 →
4.6) will clear most of them; remaining ones need `pnpm.overrides`. Note `nuxt-schema-org` is
deliberately pinned to 6.0.4 in `pnpm-workspace.yaml` (commit `58d3ae9`) — keep that when bumping.

The `dependency-update` skill is the right tool for this; majors were not part of this audit.

## F8 — Card-name trigger is not keyboard accessible (Medium, a11y)

`app/components/magic/card/Tooltip.vue` renders the trigger as
`<span role="button" @click @pointerenter …>` with no `tabindex` and no key handler. It cannot be
reached or activated from the keyboard, and the desktop tooltip is pointer-hover only. Every
`[[Card]]` reference in every article is affected. A `<button type="button">` (or `tabindex="0"` +
`@keydown.enter/space`) fixes it; focus should also open the tooltip.

## F9 — No security headers (Low)

Production responses carry `Strict-Transport-Security` and cache headers only. There is no
`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/
`frame-ancestors` or `Permissions-Policy`; `Access-Control-Allow-Origin: *` is Vercel's static
default. `vercel.json` currently holds only `framework` and `buildCommand`. `charts/Mermaid.vue`
assigns `innerHTML = svg` — Mermaid's default `securityLevel: 'strict'` sanitises it and the input is
author-controlled, so this is not exploitable today, but it is the one place a CSP would matter.

## F10 — Content hygiene (Low)

From the ad hoc validator over 158 files (thumbnails and authors all resolve — no broken ones):

- **Descriptions:** 3 published articles and 11 published reports have an empty or absent
  `description` (e.g. `reports/2026-10-09-andrea-sadocco-radioatog-2026.md` has `description: ""`).
  The schema declares `description: z.string()` as required; empty strings pass. They produce an
  empty `<meta name="description">` and an empty card subtitle.
- **Date vs filename:** 7 files where frontmatter `date` ≠ filename date (e.g.
  `decklists/2026-02-26-adriatica-winter-2025.md` has `date: 2026-03-03`). The date has three
  consumers that disagree: listings sort by frontmatter `date`, the search index (`_date`) and the
  3-month prerender cutoff use the filename, so the same piece can sort differently in each.
- **Unpublished:** 23 files (4 articles, 19 spoilers) — all `published: false`, correctly excluded
  from sitemap and listings; just noting that spoilers is effectively an empty category.
- **Tags:** 2 tutorials (`2023-06-01-dimir-terror`, `2025-12-06-pingers`) have no tags.
- **Baked sitemap blocks:** 11 files carry `sitemap: { loc, videos: [], images: [] }` frontmatter
  written by Nuxt Studio, which is gone; the static `loc` is a drift risk if collection prefixes
  change again.

## F11 — Dead code and duplicated logic (Low)

- `app/composables/useCardImage.ts`, `resolveCardImageUrl()` and `buildScryfallImageUrl()`
  (`shared/utils/scryfall.ts`) have no consumers outside their own file.
- `getCardByName()` (`server/utils/card-database.ts`) is only called by its own test.
- `getDbPath()` lists the same path twice and comments about "Vercel serverless" bundling that
  cannot apply to a static deployment; `decklist-transformer` / `sideboard-guide-transformer`
  re-derive `server/database/cards.db` themselves before calling `getCardsByNames` instead of
  reusing it.
- `CARD_PATTERN` and `parseFrontmatter` are copy-pasted across the two decklist/sideboard modules.
- The author-slug rule (`toLowerCase().replace(/\s+/g, '-')`) lives in `getAuthorSlug`, twice in
  `useAuthor.ts` (cache keys) and in `nuxt.config.ts`, while `slugify` was just changed to
  transliterate accents. All current author names are ASCII so nothing is broken, but a name with an
  accent would produce different slugs depending on which path generated it, and hyphenated names
  do not round-trip through `getAuthorNameFromSlug`.
- Two DB handles: the tooltip module opens its own `better-sqlite3` connection while
  `server/utils/card-database.ts` keeps another.

`pnpm run check:loose-types` and `fallow` can confirm this list mechanically; fallow was not run in
this audit.

## F12 — Untested pure logic (Low)

Tests cover the deck utilities well. These pure units have none, against the repo's "unit-test every
pure function" default: `parseDecklist` / `parseSideboardGuide` / `calculateSectionCounts` (inside the
two modules, not exported), `app/utils/article-filters.ts`, `app/utils/article-badges.ts`,
`app/utils/date.ts`, `app/utils/youtube.ts`, `shared/utils/scryfall.ts` (`parseCardString`,
`extractImageUrl`) and `useArticlesFilters` (361 lines; `scripts/benchmark-article-filters.ts` is
761 lines but the logic has no assertions). Exporting the two parsers and fixing F4 would make the
highest-value ones easy to cover.

## F13 — Documentation drift (Low)

- `CLAUDE.md:41` and `docs/AGENTS.md:8`: "older articles are served on-demand / server-rendered on
  demand" — contradicted by F1. `docs/AGENTS.md:8` also mentions `/editor*`, which no longer exists
  (Studio was removed).
- `docs/README.md` does not list `PUBLISHING-CHECKLIST.md` (index and file tree).
- `docs/BACKLOG.md` item 4 cites `@nuxt/ui@4.9.0`; installed is 4.10.0.
- `docs/audits/2026-07-11-build-performance-investigation.md` and `docs/BACKLOG.md` refer to
  `bun run generate`; the project uses `pnpm run generate`.
- `CLAUDE.md` says the `crawlLinks` crawler can't reach `/authors/[slug]`; that is still accurate and
  handled in `nuxt.config.ts`, so no change needed there.

## F14 — Convention violations (Low)

- Non-English comments (project and global rule is English, one line): `app/components/article/FiltersPanel.vue:82`,
  `app/composables/useArticleData.ts` (three comments), `app/pages/authors/[slug].vue`
  ("TypeScript ora sa che è definito"), `.github/workflows/update-cards.yml` (two blocks). The
  `docs/BACKLOG.md` body is also partly Italian, which is fine for a doc.
- Leftover debug line: `app/pages/authors/[slug].vue:73`
  `if (import.meta.dev) console.log("[DEBUG] Author [slug]", …)`.
- `app/pages/articles/[id].vue` has no explicit 404: if `useArticleData` returns `null`, the page
  renders an empty body with a 200 instead of `createError({ statusCode: 404 })`
  (as `authors/[slug].vue` does).

---

## Checked and fine

- Lint, typecheck and tests are clean; no `any`/`@ts-ignore` outside the two documented exceptions.
- `v-html`/`innerHTML`: only `Mermaid.vue` (see F9). No `v-html` in the app.
- All thumbnails referenced in frontmatter exist; all `author` values match an `authors/*.yml` name.
- Unpublished content is excluded from sitemap, listings and author pages.
- `buildLog` is hard-disabled on Vercel (`!env.VERCEL`) so verbose output cannot leak into CI logs.
- Scryfall requests set the required `User-Agent`/`Accept` headers (script and tooltip module).
- External `target="_blank"` links go through `ULink`, which sets `rel="noopener noreferrer"`
  (confirmed in `@nuxt/ui`'s `Link.vue`; not re-checked per call site).
- `cards.db` is intentionally committed; `oracle-cards.jsonl` (203 MB) is gitignored and not in
  history.

## Suggested order

1. **F1** — decide the strategy, fix, then correct `CLAUDE.md`/`AGENTS.md` (F13) and re-probe the
   sitemap (the `curl` loop in this audit is trivial to repeat).
2. **F3** guard (card-count floor + `concurrency`) — small change, prevents a bad monthly deploy.
3. **F8** accessibility fix and **F4** `escapeAttr()` — both small and self-contained.
4. **F2** build-time resolution of `::magic-cards`.
5. **F7** module bumps via the `dependency-update` skill, then re-run `pnpm audit`.
6. **F10–F14** cleanups in one pass; add the missing unit tests (F12) alongside F4/F5.
