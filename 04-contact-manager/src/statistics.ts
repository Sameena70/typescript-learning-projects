/**
 * statistics.ts
 *
 * Functions to compute aggregate statistics from the contacts list
 * using TypeScript array methods: filter, reduce, and length.
 */

import { Contact, ContactStatistics } from './types.js';

/**
 * Calculates dashboard statistics from the list of contacts.
 */
export function calculateContactStatistics(contacts: Contact[]): ContactStatistics {
  const total = contacts.length;

  const active = contacts.filter((c: Contact) => c.status === 'active').length;
  const inactive = contacts.filter((c: Contact) => c.status === 'inactive').length;
  const favourites = contacts.filter((c: Contact) => c.isFavourite).length;

  // Contacts with an active follow-up reminder
  const withReminders = contacts.filter((c: Contact) =>
    Boolean(c.reminderDate && c.reminderDate.trim().length > 0)
  ).length;

  // Calculate recently added (within the last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentlyAdded = contacts.filter((c: Contact) => {
    const createdTimestamp = new Date(c.createdAt).getTime();
    return !isNaN(createdTimestamp) && createdTimestamp >= sevenDaysAgo;
  }).length;

  // Category counts using reduce()
  const initialCategoryCounts = {
    Family: 0,
    Friends: 0,
    Work: 0,
    Clients: 0,
    Business: 0,
    Other: 0
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
    withReminders,
    categoryCounts
  };
}
