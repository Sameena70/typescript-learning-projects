/**
 * contact-service.ts
 *
 * Encapsulated state and business operations for Contacts:
 * CRUD (Create, Read, Update, Delete), generic searching, filtering,
 * sorting, duplicate detection, and tag/activity management.
 *
 * Employs constructor Dependency Injection with IContactRepository and defensive copying.
 */
import { defaultContactRepository } from './storage.js';
import { VALID_CATEGORIES } from './generic-utils.js';
import { validateContactForm, findDuplicateContact } from './validation.js';
import { searchByFields, sortByKey, filterByPredicate } from './generic-utils.js';
export class ContactService {
    constructor(repository = defaultContactRepository) {
        this.contacts = [];
        this.repository = repository;
        this.init();
    }
    init() {
        this.contacts = this.repository.loadContacts();
        return this.getAllContacts();
    }
    /**
     * Returns a safe defensive copy of all contacts.
     */
    getAllContacts() {
        return this.contacts.map((c) => (Object.assign(Object.assign({}, c), { tags: c.tags ? [...c.tags] : undefined, activities: c.activities ? c.activities.map((a) => (Object.assign({}, a))) : undefined })));
    }
    /**
     * Finds a single contact by unique ID, returning a defensive copy if found.
     */
    getContactById(id) {
        const found = this.contacts.find((c) => c.id === id);
        if (!found)
            return undefined;
        return Object.assign(Object.assign({}, found), { tags: found.tags ? [...found.tags] : undefined, activities: found.activities ? found.activities.map((a) => (Object.assign({}, a))) : undefined });
    }
    /**
     * Generates a unique contact identifier.
     */
    generateUniqueId() {
        return 'ct_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    }
    /**
     * Adds a new contact after validation and duplicate checks.
     */
    addContact(formData) {
        var _a;
        const validation = validateContactForm(formData, this.contacts);
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
            id: this.generateUniqueId(),
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
            avatarUrl: ((_a = formData.avatarUrl) === null || _a === void 0 ? void 0 : _a.trim()) || undefined,
            birthday: formData.birthday.trim().length > 0 ? formData.birthday.trim() : undefined,
            reminderDate: formData.reminderDate.trim().length > 0 ? formData.reminderDate.trim() : undefined,
            createdAt: new Date().toISOString()
        };
        this.contacts.unshift(newContact);
        this.repository.saveContacts(this.contacts);
        return {
            success: true,
            contact: Object.assign(Object.assign({}, newContact), { tags: newContact.tags ? [...newContact.tags] : undefined }),
            validation
        };
    }
    /**
     * Updates an existing contact by ID.
     */
    updateContact(id, formData) {
        const target = this.contacts.find((c) => c.id === id);
        if (!target) {
            return {
                success: false,
                validation: {
                    isValid: false,
                    errors: { general: 'Contact not found.' }
                }
            };
        }
        const validation = validateContactForm(formData, this.contacts, id);
        if (!validation.isValid) {
            return { success: false, validation };
        }
        const tagsList = formData.tags
            ? formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
            : undefined;
        target.fullName = formData.fullName.trim();
        target.phoneNumber = formData.phoneNumber.trim();
        target.email = formData.email.trim().length > 0 ? formData.email.trim() : undefined;
        target.age = formData.age.trim().length > 0 ? Number(formData.age.trim()) : undefined;
        target.company = formData.company.trim().length > 0 ? formData.company.trim() : undefined;
        target.jobTitle = formData.jobTitle.trim().length > 0 ? formData.jobTitle.trim() : undefined;
        target.address = formData.address.trim().length > 0 ? formData.address.trim() : undefined;
        target.category = formData.category;
        target.status = formData.status;
        target.isFavourite = formData.isFavourite;
        target.notes = formData.notes.trim().length > 0 ? formData.notes.trim() : undefined;
        target.tags = tagsList && tagsList.length > 0 ? tagsList : undefined;
        if (formData.avatarUrl !== undefined) {
            target.avatarUrl = formData.avatarUrl.trim() || undefined;
        }
        target.birthday = formData.birthday.trim().length > 0 ? formData.birthday.trim() : undefined;
        target.reminderDate =
            formData.reminderDate.trim().length > 0 ? formData.reminderDate.trim() : undefined;
        target.updatedAt = new Date().toISOString();
        this.repository.saveContacts(this.contacts);
        return {
            success: true,
            contact: Object.assign(Object.assign({}, target), { tags: target.tags ? [...target.tags] : undefined }),
            validation
        };
    }
    /**
     * Logs an interaction/activity for a contact using discriminated union.
     */
    addContactActivity(contactId, activity) {
        const contact = this.contacts.find((c) => c.id === contactId);
        if (!contact)
            return null;
        if (!contact.activities) {
            contact.activities = [];
        }
        const newActivity = Object.assign(Object.assign({}, activity), { id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, contactId });
        contact.activities.unshift(newActivity);
        contact.updatedAt = new Date().toISOString();
        this.repository.saveContacts(this.contacts);
        return Object.assign({}, newActivity);
    }
    /**
     * Deletes a contact by ID.
     */
    deleteContact(id) {
        const initialLength = this.contacts.length;
        this.contacts = this.contacts.filter((c) => c.id !== id);
        const deleted = this.contacts.length < initialLength;
        if (deleted) {
            this.repository.saveContacts(this.contacts);
        }
        return deleted;
    }
    /**
     * Toggles a contact's favourite status.
     */
    toggleFavouriteStatus(id) {
        const contact = this.contacts.find((c) => c.id === id);
        if (!contact) {
            return false;
        }
        contact.isFavourite = !contact.isFavourite;
        contact.updatedAt = new Date().toISOString();
        this.repository.saveContacts(this.contacts);
        return contact.isFavourite;
    }
    /**
     * Toggles a contact's active/inactive status.
     */
    toggleContactStatus(id) {
        const contact = this.contacts.find((c) => c.id === id);
        if (!contact) {
            return null;
        }
        contact.status = contact.status === 'active' ? 'inactive' : 'active';
        contact.updatedAt = new Date().toISOString();
        this.repository.saveContacts(this.contacts);
        return contact.status;
    }
    /**
     * Clears all contacts.
     */
    clearAllContacts() {
        this.contacts = [];
        this.repository.clearContacts();
    }
    /**
     * Adds multiple contacts safely checking for ID conflicts.
     */
    addImportedContacts(newItems) {
        const existingIds = new Set(this.contacts.map((c) => c.id));
        const sanitizedItems = [];
        newItems.forEach((c) => {
            let finalId = c.id;
            if (existingIds.has(finalId)) {
                finalId = this.generateUniqueId();
            }
            existingIds.add(finalId);
            sanitizedItems.push(Object.assign(Object.assign({}, c), { id: finalId }));
        });
        this.contacts = [...sanitizedItems, ...this.contacts];
        this.repository.saveContacts(this.contacts);
    }
    /**
     * Detects possible duplicate contacts in the list.
     */
    findPotentialDuplicates() {
        const duplicates = [];
        const checked = new Set();
        for (let i = 0; i < this.contacts.length; i++) {
            const a = this.contacts[i];
            if (checked.has(a.id))
                continue;
            for (let j = i + 1; j < this.contacts.length; j++) {
                const b = this.contacts[j];
                const matchPhone = a.phoneNumber.replace(/[^0-9]/g, '') === b.phoneNumber.replace(/[^0-9]/g, '');
                const matchEmail = a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase();
                const matchName = a.fullName.toLowerCase() === b.fullName.toLowerCase();
                if (matchPhone || matchEmail || matchName) {
                    duplicates.push({
                        contact: Object.assign({}, b),
                        duplicateOf: Object.assign({}, a)
                    });
                    checked.add(b.id);
                }
            }
        }
        return duplicates;
    }
    /**
     * Returns a list of all distinct tags across all contacts.
     */
    getAllTags() {
        const tagsSet = new Set();
        this.contacts.forEach((c) => {
            if (c.tags) {
                c.tags.forEach((t) => tagsSet.add(t));
            }
        });
        return Array.from(tagsSet).sort();
    }
    /**
     * Filters, searches, and sorts contacts using generic search and filter functions.
     */
    getFilteredContacts(options) {
        let result = this.getAllContacts();
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
    exportContactsToCSV() {
        const headers = ['Full Name', 'Phone Number', 'Email', 'Category', 'Status', 'Is Favourite'];
        const rows = this.contacts.map((c) => [
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
    importContactsFromCSV(csvText) {
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
            const dup = findDuplicateContact(phoneNumber, email, [...this.contacts, ...validContacts]);
            if (dup) {
                errors.push(`Line ${i + 1}: Duplicate phone/email (${fullName}).`);
                skippedCount++;
                continue;
            }
            validContacts.push({
                id: this.generateUniqueId(),
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
            this.contacts = [...validContacts, ...this.contacts];
            this.repository.saveContacts(this.contacts);
        }
        return {
            success: validContacts.length > 0,
            importedCount: validContacts.length,
            skippedCount,
            errors
        };
    }
}
/**
 * Default singleton service instance for application & backward compatibility.
 */
export const defaultContactService = new ContactService();
// ========================================================
// Backward Compatibility Facade Functions
// ========================================================
export function initializeContactService() {
    return defaultContactService.init();
}
export function getAllContacts() {
    return defaultContactService.getAllContacts();
}
export function getContactById(id) {
    return defaultContactService.getContactById(id);
}
export function addContact(formData) {
    return defaultContactService.addContact(formData);
}
export function updateContact(id, formData) {
    return defaultContactService.updateContact(id, formData);
}
export function addContactActivity(contactId, activity) {
    return defaultContactService.addContactActivity(contactId, activity);
}
export function deleteContact(id) {
    return defaultContactService.deleteContact(id);
}
export function toggleFavouriteStatus(id) {
    return defaultContactService.toggleFavouriteStatus(id);
}
export function toggleContactStatus(id) {
    return defaultContactService.toggleContactStatus(id);
}
export function clearAllContacts() {
    defaultContactService.clearAllContacts();
}
export function addImportedContacts(newItems) {
    defaultContactService.addImportedContacts(newItems);
}
export function findPotentialDuplicates() {
    return defaultContactService.findPotentialDuplicates();
}
export function getAllTags() {
    return defaultContactService.getAllTags();
}
export function getFilteredContacts(options) {
    return defaultContactService.getFilteredContacts(options);
}
export function exportContactsToCSV() {
    return defaultContactService.exportContactsToCSV();
}
export function importContactsFromCSV(csvText) {
    return defaultContactService.importContactsFromCSV(csvText);
}
