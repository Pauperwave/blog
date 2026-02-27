<script setup lang="ts">
import {
  AUTHOR_SOCIAL_LINKS,
  type AuthorSocialLinkDefinition,
  type AuthorSocials
} from '~/constants/author-socials'

interface VisibleSocial extends AuthorSocialLinkDefinition {
  url: string
}

interface Props {
  socials?: AuthorSocials | null
  variant?: 'icons' | 'labels'
  maxItems?: number
  showCount?: boolean
  countLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  socials: null,
  variant: 'icons',
  maxItems: undefined,
  showCount: false,
  countLabel: 'social'
})

const visibleSocials = computed<VisibleSocial[]>(() => {
  if (!props.socials) return []

  return AUTHOR_SOCIAL_LINKS.reduce<VisibleSocial[]>((acc, social) => {
    const url = props.socials?.[social.key]
    if (url) acc.push({ ...social, url })
    return acc
  }, [])
})

const renderedSocials = computed(() => {
  if (typeof props.maxItems !== 'number') return visibleSocials.value
  return visibleSocials.value.slice(0, props.maxItems)
})
</script>

<template>
  <div
    v-if="renderedSocials.length > 0"
    :class="variant === 'labels' ? 'flex items-center gap-4 flex-wrap' : 'flex items-center gap-2 text-gray-500 dark:text-gray-400'"
  >
    <template v-if="variant === 'labels'">
      <ULink
        v-for="social in renderedSocials"
        :key="social.key"
        :to="social.url"
        target="_blank"
        external
        class="flex items-center gap-2 text-sm text-gray-600 transition-colors"
        :class="social.hoverClass"
      >
        <UIcon
          :name="social.icon"
          class="w-5 h-5"
        />
        <span>{{ social.label }}</span>
      </ULink>
    </template>

    <template v-else>
      <a
        v-for="social in renderedSocials"
        :key="social.key"
        :href="social.url"
        :aria-label="social.label"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center hover:text-primary transition-colors"
        @click.stop
        @keydown.enter.stop
      >
        <UIcon
          :name="social.icon"
          class="w-4 h-4"
        />
      </a>

      <span
        v-if="showCount"
        class="text-xs"
      >
        {{ visibleSocials.length }} {{ countLabel }}
      </span>
    </template>
  </div>
</template>
