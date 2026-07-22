import React, { useEffect, useState } from "react";
import { Receipt, Calendar, Info } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listResidentInvoices } from "../api/billingApi.js";

function formatBillingMonth(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[monthIndex] || parts[1];
  return `${monthName} Bill`;
}

export default function ResidentBillsPage({ auth, setPage }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      setError("");
      try {
        const data = await listResidentInvoices(auth.token);
        // Sort newest first
        const sorted = data.sort((a, b) => b.id - a.id);
        setInvoices(sorted);
      } catch (err) {
        setError(err.message || "Could not retrieve invoices.");
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, [auth.token]);

  return (
    <section className="at-container" style={{ maxWidth: "750px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3">
        <Receipt size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          My Bills & Invoices
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "var(--at-text-body)", marginTop: "4px" }}>
        Review your itemized water bills, shared cost allocations, and payment details.
      </p>

      {loading && (
        <p style={{ marginTop: "20px", fontSize: "14px", color: "var(--at-text-muted)" }}>Loading your bills...</p>
      )}

      {error && <p className="at-error" style={{ marginTop: "20px" }}>{error}</p>}

      {!loading && !error && invoices.length === 0 && (
        <div className="at-card" style={{ padding: "40px", marginTop: "28px", textAlign: "center", color: "var(--at-text-muted)" }}>
          No invoices have been generated for your household yet. They will appear here once finalized by the admin.
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "28px" }}>
          {invoices.map((inv) => {
            const cycle = inv.billingCycle || {};

            return (
              <div key={inv.id} className="at-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--at-border-light)", paddingBottom: "16px", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", textTransform: "uppercase", tracking: "0.5px", color: "var(--at-text-muted)", fontWeight: 600 }}>
                      {inv.household?.apartment?.name || "Apartment"} — Flat {inv.household?.flatNumber || "Unknown"} (Invoice #{inv.id})
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--at-ink-deep)", marginTop: "2px" }} className="at-flex at-items-center at-gap-1">
                      <Calendar size={14} color="var(--at-verdigris-deep)" />
                      {cycle.startDate ? formatBillingMonth(cycle.startDate) : ""}
                    </h3>
                  </div>

                  <span style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "10px",
                    fontWeight: 600,
                    background: inv.status === "PAID" ? "#dcfce7" : "#fee2e2",
                    color: inv.status === "PAID" ? "#166534" : "#991b1b"
                  }}>
                    {inv.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--at-text-muted)" }}>Water Usage</span>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--at-verdigris-deep)", marginTop: "2px" }}>
                      {inv.waterUsage ?? "0.000"} liters
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--at-text-muted)" }}>Base Usage Charge</span>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--at-ink-deep)", marginTop: "2px" }}>
                      INR {inv.baseCharge}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--at-text-muted)" }}>Adjustments / Credits</span>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: inv.adjustments < 0 ? "var(--at-verdigris-deep)" : "var(--at-ink-deep)", marginTop: "2px" }}>
                      INR {inv.adjustments}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--at-bg-hover)", padding: "16px", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--at-text-muted)" }}>Invoice Generation Date</span>
                    <div style={{ fontSize: "12px", color: "var(--at-text-muted-deep)", marginTop: "2px" }}>
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "var(--at-text-muted)" }}>Total Invoice Amount</span>
                    <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--at-ink-deep)", marginTop: "2px" }}>
                      INR {inv.total}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "16px", display: "flex", gap: "6px", alignItems: "center", fontSize: "12px", color: "var(--at-text-muted)" }}>
                  <Info size={14} />
                  <span>
                    Billing is calculated solely from household metered water consumption according to the apartment's configured tariff plan.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
