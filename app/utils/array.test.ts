import { describe, it, expect } from 'vitest';
import { intersection, orderBy } from './array';

describe('array utilities', () => {
  describe('intersection', () => {
    it('should return common elements between two arrays', () => {
      const result = intersection([1, 2, 3, 4], [2, 3, 5, 6]);
      expect(result).toEqual([2, 3]);
    });

    it('should return empty array when no common elements exist', () => {
      const result = intersection([1, 2, 3], [4, 5, 6]);
      expect(result).toEqual([]);
    });

    it('should handle empty arrays', () => {
      expect(intersection([], [1, 2, 3])).toEqual([]);
      expect(intersection([1, 2, 3], [])).toEqual([]);
      expect(intersection([], [])).toEqual([]);
    });

    it('should work with string arrays', () => {
      const result = intersection(['pauper', 'modern', 'legacy'], ['modern', 'pioneer', 'legacy']);
      expect(result).toEqual(['modern', 'legacy']);
    });

    it('should preserve order from first array', () => {
      const result = intersection([3, 1, 2], [2, 3, 4]);
      expect(result).toEqual([3, 2]);
    });

    it('should handle duplicate values correctly', () => {
      // Set behavior: duplicates in arr1 are preserved, but only if they exist in arr2
      const result = intersection([1, 2, 2, 3], [2, 3, 4]);
      expect(result).toEqual([2, 2, 3]);
    });

    it('should work with complex objects by reference', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const obj3 = { id: 3 };
      const result = intersection([obj1, obj2], [obj2, obj3]);
      expect(result).toEqual([obj2]);
    });
  });

  describe('orderBy', () => {
    it('should sort numbers in ascending order by default', () => {
      const result = orderBy([3, 1, 2], x => x);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should sort numbers in descending order', () => {
      const result = orderBy([1, 3, 2], x => x, 'desc');
      expect(result).toEqual([3, 2, 1]);
    });

    it('should sort strings in ascending order', () => {
      const result = orderBy(['charlie', 'alice', 'bob'], x => x);
      expect(result).toEqual(['alice', 'bob', 'charlie']);
    });

    it('should sort strings in descending order', () => {
      const result = orderBy(['alice', 'charlie', 'bob'], x => x, 'desc');
      expect(result).toEqual(['charlie', 'bob', 'alice']);
    });

    it('should sort objects by computed value (ascending)', () => {
      const articles = [
        { title: 'Article C', score: 3 },
        { title: 'Article A', score: 1 },
        { title: 'Article B', score: 2 }
      ];
      const result = orderBy(articles, a => a.score, 'asc');
      expect(result[0]?.title).toBe('Article A');
      expect(result[1]?.title).toBe('Article B');
      expect(result[2]?.title).toBe('Article C');
    });

    it('should sort objects by computed value (descending)', () => {
      const articles = [
        { title: 'Article A', tags: ['pauper'] },
        { title: 'Article B', tags: ['pauper', 'modern'] },
        { title: 'Article C', tags: ['legacy'] }
      ];
      const currentTags = ['pauper', 'modern'];
      const result = orderBy(
        articles, 
        a => intersection(a.tags, currentTags).length, 
        'desc'
      );
      expect(result[0]?.title).toBe('Article B'); // 2 matches
      expect(result[1]?.title).toBe('Article A'); // 1 match
      expect(result[2]?.title).toBe('Article C'); // 0 matches
    });

    it('should handle equal values correctly', () => {
      const items = [
        { name: 'A', value: 1 },
        { name: 'B', value: 1 },
        { name: 'C', value: 1 }
      ];
      const result = orderBy(items, i => i.value);
      expect(result).toHaveLength(3);
      expect(result.every(i => i.value === 1)).toBe(true);
    });

    it('should return empty array for empty input', () => {
      const result = orderBy([], x => x);
      expect(result).toEqual([]);
    });

    it('should not mutate the original array', () => {
      const original = [3, 1, 2];
      const sorted = orderBy(original, x => x);
      expect(original).toEqual([3, 1, 2]); // Original unchanged
      expect(sorted).toEqual([1, 2, 3]); // Sorted copy
    });

    it('should handle single element array', () => {
      const result = orderBy([42], x => x);
      expect(result).toEqual([42]);
    });
  });

  describe('real-world usage: related articles by tag similarity', () => {
    it('should find and sort articles by tag overlap', () => {
      const currentArticle = {
        title: 'Current Article',
        tags: ['pauper', 'burn', 'red']
      };

      const allArticles = [
        { title: 'Article 1', tags: ['pauper', 'burn', 'red'] }, // 3 matches
        { title: 'Article 2', tags: ['pauper', 'control'] }, // 1 match
        { title: 'Article 3', tags: ['modern', 'burn'] }, // 1 match (burn)
        { title: 'Article 4', tags: ['pauper', 'burn'] }, // 2 matches
        { title: 'Article 5', tags: ['legacy'] }, // 0 matches
      ];

      const related = orderBy(
        allArticles,
        a => intersection(a.tags, currentArticle.tags).length,
        'desc'
      ).slice(0, 3);

      expect(related[0]?.title).toBe('Article 1'); // 3 matches
      expect(related[1]?.title).toBe('Article 4'); // 2 matches
      // Articles 2 and 3 both have 1 match, order preserved from input
      expect(related[2]?.title).toBe('Article 2'); // 1 match
    });
  });
});
