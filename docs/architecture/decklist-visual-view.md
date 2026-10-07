# Vista visuale delle decklist

Come funziona la "Vista visuale" di una decklist: overlay a schermo intero con tutte le carte, statistiche interattive, immagine esportabile e link condivisibile. Complementare a `card-download-database-flow.md` (da dove arrivano i dati delle carte).

## Cosa fa

- **Desktop:** il bottone "Vista visuale" (e il click sul nome di una carta) apre `DecklistOverlay`, un modale a schermo intero che contiene `DecklistGraphic`: header con titolo, giocatore, barra dei colori, conteggio per tipo e curva di mana, poi le carte a pile da 4 (stile MTGGoldfish) e la sideboard a ventaglio.
- **Mobile:** non c'è l'overlay; il click su una carta apre `DecklistCardModal` (modale a scorrimento tra le carte). Il bottone "Statistiche" (`DecklistStats`) è disponibile ovunque.
- **Export:** "Copia immagine" / "Scarica immagine" rendono `DecklistGraphic` in un'immagine (`useElementImageExport`). Per questo `DecklistGraphic` è opaco e senza controlli, deve avere **un solo elemento radice e nessun commento prima**, altrimenti `$el` non è più quell'elemento e l'export fallisce (vedi il commento in testa al componente).

## Mappa dei file

| Cosa | Dove |
|------|------|
| Orchestrazione (props, copia lista, statistiche, visualizzatori) | `app/components/magic/Decklist.vue` |
| Overlay desktop + bottoni (copia/scarica immagine, condividi) | `DecklistOverlay.vue` |
| Contenuto renderizzato (e esportato) | `DecklistGraphic.vue`, `DecklistPile.vue`, `DecklistArt.vue` |
| Statistiche nell'header | `DecklistColorBars.vue`, `DecklistTypeCounts.vue`, `DecklistCurveChart.vue`, `DecklistCurveBar.vue` |
| Pannello "Statistiche" (anche mobile) | `DecklistStats.vue` (usa `DecklistCurveBar`) |
| Stato dell'hover sulle statistiche | `app/composables/useDeckHighlight.ts` |
| Link `?preview` e URL dell'overlay | `app/composables/useDeckPreviewLink.ts`, `app/utils/deck-preview.ts` |
| Copia link con toast | `useCopyToClipboard().copyLink` |

Utility pure (tutte con test accanto, `*.test.ts`):

- `app/utils/mana-cost.ts` — parsing dei costi (`parseManaValue`, `countColorPips`, `cardCurveColor`, `curveBucket`) e tipi `DeckColor`/`CurveColor`.
- `app/utils/deck-stats.ts` — `computeDeckStats`: curva (con split per colore), simboli di mana, costo medio, terre, conteggi per tipo.
- `app/utils/deck-highlight.ts` — `DeckHighlight` e `highlightState` (`match` / `dim` / `neutral`).
- `app/utils/curve-display.ts` — `curveSegments` e `curveTooltip` (segmenti colorati e testo dei tooltip della curva).
- `app/utils/deck-cards.ts` — `uniqueDeckCards`, `expandCopies`; `app/utils/deck-art.ts` — scelta dell'immagine dell'header.

## Dati: da dove arriva cosa

1. Il transformer (`modules/decklist-transformer.ts`) legge il testo della decklist, risolve ogni carta da `cards.db` e produce `ParsedCard[]` per sezione (JSON nelle props di `Decklist.vue`). Le sezioni del main deck (Creatures, Instants, ...) sono quelle **scritte dall'autore** nel markdown.
2. `Decklist.vue` calcola `deckStats` (`computeDeckStats`) e `deckCards` (`uniqueDeckCards`, una voce per carta e sezione).
3. `DecklistGraphic` espande ogni voce in tante carte quante sono le copie (`expandCopies`) e le divide in pile da 4.

### Tipo delle carte della sideboard

La sideboard è una lista unica, senza intestazioni per tipo. Per poter evidenziare anche le sue carte per tipo, il database salva `type_line` (Scryfall) e il transformer imposta `typeSection` **solo** sulle carte della sideboard, derivandolo con `sectionFromTypeLine` (`shared/utils/deck-sections.ts`). Per i multitipo vince il primo in questa priorità: Creature, Land, Instant, Sorcery, Artifact, Enchantment (una creatura artefatto è una creatura, una terra artefatto è una terra); per le carte a due facce conta la faccia anteriore. `uniqueDeckCards` espone il risultato come `DeckCard.type` (la sezione stessa nel main deck, `typeSection` nella sideboard, `undefined` se non noto).

## Evidenziazione al passaggio del mouse

Passando su una statistica nell'header, `useDeckHighlight` imposta un `DeckHighlight`: `{ kind: 'type' | 'curve' | 'color', ... }`. `DecklistGraphic` lo passa alle pile e alle statistiche:

