export const isEmail = (str: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

export const isPhone = (str: string): boolean =>
    /^\+?\d{7,15}$/.test(str);

export const isEmptyString = (str: string): boolean =>
    !str.trim();

export const isNumber = (value: unknown): boolean =>
    typeof value === 'number' && !isNaN(value as number);
