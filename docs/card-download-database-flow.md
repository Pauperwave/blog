# Card Download & Database Flow

Panoramica del flusso che porta i dati delle carte da Scryfall fino al rendering nel blog.

## Architecture Overview

Nuxt 4. I dati delle carte vengono scaricati da Scryfall e salvati in un database SQLite locale, poi risolti **a build time** dentro i moduli di trasformazione del contenuto — non c'è alcun endpoint API chiamato a runtime dal browser.

---

## Card Download Flow

**Entry point:** `scripts/download-bulk-data.ts`

1. **Fetch Bulk Data Info** — chiama `https://api.scryfall.com/bulk-data`, trova il bulk data type `oracle_cards`.
2. **Download Bulk Data** — crea `server/database/` se necessario, scarica il JSON compresso in `server/database/oracle-cards.json` (~168 MB, gitignored).
3. **Create Database Schema** — crea `server/database/cards.db` (SQLite, gitignored) con tabelle `cards` (name PK, mana_cost, image_url, indexed_at) e `metadata` (key PK, value, updated_at), più indice su `cards.name`.
4. **Import Pauper Cards** — legge `oracle-cards.json`, filtra `legalities.pauper === 'legal'`, gestisce le carte double-faced (prima faccia), inserisce in batch via transazione (~2 MB il DB finale).

**Trigger:**
- Manuale: `bun run download-cards`
- **Non automatico** — non ci sono hook `prebuild`/`pregenerate` in `package.json`. Il DB va rigenerato a mano quando serve (es. dopo un aggiornamento delle legalità Pauper) e deve esistere prima di `dev`/`build`, altrimenti i transformer ripiegano sulla Scryfall API carta per carta (più lento).

---

## Database Access

**Utility:** `server/utils/card-database.ts`

- `getCardByName(name)` — lookup singolo per nome esatto.
- `getCardsByNames(names[])` — lookup batch con query parametrizzata, ritorna `Map<name, CardData>`.
- Connessione singleton, apertura in sola lettura.

Queste funzioni vengono chiamate **direttamente dai moduli Nuxt in fase di build**, non da un endpoint HTTP: `server/api/` è attualmente vuota, non esiste un `/api/cards`.

---

## Build-Time Content Transformation

Tre moduli custom in `modules/`, registrati come ultimi in `nuxt.config.ts`, agganciati all'hook `content:file:beforeParse` di `@nuxt/content` — riscrivono il markdown grezzo **prima** che venga parsato:

- **`modules/card-tooltip-transformer.ts`** — converte `[[Card Name]]` / `[[Card Name|set]]` in `:MagicCardTooltip{...}`, risolvendo l'immagine da `cards.db` con fallback sulla Scryfall API (`GET /cards/named?exact=...&format=image`).
- **`modules/decklist-transformer.ts`** — converte le decklist testuali dentro `::magic-decklist` in dati strutturati chiamando `getCardsByNames()`.
- **`modules/sideboard-guide-transformer.ts`** — stessa logica per i blocchi `::magic-sideboard-guide`.

Ognuno gira solo su cartelle specifiche (`articles`, `decklists`, `reports`, `tutorials` — controllare `allowedFolders`/`forbiddenFolders` di ciascun modulo, non sono identici tra loro).

---

## Frontend Rendering

Il componente riceve dati **già risolti** (mana cost, immagine) direttamente nelle props/slot del content renderizzato — non fa fetch a runtime:

- **`app/components/magic/Decklist.vue`** — renderizza main deck / sideboard con simboli di mana e preview immagine su hover (desktop) / modal (mobile), copia decklist in formato MTGO.
- **`app/components/magic/card/Tooltip.vue`** — tooltip hover/tap per i riferimenti `[[Card]]` inline.
- **`app/components/magic/card/Display.vue`** — visualizzazione di una singola carta; questo fa fetch diretto dalla Scryfall API (non dal DB locale), supporta sintassi set/collector number.

---

## Data Flow Summary

```
Scryfall API → download-bulk-data.ts → oracle-cards.json (168 MB, gitignored)
                                    ↓
                              cards.db (~2 MB, solo Pauper-legal, gitignored)
                                    ↓
                     card-database.ts (getCardByName / getCardsByNames)
                                    ↓
        modules/{card-tooltip,decklist,sideboard-guide}-transformer.ts
                        (content:file:beforeParse, build time)
                                    ↓
              markdown riscritto → @nuxt/content parse → componenti Vue
```

---

## Current State

- Database e JSON intermedio non sono committati (gitignored), vanno rigenerati in locale con `bun run download-cards`.
- Nessun endpoint `/api/cards` — tutta la risoluzione carte avviene a build time.
- Filtro legalità Pauper applicato in fase di import.
- Simboli di mana renderizzati via CSS (`mana-font`) lato frontend.
