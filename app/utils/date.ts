import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/it';

// Extend dayjs with UTC plugin
dayjs.extend(utc);

/**
 * Format a date to Italian format (DD MMMM YYYY)
 * Always uses UTC to prevent timezone-based hydration mismatches
 * @param date - Date object
 * @returns Formatted date string (e.g., "22 gennaio 2026") or "Data non disponibile" if invalid
 */
export function formatDateIT(date: string): string {
    if (!date) return 'Data non disponibile';
    
    try {
        return dayjs.utc(date).locale('it').format('DD MMMM YYYY');
    } catch (error) {
        console.warn('Failed to format date:', date, error);
        return 'Data non disponibile';
    }
}