import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Receipt, Plus, Calendar, Building2, CheckCircle2, AlertCircle,
  Droplets, Edit2, Send, Download, Check, X, ChevronRight, Clock,
  Coins, FileText, Sparkles, Filter, Mail, RefreshCw
} from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import {
  listBillingCycles, openBillingCycle, updateBillingCycle,
  getBillingCycleDetails, finalizeBillingCycle, archiveBillingCycle,
  getCycleUsagePreviews, updateInvoiceAdjustments, sendInvoiceEmail,
  downloadAdminInvoiceReceiptPdf, updateAdminInvoice, regenerateBillingCycle
} from "../api/billingApi.js";

const inputBase = {
  width: "100%",
  background: "var(--admin-input-bg)",
  border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)",
  padding: "11px 14px",
  borderRadius: "12px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
};

function SaasInput({ type = "text", ...props }) {
  return (
    <input
      type={type}
      style={inputBase}
      {...props}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--admin-accent)";
        e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--admin-input-border)";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

function SaasSelect({ children, ...props }) {
  return (
    <select
      style={inputBase}
      {...props}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--admin-accent)";
        e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--admin-input-border)";
        e.target.style.boxShadow = "none";
      }}
    >
      {children}
    </select>
  );
}

function formatMonthTitle(yearMonthStr) {
  if (!yearMonthStr) return "";
  const parts = yearMonthStr.split("-");
  if (parts.length < 2) return yearMonthStr;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const mIndex = parseInt(parts[1], 10) - 1;
  return `${months[mIndex] || parts[1]} ${parts[0]}`;
}

