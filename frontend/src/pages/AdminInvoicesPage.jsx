import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Coins, Search, Edit3, CheckCircle, Clock, Building2, Calendar, FileText, Printer, Filter, X, TrendingUp, AlertCircle, Download } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { listBillingCycles, getInvoicesByCycle, updateInvoiceAdjustments, downloadAdminInvoiceReceiptPdf } from "../api/billingApi.js";

function formatRupees(amount) {
  return "₹ " + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
}

function formatLiters(value) {
  return new Intl.NumberFormat("en-IN").format(Math.round(value || 0)) + " L";
}

const inputBase = {
  width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "all 0.2s ease",
};

const cardStyle = {
  background: "var(--admin-card-bg)",
  border: "1px solid var(--admin-card-border)",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  boxShadow: "var(--admin-card-shadow)",
};

function StatCard({ title, label, value, sub, color, icon: Icon }) {
  const displayTitle = title || label;
  return (
    <div style={{ ...cardStyle, padding: "20px", flex: 1, minWidth: "180px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)" }}>{displayTitle}</span>
        {Icon && (
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: color || "var(--admin-text-white)", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "var(--admin-text-muted)", marginTop: "4px" }}>{sub}</div>
    </div>
  );
}

const KpiCard = StatCard;

export default function AdminInvoicesPage({ auth, setPage }) {
  const { t } = useTranslation();
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [invoices, setInvoices] = useState([]);

  const [loadingApartments, setLoadingApartments] = useState(true);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [updatingAdjustment, setUpdatingAdjustment] = useState(false);

  const [viewInvoice, setViewInvoice] = useState(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    async function loadApartments() {
      setLoadingApartments(true);
      setError("");
      try {
        const data = await listApartments(auth.token);
        const list = data || [];
        setApartments(list);
        if (list.length > 0 && !selectedApartmentId) setSelectedApartmentId(String(list[0].id));
      } catch (err) {
        setError(err.message || "Failed to load apartments.");
        setApartments([]);
      } finally {
        setLoadingApartments(false);
      }
    }
    loadApartments();
  }, [auth.token]);

  useEffect(() => {
    async function loadCycles() {
      if (!selectedApartmentId) { setCycles([]); setSelectedCycleId(""); setInvoices([]); return; }
      setLoadingCycles(true);
      setError("");
      try {
        const data = await listBillingCycles(auth.token, selectedApartmentId);
        const list = data || [];
        setCycles(list);
        if (list.length > 0) setSelectedCycleId(String(list[0].id));
        else { setSelectedCycleId(""); setInvoices([]); }
      } catch (err) {
        setError(err.message || "Failed to load cycles.");
        setCycles([]);
        setSelectedCycleId("");
        setInvoices([]);
      } finally {
        setLoadingCycles(false);
      }
    }
    loadCycles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId, auth.token]);

  useEffect(() => {
    async function loadInvoices() {
      if (!selectedCycleId) { setInvoices([]); return; }
      setLoadingInvoices(true);
      setError("");
      try {
        const data = await getInvoicesByCycle(auth.token, selectedCycleId);
        setInvoices(data || []);
      } catch (err) {
        setError(err.message || "Failed to load invoices.");
        setInvoices([]);
      } finally {
        setLoadingInvoices(false);
      }
    }
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycleId, auth.token]);

  async function handleSaveAdjustment(e) {
    e.preventDefault();
    if (!editingInvoice) return;
    setUpdatingAdjustment(true);
    try {
      await updateInvoiceAdjustments(auth.token, editingInvoice.id, Number(adjustmentValue));
      setEditingInvoice(null);
      setAdjustmentValue("");
      if (selectedCycleId) {
        const data = await getInvoicesByCycle(auth.token, selectedCycleId);
        setInvoices(data || []);
      }
    } catch (err) {
      alert(err.message || "Failed to update invoice adjustment.");
    } finally {
      setUpdatingAdjustment(false);
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    const flatNum = inv.household?.flatNumber || "";
    const resEmail = inv.household?.residentEmail || "";
    const matchesSearch = flatNum.toLowerCase().includes(searchTerm.toLowerCase()) || resEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || (inv.status || "UNPAID") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = invoices.filter((inv) => inv.status === "PAID").reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalUnpaid = totalBilled - totalPaid;
  const avgBill = invoices.length > 0 ? totalBilled / invoices.length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <BackToDashboard setPage={setPage} />
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "16px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(56,189,248,0.2) 100%)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coins size={24} color="#A78BFA" />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("invoices.title")}</h1>
              <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: "2px 0 0" }}>{t("invoices.subheading")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector Bar */}
      <div style={{ ...cardStyle, padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{t("billing.apartment")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Building2 size={16} color="#38BDF8" />
              <select value={selectedApartmentId} onChange={(e) => setSelectedApartmentId(e.target.value)}
                style={{ ...inputBase, minWidth: "220px" }}>
                {apartments.length === 0 && <option value="">No apartments available</option>}
                {apartments.map((apt) => <option key={apt.id} value={apt.id}>{apt.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{t("invoices.billingCycle")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} color="#38BDF8" />
              <select value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)} disabled={cycles.length === 0}
                style={{ ...inputBase, minWidth: "240px", opacity: cycles.length === 0 ? 0.5 : 1 }}>
                {cycles.length === 0 ? <option value="">No billing cycles found</option> : cycles.map((c) => (
                  <option key={c.id} value={c.id}>Cycle #{c.id} ({c.startDate} → {c.endDate}) — {c.status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748B" }} />
            <input type="text" placeholder={t("common.search")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputBase, paddingLeft: "36px", width: "220px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={15} color="#64748B" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputBase }}>
              <option value="ALL">{t("invoices.allStatuses")}</option>
              <option value="UNPAID">{t("invoices.unpaid")}</option>
              <option value="PAID">{t("invoices.paid")}</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13.5px" }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <KpiCard label={t("dashboard.totalBilled")} value={formatRupees(totalBilled)} sub={`${invoices.length} invoices`} color="#38BDF8" icon={Coins} gradient="linear-gradient(90deg, #38BDF8, #6366F1)" />
        <KpiCard label={t("invoices.paid")} value={formatRupees(totalPaid)} sub="Cleared" color="#34D399" icon={CheckCircle} gradient="linear-gradient(90deg, #34D399, #10B981)" />
        <KpiCard label={t("invoices.unpaid")} value={formatRupees(totalUnpaid)} sub="Pending" color="#FBBF24" icon={Clock} gradient="linear-gradient(90deg, #FBBF24, #F59E0B)" />
        <KpiCard label={t("invoices.total")} value={formatRupees(avgBill)} sub="Average" color="#A78BFA" icon={TrendingUp} gradient="linear-gradient(90deg, #A78BFA, #8B5CF6)" />
      </div>

      {/* Main Table */}
      <div style={{ ...cardStyle, overflow: "hidden" }}>
        {loadingInvoices || loadingCycles || loadingApartments ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94A3B8" }}>Loading invoice data…</div>
        ) : filteredInvoices.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#64748B" }}>
            <Coins size={44} color="#334155" style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
            {selectedCycleId ? "No invoices match the current filter criteria." : "Please select an apartment and billing cycle above."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "16px 18px" }}>Flat / Household</th>
                  <th style={{ padding: "16px 18px" }}>Resident</th>
                  <th style={{ padding: "16px 18px" }}>Consumption</th>
                  <th style={{ padding: "16px 18px" }}>Base Charge</th>
                  <th style={{ padding: "16px 18px" }}>Adjustments</th>
                  <th style={{ padding: "16px 18px" }}>Total Bill</th>
                  <th style={{ padding: "16px 18px" }}>Status</th>
                  <th style={{ padding: "16px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === "PAID";
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.18s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Coins size={14} color="#A78BFA" />
                          </div>
                          <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "14px" }}>Flat {inv.household?.flatNumber || "N/A"}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 18px", color: "#94A3B8", fontSize: "13px" }}>
                        {inv.household?.residentEmail || <span style={{ color: "#475569" }}>No email</span>}
                      </td>
                      <td style={{ padding: "16px 18px", color: "#38BDF8", fontWeight: 600, fontSize: "13.5px" }}>{formatLiters(inv.waterUsage)}</td>
                      <td style={{ padding: "16px 18px", color: "#FFFFFF", fontWeight: 600, fontSize: "13.5px" }}>{formatRupees(inv.baseCharge)}</td>
                      <td style={{ padding: "16px 18px", fontWeight: 700, fontSize: "13.5px", color: inv.adjustments < 0 ? "#34D399" : inv.adjustments > 0 ? "#F87171" : "#94A3B8" }}>
                        {formatRupees(inv.adjustments)}
                      </td>
                      <td style={{ padding: "16px 18px", fontWeight: 800, fontSize: "15px", color: "#38BDF8" }}>{formatRupees(inv.total)}</td>
                      <td style={{ padding: "16px 18px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 11px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: isPaid ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: isPaid ? "#34D399" : "#FBBF24", border: `1px solid ${isPaid ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}` }}>
                          {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {inv.status || "UNPAID"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button onClick={() => { setEditingInvoice(inv); setAdjustmentValue(String(inv.adjustments || 0)); }}
                            style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", color: "#38BDF8", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 600 }}>
                            <Edit3 size={13} /> Adjust
                          </button>
                          <button onClick={() => setViewInvoice(inv)}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94A3B8", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 600 }}>
                            <FileText size={13} /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {editingInvoice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "rgba(17,26,42,0.98)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "28px", width: "90%", maxWidth: "440px", color: "#FFF", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Update Invoice Adjustment</h3>
              <button onClick={() => setEditingInvoice(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#94A3B8", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "20px" }}>
              <strong style={{ color: "#FFFFFF" }}>Flat {editingInvoice.household?.flatNumber}</strong> — Current Total: <strong style={{ color: "#38BDF8" }}>{formatRupees(editingInvoice.total)}</strong>
            </p>
            <form onSubmit={handleSaveAdjustment}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Adjustment Amount (₹)</label>
                <input type="number" step="0.01" value={adjustmentValue} onChange={(e) => setAdjustmentValue(e.target.value)} placeholder="e.g. -50.00 (discount) or 100.00 (penalty)" required
                  style={{ ...inputBase, width: "100%", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
                />
                <span style={{ fontSize: "11.5px", color: "#64748B", marginTop: "5px", display: "block" }}>Use negative values for discounts/credits, positive for penalties.</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setEditingInvoice(null)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94A3B8", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={updatingAdjustment}
                  style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 800, padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                  {updatingAdjustment ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {viewInvoice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "rgba(17,26,42,0.98)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "30px", width: "90%", maxWidth: "560px", color: "#FFF", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Invoice #{viewInvoice.id} Details</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: viewInvoice.status === "PAID" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)", color: viewInvoice.status === "PAID" ? "#34D399" : "#FBBF24" }}>
                  {viewInvoice.status || "UNPAID"}
                </span>
                <button onClick={() => setViewInvoice(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#94A3B8", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}><X size={16} /></button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", fontSize: "14px" }}>
              {[
                ["Flat Number", `Flat ${viewInvoice.household?.flatNumber}`],
                ["Resident Email", viewInvoice.household?.residentEmail || "N/A"],
                ["Consumption", formatLiters(viewInvoice.waterUsage)],
                ["Flat / Occupancy", `${viewInvoice.household?.flatSize || "—"} sq.ft (${viewInvoice.household?.occupancy || 1} residents)`],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontWeight: 700, color: "#FFFFFF" }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: "12px", padding: "18px", marginBottom: "20px", fontSize: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#94A3B8" }}>Base Charge:</span>
                <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{formatRupees(viewInvoice.baseCharge)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#94A3B8" }}>Adjustments:</span>
                <span style={{ fontWeight: 600, color: viewInvoice.adjustments < 0 ? "#34D399" : viewInvoice.adjustments > 0 ? "#F87171" : "#94A3B8" }}>{formatRupees(viewInvoice.adjustments)}</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "17px", color: "#38BDF8" }}>
                <span>Total Bill Amount:</span>
                <span>{formatRupees(viewInvoice.total)}</span>
              </div>
            </div>

            {/* Payment Details — shown only for PAID invoices */}
            {viewInvoice.status === "PAID" && viewInvoice.receiptNumber && (
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", padding: "18px", marginBottom: "20px", fontSize: "13px" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>Payment Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    ["Receipt No.",      viewInvoice.receiptNumber],
                    ["Transaction ID",   viewInvoice.transactionId],
                    ["Payment Method",   viewInvoice.paymentMethod === "CREDIT_CARD" ? "Credit Card" : viewInvoice.paymentMethod === "NET_BANKING" ? "Net Banking" : "UPI / GPay"],
                    ["Paid On",          viewInvoice.paymentDate ? new Date(viewInvoice.paymentDate).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: "rgba(16,185,129,0.06)", borderRadius: "8px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</div>
                      <div style={{ fontWeight: 700, color: "#34D399", fontSize: "12.5px", wordBreak: "break-all" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              {viewInvoice.status === "PAID" && (
                <button
                  onClick={async () => {
                    setDownloadingReceipt(true);
                    try {
                      await downloadAdminInvoiceReceiptPdf(auth.token, viewInvoice.id);
                    } catch (e) {
                      alert("Could not download receipt: " + e.message);
                    } finally {
                      setDownloadingReceipt(false);
                    }
                  }}
                  disabled={downloadingReceipt}
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#34D399", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontFamily: "inherit", fontWeight: 700, fontSize: "13px" }}
                >
                  <Download size={15} /> {downloadingReceipt ? "Downloading..." : "Download Receipt"}
                </button>
              )}
              <button onClick={() => window.print()}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94A3B8", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontFamily: "inherit", fontWeight: 600 }}>
                <Printer size={16} /> Print
              </button>
              <button onClick={() => setViewInvoice(null)}
                style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 800, padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
