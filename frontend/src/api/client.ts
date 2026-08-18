/**
 * KainaFresh API Client
 *
 * All API calls in the application must go through this file.
 * Never write `fetch()` directly inside components.
 *
 * Base URL is pulled from the .env file: VITE_API_BASE_URL
 * Update .env when the backend team finalises the server URL.
 */

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'kainafresh_token';

// ---------------------------------------------------------------------------
// Custom Error Class for Type Safety
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/** Retrieve the stored auth token from localStorage. */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

/** Store the auth token after a successful login. */
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

/** Remove the auth token on logout. */
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

/** Returns true if a token currently exists in storage. */
export const isAuthenticated = (): boolean => Boolean(getToken());

// ---------------------------------------------------------------------------
// Internal fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Core request helper.
 * @param endpoint - API path, e.g. '/api/login'
 * @param options - Fetch options (method, body, etc.)
 */
async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Bubble up HTTP-level errors so callers can catch them uniformly.
  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

/** GET request. */
export const apiGet = <T = any>(endpoint: string): Promise<T> => 
  request<T>(endpoint, { method: 'GET' });

/** POST request. */
export const apiPost = <T = any>(endpoint: string, body: unknown): Promise<T> =>
  request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** PUT request. */
export const apiPut = <T = any>(endpoint: string, body: unknown): Promise<T> =>
  request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

/** DELETE request. */
export const apiDelete = <T = any>(endpoint: string): Promise<T> => 
  request<T>(endpoint, { method: 'DELETE' });
