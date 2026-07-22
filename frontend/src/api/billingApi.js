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

export async function openBillingCycle(token, payload) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function listBillingCycles(token, apartmentId) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/apartment/${apartmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function getBillingCycleDetails(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function finalizeBillingCycle(token, id, payload) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/${id}/finalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function getCycleUsagePreviews(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/${id}/usage-previews`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function archiveBillingCycle(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/${id}/archive`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleResponse(res);
}

export async function updateInvoiceAdjustments(token, invoiceId, adjustments) {
  const res = await fetch(`${API_BASE}/api/admin/billing/invoices/${invoiceId}/adjustments?adjustments=${adjustments}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function listResidentInvoices(token) {
  const res = await fetch(`${API_BASE}/api/resident/billing/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
