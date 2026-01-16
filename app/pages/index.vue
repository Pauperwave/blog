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
                <ArticleCategorySection
                    title="Ultimi articoli"
                    category="article"
                    :articles="articlesByCategory.article"
                />
                <ArticleCategorySection
                    title="Spoilers & Set Reviews"
                    category="spoiler"
                    :articles="articlesByCategory.spoiler"
                />
                <ArticleCategorySection
                    title="Tutorial"
                    category="tutorial"
                    :articles="articlesByCategory.tutorial"
                />
                <ArticleCategorySection
                    title="Resoconti dei tornei"
                    category="report"
                    :articles="articlesByCategory.report"
                />
                <ArticleCategorySection
                    title="Top Decklists"
                    category="decklist"
                    :articles="articlesByCategory.decklist"
                />
            </div>
        </UPageBody>
    </UPage>
</template>