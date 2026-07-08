---
title: ""
author: Alessandro Moretti
category: article
date:
description: Reference page for manually testing all chart components (bar, line, confidence-band, pie, scatter, radar) in light/dark mode and on narrow viewports.
location: ""
published: false
tags:
  - Meta
thumbnail: /arts/cmm-81-counterspell.jpg
---

Template/reference page for the chart components — not meant to be published. Keep in sync with the shortcode examples in `docs/CONTENT.md` and `content/docs/componenti.md` when adding or changing a chart component.

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

## Scatter chart

::scatter-chart
---
title: CMC medio vs Win Rate
xAxisName: CMC medio
yAxisName: Win Rate %
series:
  - name: Aggro
    data: [{ x: 1.8, y: 52 }, { x: 2.1, y: 55 }, { x: 1.5, y: 58 }]
  - name: Control
    data: [{ x: 3.2, y: 51 }, { x: 3.8, y: 49 }, { x: 3.5, y: 53 }]
---
::

## Radar chart

::radar-chart
---
title: Profilo Archetipo
indicators:
  - { name: Aggro, max: 10 }
  - { name: Control, max: 10 }
  - { name: Consistenza, max: 10 }
  - { name: Potenza, max: 10 }
  - { name: Budget, max: 10 }
series:
  - { name: Mono Red Madness, values: [9, 2, 6, 7, 8] }
  - { name: Mono Blue Control, values: [2, 9, 7, 8, 5] }
---
::
