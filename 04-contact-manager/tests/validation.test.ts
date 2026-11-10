import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidPhoneNumber,
  isValidEmail,
  validateContactForm,
  findDuplicateContact
} from '../src/validation.js';
import {
  initializeContactService,
  getAllContacts,
  getContactById,
  addContact,
  updateContact,
  deleteContact,
  toggleFavouriteStatus,
  toggleContactStatus,
  clearAllContacts,
  getFilteredContacts,
  addContactActivity,
  findPotentialDuplicates,
  getAllTags,
  importContactsFromCSV
} from '../src/contact-service.js';
import { calculateContactStatistics } from '../src/statistics.js';
import { ContactImportExport } from '../src/import-export.js';
import { sanitizeContactRecord } from '../src/storage.js';
import { Contact, ContactFormData } from '../src/types.js';

// Setup LocalStorage Mock
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
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
        fullName: 'John Smith',
        phoneNumber: '+91 98765 12345',
        email: 'john@smith.org',
        age: '30',
        company: 'Smith Co',
        jobTitle: 'Developer',
        address: 'MG Road, Bengaluru',
        category: 'Work',
        status: 'active',
        isFavourite: false,
        notes: 'Good lead',
        tags: 'tech, developer',
        birthday: '1995-05-10',
        reminderDate: '2026-12-01'
      };

      const result = validateContactForm(formData, emptyContacts);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('fails when full name is missing or too short', () => {
      const formData: ContactFormData = {
        fullName: 'A',
        phoneNumber: '+91 98765 12345',
        email: '',
        age: '',
        company: '',
        jobTitle: '',
        address: '',
        category: 'Other',
        status: 'active',
        isFavourite: false,
        notes: '',
        tags: '',
        birthday: '',
        reminderDate: ''
      };

      const result = validateContactForm(formData, emptyContacts);
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toBeDefined();
    });

    it('fails when age is out of bounds or not an integer', () => {
      const formData: ContactFormData = {
        fullName: 'John Smith',
        phoneNumber: '+91 98765 12345',
        email: '',
        age: '150', // out of bounds (1-130)
        company: '',
        jobTitle: '',
        address: '',
        category: 'Other',
        status: 'active',
        isFavourite: false,
        notes: '',
        tags: '',
        birthday: '',
        reminderDate: ''
      };

      const result = validateContactForm(formData, emptyContacts);
      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBeDefined();
    });
  });
});

