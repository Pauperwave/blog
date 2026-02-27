export interface SocialPlatformMetaDefinition {
  icon: string
  label: string
  hoverClass: string
}

export const SOCIAL_PLATFORM_META = {
  facebook: {
    icon: 'i-lucide-facebook',
    label: 'Facebook',
    hoverClass: 'hover:text-blue-600'
  },
  github: {
    icon: 'i-lucide-github',
    label: 'GitHub',
    hoverClass: 'hover:text-gray-900 dark:hover:text-white'
  },
  instagram: {
    icon: 'i-lucide-instagram',
    label: 'Instagram',
    hoverClass: 'hover:text-pink-600'
  },
  telegram: {
    icon: 'i-lucide-send',
    label: 'Telegram',
    hoverClass: 'hover:text-sky-500'
  },
  twitch: {
    icon: 'i-lucide-twitch',
    label: 'Twitch',
    hoverClass: 'hover:text-purple-600'
  },
  twitter: {
    icon: 'i-lucide-twitter',
    label: 'Twitter',
    hoverClass: 'hover:text-blue-400'
  },
  website: {
    icon: 'i-lucide-globe',
    label: 'Website',
    hoverClass: 'hover:text-primary'
  },
  youtube: {
    icon: 'i-lucide-youtube',
    label: 'YouTube',
    hoverClass: 'hover:text-red-600'
  }
} as const satisfies Record<string, SocialPlatformMetaDefinition>
