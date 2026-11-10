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
 * Handles Promise-based asynchronous file operations for JSON and CSV import/export.
 */
export class ExpenseImportExport {
    /**
     * Generates a JSON file from expenses and triggers browser download.
     */
    static exportToJSON(expenses, filename = 'expenses-backup.json') {
        try {
            const dataStr = JSON.stringify(expenses, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            this.triggerDownload(blob, filename);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Export failed: ${error.message}`, { cause: error });
            }
            throw new Error('An unknown error occurred during export.', { cause: error });
        }
    }
    /**
     * Generates a CSV file from expenses and triggers browser download.
     */
    static exportToCSV(expenses, filename = 'expenses-export.csv') {
        try {
            const headers = ['ID', 'Type', 'Title', 'Amount', 'Category', 'Date', 'Notes', 'IsRecurring'];
            const rows = expenses.map((exp) => [
                this.escapeCSVField(exp.id),
                this.escapeCSVField(exp.type || 'expense'),
                this.escapeCSVField(exp.title),
                exp.amount.toString(),
                this.escapeCSVField(exp.category),
                this.escapeCSVField(exp.date),
                this.escapeCSVField(exp.notes || ''),
                exp.isRecurring ? 'true' : 'false'
            ]);
            const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            this.triggerDownload(blob, filename);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`CSV Export failed: ${error.message}`, { cause: error });
            }
            throw new Error('An unknown error occurred during CSV export.', { cause: error });
        }
    }
    /**
     * Reads and parses an uploaded JSON file.
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
                catch (_a) {
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
     * Reads an uploaded text file (such as CSV).
     */
    static readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result || '');
            };
            reader.onerror = () => {
                reject(new Error('Failed to read text file.'));
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
                    validItems.push(Object.assign(Object.assign({}, item), { type: item.type === 'income' ? 'income' : 'expense' }));
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
    /**
     * Parses, validates, and imports transactions from a CSV file.
     */
    static parseAndValidateCSV(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield this.readTextFile(file);
            const lines = this.splitCSVLines(text);
            if (lines.length < 2) {
                throw new Error('CSV file must have a header row and at least one data row.');
            }
            const headers = this.parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
            const validItems = [];
            const errors = [];
            let skippedCount = 0;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line)
                    continue;
                const columns = this.parseCSVLine(line);
                const rowObj = {};
                headers.forEach((header, index) => {
                    rowObj[header] = columns[index] !== undefined ? columns[index].trim() : '';
                });
                const title = rowObj['title'] || rowObj['description'] || '';
                const amount = parseFloat(rowObj['amount'] || '0');
                const category = (rowObj['category'] || 'Other');
                const date = rowObj['date'] || '';
                const notes = rowObj['notes'] || '';
                const rawType = (rowObj['type'] || 'expense').toLowerCase();
                const type = rawType === 'income' ? 'income' : 'expense';
                const isRecurring = rowObj['isrecurring'] === 'true';
                const validation = ExpenseValidator.validateExpense({
                    title,
                    amount,
                    category,
                    date,
                    type,
                    notes
                });
                if (validation.isValid) {
                    validItems.push({
                        id: rowObj['id'] || `csv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        title: title.trim(),
                        amount,
                        category,
                        date,
                        type,
                        notes: notes ? notes.trim() : undefined,
                        isRecurring
                    });
                }
                else {
                    skippedCount++;
                    errors.push(`Row ${i + 1}: ${Object.values(validation.errors).join(', ')}`);
                }
            }
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
    static triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    static escapeCSVField(field) {
        if (field.includes(',') ||
            field.includes('"') ||
            field.includes('\n') ||
            field.includes('\r')) {
            return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
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
                    i++; // handle CRLF
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
}
