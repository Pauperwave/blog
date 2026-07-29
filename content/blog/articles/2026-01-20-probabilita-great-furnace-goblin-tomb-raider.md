---
title: "Quanto spesso apriamo con Great Furnace e Goblin Tomb Raider?"
description: "Un'analisi matematica delle probabilità di apertura, con teoria e simulazioni a confronto."
tags:
  - Meta
  - Data Analysis
date: 2026-01-20
author: Hypergeomancer
thumbnail: /assets/blog/arts/lci-151-goblin-tomb-raider.jpg
published: true
---

# Quanto spesso apriamo con Great Furnace e Goblin Tomb Raider?

::magic-cards
---
cards:
  - Mountain
  - Great Furnace
  - Goblin Tomb Raider
  - Voldaren Epicure
  - Galvanic Blast
  - Lightning Bolt
  - Reckless Impulse
caption: "La combo emblematica di Mono-Red Rally."
arch: 20.5 # opzionale, apertura totale del ventaglio in gradi (solo layout: fan)
---
::

## Introduzione

Nel Pauper moderno, poche partenze mettono pressione quanto [[Great Furnace]] seguita da [[Goblin Tomb Raider]]. È una combinazione semplice ma estremamente efficace, una delle linee di gioco più esplosive di Mono-Red Rally.

Il Tomb Raider, supportato da una terra artefatto come [[Great Furnace]], può infliggere rapidamente una quantità di danni elevata rispetto al mana investito, costringendo spesso l'avversario a reagire immediatamente, anche quando non sarebbe pronto a farlo.

Ma al di là della percezione al tavolo, rimane una domanda fondamentale: *quanto spesso questa partenza avviene davvero?*

Sono Hypergeomancer, matematico e giocatore competitivo di Magic. Negli anni ho imparato che comprendere la matematica dietro il gioco offre un vantaggio reale, non solo teorico: un approccio che mi ha portato, tra gli altri risultati, alla Top 8 del Paupergeddon.

In questo articolo mi occuperò di rispondere in modo chiaro e concreto a questa domanda, senza matematica avanzata, ma con numeri affidabili e facilmente interpretabili da chi gioca Pauper a livello competitivo.

## Lo scenario di riferimento

Consideriamo una configurazione standard classica di Mono-Red Rally:

- Mazzo da 60 carte
- 4 copie di [[Great Furnace]]
- 4 copie di [[Goblin Tomb Raider]]
- 14 copie di [[Mountain]]

L'obiettivo è capire con che frequenza una mano iniziale da 7 carte contiene **almeno una copia di ciascuna delle due carte**, permettendo di giocare la combo al primo turno della partita.

## On-the-play: la probabilità di base

Quando siamo on-the-play e teniamo la prima mano da 7 carte, senza mulligan, la probabilità di aprire direttamente con entrambe le carte è di:

$$
14.54\% \quad \text{(circa 1 mano su 7)}
$$

Questo valore è importante perché definisce la frequenza naturale "di base" della combinazione. Non è un evento raro, ma nemmeno qualcosa che accade nella maggior parte delle partite.

Per chi gioca Mono-Red, significa che la combo è un punto di forza reale, ma non l'unico piano su cui basare il mazzo. Per chi la affronta, è un promemoria che non tutte le mani dell'avversario saranno esplosive, anche se alcune lo saranno.

## On-the-draw: il valore della carta extra

Quando siamo on-the-draw, la probabilità aumenta. La carta pescata durante il primo turno permette infatti non solo di avere già la combo in mano, ma anche di partire con un solo pezzo, e pescare l'altro immediatamente.

Considerando solo mani realisticamente tenibili (cioè con almeno una fonte di mana), la probabilità complessiva sale a:

$$
18.10\% \quad \text{(circa 1 mano su 5-6)}
$$

La differenza non è enorme, e non è sufficiente a rendere l'on-the-draw meno penalizzante per chi gioca questo tipo di strategia aggressiva.

