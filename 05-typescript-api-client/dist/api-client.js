/**
 * Core HTTP client for performing type-safe API requests using native fetch.
 */
export class ApiClient {
    baseUrl;
    /**
     * Initializes the client with a target base URL.
     * Trailing slashes are stripped to ensure clean URL concatenation with endpoints.
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/+$/, '');
    }
    /**
     * Sends an HTTP request to the specified endpoint and returns the parsed JSON response.
     * Gracefully handles HTTP 204 No Content responses where no body is returned.
     *
     * @template T The expected type of the response payload.
     * @param endpoint The path appended to baseUrl (e.g. "/users" or "users/1").
     * @param options Optional fetch configuration (method, headers, body, etc.).
     * @returns A promise resolving to the parsed data of type T.
     */
    async request(endpoint, options) {
        const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseUrl}${formattedEndpoint}`;
        let response;
        try {
            response = await fetch(url, options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown network failure';
            throw new Error(`Network error while fetching ${url}: ${message}`, { cause: error });
        }
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText} for ${url}`);
        }
        // 204 No Content responses have no body stream
        if (response.status === 204) {
            return undefined;
        }
        return (await response.json());
    }
    /**
     * Sends a GET request to the specified endpoint.
     *
     * @template T The expected type of the response payload.
     * @param endpoint The path appended to baseUrl.
     * @returns A promise resolving to the parsed response data.
     */
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    /**
     * Sends a POST request to the specified endpoint with a JSON-serialized payload.
     *
     * @template TResponse The expected type of the response payload returned by the server.
     * @template TBody The type of the request payload sent in the body.
     * @param endpoint The path appended to baseUrl.
     * @param body The data payload to serialize as JSON.
     * @returns A promise resolving to the parsed response data.
     */
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }
    /**
     * Sends a DELETE request to the specified endpoint.
     *
     * @template T The expected type of the response payload.
     * @param endpoint The path appended to baseUrl.
     * @returns A promise resolving to the parsed response data.
     */
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
