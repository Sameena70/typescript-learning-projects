var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { validateExpense, isValidExpenseObject } from './validation.js';
/**
 * Handles Promise-based asynchronous file operations for JSON and CSV import/export.
 * Pure utility functions with backward-compatible class facade.
 */
/**
 * Escapes a field for CSV export.
 */
export function escapeCSVField(field) {
    if (field.indexOf(',') !== -1 || field.indexOf('"') !== -1 || field.indexOf('\n') !== -1) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}
/**
 * Parses a single CSV line handling quotes.
 */
export function parseCSVLine(line) {
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
 * Triggers a browser file download using Blob and ObjectURL.
 */
export function triggerDownload(blob, filename) {
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
 * Generates a JSON file from expenses and triggers browser download.
 */
export function exportToJSON(expenses, filename = 'expenses-backup.json') {
    try {
        const dataStr = JSON.stringify(expenses, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        triggerDownload(blob, filename);
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
export function exportToCSV(expenses, filename = 'expenses-export.csv') {
    try {
        const headers = ['ID', 'Type', 'Title', 'Amount', 'Category', 'Date', 'Notes', 'IsRecurring'];
        const rows = expenses.map((exp) => [
            escapeCSVField(exp.id),
            escapeCSVField(exp.type || 'expense'),
            escapeCSVField(exp.title),
            exp.amount.toString(),
            escapeCSVField(exp.category),
            escapeCSVField(exp.date),
            escapeCSVField(exp.notes || ''),
            exp.isRecurring ? 'true' : 'false'
        ]);
        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, filename);
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
export function readJSONFile(file) {
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
export function readTextFile(file) {
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
export function parseAndValidateImport(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawData = yield readJSONFile(file);
        const validExpenses = [];
        const errors = [];
        let skippedCount = 0;
        if (!Array.isArray(rawData)) {
            return {
                validExpenses: [],
                result: {
                    success: false,
                    importedCount: 0,
                    skippedCount: 1,
                    errors: ['JSON file content is not an array of transactions.']
                }
            };
        }
        rawData.forEach((item, index) => {
            if (isValidExpenseObject(item)) {
                validExpenses.push(Object.assign(Object.assign({}, item), { type: item.type || 'expense' }));
            }
            else {
                skippedCount++;
                errors.push(`Row/Record #${index + 1} does not meet schema validation requirements.`);
            }
        });
        return {
            validExpenses,
            result: {
                success: validExpenses.length > 0,
                importedCount: validExpenses.length,
                skippedCount,
                errors
            }
        };
    });
}
/**
 * Parses, validates, and imports transactions from a CSV string.
 */
export function parseCSVContent(csvText) {
    var _a;
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const validExpenses = [];
    const errors = [];
    let skippedCount = 0;
    if (lines.length < 2) {
        return {
            validExpenses: [],
            result: {
                success: false,
                importedCount: 0,
                skippedCount: 0,
                errors: ['CSV file is empty or missing headers.']
            }
        };
    }
    const header = lines[0].toLowerCase();
    const hasTypeCol = header.indexOf('type') !== -1;
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = parseCSVLine(line);
        try {
            let typeVal = 'expense';
            let titleIdx = 1;
            let amountIdx = 2;
            let catIdx = 3;
            let dateIdx = 4;
            let notesIdx = 5;
            if (hasTypeCol) {
                typeVal = ((_a = cols[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'income' ? 'income' : 'expense';
                titleIdx = 2;
                amountIdx = 3;
                catIdx = 4;
                dateIdx = 5;
                notesIdx = 6;
            }
            const rawTitle = cols[titleIdx];
            const rawAmount = parseFloat(cols[amountIdx]);
            const rawCategory = cols[catIdx];
            const rawDate = cols[dateIdx];
            const rawNotes = cols[notesIdx] || '';
            const validation = validateExpense({
                title: rawTitle,
                amount: rawAmount,
                type: typeVal,
                category: rawCategory,
                date: rawDate,
                notes: rawNotes
            });
            if (validation.isValid) {
                validExpenses.push({
                    id: cols[0] || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    title: rawTitle.trim(),
                    amount: rawAmount,
                    type: typeVal,
                    category: rawCategory,
                    date: rawDate,
                    notes: rawNotes.trim() ? rawNotes.trim() : undefined,
                    isRecurring: false
                });
            }
            else {
                skippedCount++;
                errors.push(`Line ${i + 1}: ${Object.values(validation.errors).join(', ')}`);
            }
        }
        catch (err) {
            skippedCount++;
            const msg = err instanceof Error ? err.message : 'Unknown parse error';
            errors.push(`Line ${i + 1}: ${msg}`);
        }
    }
    return {
        validExpenses,
        result: {
            success: validExpenses.length > 0,
            importedCount: validExpenses.length,
            skippedCount,
            errors
        }
    };
}
/**
 * Backward-compatible facade class.
 */
export class ExpenseImportExport {
}
ExpenseImportExport.exportToJSON = exportToJSON;
ExpenseImportExport.exportToCSV = exportToCSV;
ExpenseImportExport.readJSONFile = readJSONFile;
ExpenseImportExport.readTextFile = readTextFile;
ExpenseImportExport.parseAndValidateImport = parseAndValidateImport;
ExpenseImportExport.parseCSVContent = parseCSVContent;