## Il ruolo dei mulligan

Quando una mano iniziale non contiene la combo (o non è comunque tenibile), il giocatore può decidere di prendere un mulligan e pescarne un'altra. Ogni mulligan rappresenta un **nuovo tentativo indipendente** di trovare la combo. Questo è un punto fondamentale: assumendo di essere on-the-play, anche se la probabilità di trovarla in una singola mano da 7 carte è circa il 14.54%, il fatto di poter "riprovare" più volte aumenta drasticamente le probabilità complessive di vederla almeno una volta durante la fase di mulligan.

In altre parole: più mulligan facciamo, più opportunità abbiamo di imbatterci nella combinazione [[Great Furnace]] + [[Goblin Tomb Raider]], anche se ogni singola mano ha sempre la stessa probabilità base.

### L'albero dei mulligan

Questo processo può essere rappresentato visivamente come un **albero di decisione**, dove ogni ramo corrisponde a un tentativo:

::mermaid
---
code: |
  flowchart LR
      A["Pesca<br/>7 carte"] -->|14.54%| B["Trovata<br/>a 7 carte"]
      A -->|85.46%| C["Combo<br/>assente"]
      C -->|14.54%| D["Trovata<br/>a 6 carte"]
      C -->|85.46%| E["Combo<br/>assente"]
      E -->|14.54%| F["Trovata<br/>a 5 carte"]
      E -->|85.46%| G["Combo<br/>assente"]

      classDef found fill:#d4edda,stroke:#28a745,stroke-width:2px,font-weight:bold,color:#155724;
      classDef absent fill:#f8d7da,stroke:#dc3545,stroke-width:2px,color:#721c24;

      class B,D,F found
      class C,E,G absent
---
::

Nell'albero, ogni percorso verso destra è un nuovo tentativo. Anche se ogni singola mano ha una probabilità modesta, la somma di tutti i percorsi che portano al successo cresce rapidamente. Ogni livello rappresenta un tentativo indipendente.

### Risultati Numerici

Considerando mani realisticamente tenibili e una probabilità base del 14.54%:

| Scenario           | Probabilità cumulativa |
| ------------------- | ----------------------- |
| Nessun mulligan     | 14.54%                  |
| Fino a 1 mulligan   | 26.97%                  |
| Fino a 2 mulligan   | 37.59%                  |

Dopo due mulligan, quasi **4 partite su 10** avranno mostrato la combo almeno una volta.

Questo spiega perché la combo sembri più frequente di quanto suggerisca il 14.54% iniziale: non osserviamo un singolo tentativo, ma una sequenza di tentativi indipendenti che lavorano a nostro favore, in aggiunta al leggero aumento quando si è on-the-draw.

Il punto chiave non è che il giocatore debba mulligare aggressivamente *solo* per cercare la combo - un giocatore esperto mulliga per trovare mani funzionali, non per inseguire aperture specifiche. Tuttavia, ogni volta che si decide di fare mulligan per qualsiasi ragione (terra mancante, curva sbagliata, mano non tenibile), si ottiene automaticamente un nuovo tentativo indipendente di trovare la combo. È questo effetto collaterale dei mulligan strategici che fa crescere la probabilità cumulativa, non una ricerca forzata.

Per l'avversario, questo significa che anche quando Mono-Red mulliga - magari per ragioni completamente diverse - la minaccia della combo resta concreta e statisticamente più probabile di quanto sembrasse dalla prima mano.

## Validazione Monte Carlo

A questo punto è naturale chiedersi se questi numeri teorici descrivano davvero ciò che accade in pratica.

Per verificarlo, possiamo usare la **simulazione Monte Carlo**: si costruisce un mazzo virtuale e si pescano milioni di mani casuali da 7 carte, contando quante volte compaiono entrambe le carte. Ripetendo il processo un numero molto elevato di volte, il risultato medio converge verso la probabilità reale (cfr. *legge dei grandi numeri*).

