<script lang="ts" setup>
import { 
  type AnyArticle, 
  queryAllCollections, 
  combineArticles,
  CATEGORY_LABELS,
  type CategoryType
} from '~/constants/content-config';

const route = useRoute();
const slug = route.params.slug as string;

// Convert slug back to author name (e.g., "pietro-bragioto" -> "Pietro Bragioto")
const authorName = getAuthorNameFromSlug(slug);

// Fetch author data
const authorData = await useAuthor(authorName);

if (!authorData) {
  throw createError({
    statusCode: 404,
    message: `Author "${authorName}" not found`
  });
}

// Query all articles and filter by this author
const { data: authorArticles } = await useAsyncData(`author-articles-${slug}`, async () => {
  const collectionsData = await queryAllCollections();
  const allArticles: AnyArticle[] = combineArticles(collectionsData)
    .filter(article => 
      article.published !== false && 
      article.author.toLowerCase() === authorName.toLowerCase()
    );
  
  return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// Count articles by category
const articleCounts = computed(() => {
  if (!authorArticles.value) return {};
  
  const counts: Record<string, number> = {};
  authorArticles.value.forEach(article => {
    const category = article.category;
    counts[category] = (counts[category] || 0) + 1;
  });
  
  return counts;
});

// Total articles count
const totalArticles = computed(() => authorArticles.value?.length || 0);

// Recent articles (limit to 10)
const recentArticles = computed(() => authorArticles.value?.slice(0, 8) || []);

// SEO meta tags
useSeoMeta({
  title: `${authorData.name} - Autore`,
  description: authorData.bio || authorData.description,
  ogTitle: `${authorData.name} - Autore`,
  ogDescription: authorData.bio || authorData.description,
  ogImage: authorData.avatar,
});
</script>

<template>
  <UPage>
    <UPageHeader
      :title="authorData.name"
      :description="authorData.description"
    >
      <template #headline>
        <UBadge variant="soft" color="primary">
          Autore
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- Author Info Section -->
      <UCard class="mb-8">
        <div class="flex flex-col md:flex-row gap-6">
          <UAvatar
            :src="authorData.avatar"
            :alt="authorData.name"
            size="2xl"
            class="shrink-0"
          />
          
          <div class="flex-1">
            <div class="flex flex-col gap-4">
              <!-- Bio -->
              <p v-if="authorData.bio" class="text-base text-gray-700 dark:text-gray-300">
                {{ authorData.bio }}
              </p>
              
              <!-- Social Links -->
              <div v-if="authorData.socials" class="flex items-center gap-4 flex-wrap">
                <a
                  v-if="authorData.socials.twitter"
                  :href="authorData.socials.twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-400 transition-colors"
                >
                  <Icon name="mdi:twitter" class="w-5 h-5" />
                  <span>Twitter</span>
                </a>
                <a
                  v-if="authorData.socials.github"
                  :href="authorData.socials.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Icon name="mdi:github" class="w-5 h-5" />
                  <span>GitHub</span>
                </a>
                <a
                  v-if="authorData.socials.youtube"
                  :href="authorData.socials.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Icon name="mdi:youtube" class="w-5 h-5" />
                  <span>YouTube</span>
                </a>
                <a
                  v-if="authorData.socials.twitch"
                  :href="authorData.socials.twitch"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Icon name="mdi:twitch" class="w-5 h-5" />
                  <span>Twitch</span>
                </a>
                <a
                  v-if="authorData.socials.website"
                  :href="authorData.socials.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                >
                  <Icon name="mdi:web" class="w-5 h-5" />
                  <span>Website</span>
                </a>
              </div>
              
              <!-- Article Stats -->
              <div class="flex items-center gap-6 flex-wrap">
                <div class="flex items-center gap-2">
                  <Icon name="material-symbols:article-rounded" class="w-5 h-5 text-primary" />
                  <span class="text-sm font-semibold">{{ totalArticles }} articoli totali</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Article Counts by Category -->
      <div v-if="Object.keys(articleCounts).length > 0" class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Articoli per categoria</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="(count, category) in articleCounts"
            :key="category"
            :to="`/articles?category=${category}`"
            class="block"
          >
            <UCard
              class="text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div class="flex flex-col gap-2">
                <p class="text-3xl font-bold text-primary">{{ count }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ CATEGORY_LABELS[category as CategoryType] }}
                </p>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Articles -->
      <div v-if="recentArticles.length > 0">
        <h2 class="text-2xl font-bold mb-4">Ultimi articoli</h2>
        <UBlogPosts class="gap-4 lg:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          <UBlogPost
            v-for="article in recentArticles"
            :key="article.path"
            :title="article.title"
            :image="article.thumbnail"
            :badge="Math.abs(new Date().getTime() - new Date(article?.date).getTime()) < 8.64e7 * 7 ? { label: 'Nuovo', color: 'primary' } : undefined"
            :date="article.date"
            :to="article.path"
            variant="naked"
            class="group border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-400/10 hover:-translate-y-1 hover:scale-[1.02] bg-white dark:bg-gray-900/50 backdrop-blur-sm"
          >
            <template #date>
              {{ useState(`article-date-${article.path}`, () => formatDateIT(article.date)).value }}
            </template>
            <template #description>
              <p class="mt-1 text-base text-pretty">
                {{ article.description }}
              </p>
              <div class="flex flex-row gap-2 items-center flex-wrap mt-3">
                <UBadge color="neutral" variant="soft">
                  {{ CATEGORY_LABELS[article.category as CategoryType] }}
                </UBadge>
                <UBadge v-for="tag in article.tags" :key="tag" color="primary" variant="soft">
                  {{ tag }}
                </UBadge>
              </div>
            </template>
          </UBlogPost>
        </UBlogPosts>
      </div>

      <!-- Empty State -->
      <UEmpty
        v-else
        title="Nessun articolo"
        description="Questo autore non ha ancora pubblicato articoli."
        variant="naked"
        :actions="[{ label: 'Torna alla home', to: '/' }]"
      />
    </UPageBody>
  </UPage>
</template>
