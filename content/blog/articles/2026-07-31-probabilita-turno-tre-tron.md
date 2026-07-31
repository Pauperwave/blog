---
title: "Quanto è probabile assemblare Tron al turno 3?"
description: "Matematica e simulazioni per capire le vere probabilità di Tron al turno 3 e il valore di Expedition Map."
tags:
  - Meta
  - Data Analysis
date: 2026-07-31
author: Hypergeomancer
thumbnail: /assets/blog/arts/atq-85b-urza-s-tower.jpg
published: true
---

## Introduzione

Assemblare Tron al turno 3 è la miglior partenza del mazzo e spesso porta a vincere direttamente la partita.
Tutto, dalla costruzione della lista alle scelte di mulligan, ruota attorno a una singola domanda: quanto spesso è davvero possibile assemblare le tre terre il più rapidamente possibile?

L'intuizione dei giocatori tende a oscillare tra due estremi: da un lato, la sensazione che Tron "parta sempre" quando serve; dall'altro, la frustrazione di mani che non ci arrivano nemmeno lontanamente.
Senza numeri, è difficile capire quale delle due percezioni sia più vicina alla realtà.

In questo articolo fissiamo uno scenario standard e analizziamo il problema in modo rigoroso ma concreto.
Vedremo come cambiano le cose al variare delle configurazioni e perché alcune carte e decisioni hanno un impatto molto più grande di quanto sembri.

Sono Hypergeomancer, matematico e giocatore competitivo di Magic.
Quello che segue non è una guida strategica, ma un'analisi quantitativa: l'obiettivo non è più intuire, ma misurare.

::magic-cards
---
cards:
  - Urza's Tower
  - Urza's Power Plant
  - Urza's Mine
caption: "Le tre terre del Tron"
layout: hand
---
::

## Lo scenario di riferimento

Per fare calcoli servono numeri fissi.
Prendiamo la configurazione 4-4-4-4 usata nei mazzi competitivi:

