// Base URL of your Spring Boot backend.
// Change this if your backend runs on a different host/port,
// or better: move it into a Vite env variable (VITE_API_BASE) later.
export const API_BASE = "http://localhost:8080";

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || "Request failed.";
    throw new Error(message);
  }
  return data;
}

/**
 * Calls POST /api/auth/login
 * @returns {Promise<{token: string, username: string, role: string}>}
 */
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

/**
 * Calls POST /api/auth/register
 * @param {{username: string, password: string, role: "ADMIN"|"RESIDENT", householdId?: number}} payload
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
