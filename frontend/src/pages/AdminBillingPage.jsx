import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Receipt, Plus, Lock, Archive, Calendar, CheckCircle, AlertCircle,
  Droplets, Building2, Edit2, Check, X, ChevronRight
} from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import {
  listBillingCycles, openBillingCycle, getBillingCycleDetails,
  finalizeBillingCycle, archiveBillingCycle,
  getCycleUsagePreviews, updateInvoiceAdjustments
} from "../api/billingApi.js";

const inputBase = {
  width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "all 0.2s ease",
};

function SaasInput({ type = "text", ...props }) {
  return (
    <input type={type} style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "var(--admin-accent)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--admin-input-border)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

function SaasSelect({ children, ...props }) {
  return (
    <select style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "var(--admin-accent)"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)"; }}
      onBlur={e => { e.target.style.borderColor = "var(--admin-input-border)"; e.target.style.boxShadow = "none"; }}
    >
      {children}
    </select>
  );
}

function formatBillingMonth(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

function CycleStatusBadge({ status }) {
  const map = {
    OPEN: { bg: "rgba(56,189,248,0.15)", color: "#38BDF8", border: "rgba(56,189,248,0.35)" },
    FINALIZED: { bg: "rgba(245,158,11,0.15)", color: "#FBBF24", border: "rgba(245,158,11,0.35)" },
    ARCHIVED: { bg: "rgba(100,116,139,0.15)", color: "#94A3B8", border: "rgba(100,116,139,0.3)" },
  };
  const s = map[status] || map.ARCHIVED;
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {status}
    </span>
  );
}

const cardStyle = {
  background: "var(--admin-card-bg)",
  border: "1px solid var(--admin-card-border)",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  boxShadow: "var(--admin-card-shadow)",
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

  const [billingMonth, setBillingMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [useMonthSelect, setUseMonthSelect] = useState(true);
  const [createError, setCreateError] = useState("");
  const [creatingCycle, setCreatingCycle] = useState(false);

  const [householdReadings, setHouseholdReadings] = useState([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [tempAdjustments, setTempAdjustments] = useState("");
  const [updatingInvoice, setUpdatingInvoice] = useState(false);

  useEffect(() => {
    async function loadApartments() {
      try {
        const data = await listApartments(auth.token);
        const list = data || [];
        setApartments(list);
        if (list.length > 0 && !selectedApartmentId) setSelectedApartmentId(String(list[0].id));
      } catch (err) {
        setApartmentsError(err.message || "Failed to load apartments.");
        setApartments([]);
      }
    }
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCycles(apartmentId) {
    if (!apartmentId) {
      setCycles([]);
      setSelectedCycleId(null);
      setCycleDetails(null);
      return;
    }
    setLoadingCycles(true);
    setCyclesError("");
    try {
      const realCycles = await listBillingCycles(auth.token, apartmentId);
      const list = realCycles || [];
      setCycles(list);
      if (list.length > 0) setSelectedCycleId(list[0].id);
      else { setSelectedCycleId(null); setCycleDetails(null); }
    } catch (err) {
      setCyclesError(err.message || "Failed to load cycles.");
      setCycles([]);
      setSelectedCycleId(null);
      setCycleDetails(null);
    } finally {
      setLoadingCycles(false);
    }
  }

  useEffect(() => {
    async function run() { await loadCycles(selectedApartmentId); }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId]);

  async function loadCycleDetails(cycleId) {
    if (!cycleId) {
      setCycleDetails(null);
      return;
    }
    setLoadingDetails(true);
    setDetailsError("");
    try {
      const realDetails = await getBillingCycleDetails(auth.token, cycleId);
      setCycleDetails(realDetails);
      if (realDetails && realDetails.status === "OPEN") {
        const previews = await getCycleUsagePreviews(auth.token, cycleId).catch(() => null);
        if (previews && previews.length > 0) {
          setHouseholdReadings(previews.map(p => ({
            householdId: p.householdId, flatNumber: p.flatNumber,
            readingValue: p.existingUsage !== null ? String(p.existingUsage) : "0"
          })));
        } else {
          setHouseholdReadings((realDetails.invoices || []).map(inv => ({
            householdId: inv.household?.id || inv.id,
            flatNumber: inv.household?.flatNumber || "Flat",
            readingValue: String(inv.waterUsage || 0)
          })));
        }
      }
    } catch (err) {
      setDetailsError(err.message || "Could not load cycle details.");
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    async function run() { await loadCycleDetails(selectedCycleId); }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycleId]);

  async function handleCreateCycle(e) {
    e.preventDefault();
    setCreateError("");
    setCreatingCycle(true);
    try {
      let finalStart = startDate, finalEnd = endDate;
      if (useMonthSelect) {
        if (!billingMonth) throw new Error("Please select a billing month.");
        const [yearStr, monthStr] = billingMonth.split("-");
        finalStart = `${yearStr}-${monthStr}-01`;
        finalEnd = `${yearStr}-${monthStr}-${new Date(Number(yearStr), Number(monthStr), 0).getDate()}`;
      }
      const newCycle = await openBillingCycle(auth.token, { apartmentId: Number(selectedApartmentId), startDate: finalStart, endDate: finalEnd });
      setStartDate(""); setEndDate(""); setBillingMonth("");
      await loadCycles(selectedApartmentId);
      if (newCycle?.id) setSelectedCycleId(newCycle.id);
    } catch (err) {
      setCreateError(err.message || "Failed to open billing cycle.");
    } finally {
      setCreatingCycle(false);
    }
  }

  async function handleFinalize() {
    if (!window.confirm("Generate invoices for all households? This action cannot be reversed. Proceed?")) return;
    const readingsPayload = { readings: householdReadings.map(r => ({ householdId: r.householdId, readingValue: Number(r.readingValue) })) };
    setLoadingDetails(true);
    try {
      await finalizeBillingCycle(auth.token, selectedCycleId, readingsPayload);
      await loadCycles(selectedApartmentId);
      await loadCycleDetails(selectedCycleId);
    } catch (err) {
      alert(err.message || "Failed to generate invoices.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleArchive() {
    if (!window.confirm("Archive this cycle? Invoices will be locked from further edits.")) return;
    setLoadingDetails(true);
    try {
      await archiveBillingCycle(auth.token, selectedCycleId);
      await loadCycles(selectedApartmentId);
      await loadCycleDetails(selectedCycleId);
    } catch (err) {
      alert(err.message || "Failed to archive billing cycle.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleSaveAdjustments(invId) {
    setUpdatingInvoice(true);
    try {
      await updateInvoiceAdjustments(auth.token, invId, Number(tempAdjustments));
      setEditingInvoiceId(null);
      await loadCycleDetails(selectedCycleId);
    } catch (err) {
      alert(err.message || "Could not update adjustments.");
    } finally {
      setUpdatingInvoice(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "32px" }}>
      {/* Header */}
      <div>
        <BackToDashboard setPage={setPage} />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "16px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(239,68,68,0.2) 100%)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Receipt size={24} color="#FBBF24" />
          </div>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("billing.title")}</h1>
            <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>{t("billing.subheading")}</p>
          </div>
        </div>
      </div>

      {apartmentsError && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13.5px" }}>
          <AlertCircle size={16} /> {apartmentsError}
        </div>
      )}

      {!apartmentsError && apartments.length === 0 && !loadingCycles && (
        <div style={{ ...cardStyle, padding: "48px", textAlign: "center" }}>
          <Building2 size={44} color="#334155" style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
          <p style={{ color: "#94A3B8", fontSize: "15px" }}>
            {t("billing.noCycles")}{" "}
            <button onClick={() => setPage("admin-apartments")} style={{ background: "none", border: "none", color: "#38BDF8", fontWeight: 700, cursor: "pointer", fontSize: "15px", textDecoration: "underline" }}>
              {t("apartments.addApartment")}
            </button>
          </p>
        </div>
      )}

      {apartments.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", alignItems: "start" }}>
          {/* Left Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Apartment Selector */}
            <div style={{ ...cardStyle, padding: "20px" }}>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--admin-text-muted)", marginBottom: "10px" }}>{t("billing.apartment")}</label>
              <SaasSelect value={selectedApartmentId} onChange={e => setSelectedApartmentId(e.target.value)}>
                {apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SaasSelect>
            </div>

            {/* Open New Cycle Card */}
            <div style={{ ...cardStyle, padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={15} color="#38BDF8" />
                </div>
                <h2 style={{ fontSize: "14px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0 }}>{t("billing.openCycle")}</h2>
              </div>

              <div style={{ display: "flex", background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-subcard-border)", borderRadius: "10px", padding: "3px", marginBottom: "16px" }}>
                {[["By Month", true], ["Custom Dates", false]].map(([label, val]) => (
                  <button key={label} type="button" onClick={() => setUseMonthSelect(val)}
                    style={{ flex: 1, background: useMonthSelect === val ? "rgba(56,189,248,0.15)" : "transparent", border: useMonthSelect === val ? "1px solid rgba(56,189,248,0.35)" : "1px solid transparent", color: useMonthSelect === val ? "#38BDF8" : "var(--admin-text-muted)", fontSize: "12px", fontWeight: 700, padding: "7px 8px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCreateCycle} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {useMonthSelect ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>Billing Month</label>
                    <SaasInput type="month" required value={billingMonth} onChange={e => setBillingMonth(e.target.value)} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>Start Date</label>
                      <SaasInput type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase" }}>End Date</label>
                      <SaasInput type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </>
                )}
                <button type="submit" disabled={creatingCycle}
                  style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 800, fontSize: "13px", padding: "11px", borderRadius: "10px", cursor: creatingCycle ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(56,189,248,0.35)", marginTop: "4px" }}>
                  {creatingCycle ? "Creating…" : "Open Billing Cycle"}
                </button>
              </form>
              {createError && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px", color: "#F87171", fontSize: "12px" }}>
                  <AlertCircle size={13} /> {createError}
                </div>
              )}
            </div>

            {/* Cycle History */}
            <div style={{ ...cardStyle, padding: "20px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 800, color: "var(--admin-text-white)", margin: "0 0 16px" }}>Billing History</h2>
              {loadingCycles && <p style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>Loading cycles…</p>}
              {cyclesError && <p style={{ color: "var(--admin-error-text)", fontSize: "12px" }}>{cyclesError}</p>}
              {!loadingCycles && cycles.length === 0 && <p style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>No cycles opened yet.</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {cycles.map(c => {
                  const isActive = selectedCycleId === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelectedCycleId(c.id)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: "10px", border: isActive ? "1px solid rgba(56,189,248,0.45)" : "1px solid var(--admin-card-border)", background: isActive ? "rgba(56,189,248,0.1)" : "var(--admin-subcard-bg)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={13} color={isActive ? "#38BDF8" : "var(--admin-text-muted)"} />
                        <span style={{ fontSize: "13px", fontWeight: 700, color: isActive ? "var(--admin-text-white)" : "var(--admin-text-muted)" }}>
                          {c.startDate ? formatBillingMonth(c.startDate) : `Cycle #${c.id}`}
                        </span>
                      </div>
                      <CycleStatusBadge status={c.status} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Cycle Details */}
          <div>
            {!selectedCycleId && (
              <div style={{ ...cardStyle, padding: "60px", textAlign: "center" }}>
                <Receipt size={44} color="var(--admin-text-muted)" style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
                <p style={{ color: "var(--admin-text-muted)", fontSize: "14px" }}>Select or open a billing cycle to view details.</p>
              </div>
            )}

            {selectedCycleId && loadingDetails && (
              <div style={{ ...cardStyle, padding: "40px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "14px" }}>Loading cycle details…</div>
            )}

            {selectedCycleId && !loadingDetails && detailsError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13px" }}>
                <AlertCircle size={15} /> {detailsError}
              </div>
            )}

            {selectedCycleId && !loadingDetails && cycleDetails && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Header Card */}
                <div style={{ ...cardStyle, padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ fontSize: "12px", color: "var(--admin-text-muted)", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Billing Period</p>
                      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>
                        {cycleDetails.startDate ? formatBillingMonth(cycleDetails.startDate) : `Cycle #${cycleDetails.id}`}
                      </h2>
                      <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "6px 0 0", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Building2 size={13} /> {cycleDetails.apartment?.name || "Unknown Apartment"}
                      </p>
                    </div>
                    <CycleStatusBadge status={cycleDetails.status} />
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
                    {cycleDetails.status === "OPEN" && (
                      <button onClick={handleFinalize}
                        style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", border: "none", color: "#1C1917", fontWeight: 800, fontSize: "13.5px", padding: "12px 22px", borderRadius: "10px", cursor: "pointer", boxShadow: "0 4px 14px rgba(245,158,11,0.35)", fontFamily: "inherit" }}>
                        <Lock size={15} /> Generate Invoice
                      </button>
                    )}
                    {cycleDetails.status === "FINALIZED" && (
                      <button onClick={handleArchive}
                        style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-subcard-border)", color: "var(--admin-text-muted)", fontWeight: 700, fontSize: "13px", padding: "12px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                        <Archive size={15} /> Archive & Lock
                      </button>
                    )}
                    {cycleDetails.status === "ARCHIVED" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#34D399" }}>
                        <CheckCircle size={15} /> Archived & Locked
                      </div>
                    )}
                  </div>
                </div>

                {/* Household Readings (OPEN) */}
                {cycleDetails.status === "OPEN" && (
                  <div style={{ ...cardStyle, padding: "28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Droplets size={16} color="#38BDF8" />
                      </div>
                      <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0 }}>Household Water Usage Readings</h3>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", marginBottom: "20px", lineHeight: 1.6 }}>
                      Enter water usage (in liters) for each household. Pre-filled from recorded logs.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {householdReadings.map((reading, index) => (
                        <div key={reading.householdId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-subcard-border)", borderRadius: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Droplets size={14} color="#38BDF8" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--admin-text-white)" }}>Flat {reading.flatNumber}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input type="number" step="0.001"
                              style={{ ...inputBase, width: "120px", padding: "8px 12px", fontSize: "13px" }}
                              value={reading.readingValue}
                              onChange={e => {
                                const updated = [...householdReadings];
                                updated[index].readingValue = e.target.value;
                                setHouseholdReadings(updated);
                              }}
                              onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)"; }}
                              onBlur={e => { e.target.style.borderColor = "var(--admin-subcard-border)"; e.target.style.boxShadow = "none"; }}
                            />
                            <span style={{ fontSize: "12px", color: "var(--admin-text-muted)", fontWeight: 600 }}>liters</span>
                          </div>
                        </div>
                      ))}
                      {householdReadings.length === 0 && (
                        <p style={{ color: "var(--admin-text-muted)", fontSize: "13px" }}>No households found for this cycle.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Invoices Table (non-OPEN) */}
                {cycleDetails.status !== "OPEN" && (
                  <div style={{ ...cardStyle, overflow: "hidden" }}>
                    <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--admin-card-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Receipt size={16} color="#FBBF24" />
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--admin-text-white)" }}>Resident Invoices</span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--admin-text-muted)", background: "var(--admin-subcard-bg)", padding: "4px 12px", borderRadius: "20px", border: "1px solid var(--admin-subcard-border)" }}>
                        {cycleDetails.invoices?.length || 0} invoices
                      </span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--admin-card-border)", color: "var(--admin-text-muted)", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {["Flat", "Usage (L)", "Base Charge", "Adjustments", "Total", "Status", ...(cycleDetails.status === "FINALIZED" ? ["Action"] : [])].map(h => (
                              <th key={h} style={{ padding: "14px 18px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {!cycleDetails.invoices || cycleDetails.invoices.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "13px" }}>No invoices found.</td></tr>
                          ) : (
                            cycleDetails.invoices.map(inv => {
                              const isEditing = editingInvoiceId === inv.id;
                              return (
                                <tr key={inv.id} style={{ borderBottom: "1px solid var(--admin-border-muted)", transition: "background 0.18s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = "var(--admin-table-hover)"}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                  <td style={{ padding: "16px 18px", fontWeight: 700, color: "var(--admin-text-white)", fontSize: "14px" }}>Flat {inv.household?.flatNumber || "—"}</td>
                                  <td style={{ padding: "16px 18px", color: "var(--admin-text-muted)", fontSize: "13.5px" }}>{inv.waterUsage ?? "0.000"} L</td>
                                  <td style={{ padding: "16px 18px", color: "var(--admin-text-white)", fontSize: "13.5px", fontWeight: 600 }}>₹{inv.baseCharge}</td>
                                  <td style={{ padding: "16px 18px" }}>
                                    {isEditing ? (
                                      <input type="number" step="0.01"
                                        style={{ ...inputBase, width: "100px", padding: "6px 10px", fontSize: "13px" }}
                                        value={tempAdjustments}
                                        onChange={e => setTempAdjustments(e.target.value)}
                                        onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)"; }}
                                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
                                      />
                                    ) : (
                                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: inv.adjustments < 0 ? "#34D399" : inv.adjustments > 0 ? "#F87171" : "#94A3B8" }}>
                                        ₹{inv.adjustments}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: "16px 18px" }}>
                                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#38BDF8" }}>₹{inv.total}</span>
                                  </td>
                                  <td style={{ padding: "16px 18px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", background: inv.status === "PAID" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: inv.status === "PAID" ? "#34D399" : "#F87171", border: `1px solid ${inv.status === "PAID" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                                      {inv.status}
                                    </span>
                                  </td>
                                  {cycleDetails.status === "FINALIZED" && (
                                    <td style={{ padding: "16px 18px" }}>
                                      {isEditing ? (
                                        <div style={{ display: "flex", gap: "6px" }}>
                                          <button disabled={updatingInvoice} onClick={() => handleSaveAdjustments(inv.id)}
                                            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#34D399", fontSize: "12px", fontWeight: 700, padding: "5px 10px", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Check size={12} /> Save
                                          </button>
                                          <button onClick={() => setEditingInvoiceId(null)}
                                            style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", color: "var(--admin-text-muted)", fontSize: "12px", fontWeight: 600, padding: "5px 10px", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <X size={12} /> Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button onClick={() => { setEditingInvoiceId(inv.id); setTempAdjustments(String(inv.adjustments)); }}
                                          style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", color: "#38BDF8", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}>
                                          <Edit2 size={12} /> Adjust
                                        </button>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
