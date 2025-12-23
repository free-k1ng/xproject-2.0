/**
 * Stremio API Client
 * 
 * This module provides functions to interact with the Stremio API.
 * The main endpoints are:
 *   - https://api.strem.io/api/login  (POST: email, password)
 *   - https://api.strem.io/api/addonCollectionGet  (POST: authKey, type, etc.)
 *   - https://api.strem.io/api/datastoreGet  (POST: authKey, etc.)
 */

const API_BASE = 'https://api.strem.io/api';

/**
 * Login to Stremio and get an authKey (session token).
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{authKey: string, user: object}>} - The auth key and user data
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, type: 'Auth' })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Login error: ${data.error}`);
  }

  // Response contains: { authKey, user: { _id, email, ... } }
  return data.result || data;
}

/**
 * Get user addons using the authKey.
 * @param {string} authKey - The session authentication key
 * @returns {Promise<Array>} - List of installed addons
 */
export async function getAddons(authKey) {
  const response = await fetch(`${API_BASE}/addonCollectionGet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'AddonCollectionGet',
      authKey,
      update: true
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get addons: ${response.status}`);
  }

  const data = await response.json();
  return data.result?.addons || data.addons || [];
}

/**
 * Get user library/datastore items.
 * @param {string} authKey - The session authentication key
 * @param {string} collection - Collection name (e.g., 'libraryItem', 'notifItem')
 * @returns {Promise<Array>} - Library items
 */
export async function getDatastore(authKey, collection = 'libraryItem') {
  const response = await fetch(`${API_BASE}/datastoreGet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'DatastoreGet',
      authKey,
      collection,
      all: true
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get datastore: ${response.status}`);
  }

  const data = await response.json();
  return data.result || [];
}

/**
 * Get user profile/session info.
 * @param {string} authKey - The session authentication key
 * @returns {Promise<object>} - User profile data
 */
export async function getUserInfo(authKey) {
  const response = await fetch(`${API_BASE}/getUser`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'GetUser',
      authKey
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }

  const data = await response.json();
  return data.result || data;
}

export default {
  login,
  getAddons,
  getDatastore,
  getUserInfo
};
