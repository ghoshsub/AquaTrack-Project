// Base URL of your Spring Boot backend.
// Change this if your backend runs on a different host/port,
// or better: move it into a Vite env variable (VITE_API_BASE) later.
export const API_BASE = "http://localhost:8080";

async function handleResponse(res) {
  const contentType = res.headers.get("content-type");
  let data = null;
  let message = "Request failed.";

  if (contentType && contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
    if (!res.ok) {
      message = (data && (data.message || data.error)) || message;
      throw new Error(message);
    }
    return data;
  } else {
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      message = text || message;
      throw new Error(message);
    }
    return text;
  }
}

/**
 * Calls POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, username: string, role: string}>}
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username: email, password }),
  });
  return handleResponse(res);
}

/**
 * Calls POST /api/auth/register
 * @param {{username: string, email?: string, password: string, role: "ADMIN"|"RESIDENT"}} payload
 * @returns {Promise<{token: string, username: string, role: string}>}
 */
export async function register(payload) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Calls GET /api/users/profile
 * @param {string} token
 */
export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

/**
 * Calls PUT /api/users/profile
 * @param {string} token
 * @param {{username: string, email?: string, displayName?: string, password?: string}} payload
 */
export async function updateProfile(token, payload) {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