- **Carte** (`DecklistPile`): `highlightState(card, highlight)` dice se una carta fa parte della statistica (`match`), no (`dim`) o non si sa (`neutral`). Le carte `dim` prendono `grayscale-80 brightness-60` (transizione 400ms; lo zoom al hover resta a 150ms). Una carta `match` nelle pile del main deck si mostra intera (`overflow-visible`, `z-10`) davanti alle altre; nella sideboard passa in primo piano con `z-10`.
- **Regole per curva e colori:** contano le carte non-terra del main deck e le carte della sideboard con un costo di mana; le terre sono sempre `dim`. Per il **tipo** una carta senza tipo noto resta `neutral`.
- **Statistiche:** passando su un colore, gli altri segmenti della barra e della curva diventano grigi; su una colonna della curva, le altre colonne; su un tipo, il tipo viene sottolineato e ingrandito leggermente.
- **Segmento multicolore:** non si può dividere per colore, quindi `computeDeckStats` conta per ogni colonna anche `multicolor` (quante carte multicolore hanno ciascun colore). `curveSegments` divide il segmento oro in una parte a colori (carte che contengono il colore evidenziato) e una grigia (le altre), coerente con le carte evidenziate.

## Curva colorata

Le colonne della curva sono impilate per colore, dal basso: W, U, B, R, G, poi multicolore (oro) e incolore (grigio) (`CURVE_COLORS`, stili in `CURVE_COLOR_STYLES`, `app/utils/mana-colors.ts`). Un anello sottile (`ring-default`) mantiene visibili i segmenti bianchi e neri. `DecklistCurveBar` è condiviso tra la vista visuale e il pannello Statistiche. Il tooltip (`curveTooltip`) riporta totale e dettaglio per colore. L'etichetta "Costo medio" sta in alto a destra del grafico; se una delle ultime 4 colonne è alta almeno il 75% della più alta, le colonne lasciano spazio sopra per non sovrapporsi.

## Link e condivisione

- **`?preview` prima del `#`:** `…/articles/2026-09-20-pauper-wine?preview#deck-jeskai-andrea-borghi`. Se fosse dopo il `#` farebbe parte dell'id dell'ancora e lo scroll si romperebbe. `deckPreviewPath` costruisce il formato; lo usano la ricerca (`SearchContent.vue`), `useDeckPreviewLink` e il pulsante dell'overlay.
- **Apertura da link:** al mount, se la pagina ha `?preview` e il `#` coincide con l'ancora del mazzo, `useDeckPreviewLink` apre l'overlay (solo desktop; su mobile il parametro viene ignorato).
- **URL che segue l'overlay:** aprendo l'overlay l'URL diventa `?preview#ancora` (`router.replace`, nessuna voce nella cronologia); chiudendolo resta il solo `#`.
- **Due pulsanti "Condividi":** quello nell'overlay copia il link con `?preview` (apre la vista visuale); quello nel footer della decklist copia solo il `#ancora`, perché funziona anche su mobile dove non c'è l'overlay e porta chi riceve sul mazzo senza aprire nulla.

## Prezzo del mazzo

Il pannello Statistiche mostra "Prezzo stimato" (euro e tix MTGO, più il numero di carte senza prezzo) e l'header della vista visuale, quindi anche l'immagine esportata, mostra `≈ 118,32 € · 62,02 tix`.

- **Fonte:** Scryfall, dal browser del visitatore, solo quando si apre il pannello o la vista visuale (`useDeckPrice` chiama `load()`), non con la pagina. Una sola richiesta `POST https://api.scryfall.com/cards/collection` per mazzo (massimo 75 nomi per richiesta, `fetchCardPrices` in `app/utils/deck-price.ts`). Scryfall risponde con `access-control-allow-origin: *`, quindi funziona dal browser.
- **Nomi:** si chiede il nome della sola prima faccia: con il nome completo `Fronte // Retro` Scryfall risponde `not_found`.
- **Terre base:** il prezzo della stampa predefinita non esiste, quindi valgono zero e non contano come "senza prezzo".
- **Limite:** la ricerca per nome dà il prezzo della stampa predefinita di Scryfall, di solito più cara della più economica (esempio: Prismatic Strands 12,48 € contro 9,97 €), quindi è una stima per eccesso. Una stima per la stampa più economica richiederebbe una ricerca `unique:prints` per ogni carta.
- **Stati:** finché il prezzo non c'è, la vista visuale non mostra nulla (l'immagine esportata prima del caricamento non lo contiene); il pannello mostra "…" e, se la richiesta fallisce, "n/d".

## Prestazioni

Misurate su un mazzo da 75 immagini (overlay aperto), con hover simulato: l'aggiornamento dopo l'hover costa 4–8 ms e i frame durante la transizione dei filtri restano sotto i 16,7 ms. Il codice usa `defineAsyncComponent` per overlay e modale delle carte, quindi i mazzi che non li aprono non pagano nulla.

## Limiti noti

- I tooltip dei grafici sono `UTooltip` (hover/focus): su mobile il dettaglio per colore della curva potrebbe non aprirsi con un tocco. Per questo il pannello Statistiche ha una legenda sotto la curva (`curveLegend`, solo i colori presenti) che spiega anche oro (multicolore) e grigio (incolore).
- L'immagine dell'header è la carta più giocata non-terra del main deck; a parità vince la prima nell'ordine delle sezioni (`pickDeckArtCard`). Non c'è un campo frontmatter per sceglierla a mano.
- La sideboard viene valutata per costo e tipo solo se `cards.db` ha `type_line` per quelle carte; carte non trovate nel database restano senza tipo (`neutral`).
