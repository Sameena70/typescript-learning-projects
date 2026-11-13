import { Expense, ImportResult, TransactionType } from './types.js';
import { ExpenseValidator } from './validation.js';

/**
 * Handles Promise-based asynchronous file operations for JSON and CSV import/export.
 */
export class ExpenseImportExport {
  /**
   * Generates a JSON file from expenses and triggers browser download.
   */
  public static exportToJSON(expenses: Expense[], filename = 'expenses-backup.json'): void {
    try {
      const dataStr = JSON.stringify(expenses, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      this.triggerDownload(blob, filename);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Export failed: ${error.message}`, { cause: error });
      }
      throw new Error('An unknown error occurred during export.', { cause: error });
    }
  }

  /**
   * Generates a CSV file from expenses and triggers browser download.
   */
  public static exportToCSV(expenses: Expense[], filename = 'expenses-export.csv'): void {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`CSV Export failed: ${error.message}`, { cause: error });
      }
      throw new Error('An unknown error occurred during CSV export.', { cause: error });
    }
  }

  /**
   * Reads and parses an uploaded JSON file.
   */
  public static readJSONFile(file: File): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        reject(new Error('Invalid file type. Please upload a valid JSON file.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const parsed: unknown = JSON.parse(content);
          resolve(parsed);
        } catch {
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
  public static readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve((reader.result as string) || '');
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
  public static async parseAndValidateImport(file: File): Promise<{
    validExpenses: Expense[];
    result: ImportResult;
  }> {
    const rawData = await this.readJSONFile(file);
    const validExpenses: Expense[] = [];
    const errors: string[] = [];
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

    rawData.forEach((item: unknown, index: number) => {
      if (ExpenseValidator.isValidExpenseObject(item)) {
        validExpenses.push({
          ...item,
          type: item.type || 'expense'
        });
      } else {
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
  }

  /**
   * Parses, validates, and imports transactions from a CSV string.
   */
  public static parseCSVContent(csvText: string): {
    validExpenses: Expense[];
    result: ImportResult;
  } {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const validExpenses: Expense[] = [];
    const errors: string[] = [];
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
      const cols = this.parseCSVLine(line);

      try {
        let typeVal: TransactionType = 'expense';
        let titleIdx = 1;
        let amountIdx = 2;
        let catIdx = 3;
        let dateIdx = 4;
        let notesIdx = 5;

        if (hasTypeCol) {
          typeVal = cols[1]?.toLowerCase() === 'income' ? 'income' : 'expense';
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

        const validation = ExpenseValidator.validateExpense({
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
            category: rawCategory as Expense['category'],
            date: rawDate,
            notes: rawNotes.trim() ? rawNotes.trim() : undefined,
            isRecurring: false
          });
        } else {
          skippedCount++;
          errors.push(`Line ${i + 1}: ${Object.values(validation.errors).join(', ')}`);
        }
      } catch (err: unknown) {
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

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  private static escapeCSVField(field: string): string {
    if (field.indexOf(',') !== -1 || field.indexOf('"') !== -1 || field.indexOf('\n') !== -1) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private static triggerDownload(blob: Blob, filename: string): void {
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
