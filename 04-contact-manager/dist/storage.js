/**
 * storage.ts
 *
 * Safe persistence, schema migration, and retrieval of contacts in browser localStorage.
 * Handles corrupted, incomplete, and legacy stored data without destroying user records.
 */
const STORAGE_KEY = 'ts_contact_manager_contacts_v1';
const LEGACY_STORAGE_KEY = 'ts_contact_manager_contacts';
export const VALID_CATEGORIES = [
    'Family',
    'Friends',
    'Work',
    'Clients',
    'Business',
    'Other'
];
/**
 * Seed contacts loaded when the user has no existing saved contacts.
 */
const SEED_CONTACTS = [
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
/**
 * Sanitizes and migrates a raw or legacy contact record to ensure complete schema compliance.
 */
export function sanitizeContactRecord(raw, index = 0) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const obj = raw;
    // FullName is mandatory and must be a string of at least 2 characters
    const rawName = typeof obj.fullName === 'string'
        ? obj.fullName.trim()
        : typeof obj.name === 'string'
            ? obj.name.trim()
            : '';
    if (rawName.length < 2) {
        return null;
    }
    // PhoneNumber is mandatory
    const rawPhone = typeof obj.phoneNumber === 'string'
        ? obj.phoneNumber.trim()
        : typeof obj.phone === 'string'
            ? obj.phone.trim()
            : '';
    if (rawPhone.length < 5) {
        return null;
    }
    // ID sanitization (guarantee unique non-empty ID)
    const id = typeof obj.id === 'string' && obj.id.trim().length > 0
        ? obj.id.trim()
        : `ct_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
    // Category fallback
    const category = VALID_CATEGORIES.includes(obj.category)
        ? obj.category
        : 'Other';
    // Status fallback
    const status = obj.status === 'inactive' ? 'inactive' : 'active';
    // Tags sanitization
    let tags = undefined;
    if (Array.isArray(obj.tags)) {
        tags = obj.tags
            .filter((t) => typeof t === 'string' && t.trim().length > 0)
            .map((t) => t.trim());
    }
    else if (typeof obj.tags === 'string' && obj.tags.trim().length > 0) {
        tags = obj.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
    }
    return {
        id,
        fullName: rawName,
        phoneNumber: rawPhone,
        email: typeof obj.email === 'string' && obj.email.trim().length > 0 ? obj.email.trim() : undefined,
        age: typeof obj.age === 'number' && obj.age > 0 && obj.age < 130 ? obj.age : undefined,
        company: typeof obj.company === 'string' && obj.company.trim().length > 0
            ? obj.company.trim()
            : undefined,
        jobTitle: typeof obj.jobTitle === 'string' && obj.jobTitle.trim().length > 0
            ? obj.jobTitle.trim()
            : undefined,
        address: typeof obj.address === 'string' && obj.address.trim().length > 0
            ? obj.address.trim()
            : undefined,
        category,
        status,
        isFavourite: Boolean(obj.isFavourite),
        notes: typeof obj.notes === 'string' && obj.notes.trim().length > 0 ? obj.notes.trim() : undefined,
        tags: tags && tags.length > 0 ? tags : undefined,
        birthday: typeof obj.birthday === 'string' ? obj.birthday.trim() : undefined,
        reminderDate: typeof obj.reminderDate === 'string' ? obj.reminderDate.trim() : undefined,
        activities: Array.isArray(obj.activities)
            ? obj.activities
            : undefined,
        createdAt: typeof obj.createdAt === 'string' && obj.createdAt ? obj.createdAt : new Date().toISOString(),
        updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined
    };
}
/**
 * Loads contacts from localStorage with automatic migration and deduplication.
 */
export function loadSavedContacts() {
    try {
        let rawData = localStorage.getItem(STORAGE_KEY);
        // Migration: check legacy storage key if primary is empty
        if (!rawData) {
            const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
            if (legacyData) {
                rawData = legacyData;
                localStorage.setItem(STORAGE_KEY, legacyData);
            }
        }
        if (!rawData) {
            saveContactsToStorage(SEED_CONTACTS);
            return [...SEED_CONTACTS];
        }
        const parsed = JSON.parse(rawData);
        if (!Array.isArray(parsed)) {
            console.warn('Storage data is not an array, falling back to seed contacts.');
            return [...SEED_CONTACTS];
        }
        const seenIds = new Set();
        const validContacts = [];
        parsed.forEach((item, index) => {
            const sanitized = sanitizeContactRecord(item, index);
            if (sanitized) {
                // Prevent duplicate IDs from breaking internal indexing
                if (seenIds.has(sanitized.id)) {
                    sanitized.id = `ct_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
                }
                seenIds.add(sanitized.id);
                validContacts.push(sanitized);
            }
        });
        return validContacts.length > 0 ? validContacts : [...SEED_CONTACTS];
    }
    catch (error) {
        console.error('Failed to load contacts from localStorage:', error);
        return [...SEED_CONTACTS];
    }
}
/**
 * Saves contacts to localStorage safely.
 */
export function saveContactsToStorage(contacts) {
    try {
        const serialized = JSON.stringify(contacts);
        localStorage.setItem(STORAGE_KEY, serialized);
        return true;
    }
    catch (error) {
        console.error('Failed to save contacts to localStorage:', error);
        return false;
    }
}
/**
 * Clears stored contacts.
 */
export function clearStoredContacts() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    }
    catch (error) {
        console.error('Failed to clear contacts from localStorage:', error);
    }
}
