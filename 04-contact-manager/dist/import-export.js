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
     * Exports contacts to a RFC-compliant CSV string.
     */
    static exportToCSV(contacts, filename = 'contacts-export.csv') {
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
            this.escapeCSVField(c.id),
            this.escapeCSVField(c.fullName),
            this.escapeCSVField(c.phoneNumber),
            this.escapeCSVField(c.email || ''),
            this.escapeCSVField(c.age !== undefined ? c.age.toString() : ''),
            this.escapeCSVField(c.company || ''),
            this.escapeCSVField(c.jobTitle || ''),
            this.escapeCSVField(c.address || ''),
            this.escapeCSVField(c.category),
            this.escapeCSVField(c.status),
            this.escapeCSVField(c.isFavourite ? 'true' : 'false'),
            this.escapeCSVField(c.notes || ''),
            this.escapeCSVField(c.tags ? c.tags.join('; ') : ''),
            this.escapeCSVField(c.birthday || ''),
            this.escapeCSVField(c.reminderDate || ''),
            this.escapeCSVField(c.createdAt)
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    }
    /**
     * Parses CSV string into contact items.
     */
    static parseCSVContent(csvText, existingContacts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
        const validContacts = [];
        const errors = [];
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
            const cols = this.parseCSVLine(line);
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
            const category = VALID_CATEGORIES.indexOf(rawCategory) !== -1
                ? rawCategory
                : 'Other';
            const rawStatus = (cols[9] || 'active').trim().toLowerCase();
            const status = rawStatus === 'inactive' ? 'inactive' : 'active';
            const ageNum = parseInt(cols[4] || '', 10);
            const age = !isNaN(ageNum) && ageNum > 0 && ageNum < 120 ? ageNum : undefined;
            const rawTags = (cols[12] || '').trim();
            const tags = rawTags.length > 0
                ? rawTags
                    .split(';')
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0)
                : undefined;
            const contact = {
                id: ((_a = cols[0]) === null || _a === void 0 ? void 0 : _a.trim()) || `ct_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
                fullName,
                phoneNumber,
                email: email.length > 0 ? email : undefined,
                age,
                company: ((_b = cols[5]) === null || _b === void 0 ? void 0 : _b.trim()) || undefined,
                jobTitle: ((_c = cols[6]) === null || _c === void 0 ? void 0 : _c.trim()) || undefined,
                address: ((_d = cols[7]) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
                category,
                status,
                isFavourite: ((_e = cols[10]) === null || _e === void 0 ? void 0 : _e.trim().toLowerCase()) === 'true',
                notes: ((_f = cols[11]) === null || _f === void 0 ? void 0 : _f.trim()) || undefined,
                tags,
                birthday: ((_g = cols[13]) === null || _g === void 0 ? void 0 : _g.trim()) || undefined,
                reminderDate: ((_h = cols[14]) === null || _h === void 0 ? void 0 : _h.trim()) || undefined,
                createdAt: ((_j = cols[15]) === null || _j === void 0 ? void 0 : _j.trim()) || new Date().toISOString()
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
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // skip escaped quote
                }
                else {
                    inQuotes = !inQuotes;
                }
            }
            else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }
    static escapeCSVField(val) {
        if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1 || val.indexOf('\n') !== -1) {
            return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
    }
    static downloadFile(content, filename, mimeType) {
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
}
