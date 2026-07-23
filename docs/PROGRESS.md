# PROGRESS — Pauperwave Blog

Documento vivo per tracciare avanzamento, architettura e decisioni. Aggiornare quando cambiano scope, stack o convenzioni rilevanti — non per ogni commit (per quello vedi `docs/CHANGELOG.md`).

**Ultimo aggiornamento:** 2026-07-23

---

## Obiettivo del progetto

Blog/sito editoriale per il formato Magic: The Gathering **Pauper**: articoli, tutorial, decklist, report torneo, spoiler set — con componenti interattivi (grafici, tooltip carte, gallerie di carte in stile magic.wizards.com) e un content pipeline basato su Nuxt Content che risolve riferimenti a carte a build time.

---

## Stack tecnologico

| Layer | Tecnologia |
|-------|------------|
| Runtime/package manager | Bun |
| Framework | Nuxt 4 (deploy target: `vercel`, hybrid SSG/prerender) |
| UI | Nuxt UI 4, Tailwind CSS |
| Contenuto | Nuxt Content 3 (MDC) + 3 moduli custom di trasformazione markdown |
| Grafici | ECharts (via componenti custom in `app/components/charts/`) |
| Card data | Scryfall bulk data → SQLite (`server/database/cards.db`, committato in git) |
| Testing | Vitest |
| Lint | ESLint (`@nuxt/eslint`) |

---

## Architettura (panoramica)

Vedi il root `CLAUDE.md` per i dettagli che attraversano più file (content pipeline, prerendering ibrido, prefissi componenti). Riferimenti approfonditi per sottosistema in `docs/architecture/`:

- `docs/architecture/card-download-database-flow.md` — flusso Scryfall → SQLite → risoluzione a build time.
- `docs/architecture/2026-07-10-magic-cards-component-research.md` — reverse engineering del componente `::magic-cards`.
- `docs/architecture/author-system-improvements.md` — stato del sistema autori.

---

## Decisioni architetturali

Le decisioni architetturali che *non* sono già ovvie dal codice o coperte dal root `CLAUDE.md` (content pipeline, prerendering ibrido, alias immagini, convenzione `useDevice()` sui grafici) vanno registrate qui come `### ADR-NNN — Titolo`. Per la cronologia commit-per-commit, vedi `docs/CHANGELOG.md`.

### ADR-001 — Pin di `nuxt-schema-org` a `6.0.4` via `overrides`

- **Contesto (2026-06-18):** `nuxt-schema-org` 6.2.1, aggiornato automaticamente tramite `@nuxtjs/seo`, ha introdotto una funzione in `webPageResolver.defaults` per rilevare il tipo di pagina dall'URL. `unhead` v2 (richiesto da Nuxt 4) chiama con zero argomenti qualsiasi funzione incontrata nei props dei tag `<head>`, causando un crash runtime (`Cannot destructure property 'meta' of 'undefined'`).
- **Decisione:** `package.json`'s `overrides.nuxt-schema-org` pinnato a `6.0.4` (ultima versione funzionante), `bun.lock` ripristinato dal commit `4c259b7`.
- **Da rivedere:** questo pin va rimosso solo dopo aver verificato a mano che una versione più recente di `nuxt-schema-org` non ripresenti lo stesso crash con `unhead` v2 — non è sufficiente che `bun update` proponga una versione più recente.
- **Dettaglio:** `docs/CHANGELOG.md`, voce 2026-06-18.

### ADR-002 — Collection `docs`: prefisso path esplicito + query by path, non by id

- **Contesto (2026-07-08):** la collection `docs` in `content.config.ts` aveva `source.prefix: "/"` invece di `"/docs"`, causando URL di sitemap tipo `/statuto`/`/componenti` che non combaciavano con la route reale `/docs/[slug]`. Il fix del prefisso a livello di collection ha esposto due bug nascosti, non ovvi dal codice:
  1. **Sitemap `loc` stantio:** Nuxt Studio scrive un blocco `sitemap: { loc }` nel frontmatter quando un file viene aperto/salvato nell'editor — uno snapshot statico dell'URL al momento del salvataggio, che non si aggiorna da solo se il prefisso della collection cambia dopo. `content/docs/statuto.md` e `content/docs/componenti.md` avevano un `loc` stantio da una sessione Studio precedente che ha continuato a vincere sul path corretto dopo il fix; `content/docs/codice-di-condotta.md` non aveva l'override e ha recepito il fix automaticamente — l'inconsistenza tra i tre file è stata l'indizio che ha rivelato il problema.
  2. **`id` raddoppiato, non solo `path`:** per una collection `type: "page"`, `source.prefix` incide sul campo `id` calcolato, non solo su `path`. Dopo il cambio prefisso, l'`id` di ogni doc è passato da `docs/statuto.md` a `docs/docs/statuto.md` (cartella sorgente `docs/` raddoppiata dal nuovo prefisso). `app/pages/docs/[slug].vue` interrogava per `id` costruito a mano (`queryCollection('docs').where('id', '=', \`docs/${slug}.md\`)`), quindi ha iniziato a restituire `null` in silenzio — nessun errore, area contenuto vuota.
- **Decisione:** (a) tutti e 3 i file in `content/docs/` hanno ricevuto un `sitemap.loc` esplicito e corretto invece di affidarsi al path calcolato dalla collection — collection piccola, quindi esplicito-ovunque è costato meno che costruire un controllo di drift automatico; da rivedere se la collection cresce molto; (b) `[slug].vue` riscritto per interrogare `.path(route.path)` invece di un `id` costruito a mano — pattern già usato altrove nel codebase (`useArticleData` per `articles`), la pagina `docs` era l'eccezione.
- **Da tenere a mente:** riaprire/salvare un file `docs` in Nuxt Studio dopo che l'autenticazione GitHub OAuth sarà configurata (`docs/BACKLOG.md` #1) potrebbe reintrodurre silenziosamente un `loc` stantio se l'editor lo riscrive con un path calcolato non aggiornato — da verificare dopo la prima modifica via Studio.
- **Regola generale ricavata:** qualsiasi cambio futuro a `source.prefix`/`source.include`/struttura cartelle di una collection richiede: (1) grep di `sitemap:` nel frontmatter di quella collection per `loc` stantii, (2) grep di query `.where('id'` costruite a mano contro quella collection, preferendo `.path(route.path)`.
