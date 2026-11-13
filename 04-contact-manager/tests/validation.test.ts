import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidPhoneNumber,
  isValidEmail,
  validateContactForm,
  findDuplicateContact
} from '../src/validation.js';
import {
  getContactById,
  addContact,
  updateContact,
  deleteContact,
  clearAllContacts,
  addContactActivity
} from '../src/contact-service.js';
import { calculateContactStatistics } from '../src/statistics.js';
import { isContact } from '../src/storage.js';
import { searchByFields, sortByKey, filterByFieldValue } from '../src/generic-utils.js';
import { Contact, ContactFormData } from '../src/types.js';

// Setup LocalStorage Mock
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createLocalStorageMock(),
    writable: true
  });
}

describe('Contact Manager Validation', () => {
  describe('Phone and Email format checks', () => {
    it('validates phone numbers with digits, plus, hyphens and parentheses', () => {
      expect(isValidPhoneNumber('+91 98765 43210')).toBe(true);
      expect(isValidPhoneNumber('1234567')).toBe(true);
      expect(isValidPhoneNumber('12345')).toBe(false); // under 7 chars
      expect(isValidPhoneNumber('abc-def-ghij')).toBe(false);
    });

    it('validates emails correctly and treats empty string as valid optional field', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.in')).toBe(true);
      expect(isValidEmail('')).toBe(true); // optional
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('missing@tld')).toBe(false);
    });
  });

  describe('Duplicate contact detection', () => {
    const existing: Contact[] = [
      {
        id: 'c1',
        fullName: 'Jane Doe',
        phoneNumber: '+91 9876543210',
        email: 'jane@example.com',
        category: 'Work',
        status: 'active',
        isFavourite: false,
        createdAt: new Date().toISOString()
      }
    ];

    it('detects duplicate by matching cleaned phone number', () => {
      const dup = findDuplicateContact('+91-98765-43210', 'other@example.com', existing);
      expect(dup).toBeDefined();
      expect(dup?.id).toBe('c1');
    });

    it('detects duplicate by matching case-insensitive email', () => {
      const dup = findDuplicateContact('+91 11111 22222', 'JANE@EXAMPLE.COM', existing);
      expect(dup).toBeDefined();
      expect(dup?.id).toBe('c1');
    });

    it('excludes current editing ID from duplicate check', () => {
      const dup = findDuplicateContact('+91 9876543210', 'jane@example.com', existing, 'c1');
      expect(dup).toBeUndefined();
    });
  });

  describe('Full form validation', () => {
    const emptyContacts: Contact[] = [];

    it('passes for valid complete form data', () => {
      const formData: ContactFormData = {
        fullName: 'Rahul Sharma',
        phoneNumber: '+91 98765 12345',
        email: 'rahul.s@example.com',
        age: '28',
        company: 'Innovate Labs',
        jobTitle: 'Product Manager',
        address: 'MG Road, Bengaluru',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        notes: 'Important stakeholder',
        tags: 'Product, Tech',
        birthday: '1996-05-15',
        reminderDate: '2026-12-01'
      };

      const result = validateContactForm(formData, emptyContacts);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('fails when full name or phone number is missing or invalid', () => {
      const invalidData: ContactFormData = {
        fullName: '',
        phoneNumber: '123',
        email: 'invalid-email',
        age: '-5',
        company: '',
        jobTitle: '',
        address: '',
        category: 'Work',
        status: 'active',
        isFavourite: false,
        notes: '',
        tags: '',
        birthday: '',
        reminderDate: ''
      };

      const result = validateContactForm(invalidData, emptyContacts);
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBeDefined();
      expect(result.errors.phoneNumber).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.age).toBeDefined();
    });
  });
});