Eseguendo una simulazione per il caso on-the-play senza mulligan, il risultato ottenuto è circa **14.5379%**, estremamente vicino al valore teorico (14.54%). La differenza minima rientra nelle normali fluttuazioni statistiche e conferma che l'approccio teorico descrive correttamente ciò che succede in partita.

::confidence-band-chart
---
title: Convergenza Monte Carlo (fino a 0 Mulligan)
seriesName: Numero di partite simulate
bandLabel: "Intervallo di Confidenza (95%)"
yAxisName: "Probabilità (%)"
data:
  - { x: "1k",   value: 16.20, lower: 14.90, upper: 16.50 }
  - { x: "4k",   value: 13.20, lower: 12.70, upper: 15.00 }
  - { x: "8k",   value: 14.70, lower: 13.40, upper: 15.60 }
  - { x: "15k",  value: 14.50, lower: 13.50, upper: 15.30 }
  - { x: "25k",  value: 14.25, lower: 13.50, upper: 15.05 }
  - { x: "40k",  value: 14.30, lower: 13.65, upper: 14.95 }
  - { x: "60k",  value: 14.35, lower: 13.80, upper: 14.90 }
  - { x: "90k",  value: 14.42, lower: 13.95, upper: 14.88 }
  - { x: "130k", value: 14.45, lower: 14.05, upper: 14.85 }
  - { x: "180k", value: 14.48, lower: 14.12, upper: 14.82 }
  - { x: "250k", value: 14.50, lower: 14.22, upper: 14.78 }
  - { x: "350k", value: 14.52, lower: 14.30, upper: 14.75 }
  - { x: "450k", value: 14.53, lower: 14.34, upper: 14.73 }
  - { x: "550k", value: 14.55, lower: 14.37, upper: 14.72 }
  - { x: "650k", value: 14.57, lower: 14.40, upper: 14.73 }
  - { x: "750k", value: 14.56, lower: 14.42, upper: 14.70 }
  - { x: "850k", value: 14.54, lower: 14.42, upper: 14.67 }
  - { x: "950k", value: 14.54, lower: 14.44, upper: 14.64 }
  - { x: "1M",   value: 14.5379, lower: 14.46, upper: 14.62 }
---
::

Simulazioni analoghe per i casi on-the-draw o includendo mulligan mostrano risultati coerenti con le percentuali discusse in precedenza. Sapere che teoria, esperienza di gioco e simulazioni indipendenti raccontano la stessa storia rende questi numeri uno strumento affidabile per prendere decisioni reali al tavolo.

## Conclusione

La partenza [[Great Furnace]] + [[Goblin Tomb Raider]] è diventata un simbolo di Mono-Red in Pauper perché funziona, non perché accade sempre.

I numeri raccontano una storia chiara:

- circa **1 mano su 7** quando siamo on-the-play,
- circa **1 mano su 5-6** quando siamo on-the-draw,
- e quasi **4 partite su 10** considerando i mulligan.

Abbastanza spesso da essere una minaccia reale. Non abbastanza spesso da essere inevitabile.

Capire le probabilità non serve a togliere magia al gioco, ma a leggere meglio ciò che succede al tavolo: perché certe partenze sembrano onnipresenti, perché altre volte non arrivano mai, e perché alcune decisioni di mulligan "funzionano" più di quanto sembri.

Mono-Red Rally è un mazzo Tier 1 non perché apre sempre con la combo, ma perché è costruito per funzionare anche senza. E quando la trova, lo fa abbastanza spesso da condizionare l'intero formato.

In Pauper, come spesso in Magic, non vince chi gioca la carta più forte. Vince chi costruisce la propria strategia sapendo *quando* dovrà affrontare le carte più forti dell'avversario.

---

::video-preview
---
url: https://youtu.be/uLo23nq_4bQ
---
::

::paper-preview
---
url: https://zenodo.org/records/18721570
---
::