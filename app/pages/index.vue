<script lang="ts" setup>
const { data: allArticles } = await useAsyncData('home-articles', () =>
    queryCollection('articles').order('date', 'DESC').all()
);

const articlesByCategory = computed(() => {
    const categories = {
        article: [] as any[],
        tutorial: [] as any[],
        decklist: [] as any[],
        report: [] as any[],
        spoiler: [] as any[]
    };

    allArticles.value?.forEach((article: any) => {
        if (article.category && categories[article.category as keyof typeof categories]) {
            categories[article.category as keyof typeof categories].push(article);
        }
    });

    return categories;
});
</script>

<template>
    <UPage>
        <UPageBody>
            <div class="flex flex-col gap-12 items-stretch w-full">
                <!-- Articles Section -->
                <section v-if="articlesByCategory.article.length" class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-3xl font-bold">Ultimi articoli</h2>
                        <u-button to="/articles?category=article" variant="link" size="sm">
                            Vedi tutti
                            <animated-arrow></animated-arrow>
                        </u-button>
                    </div>
                    <UBlogPosts>
                        <UBlogPost
                            v-for="article in articlesByCategory.article.slice(0, 3)"
                            :key="article._id"
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
                </section>

                <!-- Tutorials Section -->
                <section v-if="articlesByCategory.tutorial.length" class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-3xl font-bold">Tutorial</h2>
                        <u-button to="/articles?category=tutorial" variant="link" size="sm">
                            Vedi tutti
                            <animated-arrow></animated-arrow>
                        </u-button>
                    </div>
                    <UBlogPosts>
                        <UBlogPost
                            v-for="article in articlesByCategory.tutorial.slice(0, 3)"
                            :key="article._id"
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
                </section>

                <!-- Decklists Section -->
                <section v-if="articlesByCategory.decklist.length" class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-3xl font-bold">Top Decklists</h2>
                        <u-button to="/articles?category=decklist" variant="link" size="sm">
                            Vedi tutti
                            <animated-arrow></animated-arrow>
                        </u-button>
                    </div>
                    <UBlogPosts>
                        <UBlogPost
                            v-for="article in articlesByCategory.decklist.slice(0, 3)"
                            :key="article._id"
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
                </section>

                <!-- Reports Section -->
                <section v-if="articlesByCategory.report.length" class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-3xl font-bold">Resoconti dei tornei</h2>
                        <u-button to="/articles?category=report" variant="link" size="sm">
                            Vedi tutti
                            <animated-arrow></animated-arrow>
                        </u-button>
                    </div>
                    <UBlogPosts>
                        <UBlogPost
                            v-for="article in articlesByCategory.report.slice(0, 3)"
                            :key="article._id"
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
                </section>

                <!-- Spoilers Section -->
                <section v-if="articlesByCategory.spoiler.length" class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-3xl font-bold">Spoilers & Set Reviews</h2>
                        <u-button to="/articles?category=spoiler" variant="link" size="sm">
                            Vedi tutti
                            <animated-arrow></animated-arrow>
                        </u-button>
                    </div>
                    <UBlogPosts>
                        <UBlogPost
                            v-for="article in articlesByCategory.spoiler.slice(0, 3)"
                            :key="article._id"
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
                </section>
            </div>
        </UPageBody>
    </UPage>
</template>