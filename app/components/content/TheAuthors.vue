<!-- <template>
  <div
    v-for="author in authors"
    :key="author.id"
    class="mb-6 p-4 border-b"
  >
    <h2 class="text-xl font-bold text-gray-800">
      {{ author.name }}
    </h2>
    <p
      v-if="author.bio"
      class="mt-2 text-gray-600"
    >
      {{ author.bio }}
    </p>
  </div>
</template>

<script lang="ts" setup>
// Get all authors
const { data: authors } = await useAsyncData('authors', () => {
  return queryCollection('authors')
    .order('name', 'DESC')
    .all()
})
</script> -->
