import { sortByField } from './calculations.js';
// Error 1: Incorrect type assignment (Literal union violation)
// 'Cryptocurrency' is not assignable to ExpenseCategory
const invalidCategory = 'Cryptocurrency';
// Error 2: Invalid property access on Discriminated Union
// Accessing 'notes' or unknown property on strongly typed ExpenseFilterOptions
const filter = {
    type: 'expense',
    category: 'Food & Dining'
};
// TS2339: Property 'nonExistentFilter' does not exist on type 'ExpenseFilterOptions'
console.log(filter.nonExistentFilter);
// Error 3: Incorrect generic argument / keyof constraint violation
// sortByField requires K extends keyof T. 'invalidProp' is not keyof Expense
const sampleList = [];
sortByField(sampleList, 'invalidProp');
console.log(invalidCategory);