function CycleStatusBadge({ status }) {
  const map = {
    OPEN: { bg: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", border: "rgba(56, 189, 248, 0.35)", label: "Draft / Open" },
    FINALIZED: { bg: "rgba(245, 158, 11, 0.15)", color: "#FBBF24", border: "rgba(245, 158, 11, 0.35)", label: "Finalized & Invoiced" },
    ARCHIVED: { bg: "rgba(100, 116, 139, 0.15)", color: "#94A3B8", border: "rgba(100, 116, 139, 0.3)", label: "Archived" },
  };
  const s = map[status] || map.ARCHIVED;
  return (
    <span
      style={{
        fontSize: "11.5px",
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: "20px",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

const sectionCardStyle = {
  background: "var(--admin-card-bg)",
  border: "1px solid var(--admin-card-border)",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  boxShadow: "var(--admin-card-shadow)",
  padding: "26px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

export default function AdminBillingPage({ auth, setPage }) {
  const { t } = useTranslation();
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError, setApartmentsError] = useState("");

  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [cyclesError, setCyclesError] = useState("");

  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [cycleDetails, setCycleDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Month-wise Creation & Editing state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [editingCycleId, setEditingCycleId] = useState(null);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [savingCycle, setSavingCycle] = useState(false);

  // Household usage & Invoices state
  const [householdReadings, setHouseholdReadings] = useState([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [tempAdjustments, setTempAdjustments] = useState("");
  const [updatingInvoice, setUpdatingInvoice] = useState(false);

  // Email status feedback map: { [invoiceId]: { sending: boolean, success: boolean, message: string } }
  const [emailStatus, setEmailStatus] = useState({});

  // Full Resident Invoice Edit Modal state
  const [editingModalInvoice, setEditingModalInvoice] = useState(null);
  const [modalEmail, setModalEmail] = useState("");
  const [modalUsage, setModalUsage] = useState("");
  const [modalBaseCharge, setModalBaseCharge] = useState("");
  const [modalAdjustments, setModalAdjustments] = useState("");
  const [modalTotal, setModalTotal] = useState("");
  const [modalStatus, setModalStatus] = useState("UNPAID");
  const [savingModalInvoice, setSavingModalInvoice] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Cycle Regeneration & feedback state
  const [regeneratingCycleId, setRegeneratingCycleId] = useState(null);
  const [actionNotice, setActionNotice] = useState("");

  useEffect(() => {
    async function fetchApartments() {
      try {
        const data = await listApartments(auth.token);
        setApartments(data);
        if (data && data.length > 0) {
          setSelectedApartmentId(String(data[0].id));
        }
      } catch (err) {
        setApartmentsError(err.message || "Failed to load apartments.");
      }
    }
    fetchApartments();
  }, [auth]);

  useEffect(() => {
    if (!selectedApartmentId) return;
    loadCycles(selectedApartmentId);
  }, [selectedApartmentId, auth]);

  async function loadCycles(apId) {
    setLoadingCycles(true);
    setCyclesError("");
    try {
      const data = await listBillingCycles(auth.token, apId);
      setCycles(data || []);
      // If there's an OPEN cycle or finalized cycle, auto-select details
      if (data && data.length > 0) {
        const openCycle = data.find((c) => c.status === "OPEN") || data[0];
        setSelectedCycleId(openCycle.id);
        fetchCycleDetails(openCycle.id);
      } else {
        setSelectedCycleId(null);
        setCycleDetails(null);
      }
    } catch (err) {
      setCyclesError(err.message || "Failed to load billing cycles.");
    } finally {
      setLoadingCycles(false);
    }
  }

  async function fetchCycleDetails(cId) {
    setLoadingDetails(true);
    setDetailsError("");
    try {
      const details = await getBillingCycleDetails(auth.token, cId);
      setCycleDetails(details);

      if (details.status === "OPEN") {
        const previews = await getCycleUsagePreviews(auth.token, cId);
        setHouseholdReadings(
          previews.map((p) => ({
            householdId: p.householdId,
            flatNumber: p.flatNumber,
            readingValue: p.usage != null ? String(p.usage) : "0",
          }))
        );
      }
    } catch (err) {
      setDetailsError(err.message || "Failed to load cycle details.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleCreateOrUpdateCycle(e) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    if (!selectedApartmentId) {
      setCreateError("Please select an apartment first.");
      return;
    }
    if (!selectedMonth) {
      setCreateError("Please pick a billing month (YYYY-MM).");
      return;
    }

    setSavingCycle(true);
    try {
      if (editingCycleId) {
        // Update existing OPEN cycle
        const updated = await updateBillingCycle(auth.token, editingCycleId, {
          apartmentId: Number(selectedApartmentId),
          month: selectedMonth,
        });
        setCreateSuccess(`Billing Cycle updated to ${formatMonthTitle(selectedMonth)} successfully!`);
        setEditingCycleId(null);
        await loadCycles(selectedApartmentId);
        fetchCycleDetails(updated.id);
      } else {
        // Create new Month-wise Cycle
        const newCycle = await openBillingCycle(auth.token, {
          apartmentId: Number(selectedApartmentId),
          month: selectedMonth,
        });
        setCreateSuccess(`New Month-Wise Billing Cycle created for ${formatMonthTitle(selectedMonth)}!`);
        await loadCycles(selectedApartmentId);
        setSelectedCycleId(newCycle.id);
        fetchCycleDetails(newCycle.id);
      }
    } catch (err) {
      setCreateError(err.message || "Failed to save billing cycle.");
    } finally {
      setSavingCycle(false);
    }
  }

  function handleStartEditCycle(c) {
    if (c.status !== "OPEN") {
      alert("Only OPEN / Draft billing cycles can be edited.");
      return;
    }
    setEditingCycleId(c.id);
    if (c.startDate) {
      const parts = c.startDate.split("-");
      if (parts.length >= 2) {
        setSelectedMonth(`${parts[0]}-${parts[1]}`);
      }
    }
    setCreateError("");
    setCreateSuccess("");
    window.scrollTo({ top: 150, behavior: "smooth" });
  }

  async function handleFinalizeCycle(cId) {
    if (!window.confirm("Finalize this billing cycle and generate invoices for all households?")) return;
    setDetailsError("");
    try {
      const payload = {
        readings: householdReadings.map((r) => ({
          householdId: r.householdId,
          readingValue: Number(r.readingValue || 0),
        })),
      };
      await finalizeBillingCycle(auth.token, cId, payload);
      await loadCycles(selectedApartmentId);
      fetchCycleDetails(cId);
    } catch (err) {
      setDetailsError(err.message || "Failed to finalize billing cycle.");
    }
  }

  async function handleArchiveCycle(cId) {
    if (!window.confirm("Archive this finalized billing cycle?")) return;
    try {
      await archiveBillingCycle(auth.token, cId);
      await loadCycles(selectedApartmentId);
      fetchCycleDetails(cId);
    } catch (err) {
      setDetailsError(err.message || "Failed to archive billing cycle.");
    }
  }

  async function handleSendIndividualEmail(invoice) {
    const invId = invoice.id;
    const recipient = invoice.household?.user?.email || invoice.household?.residentEmail || "Resident";
    setEmailStatus((prev) => ({
      ...prev,
      [invId]: { sending: true, success: false, message: "Sending invoice email..." },
    }));

    try {
      const res = await sendInvoiceEmail(auth.token, invId);
      setEmailStatus((prev) => ({
        ...prev,
        [invId]: { sending: false, success: true, message: res.message || `Sent to ${recipient}` },
      }));
      setTimeout(() => {
        setEmailStatus((prev) => {
          const copy = { ...prev };
          delete copy[invId];
          return copy;
        });
      }, 5000);
    } catch (err) {
      setEmailStatus((prev) => ({
        ...prev,
        [invId]: { sending: false, success: false, message: err.message || "Failed to send email" },
      }));
    }
  }

  async function handleSaveAdjustments(invoiceId) {
    setUpdatingInvoice(true);
    try {
      await updateInvoiceAdjustments(auth.token, invoiceId, Number(tempAdjustments || 0));
      setEditingInvoiceId(null);
      fetchCycleDetails(selectedCycleId);
    } catch (err) {
      alert(err.message || "Failed to update adjustments.");
    } finally {
      setUpdatingInvoice(false);
    }
  }

  function handleOpenEditInvoice(inv) {
    const email = inv.household?.user?.email || inv.household?.residentEmail || "";
    setEditingModalInvoice(inv);
    setModalEmail(email);
    setModalUsage(inv.waterUsage != null ? String(inv.waterUsage) : "0");
    setModalBaseCharge(inv.baseCharge != null ? String(inv.baseCharge) : "0");
    setModalAdjustments(inv.adjustments != null ? String(inv.adjustments) : "0.00");
    setModalTotal(inv.total != null ? String(inv.total) : "0");
    setModalStatus(inv.status || "UNPAID");
    setModalError("");
    setModalSuccess("");
  }

  function handleModalUsageChange(newUsageStr) {
    setModalUsage(newUsageStr);
    const usageNum = parseFloat(newUsageStr) || 0;
    const tariff = selectedApartment?.tariffPlan;
    if (tariff && tariff.baseTierLimit != null && tariff.baseRate != null && tariff.excessRate != null) {
      const tierLimit = Number(tariff.baseTierLimit);
      const baseRate = Number(tariff.baseRate);
      const excessRate = Number(tariff.excessRate);
      let calculatedBase = 0;
      if (usageNum <= tierLimit) {
        calculatedBase = usageNum * baseRate;
      } else {
        calculatedBase = (tierLimit * baseRate) + ((usageNum - tierLimit) * excessRate);
      }
      setModalBaseCharge(calculatedBase.toFixed(2));
      const adjNum = parseFloat(modalAdjustments) || 0;
      setModalTotal((calculatedBase + adjNum).toFixed(2));
    } else {
      const baseNum = parseFloat(modalBaseCharge) || 0;
      const adjNum = parseFloat(modalAdjustments) || 0;
      setModalTotal((baseNum + adjNum).toFixed(2));
    }
  }

  function handleModalBaseChargeChange(newBaseStr) {
    setModalBaseCharge(newBaseStr);
    const baseNum = parseFloat(newBaseStr) || 0;
    const adjNum = parseFloat(modalAdjustments) || 0;
    setModalTotal((baseNum + adjNum).toFixed(2));
  }

  function handleModalAdjustmentsChange(newAdjStr) {
    setModalAdjustments(newAdjStr);
    const baseNum = parseFloat(modalBaseCharge) || 0;
    const adjNum = parseFloat(newAdjStr) || 0;
    setModalTotal((baseNum + adjNum).toFixed(2));
  }

  async function handleSaveModalInvoice(e) {
    e.preventDefault();
    if (!editingModalInvoice) return;
    setSavingModalInvoice(true);
    setModalError("");
    try {
      const payload = {
        residentEmail: modalEmail.trim(),
        waterUsage: parseFloat(modalUsage) || 0,
        baseCharge: parseFloat(modalBaseCharge) || 0,
        adjustments: parseFloat(modalAdjustments) || 0,
        total: parseFloat(modalTotal) || 0,
        status: modalStatus,
      };
      await updateAdminInvoice(auth.token, editingModalInvoice.id, payload);
      setModalSuccess("Invoice updated successfully!");
      await fetchCycleDetails(selectedCycleId);
      await loadCycles(selectedApartmentId);
      setTimeout(() => {
        setEditingModalInvoice(null);
        setModalSuccess("");
      }, 900);
    } catch (err) {
      setModalError(err.message || "Failed to update invoice.");
    } finally {
      setSavingModalInvoice(false);
    }
  }

  async function handleQuickTogglePayment(inv) {
    const nextStatus = inv.status === "PAID" ? "UNPAID" : "PAID";
    try {
      await updateAdminInvoice(auth.token, inv.id, { status: nextStatus });
      await fetchCycleDetails(selectedCycleId);
    } catch (err) {
      alert("Failed to toggle payment status: " + (err.message || ""));
    }
  }

  async function handleRegenerateCycle(cId) {
    setRegeneratingCycleId(cId);
    setDetailsError("");
    setCyclesError("");
    try {
      await regenerateBillingCycle(auth.token, cId);
      setActionNotice(`Billing Cycle #${cId} regenerated and updated successfully!`);
      setTimeout(() => setActionNotice(""), 6000);
      await loadCycles(selectedApartmentId);
      if (selectedCycleId === cId) {
        await fetchCycleDetails(cId);
      }
    } catch (err) {
      setCyclesError(err.message || `Failed to regenerate cycle #${cId}`);
    } finally {
      setRegeneratingCycleId(null);
    }
  }

  const selectedApartment = apartments.find((a) => String(a.id) === selectedApartmentId);

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px", paddingTop: "5px", paddingBottom: "35px" }}>
      <BackToDashboard onBack={() => setPage("dashboard")} />

      {/* Main Page Title Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)",
              border: "1px solid rgba(56,189,248,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(56,189,248,0.2)",
            }}
          >
            <Receipt size={24} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>
              Billing Cycles & Invoicing
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", margin: "3px 0 0" }}>
              Configure month-wise billing cycles, preview household consumption, and dispatch individual invoices
            </p>
          </div>
        </div>

        {selectedApartment && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--admin-subcard-bg)",
              border: "1px solid var(--admin-card-border)",
              borderRadius: "14px",
              padding: "8px 16px",
            }}
          >
            <Building2 size={16} color="#38BDF8" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-white)" }}>
              {selectedApartment.name}
            </span>
          </div>
        )}
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "14px", padding: "13px 18px", color: "#34D399", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 600 }}>
          <CheckCircle2 size={18} /> <span>{actionNotice}</span>
        </div>
      )}

      {/* ========================================================
          SECTION 1: APARTMENT SELECTOR & MONTH-WISE CREATION/EDITING
          ======================================================== */}
      <div style={sectionCardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Calendar size={20} color="#38BDF8" />
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>
                1. Apartment & Month-Wise Billing Creation
              </h2>
              <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                Select apartment and month — open or regenerate unlimited times without errors
              </span>
            </div>
          </div>
          {editingCycleId && (
            <button
              onClick={() => { setEditingCycleId(null); setCreateError(""); setCreateSuccess(""); }}
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#F87171", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
            >
              <X size={14} /> Cancel Edit
            </button>
          )}
        </div>

        {createError && (
          <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={16} /> <span>{createError}</span>
          </div>
        )}

        {createSuccess && (
          <div style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#34D399", fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={16} /> <span>{createSuccess}</span>
          </div>
        )}

        <form onSubmit={handleCreateOrUpdateCycle} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", alignItems: "end" }}>
          {/* Apartment Selector */}
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
              Select Apartment *
            </label>
            <SaasSelect
              value={selectedApartmentId}
              onChange={(e) => setSelectedApartmentId(e.target.value)}
              required
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.address})
                </option>
              ))}
            </SaasSelect>
          </div>

          {/* Month-Wise Selector (YYYY-MM) */}
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "6px" }}>
              Billing Month (YYYY-MM) *
            </label>
            <SaasInput
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              required
            />
          </div>

          {/* Submit / Action Button */}
          <div>
            <button
              type="submit"
              disabled={savingCycle}
              style={{
                width: "100%",
                background: editingCycleId
                  ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                  : "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                border: "none",
                color: "#0F172A",
                fontWeight: 700,
                fontSize: "14px",
                padding: "12px",
                borderRadius: "12px",
                cursor: savingCycle ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(56, 189, 248, 0.35)",
                fontFamily: "inherit",
              }}
            >
              {savingCycle ? (
                "Saving..."
              ) : editingCycleId ? (
                <>
                  <Edit2 size={16} /> Update Billing Month
                </>
              ) : (
                <>
                  <RefreshCw size={16} /> Open / Regenerate Month Billing Cycle
                </>
              )}
            </button>
          </div>
        </form>

        {selectedMonth && (
          <div style={{ fontSize: "12.5px", color: "var(--admin-text-muted)", background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={15} color="#38BDF8" />
            <span>
              Target: <strong>{formatMonthTitle(selectedMonth)}</strong> — Recalculates from tariff plan. Click again anytime to regenerate invoices.
            </span>
          </div>
        )}
      </div>

      {/* ========================================================
          SECTION 2: BILLING CYCLE HISTORY
          ======================================================== */}
      <div style={{ ...sectionCardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--admin-card-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={20} color="#818CF8" />
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>
                2. Billing Cycle History
              </h2>
              <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                View and manage created billing cycles for {selectedApartment?.name || "selected apartment"}
              </span>
            </div>
          </div>
          <button
            onClick={() => loadCycles(selectedApartmentId)}
            style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", color: "var(--admin-text-white)", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {cyclesError && (
          <div style={{ padding: "16px 24px", color: "#F87171", fontSize: "13px" }}>{cyclesError}</div>
        )}

        {loadingCycles ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)" }}>
            Loading billing cycles...
          </div>
        ) : cycles.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "14px" }}>
            No billing cycles found for this apartment. Open a new month cycle above to get started.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: "var(--admin-subcard-bg)", borderBottom: "1px solid var(--admin-card-border)" }}>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Cycle ID</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Month / Period</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Status</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Invoices</th>
                  <th style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((c) => {
                  const isSelected = selectedCycleId === c.id;
                  const monthLabel = c.startDate ? formatMonthTitle(c.startDate.substring(0, 7)) : `Cycle #${c.id}`;
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: "1px solid var(--admin-card-border)",
                        background: isSelected ? "color-mix(in srgb, var(--admin-accent) 8%, transparent)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "14px 18px", fontWeight: 600, color: "var(--admin-text-muted)" }}>#{c.id}</td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 700, color: "var(--admin-text-white)", fontSize: "14px" }}>{monthLabel}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
                          {c.startDate} to {c.endDate}
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <CycleStatusBadge status={c.status} />
                      </td>
                      <td style={{ padding: "14px 18px", fontWeight: 600, color: "var(--admin-text-white)" }}>
                        {c.invoices ? c.invoices.length : 0} Invoices
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => {
                              setSelectedCycleId(c.id);
                              fetchCycleDetails(c.id);
                            }}
                            style={{
                              background: isSelected ? "var(--admin-accent)" : "var(--admin-subcard-bg)",
                              border: "1px solid var(--admin-card-border)",
                              color: isSelected ? "#0F172A" : "var(--admin-text-white)",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {isSelected ? "Inspecting" : "Inspect Invoices"}
                          </button>

                          {c.status === "OPEN" && (
                            <>
                              <button
                                onClick={() => handleStartEditCycle(c)}
                                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#FBBF24", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                title="Edit billing month/dates"
                              >
                                <Edit2 size={13} /> Edit
                              </button>
                              <button
                                onClick={() => handleFinalizeCycle(c.id)}
                                style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                              >
                                Finalize & Bill
                              </button>
                            </>
                          )}

                          {c.status === "FINALIZED" && (
                            <>
                              <button
                                onClick={() => handleRegenerateCycle(c.id)}
                                disabled={regeneratingCycleId === c.id}
                                style={{
                                  background: "rgba(99,102,241,0.15)",
                                  border: "1px solid rgba(99,102,241,0.35)",
                                  color: "#818CF8",
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: regeneratingCycleId === c.id ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                                title="Regenerate invoices for this cycle"
                              >
                                <RefreshCw size={13} />
                                {regeneratingCycleId === c.id ? "Regenerating..." : "Regenerate"}
                              </button>
                              <button
                                onClick={() => handleArchiveCycle(c.id)}
                                style={{ background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", color: "#94A3B8", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                              >
                                Archive
                              </button>
                            </>
                          )}
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

      {/* ========================================================
          SECTION 3: RESIDENT INVOICES & INDIVIDUAL EMAIL OPTION
          ======================================================== */}
      {selectedCycleId && cycleDetails && (
        <div style={sectionCardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Coins size={20} color="#34D399" />
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>
                  3. Resident Invoices — {formatMonthTitle(cycleDetails.startDate?.substring(0, 7))}
                </h2>
                <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                  Individual resident invoice details with direct email dispatch option
                </span>
              </div>
            </div>
            <CycleStatusBadge status={cycleDetails.status} />
          </div>

          {detailsError && (
            <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13px" }}>
              {detailsError}
            </div>
          )}

          {/* If Cycle is OPEN: Show Household Consumption Input Form to prepare finalize */}
          {cycleDetails.status === "OPEN" && (
            <div style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-subcard-border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>
                  Household Water Consumption Readings (Liters)
                </h4>
                <span style={{ fontSize: "12px", color: "#38BDF8" }}>Cycle is OPEN — Edit readings before final billing</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
                {householdReadings.map((r, index) => (
                  <div key={r.householdId} style={{ background: "var(--admin-input-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-text-white)" }}>
                      Flat {r.flatNumber}
                    </span>
                    <SaasInput
                      type="number"
                      placeholder="Usage (L)"
                      value={r.readingValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHouseholdReadings((prev) =>
                          prev.map((item, idx) => (idx === index ? { ...item, readingValue: val } : item))
                        );
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ alignSelf: "flex-end" }}>
                <button
                  onClick={() => handleFinalizeCycle(cycleDetails.id)}
                  style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", padding: "10px 20px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Generate Invoices & Finalize Cycle
                </button>
              </div>
            </div>
          )}

          {/* Finalized Invoices Table with Individual Send Mail Option */}
          {cycleDetails.invoices && cycleDetails.invoices.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ background: "var(--admin-subcard-bg)", borderBottom: "1px solid var(--admin-card-border)" }}>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Flat</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Resident Email</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Usage (L)</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Base Charge</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Adjustments</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Total Amount</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>Payment</th>
                    <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--admin-text-muted)", textAlign: "right" }}>Send Mail & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cycleDetails.invoices.map((inv) => {
                    const recipient = inv.household?.user?.email || inv.household?.residentEmail || "—";
                    const isEditingAdj = editingInvoiceId === inv.id;
                    const emailState = emailStatus[inv.id];

                    return (
                      <tr key={inv.id} style={{ borderBottom: "1px solid var(--admin-card-border)" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--admin-text-white)" }}>
                          Flat {inv.household?.flatNumber || "N/A"}
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--admin-text-white)", fontSize: "13px" }}>
                          {recipient}
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--admin-text-white)" }}>
                          {inv.waterUsage} L
                        </td>
                        <td style={{ padding: "14px 16px", color: "var(--admin-text-white)" }}>
                          ₹{inv.baseCharge}
                        </td>

                        {/* Adjustments Column */}
                        <td style={{ padding: "14px 16px" }}>
                          {isEditingAdj ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <SaasInput
                                type="number"
                                value={tempAdjustments}
                                onChange={(e) => setTempAdjustments(e.target.value)}
                                style={{ width: "80px", padding: "4px 8px" }}
                              />
                              <button
                                onClick={() => handleSaveAdjustments(inv.id)}
                                disabled={updatingInvoice}
                                style={{ background: "#34D399", border: "none", color: "#0F172A", padding: "4px 8px", borderRadius: "6px", cursor: "pointer" }}
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setEditingInvoiceId(null)}
                                style={{ background: "transparent", border: "none", color: "#F87171", cursor: "pointer" }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ color: "var(--admin-text-white)" }}>₹{inv.adjustments || "0.00"}</span>
                              {cycleDetails.status !== "ARCHIVED" && (
                                <button
                                  onClick={() => {
                                    setEditingInvoiceId(inv.id);
                                    setTempAdjustments(String(inv.adjustments || 0));
                                  }}
                                  style={{ background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer", padding: 0 }}
                                  title="Edit adjustment"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#38BDF8", fontSize: "14px" }}>
                          ₹{inv.total}
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={() => handleQuickTogglePayment(inv)}
                            title="Click to toggle PAID/UNPAID"
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: inv.status === "PAID" ? "rgba(52,211,153,0.15)" : "rgba(244,63,94,0.15)",
                              color: inv.status === "PAID" ? "#34D399" : "#F87171",
                              border: `1px solid ${inv.status === "PAID" ? "rgba(52,211,153,0.3)" : "rgba(244,63,94,0.3)"}`,
                              cursor: "pointer",
                              transition: "all 0.18s ease",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              letterSpacing: "0.03em",
                              fontFamily: "inherit",
                            }}
                          >
                            {inv.status === "PAID" ? <Check size={12} /> : <X size={12} />}
                            {inv.status}
                          </button>
                        </td>

                        {/* Individual Send Mail & Receipt Action Column */}
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", flexWrap: "wrap" }}>
                            {/* Edit Invoice Button */}
                            <button
                              onClick={() => handleOpenEditInvoice(inv)}
                              style={{
                                background: "rgba(245,158,11,0.12)",
                                border: "1px solid rgba(245,158,11,0.3)",
                                color: "#FBBF24",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.15s ease",
                              }}
                              title="Edit this invoice"
                            >
                              <Edit2 size={12} /> Edit
                            </button>

                            {/* Individual Send Mail Button */}
                            <button
                              onClick={() => handleSendIndividualEmail(inv)}
                              disabled={emailState?.sending}
                              style={{
                                background: emailState?.success
                                  ? "rgba(52,211,153,0.2)"
                                  : "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                                border: emailState?.success ? "1px solid #34D399" : "none",
                                color: emailState?.success ? "#34D399" : "#FFFFFF",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: emailState?.sending ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                                transition: "all 0.2s ease",
                              }}
                              title={`Send invoice email to ${recipient}`}
                            >
                              <Mail size={12} />
                              {emailState?.sending ? "Sending..." : emailState?.success ? "Sent!" : "Send Mail"}
                            </button>

                            {/* Download Receipt PDF */}
                            <button
                              onClick={() => downloadAdminInvoiceReceiptPdf(auth.token, inv.id)}
                              style={{
                                background: "var(--admin-subcard-bg)",
                                border: "1px solid var(--admin-card-border)",
                                color: "var(--admin-text-white)",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="Download PDF Receipt"
                            >
                              <Download size={12} /> PDF
                            </button>
                          </div>

                          {emailState?.message && !emailState.success && (
                            <div style={{ fontSize: "11px", color: emailState.sending ? "#38BDF8" : "#F87171", marginTop: "4px" }}>
                              {emailState.message}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =============================================
          EDIT INVOICE MODAL
         ============================================= */}
      {editingModalInvoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 12, 24, 0.80)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingModalInvoice(null); }}
        >
          <div
            style={{
              background: "var(--admin-card-bg)",
              border: "1px solid var(--admin-card-border)",
              borderRadius: "22px",
              padding: "28px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(253,186,116,0.15))", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit2 size={17} color="#FBBF24" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--admin-text-white)" }}>
                    Edit Invoice — Flat {editingModalInvoice.household?.flatNumber || "?"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>Resident invoice details</div>
                </div>
              </div>
              <button
                onClick={() => setEditingModalInvoice(null)}
                style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", color: "var(--admin-text-muted)", borderRadius: "8px", padding: "5px 8px", cursor: "pointer" }}
              >
                <X size={15} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#F87171", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={15} /> {modalError}
              </div>
            )}

            {modalSuccess && (
              <div style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#34D399", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={15} /> {modalSuccess}
              </div>
            )}

            <form onSubmit={handleSaveModalInvoice} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Resident Email */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "5px" }}>Resident Email</label>
                <SaasInput
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="resident@example.com"
                />
              </div>

              {/* 2-col grid: Usage & Base Charge */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "5px" }}>
                    Usage (Liters)
                  </label>
                  <SaasInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={modalUsage}
                    onChange={(e) => handleModalUsageChange(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "5px" }}>
                    Base Charge (₹)
                  </label>
                  <SaasInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={modalBaseCharge}
                    onChange={(e) => handleModalBaseChargeChange(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* 2-col grid: Adjustments & Total */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "5px" }}>
                    Adjustments (₹)
                  </label>
                  <SaasInput
                    type="number"
                    step="0.01"
                    value={modalAdjustments}
                    onChange={(e) => handleModalAdjustmentsChange(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "5px" }}>
                    Total (₹) <span style={{ color: "#38BDF8", fontSize: "10px" }}>auto-calculated</span>
                  </label>
                  <SaasInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={modalTotal}
                    onChange={(e) => setModalTotal(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Payment Status Selector */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)", marginBottom: "8px" }}>Payment Status</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["UNPAID", "PAID"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setModalStatus(s)}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: "10px",
                        border: modalStatus === s
                          ? `2px solid ${s === "PAID" ? "#34D399" : "#F87171"}`
                          : "2px solid var(--admin-card-border)",
                        background: modalStatus === s
                          ? (s === "PAID" ? "rgba(52,211,153,0.15)" : "rgba(244,63,94,0.15)")
                          : "var(--admin-subcard-bg)",
                        color: modalStatus === s
                          ? (s === "PAID" ? "#34D399" : "#F87171")
                          : "var(--admin-text-muted)",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontFamily: "inherit",
                      }}
                    >
                      {s === "PAID" ? <Check size={14} /> : <X size={14} />} {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setEditingModalInvoice(null)}
                  style={{
                    flex: 1,
                    background: "var(--admin-subcard-bg)",
                    border: "1px solid var(--admin-card-border)",
                    color: "var(--admin-text-muted)",
                    padding: "11px",
                    borderRadius: "11px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModalInvoice}
                  style={{
                    flex: 2,
                    background: savingModalInvoice
                      ? "var(--admin-subcard-bg)"
                      : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    border: "none",
                    color: savingModalInvoice ? "var(--admin-text-muted)" : "#0F172A",
                    padding: "11px",
                    borderRadius: "11px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: savingModalInvoice ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: savingModalInvoice ? "none" : "0 4px 14px rgba(245,158,11,0.4)",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Check size={16} /> {savingModalInvoice ? "Saving..." : "Save Invoice Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
