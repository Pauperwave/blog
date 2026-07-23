# `magic-cards` component research — 2026-07-10

Notes on reverse-engineering WotC's `<magic-cards>` web component (used throughout
magic.wizards.com/en/news/making-magic) and replicating it as `app/components/magic/Cards.vue`
(MDC shortcode `::magic-cards`).

*Naming history: this started as `app/components/magic/card/Fan.vue` /
`::magic-card-fan`, alongside a separate `magic-card-gallery` shortcode for the plain
scrolling-strip case. It was later renamed/merged into `Cards.vue` / `::magic-cards` to
mirror WotC's real naming and composition — see the "Later refactor" note at the bottom.
The formulas and verification notes below are unaffected by that rename, only the file
path and shortcode name changed.*

## Background

The blog wanted a "hand of cards" display component matching the one used on the official
Magic site (e.g. the "My Words: White" article). WotC's version is a custom element,
`<magic-cards config="...">`, wrapping `<magic-card face="...">` children. It has at least
two layout configs: `fan` (rotated, overlapping arc) and `hand` (upright, spread with a
vertical arc). `Cards.vue` implements both via a `layout` prop.

## `fan` layout — fully reverse-engineered, high confidence

Verified live against magic.wizards.com via browser devtools (computed styles, inline
transform attributes) across multiple hover states. All values below are directly
observed, not guessed.

