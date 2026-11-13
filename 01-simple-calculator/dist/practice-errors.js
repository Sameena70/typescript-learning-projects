import { StorageService } from './storage.js';
// Error 1: Incorrect type assignment
// Assigning a string that is not in the Operator literal union '+' | '-' | '*' | '/' | '%'
const invalidOp = '**';
// Error 2: Invalid property access on Discriminated Union
// When status is 'error', expressionToSave is undefined or not accessible as valid expression
const sampleOutcome = {
    status: 'error',
    error: 'Cannot divide by zero'
};
// TS2339: Property 'nonExistentField' does not exist on type 'CalculationOutcome'.
console.log(sampleOutcome.nonExistentField);
// Error 3: Incorrect generic argument / function argument
// StorageService.getItem requires fallback of type T
// Here we specify <number> but provide a fallback string "zero"
const storedValue = StorageService.getItem('test_key', "zero");
console.log(storedValue, invalidOp);
