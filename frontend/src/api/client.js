/**
 * KainaFresh API Client
 *
 * All API calls in the application must go through this file.
 * Never write `fetch()` directly inside components.
 *
 * Base URL is pulled from the .env file: VITE_API_BASE_URL
 * Update .env when the backend team finalises the server URL.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'kainafresh_token';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/** Retrieve the stored auth token from localStorage. */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/** Store the auth token after a successful login. */
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

/** Remove the auth token on logout. */
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/** Returns true if a token currently exists in storage. */
export const isAuthenticated = () => Boolean(getToken());

// ---------------------------------------------------------------------------
// Internal fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Core request helper.
 * @param {string} endpoint - API path, e.g. '/api/login'
 * @param {RequestInit} options - Fetch options (method, body, etc.)
 * @returns {Promise<{ success: boolean, [key: string]: any }>}
 */
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Bubble up HTTP-level errors so callers can catch them uniformly.
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

/**
 * GET request.
 * @param {string} endpoint
 */
export const apiGet = (endpoint) => request(endpoint, { method: 'GET' });

/**
 * POST request.
 * @param {string} endpoint
 * @param {object} body
 */
export const apiPost = (endpoint, body) =>
  request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/**
 * PUT request.
 * @param {string} endpoint
 * @param {object} body
 */
export const apiPut = (endpoint, body) =>
  request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

/**
 * DELETE request.
 * @param {string} endpoint
 */
export const apiDelete = (endpoint) => request(endpoint, { method: 'DELETE' });


//  endpoints for settings and nav links


export const getSettings = () => apiGet('/api/settings');


export const getNavLinks = () => apiGet('/api/navlinks/nav');
