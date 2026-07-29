---
title: "Winding Way o Lead the Stampede: cosa compra quel mana in più?"
description: "Confrontiamo matematicamente Winding Way e Lead the Stampede per capire quanto valore aggiunge davvero quella quinta carta rivelata, al costo di un mana in più."
tags:
  - Meta
  - Data Analysis
date: 2026-03-11
author: Hypergeomancer
thumbnail: /assets/blog/arts/otc-213-winding-way.jpg
published: true
---

## Il dilemma da due o tre mana

Lanci [[Winding Way]], chiami "creature", incroci le dita. Dal grimorio ne emergono… due. Onesto, sì. Ma non abbastanza.

Poi l'avversario fa lo stesso con [[Lead the Stampede]]: cinque carte rivelate, quattro creature in mano. Partita ribaltata. E tu resti lì a chiederti: *un singolo mana in più fa davvero tutta questa differenza?*

La risposta breve: sì, più di quanto pensi. La risposta lunga è il resto di questo articolo.

Sono Hypergeomancer, matematico e giocatore competitivo di Magic. Quello che segue non è un manuale su quale carta scegliere, ma una radiografia di cosa succede esattamente quando passi da quattro a cinque carte rivelate. Niente formule complicate, solo numeri concreti e qualche grafico che parla da solo.

::magic-cards
---
cards:
  - Winding Way
  - Lead the Stampede
caption: "Un mana di differenza, due profili di rischio molto diversi."
layout: hand
---
::

## Lo scenario di riferimento

Per fare un confronto sensato servono numeri fissi. Prendiamo un mazzo a base creature tipico del Pauper (Elfi o Spia, per intenderci):

- Mazzo da 60 carte
- 38 creature totali
- 22 non-creature (terre, istantanei, stregonerie)

A metà partita: 4 carte in mano (2 creature, 2 non-creature), 5 creature e 3 non-creature visibili tra campo e cimitero. Restano **48 carte nel grimorio, di cui 31 creature**, una densità di 64.6%.

Questo scenario è specifico, certo. Ma è realistico, e ci serve come banco di prova. Per calcolare le probabilità nella *tua* configurazione di gioco, ho creato un calcolatore interattivo:

