---
title: "Component Testing"
subtitle: "Learning by doing"
description: "Prova dei componenti all'interno di un articolo."
author: "Emanuele Nardi"
date: 2025-09-25
updatedAt: 2025-09-25
draft: true
tags: ["commander", "standard", "pauper"]
hero: {
  image: "/assets/articles/art/Tezzeret-Chris-Rahn.webp",
  alt: "Top 4 carte Pauper di Edge of Eternities",
  caption: "Top 4 carte Pauper di Edge of Eternities"
}
---

# {{ $doc.title }}

{{ $doc.description }}
<!-- {{ $doc.tags.map(tag => `#${tag}`).join(' ') }} -->
<!-- {{ $doc.tags }} -->

## Test dei componenti

Qui vado a fare un esempio di utilizzo del componente "magic-cards" all'interno di un articolo.

```markdown
::magic-cards
Agate Instigator (BLC) 21
Impact Tremors (FDN) 717
Molten Gatekeeper (MH3) 128
General Kreat, the Boltbringer (J25) 48
Purphoros, God of the Forge (CMM) 246
Weftstalker Ardent (EOE) 169
::
```
::magic-cards
Agate Instigator (BLC) 21
Impact Tremors (FDN) 717
Molten Gatekeeper (MH3) 128
General Kreat, the Boltbringer (J25) 48
Purphoros, God of the Forge (CMM) 246
Weftstalker Ardent (EOE) 169
::

Posso evitare di specificare l'espansione e il numero della carta quando l'illustrazione è univoca.
Nota come per "Purphoros, God of the Forge" ci sono due versioni diverse dell'illustrazione.
In questo caso abbiamo specificato l'espansione (`fca`) per evitare ambiguità.
```markdown
::magic-cards
Agate Instigator
Impact Tremors (FDN) 717
Molten Gatekeeper
General Kreat, the Boltbringer
Purphoros, God of the Forge (fca)
Weftstalker Ardent
::
```
::magic-cards
Agate Instigator
Impact Tremors (FDN) 717
Molten Gatekeeper
General Kreat, the Boltbringer
Purphoros, God of the Forge (fca)
Weftstalker Ardent
::

Il componente è dinamico e supporta un qualsiasi numero di carte.
Anche se è consigliabile che il numero di carte non sia eccessivo, fra 1 e 7 carte è un numero ragionevole.
Le illustrazioni delle carte sono prese da Scryfall.
::magic-cards
Shocking Sharpshooter
Witty Roastmaster
Warleader's Call
::

::magic-cards
Shocking Sharpshooter
Witty Roastmaster
::

::magic-cards
Warleader's Call
::

# Test del link delle carte

Sto descrivendo una carta [[General Kreat, the Boltbringer]] e mi riferisco a [[Purphoros, God of the Forge]]

# Basic usage of the Swiper component

::test-swiper-basic-usage
::
<!-- 
::test-swiper-advanced-usage
:: -->

## Reverse engineering on a Nuxt Component

original markdown on the magic.wizards.com blog
```html
<magic-cards config="fan" as="div" collection="" overall-arch="20.5" max-card-size="" force-swiper-on-mobile="" mobile-breakpoint="768" data-v-app="" style="--43a19d5c: 185.5;">
    <div class="_wrap_jih3n_1" data-magic-cards-v="3.1.3" data-cards-length="0">
        <!---->
        <div>
            <magic-card face="https://media.wizards.com/2024/dft/jX9KWo03DWpL/en_269991e62b.png" caption="" as="div" width="auto" data-v-app=""></magic-card>
            <magic-card face="https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=208273&amp;type=card" caption="" as="div" width="auto" data-v-app=""></magic-card>
            <magic-card face="https://media.wizards.com/2025/tdm/en_6021f86e4f.webp" caption="" as="div" width="auto" data-v-app=""></magic-card>
            <magic-card face="https://media.wizards.com/2023/cmm/en_50f86461c6.png" caption="" as="div" width="auto" data-v-app=""></magic-card>
            <magic-card face="https://media.wizards.com/2023/cmm/en_718e76e3f4.png" caption="" as="div" width="auto" data-v-app=""></magic-card>
        </div>
        <div class="_swiperBoundary_jih3n_18 _visible_jih3n_14 _swiperBoundaryBeginning_jih3n_143">
            <swiper-container slides-per-view="auto" space-between="12" centered-slides="false">
                <template shadowrootmode="open">
                    <div class="swiper swiper-initialized swiper-horizontal swiper-backface-hidden" part="container">
                        <slot name="container-start"></slot>
                        <div class="swiper-wrapper" part="wrapper" id="swiper-wrapper-c1059fbd859541ba2" aria-live="polite">
                            <slot></slot>
                        </div>
                        <slot name="container-end"></slot>
                        <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
                    </div>
                </template>
            </swiper-container>
        </div>
        <div class="_container_jih3n_6">
        </div>
        <!---->
    </div>
</magic-cards>
```

in production html

```html
<magic-cards config=fan as=div collection overall-arch="20.5" max-card-size force-swiper-on-mobile mobile-breakpoint="768" data-v-app style="--43a19d5c: 265;">
    <div class="_wrap_jih3n_1" data-magic-cards-v="3.1.3" data-cards-length=5>
        <div class="_swiperBoundary_jih3n_18 _swiperBoundaryBeginning_jih3n_143">
            <swipe-container slides-per-view="auto" space-betweem="12" centered-slides=false></swipe-container>
        </div>
        <div>
        </div>
    </div>
</magic-cards>
```