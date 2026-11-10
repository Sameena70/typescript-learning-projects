/**
 * import-export.ts
 *
 * Manages Promise-based asynchronous file operations for JSON and CSV import/export.
 * Provides schema validation, duplicate detection, and defensive error isolation.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { isValidEmail, isValidPhoneNumber, findDuplicateContact } from './validation.js';
import { VALID_CATEGORIES, sanitizeContactRecord } from './storage.js';
export class ContactImportExport {
    /**
     * Exports contacts to a downloadable JSON file.
     */
    static exportToJSON(contacts, filename = 'contacts-backup.json') {
        const jsonStr = JSON.stringify(contacts, null, 2);
        this.downloadFile(jsonStr, filename, 'application/json');
    }
    /**
     * Asynchronously reads and parses an uploaded JSON file using Promise and FileReader.
     */
    static readJSONFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.name.endsWith('.json') && file.type !== 'application/json') {
                reject(new Error('Please upload a valid .json file.'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const content = reader.result;
                    const parsed = JSON.parse(content);
                    resolve(parsed);
                }
                catch (_a) {
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
    static readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || '');
            reader.onerror = () => reject(new Error('Failed to read text file.'));
            reader.readAsText(file);
        });
    }
    /**
     * Imports contacts from JSON with full schema validation and duplicate detection.
     */
    static parseAndValidateJSON(file, existingContacts) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawData = yield this.readJSONFile(file);
            if (!Array.isArray(rawData)) {
                throw new Error('Invalid structure: JSON root must be an array of contacts.');
            }
            const validContacts = [];
            const errors = [];
            let skippedCount = 0;
            rawData.forEach((item, index) => {
                const sanitized = sanitizeContactRecord(item, index);
                if (!sanitized) {
                    errors.push(`Item #${index + 1}: Invalid or incomplete contact record.`);
                    skippedCount++;
                    return;
                }
                // Check for duplicate phone or email against existing contacts and current batch
                const duplicate = findDuplicateContact(sanitized.phoneNumber, sanitized.email, [
                    ...existingContacts,
                    ...validContacts
                ]);
                if (duplicate) {
                    errors.push(`Item #${index + 1} (${sanitized.fullName}): Duplicate record (already exists as ${duplicate.fullName}).`);
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
        });
    }
    /**
     * Exports contacts into an RFC 4180 compliant CSV string.
     */
    static exportToCSV(contacts, filename = 'contacts-backup.csv') {
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
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    }
    /**
     * Parses an RFC 4180 CSV line into tokens.
     */
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let insideQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (insideQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip escaped quote
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
    }
    /**
     * Splits multi-line CSV respecting quotes.
     */
    static splitCSVLines(text) {
        const lines = [];
        let currentLine = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                if (inQuotes && text[i + 1] === '"') {
                    currentLine += '""';
                    i++;
                }
                else {
                    inQuotes = !inQuotes;
                    currentLine += '"';
                }
            }
            else if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && text[i + 1] === '\n') {
                    i++; // skip CRLF
                }
                lines.push(currentLine);
                currentLine = '';
            }
            else {
                currentLine += char;
            }
        }
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
        return lines;
    }
    /**
     * Imports contacts from a CSV file with validation and duplicate prevention.
     */
    static parseAndValidateCSV(file, existingContacts) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield this.readTextFile(file);
            const lines = this.splitCSVLines(text).filter((l) => l.trim().length > 0);
            if (lines.length < 2) {
                throw new Error('CSV file is empty or missing headers.');
            }
            const headers = this.parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const validContacts = [];
            const errors = [];
            let skippedCount = 0;
            for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
                const rowValues = this.parseCSVLine(lines[rowIndex]);
                if (rowValues.length < 2)
                    continue;
                const rowMap = {};
                headers.forEach((h, i) => {
                    rowMap[h] = rowValues[i] !== undefined ? rowValues[i] : '';
                });
                const fullName = rowMap['fullname'] || rowMap['name'] || rowValues[1] || '';
                const phoneNumber = rowMap['phonenumber'] || rowMap['phone'] || rowValues[2] || '';
                const email = rowMap['email'] || rowMap['emailaddress'] || rowValues[3] || '';
                const ageStr = rowMap['age'] || rowValues[4] || '';
                const company = rowMap['company'] || rowValues[5] || '';
                const jobTitle = rowMap['jobtitle'] || rowValues[6] || '';
                const address = rowMap['address'] || rowValues[7] || '';
                const categoryRaw = rowMap['category'] || rowValues[8] || 'Other';
                const statusRaw = rowMap['status'] || rowValues[9] || 'active';
                const favRaw = rowMap['isfavourite'] || rowMap['favourite'] || rowValues[10] || 'false';
                const tagsRaw = rowMap['tags'] || rowValues[11] || '';
                const birthday = rowMap['birthday'] || rowValues[12] || '';
                const reminderDate = rowMap['reminderdate'] || rowValues[13] || '';
                const notes = rowMap['notes'] || rowValues[14] || '';
                if (fullName.trim().length < 2) {
                    errors.push(`Row ${rowIndex + 1}: Missing or invalid Full Name.`);
                    skippedCount++;
                    continue;
                }
                if (!isValidPhoneNumber(phoneNumber)) {
                    errors.push(`Row ${rowIndex + 1} (${fullName}): Invalid phone number.`);
                    skippedCount++;
                    continue;
                }
                const validEmail = email.trim().length > 0 && isValidEmail(email) ? email.trim() : undefined;
                const cleanPhone = phoneNumber.trim();
                // Check duplicates against existing list and current batch
                const duplicate = findDuplicateContact(cleanPhone, validEmail, [
                    ...existingContacts,
                    ...validContacts
                ]);
                if (duplicate) {
                    errors.push(`Row ${rowIndex + 1} (${fullName}): Duplicate of existing contact "${duplicate.fullName}".`);
                    skippedCount++;
                    continue;
                }
                const category = VALID_CATEGORIES.includes(categoryRaw)
                    ? categoryRaw
                    : 'Other';
                const status = statusRaw.toLowerCase() === 'inactive' ? 'inactive' : 'active';
                const isFavourite = favRaw.toLowerCase() === 'true';
                let age = undefined;
                if (ageStr.trim().length > 0) {
                    const parsedAge = Number(ageStr);
                    if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge < 130) {
                        age = parsedAge;
                    }
                }
                const tags = tagsRaw
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0);
                const contact = {
                    id: `ct_${Date.now()}_${rowIndex}_${Math.random().toString(36).substring(2, 6)}`,
                    fullName: fullName.trim(),
                    phoneNumber: cleanPhone,
                    email: validEmail,
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
        });
    }
    /**
     * Helper to trigger browser file download.
     */
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
