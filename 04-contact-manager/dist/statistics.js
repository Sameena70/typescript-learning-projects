/**
 * statistics.ts
 *
 * Functions to compute aggregate statistics from the contacts list
 * using TypeScript array methods: filter, reduce, and length.
 */
/**
 * Calculates dashboard statistics from the list of contacts.
 * Demonstrates:
 * - filter() to count status and favourites
 * - reduce() to tally category counts
 * - Date comparison to determine recently added contacts (within last 7 days)
 */
export function calculateContactStatistics(contacts) {
    const total = contacts.length;
    // Use filter() to get active contacts count
    const active = contacts.filter((c) => c.status === "active").length;
    // Inactive contacts count
    const inactive = contacts.filter((c) => c.status === "inactive").length;
    // Favourites count
    const favourites = contacts.filter((c) => c.isFavourite).length;
    // Calculate recently added (within the last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyAdded = contacts.filter((c) => {
        const createdTimestamp = new Date(c.createdAt).getTime();
        return !isNaN(createdTimestamp) && createdTimestamp >= sevenDaysAgo;
    }).length;
    // Category counts using reduce()
    // reduce takes an accumulator object and increments the appropriate category key
    const initialCategoryCounts = {
        Family: 0,
        Friends: 0,
        Work: 0,
        Clients: 0,
        Business: 0,
        Other: 0,
    };
    const categoryCounts = contacts.reduce((acc, contact) => {
        if (contact.category in acc) {
            acc[contact.category] = (acc[contact.category] || 0) + 1;
        }
        else {
            acc.Other = (acc.Other || 0) + 1;
        }
        return acc;
    }, initialCategoryCounts);
    return {
        total,
        active,
        inactive,
        favourites,
        recentlyAdded,
        categoryCounts,
    };
}
