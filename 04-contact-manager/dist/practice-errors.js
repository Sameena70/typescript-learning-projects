import { searchByFields } from './generic-utils.js';
// Error 1: Incorrect type assignment (Intersection type required property violation)
// Contact is an intersection type requiring BaseContact (id, fullName, phoneNumber)
// Here phoneNumber is omitted
const incompleteContact = {
    id: 'c100',
    fullName: 'Arjun Mehta',
    category: 'Work',
    status: 'active',
    isFavourite: false,
    createdAt: new Date().toISOString()
};
// Error 2: Invalid property access on Discriminated Union
// When ContactActivity has type 'note', durationMinutes or subject does not exist
const sampleNote = {
    id: 'act_1',
    contactId: 'c100',
    type: 'note',
    date: '2026-11-13',
    notes: 'Follow up later'
};
// TS2339: Property 'durationMinutes' does not exist on type '{ id: string; contactId: string; type: "note"; date: string; notes: string; }'
console.log(sampleNote.durationMinutes);
// Error 3: Incorrect generic argument / keyof T constraint violation
// searchByFields requires searchableKeys: (keyof T)[]
// 'unknownField' is not a property of Contact
const contactsList = [];
searchByFields(contactsList, 'search query', ['unknownField']);
console.log(incompleteContact);
