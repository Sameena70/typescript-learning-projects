/**
 * contact-service.ts
 *
 * In-memory state and business operations for Contacts:
 * CRUD (Create, Read, Update, Delete), generic searching, filtering,
 * sorting, duplicate detection, and tag/activity management.
 */
import { loadSavedContacts, saveContactsToStorage, clearStoredContacts, VALID_CATEGORIES } from './storage.js';
import { validateContactForm, findDuplicateContact } from './validation.js';
import { searchByFields, sortByKey, filterByPredicate } from './generic-utils.js';
// In-memory contacts array holding application state
let contacts = [];
/**
 * Initializes the service by loading contacts from storage.
 */
export function initializeContactService() {
    contacts = loadSavedContacts();
    return contacts;
}
/**
 * Returns all contacts.
 */
export function getAllContacts() {
    return [...contacts];
}
/**
 * Finds a single contact by unique ID.
 */
export function getContactById(id) {
    return contacts.find((c) => c.id === id);
}
/**
 * Helper to generate a unique ID.
 */
function generateUniqueId() {
    return 'ct_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}
/**
 * Adds a new contact after validation.
 */
export function addContact(formData) {
    const validation = validateContactForm(formData, contacts);
    if (!validation.isValid) {
        return { success: false, validation };
    }
    const tagsList = formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : undefined;
    const newContact = {
        id: generateUniqueId(),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim().length > 0 ? formData.email.trim() : undefined,
        age: formData.age.trim().length > 0 ? Number(formData.age.trim()) : undefined,
        company: formData.company.trim().length > 0 ? formData.company.trim() : undefined,
        jobTitle: formData.jobTitle.trim().length > 0 ? formData.jobTitle.trim() : undefined,
        address: formData.address.trim().length > 0 ? formData.address.trim() : undefined,
        category: formData.category,
        status: formData.status,
        isFavourite: formData.isFavourite,
        notes: formData.notes.trim().length > 0 ? formData.notes.trim() : undefined,
        tags: tagsList && tagsList.length > 0 ? tagsList : undefined,
        birthday: formData.birthday.trim().length > 0 ? formData.birthday.trim() : undefined,
        reminderDate: formData.reminderDate.trim().length > 0 ? formData.reminderDate.trim() : undefined,
        createdAt: new Date().toISOString()
    };
    contacts.unshift(newContact);
    saveContactsToStorage(contacts);
    return { success: true, contact: newContact, validation };
}
/**
 * Updates an existing contact by ID.
 */
export function updateContact(id, formData) {
    const existingContact = getContactById(id);
    if (!existingContact) {
        return {
            success: false,
            validation: {
                isValid: false,
                errors: { general: 'Contact not found.' }
            }
        };
    }
    const validation = validateContactForm(formData, contacts, id);
    if (!validation.isValid) {
        return { success: false, validation };
    }
    const tagsList = formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : undefined;
    existingContact.fullName = formData.fullName.trim();
    existingContact.phoneNumber = formData.phoneNumber.trim();
    existingContact.email = formData.email.trim().length > 0 ? formData.email.trim() : undefined;
    existingContact.age = formData.age.trim().length > 0 ? Number(formData.age.trim()) : undefined;
    existingContact.company =
        formData.company.trim().length > 0 ? formData.company.trim() : undefined;
    existingContact.jobTitle =
        formData.jobTitle.trim().length > 0 ? formData.jobTitle.trim() : undefined;
    existingContact.address =
        formData.address.trim().length > 0 ? formData.address.trim() : undefined;
    existingContact.category = formData.category;
    existingContact.status = formData.status;
    existingContact.isFavourite = formData.isFavourite;
    existingContact.notes = formData.notes.trim().length > 0 ? formData.notes.trim() : undefined;
    existingContact.tags = tagsList && tagsList.length > 0 ? tagsList : undefined;
    existingContact.birthday =
        formData.birthday.trim().length > 0 ? formData.birthday.trim() : undefined;
    existingContact.reminderDate =
        formData.reminderDate.trim().length > 0 ? formData.reminderDate.trim() : undefined;
    existingContact.updatedAt = new Date().toISOString();
    saveContactsToStorage(contacts);
    return { success: true, contact: existingContact, validation };
}
/**
 * Logs an interaction/activity for a contact using discriminated union.
 */
export function addContactActivity(contactId, activity) {
    const contact = getContactById(contactId);
    if (!contact)
        return null;
    if (!contact.activities) {
        contact.activities = [];
    }
    const newActivity = Object.assign(Object.assign({}, activity), { id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, contactId });
    contact.activities.unshift(newActivity);
    contact.updatedAt = new Date().toISOString();
    saveContactsToStorage(contacts);
    return newActivity;
}
/**
 * Deletes a contact by ID.
 */
export function deleteContact(id) {
    const initialLength = contacts.length;
    contacts = contacts.filter((c) => c.id !== id);
    const deleted = contacts.length < initialLength;
    if (deleted) {
        saveContactsToStorage(contacts);
    }
    return deleted;
}
/**
 * Toggles a contact's favourite status.
 */
export function toggleFavouriteStatus(id) {
    const contact = getContactById(id);
    if (!contact) {
        return false;
    }
    contact.isFavourite = !contact.isFavourite;
    contact.updatedAt = new Date().toISOString();
    saveContactsToStorage(contacts);
    return contact.isFavourite;
}
/**
 * Toggles a contact's active/inactive status.
 */
export function toggleContactStatus(id) {
    const contact = getContactById(id);
    if (!contact) {
        return null;
    }
    contact.status = contact.status === 'active' ? 'inactive' : 'active';
    contact.updatedAt = new Date().toISOString();
    saveContactsToStorage(contacts);
    return contact.status;
}
/**
 * Clears all contacts.
 */
export function clearAllContacts() {
    contacts = [];
    clearStoredContacts();
}
/**
 * Adds multiple contacts safely checking for ID conflicts.
 */
export function addImportedContacts(newItems) {
    const existingIds = new Set(contacts.map((c) => c.id));
    const sanitizedItems = [];
    newItems.forEach((c) => {
        let finalId = c.id;
        if (existingIds.has(finalId)) {
            finalId = generateUniqueId();
        }
        existingIds.add(finalId);
        sanitizedItems.push(Object.assign(Object.assign({}, c), { id: finalId }));
    });
    contacts = [...sanitizedItems, ...contacts];
    saveContactsToStorage(contacts);
}
/**
 * Detects possible duplicate contacts in the list.
 */
export function findPotentialDuplicates() {
    const duplicates = [];
    const checked = new Set();
    for (let i = 0; i < contacts.length; i++) {
        const a = contacts[i];
        if (checked.has(a.id))
            continue;
        for (let j = i + 1; j < contacts.length; j++) {
            const b = contacts[j];
            const matchPhone = a.phoneNumber.replace(/[^0-9]/g, '') === b.phoneNumber.replace(/[^0-9]/g, '');
            const matchEmail = a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase();
            const matchName = a.fullName.toLowerCase() === b.fullName.toLowerCase();
            if (matchPhone || matchEmail || matchName) {
                duplicates.push({ contact: b, duplicateOf: a });
                checked.add(b.id);
            }
        }
    }
    return duplicates;
}
/**
 * Returns a list of all distinct tags across all contacts.
 */
export function getAllTags() {
    const tagsSet = new Set();
    contacts.forEach((c) => {
        if (c.tags) {
            c.tags.forEach((t) => tagsSet.add(t));
        }
    });
    return Array.from(tagsSet).sort();
}
/**
 * Filters, searches, and sorts contacts using generic search and filter functions.
 */
export function getFilteredContacts(options) {
    let result = [...contacts];
    // 1. Reusable Generic Search across Name, Phone, Email, Company, Notes, and Tags
    if (options.searchQuery.trim().length > 0) {
        result = searchByFields(result, options.searchQuery, [
            'fullName',
            'phoneNumber',
            'email',
            'company',
            'notes',
            'tags'
        ]);
    }
    // 2. Filter by Category
    if (options.category && options.category !== 'all') {
        result = filterByPredicate(result, (c) => c.category === options.category);
    }
    // 3. Filter by Status (active/inactive)
    if (options.status && options.status !== 'all') {
        result = filterByPredicate(result, (c) => c.status === options.status);
    }
    // 4. Filter by Favourites
    if (options.favouritesOnly) {
        result = filterByPredicate(result, (c) => c.isFavourite);
    }
    // 5. Filter by Tag
    if (options.tag && options.tag !== 'all') {
        result = filterByPredicate(result, (c) => Boolean(c.tags && c.tags.indexOf(options.tag) !== -1));
    }
    // 6. Sorting with type-safe generic helpers
    if (options.sortField === 'name') {
        result = sortByKey(result, 'fullName', options.sortOrder);
    }
    else if (options.sortField === 'company') {
        result = sortByKey(result, 'company', options.sortOrder);
    }
    else {
        // createdAt date sorting
        const multiplier = options.sortOrder === 'asc' ? 1 : -1;
        result.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return (timeA - timeB) * multiplier;
        });
    }
    return result;
}
/**
 * Exports contacts to CSV string format.
 */
