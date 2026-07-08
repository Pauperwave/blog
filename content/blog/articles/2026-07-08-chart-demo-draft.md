---
title: Chart Demo Draft
author: Alessandro Moretti
category: article
date: 2026-07-08
description: Draft page for manually verifying the new chart components (bar, line, confidence-band, pie).
location: ""
published: false
tags:
  - Meta
thumbnail: /arts/cmm-81-counterspell.jpg
---

Temporary draft to verify the 4 chart components render correctly in light/dark mode and on narrow viewports. Delete this file after verification.

## Bar chart — vertical

::bar-chart
---
title: Meta Breakdown - Copie Giocate
description: Numero di copie della carta per archetipo, torneo Paupergeddon
seriesName: Copie
data:
  - { name: Jund Wildfire, value: 11 }
  - { name: Monored Madness, value: 11 }
  - { name: Spy Combo, value: 8 }
  - { name: Grixis Affinity, value: 7 }
  - { name: Monoblu Terror, value: 6 }
  - { name: UB Terror, value: 6 }
---
::

## Bar chart — horizontal

::bar-chart
---
title: Meta Breakdown - Orizzontale
seriesName: Copie
horizontal: true
data:
  - { name: Jund Wildfire, value: 11 }
  - { name: Monored Madness, value: 11 }
  - { name: Spy Combo, value: 8 }
  - { name: Grixis Affinity, value: 7 }
  - { name: Monoblu Terror con nome molto lungo, value: 6 }
  - { name: UB Terror, value: 6 }
---
::

## Line chart — stacked

::line-chart
---
title: Andamento Meta nel Tempo
description: Percentuale di metagame share per archetipo negli ultimi 6 mesi
categories: [Gen, Feb, Mar, Apr, Mag, Giu]
stacked: true
yAxisName: "% Meta Share"
series:
  - { name: Jund Wildfire, data: [12, 14, 13, 15, 16, 18] }
  - { name: Monoblu Terror, data: [8, 9, 10, 9, 8, 7] }
  - { name: RDW, data: [5, 6, 6, 7, 6, 5] }
---
::

## Line chart — plain (not stacked)

::line-chart
---
title: Confronto Diretto
categories: [Gen, Feb, Mar, Apr, Mag, Giu]
stacked: false
series:
  - { name: Jund Wildfire, data: [12, 14, 13, 15, 16, 18] }
  - { name: Monoblu Terror, data: [8, 9, 10, 9, 8, 7] }
---
::

## Confidence band

::confidence-band-chart
---
title: Win Rate Previsto - Mono Blue Control
description: Intervallo di confidenza al 95% sul win rate stimato nei prossimi round
seriesName: Win Rate
bandLabel: "Intervallo di Confidenza (95%)"
yAxisName: "Win Rate %"
data:
  - { x: "Round 1", value: 55, lower: 48, upper: 62 }
  - { x: "Round 2", value: 57, lower: 51, upper: 63 }
  - { x: "Round 3", value: 54, lower: 46, upper: 61 }
  - { x: "Round 4", value: 58, lower: 52, upper: 65 }
  - { x: "Round 5", value: 60, lower: 53, upper: 67 }
---
::

## Pie chart (regression check)

::pie-chart
---
title: Meta Breakdown
description: Distribution of deck types in the tournament
data:
  - { value: 11, name: Jund Wildfire }
  - { value: 11, name: Monored Madness }
  - { value: 8, name: Spy Combo }
  - { value: 7, name: Grixis Affinity }
---
::
