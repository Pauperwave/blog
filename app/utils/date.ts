import dayjs from 'dayjs';
import itLocale from 'dayjs/locale/it';

// Set Italian as the global locale to ensure it works during SSR
dayjs.locale('it', itLocale);

/**
 * Format a date to Italian format (DD MMMM YYYY)
 * @param date - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "22 gennaio 2026") or "Data non disponibile" if invalid
 */
export function formatDateIT(date: string): string {
  if (!date) return 'Data non disponibile';

  try {
    // Parse and format the date in Italian locale
    return dayjs(date).locale('it').format('DD MMMM YYYY');
  } catch (error) {
    console.warn('Failed to format date:', date, error);
    return 'Data non disponibile';
  }
}