<script setup>
const slug = useRoute().params.slug
const { data: post } = await useAsyncData(`articles-${slug}`, () => {
    return queryCollection('articles').path(`/articles/${slug}`).first()
})
</script>

<template>
    <!-- Render the blog post with Tailwind typography -->
    <article class="prose prose-lg max-w-none">
        <ContentRenderer :value="post" />
    </article>
</template>