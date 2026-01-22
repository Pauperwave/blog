# Content Management Guide

Guide for managing content in the MTG Pauper blog.

## Table of Contents

- [Content Collections](#content-collections)
- [Frontmatter Reference](#frontmatter-reference)
- [MDC Syntax](#mdc-syntax)
- [Adding New Content](#adding-new-content)
- [Card References](#card-references)
- [Images](#images)
- [SEO Best Practices](#seo-best-practices)

---

## Content Collections

The blog uses **Nuxt Content** with 5 distinct collections, all located in `content/blog/`:

### 1. Articles (`content/blog/articles/`)

General blog posts about Magic: The Gathering Pauper format.

**Topics:**
- Meta analysis
- Card evaluations
- Strategy guides
- Format news

**Example:** `2026-01-15-pyroblast-hydroblast-meta-decline.md`

---

### 2. Tutorials (`content/blog/tutorials/`)

Step-by-step how-to guides for learning Pauper.

**Topics:**
- Deck building guides
- Archetype primers
- Gameplay tutorials
- Sideboarding guides

**Example:** `2025-12-06-tutorial-pingers.md`

---

### 3. Decklists (`content/blog/decklists/`)

Competitive deck lists with card breakdowns.

**Topics:**
- Tournament-winning lists
- Archetype decklists
- Budget alternatives
- Deck techs

**Example:** `2026-01-14-thesideralwolf-2.md`

---

### 4. Reports (`content/blog/reports/`)

Tournament reports and event coverage.

**Topics:**
- Tournament results
- Event recaps
- Match reports
- Meta snapshots

**Example:** `2025-12-09-paupergeddon-lucca-winter-2025.md`

---

### 5. Spoilers (`content/blog/spoilers/`)

Set previews and spoiler analysis for new releases.

**Topics:**
- New card evaluations
- Set reviews
- Pauper impact analysis
- Downshift announcements

**Example:** `2026-01-17-lorwyn-eclipsed.md`

---

## Frontmatter Reference

Every content file must include frontmatter metadata at the top.

### Required Fields

```yaml
---
title: string              # Article title (SEO important)
description: string        # Short summary (150-160 chars recommended)
date: YYYY-MM-DD          # Publication date (ISO format)
tags: string[]            # List of tags for categorization
author: string            # Author's name
author_avatar: string     # Path to author image
author_description: string # Author bio (one sentence)
thumbnail: string         # Hero image path
published: true           # false = hidden (default), true = public
---
```

### Example Frontmatter

```yaml
---
title: "Pyroblast e Hydroblast: La Combo Vincente che Sta Cambiando il Meta Pauper"
description: "Un'analisi approfondita su come Pyroblast e Hydroblast stanno rivoluzionando il meta Pauper, con strategie avanzate e consigli per il sideboard."
date: 2026-01-15
tags:
  - pauper
  - meta
  - sideboard
  - blu
  - rosso
author: "Alessandro Moretti"
author_avatar: "/assets/authors/alessandro.jpg"
author_description: "Giocatore competitivo di Pauper e content creator"
thumbnail: "/assets/articles/pyroblast-hydroblast.jpg"
published: true
---
```

### Field Guidelines

#### `title`
- **Length:** 40-70 characters (optimal for SEO)
- **Format:** Use title case
- **Language:** Italian (primary audience)
- **Keywords:** Include primary keyword for SEO

**✅ Good:**
```yaml
title: "Mono Blue Control: Guida Completa al Mazzo Tier 1"
```

**❌ Bad:**
```yaml
title: "mazzo blu"  # Too short, no context
```

---

#### `description`
- **Length:** 150-160 characters (Google displays ~155 chars)
- **Purpose:** SEO meta description and article preview
- **Format:** Complete sentence(s)
- **Include:** Main topic and value proposition

**✅ Good:**
```yaml
description: "Scopri come costruire e giocare Mono Blue Control nel meta Pauper attuale, con sideboard, matchup guide e consigli pro."
```

**❌ Bad:**
```yaml
description: "Un mazzo blu"  # Too vague
```

---

#### `date`
- **Format:** `YYYY-MM-DD` (ISO 8601)
- **Required:** Yes (used for sorting and "New" badges)
- **Timezone:** Dates are in local time (Italy)

```yaml
date: 2026-01-17  # ✅ Correct
date: 17/01/2026  # ❌ Wrong format
date: 2026-1-17   # ❌ Missing leading zeros
```

---

#### `tags`
- **Format:** Array of lowercase strings
- **Count:** 3-8 tags recommended
- **Purpose:** Related articles, categorization, filtering

**Common Tags:**
```yaml
# Colors
- mono-white
- mono-blue
- mono-black
- mono-red
- mono-green
- azorius (white-blue)
- dimir (blue-black)
- rakdos (black-red)
- gruul (red-green)
- selesnya (green-white)
- orzhov (white-black)
- izzet (blue-red)
- golgari (black-green)
- simic (green-blue)
- boros (white-red)
- jund (black-red-green)
- temur (green-blue-red)
- esper (white-blue-black)
- grixis (blue-black-red)

# Archetypes
- aggro
- control
- combo
- midrange
- tempo

# Topics
- meta
- sideboard
- budget
- beginner
- advanced
- tournament
- deck-tech

# Card Types
- creature
- removal
- cantrip
- counterspell
```

**✅ Good:**
```yaml
tags:
  - meta
  - mono-blue
  - control
```

**❌ Bad:**
```yaml
tags:
  - monoblu          # Use english: "mono-blue"
  - "meta analysis"  # No spaces, use "meta" + "analisi"
```

---

#### `author` & `author_avatar` & `author_description`

Currently single author, but structured for future multi-author support.

```yaml
author: "Alessandro Moretti"
author_avatar: "/assets/authors/alessandro.jpg"
author_description: "Giocatore competitivo di Pauper dal 2019"
```

**Avatar requirements:**
- Format: JPG or PNG
- Size: 200x200px minimum
- Aspect ratio: 1:1 (square)
- Location: `public/assets/authors/`

---

#### `thumbnail`

Hero image displayed at top of article and in previews.

```yaml
thumbnail: "/arts/counterspell.jpg"
# Or use other aliases: /sets/, /events/, /articles/, /blog/
```

**Image requirements:**
- Format: JPG or PNG
- Dimensions: 1200x630px (Facebook/OG image ratio)
- Aspect ratio: 1.91:1 (16:9 is acceptable)
- File size: < 200KB
- Location: `public/assets/blog/[subdirectory]/`

**Path Aliases:**

The project uses `@nuxt/image` with pre-configured aliases for cleaner paths:

| Alias | Resolves To | Use For |
|-------|-------------|---------|
| `/arts/*` | `/assets/blog/arts/*` | Card artwork and general art |
| `/sets/*` | `/assets/blog/sets/*` | Magic set images |
| `/events/*` | `/assets/blog/events/*` | Event banners and photos |
| `/articles/*` | `/assets/blog/articles/*` | Article-specific images |
| `/blog/*` | `/assets/blog/*` | Any blog asset |

**Examples:**
```yaml
# Card artwork
thumbnail: /arts/counterspell.jpg

# Set image
thumbnail: /sets/lorwyn-eclipsed.jpg

# Event banner
thumbnail: /events/paupergeddon-lucca-2025.jpg

# Article-specific image
thumbnail: /articles/meta-analysis.jpg
```

**Naming convention:**
```
# Use descriptive names with card set codes when possible
cmm-81-counterspell.jpg
inr-174-thermo-alchemist.jpeg

# Or descriptive names for original content
paupergeddon-lucca-2025-hero.jpg
meta-analysis-diagram.jpg
```

---

#### `published`

Controls article visibility.

```yaml
published: true  # Hidden from production, visible in dev (default)
published: true   # Published and visible
```

**Usage:**
- Set `published: true` while writing (there is no necessity to commit unfinished articles)
- Change to `published: true` when ready to publish
- Not published articles are filtered in production builds

---

## MDC Syntax

Nuxt Content uses **MDC** (Markdown Components), an enhanced Markdown syntax.

### Basic Markdown

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

[Link text](https://example.com)

![Alt text](/path/to/image.jpg)

- Unordered list item
- Another item

1. Ordered list item
2. Another item

> Blockquote
```

### Code Blocks

````markdown
```typescript
const greeting = 'Hello World'
console.log(greeting)
```
````

**Supported languages:** `typescript`, `javascript`, `vue`, `bash`, `json`, `yaml`, `css`, `html`

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Alerts/Callouts

```markdown
::alert{type="info"}
Questa è un'informazione importante per i lettori.
::

::alert{type="warning"}
Attenzione: questo deck richiede esperienza avanzata.
::

::alert{type="success"}
Questo mazzo ha vinto il torneo!
::
```

### Vue Components in MDC

You can use Vue components directly in Markdown:

```markdown
<!-- Card component (if implemented) -->
:magic-card-display{name="Counterspell"}

::MagicCardDisplay
---
card: Counterspell (sld)
---
::

<!-- TODO da testare -->
<!-- Image with caption -->
:image-caption{src="/assets/deck.jpg" caption="Mono Blue Control decklist"}
```

---

## Adding New Content

### Step-by-Step Guide

#### 1. Choose Collection

Determine which collection your content belongs to:
- General discussion → `articles/`
- How-to guide → `tutorials/`
- Top X Deck lists → `decklists/`
- Tournament coverage → `reports/`
- New set analysis → `spoilers/`

#### 2. Create File

**Naming convention:** `YYYY-MM-DD-slug.md`

```bash
# Example
content/blog/tutorial/2026-01-17-mono-blue-control-guide.md
```

**Rules:**
- Use kebab-case for slug
- Include date prefix
- Keep slug short but descriptive
- Use English slug even if content is Italian (for URL consistency)

#### 3. Add Frontmatter

Copy template from [Frontmatter Reference](#frontmatter-reference) and fill in all required fields.

#### 4. Write Content

- Use MDC syntax (see [MDC Syntax](#mdc-syntax))
- Structure with clear headings
- Add images where appropriate
- Include code examples if relevant

#### 5. Add Images

Place images in `public/assets/articles/`:

```bash
public/assets/articles/
├── mono-blue-control-hero.jpg      # Thumbnail
├── mono-blue-control-diagram.jpg   # In-article image
└── ...
```

Reference in content:
```markdown
![Mono Blue Control diagram](/assets/articles/mono-blue-control-diagram.jpg)
```

#### 6. Preview

```bash
bun dev
# Navigate to http://localhost:3000/articles/2026-01-17-mono-blue-control-guide
```

#### 7. Set Published Status

```yaml
# While writing
published: true

# When ready to publish
published: false
```

---

## Card References

### Inline Card Mentions

When mentioning cards in text:

```markdown
Il mazzo gioca 4 copie di [[Counterspell]] e 2 [[Exclude]] per il controllo.
```

Use double square brackets `[[Card Name]]` to reference cards.
This will render the card image when the user hovers over the card name or touches it on mobile.

### Decklists

Use `MagicDecklist` component for formatted decklists.

````markdown
::MagicDecklist
---
name: "Mono Blue Control"
description: "Decklist vincente di Alessandro Moretti al Paupergeddon Lucca Winter 2025"
player: "Alessandro Moretti"
placement: "1° posto"
---
Creatures
2 Murmuring Mystic
4 Cryptic Serpent
4 Tolarian Terror

Instants
4 Brainstorm
4 Force Spike
4 Mental Note
2 Spell Pierce
4 Thought Scour
4 Counterspell

Sorceries
3 Ponder
2 Sleep of the Dead
2 Deem Inferior
1 Deep Analysis
4 Lórien Revealed

Lands
16 Island

Sideboard
4 Hydroblast
2 Blue Elemental Blast
3 Annul
3 Gut Shot
2 Dispel
1 Steel Sabotage
::
```
````

### Card Database Integration

The project includes a SQLite card database from Scryfall with filtered Pauper-legal cards.

**Usage in server API:**
```typescript
// server/api/cards.get.ts
import { searchCards } from '~/server/utils/card-database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cards = await searchCards(query.name as string)
  return cards
})
```

---

## Images

### Image Configuration

The project uses `@nuxt/image` (v2.0.0) with pre-configured path aliases and presets for optimal performance.

### Path Aliases

Use these shorter paths instead of full paths:

| Alias | Resolves To | Use For |
|-------|-------------|---------|
| `/arts/*` | `/assets/blog/arts/*` | Card artwork and general art |
| `/sets/*` | `/assets/blog/sets/*` | Magic set images |
| `/events/*` | `/assets/blog/events/*` | Event banners and photos |
| `/articles/*` | `/assets/blog/articles/*` | Article-specific images |
| `/blog/*` | `/assets/blog/*` | Any blog asset |

**Benefits:**
- ✅ Shorter, cleaner paths
- ✅ Easy to refactor and maintain
- ✅ Consistent across the project
- ✅ Automatic image optimization

### Image Presets

Pre-configured optimization settings for different use cases:

**`thumbnail` Preset** - For hero images and OG images:
- Size: 1200×630px
- Format: WebP (automatic conversion)
- Quality: 80%
- Fit: Cover

**`card` Preset** - For article listing cards:
- Size: 600×315px
- Format: WebP (automatic conversion)
- Quality: 75%
- Fit: Cover

### Image Locations

```
public/
├── assets/
│   ├── blog/           # Blog assets (use aliases to reference)
│   │   ├── articles/   # Article-specific images
│   │   ├── arts/       # Card artwork and general art
│   │   ├── events/     # Event banners and photos
│   │   └── sets/       # Magic set images
│   └── avatars/        # Author avatars (no alias needed)
```

### Using Images in Frontmatter

```yaml
---
title: "Article Title"
thumbnail: /arts/counterspell.jpg  # ✅ Use alias path
# NOT: /assets/blog/arts/counterspell.jpg  # ❌ Don't use full path
---
```

**More examples:**
```yaml
# Card artwork
thumbnail: /arts/cmm-81-counterspell.jpg

# Set image
thumbnail: /sets/lorwyn-eclipsed.jpg

# Event banner
thumbnail: /events/paupergeddon-lucca-2025.jpg

# Article-specific image
thumbnail: /articles/meta-analysis.jpg
```

### Using Images in Content

#### Standard Markdown Images

```markdown
![Alt text describing the image](/arts/counterspell.jpg)
```

#### NuxtImg Component (Recommended)

For better performance, use the `NuxtImg` component with presets:

**Basic Usage:**
```vue
<NuxtImg 
  src="/arts/counterspell.jpg" 
  alt="Counterspell artwork"
  loading="lazy"
/>
```

**With Thumbnail Preset (Recommended for hero images):**
```vue
<NuxtImg 
  src="/arts/counterspell.jpg"
  preset="thumbnail"
  alt="Counterspell artwork"
  loading="lazy"
/>
```

**With Card Preset (For listing previews):**
```vue
<NuxtImg 
  src="/arts/counterspell.jpg"
  preset="card"
  alt="Counterspell artwork"
  loading="lazy"
/>
```

**With Custom Modifiers:**
```vue
<NuxtImg 
  src="/arts/counterspell.jpg"
  alt="Counterspell artwork"
  width="800"
  height="450"
  format="webp"
  quality="85"
  fit="cover"
  loading="lazy"
/>
```

**Using MDC Syntax in Markdown:**
```markdown
::NuxtImg
---
src: /arts/counterspell.jpg
alt: Counterspell card artwork
preset: thumbnail
loading: lazy
---
::
```

**Benefits:**
- ✅ Automatic WebP conversion
- ✅ Responsive image sizing
- ✅ Lazy loading support
- ✅ Optimized for Core Web Vitals
- ✅ On-demand image processing
- ✅ Automatic caching

---

### OG Images (Social Media Previews)

The project uses **static thumbnails** for Open Graph images (social media previews).

#### How It Works

When you share an article on social media (Twitter, Facebook, LinkedIn), the thumbnail image from your frontmatter appears as the preview image.

**Architecture:**
1. Your `thumbnail` field in frontmatter becomes the OG image
2. `useSeoMeta()` automatically sets `og:image` meta tags
3. No dynamic generation needed - fast and reliable
4. Works perfectly with static site generation (`nuxt generate`)

#### Requirements for OG Images

**Dimensions:**
- Recommended: 1200×630px (1.91:1 aspect ratio)
- Minimum: 600×315px
- Maximum: 8MB file size

**Format:**
- JPG or PNG (both work)
- Optimized/compressed before upload
- Use descriptive filenames

**Path:**
- Must use image aliases (e.g., `/arts/counterspell.jpg`)
- File must exist in `public/assets/blog/[subdirectory]/`

#### Example Social Share Appearance

When someone shares your article:

```
┌──────────────────────────────────┐
│  [Card Artwork - Full Width]      │
│                                   │
│  Pyroblast e Hydroblast:          │
│  La Combo Vincente...             │
│                                   │
│  pauper.it                        │
└──────────────────────────────────┘
```

#### Testing OG Images

Before publishing, verify your OG images render correctly:

**Tools:**
- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
- **OpenGraph.xyz:** https://www.opengraph.xyz/

**Testing Process:**
1. Deploy your changes to Vercel (or preview URL)
2. Copy the full article URL
3. Paste into one of the tools above
4. Verify:
   - Image loads correctly
   - Dimensions are correct (1200×630px)
   - Title and description appear
   - No errors or warnings

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Image not showing | Verify thumbnail path uses alias (e.g., `/arts/image.jpg`) |
| Wrong image displays | Clear social media cache using debugger tools |
| Image too small | Ensure thumbnail is at least 600×315px |
| Broken image | Check that file exists in `public/assets/blog/` |

#### Frontmatter Example

```yaml
---
title: "Pyroblast e Hydroblast: La Combo Vincente"
description: "Un'analisi approfondita su come Pyroblast e Hydroblast stanno rivoluzionando il meta Pauper."
thumbnail: /arts/cmm-81-counterspell.jpg  # ← This becomes the OG image
date: 2026-01-15
tags: [pauper, meta, sideboard]
---
```

**Generated HTML meta tags:**
```html
<meta property="og:image" content="/arts/cmm-81-counterspell.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="/arts/cmm-81-counterspell.jpg">
```

#### Why Static Thumbnails?

The project uses static thumbnails instead of dynamically generated OG images because:

✅ **Simple & Reliable** - No complex image generation at build time  
✅ **Fast Builds** - No SSR required, works with `nuxt generate`  
✅ **Great Visual Appeal** - Card artwork is eye-catching on social media  
✅ **Optimal Dimensions** - Thumbnails already follow 1200×630px guidelines  
✅ **Easy to Test** - Standard image files, easy to verify  
✅ **Vercel-Friendly** - Perfect for static site deployment  

#### Alternative: Branded OG Images (Not Currently Used)

If you need branded OG images with custom layouts (logo, title overlay, author info):

1. Enable OG Image module in `nuxt.config.ts`:
   ```typescript
   ogImage: {
       enabled: true,
       // Add prerendering config
   }
   ```

2. Uncomment `defineOgImageComponent()` in `app/pages/articles/[id].vue`

3. The template is available at `app/components/og_image/article.vue`

**Trade-offs:**
- ⚠️ Requires SSR or build-time prerendering
- ⚠️ Slower builds (generates images for each article)
- ⚠️ More complex configuration
- ✅ Custom branding and consistent design
- ✅ Can include logo, author info, formatted titles

### Image Guidelines

**File formats:**
- **Photos:** JPG or PNG (better compression for photos)
- **Logos/Icons:** SVG or PNG (better compression for photos)
- **Screenshots:** JPG or PNG (better compression for photos)

**Optimization:**
- Compress images before upload (TinyPNG)
- Use appropriate dimensions (don't upload 4K images)
- Add descriptive alt text for SEO/accessibility

**Naming:**
- Use kebab-case: `mono-blue-deck-photo.jpg`
- Be descriptive: `counterspell-art.jpg` not `image1.jpg` or `pic.png`

---

## SEO Best Practices

### Meta Tags

Frontmatter automatically generates SEO meta tags:

```html
<!-- Generated from frontmatter -->
<title>Article Title | MTG Pauper</title>
<meta name="description" content="Article description...">
<meta property="og:title" content="Article Title">
<meta property="og:image" content="/assets/articles/thumbnail.jpg">
```

### URL Structure

Clean, descriptive URLs are generated from file names:

```
✅ Good:
/articles/2026-01-17-mono-blue-control-guide

❌ Bad:
/articles/article1
/articles/2026-01-17-a
```

### Internal Linking

Link to related articles when relevant:

```markdown
Per approfondire il sideboard, leggi la nostra [guida al sideboard](/articles/sideboard-guide).
```

### Heading Structure

Use proper heading hierarchy:

```markdown
# Title (H1) - Only once (in frontmatter)
## Section (H2)
### Subsection (H3)
#### Sub-subsection (H4)
```

### Content Length

**Recommended lengths:**
- Articles: 800-2000 words
- Tutorials: 1000-3000 words
- Reports: 500-1500 words
- Spoilers: 600-1500 words

---

## Content Checklist

Before publishing, verify:

- [ ] All frontmatter fields filled correctly
- [ ] `published: true` for publication
- [ ] Date is correct (`YYYY-MM-DD` format)
- [ ] 3-8 relevant tags added
- [ ] Description is 150-160 characters
- [ ] Thumbnail image exists and is optimized
- [ ] All images have alt text
- [ ] Card names are in double brackets `[[Card Name]]`
- [ ] Content is properly structured with headings
- [ ] No broken links
- [ ] Spell-checked (Italian content)
- [ ] Preview looks good in dev server

---

<!-- ## Examples

### Complete Article Example

```markdown
---
title: "Mono Blue Control: La Guida Definitiva al Mazzo Tier 1"
description: "Impara a giocare Mono Blue Control nel meta Pauper attuale: decklist, sideboard, matchup e strategie avanzate per dominare il formato."
date: 2026-01-17
tags: [mono-blue, control, strategy]
author: "Alessandro Moretti"
author_avatar: "/assets/authors/alessandro.jpg"
author_description: "Giocatore competitivo di Pauper dal 2019"
thumbnail: "/assets/articles/mono-blue-control-hero.jpg"
published: true
---

# Introduzione

Mono Blue Control è uno dei mazzi più iconici del formato Pauper...

## La Decklist

``` -->

---

## Support

For questions about content management:
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for technical details
- Review existing articles for examples
- Test in dev server before publishing
