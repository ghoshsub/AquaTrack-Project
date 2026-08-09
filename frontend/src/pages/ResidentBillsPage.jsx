import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Receipt, Calendar, Info, Building2, Droplets, CheckCircle2, Clock,
  Search, Filter, CreditCard, Download, DollarSign,
  AlertCircle, CheckCircle, ShieldCheck, X, FileCheck,
  Smartphone, Landmark, Hash, Tag
} from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listResidentInvoices, payResidentInvoice, downloadResidentInvoicePdf } from "../api/billingApi.js";

function formatBillingMonth(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

function formatPaymentMethodLabel(method) {
  if (!method) return "";
  switch (method.toUpperCase()) {
    case "UPI":         return "UPI / GPay";
    case "CREDIT_CARD": return "Credit Card";
    case "NET_BANKING": return "Net Banking";
    default:            return method;
  }
}

const PAYMENT_METHODS = [
  { id: "UPI",         label: "UPI / GPay",   icon: Smartphone },
  { id: "CREDIT_CARD", label: "Credit Card",  icon: CreditCard },
  { id: "NET_BANKING", label: "Net Banking",  icon: Landmark   },
];

export default function ResidentBillsPage({ auth, setPage }) {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Payment modal states
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  // Toast state
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // Download tracking
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      setError("");
      try {
        const data = await listResidentInvoices(auth.token);
        setInvoices(data.sort((a, b) => b.id - a.id));
      } catch (err) {
        setError(err.message || "Could not retrieve invoices.");
      } finally {
        setLoading(false);
      }
    }
    if (auth?.token) loadInvoices();
  }, [auth?.token]);

  // Aggregate stats
  const totalStatements = invoices.length;
  const totalAmountBilled = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalPaid   = invoices.filter(inv => String(inv.status || "").toUpperCase() === "PAID").reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalUnpaid = invoices.filter(inv => String(inv.status || "").toUpperCase() === "UNPAID").reduce((acc, inv) => acc + (inv.total || 0), 0);
  const unpaidCount = invoices.filter(inv => String(inv.status || "").toUpperCase() === "UNPAID").length;

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const cycleMonth = inv.billingCycle?.startDate ? formatBillingMonth(inv.billingCycle.startDate) : `Invoice #${inv.id}`;
    const matchesSearch = cycleMonth.toLowerCase().includes(searchTerm.toLowerCase());
    const invStatus = String(inv.status || "").toUpperCase();
    const matchesStatus = statusFilter === "ALL" || invStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Payment handlers ──────────────────────────────────────────────────────
  const handleOpenPayment = (inv) => {
    if (String(inv.status || "").toUpperCase() === "PAID") return; // guard
    setPayingInvoice(inv);
    setSelectedMethod("UPI");
    setPayError("");
  };

  const confirmPayment = async () => {
    if (!payingInvoice || paying) return;
    setPaying(true);
    setPayError("");
    try {
      const paidInvoice = await payResidentInvoice(auth.token, payingInvoice.id, selectedMethod);
      // Update invoice in list with full response (includes receipt metadata)
      setInvoices(prev => prev.map(item => item.id === paidInvoice.id ? paidInvoice : item));
      setPaymentSuccess(
        `Payment of ₹${paidInvoice.total} confirmed! Receipt: ${paidInvoice.receiptNumber}`
      );
      setPayingInvoice(null);
      setTimeout(() => setPaymentSuccess(""), 7000);
    } catch (err) {
      if (err.message.includes("already been paid") || err.message.includes("already paid")) {
        // Invoice was paid already — sync state
        setInvoices(prev => prev.map(item =>
          item.id === payingInvoice.id ? { ...item, status: "PAID" } : item
        ));
        setPayingInvoice(null);
        setPaymentSuccess("This invoice was already paid.");
        setTimeout(() => setPaymentSuccess(""), 5000);
      } else {
        setPayError(err.message || "Payment failed. Please try again.");
      }
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadReceipt = async (inv) => {
    setDownloadingId(inv.id);
    try {
      await downloadResidentInvoicePdf(auth.token, inv.id);
    } catch (err) {
      alert("Could not download receipt: " + (err.message || "Unknown error"));
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const cardStyle = {
    background: "var(--admin-card-bg)",
    border: "1px solid var(--admin-card-border)",
    borderRadius: "20px",
    backdropFilter: "blur(20px)",
    boxShadow: "var(--admin-card-shadow)",
  };

  const metaChipStyle = (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 700,
    color,
    background: `${color}18`,
    border: `1px solid ${color}40`,
    borderRadius: "8px",
    padding: "3px 10px",
  });

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto 80px", padding: "0 24px", display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <BackToDashboard setPage={setPage} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.25) 0%, rgba(52,211,153,0.25) 100%)", border: "1px solid rgba(56,189,248,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Receipt size={24} color="#0284C7" />
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0284C7", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("nav.myBills").toUpperCase()}</div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--admin-text-white)", margin: "2px 0 0", letterSpacing: "-0.02em" }}>{t("residentBills.title")}</h1>
            </div>
          </div>
          <div style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", color: "#0284C7", fontSize: "12.5px", fontWeight: 700, padding: "8px 16px", borderRadius: "12px" }}>
            {unpaidCount === 0 ? "✓ Account Clear" : `⚠️ ${unpaidCount} Payment${unpaidCount > 1 ? "s" : ""} Due`}
          </div>
        </div>
      </div>

      {/* ── Success Toast Banner ──────────────────────────────────────────────── */}
      {paymentSuccess && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "14px", padding: "14px 20px", color: "#10B981", fontSize: "14px", fontWeight: 600 }}>
          <CheckCircle size={18} />
          <span>{paymentSuccess}</span>
        </div>
      )}

      {/* ── Summary Stats ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        <div style={{ ...cardStyle, padding: "20px 24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>{t("residentBills.totalStatements")}</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-white)", marginTop: "6px" }}>{totalStatements}</div>
          <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px" }}>Lifetime Billing Records</div>
        </div>
        <div style={{ ...cardStyle, padding: "20px 24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>{t("residentBills.totalBilled")}</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-white)", marginTop: "6px" }}>₹{new Intl.NumberFormat("en-IN").format(Math.round(totalAmountBilled))}</div>
          <div style={{ fontSize: "12px", color: "#10B981", marginTop: "4px", fontWeight: 600 }}>Cumulative Consumption Billed</div>
        </div>
        <div style={{ ...cardStyle, padding: "20px 24px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>{t("residentBills.totalDue")}</div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: totalUnpaid > 0 ? "#F87171" : "#10B981", marginTop: "6px" }}>₹{new Intl.NumberFormat("en-IN").format(Math.round(totalUnpaid))}</div>
          <div style={{ fontSize: "12px", color: totalUnpaid > 0 ? "#F87171" : "var(--admin-text-muted)", marginTop: "4px", fontWeight: 600 }}>
            {totalUnpaid > 0 ? `${unpaidCount} Pending Invoice${unpaidCount > 1 ? "s" : ""}` : "Zero Due"}
          </div>
        </div>
      </div>

      {/* ── Search & Filter ──────────────────────────────────────────────────── */}
      <div style={{ ...cardStyle, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px", maxWidth: "360px" }}>
          <Search size={16} color="var(--admin-text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search invoice by month or number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-input-border)", color: "var(--admin-text-white)", padding: "10px 14px 10px 42px", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={15} color="var(--admin-text-muted)" />
          <span style={{ fontSize: "13px", color: "var(--admin-text-muted)", fontWeight: 600 }}>{t("invoices.filter")}:</span>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: "var(--admin-input-bg)", border: "1px solid var(--admin-input-border)", color: "var(--admin-text-white)", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", outline: "none", cursor: "pointer" }}>
            <option value="ALL">{t("invoices.allStatuses")}</option>
            <option value="UNPAID">{t("invoices.unpaid")}</option>
            <option value="PAID">{t("invoices.paid")}</option>
          </select>
        </div>
      </div>

      {loading && <div style={{ ...cardStyle, padding: "60px", textAlign: "center", color: "var(--admin-text-muted)" }}>Fetching itemized household statements...</div>}
      {error && <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "14px", padding: "18px", color: "#F87171", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}><AlertCircle size={16}/>{error}</div>}

      {!loading && !error && filteredInvoices.length === 0 && (
        <div style={{ ...cardStyle, padding: "60px 20px", textAlign: "center" }}>
          <Receipt size={44} color="#64748B" style={{ display: "block", margin: "0 auto 14px" }} />
          <p style={{ fontSize: "15px", color: "var(--admin-text-muted)", margin: 0, fontWeight: 600 }}>No invoices matching active search/filter.</p>
        </div>
      )}

      {/* ── Invoice Cards ────────────────────────────────────────────────────── */}
      {!loading && !error && filteredInvoices.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredInvoices.map(inv => {
            const cycle  = inv.billingCycle || {};
            const isPaid = String(inv.status || "").toUpperCase() === "PAID";
            const isDownloading = downloadingId === inv.id;

            return (
              <div key={inv.id} style={{ ...cardStyle, padding: "26px", transition: "transform 0.18s ease, border-color 0.18s ease", borderColor: isPaid ? "rgba(16,185,129,0.3)" : "var(--admin-card-border)" }}>

                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--admin-border-muted)", paddingBottom: "18px", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                      <Building2 size={13} color="#0284C7" />
                      {inv.household?.apartment?.name || "Apartment Complex"} • Flat {inv.household?.flatNumber || "Unknown"}
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar size={18} color="#0284C7" />
                      {cycle.startDate ? formatBillingMonth(cycle.startDate) : `Statement #${inv.id}`}
                    </h3>
                  </div>

                  <span style={{ fontSize: "11.5px", fontWeight: 800, padding: "5px 14px", borderRadius: "20px", background: isPaid ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: isPaid ? "#10B981" : "#F87171", border: `1px solid ${isPaid ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "6px" }}>
                    {isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {inv.status}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "22px" }}>
                  <div style={{ background: "var(--admin-subcard-bg)", padding: "16px", borderRadius: "14px", border: "1px solid var(--admin-subcard-border)" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Water Usage</span>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "#0284C7", margin: "4px 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Droplets size={16} />{inv.waterUsage ?? "0.000"} L
                    </p>
                  </div>
                  <div style={{ background: "var(--admin-subcard-bg)", padding: "16px", borderRadius: "14px", border: "1px solid var(--admin-subcard-border)" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Base Tariff</span>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--admin-text-white)", margin: "4px 0 0" }}>₹{inv.baseCharge}</p>
                  </div>
                  <div style={{ background: "var(--admin-subcard-bg)", padding: "16px", borderRadius: "14px", border: "1px solid var(--admin-subcard-border)" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Adjustments</span>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: inv.adjustments < 0 ? "#10B981" : inv.adjustments > 0 ? "#F87171" : "var(--admin-text-muted)", margin: "4px 0 0" }}>₹{inv.adjustments}</p>
                  </div>
                </div>

                {/* Payment metadata chips (PAID only) */}
                {isPaid && inv.receiptNumber && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                    <span style={metaChipStyle("#10B981")}><Hash size={11}/> {inv.receiptNumber}</span>
                    <span style={metaChipStyle("#8B5CF6")}><Tag size={11}/> {inv.transactionId}</span>
                    <span style={metaChipStyle("#0284C7")}><CreditCard size={11}/> {formatPaymentMethodLabel(inv.paymentMethod)}</span>
                    {inv.paymentDate && (
                      <span style={metaChipStyle("#D97706")}><Calendar size={11}/> Paid {new Date(inv.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                )}

                {/* Total & Action Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isPaid ? "rgba(16,185,129,0.06)" : "rgba(56,189,248,0.06)", border: `1px solid ${isPaid ? "rgba(16,185,129,0.2)" : "rgba(56,189,248,0.2)"}`, padding: "18px 24px", borderRadius: "16px", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Issued</span>
                    <div style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", marginTop: "2px", fontWeight: 600 }}>
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Total Payable</span>
                      <p style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-white)", margin: "2px 0 0" }}>₹{new Intl.NumberFormat("en-IN").format(inv.total)}</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {isPaid ? (
                        /* Download Receipt button — replaces Pay Now */
                        <button
                          onClick={() => handleDownloadReceipt(inv)}
                          disabled={isDownloading}
                          style={{
                            background: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)",
                            border: "1px solid rgba(16,185,129,0.4)",
                            color: "#10B981",
                            fontWeight: 800,
                            fontSize: "13px",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            cursor: isDownloading ? "wait" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            opacity: isDownloading ? 0.7 : 1,
                            transition: "all 0.18s ease",
                          }}
                        >
                          {isDownloading ? <Clock size={15} /> : <FileCheck size={15} />}
                          {isDownloading ? "Downloading..." : "Download Receipt"}
                        </button>
                      ) : (
                        /* Pay Bill button */
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          style={{
                            background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                            border: "none",
                            color: "#0F172A",
                            fontWeight: 800,
                            fontSize: "13.5px",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(56,189,248,0.3)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <CreditCard size={15} /> Pay Bill
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAYMENT MODAL ─────────────────────────────────────────────────────── */}
      {payingInvoice && (
        <div style={{ position: "fixed", inset: 0, background: "var(--admin-modal-backdrop)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "var(--admin-modal-bg)", border: "1px solid var(--admin-modal-border)", borderRadius: "24px", padding: "32px", maxWidth: "480px", width: "100%", boxShadow: "var(--admin-card-shadow)" }}>

            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={20} color="#0284C7" />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0 }}>Confirm Payment</h3>
                  <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>Secure & encrypted transaction</p>
                </div>
              </div>
              <button onClick={() => !paying && setPayingInvoice(null)} style={{ background: "var(--at-btn-secondary-bg)", border: "1px solid var(--at-btn-secondary-border)", color: "var(--admin-text-muted)", cursor: "pointer", borderRadius: "8px", padding: "6px", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            {/* Invoice Summary */}
            <div style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Invoice #{payingInvoice.id}</div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--admin-text-white)", marginTop: "4px", letterSpacing: "-0.03em" }}>₹{new Intl.NumberFormat("en-IN").format(payingInvoice.total)}</div>
              <div style={{ fontSize: "13px", color: "#0284C7", marginTop: "4px", fontWeight: 600 }}>
                {payingInvoice.household?.apartment?.name} • Flat {payingInvoice.household?.flatNumber}
              </div>
              <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px" }}>
                {payingInvoice.billingCycle?.startDate ? formatBillingMonth(payingInvoice.billingCycle.startDate) : "—"} billing period
              </div>
            </div>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
                Select Payment Method
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
                  const isSelected = selectedMethod === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedMethod(id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: `1.5px solid ${isSelected ? "#0284C7" : "var(--admin-card-border)"}`,
                        background: isSelected ? "rgba(56,189,248,0.12)" : "var(--admin-subcard-bg)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: isSelected ? "rgba(56,189,248,0.2)" : "var(--admin-input-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={18} color={isSelected ? "#0284C7" : "var(--admin-text-muted)"} />
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: isSelected ? 700 : 600, color: isSelected ? "var(--admin-text-white)" : "var(--admin-text-muted)" }}>{label}</span>
                      {isSelected && (
                        <CheckCircle2 size={16} color="#0284C7" style={{ marginLeft: "auto" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {payError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#F87171", fontSize: "13px", marginBottom: "16px" }}>
                <AlertCircle size={15} /> {payError}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setPayingInvoice(null)}
                disabled={paying}
                style={{ flex: 1, background: "var(--at-btn-secondary-bg)", border: "1px solid var(--at-btn-secondary-border)", color: "var(--admin-text-white)", padding: "13px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "14px", opacity: paying ? 0.5 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={paying}
                style={{
                  flex: 2,
                  background: paying ? "rgba(56,189,248,0.4)" : "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                  border: "none",
                  color: "#0F172A",
                  padding: "13px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  cursor: paying ? "wait" : "pointer",
                  boxShadow: paying ? "none" : "0 4px 18px rgba(56,189,248,0.4)",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.18s ease",
                }}
              >
                {paying ? (
                  <><Clock size={16} /> Processing...</>
                ) : (
                  <><ShieldCheck size={16} /> Confirm Payment</>
                )}
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: "11px", color: "#475569", marginTop: "16px", marginBottom: 0 }}>
              🔒 All transactions are secured and encrypted
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
