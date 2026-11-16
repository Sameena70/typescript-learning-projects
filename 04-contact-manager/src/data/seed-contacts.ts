/**
 * seed-contacts.ts
 *
 * Dedicated data module containing initial seed contacts.
 * Decouples sample/mock data from persistence and business logic.
 */

import { Contact } from '../types.js';

export const SEED_CONTACTS: readonly Contact[] = [
  {
    id: 'seed-1',
    fullName: 'Priya Sharma',
    phoneNumber: '+91 98765 43210',
    email: 'priya.sharma@techcorp.in',
    age: 29,
    company: 'TechCorp Innovations',
    jobTitle: 'Lead Frontend Engineer',
    address: 'Koramangala, Bengaluru, Karnataka',
    category: 'Work',
    status: 'active',
    isFavourite: true,
    tags: ['Tech', 'Lead'],
    notes: 'Lead contact for TypeScript UI components.',
    reminderDate: '2026-11-20',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'seed-2',
    fullName: 'Aarav Patel',
    phoneNumber: '+91 91234 56789',
    email: 'aarav.p@cloudsystems.com',
    age: 34,
    company: 'Cloud Systems India',
    jobTitle: 'Senior DevOps Architect',
    address: 'Hinjawadi Phase 2, Pune, Maharashtra',
    category: 'Clients',
    status: 'active',
    isFavourite: false,
    tags: ['Cloud', 'AWS'],
    notes: 'Consulting client for AWS infrastructure migration.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'seed-3',
    fullName: 'Rohan Verma',
    phoneNumber: '+91 99887 76655',
    email: 'rohan.verma@familyconnect.net',
    age: 26,
    company: 'Verma Enterprises',
    jobTitle: 'Associate Manager',
    address: 'Vasant Vihar, New Delhi',
    category: 'Family',
    status: 'active',
    isFavourite: true,
    tags: ['Family'],
    notes: 'Cousin - planning family reunion.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'seed-4',
    fullName: 'Sneha Mukherjee',
    phoneNumber: '+91 97654 32109',
    email: 'sneha.design@freelance.org',
    age: 31,
    company: 'Mukherjee Design Studio',
    jobTitle: 'UI/UX Consultant',
    address: 'Salt Lake Sector V, Kolkata, West Bengal',
    category: 'Business',
    status: 'inactive',
    isFavourite: false,
    tags: ['Design', 'Contractor'],
    notes: 'Contract paused until next fiscal quarter.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'seed-5',
    fullName: 'Vikram Malhotra',
    phoneNumber: '+91 98450 12345',
    email: 'vikram.m@friendsnetwork.io',
    age: 28,
    company: 'Apex Media',
    jobTitle: 'Creative Director',
    address: 'Bandra West, Mumbai, Maharashtra',
    category: 'Friends',
    status: 'active',
    isFavourite: true,
    tags: ['College', 'Sports'],
    notes: 'College roommate and weekend badminton partner.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];
