---
title: Changelog
description: Registro delle modifiche tecniche al progetto
---

## 2026-10-06

### Feat: vista visuale delle decklist interattiva

Documentazione: `docs/architecture/decklist-visual-view.md`.

- **Skeleton di caricamento** per le carte e per l'immagine dell'header dell'overlay (`USkeleton`), al posto delle immagini che comparivano a scatti.
- **Evidenziazione al passaggio del mouse** su tipi, colonne della curva e barra dei colori: le carte fuori dalla statistica diventano `grayscale-80 brightness-60`, quelle evidenziate si mostrano intere davanti alle altre. Le carte della sideboard partecipano (per costo; per tipo grazie a `type_line`). `highlightState` in `deck-highlight.ts`.
- **Statistiche nell'header:** tooltip `UTooltip` al posto dei `title` nativi, numero di simboli di mana nei segmenti della barra colori, "Costo medio" sul grafico, sottolineatura e zoom del tipo selezionato, cursore a manina, titolo e giocatore sulla stessa riga, layout ristretto per non uscire dall'header con 6 tipi.
- **Curva colorata** (`DecklistCurveBar`): colonne impilate per colore (W U B R G, multicolore oro, incolore grigio); il segmento multicolore si divide in base al colore evidenziato (`multicolor` per colonna in `computeDeckStats`). Anche nel pannello Statistiche, con i tooltip.
- **Link condivisibili:** `?preview#ancora` apre la vista visuale (`useDeckPreviewLink`, `deck-preview.ts`), `router.replace` mantiene l'URL in sincronia con l'overlay, la ricerca usa i link `?preview`, pulsante "Condividi" nell'overlay (`?preview`) e nel footer della decklist (solo `#ancora`).
- **Tipo delle carte della sideboard:** `cards.db` salva `type_line` (rigenerato, 11.091 carte invariate più la colonna); il transformer imposta `typeSection` per la sideboard (`sectionFromTypeLine`, priorità Creature, Land, Instant, Sorcery, Artifact, Enchantment).
- **Altro:** descrizione del modale Statistiche = giocatore e piazzamento (non più un duplicato del titolo); link "Autori" di nuovo nel menu desktop (era commentato dal 2026-03).

### Fix: script rotti e non controllati

- `decklists:verify-gradients` e `decklists:add-gradients` crashavano (`ERR_PACKAGE_IMPORT_NOT_DEFINED`) da quando `server/utils/card-database.ts` importava `buildLog` da `#shared/utils`, alias che Node puro non risolve. Ora l'import è relativo (`../../shared/utils/build-log.ts`). Nessun controllo lo aveva segnalato perché `nuxt typecheck` non guarda `scripts/`.
- Nuovo `modules/tsconfig.json` e `pnpm run typecheck:modules` (incluso in `pnpm run typecheck`): anche `modules/` non era controllato da `nuxt typecheck`. Con gli alias `#shared`/`#server` risolti compila senza errori.
- Nuovo `scripts/tsconfig.json` e `pnpm run typecheck:scripts` (incluso in `pnpm run typecheck`): controlla gli script con le librerie di Node e le stesse opzioni strict del progetto. Corretti gli errori trovati: accessi a indici di array con `noUncheckedIndexedAccess` in `add-header-gradients.ts`, `decklist-gradient.ts` (con un helper `readFrontmatterValue` al posto di quattro regex ripetute) e `benchmark-article-filters.ts` (helper `pickOne`), e i tipi in `download-bulk-data.ts` (`Database.Database`, risposta JSON tipizzata, `frontFace`).

### Refactor

- `app/utils/deck-stats.ts` diviso in `mana-cost.ts`, `deck-stats.ts`, `deck-highlight.ts`, `curve-display.ts` (test spostati di conseguenza).
- Estratti `useDeckHighlight`, `useDeckPreviewLink` e `copyLink` (in `useCopyToClipboard`); `getFencedRanges`/`isInsideFence` spostati in `modules/utils/fence.ts`.
- `server/utils/card-database.ts`: `toCardData(row)` unifica la mappatura riga→`CardData` (tre copie), rimossa una mappa `dbCardsByLowercase` mai letta, i `console.log` informativi passano da `buildLog` (i problemi veri restano `console.warn`/`console.error`).
- Tipi: `isNonLandSection` (type guard, via i cast), `DeckCard.section`/`ParsedCard.section` come `DeckSection`, `SideboardGuideCard` per la guida alla sideboard (che riusava `ParsedCard` con `in`/`out`), `Map<string, CardData>` al posto di `Map<string, any>` nei transformer, rimosso il blocco commentato del pulsante "Editor" dall'header.
- Classi Tailwind canoniche al posto dei valori arbitrari (`min-h-148`, `brightness-60`, `aspect-488/680`, ...).
- Nuovo script `pnpm run check:loose-types` (`scripts/check-loose-types.ts`): elenca `any`, `as unknown as`, `Function`/`Object`, `@ts-ignore` e `eslint-disable` di `no-explicit-any`, anche negli script dei `.vue`. Esce con 1 se trova qualcosa che non è accettato con un commento `// loose-ok: <motivo>`. Primo passaggio: 14 casi trovati, 12 eliminati (handle di `better-sqlite3` tipizzato in `card-database.ts` e nel transformer dei tooltip, `Readable.fromWeb` nello script di download, un solo helper `onContentFileBeforeParse` al posto di tre cast), 2 accettati: l'import di `#content` e il cast dell'hook di Nuxt Content.

---

## 2026-06-18

### Fix: crash al runtime causato da nuxt-schema-org 6.2.1

`nuxt-schema-org` 6.2.1 (aggiornato automaticamente tramite `@nuxtjs/seo`) ha introdotto una funzione in `webPageResolver.defaults` per rilevare il tipo di pagina dall'URL. `unhead` v2 — richiesto da Nuxt 4 — chiama con zero argomenti qualsiasi funzione che incontra nei props dei tag `<head>`, causando il crash:

```
Cannot destructure property 'meta' of 'undefined' as it is undefined.
```

**Soluzione:** ripristinato `bun.lock` dal commit `4c259b7` (ultima versione funzionante) e pinnato `nuxt-schema-org` a `6.0.4` tramite il campo `overrides` in `package.json`.

```bash
git checkout 4c259b7 -- bun.lock
bun install --frozen-lockfile
```

---

### Fix: sezione Enchantments non visualizzata nelle decklist

Il transformer delle decklist riconosceva solo `Enchantments` (plurale) come header di sezione, ma tutti i file markdown usavano `Enchantment` (singolare). Le carte enchantment venivano silenziosamente assegnate alla sezione precedente invece di apparire nella loro colonna.

**Soluzione:** sostituito `Enchantment` con `Enchantments` in 21 file markdown (65 occorrenze totali).
