/**
 * import-export.ts
 * 
 * Manages Promise-based asynchronous file operations for JSON and CSV import/export.
 */

import { Contact, ImportSummary, ContactCategory, ContactStatus } from "./types.js";
import { isValidEmail, isValidPhoneNumber, findDuplicateContact } from "./validation.js";

export class ContactImportExport {
  /**
   * Exports contacts to a downloadable JSON file.
   */
  public static exportToJSON(contacts: Contact[], filename = "contacts-backup.json"): void {
    const jsonStr = JSON.stringify(contacts, null, 2);
    this.downloadFile(jsonStr, filename, "application/json");
  }

  /**
   * Asynchronously reads and parses an uploaded JSON file using Promise and FileReader.
   */
  public static readJSONFile(file: File): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith(".json") && file.type !== "application/json") {
        reject(new Error("Please upload a valid .json file."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const parsed = JSON.parse(content);
          resolve(parsed);
        } catch {
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
  public static async parseAndValidateJSON(
    file: File,
    existingContacts: Contact[]
  ): Promise<{ validContacts: Contact[]; summary: ImportSummary }> {
    const rawData = await this.readJSONFile(file);

    if (!Array.isArray(rawData)) {
      throw new Error("Invalid structure: JSON root must be an array of contacts.");
    }

    const validContacts: Contact[] = [];
    const errors: string[] = [];
    let skippedCount = 0;

    const validCategories: ContactCategory[] = ["Family", "Friends", "Work", "Clients", "Business", "Other"];

    rawData.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`Item #${index + 1}: Not a valid contact object.`);
        skippedCount++;
        return;
      }

      const c = item as Record<string, unknown>;

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

      const category = validCategories.includes(c.category as ContactCategory)
        ? (c.category as ContactCategory)
        : "Other";

      const status: ContactStatus = c.status === "inactive" ? "inactive" : "active";

      const contact: Contact = {
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
  }

  /**
   * Helper to trigger browser file download.
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
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

