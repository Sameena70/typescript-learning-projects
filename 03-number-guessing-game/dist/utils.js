/**
 * Generic utility functions for collection filtering and aggregation.
 */
/**
 * Generic filtering helper preserving type information with property constraint.
 */
export function filterRecordsByField(items, key, value) {
    return items.filter((item) => item[key] === value);
}
/**
 * Generic aggregation helper for calculating numeric sums across collections.
 */
export function aggregateNumericField(items, extractor) {
    return items.reduce((sum, item) => sum + extractor(item), 0);
}
