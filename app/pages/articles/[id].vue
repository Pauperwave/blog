<script lang="ts" setup>
import { intersection, orderBy } from "~/utils/array";
import { 
  type AnyArticle, 
  queryAllCollections, 
  combineArticles, 
  getCollectionNames
} from '~/constants/content-config';

import appMeta from "~/app.meta";

const route = useRoute();
const authorEl = ref<HTMLElement | null>();
const relatedArticlesEl = ref<HTMLElement | null>();

// TODO: Related articles currently show top 5 by tag intersection (line 57).
// Consider filtering to only show articles with at least 1 common tag to reduce noise.
const relatedArticlesString = "Altri articoli correlati"
const getBadge = (date: string) => {
    return Math.abs(new Date().getTime() - new Date(date).getTime()) < 8.64e7 * 7
        ? { label: "New", color: "primary" as const }
        : undefined;
};

// const readingTimeText = computed(() => (data.value?.meta as any).readingTime?.text);
const tocTitle = computed(() => `In questo articolo`);
// const clipboard = useClipboard();
// const toast = useToast();

const { data } = await useAsyncData(route.path, async () => {
    // Try each collection until we find the article
    const collections = getCollectionNames();
    for (const collection of collections) {
        const result = await queryCollection(collection as any).path(route.path).first();
        if (result) return result;
    }
    return null;
});

// Fetch author data from authors collection
const authorData = data.value?.author ? await useAuthor(data.value.author) : null;

// Format date using useState to prevent hydration mismatch
const formattedDate = useState(`article-date-${route.path}`, () => {
  return data.value?.date ? formatDateIT(data.value.date) : 'Data non disponibile';
});

// Format related article dates using useState
// const formatRelatedDate = (article: any) => {
//     const key = `related-date-${article._id || article.path}`;
//     console.log("[article] Formatting related date for key:", key);
//     return useState(key, () => formatDateIT(article.date)).value;
// };

const { data: links } = await useAsyncData(`linked-${route.path}`, async () => {
    const collectionsData = await queryAllCollections();
    
    // Combine all articles and filter
    const allArticles: AnyArticle[] = combineArticles(collectionsData);
    
    // console.log('[DEBUG] Total articles:', allArticles.length);
    // console.log('[DEBUG] Current article path:', data.value?.path);
    // console.log('[DEBUG] Current article tags:', data.value?.tags);
    // console.log('[DEBUG] Published articles count:', allArticles.filter(a => a.published === true).length);
    // console.log('[DEBUG] Sample article:', allArticles[0]);
    
    const filtered = allArticles.filter(a => a.path !== data.value?.path && a.published === true);
    
    // console.log('[DEBUG] Filtered articles count:', filtered.length);
    
    const sorted = orderBy(filtered, (a) => {
        const commonTags = intersection(a.tags, data.value?.tags || []).length;
        // console.log(`[DEBUG] Article ${a.path} has ${commonTags} common tags`);
        return commonTags;
    }, "desc");
    
    return sorted.slice(0, 5);
});

// Fetch author data for related articles
const relatedAuthorsMap = ref<Record<string, any>>({});

if (links.value) {
    const uniqueAuthors = [...new Set(links.value.map(article => article.author))];
    for (const authorName of uniqueAuthors) {
        try {
            const authorInfo = await useAuthor(authorName);
            relatedAuthorsMap.value[authorName] = authorInfo;
        } catch (e) {
            console.error(`Failed to load author data for ${authorName}:`, e);
        }
    }
}
// const { data: surround } = await useAsyncData(`${route.path}-surround`, async () => {
//     // Try to find surroundings in each collection
//     const collections = ["articles", "tutorials", "decklists", "reports", "spoilers"];
//     for (const collection of collections) {
//         try {
//             const result = await queryCollectionItemSurroundings(collection as any, route.path, {
//                 fields: ["description"],
//             });
//             if (result) return result;
//         } catch (e) {
//             // Continue to next collection if not found
//         }
//     }
//     return null;
// });

updateMeta();

