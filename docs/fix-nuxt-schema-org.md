# Fix: nuxt-schema-org crash

## Comando applicato

```bash
git checkout 4c259b7 -- bun.lock
bun install --frozen-lockfile
```

## Spiegazione

`nuxt-schema-org` 6.2.1 (aggiornato automaticamente tramite `@nuxtjs/seo`) ha introdotto una funzione in `webPageResolver.defaults` per rilevare il tipo di pagina dall'URL. `unhead` v2 (richiesto da Nuxt 4) chiama con zero argomenti qualsiasi funzione che incontra nei props dei tag `<head>`, causando il crash:

> `Cannot destructure property 'meta' of 'undefined' as it is undefined.`

## Fix permanente

`package.json` ora include un override che pinna `nuxt-schema-org` a `6.0.4` (ultima versione funzionante), impedendo che future `bun install` la aggiornino:

```json
"overrides": {
  "nuxt-schema-org": "6.0.4"
}
```

Il `bun.lock` è stato ripristinato dal commit `4c259b7` — solo quel file, gli articoli e il codice restano invariati.
