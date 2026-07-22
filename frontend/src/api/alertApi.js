import { API_BASE } from "./authApi.js";

async function handleResponse(res) {
  const contentType = res.headers.get("content-type");
  let data = null;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || "Request failed.";
    throw new Error(message);
  }
  return data || res.text();
}

export async function listAlerts(token, apartmentId) {
  const url = apartmentId
    ? `${API_BASE}/api/alerts?apartmentId=${apartmentId}`
    : `${API_BASE}/api/alerts`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function markAlertAsRead(token, id) {
  const res = await fetch(`${API_BASE}/api/alerts/${id}/read`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function triggerAlertScan(token, date) {
  const res = await fetch(`${API_BASE}/api/alerts/trigger-scan?date=${date}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
