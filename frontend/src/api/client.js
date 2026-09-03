/**
 * KainaFresh API Client
 *
 * All API calls in the application must go through this file.
 * Never write `fetch()` directly inside components.
 *
 * Base URL is pulled from the .env file: VITE_API_BASE_URL
 * Update .env when the backend team finalises the server URL.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? `${window.location.protocol}//${window.location.hostname}:8000` : import.meta.env.VITE_API_BASE_URL);
const TOKEN_KEY = 'kainafresh_token';
const USER_KEY = 'kainafresh_user';

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

/** Persist the authenticated user's profile (incl. role) to localStorage. */
export const setCurrentUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

/** Read the persisted user profile from localStorage (or null). */
export const getCurrentUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/** Remove the persisted user profile on logout. */
export const removeCurrentUser = () => localStorage.removeItem(USER_KEY);

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

/** POST FormData request (for File Uploads like Logo). */
export const apiPostFormData = async (endpoint, formData) => {
  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Upload failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};


//  endpoints for settings and nav links


export const getSettings = () => apiGet('/api/settings');


export const getNavLinks = () => apiGet('/api/navlinks/nav');
