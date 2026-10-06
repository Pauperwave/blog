<script setup lang="ts">
const { counts, highlightSection = null } = defineProps<{
  counts: { section: string; count: number }[]
  /** Underlined */
  highlightSection?: string | null
}>()

const emit = defineEmits<{
  hover: [section: string | null]
}>()

</script>

<template>
  <div class="flex items-center gap-3 text-base font-semibold tabular-nums">
    <UTooltip
      v-for="type in counts"
      :key="type.section"
      :text="type.section"
    >
      <!-- The invisible top border keeps the icon centered once the bottom one becomes the underline -->
      <span
        class="inline-flex cursor-pointer items-center gap-1.5 border-y-3 border-transparent py-1.5 motion-safe:transition-transform motion-safe:duration-150"
        :class="{ 'scale-110 border-b-current!': highlightSection === type.section }"
        @mouseenter="emit('hover', type.section)"
        @mouseleave="emit('hover', null)"
      >
        <span class="inline-flex size-7 items-center justify-center rounded-full bg-white text-gray-900 ring-1 ring-black/20">
          <MagicCardTypesIcon :type="type.section" size="md" />
        </span>
        {{ type.count }}
      </span>
    </UTooltip>
  </div>
</template>