**Static layout:**
- Cards are **not** spaced via margin/flexbox. Every card sits absolutely centered at the
  exact same position (`left: 50%`, `transform: translate(-50%)` on a static wrapper).
  The entire visual spread comes purely from rotating each card around a single **shared
  pivot point far below the fan** — `transform-origin: 50% 2168.18px` on a 372px-tall
  card (a ratio of ~5.83× the card's own height). Our implementation: `transform-origin:
  50% 582.84%` on `.fan-card` (a percentage of the card's own height, so it scales with
  responsive card sizing).
- Rotation per card: `angle = (index - center) * (arch / count)`, where `arch` defaults to
  `20.5` (matches the real `overall-arch` attribute) and `center = (count - 1) / 2`. The
  per-card step shrinks as more cards are added instead of the total spread growing
  without bound.

**Hover behavior:** everything derives from one constant, `SPREAD = 0.15`:
- Cards at or before the hovered index (i.e. stacked *underneath* it, since a later DOM
  index paints on top) get their rotation uniformly amplified by `1 + SPREAD/2` (×1.075).
  The hovered card itself follows this too, plus lifts `translateY(-18px)` and drops its
  filter to `none`.
- Cards *after* the hovered index (stacked on top of it) have to move aside to reveal it:
  they rotate further out (`scaled + SPREAD * total * (total - 1 - k)`, where `k` is their
  distance from the hovered card) and shift `translateX(15%)`.
- Non-hovered siblings get `filter: blur(0.5px) grayscale(0.8) brightness(1.12 - 0.08 *
  distance)` — not a flat grayscale, it fades based on distance from the hovered card.
- Transition: `transform 0.4s ease, filter 0.4s ease` on both properties.

**Mobile fallback:** below `md` (768px), rotated overlapping cards don't work well, so
`Cards.vue` falls back to a plain horizontal scroll strip (no rotation) — this is our own
design choice, not a replication of WotC's mobile behavior (they use a `swiper-container`
web component instead, which we didn't adopt to avoid pulling in more dependencies for a
device-detection fallback).

## `hand` layout — partially reverse-engineered, low-to-medium confidence

This config was spotted by accident while investigating `fan`: the CSS for it was already
loaded in the browser on a `fan`-only page, because WotC's component library bundles every
layout variant's styles together regardless of which one a given page actually uses. Only
a fragment of the ruleset was captured before the investigation moved to other work:

```css
.css--skg3Wv .css-dtqLH-V { position: absolute; height: 0px; left: 50%; transform: translate(-50%); }
.css--skg3Wv .css-dtqLH-V magic-card { display: block; transition: 0.4s; }
.css--skg3Wv .css-dtqLH-V:nth-child(1) magic-card { transform: translate(-120%) translateY(25%); }
.css--skg3Wv .css-dtqLH-V:hover:nth-child(1) magic-card { transform: translate(-120%) translateY(15%); }
.css--skg3Wv .css-dtqLH-V:nth-child(2) magic-card { transform: translate(-60%) translateY(45%); }
[capture was cut off here — the rest of the 5-card hand's positions were never recorded]
```

That's 2 of 5 card slots for one specific article's hand instance ("Design Files: Urza's
Destiny, Part 3" — see the crawl results below). From this we extrapolated:

- **No rotation.** Unlike `fan`, hand cards stay upright — only `translateX`/`translateY`.
- **X position:** steps of 60% of the card's own width from center — confirmed by the two
  captured points (`-120%`, `-60%`), assumed to continue linearly (`0%`, `60%`, `120%`
  for a 5-card hand). *Only confirmed for a 5-card hand specifically — unverified whether
  the 60% step is fixed or scales with card count, unlike `fan`'s `arch/count` which we
  know scales.*
- **Y position (the vertical arc):** two points (`25%` at the outer slot, `45%` at the
  next slot in) are consistent with a linear/triangular arc peaking at the center card:
  `y = 65% - 20% * |offset from center|`. This gives the center card the largest Y (most
  "forward"/frontmost) and the outer cards receding upward — never independently verified
  since the browser session ended before the center and right-side slots could be read.
- **Hover:** the one captured hover state (index 0: `translateY(25%)` → `translateY(15%)`)
  is a **-10 percentage point** lift. Implemented as: any hovered hand card's Y offset is
  reduced by 10pp. Whether hovering a hand card also affects its *siblings* (the way `fan`
  pushes obstructing cards aside) was never observed — `Cards.vue` currently does **not**
  reposition hand siblings on hover, only applies the same grayscale/blur/brightness
  filter used by `fan` (an assumption that the filter mechanism is shared across configs,
  not verified specifically for `hand`).

**Bottom line: `hand` is a reasonable-looking approximation, not a verified reproduction.**
If pixel accuracy matters, it needs a fresh live session against a real `config="hand"`
page (e.g. `magic.wizards.com/en/news/making-magic/design-files-urzas-destiny-part-3`) to
capture the remaining 3 of 5 slot positions and the sibling-hover behavior, the same way
`fan` was verified.

## Archive crawl: which real articles use `<magic-cards>`

To find real reference examples (and specifically confirm `hand` exists as a real,
in-use config rather than a one-off), the entire "Making Magic" column archive by
Mark Rosewater (`magic.wizards.com/en/news/archive?author=408M0U2kfLQxXWQBue2Gjb`) was
crawled: 238 listing pages, 1,136 unique articles, every one fetched and checked for a
literal `<magic-cards` tag in its raw HTML.

**Result: 43 articles use it.** Full results (title, URL, instance count, config
value(s)) are in [`2026-07-10-magic-cards-fan-hand-matches.tsv`](./2026-07-10-magic-cards-fan-hand-matches.tsv)
in this same folder.

Two outliers worth knowing about if this work continues:
- **"Design Files: Urza's Destiny, Part 3"** — the only article found using `config="hand"`
  (alongside `fan`). This is the source of the partial hand data above.
- **"Ten Stories Tall"** — 42 separate `<magic-cards>` instances on one page, by far the
  most of any article. Good stress-test reference if verifying performance/layout at scale.

Everything else found is `config="fan"`.

**Crawl notes for anyone re-running this:** magic.wizards.com's Akamai edge rate-limits
aggressive request bursts — an 8-way parallel first attempt got the crawling IP fully
blocked (`403` from `errors.edgesuite.net`) for about 45 minutes. A slow, single-threaded
retry (2.5s between requests) worked but was very slow (~14-140s/article, highly variable,
likely per-process spawn overhead on Windows rather than actual network latency) — a
moderate 3-way parallel retry with proper request-level timeouts and a resumable
per-article checkpoint (to survive the process hangs Windows/Git Bash's `while read`
loops seemed prone to over a long run) finished the remaining articles quickly and safely
without re-triggering the block.

## Current `Cards.vue` API

```yaml
::magic-cards
---
cards: [Card Name, ...]       # required
caption: "..."                 # optional
arch: 20.5                     # optional, fan-only, degrees
layout: fan                    # optional, 'fan' (default) | 'hand'
---
::
```

See `docs/CONTENT.md` ("Cards (fan / hand)" section) and `content/docs/componenti.md`
("Ventaglio di carte" / "Variante 'a mano'") for the full prop tables and live examples.

## Later refactor: composition + gallery merge (same day)

Shortly after this research, the component was renamed `Fan.vue` → `Cards.vue`
(`::magic-card-fan` → `::magic-cards`) and restructured to actually compose
`MagicCardDisplay` (`::magic-card-display`) for each card, mirroring WotC's real
`<magic-cards>`/`<magic-card>` relationship — `Cards.vue` now only owns fan/hand
positioning, not card resolution/rendering, which was previously duplicated inline.

At the same time, the separate `magic-card-gallery` shortcode (a plain horizontal
scroll strip) was removed entirely: it's not a real WotC config value, just the
automatic mobile-breakpoint behavior of `fan`/`hand` (matching how WotC's own
`mobile-breakpoint`/`force-swiper-on-mobile` attributes work) — so `magic-cards` now
provides it automatically rather than as a separate author-facing mode. The 2 real
content usages of `magic-card-gallery` and 1 of `magic-card-fan` were migrated to
`magic-cards`; `Gallery.vue` and the old `Fan.vue` were deleted.

## Second refactor: magic-card-display → magic-card, single-card usage folded in (same day)

To fully mirror WotC's real `<magic-cards>`/`<magic-card>` naming, `Display.vue` was
moved from `app/components/magic/card/Display.vue` to `app/components/magic/Card.vue`
(shortcode `::magic-card-display` → `::magic-card`), and `Cards.vue` was updated to
compose `MagicCard` instead of the old `MagicCardDisplay` name.

`magic-card` is now purely an internal building block — content authors never call it
directly. `::magic-cards` became the *only* shortcode for showing card images at all,
including a single card (`cards: [Single Name]`). The 12 real content usages of
`magic-card-display` (4 in `2026-02-24-teenage-mutant-ninja-turtles.md`, 8 in
`2026-04-16-secrets-of-trixhaven.md`) were migrated accordingly.