export function exportContactsToCSV() {
    const headers = ['Full Name', 'Phone Number', 'Email', 'Category', 'Status', 'Is Favourite'];
    const rows = contacts.map((c) => [
        `"${c.fullName.replace(/"/g, '""')}"`,
        `"${c.phoneNumber.replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${c.status}"`,
        c.isFavourite ? 'true' : 'false'
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
/**
 * Backwards compatibility helper for CSV imports.
 */
export function importContactsFromCSV(csvText) {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
        return {
            success: false,
            importedCount: 0,
            skippedCount: 0,
            errors: ['CSV contains no data rows.']
        };
    }
    const validContacts = [];
    const errors = [];
    let skippedCount = 0;
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        const fullName = cols[0] || '';
        const phoneNumber = cols[1] || '';
        const email = cols[2] || undefined;
        const categoryRaw = cols[3] || 'Other';
        const category = VALID_CATEGORIES.indexOf(categoryRaw) !== -1
            ? categoryRaw
            : 'Other';
        if (fullName.length < 2 || phoneNumber.length < 5) {
            errors.push(`Line ${i + 1}: Name or phone number invalid.`);
            skippedCount++;
            continue;
        }
        const dup = findDuplicateContact(phoneNumber, email, [...contacts, ...validContacts]);
        if (dup) {
            errors.push(`Line ${i + 1}: Duplicate phone/email (${fullName}).`);
            skippedCount++;
            continue;
        }
        validContacts.push({
            id: generateUniqueId(),
            fullName,
            phoneNumber,
            email,
            category,
            status: 'active',
            isFavourite: false,
            createdAt: new Date().toISOString()
        });
    }
    if (validContacts.length > 0) {
        contacts = [...validContacts, ...contacts];
        saveContactsToStorage(contacts);
    }
    return {
        success: validContacts.length > 0,
        importedCount: validContacts.length,
        skippedCount,
        errors
    };
}
