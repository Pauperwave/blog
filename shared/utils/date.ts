// utils/date.ts

// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import updateLocale from 'dayjs/plugin/updateLocale';
// import isYesterday from 'dayjs/plugin/isYesterday'
// import isToday from 'dayjs/plugin/isToday';
// import isTomorrow from 'dayjs/plugin/isTomorrow'

// import 'dayjs/locale/it';
// import 'dayjs/locale/de';

// extend dayjs with the plugins
// dayjs.extend(relativeTime);
// dayjs.extend(updateLocale);
// dayjs.extend(isYesterday);
// dayjs.extend(isToday);
// dayjs.extend(isTomorrow);

// dayjs.updateLocale('it', {
//   relativeTime: {
//     future: "fra %s",
//     past: "%s fa",
//     s: 'alcuni secondi',
//     m: 'un minuto',
//     mm: '%d minuti',
//     h: 'un\'ora',
//     hh: '%d ore',
//     d: 'un giorno',
//     dd: '%d giorni',
//     M: 'un mese',
//     MM: '%d mesi',
//     y: 'un anno',
//     yy: '%d anni'
//   }
// });

// Checking the current Day.js locale
// dayjs.locale() // 'it' is now the default locale

/**
 * Restituisce una data formattata come stringa secondo il formato specificato
 * @param date La data da formattare (Date, timestamp o stringa)
 * @param format Il formato da utilizzare (default: 'DD/MM/YYYY')
 * @returns La data formattata come stringa
 * @example formatDate(new Date(), 'DD/MM/YYYY') => "31/12/2023"
 * @example formatDate(new Date(), 'MM-DD-YYYY') => "12-31-2023"
 * @see https://day.js.org/docs/en/display/format
 * @see https://day.js.org/docs/en/display/format#list-of-all-available-formats
 */
// export const formatDate = (
//   date: Date | number | string,
//   format: string = 'DD/MM/YYYY'
// ): string => {
//   return dayjs(date).format(format);
// };

/**
 * Restituisce una stringa "tempo relativo" in italiano o altra lingua
 */
// export const timeAgo = (date: Date | string | number, locale: string = 'it'): string => {
//   return dayjs(date).locale(locale).fromNow();
// };

// Controlla se la data è oggi
// export const isTodayDate = (date: Date | string | number): boolean => {
//   return dayjs(date).isToday();
// };

// Controlla se la data è ieri
// export const isYesterdayDate = (date: Date | string | number): boolean => {
//   return dayjs(date).isYesterday();
// };

// Controlla se la data è domani
// export const isTomorrowDate = (date: Date | string | number): boolean => {
//   return dayjs(date).isTomorrow();
// };

// Controlla se la data è passata ignorando l'ora
// export const isPastDate = (date: Date | string | number): boolean => {
//   return dayjs(date).isBefore(dayjs(), 'day');
// };

// Controlla se la data è passata considerando anche l'ora
// export const isPastMoment = (date: Date | string | number): boolean => {
//   return dayjs(date).isBefore(dayjs());
// }

// Controlla se la data è futura ignorando l'ora
// export const isFutureDate = (date: Date | string | number): boolean => {
//   return dayjs(date).isAfter(dayjs(), 'day');
// };

// Controlla se la data è futura considerando anche l'ora
// export const isFutureMoment = (date: Date | string | number): boolean => {
//   return dayjs(date).isAfter(dayjs());
// }