function updateMeta() {
    useSchemaOrg([
        defineArticle({
            headline: data.value?.title,
            description: data.value?.description,
            image: data.value?.thumbnail,
            // datePublished: dayjs(data.value?.date, "YYYY-MM-DD").toDate().toString(),
            keywords: data.value?.tags,
            author: {
                name: authorData?.name,
                description: authorData?.description,
                image: authorData?.avatar,
            },
            publisher: definePerson({
                name: appMeta.author.name,
                description: appMeta.author.description,
                image: appMeta.author.image,
                url: appMeta.author.url,
            }),
        }),
    ]);

    useSeoMeta({
        title: data.value?.title,
        description: data.value?.description,
        ogImage: data.value?.thumbnail,
        ogImageWidth: 1200,
        ogImageHeight: 630,
        twitterCard: 'summary_large_image',
        twitterImage: data.value?.thumbnail,
    });

    // Note: defineOgImageComponent is disabled in nuxt.config.ts
    // We use static thumbnails for OG images instead of dynamic generation
    // defineOgImageComponent("Article", {
    //     thumbnail: data.value?.thumbnail,
    //     title: data.value?.title,
    //     author: {
    //         name: authorData?.name,
    //         image: authorData?.avatar,
    //     },
    // });
}

onMounted(() => {
    const contentEl = document.getElementById("content");
    authorEl.value = contentEl?.querySelector("#author-about");
    relatedArticlesEl.value = document.documentElement?.querySelector("#related-articles") as HTMLElement | undefined;
});
</script>

<template>
    <UPage :ui="{ center: 'lg:col-span-7!' }">

        <template #right>
            <UPageAside :ui="{ root: 'lg:col-span-3!' }">
                <UPageAnchors
                    :links="[
                        { label: 'Canale YouTube', icon: 'mdi:youtube', to: 'https://www.youtube.com/@alessandromoretti1177', target: '_blank' },
                        { label: 'Tutti gli articoli', icon: 'material-symbols:article-rounded', to: '/articles' },
                    ]"
                />
                <USeparator type="dotted" />
                <UContentToc
                    v-if="data"
                    :title="tocTitle"
                    :links="data.body.toc?.links" highlight
                />
            </UPageAside>
        </template>

        <UPageHeader
            :title="data?.title"
            :description="data?.description"
            headline="Blog"
        >
            <div class="flex items-end flex-wrap gap-4 justify-between mt-4">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-row gap-2 items-center flex-wrap">
                        <UBadge
                            v-for="tag in data?.tags"
                            key="tag"
                            color="primary"
                            variant="soft"
                        >
                            {{ tag }}
                        </UBadge>
                    </div>
                    <AuthorCard
                        v-if="authorData"
                        :author="{
                            name: authorData.name,
                            description: authorData.description,
                            avatar: authorData.avatar,
                            url: authorData.url
                        }"
                        variant="inline"
                        :clickable="false"
                        @click="() => authorEl?.scrollIntoView()"
                    />
                </div>
                <div class="flex flex-row items-center gap-4">
                    <p class="flex flex-row items-center gap-1 typ-sublabel">
                        <icon name="material-symbols:calendar-today-rounded" class="text-primary" /> {{ formattedDate }}
                    </p>
                    <!-- <p class="flex flex-row items-center gap-1 typ-sublabel"><icon name="material-symbols:alarm-rounded" class="text-primary"></icon> {{ readingTimeText }}</p> -->
                </div>
            </div>
        </UPageHeader>

        <UContentToc
            v-if="data"
            :links="data.body.toc?.links"
            highlight class="lg:hidden"
        />

        <UPageBody>
            <NuxtImg 
                v-if="data?.thumbnail" 
                :src="data.thumbnail" 
                :alt="data.title"
                class="w-full h-auto rounded-lg shadow-lg mb-8 aspect-video object-cover"
                loading="lazy"
            />

            <ContentRenderer
                v-if="data" id="content"
                :value="data"
                class="markdown-content flex-1"
            />
            <USeparator />
            <p class="font-semibold">
                {{ relatedArticlesString }}
            </p>
            <UBlogPosts id="related-articles">
                <UBlogPost
                    v-for="article in links"
                    :title="article.title"
                    :image="article.thumbnail"
                    :authors="[{
                        name: relatedAuthorsMap[article.author]?.name || article.author,
                        avatar: { src: relatedAuthorsMap[article.author]?.avatar },
                        description: relatedAuthorsMap[article.author]?.description
                    }]"
                    :badge="getBadge(article.date)"
                    :to="article.path"
                    variant="subtle"
                />
            </UBlogPosts>

            <!-- <UContentSurround :surround="surround" /> -->
        </UPageBody>
    </UPage>
</template>

<style lang="css">
@reference "~/assets/css/main.css";

/* Create custom max-lg variant for screens smaller than 1024px */
@custom-variant max-lg (@media (max-width: 1023px));

/* Apply the variant to all elements in this component */
* {
    @variant max-lg {
        scroll-margin-top: calc(var(--ui-header-height) + 4rem) !important;
    }
}
</style>
