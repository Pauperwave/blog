---
title: Componenti disponibili in scrittura
description: Descrizione dettagliata dei componenti disponibili durante la scrittura di un articolo
sitemap:
  loc: /componenti
  images:
    - loc: https://avatars.githubusercontent.com/u/225214755?s=200&v=4
---

# Componenti predefiniti

```
Link: [Prose Components](/articles/2026-01-17-lorwyn-eclipsed)
```

Link: [Prose Components](/articles/2026-01-17-lorwyn-eclipsed)

> Block quote

```js [file.js] {2} meta-info=val
export default () => {
  console.log('Code block')
}
```

`code`

# H1 Heading

## H2 Heading

### H3 Heading

#### H4 Heading

Divider under.

---

Divider above.

![A Cool Image](https://avatars.githubusercontent.com/u/225214755?s=200\&v=4)

Se necessiti di specificare la larghezza di un'immagine, usa html

```text
<img src="https://avatars.githubusercontent.com/u/225214755?s=200&v=4" alt="drawing" style="width:200px;"/>
```

![drawing](https://avatars.githubusercontent.com/u/225214755?s=200\&v=4){style="width:200px;"}

- Una
- lista
- non
- ordinata

1. Una
2. lista
3. numerata

**Just a strong paragraph.**

*Just an italic paragraph.*

::tip
Messaggio di nota.
::

::caution
Coffee and tea dehydrate you – WRONG! While caffeine has mild diuretic effects, you're still getting net hydration. Your morning coffee counts, coffee addicts rejoice! ☕
::

::note
You are hereby granted permission to eat foods you enjoy without guilt. The stress from guilt might be worse for you than the occasional cookie. Mind = blown! 🍪
::

::warning
Messaggio di allerta.
::

::card{title="The Consistency Paradox"}
The people who seem most disciplined aren't superhuman – they've just made their habits so small and automatic that they barely require willpower. They're like efficiency ninjas, but with better sleep schedules.
::

| Key | Type      | Description |
| --- | --------- | ----------- |
| 1   | Wonderful | Table       |
| 2   | Wonderful | Data        |
| 3   | Wonderful | Website     |

::u-table
---
data:
  - Time Period: Week 1-2
    What Happens: Feels hard, requires lots of willpower
    Example: Every workout is a battle
  - Time Period: Week 3-4
    What Happens: Starts to feel slightly easier
    Example: You remember to pack gym clothes
  - Time Period: Week 5-8
    What Happens: Becomes part of routine
    Example: You feel weird on rest days
  - Time Period: Month 3+
    What Happens: Automatic behavior
    Example: Working out feels as natural as brushing teeth
---
::

# Componenti personalizzati

```js [Simboli di mana]
:magic-card-mana-symbol{symbol="w"}
```

:magic-card-mana-symbol{symbol="w"}

:magic-card-mana-symbol{symbol="u"}

:magic-card-mana-symbol{symbol="b"}

:magic-card-mana-symbol{symbol="r"}

:magic-card-mana-symbol{symbol="g"}

:magic-card-mana-symbol{symbol="c"}

---

:magic-card-mana-symbol{symbol="w"}

:magic-card-mana-symbol{symbol="u"}

:magic-card-mana-symbol{symbol="b"}

:magic-card-mana-symbol{symbol="r"}

:magic-card-mana-symbol{symbol="g"}

:magic-card-mana-symbol{symbol="c"}

---

:magic-card-mana-symbol{symbol="X"}

:magic-card-mana-symbol{symbol="0"}

:magic-card-mana-symbol{symbol="1"}

:magic-card-mana-symbol{symbol="2"}

:magic-card-mana-symbol{symbol="3"}

:magic-card-mana-symbol{symbol="4"}

:magic-card-mana-symbol{symbol="5"}

:magic-card-mana-symbol{symbol="6"}

:magic-card-mana-symbol{symbol="7"}

:magic-card-mana-symbol{symbol="8"}

:magic-card-mana-symbol{symbol="9"}

:magic-card-mana-symbol{symbol="10"}

---

:magic-card-mana-symbol{symbol="W/U"}

:magic-card-mana-symbol{symbol="W/B"}

:magic-card-mana-symbol{symbol="U/B"}

:magic-card-mana-symbol{symbol="U/R"}

:magic-card-mana-symbol{symbol="B/R"}

:magic-card-mana-symbol{symbol="B/G"}

:magic-card-mana-symbol{symbol="R/G"}

:magic-card-mana-symbol{symbol="R/W"}

:magic-card-mana-symbol{symbol="G/W"}

:magic-card-mana-symbol{symbol="G/U"}

---

:magic-card-mana-symbol{symbol="creature"}

:magic-card-mana-symbol{symbol="instant"}

:magic-card-mana-symbol{symbol="sorcery"}

:magic-card-mana-symbol{symbol="artifact"}

:magic-card-mana-symbol{symbol="land"}

:magic-card-mana-symbol{symbol="enchantment"}

---

:magic-card-mana-symbol{symbol="P"}

:magic-card-mana-symbol{symbol="W/P"}

:magic-card-mana-symbol{symbol="U/P"}

:magic-card-mana-symbol{symbol="B/P"}

:magic-card-mana-symbol{symbol="R/P"}

:magic-card-mana-symbol{symbol="G/P"}

Per una lista completa consultare [Mana & Card Icons](https://mana.andrewgioia.com/icons.html)

## `magic-card-tooltip`

Componente "in linea", Disponible in `articles` `decklists` `reports` `tutorials`

### Quando usarlo

Il componente `magic-card-tooltip` è utile nel testo, è quindi un componente *in linea*, quando si vuole mostrare l'anteprima di una carta tramite hover (da pc) o toccando il nome della carta da mobile.

### Come usarlo

Selezionare il nome della carta completo **in inglese** e premere due volte il carattere `[` (parentesi quadra aperta), l'editor di testo Visual Studio Code inserirà automaticamente le parentesi di chiusura (`]]`).

Una volta che il codice viene analizzato verrà automaticamente trasformato nel componente `magic-card-tooltip`.

```md [La sintassi con le parentesi quadre viene trasformata automaticamente]
:magic-card-tooltip{name="Swords to Plowshares"}
```

### Varianti

Ci sono due varianti di questo componente:

- con la sola specifica del nome (`name`): viene restituita l'ultima illustrazione "normale";
  ```md \[Versione minimale]
  [[Swords to Plowshares]]
  ```
  Risultato: :magic-card-tooltip{name="Swords to Plowshares"}
- con la specifica del nome (`name`) e dell'espansione (`set`): spiegazione;
  ```md \[Versione minimale]
  [[Swords to Plowshares | spg]]
  ```
  Risultato: :magic-card-tooltip{name="Swords to Plowshares" set="spg"}

Il componente `magic-card-tooltip` viene riutilizzato all'interno del componente `magic-decklist` e del componente `magic-sideboard-guide` come potrai notare più avanti.

### Alcuni casi limite con double faced cards e adventure cards

:magic-card-tooltip{name="Delver of Secrets"}
:magic-card-tooltip{name="The Modern Age"}
:magic-card-tooltip{name="Sagu Wildling"}

## `magic-card-display`

```md
::magic-card-display
---
card: Swords to Plowshares
---
::
```

:magic-card-display{card="Swords to Plowshares"}

## `magic-card-art-crop`

Il componente `magic-card-art-crop` in modo predefinito prende il nome della carta e ne restituisce l'art.
è possibile specificare l'espansione e il numero di collezione della carta, il numero di espansione non è necessario quando l'art è univoca.

```md
::magic-card-art-crop
---
card: Swords to Plowshares (spg)
---
::
```

:magic-card-art-crop{card="Swords to Plowshares (spg)"}

### Varianti

Opzionalmente è possibile specificare la proprietà `crop` con due parametri obbligatori:

- `height`: che assumere i valori `small` | `medium` | `large` | `xl`
- `position`: che assumere i valori `top` | `center` | `bottom`

### Comportamento predefinito

Senza alcun parametro viene restituita tutta l'art.

```md
::magic-card-art-crop
---
card: Repel Calamity
---
::
```

In questo caso è possibile specificare in modo più immediato:

```md
:magic-card-art-crop{card="Repel Calamity"}
```

::warning
Nota bene che in questo caso si usano solo un due punti, non due.
::

Il risultato è il medesimo:

:magic-card-art-crop{card="Repel Calamity"}

### Small top crop

```md
::magic-card-art-crop
---
card: Repel Calamity
crop:
  height: small
  position: top
---
::
```

### Small center crop

::magic-card-art-crop
---
crop:
  height: medium
  position: top
card: Repel Calamity
---
::

```md
::magic-card-art-crop
---
card: Repel Calamity
crop:
  height: small
  position: center
---
::
```

::magic-card-art-crop
---
crop:
  height: medium
  position: center
card: Repel Calamity
---
::

### Small bottom crop

```md
::magic-card-art-crop
---
card: Repel Calamity
crop:
  height: small
  position: bottom
---
::
```

::magic-card-art-crop
---
crop:
  height: medium
  position: bottom
card: Repel Calamity
---
::

## `magic-sideboard-guide`

::warning
Non disponible in `decklists` e in `spoilers`.
::

```md
::magic-sideboard-guide
---
description: Descrizione breve delle scelte di side
matchup: Mono Red Rally
---
#in
3 Cast into the Fire
#out
3 Thermo-Alchemist
#out-alt
1 Thermo-Alchemist
2 Great Furnace
::
```

## `magic-decklist`

```md
::magic-decklist
---
name: Elves
player: Lahiri Cristofori
placement: Winner
---
Creatures
4 Delver of Secrets
4 Elvish Mystic
4 Sagu Wildling
4 The Modern Age
4 Masked Vandal
4 Priest of Titania
4 Timberwatch Elf
4 Avenging Hunter
3 Sagu Wildling
4 Generous Ent

Sorceries
4 Land Grant
4 Winding Way
4 Lead the Stampede

Lands
1 Gingerbread Cabin
8 Forest

Sideboard
4 Spinewoods Paladin
3 Faerie Macabre
3 Hydroblast
3 Monstrous Emergence
1 Island
1 Tangled Islet
::
```

### Esempi di gradienti per `magic-decklist`

#### Mono Color :magic-card-mana-symbol{symbol="w"} / :magic-card-mana-symbol{symbol="u"} / :magic-card-mana-symbol{symbol="b"} / :magic-card-mana-symbol{symbol="r"} / :magic-card-mana-symbol{symbol="g"}

```
headerGradient: monowhite
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: monowhite
---
::

```
headerGradient: monoblue
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: monoblue
---
::

```
headerGradient: monoblack
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: monoblack
---
::

```
headerGradient: monored
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: monored
---
::

```
headerGradient: monogreen
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: monogreen
---
::

```
headerGradient: colorless
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: colorless
---
::

#### Two-Color Combinations :magic-card-mana-symbol{symbol="rg"} / :magic-card-mana-symbol{symbol="wu"} / :magic-card-mana-symbol{symbol="ub"} / :magic-card-mana-symbol{symbol="rw"} / :magic-card-mana-symbol{symbol="bg"} / :magic-card-mana-symbol{symbol="ur"} / :magic-card-mana-symbol{symbol="wb"} / :magic-card-mana-symbol{symbol="br"} / :magic-card-mana-symbol{symbol="gw"} / :magic-card-mana-symbol{symbol="gu"}

```
headerGradient: gruul
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: gruul
---
::

```
headerGradient: azorius
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: azorius
---
::

```
headerGradient: dimir
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: dimir
---
::

```
headerGradient: boros
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: boros
---
::

```
headerGradient: golgari
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: golgari
---
::

```
headerGradient: izzet
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: izzet
---
::

```
headerGradient: orzhov
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: orzhov
---
::

```
headerGradient: rakdos
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: rakdos
---
::

```
headerGradient: selesnya
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: selesnya
---
::

```
headerGradient: simic
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: simic
---
::

#### Three-Color Combinations :magic-card-mana-symbol{symbol="wub"} / :magic-card-mana-symbol{symbol="ubr"} / :magic-card-mana-symbol{symbol="brg"} / :magic-card-mana-symbol{symbol="rgw"} / :magic-card-mana-symbol{symbol="gwu"} / :magic-card-mana-symbol{symbol="wbr"} / :magic-card-mana-symbol{symbol="urg"} / :magic-card-mana-symbol{symbol="bgu"} / :magic-card-mana-symbol{symbol="rwu"} / :magic-card-mana-symbol{symbol="wbg"}

```
headerGradient: esper
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: esper
---
::

```
headerGradient: grixis
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: grixis
---
::

```
headerGradient: jund
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: jund
---
::

```
headerGradient: naya
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: naya
---
::

```
headerGradient: bant
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: bant
---
::

```
headerGradient: mardu
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: mardu
---
::

```
headerGradient: temur
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: temur
---
::

```
headerGradient: sultai
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: sultai
---
::

```
headerGradient: jeskai
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: jeskai
---
::

```
headerGradient: abzan
```

::magic-decklist
---
name: textClasses.heading
player: textClasses.subheading
placement: textClasses.placement
headerGradient: abzan
---
::
