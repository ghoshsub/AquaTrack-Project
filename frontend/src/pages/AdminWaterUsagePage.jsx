import React, { useEffect, useState, useRef } from "react";
import { Droplet, Upload, Edit3, CheckCircle2, AlertCircle, FileText, Building2, Droplets } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { listHouseholdsByApartment } from "../api/householdApi.js";
import { logManualReading, uploadBulkCsv } from "../api/waterUsageApi.js";

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8" };
const inputBase = {
  width: "100%", background: "rgba(13,22,36,0.9)", border: "1px solid rgba(255,255,255,0.14)",
  color: "#FFFFFF", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "all 0.2s ease",
};

function SaasInput({ type = "text", ...props }) {
  return (
    <input type={type} style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
    />
  );
}

function SaasSelect({ children, ...props }) {
  return (
    <select style={inputBase} {...props}
      onFocus={e => { e.target.style.borderColor = "#38BDF8"; e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
    >
      {children}
    </select>
  );
}

const cardStyle = {
  background: "rgba(17,26,42,0.9)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
};

export default function AdminWaterUsagePage({ auth, setPage }) {
  const [activeTab, setActiveTab] = useState("manual");
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError, setApartmentsError] = useState("");

  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [loadingHouseholds, setLoadingHouseholds] = useState(false);

  const [readingDate, setReadingDate] = useState("");
  const [readingValue, setReadingValue] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  const fileInputRef = useRef(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState("");
  const [submittingBulk, setSubmittingBulk] = useState(false);

  useEffect(() => {
    async function loadApartments() {
      try {
        const data = await listApartments(auth.token);
        setApartments(data);
        if (data.length > 0) setSelectedApartmentId(String(data[0].id));
      } catch (err) {
        setApartmentsError(err.message || "Could not load apartments.");
      }
    }
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadHouseholds(apartmentId) {
      if (!apartmentId) { setHouseholds([]); setSelectedHouseholdId(""); return; }
      setLoadingHouseholds(true);
      try {
        const data = await listHouseholdsByApartment(auth.token, apartmentId);
        setHouseholds(data);
        if (data.length > 0) setSelectedHouseholdId(String(data[0].id));
        else setSelectedHouseholdId("");
      } catch (err) {
        setHouseholds([]);
      } finally {
        setLoadingHouseholds(false);
      }
    }
    loadHouseholds(selectedApartmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId]);

  async function handleManualSubmit(e) {
    e.preventDefault();
    setManualError(""); setManualSuccess("");
    if (!selectedHouseholdId) { setManualError("Please select a flat."); return; }
    setSubmittingManual(true);
    try {
      await logManualReading(auth.token, { householdId: Number(selectedHouseholdId), readingDate, readingValue: Number(readingValue) });
      setManualSuccess("Reading logged successfully!");
      setReadingDate(""); setReadingValue("");
    } catch (err) {
      setManualError(err.message || "Failed to save reading.");
    } finally {
      setSubmittingManual(false);
    }
  }

  async function handleBulkSubmit(e) {
    e.preventDefault();
    setBulkError(""); setBulkResult(null);
    if (!bulkFile) { setBulkError("Please select a CSV file."); return; }
    setSubmittingBulk(true);
    try {
      const data = await uploadBulkCsv(auth.token, selectedApartmentId, bulkFile);
      setBulkResult(data); setBulkFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setBulkError(err.message || "Failed to upload file.");
    } finally {
      setSubmittingBulk(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "32px" }}>
      {/* Header */}
      <div>
        <BackToDashboard setPage={setPage} />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "16px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Droplets size={24} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>Water Usage Logs</h1>
            <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: "2px 0 0" }}>Log daily meter readings manually or bulk-import from CSV files</p>
          </div>
        </div>
      </div>

      {apartmentsError && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13.5px" }}>
          <AlertCircle size={16} /> {apartmentsError}
        </div>
      )}

      {!apartmentsError && apartments.length === 0 && (
        <div style={{ ...cardStyle, padding: "48px", textAlign: "center" }}>
          <Building2 size={44} color="#334155" style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
          <p style={{ color: "#94A3B8", fontSize: "15px" }}>You need an apartment onboarded before logging water usage.</p>
        </div>
      )}

      {apartments.length > 0 && (
        <>
          {/* Control Bar: Apartment Selector + Tab Switcher */}
          <div style={{ ...cardStyle, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Building:</span>
              <SaasSelect value={selectedApartmentId} onChange={e => setSelectedApartmentId(e.target.value)} style={{ minWidth: "220px" }}>
                {apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SaasSelect>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: "flex", background: "rgba(0,0,0,0.25)", borderRadius: "12px", padding: "4px", gap: "4px" }}>
              {[["manual", "Manual Entry", Edit3], ["bulk", "Bulk CSV Upload", Upload]].map(([tab, label, Icon]) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                  style={{ display: "flex", alignItems: "center", gap: "7px", background: activeTab === tab ? "rgba(56,189,248,0.15)" : "transparent", border: activeTab === tab ? "1px solid rgba(56,189,248,0.35)" : "1px solid transparent", color: activeTab === tab ? "#38BDF8" : "#64748B", fontSize: "13px", fontWeight: 700, padding: "9px 18px", borderRadius: "9px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Entry Tab */}
          {activeTab === "manual" && (
            <div style={{ ...cardStyle, padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Edit3 size={16} color="#38BDF8" />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Log Single Reading</h2>
                  <p style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 0" }}>Record a metered usage value for one specific flat</p>
                </div>
              </div>

              {loadingHouseholds ? (
                <p style={{ color: "#64748B", fontSize: "14px" }}>Loading flats…</p>
              ) : households.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "12px", padding: "28px", textAlign: "center" }}>
                  <p style={{ color: "#475569", fontSize: "14px" }}>No flats found in this building. Add households first.</p>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Flat / Household *</label>
                      <SaasSelect value={selectedHouseholdId} onChange={e => setSelectedHouseholdId(e.target.value)} required>
                        {households.map(h => <option key={h.id} value={h.id}>Flat {h.flatNumber} ({h.flatSize} sq ft)</option>)}
                      </SaasSelect>
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Reading Date *</label>
                      <SaasInput type="date" value={readingDate} onChange={e => setReadingDate(e.target.value)} required />
                    </div>
                    <div style={fieldStyle}>
                      <label style={labelStyle}>Usage Reading (Liters) *</label>
                      <SaasInput type="number" step="0.001" value={readingValue} onChange={e => setReadingValue(e.target.value)} placeholder="e.g. 450.00" required />
                    </div>
                  </div>

                  {manualError && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#F87171", fontSize: "13px" }}>
                      <AlertCircle size={15} /> {manualError}
                    </div>
                  )}

                  {manualSuccess && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: "10px", padding: "10px 14px", color: "#34D399", fontSize: "13px" }}>
                      <CheckCircle2 size={15} /> {manualSuccess}
                    </div>
                  )}

                  <button type="submit" disabled={submittingManual}
                    style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 800, fontSize: "14px", padding: "12px 28px", borderRadius: "11px", cursor: submittingManual ? "not-allowed" : "pointer", fontFamily: "inherit", alignSelf: "flex-start", boxShadow: "0 4px 16px rgba(56,189,248,0.4)" }}>
                    {submittingManual ? "Saving Reading…" : "Save Reading"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bulk CSV Tab */}
          {activeTab === "bulk" && (
            <div style={{ ...cardStyle, padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={16} color="#38BDF8" />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Bulk CSV Upload</h2>
                  <p style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 0" }}>Import multiple readings at once using a structured CSV file</p>
                </div>
              </div>

              <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <FileText size={14} color="#38BDF8" />
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.05em" }}>CSV Format Guide</span>
                </div>
                <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
                  Required columns: <strong style={{ color: "#FFFFFF" }}>flatNumber, readingDate (YYYY-MM-DD), readingValue</strong><br />
                  Duplicate entries for the same flat on the same date will be automatically skipped.
                </p>
              </div>

              <form onSubmit={handleBulkSubmit} style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="file" accept=".csv" ref={fileInputRef}
                  onChange={e => setBulkFile(e.target.files[0])}
                  style={{ ...inputBase, flex: 1, padding: "10px 14px", color: "#94A3B8" }}
                />
                <button type="submit" disabled={submittingBulk}
                  style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 800, fontSize: "14px", padding: "12px 26px", borderRadius: "11px", cursor: submittingBulk ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(56,189,248,0.35)", whiteSpace: "nowrap" }}>
                  {submittingBulk ? "Uploading…" : "Upload CSV"}
                </button>
              </form>

              {bulkError && (
                <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#F87171", fontSize: "13px" }}>
                  <AlertCircle size={15} /> {bulkError}
                </div>
              )}

              {bulkResult && (
                <div style={{ marginTop: "24px", padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#FFFFFF", margin: "0 0 16px" }}>Upload Summary</h3>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", padding: "10px 18px", borderRadius: "10px" }}>
                      <CheckCircle2 size={16} color="#34D399" />
                      <span style={{ color: "#34D399", fontWeight: 700, fontSize: "14px" }}>{bulkResult.successful} Successful</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", padding: "10px 18px", borderRadius: "10px" }}>
                      <span style={{ color: "#FBBF24", fontWeight: 700, fontSize: "14px" }}>⚠ {bulkResult.skippedDuplicates} Skipped (Duplicates)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)", padding: "10px 18px", borderRadius: "10px" }}>
                      <span style={{ color: "#F87171", fontWeight: 700, fontSize: "14px" }}>✕ {bulkResult.errors?.length || 0} Errors</span>
                    </div>
                  </div>
                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <div style={{ marginTop: "16px", maxHeight: "120px", overflowY: "auto", fontSize: "12px", background: "rgba(0,0,0,0.35)", padding: "12px", borderRadius: "8px", color: "#F87171" }}>
                      {bulkResult.errors.map((err, i) => <div key={i}>{err}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
