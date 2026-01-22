<script lang="ts" setup>
interface Props {
    title: string;
    category: string;
    articles: any[];
    maxItems?: number;
    viewAllText?: string;
}

const props = withDefaults(defineProps<Props>(), {
    maxItems: 3,
    viewAllText: 'Vedi tutti'
});

const isNewArticle = (date: string) => {
    return Math.abs(new Date().getTime() - new Date(date).getTime()) < 8.64e7 * 7;
};

const getArticleBadge = (date: string) => {
    return isNewArticle(date) ? { label: 'New', color: 'primary' as const } : undefined;
};

// const formatArticleDate = (date: string) => {
//     return formatDateIT(date);
// };
</script>

<template>
    <section v-if="articles.length" class="space-y-6">
        <div class="flex items-center justify-between">
            <h2 class="text-3xl font-bold">{{ title }}</h2>
            <UButton :to="`/articles?category=${category}`" variant="link" size="sm">
                {{ viewAllText }}
                <AnimatedArrow />
            </UButton>
        </div>
        <UBlogPosts>
            <UBlogPost v-for="article in articles.slice(0, maxItems)" :key="article._id" :title="article.title"
                :image="article.thumbnail"
                :authors="[{ name: article.author, avatar: { src: article.author_avatar }, description: article.author_description }]"
                :badge="getArticleBadge(article.date)" :to="article.path" variant="naked">
                <!-- :date="formatArticleDate(article.date)" -->
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
</template>