[hypergeomancer.github.io/creature-selection-calculator](https://hypergeomancer.github.io/creature-selection-calculator/)

Inserisci i tuoi dati, e il resto è automatico.

## *Winding Way*: il profilo di 4 carte

[[Winding Way]] rivela le prime quattro carte del grimorio e mette in mano tutte le creature tra esse. Il numero di creature trovate non è "casuale" nel senso colloquiale del termine: segue una distribuzione statistica precisa (*ipergeometrica*), calcolabile carta per carta.

### Il quadro completo
| Creature rivelate | Probabilità |
| :---------------: | :---------: |
| 0                 | 1.2%        |
| 1                 | 10.8%       |
| 2                 | 32.5%       |
| 3                 | 39.3%       |
| 4                 | 16.2%       |

::bar-chart
---
title: "Distribuzione di Probabilità - Winding Way (4 carte)"
seriesName: Probabilità
data:
  - { name: "0", value: 1.2 }
  - { name: "1", value: 10.8 }
  - { name: "2", value: 32.5 }
  - { name: "3", value: 39.3 }
  - { name: "4", value: 16.2 }
---
::

Il valore atteso è di circa **2.6 creature** per utilizzo, questo numero rappresenta la media intorno a cui oscillano i risultati nel lungo periodo. Il picco cade a **3 creature**, che si verifica in oltre un terzo dei lanci.

Il temuto "miss" (zero creature) capita circa nell'**1.2% dei casi**. Raro, ma non impossibile: in una sessione di 80 partite, aspettati di vederlo almeno una volta.

La notizia buona è che la probabilità di trovare **almeno 2 creature** è circa di **88%** (somma delle ultime tre probabilità). Quasi nove volte su dieci, [[Winding Way]] fa il suo lavoro.

## *Lead the Stampede*: il profilo di 5 carte

Adesso aggiungiamo quella quinta carta. Stessi presupposti, stesso momento della partita ipotetica, stesso grimorio.

### Il quadro completo

| Creature rivelate | Probabilità |
| :---------------: | :---------: |
| 0                 | 0.4%        |
| 1                 | 4.3%        |
| 2                 | 18.5%       |
| 3                 | 35.7%       |
| 4                 | 31.2%       |
| 5                 | 9.9%        |

::bar-chart
---
title: "Distribuzione di Probabilità - Lead the Stampede (5 carte)"
seriesName: Probabilità
data:
  - { name: "0", value: 0.4 }
  - { name: "1", value: 4.3 }
  - { name: "2", value: 18.5 }
  - { name: "3", value: 35.7 }
  - { name: "4", value: 31.2 }
  - { name: "5", value: 9.9 }
---
::

Il valore atteso sale a **3.2 creature**, esattamente il 25% in più, perché si guarda il 25% in più di carte. Fin qui, nessuna sorpresa: il rapporto è perfettamente proporzionale.

Ma i numeri interessanti sono altrove. Il "miss" crolla a **0.4%**: tre volte più raro. Servono circa 250 partite per vederne uno. E la probabilità di pescare **almeno 2 creature** sale a **95%**: quasi una certezza.

C'è anche un fenomeno più sottile: la distribuzione non si limita a spostarsi; cambia *forma*. Diventa leggermente più asimmetrica verso destra (in statistica, questo fenomeno si chiama *skewness*): i risultati abbondanti (4 o 5 creature) diventano molto più probabili. Quanto più probabili? Vediamolo.

## La radiografia del mana extra

Eccoci al cuore di questa analisi. Cosa compra esattamente quel terzo mana? Per vederlo bene, sovrapponiamo le due distribuzioni.

::line-chart
---
title: "Winding Way vs Lead the Stampede - Distribuzioni a Confronto"
categories: ["0", "1", "2", "3", "4", "5"]
stacked: false
yAxisName: "Probabilità (%)"
series:
  - { name: "Winding Way (4 carte)", data: [1.2, 10.8, 32.5, 39.3, 16.2, 0] }
  - { name: "Lead the Stampede (5 carte)", data: [0.4, 4.3, 18.5, 35.7, 31.2, 9.9] }
---
::

Guardiamo il grafico: non è solo uno spostamento uniforme. La barra a "2 creature" si riduce drasticamente, quella a "4 creature" quasi raddoppia, e compare un'intera colonna nuova a "5". Il mana extra non aggiunge semplicemente una carta alla media, ma **redistribuisce la probabilità** verso i risultati più ricchi.

### Il delta, punto per punto

Per rendere la differenza ancora più visibile, ecco quanto cambia ogni singola probabilità:

::bar-chart
---
title: "Variazione di Probabilità (Lead the Stampede - Winding Way)"
seriesName: "Variazione (punti percentuali)"
data:
  - { name: "0", value: -0.8 }
  - { name: "1", value: -6.5 }
  - { name: "2", value: -14 }
  - { name: "3", value: -3.6 }
  - { name: "4", value: 15 }
  - { name: "5", value: 9.9 }
---
::

Il messaggio è chiaro: quel mana in più "ruba" probabilità dai risultati mediocri (0, 1, 2 creature) e la "regala" ai risultati forti (4 e 5 creature). Il risultato intermedio di 3 creature resta quasi invariato, funzionando da punto di equilibrio tra le due distribuzioni.

### I numeri riassunti

|                     | Winding Way | Lead the Stampede |
| ------------------- | :---------: | :---------------: |
| Costo               | 2 mana      | 3 mana            |
| Carte guardate      | 4           | 5                 |
| Creature attese     | 2.6         | 3.2               |
| P(zero creature)    | 1.2%        | 0.4%              |
| P(≥2 creature)      | 88%         | 95%               |
| P(≥3 creature)      | 55%         | 77%               |
| P(≥4 creature)      | 16%         | 41%               |

Due numeri saltano all'occhio: la probabilità di trovare **3 o più creature** passa da 55% a 77%, un salto di **22 punti percentuali**, e la probabilità di trovare **4 o più creature** passa da 16% a 41% - più del doppio. In molti matchup, questa è la differenza tra vincere e perdere lo scambio di risorse.

### Dove va a finire la varianza?

C'è un altro effetto, meno ovvio ma altrettanto importante. Oltre che a un maggior numero di creature, quel mana extra compra anche la **consistenza**. La varianza (cioè l'oscillazione casuale dei risultati attorno alla media) si riduce in proporzione.

