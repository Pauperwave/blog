export interface AuthorSocials {
  twitter?: string
  github?: string
  youtube?: string
  twitch?: string
  website?: string
}

export type AuthorSocialKey = keyof AuthorSocials

export interface AuthorSocialLinkDefinition {
  key: AuthorSocialKey
  icon: string
  label: string
  hoverClass: string
}

export const AUTHOR_SOCIAL_LINKS: AuthorSocialLinkDefinition[] = [
  { key: 'twitter', icon: 'i-lucide-twitter', label: 'Twitter', hoverClass: 'hover:text-blue-400' },
  { key: 'github', icon: 'i-lucide-github', label: 'GitHub', hoverClass: 'hover:text-gray-900 dark:hover:text-white' },
  { key: 'youtube', icon: 'i-lucide-youtube', label: 'YouTube', hoverClass: 'hover:text-red-600' },
  { key: 'twitch', icon: 'i-lucide-twitch', label: 'Twitch', hoverClass: 'hover:text-purple-600' },
  { key: 'website', icon: 'i-lucide-globe', label: 'Website', hoverClass: 'hover:text-primary' }
]
