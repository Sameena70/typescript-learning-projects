/**
 * import-export.ts
 *
 * Manages Promise-based asynchronous file operations for JSON and CSV import/export.
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
import { isValidEmail, isValidPhoneNumber, findDuplicateContact } from "./validation.js";
export class ContactImportExport {
    /**
     * Exports contacts to a downloadable JSON file.
     */
    static exportToJSON(contacts, filename = "contacts-backup.json") {
        const jsonStr = JSON.stringify(contacts, null, 2);
        this.downloadFile(jsonStr, filename, "application/json");
    }
    /**
     * Asynchronously reads and parses an uploaded JSON file using Promise and FileReader.
     */
    static readJSONFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.name.endsWith(".json") && file.type !== "application/json") {
                reject(new Error("Please upload a valid .json file."));
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
                    reject(new Error("Malformed JSON: The uploaded file could not be parsed."));
                }
            };
            reader.onerror = () => reject(new Error("Failed to read JSON file."));
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
                throw new Error("Invalid structure: JSON root must be an array of contacts.");
            }
            const validContacts = [];
            const errors = [];
            let skippedCount = 0;
            const validCategories = ["Family", "Friends", "Work", "Clients", "Business", "Other"];
            rawData.forEach((item, index) => {
                if (!item || typeof item !== "object") {
                    errors.push(`Item #${index + 1}: Not a valid contact object.`);
                    skippedCount++;
                    return;
                }
                const c = item;
                if (typeof c.fullName !== "string" || c.fullName.trim().length < 2) {
                    errors.push(`Item #${index + 1}: Missing or invalid fullName.`);
                    skippedCount++;
                    return;
                }
                if (typeof c.phoneNumber !== "string" || !isValidPhoneNumber(c.phoneNumber)) {
                    errors.push(`Item #${index + 1} (${c.fullName}): Invalid phoneNumber.`);
                    skippedCount++;
                    return;
                }
                const email = typeof c.email === "string" && isValidEmail(c.email) ? c.email.trim() : undefined;
                const phone = c.phoneNumber.trim();
                // Check duplicates against existing and current batch
                const duplicate = findDuplicateContact(phone, email, [...existingContacts, ...validContacts]);
                if (duplicate) {
                    errors.push(`Item #${index + 1} (${c.fullName}): Duplicate record (already exists as ${duplicate.fullName}).`);
                    skippedCount++;
                    return;
                }
                const category = validCategories.includes(c.category)
                    ? c.category
                    : "Other";
                const status = c.status === "inactive" ? "inactive" : "active";
                const contact = {
                    id: typeof c.id === "string" ? c.id : `ct_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    fullName: c.fullName.trim(),
                    phoneNumber: phone,
                    email,
                    age: typeof c.age === "number" ? c.age : undefined,
                    company: typeof c.company === "string" ? c.company.trim() : undefined,
                    jobTitle: typeof c.jobTitle === "string" ? c.jobTitle.trim() : undefined,
                    address: typeof c.address === "string" ? c.address.trim() : undefined,
                    category,
                    status,
                    isFavourite: Boolean(c.isFavourite),
                    notes: typeof c.notes === "string" ? c.notes.trim() : undefined,
                    tags: Array.isArray(c.tags) ? c.tags.filter(t => typeof t === "string") : undefined,
                    birthday: typeof c.birthday === "string" ? c.birthday : undefined,
                    reminderDate: typeof c.reminderDate === "string" ? c.reminderDate : undefined,
                    createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date().toISOString()
                };
                validContacts.push(contact);
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
     * Helper to trigger browser file download.
     */
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
