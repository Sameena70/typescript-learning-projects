/**
 * csv-utils.ts
 *
 * Dedicated CSV formatting, parsing, and escaping utilities.
 * Eliminates duplication across ContactService and ImportExport modules.
 * Fully supports RFC 4180 quote-aware record splitting and field parsing.
 */
/**
 * Splits raw CSV text into distinct logical records/rows, properly respecting
 * quoted fields that contain embedded newlines (\r\n or \n).
 */
export function splitCSVRecords(text) {
    const records = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                current += '""';
                i++; // skip escaped quote
            }
            else {
                inQuotes = !inQuotes;
                current += char;
            }
        }
        else if ((char === '\n' || (char === '\r' && text[i + 1] === '\n')) && !inQuotes) {
            if (char === '\r')
                i++; // Skip \r in \r\n
            if (current.trim().length > 0) {
                records.push(current);
            }
            current = '';
        }
        else {
            current += char;
        }
    }
    if (current.trim().length > 0) {
        records.push(current);
    }
    return records;
}
/**
 * Parses a single logical CSV record/line into array of field values.
 * Correctly extracts escaped double quotes ("") and unescapes field contents.
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
/**
 * Escapes a single string field for CSV representation per RFC 4180.
 * Wraps in double quotes if commas, quotes, or newlines are present.
 */
export function escapeCSVField(val) {
    if (val.indexOf(',') !== -1 ||
        val.indexOf('"') !== -1 ||
        val.indexOf('\n') !== -1 ||
        val.indexOf('\r') !== -1) {
        return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
}