::line-chart
---
title: "Probabilità Cumulativa"
categories: ["0", "1", "2", "3", "4", "5"]
stacked: false
yAxisName: "Probabilità cumulativa (%)"
series:
  - { name: "Winding Way", data: [1.2, 12.0, 44.5, 83.8, 100.0, 100.0] }
  - { name: "Lead the Stampede", data: [0.4, 4.7, 23.2, 58.9, 90.1, 100.0] }
---
::

Nella distribuzione cumulativa, per ogni soglia, [[Lead the Stampede]] raggiunge il 100% più lentamente, segno che i risultati si concentrano più in alto. In concreto: con [[Winding Way]], per essere "quasi sicuro" (≥ 90%) di trovare almeno n creature, puoi contare su n = 1. Con [[Lead the Stampede]], puoi contare su n = 2. Sembra poco, ma al tavolo significa pianificare il turno sapendo che la carta *quasi certamente* restituirà abbastanza risorse per rimanere in partita.

## Quanto conta la densità di creature?

La densità di creature nel mazzo è la leva che amplifica (o smorza) tutto quello che abbiamo visto. La relazione è quasi lineare:

| Creature nel mazzo | Winding Way (attesa) | Lead the Stampede (attesa) |
| :----------------: | :------------------: | :------------------------: |
| 36                 | 2.4                  | 3.0                        |
| 37                 | 2.5                  | 3.1                        |
| 38                 | 2.6                  | 3.2                        |
| 39                 | 2.6                  | 3.3                        |
| 40                 | 2.7                  | 3.4                        |

::line-chart
---
title: "Creature Attese vs Densità del Mazzo"
categories: ["36", "37", "38", "39", "40"]
stacked: false
yAxisName: "Creature attese per utilizzo"
series:
  - { name: "Winding Way", data: [2.4, 2.5, 2.6, 2.6, 2.7] }
  - { name: "Lead the Stampede", data: [3.0, 3.1, 3.2, 3.3, 3.4] }
---
::

Due osservazioni: ogni creatura aggiuntiva nel mazzo vale circa **0.07–0.10 creature in più** per utilizzo di queste stregonerie. Non sembra molto, ma moltiplicato per il numero di partite e di utilizzi per partita, la differenza diventa percettibile. Inoltre, il **gap tra le due carte resta costante** a circa 0.6 creature, indipendentemente dalla densità. Il vantaggio di [[Lead the Stampede]] non si erode e non si amplifica: è strutturale nel design della carta.

## Una curiosità sull'informazione asimmetrica

C'è un dettaglio che i giocatori più attenti coglieranno: le probabilità cambiano a seconda di quante informazioni si hanno sulla composizione della mano.

Chi risolve la carta sa esattamente quante creature ha in mano, e può fare una stima più precisa di quante ne restano nel grimorio. L'avversario, invece, conosce solo le carte visibili in gioco e al cimitero.

La differenza numerica è piccola (nell'ordine di un punto percentuale) ma è matematicamente reale. Per chi gioca Elfi o Spia e si chiede se "valga la pena" giocare la carta in un determinato turno, la conoscenza della propria mano è un vantaggio concreto nel lungo periodo: non un dettaglio filosofico, ma un fattore che la distribuzione ipergeometrica cattura con precisione.

## Conclusione: cosa compra il mana extra

Riassumendo, quel terzo mana compra tre cose:

1. **Più creature in media** - 3.2 invece di 2.6, un aumento proporzionale di 25%.
2. **Una redistribuzione della probabilità verso l'alto** - i risultati "forti" (≥ 4 creature) passano da 16% a 41%, più del doppio.
3. **Meno varianza** - il rischio di risultati deludenti (0 o 1 creature) si dimezza: da 12% a 4.7%.

Nove volte su dieci, [[Winding Way]] restituisce almeno due creature. È una carta solida, e il mana risparmiato conta. Ma la domanda vera non è quante creature trovi in media, è quante ne trovi quando ne hai davvero bisogno. Ed è lì che la distribuzione di [[Lead the Stampede]] racconta una storia diversa.

---

::video-preview
---
url: https://www.youtube.com/watch?v=baPNEhrOsXs
---
::

::paper-preview
---
url: https://zenodo.org/records/18721634
---
::