export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

export const formatNumber = (num: number, decimals = 0): string =>
  num.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const percentage = (value: number, decimals = 0): string =>
  `${(value * 100).toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
