---
title: Componenti disponibili in scrittura
description: Descrizione dettagliata dei componenti disponibili durante la scrittura di un articolo
sitemap:
  loc: /componenti
  images:
    - loc: https://avatars.githubusercontent.com/u/225214755?s=200&v=4
---

## Componenti predefiniti

```text
Link: [Prose Components](/articles/2026-01-17-lorwyn-eclipsed)
```

Link: [Prose Components](/articles/2026-01-17-lorwyn-eclipsed)

```text
> This is a quote block
```

> This is a quote block

````text
```js [file.js]
export default () => {
  console.log('Code block')
}
```
````

```js [file.js]
export default () => {
  console.log('Code block')
}
```

```text
# Intestazione di primo livello (non usare)

## Intestazione di secondo livello

### Intestazione di terzo livello

#### Intestazione di quarto livello
```

```text
Divisore sotto.

---
```

Divisore sotto.

---

Divisore sopra.

Se necessiti di specificare la larghezza di un'immagine, usa html

```text
![drawing](https://avatars.githubusercontent.com/u/225214755?s=200\&v=4){style="width:400px; display: block; margin: 0 auto;"}
```

![drawing](https://avatars.githubusercontent.com/u/225214755?s=200\&v=4){style="width:400px; display: block; margin: 0 auto;"}

```text
- Una
- lista
- non
- ordinata
```

- Una
- lista
- non
- ordinata

```text
1. Una
2. lista
3. numerata
```

1. Una
2. lista
3. numerata

```text
Una parola **in grassetto**.
```

Una parola **in grassetto**.

```text
Una parola *in corsivo*.
```

Una parola *in corsivo*.

```text
Scrivo `codice` in linea.
```

Scrivo `codice` in linea.

```text
::tip
Messaggio di nota.
::
```

::tip
Messaggio di nota.
::

```text
::caution
Messaggio di cautela.
::
```

::caution
Messaggio di cautela.
::

```text
::note
Messaggio informativo.
::
```

::note
Messaggio informativo.
::

```text
::warning
Messaggio di allerta.
::
```

::warning
Messaggio di allerta.
::

```text
::card{title="Titolo della card"}
Contenuto della card.
::
```

::card{title="The Consistency Paradox"}
The people who seem most disciplined aren't superhuman – they've just made their habits so small and automatic that they barely require willpower. They're like efficiency ninjas, but with better sleep schedules.
::

```text
| Key | Type      | Description |
| --- | --------- | ----------- |
| 1   | Wonderful | Table       |
| 2   | Wonderful | Data        |
| 3   | Wonderful | Website     |
```

| Key | Type      | Description |
| --- | --------- | ----------- |
| 1   | Wonderful | Table       |
| 2   | Wonderful | Data        |
| 3   | Wonderful | Website     |

```text
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
```

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

## Componenti personalizzati

### Simboli di mana singoli

```js [Simboli di mana]
:magic-card-mana-symbol{symbol="w"}

:magic-card-mana-symbol{symbol="u"}

:magic-card-mana-symbol{symbol="b"}

:magic-card-mana-symbol{symbol="r"}

:magic-card-mana-symbol{symbol="g"}

:magic-card-mana-symbol{symbol="c"}
```

:magic-card-mana-symbol{symbol="w"} / :magic-card-mana-symbol{symbol="u"} / :magic-card-mana-symbol{symbol="b"} / :magic-card-mana-symbol{symbol="r"} / :magic-card-mana-symbol{symbol="g"} / :magic-card-mana-symbol{symbol="c"}

### Combinazioni di simboli di mana

::note
Nota lo spazio fra i simboli
::

```js [Simboli di mana]
:magic-card-mana-symbol{symbol="wubrgc"}
```

:magic-card-mana-symbol{symbol="wubrgc"}

### Simboli speciali

```js [Simboli speciali]
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
```

:magic-card-mana-symbol{symbol="X"} / :magic-card-mana-symbol{symbol="0"} / :magic-card-mana-symbol{symbol="1"} / :magic-card-mana-symbol{symbol="2"} / :magic-card-mana-symbol{symbol="3"} / :magic-card-mana-symbol{symbol="4"} / :magic-card-mana-symbol{symbol="5"} / :magic-card-mana-symbol{symbol="6"} / :magic-card-mana-symbol{symbol="7"} / :magic-card-mana-symbol{symbol="8"} / :magic-card-mana-symbol{symbol="9"} / :magic-card-mana-symbol{symbol="10"}

### Combinazioni di colori

```js [Combinazioni di colori]
:magic-card-mana-symbol{symbol="W/B"}

:magic-card-mana-symbol{symbol="U/B"}

:magic-card-mana-symbol{symbol="U/R"}

:magic-card-mana-symbol{symbol="B/R"}

:magic-card-mana-symbol{symbol="B/G"}

:magic-card-mana-symbol{symbol="R/G"}

:magic-card-mana-symbol{symbol="R/W"}

:magic-card-mana-symbol{symbol="G/W"}

:magic-card-mana-symbol{symbol="G/U"}
```

:magic-card-mana-symbol{symbol="W/U"} / :magic-card-mana-symbol{symbol="W/B"} / :magic-card-mana-symbol{symbol="U/B"} / :magic-card-mana-symbol{symbol="U/R"} / :magic-card-mana-symbol{symbol="B/R"} / :magic-card-mana-symbol{symbol="B/G"} / :magic-card-mana-symbol{symbol="R/G"} / :magic-card-mana-symbol{symbol="R/W"} / :magic-card-mana-symbol{symbol="G/W"} / :magic-card-mana-symbol{symbol="G/U"}

### Tipi di carte

```js [Tipi di carte]
:magic-card-mana-symbol{symbol="creature"}

:magic-card-mana-symbol{symbol="instant"}

:magic-card-mana-symbol{symbol="sorcery"}

:magic-card-mana-symbol{symbol="artifact"}

:magic-card-mana-symbol{symbol="land"}

:magic-card-mana-symbol{symbol="enchantment"}
```

:magic-card-mana-symbol{symbol="creature"} / :magic-card-mana-symbol{symbol="instant"} / :magic-card-mana-symbol{symbol="sorcery"} / :magic-card-mana-symbol{symbol="artifact"} / :magic-card-mana-symbol{symbol="land"} / :magic-card-mana-symbol{symbol="enchantment"}

### Simboli di mana phyrexiano

```js [Simboli di mana phyrexiano]
:magic-card-mana-symbol{symbol="P"}

:magic-card-mana-symbol{symbol="W/P"}

:magic-card-mana-symbol{symbol="U/P"}

:magic-card-mana-symbol{symbol="B/P"}

:magic-card-mana-symbol{symbol="R/P"}

:magic-card-mana-symbol{symbol="G/P"}
```

:magic-card-mana-symbol{symbol="P"} / :magic-card-mana-symbol{symbol="W/P"} / :magic-card-mana-symbol{symbol="U/P"} / :magic-card-mana-symbol{symbol="B/P"} / :magic-card-mana-symbol{symbol="R/P"} / :magic-card-mana-symbol{symbol="G/P"}

::note
Per una lista completa consultare [Mana & Card Icons](https://mana.andrewgioia.com/icons.html)
::

## Mostrare l'anteprima di una carta nel testo

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

### Alcuni casi limite

Alcuni casi limite con double faced cards e adventure cards

::note
Questi casi sono gestiti in modo speciale per garantire che la prima faccia della carta venga visualizzata correttamente.
::

:magic-card-tooltip{name="Delver of Secrets"} / :magic-card-tooltip{name="The Modern Age"} / :magic-card-tooltip{name="Sagu Wildling"}

::caution
Al momento non è possibile mostrare la seconda faccia di una carta double faced.
::

```text
:magic-card-tooltip{name="Insectile Aberration"}
```

:magic-card-tooltip{name="Insectile Aberration"}

```text
:magic-card-tooltip{name="Vector Glider"}
```

:magic-card-tooltip{name="Vector Glider"}

## Mostrare una carta per intera

Semplice componente per mostrare una carta per intera, utile negli articoli di `spoiler`.

```md
::magic-card-display
---
card: Swords to Plowshares
---
::
```

:magic-card-display{card="Swords to Plowshares"}

## Mostrare l'art di una carta

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

## Esprimere una valutazione

Componente per mostrare il voto di una carta su una scala da 0 a 10.

### Come usarlo

```md
::magic-card-rating
---
cardName: Nome della carta
rating: 6.5
---
::
```

### Esempi di voti da 0 a 10

Il colore del badge cambia in base al voto:

- **0 - 3.5**: Rosso (error) - Voto insufficiente
- **4 - 5.5**: Giallo/Arancio (warning) - Voto mediocre
- **6 - 7.5**: Blu (primary) - Voto buono
- **8 - 10**: Verde (success) - Voto eccellente

::magic-card-rating{:rating='0' card-name="Pessimo"}
::

::magic-card-rating{:rating='3.5' card-name="Molto scarso"}
::

::magic-card-rating{:rating='4' card-name="Scarso"}
::

::magic-card-rating{:rating='5.5' card-name="Sotto la media"}
::

::magic-card-rating{:rating='6' card-name="Nella media"}
::

::magic-card-rating{:rating='7.5' card-name="Discreto"}
::

::magic-card-rating{:rating='8' card-name="Buono"}
::

::magic-card-rating{:rating='10' card-name="Molto buono"}
::

## Opinione del revisore

Componente per mostrare l'opinione di un revisore su una carta, utilizzato negli articoli di spoiler.

### Come usarlo

```md
::reviewer-opinion
---
name: Nome del revisore
rating: 7
---
Testo dell'opinione del revisore sulla carta.
::
```

### Esempio

::reviewer-opinion
---
name: Pietro Bragioto
rating: 7
---
Carta interessante che potrebbe trovare spazio in diversi archetipi. La sua versatilità la rende una solida aggiunta al formato, anche se non è una carta definitiva. Il costo di mana è giustificato dall'impatto che può avere sulla partita.
::

## Guida al sideboard

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

## Mostrare una decklist

::note
Componente utile in articoli `decklist`, `report` e `tutorial`.
::

```md
::magic-decklist
---
name: Elves
player: Lahiri Cristofori
placement: Winner
headerGradient: monowhite
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

### Gradienti per le decklist

#### Gradienti mono-colore

```text
headerGradient: monowhite
```

::magic-decklist
---
headerGradient: monowhite
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: monoblue
```

::magic-decklist
---
headerGradient: monoblue
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: monoblack
```

::magic-decklist
---
headerGradient: monoblack
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: monored
```

::magic-decklist
---
headerGradient: monored
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: monogreen
```

::magic-decklist
---
headerGradient: monogreen
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: colorless
```

::magic-decklist
---
headerGradient: colorless
name: heading
placement: placement
player: subheading
---
::

#### Gradienti due-colori

```text
headerGradient: gruul
```

::magic-decklist
---
headerGradient: gruul
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: azorius
```

::magic-decklist
---
headerGradient: azorius
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: dimir
```

::magic-decklist
---
headerGradient: dimir
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: boros
```

::magic-decklist
---
headerGradient: boros
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: golgari
```

::magic-decklist
---
headerGradient: golgari
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: izzet
```

::magic-decklist
---
headerGradient: izzet
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: orzhov
```

::magic-decklist
---
headerGradient: orzhov
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: rakdos
```

::magic-decklist
---
headerGradient: rakdos
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: selesnya
```

::magic-decklist
---
headerGradient: selesnya
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: simic
```

::magic-decklist
---
headerGradient: simic
name: heading
placement: placement
player: subheading
---
::

#### Gradienti tre-colori

```text
headerGradient: esper
```

::magic-decklist
---
headerGradient: esper
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: grixis
```

::magic-decklist
---
headerGradient: grixis
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: jund
```

::magic-decklist
---
headerGradient: jund
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: naya
```

::magic-decklist
---
headerGradient: naya
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: bant
```

::magic-decklist
---
headerGradient: bant
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: mardu
```

::magic-decklist
---
headerGradient: mardu
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: temur
```

::magic-decklist
---
headerGradient: temur
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: sultai
```

::magic-decklist
---
headerGradient: sultai
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: jeskai
```

::magic-decklist
---
headerGradient: jeskai
name: heading
placement: placement
player: subheading
---
::

```text
headerGradient: abzan
```

::magic-decklist
---
headerGradient: abzan
name: heading
placement: placement
player: subheading
---
::
