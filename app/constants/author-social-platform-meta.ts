export interface AuthorSocialPlatformMetaDefinition {
  icon: string
  label: string
  hoverClass: string
}

// Metadata used only for author socials (not for footer/global socials).
export const AUTHOR_SOCIAL_PLATFORM_META = {
  twitter: {
    icon: 'i-simple-icons-x',
    label: 'Twitter',
    hoverClass: 'hover:text-blue-400'
  },
  reddit: {
    icon: 'i-simple-icons-reddit',
    label: 'Reddit',
    hoverClass: 'hover:text-orange-600'
  },
  github: {
    icon: 'i-simple-icons-github',
    label: 'GitHub',
    hoverClass: 'hover:text-gray-900 dark:hover:text-white'
  },
  twitch: {
    icon: 'i-simple-icons-twitch',
    label: 'Twitch',
    hoverClass: 'hover:text-purple-600'
  },
  youtube: {
    icon: 'i-simple-icons-youtube',
    label: 'YouTube',
    hoverClass: 'hover:text-red-600'
  },
  website: {
    icon: 'i-lucide-globe',
    label: 'Website',
    hoverClass: 'hover:text-primary'
  }
} as const satisfies Record<string, AuthorSocialPlatformMetaDefinition>
