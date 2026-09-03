/**
 * ============================================================================
 * KainaFresh Organic Platform — Centralized HTTP Client & API Gateway
 * ============================================================================
 *
 * All API interactions across the frontend application MUST pass through this client.
 * Benefits:
 * 1. Automatic inclusion of JWT Bearer authentication headers from localStorage.
 * 2. Uniform base URL resolution for both local development and production.
 * 3. Consistent JSON parsing and custom HTTP exception throwing (`ApiError`).
 * 4. Multipart FormData support for direct file uploads (e.g. site logo, product images).
 */

// Dynamically resolve base API backend URL from Vite environment configuration or fallback to local PHP backend
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? `${window.location.protocol}//${window.location.hostname}:8000` : (import.meta.env.VITE_API_BASE_URL || ''));

// LocalStorage key identifier for storing user session JWT auth token
const TOKEN_KEY = 'kainafresh_token';

// LocalStorage key identifier for storing the persisted user profile/role
const USER_KEY = 'kainafresh_user';

/**
 * Shape of the user profile returned by the backend auth endpoints and
 * persisted to localStorage so the app can resolve the current user's role
 * for route protection and role-based navigation.
 */
export interface UserProfile {
  id: number | string;
  username?: string;
  email?: string;
  role?: 'admin' | 'sales_manager' | 'customer' | string;
  full_name?: string;
  phone_number?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Custom ApiError Exception Class for Uniform Error Handling
// ---------------------------------------------------------------------------

/**
 * Custom Error extension representing failed API responses.
 * Encapsulates HTTP status code (e.g. 401, 403, 500) and backend response payload.
 */
export class ApiError extends Error {
  // HTTP status code returned by backend server
  status: number;

  // Parsed JSON error payload returned by backend
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    // Call parent Error constructor with error message
    super(message);
    
    // Assign custom error name for instance identification
    this.name = 'ApiError';

    // Store HTTP status code
    this.status = status;

    // Store raw error payload
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// Authentication Token Helper Utility Methods
// ---------------------------------------------------------------------------

/** 
 * Retrieves the stored JWT auth token string from localStorage.
 * Returns null if user is logged out or token does not exist.
 */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

/** 
 * Stores the authentication JWT token into localStorage upon successful login.
 * @param token - Raw JWT string token received from backend API
 */
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

/** 
 * Removes the stored JWT token from localStorage on user logout.
 */
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

/** 
 * Checks whether an active user session token exists in client storage.
 * @returns boolean - true if logged in, false if unauthenticated
 */
export const isAuthenticated = (): boolean => Boolean(getToken());

/** 
 * Persists the authenticated user's profile (incl. role) to localStorage.
 * @param user - User profile object returned from the auth endpoint
 */
export const setCurrentUser = (user: UserProfile): void =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

/** 
 * Reads the persisted user profile from localStorage.
 * @returns UserProfile | null when no user session is stored
 */
export const getCurrentUser = (): UserProfile | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

/** 
 * Removes the persisted user profile from localStorage on logout.
 */
export const removeCurrentUser = (): void => localStorage.removeItem(USER_KEY);

// ---------------------------------------------------------------------------
// Core Internal HTTP Fetch Engine Wrapper
// ---------------------------------------------------------------------------

/**
 * Low-level HTTP request dispatcher wrapping native fetch API.
 * 
 * @param endpoint - Relative backend path (e.g. '/api/pages/slug/home')
 * @param options - Standard RequestInit options (method, body, headers)
 * @returns Promise resolving to parsed response generic type T
 */
async function request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Read current authentication token from browser storage
  const token = getToken();

  // Construct HTTP headers object with default JSON Content-Type and Bearer Auth token if present
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  // Perform async HTTP fetch request to the resolved target URL
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Decode JSON response payload returned by PHP backend
  const data = await response.json();

  // If HTTP status code is outside the success 2xx range, throw ApiError exception
  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data);
  }

  // Return parsed typed data object
  return data as T;
}

// ---------------------------------------------------------------------------
// High-Level Public RESTful Helper API Methods
// ---------------------------------------------------------------------------

/** 
 * Executes an HTTP GET request to retrieve data from specified API endpoint.
 */
export const apiGet = <T = unknown>(endpoint: string): Promise<T> => 
  request<T>(endpoint, { method: 'GET' });

/** 
 * Executes an HTTP POST request to submit JSON data payload to specified API endpoint.
 */
export const apiPost = <T = unknown>(endpoint: string, body: unknown): Promise<T> =>
  request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** 
 * Executes an HTTP PUT request to update an existing database record at specified API endpoint.
 */
export const apiPut = <T = unknown>(endpoint: string, body: unknown): Promise<T> =>
  request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

/** 
 * Executes an HTTP DELETE request to remove a database record at specified API endpoint.
 */
export const apiDelete = <T = unknown>(endpoint: string): Promise<T> => 
  request<T>(endpoint, { method: 'DELETE' });

/** 
 * Executes an HTTP POST request using Multipart FormData for binary file uploads (e.g. logos/images).
 * Note: Omits Content-Type header so browser automatically computes multipart boundary boundary string.
 */
export const apiPostFormData = async <T = unknown>(endpoint: string, formData: FormData): Promise<T> => {
  // Retrieve token for authenticated file upload
  const token = getToken();

  // Build authorization header
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Perform multipart HTTP POST upload request
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  // Parse JSON response payload
  const data = await response.json();

  // Check for HTTP errors
  if (!response.ok) {
    throw new ApiError(data.message || 'Upload failed', response.status, data);
  }

  // Return parsed response
  return data as T;
};
