import { Expense, ImportResult } from './types.js';
import { ExpenseValidator } from './validation.js';

/**
 * Handles Promise-based asynchronous file operations for JSON import/export.
 */
export class ExpenseImportExport {
  /**
   * Generates a JSON file from expenses and triggers browser download.
   */
  public static exportToJSON(expenses: Expense[], filename = 'expenses-backup.json'): void {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Export failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred during export.');
    }
  }

  /**
   * Asynchronously reads and parses an uploaded JSON file using Promise and FileReader.
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
          const parsed = JSON.parse(content);
          resolve(parsed);
        } catch (error: unknown) {
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
  public static async parseAndValidateImport(file: File): Promise<{
    validItems: Expense[];
    importResult: ImportResult;
  }> {
    const rawData = await this.readJSONFile(file);

    if (!Array.isArray(rawData)) {
      throw new Error('Imported JSON root must be an array of expense objects.');
    }

    const validItems: Expense[] = [];
    const errors: string[] = [];
    let skippedCount = 0;

    rawData.forEach((item, index) => {
      if (ExpenseValidator.isValidExpenseObject(item)) {
        validItems.push(item);
      } else {
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
  }
}

