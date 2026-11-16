import { ApiClient } from './api-client.js';
const BASE_URL = 'https://jsonplaceholder.typicode.com';
/**
 * Demonstrates GET /users to retrieve all users.
 */
async function demoGetAllUsers(client) {
    console.log('--- 1. GET All Users ---');
    const users = await client.get('/users');
    console.log(`Successfully fetched ${users.length} users:`);
    users.slice(0, 5).forEach((user) => {
        console.log(`  - [ID ${user.id}] ${user.name} <${user.email}>`);
    });
    if (users.length > 5) {
        console.log(`  ... and ${users.length - 5} more users.`);
    }
}
/**
 * Demonstrates GET /users/:id to retrieve a specific user.
 */
async function demoGetOneUser(client, id) {
    console.log(`\n--- 2. GET User by ID (${id}) ---`);
    const user = await client.get(`/users/${id}`);
    console.log('User details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Phone: ${user.phone}`);
    console.log(`  Website: ${user.website}`);
    console.log(`  Company: ${user.company.name} ("${user.company.catchPhrase}")`);
    console.log(`  City: ${user.address.city} (${user.address.zipcode})`);
}
/**
 * Demonstrates POST /users to simulate creating a user.
 */
async function demoCreateUser(client) {
    console.log('\n--- 3. POST New User ---');
    const newUserData = {
        name: 'Ada Lovelace',
        username: 'adalovelace',
        email: 'ada@example.com',
        phone: '1-800-555-0199',
        website: 'analytical-engine.org',
        company: {
            name: 'Babbage & Co.',
            catchPhrase: 'Pioneering computational engines',
            bs: 'innovate algorithmic pipelines'
        },
        address: {
            street: '12 St. James Square',
            suite: 'Suite 101',
            city: 'London',
            zipcode: 'SW1Y 4LB',
            geo: {
                lat: '51.5074',
                lng: '-0.1278'
            }
        }
    };
    const createdUser = await client.post('/users', newUserData);
    console.log('User created successfully:');
    console.log(`  Assigned ID: ${createdUser.id}`);
    console.log(`  Name: ${createdUser.name}`);
    console.log(`  Email: ${createdUser.email}`);
    console.log(`  Website: ${createdUser.website}`);
    console.log('  Note: JSONPlaceholder simulates resource creation. The entity is returned with a new ID (typically 11) but is not permanently persisted on the server.');
}
/**
 * Demonstrates DELETE /users/:id to simulate deleting a user.
 */
async function demoDeleteUser(client, id) {
    console.log(`\n--- 4. DELETE User (${id}) ---`);
    const result = await client.delete(`/users/${id}`);
    console.log(`User ${id} deletion requested successfully.`);
    console.log(`  Response payload: ${JSON.stringify(result)}`);
    console.log('  Note: JSONPlaceholder returns an empty object {} and HTTP 200 on DELETE. Real-world APIs often return 204 No Content with an empty response body.');
}
/**
 * Main application orchestrator.
 */
async function main() {
    console.log('====================================================');
    console.log('  TypeScript API Client Demonstration (JSONPlaceholder)');
    console.log(`  Target Base URL: ${BASE_URL}`);
    console.log('====================================================\n');
    const client = new ApiClient(BASE_URL);
    try {
        await demoGetAllUsers(client);
        await demoGetOneUser(client, 1);
        await demoCreateUser(client);
        await demoDeleteUser(client, 1);
        console.log('\n====================================================');
        console.log('  All API demonstrations completed successfully.');
        console.log('====================================================');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`\nAPI Demonstration failed: ${message}`);
    }
}
void main();
