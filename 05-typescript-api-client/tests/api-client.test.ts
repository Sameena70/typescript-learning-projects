import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '../src/api-client.js';
import type { User, CreateUserInput } from '../src/types.js';

describe('ApiClient', () => {
  const BASE_URL = 'https://api.example.com';
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient(BASE_URL);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes base URL by stripping trailing slashes', () => {
    const trailingSlashClient = new ApiClient('https://api.example.com///');
    expect(trailingSlashClient).toBeDefined();
  });

  it('executes a successful GET request with expected URL and method', async () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Ada Lovelace',
        username: 'ada',
        email: 'ada@example.com',
        phone: '123-456',
        website: 'ada.dev',
        address: {
          street: '12 St. James',
          suite: '1',
          city: 'London',
          zipcode: 'SW1',
          geo: { lat: '0', lng: '0' }
        },
        company: {
          name: 'Analytical Engine',
          catchPhrase: 'Pioneer',
          bs: 'computing'
        }
      }
    ];

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockUsers), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const result = await client.get<User[]>('/users');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/users', { method: 'GET' });
    expect(result).toEqual(mockUsers);
  });

  it('executes a successful POST request with headers and serialized body', async () => {
    const newUserData: CreateUserInput = {
      name: 'Grace Hopper',
      username: 'ghopper',
      email: 'grace@example.com',
      phone: '555-0100',
      website: 'navy.mil'
    };

    const mockCreatedUser: User = {
      id: 2,
      ...newUserData,
      address: {
        street: 'Main St',
        suite: 'Apt 1',
        city: 'Arlington',
        zipcode: '22201',
        geo: { lat: '38.88', lng: '-77.10' }
      },
      company: {
        name: 'US Navy',
        catchPhrase: 'Compiler Pioneer',
        bs: 'naval computing'
      }
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockCreatedUser), {
        status: 201,
        statusText: 'Created',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const result = await client.post<User, CreateUserInput>('/users', newUserData);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUserData)
    });
    expect(result).toEqual(mockCreatedUser);
  });

  it('executes a successful DELETE request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const result = await client.delete<unknown>('/users/1');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://api.example.com/users/1', { method: 'DELETE' });
    expect(result).toEqual({});
  });

  it('safely handles HTTP 204 No Content responses without attempting to parse JSON', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, {
        status: 204,
        statusText: 'No Content'
      })
    );

    const result = await client.delete<void>('/users/1');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeUndefined();
  });

  it('throws a descriptive error when an HTTP error status (404) is received', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', {
        status: 404,
        statusText: 'Not Found'
      })
    );

    await expect(client.get<User>('/users/999')).rejects.toThrow(
      'HTTP Error: 404 Not Found for https://api.example.com/users/999'
    );
  });

  it('propagates network failures with diagnostic context and error cause', async () => {
    const networkError = new Error('getaddrinfo ENOTFOUND api.example.com');
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(networkError);

    await expect(client.get<User[]>('/users')).rejects.toThrow(
      'Network error while fetching https://api.example.com/users: getaddrinfo ENOTFOUND api.example.com'
    );
  });
});
