/**
 * storage.ts
 * 
 * Safe persistence and retrieval of contacts in browser localStorage.
 * Includes initial seed data for first-time visitors so the application
 * immediately feels populated and active.
 */

import { Contact } from "./types.js";

const STORAGE_KEY = "ts_contact_manager_contacts_v1";

/**
 * Seed contacts loaded when the user has no existing saved contacts.
 * Demonstrates optional fields, various categories, active/inactive states.
 */
const SEED_CONTACTS: Contact[] = [
  {
    id: "seed-1",
    fullName: "Priya Sharma",
    phoneNumber: "+91 98765 43210",
    email: "priya.sharma@techcorp.in",
    age: 29,
    company: "TechCorp Innovations",
    jobTitle: "Lead Frontend Engineer",
    address: "Koramangala, Bengaluru, Karnataka",
    category: "Work",
    status: "active",
    isFavourite: true,
    notes: "Lead contact for TypeScript UI components.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-2",
    fullName: "Aarav Patel",
    phoneNumber: "+91 91234 56789",
    email: "aarav.p@cloudsystems.com",
    age: 34,
    company: "Cloud Systems India",
    jobTitle: "Senior DevOps Architect",
    address: "Hinjawadi Phase 2, Pune, Maharashtra",
    category: "Clients",
    status: "active",
    isFavourite: false,
    notes: "Consulting client for AWS infrastructure migration.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-3",
    fullName: "Rohan Verma",
    phoneNumber: "+91 99887 76655",
    email: "rohan.verma@familyconnect.net",
    age: 26,
    company: "Verma Enterprises",
    jobTitle: "Associate Manager",
    address: "Vasant Vihar, New Delhi",
    category: "Family",
    status: "active",
    isFavourite: true,
    notes: "Cousin - planning family reunion.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-4",
    fullName: "Sneha Mukherjee",
    phoneNumber: "+91 97654 32109",
    email: "sneha.design@freelance.org",
    age: 31,
    company: "Mukherjee Design Studio",
    jobTitle: "UI/UX Consultant",
    address: "Salt Lake Sector V, Kolkata, West Bengal",
    category: "Business",
    status: "inactive",
    isFavourite: false,
    notes: "Contract paused until next fiscal quarter.",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-5",
    fullName: "Vikram Malhotra",
    phoneNumber: "+91 98450 12345",
    email: "vikram.m@friendsnetwork.io",
    age: 28,
    company: "Apex Media",
    jobTitle: "Creative Director",
    address: "Bandra West, Mumbai, Maharashtra",
    category: "Friends",
    status: "active",
    isFavourite: true,
    notes: "College roommate and weekend badminton partner.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Loads contacts from localStorage.
 * If no saved data exists, initializes with seed contacts.
 * Safely handles parse failures.
 */
export function loadSavedContacts(): Contact[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // First run: save seed data and return it
      saveContactsToStorage(SEED_CONTACTS);
      return SEED_CONTACTS;
    }

    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed as Contact[];
    }
    // If parsed object is not an array, reset to seed data
    return SEED_CONTACTS;
  } catch (error) {
    console.error("Failed to load contacts from localStorage:", error);
    return SEED_CONTACTS;
  }
}

/**
 * Saves contacts to localStorage.
 */
export function saveContactsToStorage(contacts: Contact[]): boolean {
  try {
    const serialized = JSON.stringify(contacts);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error("Failed to save contacts to localStorage:", error);
    return false;
  }
}

/**
 * Clears all stored contacts from localStorage.
 */
export function clearStoredContacts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear contacts from localStorage:", error);
  }
}

