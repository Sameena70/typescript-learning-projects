/**
 * Generic collection manipulation helpers.
 */
/**
 * Type-safe sorting helper for arrays of objects using generic constraints.
 * Supports string, number, and date sorting with direction control.
 */
export function sortByField(items, key, order = 'asc') {
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
 * Generic predicate filtering utility preserving element types.
 */
export function filterItems(items, predicate) {
    return items.filter(predicate);
}
