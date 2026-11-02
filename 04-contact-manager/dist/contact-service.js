/**
 * contact-service.ts
 *
 * In-memory state and business operations for Contacts:
 * CRUD (Create, Read, Update, Delete), filtering, searching,
 * sorting, and CSV parsing/exporting.
 */
import { loadSavedContacts, saveContactsToStorage, clearStoredContacts, } from "./storage.js";
import { validateContactForm } from "./validation.js";
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
    return contacts;
}
/**
 * Finds a single contact by unique ID using array find().
 */
export function getContactById(id) {
    return contacts.find((c) => c.id === id);
}
/**
 * Helper to generate a unique ID.
 */
function generateUniqueId() {
    return "ct_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
}
/**
 * Adds a new contact after validation.
 */
export function addContact(formData) {
    const validation = validateContactForm(formData, contacts);
    if (!validation.isValid) {
        return { success: false, validation };
    }
    // Create new contact object
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
        createdAt: new Date().toISOString(),
    };
    // Add to in-memory array
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
                errors: { general: "Contact not found." },
            },
        };
    }
    const validation = validateContactForm(formData, contacts, id);
    if (!validation.isValid) {
        return { success: false, validation };
    }
    // Update contact fields
    existingContact.fullName = formData.fullName.trim();
    existingContact.phoneNumber = formData.phoneNumber.trim();
    existingContact.email = formData.email.trim().length > 0 ? formData.email.trim() : undefined;
    existingContact.age = formData.age.trim().length > 0 ? Number(formData.age.trim()) : undefined;
    existingContact.company = formData.company.trim().length > 0 ? formData.company.trim() : undefined;
    existingContact.jobTitle = formData.jobTitle.trim().length > 0 ? formData.jobTitle.trim() : undefined;
    existingContact.address = formData.address.trim().length > 0 ? formData.address.trim() : undefined;
    existingContact.category = formData.category;
    existingContact.status = formData.status;
    existingContact.isFavourite = formData.isFavourite;
    existingContact.notes = formData.notes.trim().length > 0 ? formData.notes.trim() : undefined;
    existingContact.updatedAt = new Date().toISOString();
    saveContactsToStorage(contacts);
    return { success: true, contact: existingContact, validation };
}
/**
 * Deletes a contact by ID using array filter().
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
    contact.status = contact.status === "active" ? "inactive" : "active";
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
 * Filters, searches, and sorts contacts according to filter options.
 * Demonstrates filter(), map(), and sort() array methods.
 */
export function getFilteredContacts(options) {
    let result = [...contacts];
    // 1. Text Search across Name, Phone, Email, Company
    const query = options.searchQuery.trim().toLowerCase();
    if (query.length > 0) {
        result = result.filter((c) => {
            const matchName = c.fullName.toLowerCase().includes(query);
            const matchPhone = c.phoneNumber.toLowerCase().includes(query);
            const matchEmail = c.email ? c.email.toLowerCase().includes(query) : false;
            const matchCompany = c.company ? c.company.toLowerCase().includes(query) : false;
            return matchName || matchPhone || matchEmail || matchCompany;
        });
    }
    // 2. Filter by Category
    if (options.category !== "all") {
        result = result.filter((c) => c.category === options.category);
    }
    // 3. Filter by Status (active/inactive)
    if (options.status !== "all") {
        result = result.filter((c) => c.status === options.status);
    }
    // 4. Filter by Favourites
    if (options.favouritesOnly) {
        result = result.filter((c) => c.isFavourite);
    }
    // 5. Sorting
    result.sort((a, b) => {
        var _a, _b;
        let comparison = 0;
        if (options.sortField === "name") {
            comparison = a.fullName.localeCompare(b.fullName);
        }
        else if (options.sortField === "company") {
            const compA = (_a = a.company) !== null && _a !== void 0 ? _a : "";
            const compB = (_b = b.company) !== null && _b !== void 0 ? _b : "";
            comparison = compA.localeCompare(compB);
        }
        else if (options.sortField === "createdAt") {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            comparison = timeA - timeB;
        }
        return options.sortOrder === "asc" ? comparison : -comparison;
    });
    return result;
}
/**
 * Exports contacts into a CSV string.
 * Demonstrates map() to transform Contact objects into formatted CSV lines.
 */
