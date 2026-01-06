<template>
    <u-page>
        <u-page-body>
            <!-- <div class="flex justify-between gap-2 w-full items-center flex-wrap">
                <u-form-field>
                    <template #label> A complete, responsive, aesthetic and SEO optimized Blog. </template>
                    <template #description>
                        <p>
                            In this series of tutorials, we implemented a blog from scratch. We added cool features such as responsive Table of Content with microinteractions and
                            made the blog SEO ready. <br />
                        </p>
                    </template>
                </u-form-field>
                <u-button
                    label="Check out the playlist"
                    icon="logos:youtube-icon"
                    color="neutral"
                    to="https://www.youtube.com/playlist?list=PLy6JsnZbXr8wztuwuDfNZmfKziSDVy9CM"
                    target="_blank"
                ></u-button>
            </div> -->
            <!-- <u-separator></u-separator> -->
            <!-- <u-field-group class="">
                <u-content-search-button variant="outline">
                    <div class="flex items-center gap-4">
                        Search
                        <div class="flex gap-1 items-center">
                            <u-kbd variant="soft">CTRL</u-kbd>
                            <u-kbd variant="soft">K</u-kbd>
                        </div>
                    </div>
                </u-content-search-button>
            </u-field-group> -->
            <!-- <client-only>
                <u-content-search v-model:search-term="query" shortcut="meta_k" :files="files" :navigation="navigation" :fuse="{ resultLimit: 42 }"></u-content-search>
            </client-only> -->
            <UEmpty
                v-if="(articles?.length ?? 0) <= 0"
                title="No interesting material yet"
                description="Give me some time to create some boring stuff."
                variant="naked"
                :actions="[{ label: 'Go back home', to: '/' }]"
            >
            </UEmpty>
            <UBlogPosts v-else>
            <UBlogPost
                v-for="article in articles"
                :key="article.path"
                :title="article.title"
                :image="article.thumbnail"
                :authors="[{ name: article.author, avatar: { src: article.author_avatar }, description: article.author_description }]"
                :badge="Math.abs(new Date().getTime() - new Date(article?.date).getTime()) < 8.64e7 * 7 ? { label: 'New', color: 'primary' } : undefined"
                :date="article.date"
                :to="article.path"
                variant="naked"
            >
                <template #description>
                    <p class="mt-1 text-base text-pretty">{{ article.description }}</p>
                    <div class="flex flex-row gap-2 items-center flex-wrap mt-3">
                        <UBadge v-for="tag in article.tags" :key="tag" color="primary" variant="soft">
                            {{ tag }}
                        </UBadge>
                    </div>
                </template>
            </UBlogPost>
        </UBlogPosts>
        </u-page-body>
    </u-page>
</template>

<script lang="ts" setup>
const { data: articles } = await useAsyncData("articles-home", () => queryCollection("articles").all());
// const { data: navigation } = await useAsyncData("navigation", () => queryCollectionNavigation("articles"));
// const { data: files } = useLazyAsyncData("search", () => queryCollectionSearchSections("articles"), {
//     server: false,
// });
// const query = ref("");
</script>

<!-- <style lang="css" scoped>
@reference "~/assets/css/main.css";
</style> -->
