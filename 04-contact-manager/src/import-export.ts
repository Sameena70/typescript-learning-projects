/**
 * import-export.ts
 *
 * Manages Promise-based asynchronous file operations for JSON and CSV import/export.
 * Provides schema validation, duplicate detection, and defensive error isolation.
 * Decomposes static utilities into pure exported functions with a backward-compatible facade.
 */

import { Contact, ImportSummary, ContactCategory, ContactStatus } from './types.js';
import { isValidEmail, isValidPhoneNumber, findDuplicateContact } from './validation.js';
import { VALID_CATEGORIES, sanitizeContactRecord } from './storage.js';
import { parseCSVLine, escapeCSVField, splitCSVRecords } from './utils/csv-utils.js';

export { parseCSVLine, escapeCSVField, splitCSVRecords };

/**
 * Helper to trigger browser file download.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports contacts to a downloadable JSON file.
 */
export function exportToJSON(contacts: Contact[], filename = 'contacts-backup.json'): void {
  const jsonStr = JSON.stringify(contacts, null, 2);
  downloadFile(jsonStr, filename, 'application/json');
}

/**
 * Asynchronously reads and parses an uploaded JSON file using Promise and FileReader.
 */
export function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      reject(new Error('Please upload a valid .json file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = reader.result as string;
        const parsed: unknown = JSON.parse(content);
        resolve(parsed);
      } catch {
        reject(new Error('Malformed JSON: The uploaded file could not be parsed.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read JSON file.'));
    reader.readAsText(file);
  });
}

/**
 * Reads plain text file (e.g. CSV).
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read text file.'));
    reader.readAsText(file);
  });
}

/**
 * Imports contacts from JSON with full schema validation and duplicate detection.
 */
export async function parseAndValidateJSON(
  file: File,
  existingContacts: Contact[]
): Promise<{ validContacts: Contact[]; summary: ImportSummary }> {
  const rawData = await readJSONFile(file);

  if (!Array.isArray(rawData)) {
    throw new Error('Invalid structure: JSON root must be an array of contacts.');
  }

  const validContacts: Contact[] = [];
  const errors: string[] = [];
  let skippedCount = 0;

  rawData.forEach((item: unknown, index: number) => {
    const sanitized = sanitizeContactRecord(item, index);
    if (!sanitized) {
      errors.push(`Item #${index + 1}: Invalid or incomplete contact record.`);
      skippedCount++;
      return;
    }

    const duplicate = findDuplicateContact(sanitized.phoneNumber, sanitized.email, [
      ...existingContacts,
      ...validContacts
    ]);

    if (duplicate) {
      errors.push(
        `Item #${index + 1} (${sanitized.fullName}): Duplicate record (already exists as ${duplicate.fullName}).`
      );
      skippedCount++;
      return;
    }

    validContacts.push(sanitized);
  });

  return {
    validContacts,
    summary: {
      success: validContacts.length > 0,
      importedCount: validContacts.length,
      skippedCount,
      errors
    }
  };
}

/**
 * Generates an RFC-compliant CSV string from a contacts list.
 */
