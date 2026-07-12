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
 * Calls POST /api/usage-logs
 * @param {string} token
 * @param {{householdId: number, readingDate: string, readingValue: number}} payload
 */
export async function logManualReading(token, payload) {
  const res = await fetch(`${API_BASE}/api/usage-logs`, {
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
 * Calls POST /api/usage-logs/bulk-upload
 * @param {string} token
 * @param {number|string} apartmentId
 * @param {File} file
 */
export async function uploadBulkCsv(token, apartmentId, file) {
  const formData = new FormData();
  formData.append("apartmentId", apartmentId);
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/usage-logs/bulk-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type header to 'multipart/form-data', fetch will set it automatically with the boundary
    },
    body: formData,
  });
  return handleResponse(res);
}
