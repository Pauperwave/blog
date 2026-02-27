import { AUTHOR_SOCIAL_PLATFORM_META } from './author-social-platform-meta'

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

const AUTHOR_SOCIAL_KEYS: AuthorSocialKey[] = ['twitter', 'github', 'youtube', 'twitch', 'website']

export const AUTHOR_SOCIAL_LINKS: AuthorSocialLinkDefinition[] = AUTHOR_SOCIAL_KEYS.map(key => ({
  key,
  ...AUTHOR_SOCIAL_PLATFORM_META[key]
}))
