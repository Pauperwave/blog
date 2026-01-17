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
                <!-- <u-field-group class="w-full">
                    <u-button @click="share" label="Share this article" icon="material-symbols:share" variant="subtle" color="neutral" class="grow"> </u-button>
                    <u-dropdown-menu :items="[{ label: 'Copy URL', icon: 'mdi:link-variant', onSelect: copyLink }]">
                        <u-button icon="i-lucide-chevron-down" variant="subtle" color="neutral"></u-button>
                    </u-dropdown-menu>
                </u-field-group> -->
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
                    <UUser
                        :name="data?.author"
                        :description="data?.author_description"
                        :avatar="{ src: data?.author_avatar }"
                        class="cursor-default"
                        @click="() => authorEl?.scrollIntoView()"
                    />
                </div>
                <div class="flex flex-row items-center gap-4">
                    <p class="flex flex-row items-center gap-1 typ-sublabel">
                        <icon name="material-symbols:calendar-today-rounded" class="text-primary" /> {{ formatDateWithMonthIT(data?.date) }}
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
                        name: article.author,
                        avatar: { src: article.author_avatar },
                        description: article.author_description
                    }]"
                    :badge="getBadge(article.date)"
                    :date="formatDateIT(article.date)"
                    :to="article.path"
                    variant="subtle"
                />
            </UBlogPosts>

            <UContentSurround :surround="surround" />
        </UPageBody>
    </UPage>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";
import "dayjs/locale/it";
import l from "lodash";

// Set Italian locale for dayjs
dayjs.locale('it');
import appMeta from "~/app.meta";
import type { ArticlesCollectionItem, TutorialsCollectionItem, DecklistsCollectionItem, ReportsCollectionItem, SpoilersCollectionItem } from '#content';

// Union type for all article types
type AnyArticle = 
    | ArticlesCollectionItem 
    | TutorialsCollectionItem 
    | DecklistsCollectionItem 
    | ReportsCollectionItem 
    | SpoilersCollectionItem;

const route = useRoute();
const authorEl = ref<HTMLElement | null>();
const relatedArticlesEl = ref<HTMLElement | null>();

// TODO mostrare solo articoli con tag simili
const relatedArticlesString = "Altri articoli correlati"
const getBadge = (date: string) => {
    return Math.abs(new Date().getTime() - new Date(date).getTime()) < 8.64e7 * 7
        ? { label: "New", color: "primary" as const }
        : undefined;
};

// const readingTimeText = computed(() => (data.value?.meta as any).readingTime?.text);
const tocTitle = computed(() => `In questo articolo`);
const clipboard = useClipboard();
const toast = useToast();

const { data } = await useAsyncData(route.path, async () => {
    // Try each collection until we find the article
    const collections = ["articles", "tutorials", "decklists", "reports", "spoilers"];
    for (const collection of collections) {
        const result = await queryCollection(collection as any).path(route.path).first();
        if (result) return result;
    }
    return null;
});
const { data: links } = await useAsyncData(`linked-${route.path}`, async () => {
    const [articlesData, tutorialsData, decklistsData, reportsData, spoilersData] = await Promise.all([
        queryCollection("articles").all(),
        queryCollection("tutorials").all(),
        queryCollection("decklists").all(),
        queryCollection("reports").all(),
        queryCollection("spoilers").all(),
    ]);
    // Using concat() for better performance with large datasets (1000+ articles)
    const allArticles: AnyArticle[] = (articlesData as AnyArticle[])
        .concat(tutorialsData as AnyArticle[], decklistsData as AnyArticle[], reportsData as AnyArticle[], spoilersData as AnyArticle[])
        .filter(a => a.path !== data.value?.path && a.draft !== true);
    return l.orderBy(allArticles, (a) => l.intersection(a.tags, data.value?.tags).length, "desc").slice(0, 5);
});
const { data: surround } = await useAsyncData(`${route.path}-surround`, async () => {
    // Try to find surroundings in each collection
    const collections = ["articles", "tutorials", "decklists", "reports", "spoilers"];
    for (const collection of collections) {
        try {
            const result = await queryCollectionItemSurroundings(collection as any, route.path, {
                fields: ["description"],
            });
            if (result) return result;
        } catch (e) {
            // Continue to next collection if not found
        }
    }
    return null;
});

updateMeta();

// async function copyLink() {
//     await clipboard.copy(window.location.href);
//     toast.add({ title: "Copied to clipboad", icon: "material-symbols:check-circle-rounded", color: "success" });
// }

// async function share() {
//     await navigator.share({ url: route.fullPath });
// }

function updateMeta() {
    useSchemaOrg([
        defineArticle({
            headline: data.value?.title,
            description: data.value?.description,
            image: data.value?.thumbnail,
            datePublished: dayjs(data.value?.date, "YYYY-MM-DD").toDate().toString(),
            keywords: data.value?.tags,
            author: {
                name: data.value?.author,
                description: data.value?.author_description,
                image: data.value?.author_avatar,
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
    });

    defineOgImageComponent("Article", {
        thumbnail: data.value?.thumbnail,
        title: data.value?.title,
        author: {
            name: data.value?.author,
            image: data.value?.author_avatar,
        },
    });
}

onMounted(() => {
    const contentEl = document.getElementById("content");
    authorEl.value = contentEl?.querySelector("#author-about");
    relatedArticlesEl.value = document.documentElement?.querySelector("#related-articles") as HTMLElement | undefined;
});
</script>

<style lang="css">
@reference "~/assets/css/main.css";

@variant max-lg {
    * {
        scroll-margin-top: calc(var(--ui-header-height) + 4rem) !important;
    }
}
</style>
