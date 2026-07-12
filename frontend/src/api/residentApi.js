import { API_BASE } from "./authApi.js";

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || "Request failed.";
    throw new Error(message);
  }
  return data;
}

/**
 * Calls GET /api/resident/dashboard
 * @param {string} token
 */
export async function getResidentDashboard(token) {
  const res = await fetch(`${API_BASE}/api/resident/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

/**
 * Calls POST /api/resident/link-household
 * @param {string} token
 * @param {{apartmentId: number, flatNumber: string}} payload
 */
export async function linkHousehold(token, payload) {
  const res = await fetch(`${API_BASE}/api/resident/link-household`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  // link-household might return just a string, so we handle it slightly differently
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return handleResponse(res);
  } else {
    const text = await res.text();
    if (!res.ok) throw new Error(text || "Request failed.");
    return text;
  }
}

/**
 * Calls GET /api/resident/apartments
 * @param {string} token
 */
export async function listResidentApartments(token) {
  const res = await fetch(`${API_BASE}/api/resident/apartments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
