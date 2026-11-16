/**
 * Generic utility functions for collection filtering and aggregation.
 */

/**
 * Generic filtering helper preserving type information with property constraint.
 */
export function filterRecordsByField<T, K extends keyof T>(items: T[], key: K, value: T[K]): T[] {
  return items.filter((item) => item[key] === value);
}

/**
 * Generic aggregation helper for calculating numeric sums across collections.
 */
export function aggregateNumericField<T>(items: T[], extractor: (item: T) => number): number {
  return items.reduce((sum, item) => sum + extractor(item), 0);
}
