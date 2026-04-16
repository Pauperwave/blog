# Refactor

Refactor the following Nuxt page `app/pages/articles/[id].vue` by extracting logic and UI into dedicated composables and components.

Follow these rules strictly:
- The project uses Nuxt 4 with auto-imports: do not add explicit imports for Vue APIs (`ref`, `computed`, etc.), Nuxt composables (`useRoute`, `useAsyncData`, `useState`, etc.) or auto-imported components
- Use `<script setup lang="ts">` in all components
- Keep TypeScript types, do not use any `any` or `unknown` types
- Do not change existing logic, only move it
- The `Author` type is imported from `~/composables/useAuthor`
- The page must remain fully functional after the refactor

## 1. Extract composable: `composables/useArticleData.ts`

Move the following useAsyncData calls out of the page into this composable, which accepts path: string as parameter and returns all the data the page needs:

- The article fetch (currently keyed by `route.path`)
- The authors fetch (currently keyed by `authors-${route.path}`)
- The surround fetch (currently keyed by `${route.path}-surround`)
- The composable must return: `{ data, authorsData, surround }`.

## 2. Extract composable: `composables/useRelatedArticles.ts`

Move the following logic into this composable, which accepts data (the current article) as parameter:

- The relatedArticlesData useAsyncData (keyed by `linked-${route.path}`)
- The relatedAuthorsData useAsyncData (keyed by `related-authors-${route.path}`)
- The `links` computed
- The `globalNormalizedLocationSet` computed
- The `relatedAuthorsMap` computed
- The `getTagFilterLink` function
- The composable must return: `{ links, relatedAuthorsMap, globalNormalizedLocationSet, getTagFilterLink }`.

## 3. Extract component: `components/Article/PageAside.vue`

Extract the `<template #right>` slot content into this component. It receives no props — the TOC links and static anchor links are hardcoded inside. The data (article) must be passed as a prop to conditionally show the TOC.

Props:

```
defineProps<{
  data: { body: { toc?: { links?: any[] } } } | null
}>()
```

## 4. Extract component: `components/Article/PageHeader.vue`

Extract the `<UPageHeader>` and its default slot content into this component.

Props:

```
defineProps<{
  data: { title?: string; description?: string; tags?: string[]; thumbnail?: string; date?: string } | null
  authors: Author[]
  formattedDate: string
}>()

defineEmits<{
  tagClick: [tag: string, to: object]
  authorClick: [author: Author]
}>()
```

The `getTagFilterLink` function result must be passed via the `tagClick` emit. The `navigateTo` call on author click must be emitted via `authorClick`.

## 5. Extract component: `components/Article/AuthorsSection.vue`

Extract the `<template v-if="authorsData && authorsData.length > 0">` block (the AuthorAboutCard list) into this component.

Props:
```
defineProps<{
  authors: Author[]
}>()
```

## 6. Extract component: `components/Article/RelatedArticles.vue`

Extract the related articles section (the `<p>` label, `<UBlogPosts>`, and `<UContentSurround>`) into this component.

Props:

```
import type { AnyArticle } from '~/constants/content-config'

defineProps<{
  links: AnyArticle[]
  relatedAuthorsMap: Record<string, Author[]>
  surround: any
}>()
```

## 7. Final `articles/[id].vue`

After the extractions, the page script should only contain:

- `useArticleData(route.path)` call
- `useRelatedArticles(data)` call
- `formattedDate` useState
- `updateMeta()` function and call

The template should only contain:

- `<UPage>` with `<Article-PageAside>`, `<Article-PageHeader>`, `<UPageBody>` with `<Article-AuthorsSection>`, `<Article-RelatedArticles>`

Keep the `<style>` block unchanged.

## Implementation Notes

### useArticleData
- Made async with synchronous `useAsyncData` registration followed by `Promise.all` await
- This pattern ensures Vue Suspense is activated correctly for SSR hydration
- `fetchArticle` function defined inside composable to access `path` parameter

### useRelatedArticles
- Unified two `useAsyncData` calls into one to fix dependency issues
- Related articles and their authors are fetched together to prevent empty SSR render

### PageHeader
- Uses `getTagFilterLink` as a prop with `:to` for tag navigation instead of `@click` emit
- Type for `getTagFilterLink` is `(tag: string) => { path: string; query: Record<string, string> }` to handle both tag and location query types

### RelatedArticles
- Uses `ContentNavigationItem[] | undefined` type for surround prop
- Surround fetch checks for valid prev/next items before returning

### Authors Handling
- Authors fallback with `?? []` in the page to prevent undefined prop warnings
- Components accept `Author[] | undefined` types

