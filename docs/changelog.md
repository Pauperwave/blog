---
title: Changelog
description: Registro delle modifiche tecniche al progetto
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
