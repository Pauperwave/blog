/**
 * Centralized social media links for Pauperwave
 */
export const PAUPERWAVE_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/pauperwave',
  instagram: 'https://www.instagram.com/pauperwave_official',
  youtube: 'https://www.youtube.com/@pauperwave',
  telegram: 'https://t.me/pauperwave_official',
  github: 'https://github.com/pauperwave',
} as const

export type SocialPlatform = keyof typeof PAUPERWAVE_SOCIAL_LINKS
