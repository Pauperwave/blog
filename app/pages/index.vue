<script setup lang="ts">
const { data: posts } = await useAsyncData('blog', () => queryCollection('blog').all())
</script>

<template>
  <div>
    <div class="flex justify-center">
      <ul class="space-y-4 mt-6 w-full max-w-2xl">
        <li v-for="post in posts" :key="post.id"
          class="bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-shadow duration-200">
          <NuxtLink :to="post.path" class="flex items-center px-6 py-4 group">
            <div class="flex flex-row">
              <!-- la data si trova sulla sinistra -->
              <span class="text-gray-50 mr-4 underline underline-offset-2 underlon">
                {{ new Date(post.date).toLocaleDateString('it-IT') }}
              </span>
              <!-- Gli autori devono essere visualizzati sotto il titolo -->
              <div class="flex flex-col">
                <span class="text-lg font-semibold text-gray-900 dark:text-white group-hover:underline">
                  {{ post.title }}
                </span>
                <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span v-if="post.authors && post.authors.length > 0">
                    {{ Array.isArray(post.authors) ? post.authors.join(', ') : post.authors }}
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
