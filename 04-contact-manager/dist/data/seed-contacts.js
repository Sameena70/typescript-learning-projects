/**
 * seed-contacts.ts
 *
 * Dedicated data module containing initial seed contacts.
 * Decouples sample/mock data from persistence and business logic.
 * Default contacts exactly replicate the ContactHub visual reference!
 */
export const SEED_CONTACTS = [
    {
        id: 'seed-1',
        fullName: 'Sarah Johnson',
        phoneNumber: '+1 (555) 234-5678',
        email: 'sarah@company.com',
        age: 29,
        company: 'TechCorp',
        jobTitle: 'Product Manager',
        address: 'San Francisco, CA',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
        tags: ['Product', 'Management'],
        notes: 'Key contact for product management.',
        reminderDate: '2026-11-20',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'seed-2',
        fullName: 'Michael Chen',
        phoneNumber: '+1 (555) 345-6789',
        email: 'michael@company.com',
        age: 32,
        company: 'DevCraft',
        jobTitle: 'Developer',
        address: 'Seattle, WA',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        tags: ['Engineering', 'TypeScript'],
        notes: 'Senior engineer and frontend specialist.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'seed-3',
        fullName: 'Emily Davis',
        phoneNumber: '+1 (555) 456-7890',
        email: 'emily@company.com',
        age: 27,
        company: 'DesignFlow',
        jobTitle: 'Designer',
        address: 'Austin, TX',
        category: 'Clients',
        status: 'active',
        isFavourite: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        tags: ['UI/UX', 'Design'],
        notes: 'Lead UI/UX consultant.',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'seed-4',
        fullName: 'David Wilson',
        phoneNumber: '+1 (555) 567-8901',
        email: 'david@company.com',
        age: 41,
        company: 'Acme Corp',
        jobTitle: 'CEO',
        address: 'New York, NY',
        category: 'Business',
        status: 'active',
        isFavourite: true,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
        tags: ['Executive', 'Strategy'],
        notes: 'Chief Executive Officer.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'seed-5',
        fullName: 'Lisa Anderson',
        phoneNumber: '+1 (555) 678-9012',
        email: 'lisae@company.com',
        age: 30,
        company: 'GrowthHub',
        jobTitle: 'Marketing',
        address: 'Chicago, IL',
        category: 'Work',
        status: 'active',
        isFavourite: true,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
        tags: ['Marketing', 'Growth'],
        notes: 'Marketing director for branding.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'seed-6',
        fullName: 'James Taylor',
        phoneNumber: '+1 (555) 789-0123',
        email: 'james@company.com',
        age: 35,
        company: 'SalesForge',
        jobTitle: 'Sales',
        address: 'Denver, CO',
        category: 'Clients',
        status: 'active',
        isFavourite: true,
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
        tags: ['Sales', 'Enterprise'],
        notes: 'Account executive for enterprise clients.',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    }
];
