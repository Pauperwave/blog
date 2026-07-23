# Build performance investigation — 2026-07-11

Notes on why `bun run generate` was slow (~5min) and, separately, why it was silently
exiting with code 5 on every single run. Two unrelated problems, found while
investigating the first.

## Background

Starting point: 467 prerendered routes, 119.9s prerender phase, and (discovered partway
through, previously unnoticed) `exit code 5` on every run due to OG-image render errors —
present even in the very first baseline, unrelated to anything changed this session.

## Fix 1: redundant `/_ipx/*` prerendering — tried, reverted (real production incident)

`crawlLinks: true` follows every `<img src="/_ipx/...">` NuxtImg renders and was
statically transforming each one at build time — 94 image routes, ~567s of combined
processing (compressed via concurrency), the single largest cost found.

**Excluded via `nitro.prerender.ignore`, assuming ipx runs on-demand on Vercel at
request time. This assumption was wrong for this project and broke every image on the
live site** — this deployment is 100% static (`nitro.preset: 'vercel'` + `nuxt generate`
→ `.vercel/output/static` only, confirmed no `functions/` directory at all). There is no
serverless fallback to generate a missed `_ipx` variant at runtime; excluding it from
prerender means that URL 404s forever. **Reverted.** Do not re-attempt this without first
confirming the deployment target actually has a runtime image-optimization path.

## Fix 2: redundant `/articles?...` filter-query OG images — kept, safe

The articles listing page's filters (category/author/location/tag/deck) are client-side
only — the exact same static `articles/index.html` serves every query-string variant
(Vercel routes by path, not query string; filtering happens post-hydration via
`route.query`). But `crawlLinks` was discovering 30 distinct filtered URL combinations
and rendering each one as if it were a distinct page — including a full OG image render
per combination, even though `defineOgImage()` on that page (`app/pages/articles/index.vue`)
never references the filter, so all 30 renders produced pixel-identical duplicate images.

Excluded via `nitro.prerender.ignore: ['/articles?']` (nitropack's string pattern is a
plain `path.startsWith()`, not a glob — no wildcards needed or supported). Safe because,
unlike `_ipx`, nothing is actually missing afterward — the same static file already
covers every query variant.

## Fix 3: OG-image `renderer.createImage timeout` (the exit-code-5 bug) — fixed

**Symptom:** every `bun run generate` failed with exit code 5. A consistent cluster of
`@nuxtjs/og-image` `renderer.createImage timeout` errors fired immediately after the
first batch of seed pages rendered, then every subsequent OG image rendered fine
(~4s each) for the rest of the build.

**Root cause** (confirmed by reading `node_modules/nuxt-og-image` source directly, not
guessed): our `nitro.preset: 'vercel'` correctly maps to the native `takumi: "node"`
binding for the actual deployed runtime — but **prerendering specifically** uses a
different compatibility profile, `NodePrerenderRuntime`, which sets `takumi: "node-dev"`.
That binding (`bindings/takumi/node-dev.js`) spawns a real `node:worker_threads` `Worker`
to isolate renderer crashes from killing the whole prerender process. The very first
render pays a one-time cost spinning up that worker and `require('@takumi-rs/core')`
inside it; every render after reuses the same warm worker and is fast.

Two nested timeouts are involved:
- The worker's own internal ceiling, hardcoded in `postToWorker(msg, timeoutMs = 3e4)` —
  **30 seconds**, not configurable via `nuxt.config.ts`.
- The module's own outer `security.renderTimeout`, **15 seconds by default** — shorter
  than the inner one, so it always aborted the render before the worker's own 30s
  timeout ever got a chance to let the cold start finish naturally.

This is a known category of issue in `nuxt-og-image` — [PR #592](https://github.com/nuxt-modules/og-image/pull/592)
("Harden takumi WASM lock") describes the exact symptom (renders "pile up behind the
shared lock and pin requests until the outer renderTimeout fired"). We're already on the
latest published version (6.7.2) which includes that hardening — it improves failure
*recovery* (clean fail + renderer reset instead of a full deadlock) but doesn't raise the
default timeout, so the underlying mismatch (15s outer vs. 30s inner) was still there.

**Considered and ruled out:** bumping `@takumi-rs/core`/`@takumi-rs/wasm` (currently
pinned `^1.3.0`, 2.x available). Confirmed via `takumi`'s own docs and changelog that (a)
Node.js/`vercel` environments should already be using the native `@takumi-rs/core`
binding, not WASM, so a WASM-specific fix wouldn't apply here anyway, and (b) nothing in
the 1.x→2.x changelog addresses worker-thread spawn time specifically. Not applied.

**Fix:** `ogImage.security.renderTimeout: 29000` in `nuxt.config.ts` — just under the
worker's hardcoded 30s ceiling, giving the one-time cold start enough room to finish
instead of being aborted by the shorter outer timeout.

Bisected the real minimum empirically rather than assume 29000 was necessary: 15s
(default) and 20000ms both still failed; 29000ms succeeded cleanly twice. So the actual
cold-start time is somewhere in the 20-29s range on this machine — narrowing it further
would need more ~110s build cycles for diminishing benefit, so left at 29000. Also tried
`ogImage.debug: true` to get more granular timing during that bisection — it introduced
an unrelated anomaly (build fully succeeded, zero errors, zero timeouts, but the process
still exited with code 5), so don't enable `debug` while investigating this specific
issue; it may interact with `nitro.prerender.concurrency` in a way that produces a
misleading non-zero exit despite a genuinely successful build. Not root-caused further.

**Verification gotcha:** initial local retests still failed even after applying this fix,
which looked like a debunked theory — until a routine sanity check (`dimir-terror`'s
render time, normally ~5s) showed 32 seconds on that same run. Nine consecutive heavy
`bun run generate` runs in one session had put the machine under enough contention to
produce genuinely misleading timing data. After letting the machine idle, a clean rerun
confirmed: exit code 0, zero timeout errors, `dimir-terror` back to 5.5s. Lesson
generalized to `~/.claude/CLAUDE.md` (don't trust local benchmark numbers after a streak
of heavy back-to-back builds).

## Result

| | Before | After |
|---|---|---|
| Routes prerendered | 467 | 445 |
| Prerender phase | 119.9s | 103.9s |
| Exit code | 5 (always, incl. original baseline) | 0 |
| `renderer.createImage timeout` errors | 8 | 0 |

~13% faster, and — more importantly — actually succeeds instead of silently failing.