describe('Generic Utilities (Search, Sort, and Predicate Filtering)', () => {
  const sampleContacts: Contact[] = [
    {
      id: '1',
      fullName: 'Alice Walker',
      phoneNumber: '+1 555-1234',
      company: 'Zeta Corp',
      category: 'Work',
      status: 'active',
      isFavourite: true,
      tags: ['Executive', 'Design'],
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      fullName: 'Bob Smith',
      phoneNumber: '+1 555-5678',
      company: 'Alpha Inc',
      category: 'Friends',
      status: 'inactive',
      isFavourite: false,
      tags: ['College'],
      createdAt: '2026-02-01T00:00:00.000Z'
    }
  ];

  it('searches contacts generically across multiple fields', () => {
    const foundByCompany = searchByFields(sampleContacts, 'Zeta', ['company', 'fullName']);
    expect(foundByCompany).toHaveLength(1);
    expect(foundByCompany[0].fullName).toBe('Alice Walker');

    const foundByTag = searchByFields(sampleContacts, 'College', ['tags', 'fullName']);
    expect(foundByTag).toHaveLength(1);
    expect(foundByTag[0].fullName).toBe('Bob Smith');
  });

  it('sorts contacts generically by string key in asc and desc order', () => {
    const sortedAsc = sortByKey(sampleContacts, 'fullName', 'asc');
    expect(sortedAsc[0].fullName).toBe('Alice Walker');

    const sortedDesc = sortByKey(sampleContacts, 'fullName', 'desc');
    expect(sortedDesc[0].fullName).toBe('Bob Smith');
  });

  it('filters contacts generically by field value', () => {
    const active = filterByFieldValue(sampleContacts, 'status', 'active');
    expect(active).toHaveLength(1);
    expect(active[0].fullName).toBe('Alice Walker');
  });

  it('narrows unknown objects safely using isContact custom type guard', () => {
    expect(isContact(sampleContacts[0])).toBe(true);
    expect(isContact({ broken: true })).toBe(false);
    expect(isContact(null)).toBe(false);
  });
});

describe('ContactService (CRUD, Activities, and Filtering)', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAllContacts();
  });

  it('adds, updates, and deletes contacts safely', () => {
    const formData: ContactFormData = {
      fullName: 'Aman Singh',
      phoneNumber: '+91 99999 88888',
      email: 'aman@example.com',
      age: '30',
      company: 'Tech',
      jobTitle: 'Developer',
      address: '',
      category: 'Work',
      status: 'active',
      isFavourite: false,
      notes: '',
      tags: 'Tech, Senior',
      birthday: '',
      reminderDate: ''
    };

    const addRes = addContact(formData);
    expect(addRes.success).toBe(true);
    expect(addRes.contact?.id).toBeDefined();

    const id = addRes.contact!.id;
    const updated = updateContact(id, {
      ...formData,
      company: 'Tech Solutions'
    });
    expect(updated.success).toBe(true);
    expect(getContactById(id)?.company).toBe('Tech Solutions');

    expect(deleteContact(id)).toBe(true);
    expect(getContactById(id)).toBeUndefined();
  });

  it('adds typed activity log to a contact using discriminated activity model', () => {
    const addRes = addContact({
      fullName: 'Pooja Hegde',
      phoneNumber: '+91 77777 66666',
      email: 'pooja@example.com',
      age: '',
      company: '',
      jobTitle: '',
      address: '',
      category: 'Clients',
      status: 'active',
      isFavourite: false,
      notes: '',
      tags: '',
      birthday: '',
      reminderDate: ''
    });

    const contactId = addRes.contact!.id;
    const act = addContactActivity(contactId, {
      type: 'call',
      date: '2026-11-13',
      notes: 'Initial discovery call.'
    });

    expect(act).not.toBeNull();
    expect(act?.type).toBe('call');
    expect(getContactById(contactId)?.activities).toHaveLength(1);
  });

  it('calculates dashboard statistics accurately', () => {
    const contacts: Contact[] = [
      {
        id: '1',
        fullName: 'C1',
        phoneNumber: '1111111',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        reminderDate: '2026-12-01',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        fullName: 'C2',
        phoneNumber: '2222222',
        category: 'Family',
        status: 'inactive',
        isFavourite: false,
        createdAt: new Date().toISOString()
      }
    ];

    const stats = calculateContactStatistics(contacts);
    expect(stats.total).toBe(2);
    expect(stats.active).toBe(1);
    expect(stats.inactive).toBe(1);
    expect(stats.favourites).toBe(1);
    expect(stats.withReminders).toBe(1);
    expect(stats.categoryCounts.Work).toBe(1);
    expect(stats.categoryCounts.Family).toBe(1);
  });
});
