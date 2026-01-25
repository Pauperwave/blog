/**
 * Finds the intersection of two arrays using native Set for O(n+m) performance.
 * Returns elements that are present in both arrays.
 * 
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Array containing elements present in both arrays
 * 
 * @example
 * intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 * intersection(['a', 'b'], ['b', 'c']) // ['b']
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set = new Set(arr2);
  return arr1.filter(x => set.has(x));
}

/**
 * Orders an array by a computed value in ascending or descending order.
 * Does not mutate the original array - returns a new sorted array.
 * 
 * @param array - Array to sort
 * @param iteratee - Function that computes the sort value for each item
 * @param order - Sort direction ('asc' or 'desc'), defaults to 'asc'
 * @returns New sorted array
 * 
 * @example
 * orderBy([{x: 3}, {x: 1}, {x: 2}], item => item.x, 'asc') // [{x: 1}, {x: 2}, {x: 3}]
 * orderBy([{x: 3}, {x: 1}, {x: 2}], item => item.x, 'desc') // [{x: 3}, {x: 2}, {x: 1}]
 */
export function orderBy<T>(
  array: T[],
  iteratee: (item: T) => number | string,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valA = iteratee(a);
    const valB = iteratee(b);

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Orders an array by multiple computed values.
 * 
 * @param array - Array to sort
 * @param iteratees - Array of functions that compute sort values
 * @param orders - Array of sort directions corresponding to iteratees
 * @returns New sorted array
 * 
 * @example
 * orderByMultiple(
 *   [{x: 1, y: 2}, {x: 1, y: 1}], 
 *   [item => item.x, item => item.y], 
 *   ['asc', 'desc']
 * )
 */
export function orderByMultiple<T>(
  array: T[],
  iteratees: ((item: T) => number | string)[],
  orders: ('asc' | 'desc')[]
): T[] {
  return [...array].sort((a, b) => {
    for (const [i, iteratee] of iteratees.entries()) {
      const valA = iteratee(a);
      const valB = iteratee(b);
      const order = orders[i] ?? 'asc';

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}