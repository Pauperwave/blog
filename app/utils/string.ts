import slugifyLib from 'slugify'

export function slugify(s: string): string {
  return slugifyLib(s, {
    lower: true,      // Convert to lowercase
    strict: true,     // Strip special characters
    trim: true        // Trim leading/trailing replacement chars
  })
}