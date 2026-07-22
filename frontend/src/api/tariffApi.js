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
  return data;
}

export async function getTariffPlan(token, apartmentId) {
  const res = await fetch(`${API_BASE}/api/admin/tariff-plans/apartment/${apartmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null;
  return handleResponse(res);
}

export async function saveTariffPlan(token, payload) {
  const res = await fetch(`${API_BASE}/api/admin/tariff-plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
