import { filterRecordsByField } from './statistics.js';
// Error 1: Incorrect type assignment (Literal union violation)
// 'nightmare' is not assignable to DifficultyLevel ('easy' | 'medium' | 'hard' | 'custom')
const invalidDifficulty = 'nightmare';
// Error 2: Invalid property access on Discriminated Union
// When status is 'duplicate', 'hint' ('too-high' | 'too-low') does not exist
const duplicateOutcome = {
    status: 'duplicate',
    type: 'DUPLICATE',
    message: 'Already guessed',
    guess: 50,
    attemptsLeft: 5,
    isWon: false,
    isGameOver: false
};
// TS2339: Property 'hint' does not exist on type '{ status: "duplicate"; ... }'
console.log(duplicateOutcome.hint);
// Error 3: Incorrect generic argument / T[K] type mismatch
// filterRecordsByField(items, key, value): value must match T[K]
// Here key is 'won' (boolean), but we pass string 'yes'
const sampleRecords = [];
filterRecordsByField(sampleRecords, 'won', 'yes');
console.log(invalidDifficulty);
