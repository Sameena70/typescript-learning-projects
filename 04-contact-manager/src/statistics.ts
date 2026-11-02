/**
 * statistics.ts
 * 
 * Functions to compute aggregate statistics from the contacts list
 * using TypeScript array methods: filter, reduce, and length.
 */

import { Contact, ContactStatistics } from "./types.js";

/**
 * Calculates dashboard statistics from the list of contacts.
 * Demonstrates:
 * - filter() to count status and favourites
 * - reduce() to tally category counts
 * - Date comparison to determine recently added contacts (within last 7 days)
 */
export function calculateContactStatistics(contacts: Contact[]): ContactStatistics {
  const total = contacts.length;

  // Use filter() to get active contacts count
  const active = contacts.filter((c: Contact) => c.status === "active").length;

  // Inactive contacts count
  const inactive = contacts.filter((c: Contact) => c.status === "inactive").length;

  // Favourites count
  const favourites = contacts.filter((c: Contact) => c.isFavourite).length;

  // Calculate recently added (within the last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentlyAdded = contacts.filter((c: Contact) => {
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

  const categoryCounts = contacts.reduce((acc, contact: Contact) => {
    if (contact.category in acc) {
      acc[contact.category] = (acc[contact.category] || 0) + 1;
    } else {
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

