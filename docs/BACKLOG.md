# Backlog

<!-- docs/BACKLOG.md -->

Committed, actionable work items, ranked by priority with a rough effort estimate. For loose observations/ideas that aren't yet committed work, see `docs/TODO.md`. For what's already done, see `docs/PROGRESS.md`.

**Priority:** P1 (do next) · P2 (soon) · P3 (someday)
**Effort:** S (< 1h) · M (a few hours) · L (a day+)

| # | Item | Priority | Effort |
|---|------|----------|--------|
| 1 | [Set up Nuxt Studio authentication](#1-set-up-nuxt-studio-authentication) | P1 | S |
| 2 | [Sistemare generazione og-images](#2-sistemare-generazione-og-images) | P2 | S |
| 3 | [Pie chart legend overlaps the chart on mobile](#3-pie-chart-legend-overlaps-the-chart-on-mobile) | P2 | S |
| 4 | [Pulsante "torna in cima" su mobile](#4-pulsante-torna-in-cima-su-mobile) | P2 | M |
| 5 | [Integrare editor Tiptap per la modifica articoli](#5-integrare-editor-tiptap-per-la-modifica-articoli) | P3 | L |

---

## 1. Set up Nuxt Studio authentication

`/editor` currently fails with:

```
[error] [nuxt-studio] In order to authenticate users, you need to set up a GITHUB OAuth application.
```

The same missing credentials also show up as a build-time warning on Vercel production builds, not just locally:

```
[warn] [Nuxt Studio] In order to use Studio in production mode, you need to setup authentication:
```

Nuxt Studio needs OAuth credentials to authenticate editors — this is a Studio requirement, unrelated to Nuxt UI.

**Steps** (GitHub, since that's the configured repository provider):

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Set the callback URL to `https://blog.pauperwave.org/editor` (production) — a separate app is needed for local dev with a `http://localhost:3000/editor` callback
3. Copy the generated Client ID and Client Secret
4. Set as environment variables:
   - Production: add `STUDIO_GITHUB_CLIENT_ID` / `STUDIO_GITHUB_CLIENT_SECRET` to Vercel
   - Local dev: add the same two to `.env`

Alternative: Google OAuth is also supported (`STUDIO_GOOGLE_CLIENT_ID` / `STUDIO_GOOGLE_CLIENT_SECRET`), combined with `STUDIO_GITHUB_TOKEN` to allow Studio to push changes to the repo. See the [Nuxt Studio docs](https://nuxt.studio/) for details — out of scope for this project's own docs.

**P1** because `/editor` is fully broken without it, not just degraded.

---

## 2. Sistemare generazione og-images

Log osservato in dev/build:

```
[log] [nitro]   ├─ /__og-image__/static/articles/0000-00-00-decklist-template/og.png (658ms)
```

L'og-image viene generata anche per il decklist template (`0000-00-00-decklist-template`), che non è un articolo pubblicato — da capire se va escluso dal prerender o se il comportamento è atteso. Verificare anche le altre og-image generate per contenuti reali.

Relates to `docs/audits/2026-07-11-build-performance-investigation.md`, which flagged OG-image render timeouts as a separate, still-open cost during `bun run generate`.

---

## 3. Pie chart legend overlaps the chart on mobile

`app/components/charts/PieChart.vue` — in the mobile viewport, the legend (positioned on the left) sits on top of the pie chart itself instead of stacking below/around it. Needs a responsive layout fix (e.g. move the legend below the chart, or stack vertically, under a mobile breakpoint).

---

## 4. Pulsante "torna in cima" su mobile

Aggiungere un tasto flottante in basso a destra, visibile solo su mobile, per tornare rapidamente in cima alla pagina (utile su articoli lunghi).

Verificato: **non esiste già** — né altrove in questo sito (`app/`), né come componente pronto in Nuxt UI (nessun `back-to-top`/`scroll-to-top` nei componenti installati). Andrebbe costruito da zero: `@vueuse/core`'s `useWindowScroll` (già installato, vedi `nuxt.config.ts` → `@vueuse/nuxt`) per tracciare la posizione di scroll ed eventualmente mostrare/nascondere il pulsante, più un `UButton` stilizzato come floating action button, gestito con lo stesso `useDevice()`'s `isMobile` usato altrove nel progetto (vedi nota in `CLAUDE.md` sui grafici) per limitarlo a mobile.

---

## 5. Integrare editor Tiptap per la modifica articoli

Obiettivo: editing in-place degli articoli (markdown/MDC) direttamente dal sito, usando Tiptap invece di (o in aggiunta a) Nuxt Studio. Da definire prima di implementare:

- Se sostituisce l'editor `/editor` di Studio o è un flusso separato.
- Come si integra con il content pipeline (i tre transformer in `modules/` che riscrivono il markdown prima del parsing di Nuxt Content).
- Come si integra con l'autenticazione (item #1 di questo backlog copre solo Studio).

**P3/L** — scope non ancora definito, dipende anche dall'esito di #1 (se Studio risulta sufficiente una volta autenticato, potrebbe ridimensionare la priorità di questo item).
