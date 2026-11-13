export const VALID_CATEGORIES = [
    'Family',
    'Friends',
    'Work',
    'Clients',
    'Business',
    'Other'
];
/**
 * Type guard for ContactCategory.
 */
export function isContactCategory(val) {
    return typeof val === 'string' && VALID_CATEGORIES.indexOf(val) !== -1;
}
/**
 * Type guard for ContactStatus.
 */
export function isContactStatus(val) {
    return val === 'active' || val === 'inactive';
}
/**
 * Generic search utility preserving item type <T> across a collection.
 * Uses keyof constraints to safely inspect specified properties.
 */
export function searchByFields(items, query, searchableKeys) {
    const normalisedQuery = query.trim().toLowerCase();
    if (!normalisedQuery) {
        return [...items];
    }
    return items.filter((item) => searchableKeys.some((key) => {
        const val = item[key];
        if (val === undefined || val === null) {
            return false;
        }
        if (Array.isArray(val)) {
            return val.some((entry) => String(entry).toLowerCase().indexOf(normalisedQuery) !== -1);
        }
        return String(val).toLowerCase().indexOf(normalisedQuery) !== -1;
    }));
}
/**
 * Generic sorting utility with type-safe key indexing and direction control.
 */
export function sortByKey(items, key, order = 'asc') {
    const multiplier = order === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA === valB)
            return 0;
        if (valA === undefined || valA === null)
            return 1;
        if (valB === undefined || valB === null)
            return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * multiplier;
        }
        return String(valA).localeCompare(String(valB)) * multiplier;
    });
}
/**
 * Generic predicate filtering utility preserving collection element type.
 */
export function filterByPredicate(items, predicate) {
    return items.filter(predicate);
}
/**
 * Generic field matching filter utility using keyof constraints.
 */
export function filterByFieldValue(items, key, value) {
    return items.filter((item) => item[key] === value);
}