- 4 [[Urza's Tower]]
- 4 [[Urza's Mine]]
- 4 [[Urza's Power Plant]]
- 4 [[Expedition Map]]
- 44 altre carte

Mazzo da 60 carte, mano iniziale di 7.
Questa struttura è praticamente universale nelle liste competitive: deviare da essa riduce la consistenza in modo drastico.
Studieremo separatamente le varie configurazioni per assemblare le tre terre al terzo turno di gioco.

## Tron Naturale: pescare tutte e tre

Il caso più diretto: la mano iniziale contiene almeno una copia di ciascuna terra del Tron.
La probabilità esatta, calcolata con la distribuzione ipergeometrica, è:

$$
4.71\% \quad \text{(circa 1 mano su 21)}
$$

Meno di una partita su venti.
Se ti sembra poco, hai ragione: **il Tron Naturale da solo non può reggere un archetipo competitivo**.
Con questa frequenza, aspetteresti in media 21 partite prima di vedere una mano con tutte e tre le terre.
A un torneo di 8 turni, potresti non vederlo neanche una volta.

Perché è un numero così basso? Perché servono carte specifiche da tre gruppi diversi.
Avere quattro copie di ciascuna aiuta, ma con 60 carte nel mazzo e solo 7 in mano, la combinatoria è spietata.

## Tron Assistito: il ruolo di Expedition Map

::magic-card-art-crop
---
card: Expedition Map
---
::

Ed è qui che entra [[Expedition Map]].
Il piano B, e, come vedremo, il piano principale.
Una mano con due terre del Tron diverse e almeno una Mappa permette di cercare il pezzo mancante e assemblare il Tron al turno 3.

La probabilità di questa configurazione è:

$$
10.20\% \quad \text{(circa 1 mano su 10)}
$$

Più del doppio del Tron Naturale.
E non è un caso: [[Expedition Map]] trasforma ogni coppia di terre del Tron in un potenziale Tron completo.
Senza Mappa, servono combinazioni da tre carte specifiche; con Mappa, bastano combinazioni da due carte specifiche più una generica (la Mappa stessa).

### La Mappa conta molto più di quanto pensi

Il rapporto è netto:

| Configurazione                | Probabilità |
| ----------------------------- | :---------: |
| Tron Naturale                 | 4.71%       |
| Tron Assistito (via Mappa)    | 10.20%      |
| **Tron al Turno 3 (totale)**  | **14.91%**  |

Questi due eventi sono mutualmente esclusivi: una mano non può essere sia Tron Naturale sia Tron Assistito, quindi la probabilità totale è semplicemente la somma: **14.91%**, circa **1 mano su 7** (una coincidenza numerica degna di Tron).

::bar-chart
---
title: Tron al Turno 3 - Composizione
seriesName: Probabilità
data:
  - { name: Naturale, value: 4.71 }
  - { name: Assistito, value: 10.20 }
  - { name: Totale, value: 14.91 }
---
::

Ma il dato più rilevante è la composizione di quel 14.91%:

::pie-chart
---
title: Composizione del Tron al Turno 3
data:
  - { value: 68.4, name: Tron Assistito }
  - { value: 31.6, name: Tron Naturale }
---
::

**Più di due mani su tre** che assemblano Tron al turno 3 lo fanno grazie a [[Expedition Map]], non per fortuna nelle pescate.
Il rapporto è 2.17 a 1: per ogni volta che peschi Tron Naturale, la Mappa lo assembla più di due volte.

Questo spiega perché [[Expedition Map]] è presente in quattro copie in ogni lista competitiva recente senza eccezione.
Non si tratta di un semplice "aiuto", ma è il motore principale dell'archetipo.

## La matematica del mulligan

Una mano su sette non sembra granché.
Ma nel Magic esiste il mulligan, e per Tron vale dire molto.
Ogni tentativo è un nuovo lancio di dadi indipendente dal precedente: rimescoli, peschi, e le probabilità ripartono da zero.

La formula è semplice.
Se $p$ è la probabilità di successo per singolo tentativo (cioè la probabilità di assemblare Tron al turno 3 in una singola mano), la probabilità di trovare almeno una mano buona in $n+1$ tentativi è:

$$
1 - (1-p)^{n+1}
$$

Ogni mulligan che non trova Tron "usa" un tentativo, ma la probabilità cumulativa cresce rapidamente.

### I numeri, tentativo per tentativo

| Tentativi           | Tron Naturale | Tron Assistito | Tron T3 |
| ------------------- | :-----------: | :------------: | :-----: |
| 1 (nessun mulligan) | 4.71%         | 10.20%         | 14.91%  |
| 2 (mulligan a 6)    | 9.19%         | 19.36%         | 27.60%  |
| 3 (mulligan a 5)    | 13.46%        | 27.52%         | 38.90%  |
| 4 (mulligan a 4)    | 17.52%        | 34.79%         | 47.98%  |

::line-chart
---
title: Probabilità Cumulativa per Numero di Mulligan
categories: ["1 (nessun mulligan)", "2 (mulligan a 6)", "3 (mulligan a 5)", "4 (mulligan a 4)"]
yAxisName: "Probabilità %"
series:
  - { name: Tron Naturale, data: [4.71, 9.19, 13.46, 17.52] }
  - { name: Tron Assistito, data: [10.20, 19.36, 27.52, 34.79] }
  - { name: Tron T3, data: [14.91, 27.60, 38.90, 47.98] }
---
::

La crescita è curiosa.
Un singolo mulligan quasi raddoppia le probabilità: da 14.91% a 27.60%.
Dopo due mulligan si arriva a 38.90%, e con tre tentativi si sfiora il **48%**. Quasi una partita su due.

Due osservazioni importanti:

1. **Il primo mulligan è il più prezioso.** Il salto da 14.91% a 27.60% (quasi +13 punti percentuali) è il guadagno più grande. Ogni mulligan successivo aggiunge meno: è la natura della crescita esponenziale, che rallenta man mano che la probabilità cumulativa aumenta.
2. **Il rapporto Assistito/Naturale resta costante.** A ogni mulligan, il Tron Assistito è circa 2.17 volte più frequente del Tron Naturale. Questo significa che il valore strategico di [[Expedition Map]] non dipende dalla profondità del mulligan: è strutturale.

### Cosa vuol dire in pratica?

Se giochi Tron e sei disposto a mulligare aggressivamente fino a 5 carte, hai circa il **39%** di probabilità di assemblare Tron al turno 3.
In un torneo di 8 turni, questo si traduce in circa 3 partite con Tron assemblato subito: abbastanza per rendere l'archetipo competitivo.

Se arrivi fino a mulligan a 4 (rischioso, ma a volte necessario), sfiori il 48%.
Quasi un lancio di moneta.

## I numeri riassunti

|  Evento                       | Valore              |
| ----------------------------- | :-----------------: |
| Tron Naturale (mano di 7)     | 4.71% (1 su 21)     |
| Tron Assistito (mano di 7)    | 10.20% (1 su 10)    |
| **Tron T3 (mano di 7)**       | **14.91% (1 su 7)** |
| Tron T3 dopo 1 mulligan       | 27.60% (1 su 3.6)   |
| Tron T3 dopo 2 mulligan       | 38.90% (1 su 2.6)   |
| Tron T3 dopo 3 mulligan       | 47.98% (1 su 2.1)   |
| Quota di Tron T3 da Mappa     | 68.4%               |
| Rapporto Assistito / Naturale | 2.17×               |

## Verifica: un milione di partite simulate

Per controllare la correttezza di questi risultati, li abbiamo verificati simulando un milione di mani d'apertura al computer (metodo Monte Carlo).
I risultati simulati coincidono con i calcoli teorici con un margine d'errore inferiore a 0.1%:

| Evento         | Teorico | Simulato | Errore |
| -------------- | :-----: | :------: | :----: |
| Tron Naturale  | 4.71%   | 4.70%    | 0.01%  |
| Tron Assistito | 10.20%  | 10.25%   | 0.05%  |
| Tron T3        | 14.91%  | 14.95%   | 0.04%  |

## Conclusione: tre cose da ricordare

1. **Senza Mappa, Tron non è un archetipo.** Il 4.71% di Tron Naturale è troppo basso per competere. [[Expedition Map]] porta il totale a 14.91%, trasformando una curiosità in una strategia (non a caso, un precedente ban di [[Expedition Map]] ha reso il mazzo praticamente non competitivo per mesi).
2. **La Mappa non è un piano B, è il piano A.** Più di due terzi delle mani che assemblano Tron al turno 3 passano per Mappa. Trattarla come "supporto" è un errore concettuale.
3. **I mulligan aggressivi funzionano.** Ogni mulligan aggiuntivo offre una nuova possibilità indipendente. Due mulligan portano a 39%, tre a 48%. La struttura 4-4-4-4 è progettata per reggere questa strategia.

Alla fine, Tron è un archetipo fondato su due pilastri: una configurazione del mazzo ottimizzata e una gestione disciplinata del mulligan.
La matematica quantifica quello che i giocatori esperti sanno per istinto, e conferma che quel singolo artefatto da un mana è, probabilisticamente parlando, la carta più importante del mazzo.

---

::video-preview
---
url: https://youtu.be/B_UUarIJt2E
---
::

::paper-preview
---
url: https://zenodo.org/records/18802326
---
::
