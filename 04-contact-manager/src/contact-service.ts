/**
 * contact-service.ts
 * 
 * In-memory state and business operations for Contacts:
 * CRUD (Create, Read, Update, Delete), filtering, searching,
 * sorting, and CSV parsing/exporting.
 */

import {
  Contact,
  ContactFormData,
  FilterOptions,
  ValidationResult,
  ContactCategory,
  ContactStatus,
} from "./types.js";
import {
  loadSavedContacts,
  saveContactsToStorage,
  clearStoredContacts,
} from "./storage.js";
import { validateContactForm } from "./validation.js";

// In-memory contacts array holding application state
let contacts: Contact[] = [];

/**
 * Initializes the service by loading contacts from storage.
 */
export function initializeContactService(): Contact[] {
  contacts = loadSavedContacts();
  return contacts;
}

/**
 * Returns all contacts.
 */
export function getAllContacts(): Contact[] {
  return contacts;
}

/**
 * Finds a single contact by unique ID using array find().
 */
export function getContactById(id: string): Contact | undefined {
  return contacts.find((c: Contact) => c.id === id);
}

/**
 * Helper to generate a unique ID.
 */
function generateUniqueId(): string {
  return "ct_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
}

/**
 * Adds a new contact after validation.
 */
export function addContact(formData: ContactFormData): {
  success: boolean;
  contact?: Contact;
  validation: ValidationResult;
} {
  const validation = validateContactForm(formData, contacts);
  if (!validation.isValid) {
    return { success: false, validation };
  }

  // Create new contact object
  const tagsList = formData.tags
    ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : undefined;

  const newContact: Contact = {
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
export function updateContact(
  id: string,
  formData: ContactFormData
): {
  success: boolean;
  contact?: Contact;
  validation: ValidationResult;
} {
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

  const tagsList = formData.tags
    ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : undefined;

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
  existingContact.tags = tagsList && tagsList.length > 0 ? tagsList : undefined;
  existingContact.birthday = formData.birthday.trim().length > 0 ? formData.birthday.trim() : undefined;
  existingContact.reminderDate = formData.reminderDate.trim().length > 0 ? formData.reminderDate.trim() : undefined;
  existingContact.updatedAt = new Date().toISOString();

  saveContactsToStorage(contacts);
  return { success: true, contact: existingContact, validation };
}

/**
 * Deletes a contact by ID using array filter().
 */
export function deleteContact(id: string): boolean {
  const initialLength = contacts.length;
  contacts = contacts.filter((c: Contact) => c.id !== id);
  const deleted = contacts.length < initialLength;
  if (deleted) {
    saveContactsToStorage(contacts);
  }
  return deleted;
}

/**
 * Toggles a contact's favourite status.
 */
export function toggleFavouriteStatus(id: string): boolean {
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
export function toggleContactStatus(id: string): ContactStatus | null {
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
export function clearAllContacts(): void {
  contacts = [];
  clearStoredContacts();
}

/**
 * Adds multiple contacts (e.g. from JSON import).
 */
export function addImportedContacts(newItems: Contact[]): void {
  contacts = [...newItems, ...contacts];
  saveContactsToStorage(contacts);
}

/**
 * Filters, searches, and sorts contacts according to filter options.
 * Demonstrates filter(), map(), and sort() array methods.
 */
export function getFilteredContacts(options: FilterOptions): Contact[] {
  let result = [...contacts];

  // 1. Text Search across Name, Phone, Email, Company, and Tags
  const query = options.searchQuery.trim().toLowerCase();
  if (query.length > 0) {
    result = result.filter((c: Contact) => {
      const matchName = c.fullName.toLowerCase().includes(query);
      const matchPhone = c.phoneNumber.toLowerCase().includes(query);
      const matchEmail = c.email ? c.email.toLowerCase().includes(query) : false;
      const matchCompany = c.company ? c.company.toLowerCase().includes(query) : false;
      const matchTags = c.tags ? c.tags.some(t => t.toLowerCase().includes(query)) : false;
      return matchName || matchPhone || matchEmail || matchCompany || matchTags;
    });
  }

  // 2. Filter by Category
  if (options.category !== "all") {
    result = result.filter((c: Contact) => c.category === options.category);
  }

  // 3. Filter by Status (active/inactive)
  if (options.status !== "all") {
    result = result.filter((c: Contact) => c.status === options.status);
  }

  // 4. Filter by Favourites
  if (options.favouritesOnly) {
    result = result.filter((c: Contact) => c.isFavourite);
  }

  // 5. Sorting
  result.sort((a: Contact, b: Contact) => {
    let comparison = 0;

    if (options.sortField === "name") {
      comparison = a.fullName.localeCompare(b.fullName);
    } else if (options.sortField === "company") {
      const compA = a.company ?? "";
      const compB = b.company ?? "";
      comparison = compA.localeCompare(compB);
    } else if (options.sortField === "createdAt") {
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
export function exportContactsToCSV(): string {
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

  const escapeCSV = (value: string | number | boolean | undefined): string => {
    if (value === undefined || value === null) {
      return '""';
    }
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = contacts.map((c: Contact) => {
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
export function importContactsFromCSV(csvText: string): {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
} {
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
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (insideQuotes && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const validCategories: ContactCategory[] = [
    "Family",
    "Friends",
    "Work",
    "Clients",
    "Business",
    "Other",
  ];

  let importedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];
  const newContactsToAdd: Contact[] = [];

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

    const fullName = rowValues[offset] ?? "";
    const phoneNumber = rowValues[offset + 1] ?? "";
    const email = rowValues[offset + 2] ?? "";
    const ageStr = rowValues[offset + 3] ?? "";
    const company = rowValues[offset + 4] ?? "";
    const jobTitle = rowValues[offset + 5] ?? "";
    const address = rowValues[offset + 6] ?? "";
    const categoryRaw = rowValues[offset + 7] ?? "Other";
    const statusRaw = rowValues[offset + 8] ?? "active";
    const favRaw = rowValues[offset + 9] ?? "false";
    const notes = rowValues[offset + 10] ?? "";

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
    let category: ContactCategory = "Other";
    if (validCategories.includes(categoryRaw as ContactCategory)) {
      category = categoryRaw as ContactCategory;
    }

    // Status fallback
    const status: ContactStatus = statusRaw.toLowerCase() === "inactive" ? "inactive" : "active";
    const isFavourite = favRaw.toLowerCase() === "true";

    // Age validation
    let age: number | undefined = undefined;
    if (ageStr.length > 0) {
      const parsedAge = Number(ageStr);
      if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge < 130) {
        age = parsedAge;
      }
    }

    // Check duplicate phone in current list or freshly parsed list
    const cleanPhone = phoneNumber.replace(/[\s\-()]/g, "");
    const isDuplicate = [...contacts, ...newContactsToAdd].some(
      (c) => c.phoneNumber.replace(/[\s\-()]/g, "") === cleanPhone
    );

    if (isDuplicate) {
      errors.push(`Row ${rowIndex + 1}: Duplicate phone number (${phoneNumber}) skipped.`);
      skippedCount++;
      continue;
    }

    const importedContact: Contact = {
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

