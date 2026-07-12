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
 * Calls POST /api/admin/apartments
 * @param {string} token
 * @param {{name: string, address: string}} payload
 */
export async function createApartment(token, payload) {
  const res = await fetch(`${API_BASE}/api/admin/apartments`, {
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
 * Calls GET /api/admin/apartments
 * @param {string} token
 */
export async function listApartments(token) {
  const res = await fetch(`${API_BASE}/api/admin/apartments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

/**
 * Calls DELETE /api/admin/apartments/{id}
 * @param {string} token
 * @param {number|string} id
 */
export async function deleteApartment(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/apartments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

/**
 * Calls PUT /api/admin/apartments/{id}
 * @param {string} token
 * @param {number|string} id
 * @param {{name: string, address: string, ownerEmail?: string, ownerPhone?: string}} payload
 */
export async function updateApartment(token, id, payload) {
  const res = await fetch(`${API_BASE}/api/admin/apartments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
