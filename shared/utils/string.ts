// utils/string.ts
export const upper = (str: string): string => str.toUpperCase();
export const lower = (str: string): string => str.toLowerCase();

export const capitalize = (input: string): string =>
    input[0] ? input[0].toUpperCase() + input.slice(1) : '';

export const capitalizeWords = (input: string): string =>
    input
        .split(/\s+/) // split by spaces (handles multiple spaces too)
        .map(word => capitalize(word))
        .join(' ');

export const slugify = (input: string): string =>
    input
        .normalize("NFD")                 // split accents
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")    // remove non-alphanumeric
        .replace(/\s+/g, "-")            // replace spaces with -
        .replace(/-+/g, "-");            // collapse multiple dashes

export const fullName = (first: string, last: string): string => {
    return `${capitalize(first)} ${capitalize(last)}`;
};