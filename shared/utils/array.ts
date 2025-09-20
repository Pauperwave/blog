export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

export const sortByKey = <T>(arr: T[], key: keyof T): T[] =>
    [...arr].sort((a, b) => (a[key] > b[key] ? 1 : -1));

export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
