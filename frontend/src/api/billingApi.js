import { API_BASE } from "./authApi.js";

async function handleResponse(res) {
  const contentType = res.headers.get("content-type");
  let data = null;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || "Request failed.";
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

export async function updateBillingCycle(token, id, payload) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function sendInvoiceEmail(token, invoiceId) {
  const res = await fetch(`${API_BASE}/api/admin/billing/invoices/${invoiceId}/send-email`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
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

export async function updateAdminInvoice(token, invoiceId, payload) {
  const res = await fetch(`${API_BASE}/api/admin/billing/invoices/${invoiceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function regenerateBillingCycle(token, cycleId) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/${cycleId}/regenerate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function getInvoicesByCycle(token, cycleId) {
  const res = await fetch(`${API_BASE}/api/admin/billing/cycles/${cycleId}/invoices`, {
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

/**
 * Pay a resident invoice.
 * @param {string} token - JWT auth token
 * @param {number} id - Invoice ID
 * @param {string} paymentMethod - "UPI" | "CREDIT_CARD" | "NET_BANKING"
 * @returns {Promise<Invoice>} The updated invoice with payment metadata
 */
export async function payResidentInvoice(token, id, paymentMethod = "UPI") {
  const res = await fetch(
    `${API_BASE}/api/resident/billing/invoices/${id}/pay?paymentMethod=${encodeURIComponent(paymentMethod)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  // 409 = already paid — throw with message from body
  if (res.status === 409) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "This invoice has already been paid.");
  }
  return handleResponse(res);
}

/**
 * Download a resident's payment receipt PDF.
 * Only works for the resident's own invoices (enforced by backend).
 */
export async function downloadResidentInvoicePdf(token, id) {
  const res = await fetch(`${API_BASE}/api/resident/billing/invoices/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to download payment receipt.");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AquaTrack_Receipt_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Admin: download a payment receipt PDF for any invoice.
 */
export async function downloadAdminInvoiceReceiptPdf(token, id) {
  const res = await fetch(`${API_BASE}/api/admin/billing/invoices/${id}/receipt`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to download receipt.");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AquaTrack_Admin_Receipt_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