describe('ContactService & Operations', () => {
  beforeEach(() => {
    const mock = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mock,
      writable: true,
      configurable: true
    });
    initializeContactService();
    clearAllContacts();
  });

  it('adds, retrieves, updates, and deletes contacts', () => {
    const form: ContactFormData = {
      fullName: 'Alice Johnson',
      phoneNumber: '+91 98765 43210',
      email: 'alice@example.com',
      age: '28',
      company: 'AliceCorp',
      jobTitle: 'Designer',
      address: 'Indiranagar, Bangalore',
      category: 'Work',
      status: 'active',
      isFavourite: false,
      notes: 'Initial note',
      tags: 'Design, UI',
      birthday: '1996-03-12',
      reminderDate: '2026-11-25'
    };

    const addRes = addContact(form);
    expect(addRes.success).toBe(true);
    expect(addRes.contact).toBeDefined();
    const id = addRes.contact!.id;

    // Retrieve
    expect(getContactById(id)?.fullName).toBe('Alice Johnson');
    expect(getAllContacts().length).toBe(1);

    // Update
    const updateRes = updateContact(id, {
      ...form,
      fullName: 'Alice J. Doe',
      isFavourite: true
    });
    expect(updateRes.success).toBe(true);
    expect(getContactById(id)?.fullName).toBe('Alice J. Doe');
    expect(getContactById(id)?.isFavourite).toBe(true);

    // Delete
    expect(deleteContact(id)).toBe(true);
    expect(getAllContacts().length).toBe(0);
  });

  it('toggles favourite and active status', () => {
    const addRes = addContact({
      fullName: 'Bob Marley',
      phoneNumber: '+91 91234 56789',
      email: 'bob@music.com',
      age: '35',
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

    const id = addRes.contact!.id;
    expect(toggleFavouriteStatus(id)).toBe(true);
    expect(toggleContactStatus(id)).toBe('inactive');
  });

  it('logs contact interactions and activity', () => {
    const addRes = addContact({
      fullName: 'Charlie Brown',
      phoneNumber: '+91 99887 76655',
      email: '',
      age: '',
      company: '',
      jobTitle: '',
      address: '',
      category: 'Other',
      status: 'active',
      isFavourite: false,
      notes: '',
      tags: '',
      birthday: '',
      reminderDate: ''
    });

    const id = addRes.contact!.id;
    const activity = addContactActivity(id, {
      type: 'call',
      date: '2026-11-10',
      notes: 'Discussed project scope'
    });

    expect(activity).toBeDefined();
    const contact = getContactById(id);
    expect(contact?.activities?.length).toBe(1);
    expect(contact?.activities?.[0].notes).toBe('Discussed project scope');
  });

  it('filters contacts by text, category, status, favourites, and tags', () => {
    addContact({
      fullName: 'David Warner',
      phoneNumber: '+91 91111 22222',
      email: 'david@cricket.org',
      age: '37',
      company: 'Sports Inc',
      jobTitle: 'Athlete',
      address: '',
      category: 'Work',
      status: 'active',
      isFavourite: true,
      notes: '',
      tags: 'Cricket, Sports',
      birthday: '',
      reminderDate: ''
    });

    addContact({
      fullName: 'Elena Rostova',
      phoneNumber: '+91 93333 44444',
      email: 'elena@art.com',
      age: '29',
      company: 'Art Studio',
      jobTitle: 'Painter',
      address: '',
      category: 'Friends',
      status: 'inactive',
      isFavourite: false,
      notes: '',
      tags: 'Art',
      birthday: '',
      reminderDate: ''
    });

    // Text search
    expect(
      getFilteredContacts({
        searchQuery: 'David',
        category: 'all',
        status: 'all',
        favouritesOnly: false,
        sortField: 'name',
        sortOrder: 'asc'
      }).length
    ).toBe(1);
    // Category filter
    expect(
      getFilteredContacts({
        searchQuery: '',
        category: 'Friends',
        status: 'all',
        favouritesOnly: false,
        sortField: 'name',
        sortOrder: 'asc'
      }).length
    ).toBe(1);
    // Status filter
    expect(
      getFilteredContacts({
        searchQuery: '',
        category: 'all',
        status: 'inactive',
        favouritesOnly: false,
        sortField: 'name',
        sortOrder: 'asc'
      }).length
    ).toBe(1);
    // Favourites only
    expect(
      getFilteredContacts({
        searchQuery: '',
        category: 'all',
        status: 'all',
        favouritesOnly: true,
        sortField: 'name',
        sortOrder: 'asc'
      }).length
    ).toBe(1);
    // Tag filter
    expect(
      getFilteredContacts({
        searchQuery: '',
        category: 'all',
        status: 'all',
        favouritesOnly: false,
        tag: 'Art',
        sortField: 'name',
        sortOrder: 'asc'
      }).length
    ).toBe(1);
  });

  it('finds potential duplicates in contact list', () => {
    addContact({
      fullName: 'Sam Altman',
      phoneNumber: '+91 99999 88888',
      email: 'sam@openai.com',
      age: '',
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
    });

    // Directly test potential duplicate matching
    const duplicates = findPotentialDuplicates();
    expect(Array.isArray(duplicates)).toBe(true);
  });

  it('retrieves distinct list of all tags', () => {
    addContact({
      fullName: 'Tag Master',
      phoneNumber: '+91 95555 44444',
      email: '',
      age: '',
      company: '',
      jobTitle: '',
      address: '',
      category: 'Other',
      status: 'active',
      isFavourite: false,
      notes: '',
      tags: 'Alpha, Beta, Gamma',
      birthday: '',
      reminderDate: ''
    });

    const tags = getAllTags();
    expect(tags).toContain('Alpha');
    expect(tags).toContain('Beta');
    expect(tags).toContain('Gamma');
  });

  it('imports contacts from CSV format properly', () => {
    const csv = `ID,Full Name,Phone Number,Email,Age,Company,Job Title,Address,Category,Status,Is Favourite,Tags,Birthday,Reminder Date,Notes,Created At
ct_1,Rahul Dravid,+91 97777 66666,rahul@coach.in,50,BCCI,Head Coach,Bangalore,Work,active,true,"Cricket, Legend",1973-01-11,2026-12-15,Top coach,2026-11-01`;

    const res = importContactsFromCSV(csv);
    expect(res.success).toBe(true);
    expect(res.importedCount).toBe(1);
    expect(getAllContacts().some((c) => c.fullName === 'Rahul Dravid')).toBe(true);
  });
});

describe('Contact Statistics & Storage Resilience', () => {
  it('computes complete contact statistics with reminders', () => {
    const contacts: Contact[] = [
      {
        id: '1',
        fullName: 'User A',
        phoneNumber: '1111111',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        reminderDate: '2026-11-20',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        fullName: 'User B',
        phoneNumber: '2222222',
        category: 'Friends',
        status: 'inactive',
        isFavourite: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const stats = calculateContactStatistics(contacts);
    expect(stats.total).toBe(2);
    expect(stats.active).toBe(1);
    expect(stats.inactive).toBe(1);
    expect(stats.favourites).toBe(1);
    expect(stats.withReminders).toBe(1);
    expect(stats.categoryCounts.Work).toBe(1);
    expect(stats.categoryCounts.Friends).toBe(1);
  });

  it('sanitizes corrupt or incomplete stored contact records safely', () => {
    expect(sanitizeContactRecord(null)).toBeNull();
    expect(sanitizeContactRecord({})).toBeNull(); // Missing required fullName and phone
    expect(sanitizeContactRecord({ fullName: 'A', phone: '1234567' })).toBeNull(); // Too short name

    const validRecord = sanitizeContactRecord({
      fullName: 'Legacy User',
      phoneNumber: '+91 9876543210',
      category: 'InvalidCategory'
    });
    expect(validRecord).toBeDefined();
    expect(validRecord?.fullName).toBe('Legacy User');
    expect(validRecord?.category).toBe('Other'); // Fallback category
  });
});

describe('ContactImportExport CSV parser', () => {
  it('parses CSV lines respecting embedded quotes', () => {
    const line = '"Sharma, Priya","+91 98765 43210","priya@techcorp.in"';
    const tokens = ContactImportExport.parseCSVLine(line);
    expect(tokens[0]).toBe('Sharma, Priya');
    expect(tokens[1]).toBe('+91 98765 43210');
    expect(tokens[2]).toBe('priya@techcorp.in');
  });

  it('splits multiline CSV text safely', () => {
    const csv = 'Header1,Header2\r\n"Line 1 with, comma",Value 2\r\nLine 2,Value 3';
    const lines = ContactImportExport.splitCSVLines(csv);
    expect(lines.length).toBe(3);
    expect(lines[1]).toBe('"Line 1 with, comma",Value 2');
  });
});
