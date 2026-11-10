var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ExpenseValidator } from './validation.js';
/**
 * Handles Promise-based asynchronous file operations for JSON import/export.
 */
export class ExpenseImportExport {
    /**
     * Generates a JSON file from expenses and triggers browser download.
     */
    static exportToJSON(expenses, filename = 'expenses-backup.json') {
        try {
            const dataStr = JSON.stringify(expenses, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Export failed: ${error.message}`);
            }
            throw new Error('An unknown error occurred during export.');
        }
    }
    /**
     * Asynchronously reads and parses an uploaded JSON file using Promise and FileReader.
     */
    static readJSONFile(file) {
        return new Promise((resolve, reject) => {
            if (!file.name.endsWith('.json') && file.type !== 'application/json') {
                reject(new Error('Invalid file type. Please upload a valid JSON file.'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const content = reader.result;
                    const parsed = JSON.parse(content);
                    resolve(parsed);
                }
                catch (error) {
                    reject(new Error('Malformed JSON: File contains invalid JSON syntax.'));
                }
            };
            reader.onerror = () => {
                reject(new Error('Failed to read the file from storage.'));
            };
            reader.readAsText(file);
        });
    }
    /**
     * Parses, validates, and filters imported JSON records.
     */
    static parseAndValidateImport(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawData = yield this.readJSONFile(file);
            if (!Array.isArray(rawData)) {
                throw new Error('Imported JSON root must be an array of expense objects.');
            }
            const validItems = [];
            const errors = [];
            let skippedCount = 0;
            rawData.forEach((item, index) => {
                if (ExpenseValidator.isValidExpenseObject(item)) {
                    validItems.push(item);
                }
                else {
                    skippedCount++;
                    errors.push(`Record #${index + 1} is invalid or missing required fields.`);
                }
            });
            return {
                validItems,
                importResult: {
                    success: validItems.length > 0,
                    importedCount: validItems.length,
                    skippedCount,
                    errors
                }
            };
        });
    }
}
