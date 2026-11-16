/**
 * Geographical coordinates for an address.
 */
export interface Geo {
  lat: string;
  lng: string;
}

/**
 * Postal address structure returned by JSONPlaceholder.
 */
export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

/**
 * Company affiliation details for a user.
 */
export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

/**
 * Complete User entity representation as returned by the JSONPlaceholder API.
 */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

/**
 * Input payload used when creating a new user via POST request.
 * The server generates the `id`, so it is omitted from the input.
 * Nested structures like address and company can be supplied optionally.
 */
export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address?: Address;
  company?: Company;
}
