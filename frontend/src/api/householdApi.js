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
 * Calls POST /api/admin/households
 * @param {string} token
 * @param {{apartmentId: number, flatNumber: string, flatSize: number, occupancy: number}} payload
 */
export async function createHousehold(token, payload) {
  const res = await fetch(`${API_BASE}/api/admin/households`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Calls GET /api/admin/households/apartment/{apartmentId}
 * @param {string} token
 * @param {number|string} apartmentId
 */
export async function listHouseholdsByApartment(token, apartmentId) {
  const res = await fetch(`${API_BASE}/api/admin/households/apartment/${apartmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
