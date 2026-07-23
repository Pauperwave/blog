# Author System - Feature Status & Improvements

## ✅ Completed Features

- [x] Dynamic author pages at `/authors/[slug]`
- [x] Author bio, avatar, and social links display
- [x] Article counter by category (clickable cards)
- [x] Recent articles list (limited to 4)
- [x] Author cards with hover effects showing social links
- [x] "Vedi profilo" link to author pages
- [x] Author slug helpers for consistent URL generation
- [x] SEO meta tags for author pages
- [x] **Authors index page** (`/authors`) — grid with search, sort by articles/recent/name, per-author stats and category breakdown. `app/pages/authors/index.vue`
- [x] **Author filter on `/articles`** — URL-synced (`?author=slug`), combinable with category/location/tag/deck filters. `app/composables/useArticlesFilters.ts`
- [x] **"View all articles" from author page** — button linking to `/articles?author=slug` (the "Option A" approach from the original proposal). `app/pages/authors/[slug].vue`
- [x] **Co-author support** — `author` frontmatter already accepts `string | string[]` in the schema (`content.config.ts`), normalized everywhere via `normalizeAuthors()` and rendered as a list of authors throughout (page header, authors section, filters). No migration needed — this was a non-issue by the time it was checked.
- [x] **Author search** — real-time filter input on the `/authors` index page.

---

## 🚀 Not Implemented — Backlog

### 1. Article Search Bar

**Description**: Free-text search across article titles, descriptions, tags — distinct from the existing exact-match filters (category/author/location/tag/deck), which don't do text search.

**Where to Add**: `/articles` page, above the existing filters.

**Search Implementation Options**:

**Option A: Simple Client-Side Filter** — filter articles array with `.includes()`/regex. Fast for small datasets (<1000 articles), no dependencies.

**Option B: Fuzzy Search (Fuse.js)** — typo-tolerant, relevance scoring, weighted fields. ~50KB.

**Option C: Full-Text Search (Server-Side)** — Nuxt Content's built-in search, searches article body content too. Better for 1000+ articles.

**Recommended**: Start with Option A, upgrade to Option B if needed.

**UI/UX Considerations**:
- Placeholder: "Cerca articoli per titolo, tag, o autore..."
- Debounce 300ms, sync with URL (`?search=...`), keyboard shortcut `/` to focus
- "Nessun articolo trovato per '[query]'" empty state

---

### 2. Author Activity Timeline

**Description**: Visualize an author's publishing activity over time (bar/line chart, most active period, longest streak).

**Libraries**: The project already uses `nuxt-echarts`/`vue-echarts` for the home page pie chart (`app/components/charts/PieChart.vue`) — reuse that instead of adding a new charting library.

**Implementation**: Group `authorArticles` (already computed in `authors/index.vue` and `[slug].vue`) by month/year, render as a bar chart below the author's stats.

---

### 3. Related Authors Feature

**Description**: Suggest similar authors based on category/tag overlap ("Altri autori che potrebbero interessarti").

**Logic**: Score other authors by overlapping categories/tags with the current author, show top 3-5 with avatar, name, top category, article count.

Note: this is distinct from the already-existing `Article-RelatedArticles` component, which suggests related *articles*, not related *authors*.

---

### 4. Author Badges/Achievements

**Description**: Gamification badges (Top Contributor, Tutorial Master, Consistent Writer, etc.) on author cards/pages.

Note: `app/utils/article-badges.ts` already has a `getRecentArticleBadge()` helper, but it only flags articles published in the last 7 days ("Nuovo") — unrelated to this proposal's author-level achievement system.

---

### 5. RSS Feed per Author

**Description**: `/authors/[slug]/rss.xml` feed of an author's articles, linked from their page.

---

### 6. Author Page Customization
- Featured article selection, personal intro/welcome message, external portfolio link.

### 7. Author Statistics Dashboard
- Views/reads per article, most popular articles, tag cloud, engagement metrics. Would need an analytics source (see below) before this is possible.

### 8. Author Following System
- "Follow" authors, email notifications for new articles, subscriber count.

### 9. Author Collaboration Network
- Visualize co-authorship connections now that multi-author articles are supported at the data level.

### 10. Multi-language Author Bios
- Italian/English bio toggle, i18n integration.

---

## 📊 Analytics

**Current state**: the project already ships `@vercel/analytics` (`package.json`). A dedicated event-tracking platform (PostHog or similar) would still be additive if per-feature usage data (search queries, filter usage, author page views) is needed for #7 above — but it's a separate, bigger integration than what Vercel Analytics provides out of the box. Evaluate only if the Statistics Dashboard (#7) is actually prioritized.

---

## 🛠️ Technical Considerations

### Performance
- Cache author stats (article counts, etc.) if the author/article count grows large enough to matter
- Consider indexed/server-side search if the Article Search Bar moves past Option A

### SEO
- Proper meta tags for author pages ✅ (already done)
- Schema.org Person markup, canonical URLs — check current coverage before assuming these are missing

### Accessibility
- Keyboard navigation for filters, ARIA labels, keyboard shortcut for search (`/`)

### Mobile Experience
- Responsive author grid, touch-friendly filters — largely covered already by the existing `/authors` and `/articles` implementations; verify on new features rather than assuming from scratch

---

## 📝 Notes

- Existing infrastructure (`normalizeAuthors`, `useArticlesFilters`, the authors collection schema) already supports most of what's left on this list — the remaining items are additive UI/features, not architecture changes.

---

**Last reviewed**: 2026-07-08
**Status**: Backlog (most "high priority" items from the original proposal shipped; remaining items are nice-to-have)
