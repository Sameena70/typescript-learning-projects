import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidPhoneNumber,
  isValidEmail,
  validateContactForm,
  findDuplicateContact
} from '../src/validation.js';
import {
  ContactService,
  getContactById,
  addContact,
  updateContact,
  deleteContact,
  clearAllContacts,
  addContactActivity
} from '../src/contact-service.js';
import { calculateContactStatistics } from '../src/statistics.js';
import {
  isContact,
  ContactRepository,
  STORAGE_KEY,
  sanitizeContactRecord
} from '../src/storage.js';
import { searchByFields, sortByKey, filterByFieldValue } from '../src/generic-utils.js';
import {
  Contact,
  ContactFormData,
  IContactRepository,
  IContactStorageDriver
} from '../src/types.js';
import { formatContactsToCSV, parseCSVContent } from '../src/import-export.js';

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

describe('Architecture & Design Verification (ContactService, DI, Storage Resilience, CSV)', () => {
  class InMemoryStorageDriver implements IContactStorageDriver {
    private store: Map<string, string> = new Map();

    public getItem(key: string): string | null {
      return this.store.get(key) ?? null;
    }

    public setItem(key: string, value: string): void {
      this.store.set(key, value);
    }

    public removeItem(key: string): void {
      this.store.delete(key);
    }

    public clear(): void {
      this.store.clear();
    }
  }

  class MockRepository implements IContactRepository {
    public contacts: Contact[] = [];
    public loadCalls = 0;
    public saveCalls = 0;

    public loadContacts(): Contact[] {
      this.loadCalls++;
      return [...this.contacts];
    }

    public saveContacts(newContacts: readonly Contact[]): boolean {
      this.saveCalls++;
      this.contacts = [...newContacts];
      return true;
    }

    public clearContacts(): void {
      this.contacts = [];
    }
  }

  it('supports constructor dependency injection and safe state encapsulation', () => {
    const mockRepo = new MockRepository();
    const service = new ContactService(mockRepo);

    expect(mockRepo.loadCalls).toBe(1);
    expect(service.getAllContacts()).toHaveLength(0);

    const res = service.addContact({
      fullName: 'Vikram Solar',
      phoneNumber: '+91 98888 77777',
      email: 'vikram@solar.com',
      age: '35',
      company: 'Solar Tech',
      jobTitle: 'VP',
      address: '',
      category: 'Work',
      status: 'active',
      isFavourite: true,
      notes: 'Initial test contact',
      tags: 'Tech, Green',
      birthday: '',
      reminderDate: ''
    });

    expect(res.success).toBe(true);
    expect(mockRepo.saveCalls).toBe(1);

    // Defensive copy verification: modifying returned contact should not mutate internal state
    const retrieved = service.getAllContacts();
    expect(retrieved).toHaveLength(1);
    retrieved[0].fullName = 'Mutated FullName';

    const freshlyQueried = service.getContactById(res.contact!.id);
    expect(freshlyQueried?.fullName).toBe('Vikram Solar');
  });

  it('prevents duplicate contacts based on phone or email within ContactService', () => {
    const mockRepo = new MockRepository();
    const service = new ContactService(mockRepo);

    service.addContact({
      fullName: 'User One',
      phoneNumber: '+91 90000 11111',
      email: 'user1@example.com',
      age: '',
      company: '',
      jobTitle: '',
      address: '',
      category: 'Friends',
      status: 'active',
      isFavourite: false,
      notes: '',
      tags: '',
      birthday: '',
      reminderDate: ''
    });

    // Attempt to add duplicate phone
    const dupPhone = service.addContact({
      fullName: 'User Two',
      phoneNumber: '+91-90000-11111',
      email: 'different@example.com',
      age: '',
      company: '',
      jobTitle: '',
      address: '',
      category: 'Friends',
      status: 'active',
      isFavourite: false,
      notes: '',
      tags: '',
      birthday: '',
      reminderDate: ''
    });
    expect(dupPhone.success).toBe(false);
    expect(dupPhone.validation.errors.general).toBeDefined();

    // Attempt to add duplicate email
    const dupEmail = service.addContact({
      fullName: 'User Three',
      phoneNumber: '+91 92222 33333',
      email: 'USER1@EXAMPLE.COM',
      age: '',
      company: '',
      jobTitle: '',
      address: '',
      category: 'Friends',
      status: 'active',
      isFavourite: false,
      notes: '',
      tags: '',
      birthday: '',
      reminderDate: ''
    });
    expect(dupEmail.success).toBe(false);
    expect(dupEmail.validation.errors.general).toBeDefined();
  });

  it('handles corrupt storage data gracefully by falling back to seed contacts', () => {
    const driver = new InMemoryStorageDriver();
    driver.setItem(STORAGE_KEY, 'MALFORMED_NON_JSON_DATA');

    const repo = new ContactRepository(driver);
    const loaded = repo.loadContacts();

    expect(loaded.length).toBeGreaterThan(0);
    expect(loaded[0].fullName).toBe('Sarah Johnson');
  });

  it('sanitizes contact records and handles missing optional attributes', () => {
    const sanitized = sanitizeContactRecord({
      fullName: 'Dev Test',
      phoneNumber: '987654321',
      extraBogusField: true
    });

    expect(sanitized).not.toBeNull();
    expect(sanitized?.fullName).toBe('Dev Test');
    expect(sanitized?.phoneNumber).toBe('987654321');
    expect(sanitized?.category).toBe('Other');
    expect(sanitized?.status).toBe('active');
    expect(sanitized?.isFavourite).toBe(false);

    // Invalid record with missing phone
    const invalid = sanitizeContactRecord({ fullName: 'No Phone' });
    expect(invalid).toBeNull();
  });

  it('formats and parses CSV data correctly with round-trip integrity', () => {
    const testContacts: Contact[] = [
      {
        id: 'c_csv_1',
        fullName: 'Anita Roy',
        phoneNumber: '+91 94444 55555',
        email: 'anita@roy.in',
        age: 32,
        company: 'Roy & Sons, Ltd.',
        jobTitle: 'Consultant',
        address: 'MG Road, Bangalore',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        notes: 'Important client, handles "finance".',
        tags: ['Finance', 'VIP'],
        birthday: '1992-04-10',
        reminderDate: '2026-11-30',
        createdAt: '2026-11-16T10:00:00.000Z'
      }
    ];

    const csvOutput = formatContactsToCSV(testContacts);
    expect(csvOutput).toContain('Anita Roy');
    expect(csvOutput).toContain('"Roy & Sons, Ltd."');
    expect(csvOutput).toContain('Important client, handles ""finance"".');

    const parsed = parseCSVContent(csvOutput, []);
    expect(parsed.validContacts).toHaveLength(1);
    const contact = parsed.validContacts[0];
    expect(contact.fullName).toBe('Anita Roy');
    expect(contact.phoneNumber).toBe('+91 94444 55555');
    expect(contact.email).toBe('anita@roy.in');
    expect(contact.company).toBe('Roy & Sons, Ltd.');
    expect(contact.notes).toBe('Important client, handles "finance".');
  });

  it('correctly handles CSV round-trip with embedded newlines, quotes, and commas across multiple contacts', () => {
    const complexContacts: Contact[] = [
      {
        id: 'c_complex_1',
        fullName: 'Devendra Roy',
        phoneNumber: '+91 91111 22222',
        email: 'dev@roy.org',
        company: 'Roy & Sons, Ltd.',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        notes: 'He said "Hello"\nFirst line\nSecond line',
        createdAt: '2026-11-16T10:00:00.000Z'
      },
      {
        id: 'c_complex_2',
        fullName: 'Suresh Kumar',
        phoneNumber: '+91 93333 44444',
        email: 'suresh@kumar.net',
        company: 'Global, Inc.',
        category: 'Clients',
        status: 'inactive',
        isFavourite: false,
        notes: 'Quote test: "Special"\nMultiline with "nested" quotes\nThird line',
        createdAt: '2026-11-16T11:00:00.000Z'
      }
    ];

    const csvOutput = formatContactsToCSV(complexContacts);
    const parsed = parseCSVContent(csvOutput, []);

    expect(parsed.summary.success).toBe(true);
    expect(parsed.validContacts).toHaveLength(2);

    // Verify Contact 1
    const c1 = parsed.validContacts[0];
    expect(c1.fullName).toBe('Devendra Roy');
    expect(c1.company).toBe('Roy & Sons, Ltd.');
    expect(c1.notes).toBe('He said "Hello"\nFirst line\nSecond line');

    // Verify Contact 2
    const c2 = parsed.validContacts[1];
    expect(c2.fullName).toBe('Suresh Kumar');
    expect(c2.company).toBe('Global, Inc.');
    expect(c2.notes).toBe('Quote test: "Special"\nMultiline with "nested" quotes\nThird line');
  });
});