export function exportContactsToCSV() {
    const headers = [
        "ID",
        "Full Name",
        "Phone Number",
        "Email",
        "Age",
        "Company",
        "Job Title",
        "Address",
        "Category",
        "Status",
        "Is Favourite",
        "Notes",
        "Created At",
    ];
    const escapeCSV = (value) => {
        if (value === undefined || value === null) {
            return '""';
        }
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
    };
    const rows = contacts.map((c) => {
        return [
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
            escapeCSV(c.notes),
            escapeCSV(c.createdAt),
        ].join(",");
    });
    return [headers.join(","), ...rows].join("\r\n");
}
/**
 * Validates and imports contacts from a CSV text string.
 * Ensures data integrity without corrupting existing records.
 */
export function importContactsFromCSV(csvText) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
        return {
            success: false,
            importedCount: 0,
            skippedCount: 0,
            errors: ["CSV file is empty or missing headers."],
        };
    }
    // Helper to parse CSV line respecting quotes
    const parseCSVLine = (text) => {
        const result = [];
        let current = "";
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
            else if (char === "," && !insideQuotes) {
                result.push(current.trim());
                current = "";
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };
    const validCategories = [
        "Family",
        "Friends",
        "Work",
        "Clients",
        "Business",
        "Other",
    ];
    let importedCount = 0;
    let skippedCount = 0;
    const errors = [];
    const newContactsToAdd = [];
    // Iterate over data rows (skipping header)
    for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
        const rowValues = parseCSVLine(lines[rowIndex]);
        // Expect at least Name, Phone, Category
        if (rowValues.length < 3) {
            errors.push(`Row ${rowIndex + 1}: Insufficient columns.`);
            skippedCount++;
            continue;
        }
        // Try detecting whether column 0 is ID or Full Name
        let offset = 0;
        if (rowValues[0].startsWith("ct_") || rowValues[0].startsWith("seed-")) {
            offset = 1; // has ID column
        }
        const fullName = (_a = rowValues[offset]) !== null && _a !== void 0 ? _a : "";
        const phoneNumber = (_b = rowValues[offset + 1]) !== null && _b !== void 0 ? _b : "";
        const email = (_c = rowValues[offset + 2]) !== null && _c !== void 0 ? _c : "";
        const ageStr = (_d = rowValues[offset + 3]) !== null && _d !== void 0 ? _d : "";
        const company = (_e = rowValues[offset + 4]) !== null && _e !== void 0 ? _e : "";
        const jobTitle = (_f = rowValues[offset + 5]) !== null && _f !== void 0 ? _f : "";
        const address = (_g = rowValues[offset + 6]) !== null && _g !== void 0 ? _g : "";
        const categoryRaw = (_h = rowValues[offset + 7]) !== null && _h !== void 0 ? _h : "Other";
        const statusRaw = (_j = rowValues[offset + 8]) !== null && _j !== void 0 ? _j : "active";
        const favRaw = (_k = rowValues[offset + 9]) !== null && _k !== void 0 ? _k : "false";
        const notes = (_l = rowValues[offset + 10]) !== null && _l !== void 0 ? _l : "";
        if (!fullName || fullName.length < 2) {
            errors.push(`Row ${rowIndex + 1}: Invalid or missing Full Name.`);
            skippedCount++;
            continue;
        }
        if (!phoneNumber || phoneNumber.length < 7) {
            errors.push(`Row ${rowIndex + 1}: Invalid or missing Phone Number.`);
            skippedCount++;
            continue;
        }
        // Category fallback
        let category = "Other";
        if (validCategories.includes(categoryRaw)) {
            category = categoryRaw;
        }
        // Status fallback
        const status = statusRaw.toLowerCase() === "inactive" ? "inactive" : "active";
        const isFavourite = favRaw.toLowerCase() === "true";
        // Age validation
        let age = undefined;
        if (ageStr.length > 0) {
            const parsedAge = Number(ageStr);
            if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge < 130) {
                age = parsedAge;
            }
        }
        // Check duplicate phone in current list or freshly parsed list
        const cleanPhone = phoneNumber.replace(/[\s\-()]/g, "");
        const isDuplicate = [...contacts, ...newContactsToAdd].some((c) => c.phoneNumber.replace(/[\s\-()]/g, "") === cleanPhone);
        if (isDuplicate) {
            errors.push(`Row ${rowIndex + 1}: Duplicate phone number (${phoneNumber}) skipped.`);
            skippedCount++;
            continue;
        }
        const importedContact = {
            id: generateUniqueId(),
            fullName,
            phoneNumber,
            email: email.length > 0 ? email : undefined,
            age,
            company: company.length > 0 ? company : undefined,
            jobTitle: jobTitle.length > 0 ? jobTitle : undefined,
            address: address.length > 0 ? address : undefined,
            category,
            status,
            isFavourite,
            notes: notes.length > 0 ? notes : undefined,
            createdAt: new Date().toISOString(),
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
        errors,
    };
}
