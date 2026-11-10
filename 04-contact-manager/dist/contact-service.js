/**
 * contact-service.ts
 *
 * In-memory state and business operations for Contacts:
 * CRUD (Create, Read, Update, Delete), filtering, searching,
 * sorting, duplicate detection, and tag/activity management.
 */
import { loadSavedContacts, saveContactsToStorage, clearStoredContacts, VALID_CATEGORIES } from './storage.js';
import { validateContactForm, findDuplicateContact } from './validation.js';
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
 * Logs an interaction/activity for a contact.
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
 * Filters, searches, and sorts contacts according to filter options.
 */
export function getFilteredContacts(options) {
    let result = [...contacts];
    // 1. Text Search across Name, Phone, Email, Company, Notes, and Tags
    const query = options.searchQuery.trim().toLowerCase();
    if (query.length > 0) {
        result = result.filter((c) => {
            const matchName = c.fullName.toLowerCase().includes(query);
            const matchPhone = c.phoneNumber.toLowerCase().includes(query);
            const matchEmail = c.email ? c.email.toLowerCase().includes(query) : false;
            const matchCompany = c.company ? c.company.toLowerCase().includes(query) : false;
            const matchNotes = c.notes ? c.notes.toLowerCase().includes(query) : false;
            const matchTags = c.tags ? c.tags.some((t) => t.toLowerCase().includes(query)) : false;
            return matchName || matchPhone || matchEmail || matchCompany || matchNotes || matchTags;
        });
    }
    // 2. Filter by Category
    if (options.category && options.category !== 'all') {
        result = result.filter((c) => c.category === options.category);
    }
    // 3. Filter by Status (active/inactive)
    if (options.status && options.status !== 'all') {
        result = result.filter((c) => c.status === options.status);
    }
    // 4. Filter by Favourites
    if (options.favouritesOnly) {
        result = result.filter((c) => c.isFavourite);
    }
    // 5. Filter by Tag
    if (options.tag && options.tag !== 'all') {
        result = result.filter((c) => Boolean(c.tags && c.tags.includes(options.tag)));
    }
    // 6. Sorting
    result.sort((a, b) => {
        var _a, _b;
        let comparison = 0;
        if (options.sortField === 'name') {
            comparison = a.fullName.localeCompare(b.fullName);
        }
        else if (options.sortField === 'company') {
            const compA = (_a = a.company) !== null && _a !== void 0 ? _a : '';
            const compB = (_b = b.company) !== null && _b !== void 0 ? _b : '';
            comparison = compA.localeCompare(compB);
        }
        else if (options.sortField === 'createdAt') {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            comparison = timeA - timeB;
        }
        return options.sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
}
/**
 * Exports contacts into an RFC 4180 CSV string.
 */
export function exportContactsToCSV() {
    const headers = [
        'ID',
        'Full Name',
        'Phone Number',
        'Email',
        'Age',
        'Company',
        'Job Title',
        'Address',
        'Category',
        'Status',
        'Is Favourite',
        'Tags',
        'Birthday',
        'Reminder Date',
        'Notes',
        'Created At'
    ];
    const escapeCSV = (value) => {
        if (value === undefined || value === null) {
            return '""';
        }
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
    };
    const rows = contacts.map((c) => [
        escapeCSV(c.id),
        escapeCSV(c.fullName),
        escapeCSV(c.phoneNumber),
        escapeCSV(c.email),
        escapeCSV(c.age),
        escapeCSV(c.company),
        escapeCSV(c.jobTitle),
        escapeCSV(c.address),
        escapeCSV(c.category),
        escapeCSV(c.status),
        escapeCSV(c.isFavourite),
        escapeCSV(c.tags ? c.tags.join(', ') : ''),
        escapeCSV(c.birthday),
        escapeCSV(c.reminderDate),
        escapeCSV(c.notes),
        escapeCSV(c.createdAt)
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
/**
 * Validates and imports contacts from CSV text without replacing or corrupting valid existing contacts.
 */
export function importContactsFromCSV(csvText) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
        return {
            success: false,
            importedCount: 0,
            skippedCount: 0,
            errors: ['CSV file is empty or missing headers.']
        };
    }
    const parseCSVLine = (text) => {
        const result = [];
        let current = '';
        let insideQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                if (insideQuotes && text[i + 1] === '"') {
                    current += '"';
                    i++;
                }
                else {
                    insideQuotes = !insideQuotes;
                }
            }
            else if (char === ',' && !insideQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };
    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const newContactsToAdd = [];
    for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
        const rowValues = parseCSVLine(lines[rowIndex]);
        if (rowValues.length < 2)
            continue;
        let offset = 0;
        if (rowValues[0].startsWith('ct_') || rowValues[0].startsWith('seed-')) {
            offset = 1;
        }
        const fullName = (_a = rowValues[offset]) !== null && _a !== void 0 ? _a : '';
        const phoneNumber = (_b = rowValues[offset + 1]) !== null && _b !== void 0 ? _b : '';
        const email = (_c = rowValues[offset + 2]) !== null && _c !== void 0 ? _c : '';
        const ageStr = (_d = rowValues[offset + 3]) !== null && _d !== void 0 ? _d : '';
        const company = (_e = rowValues[offset + 4]) !== null && _e !== void 0 ? _e : '';
        const jobTitle = (_f = rowValues[offset + 5]) !== null && _f !== void 0 ? _f : '';
        const address = (_g = rowValues[offset + 6]) !== null && _g !== void 0 ? _g : '';
        const categoryRaw = (_h = rowValues[offset + 7]) !== null && _h !== void 0 ? _h : 'Other';
        const statusRaw = (_j = rowValues[offset + 8]) !== null && _j !== void 0 ? _j : 'active';
        const favRaw = (_k = rowValues[offset + 9]) !== null && _k !== void 0 ? _k : 'false';
        const tagsRaw = (_l = rowValues[offset + 10]) !== null && _l !== void 0 ? _l : '';
        const birthday = (_m = rowValues[offset + 11]) !== null && _m !== void 0 ? _m : '';
        const reminderDate = (_o = rowValues[offset + 12]) !== null && _o !== void 0 ? _o : '';
        const notes = (_p = rowValues[offset + 13]) !== null && _p !== void 0 ? _p : '';
        if (!fullName || fullName.length < 2) {
            errors.push(`Row ${rowIndex + 1}: Missing or invalid Full Name.`);
            skippedCount++;
            continue;
        }
        if (!phoneNumber || phoneNumber.length < 5) {
            errors.push(`Row ${rowIndex + 1} (${fullName}): Invalid phone number.`);
            skippedCount++;
            continue;
        }
        const duplicate = findDuplicateContact(phoneNumber, email, [...contacts, ...newContactsToAdd]);
        if (duplicate) {
            errors.push(`Row ${rowIndex + 1} (${fullName}): Duplicate contact ("${duplicate.fullName}").`);
            skippedCount++;
            continue;
        }
        const category = VALID_CATEGORIES.includes(categoryRaw)
            ? categoryRaw
            : 'Other';
        const status = statusRaw.toLowerCase() === 'inactive' ? 'inactive' : 'active';
        const isFavourite = favRaw.toLowerCase() === 'true';
        let age = undefined;
        if (ageStr.length > 0) {
            const parsedAge = Number(ageStr);
            if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge < 130) {
                age = parsedAge;
            }
        }
        const tags = tagsRaw
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        const importedContact = {
            id: generateUniqueId(),
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            email: email.trim().length > 0 ? email.trim() : undefined,
            age,
            company: company.trim().length > 0 ? company.trim() : undefined,
            jobTitle: jobTitle.trim().length > 0 ? jobTitle.trim() : undefined,
            address: address.trim().length > 0 ? address.trim() : undefined,
            category,
            status,
            isFavourite,
            tags: tags.length > 0 ? tags : undefined,
            birthday: birthday.trim().length > 0 ? birthday.trim() : undefined,
            reminderDate: reminderDate.trim().length > 0 ? reminderDate.trim() : undefined,
            notes: notes.trim().length > 0 ? notes.trim() : undefined,
            createdAt: new Date().toISOString()
        };
        newContactsToAdd.push(importedContact);
        importedCount++;
    }
    if (importedCount > 0) {
        contacts = [...newContactsToAdd, ...contacts];
        saveContactsToStorage(contacts);
    }
    return {
        success: importedCount > 0,
        importedCount,
        skippedCount,
        errors
    };
}
