<script setup>
const slug = useRoute().params.slug
const { data: post } = await useAsyncData(`blog-${slug}`, () => {
    return queryCollection('blog').path(`/blog/${slug}`).first()
})
</script>

<template>
    <!-- Render the blog post with Tailwind typography -->
    <article class="prose prose-lg max-w-none">
        <ContentRenderer :value="post" />
    </article>
</template>