export function formatContactsToCSV(contacts: Contact[]): string {
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
    'Notes',
    'Tags',
    'Birthday',
    'Reminder Date',
    'Created At'
  ];

  const rows = contacts.map((c) => [
    escapeCSVField(c.id),
    escapeCSVField(c.fullName),
    escapeCSVField(c.phoneNumber),
    escapeCSVField(c.email || ''),
    escapeCSVField(c.age !== undefined ? c.age.toString() : ''),
    escapeCSVField(c.company || ''),
    escapeCSVField(c.jobTitle || ''),
    escapeCSVField(c.address || ''),
    escapeCSVField(c.category),
    escapeCSVField(c.status),
    escapeCSVField(c.isFavourite ? 'true' : 'false'),
    escapeCSVField(c.notes || ''),
    escapeCSVField(c.tags ? c.tags.join('; ') : ''),
    escapeCSVField(c.birthday || ''),
    escapeCSVField(c.reminderDate || ''),
    escapeCSVField(c.createdAt)
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Exports contacts to a downloadable CSV file.
 */
export function exportToCSV(contacts: Contact[], filename = 'contacts-export.csv'): void {
  const csvContent = formatContactsToCSV(contacts);
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Parses CSV string into contact items.
 */
export function parseCSVContent(
  csvText: string,
  existingContacts: Contact[]
): { validContacts: Contact[]; summary: ImportSummary } {
  const lines = splitCSVRecords(csvText);
  const validContacts: Contact[] = [];
  const errors: string[] = [];
  let skippedCount = 0;

  if (lines.length < 2) {
    return {
      validContacts: [],
      summary: {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['CSV file is empty or missing data rows.']
      }
    };
  }

  // Skip header line (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseCSVLine(line);

    const fullName = (cols[1] || cols[0] || '').trim();
    const phoneNumber = (cols[2] || cols[1] || '').trim();
    const email = (cols[3] || '').trim();

    if (fullName.length < 2 || !isValidPhoneNumber(phoneNumber)) {
      errors.push(`Row ${i + 1}: Name or Phone Number invalid.`);
      skippedCount++;
      continue;
    }

    if (email.length > 0 && !isValidEmail(email)) {
      errors.push(`Row ${i + 1}: Invalid email address "${email}".`);
      skippedCount++;
      continue;
    }

    const duplicate = findDuplicateContact(phoneNumber, email || undefined, [
      ...existingContacts,
      ...validContacts
    ]);

    if (duplicate) {
      errors.push(`Row ${i + 1}: Duplicate record (already exists as "${duplicate.fullName}").`);
      skippedCount++;
      continue;
    }

    const rawCategory = (cols[8] || 'Other').trim();
    const category: ContactCategory =
      VALID_CATEGORIES.indexOf(rawCategory as ContactCategory) !== -1
        ? (rawCategory as ContactCategory)
        : 'Other';

    const rawStatus = (cols[9] || 'active').trim().toLowerCase();
    const status: ContactStatus = rawStatus === 'inactive' ? 'inactive' : 'active';

    const ageNum = parseInt(cols[4] || '', 10);
    const age = !isNaN(ageNum) && ageNum > 0 && ageNum < 120 ? ageNum : undefined;

    const rawTags = (cols[12] || '').trim();
    const tags =
      rawTags.length > 0
        ? rawTags
            .split(';')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : undefined;

    const contact: Contact = {
      id: cols[0]?.trim() || `ct_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      fullName,
      phoneNumber,
      email: email.length > 0 ? email : undefined,
      age,
      company: cols[5]?.trim() || undefined,
      jobTitle: cols[6]?.trim() || undefined,
      address: cols[7]?.trim() || undefined,
      category,
      status,
      isFavourite: cols[10]?.trim().toLowerCase() === 'true',
      notes: cols[11]?.trim() || undefined,
      tags,
      birthday: cols[13]?.trim() || undefined,
      reminderDate: cols[14]?.trim() || undefined,
      createdAt: cols[15]?.trim() || new Date().toISOString()
    };

    validContacts.push(contact);
  }

  return {
    validContacts,
    summary: {
      success: validContacts.length > 0,
      importedCount: validContacts.length,
      skippedCount,
      errors
    }
  };
}

/**
 * Backward compatibility facade.
 */
export class ContactImportExport {
  public static exportToJSON(contacts: Contact[], filename = 'contacts-backup.json'): void {
    exportToJSON(contacts, filename);
  }

  public static readJSONFile(file: File): Promise<unknown> {
    return readJSONFile(file);
  }

  public static readTextFile(file: File): Promise<string> {
    return readTextFile(file);
  }

  public static parseAndValidateJSON(
    file: File,
    existingContacts: Contact[]
  ): Promise<{ validContacts: Contact[]; summary: ImportSummary }> {
    return parseAndValidateJSON(file, existingContacts);
  }

  public static exportToCSV(contacts: Contact[], filename = 'contacts-export.csv'): void {
    exportToCSV(contacts, filename);
  }

  public static parseCSVContent(
    csvText: string,
    existingContacts: Contact[]
  ): { validContacts: Contact[]; summary: ImportSummary } {
    return parseCSVContent(csvText, existingContacts);
  }
}
