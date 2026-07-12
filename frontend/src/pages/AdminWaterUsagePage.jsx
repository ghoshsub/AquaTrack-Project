import React, { useEffect, useState, useRef } from "react";
import { Droplet, Upload, Edit3 } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { listHouseholdsByApartment } from "../api/householdApi.js";
import { logManualReading, uploadBulkCsv } from "../api/waterUsageApi.js";

export default function AdminWaterUsagePage({ auth, setPage }) {
  const [activeTab, setActiveTab] = useState("manual"); // 'manual' or 'bulk'
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError, setApartmentsError] = useState("");

  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [loadingHouseholds, setLoadingHouseholds] = useState(false);

  // Manual entry state
  const [readingDate, setReadingDate] = useState("");
  const [readingValue, setReadingValue] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  // Bulk upload state
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
        if (data.length > 0) {
          setSelectedApartmentId(String(data[0].id));
        }
      } catch (err) {
        setApartmentsError(err.message || "Could not load apartments.");
      }
    }
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadHouseholds(apartmentId) {
      if (!apartmentId) {
        setHouseholds([]);
        setSelectedHouseholdId("");
        return;
      }
      setLoadingHouseholds(true);
      try {
        const data = await listHouseholdsByApartment(auth.token, apartmentId);
        setHouseholds(data);
        if (data.length > 0) {
          setSelectedHouseholdId(String(data[0].id));
        } else {
          setSelectedHouseholdId("");
        }
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
    setManualError("");
    setManualSuccess("");
    if (!selectedHouseholdId) {
      setManualError("Please select a flat.");
      return;
    }
    setSubmittingManual(true);
    try {
      await logManualReading(auth.token, {
        householdId: Number(selectedHouseholdId),
        readingDate,
        readingValue: Number(readingValue),
      });
      setManualSuccess("Reading saved successfully.");
      setReadingDate("");
      setReadingValue("");
    } catch (err) {
      setManualError(err.message || "Failed to save reading.");
    } finally {
      setSubmittingManual(false);
    }
  }

  async function handleBulkSubmit(e) {
    e.preventDefault();
    setBulkError("");
    setBulkResult(null);
    if (!bulkFile) {
      setBulkError("Please select a CSV file to upload.");
      return;
    }
    setSubmittingBulk(true);
    try {
      const data = await uploadBulkCsv(auth.token, selectedApartmentId, bulkFile);
      setBulkResult(data);
      setBulkFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setBulkError(err.message || "Failed to upload file.");
    } finally {
      setSubmittingBulk(false);
    }
  }

  return (
    <section className="at-container" style={{ maxWidth: "900px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3">
        <Droplet size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          Water Usage Logs
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.65)", marginTop: "4px" }}>
        Enter water usage readings manually or upload in bulk via CSV.
      </p>

      {apartmentsError && <p className="at-error" style={{ marginTop: "16px" }}>{apartmentsError}</p>}

      {!apartmentsError && apartments.length === 0 && (
        <div className="at-card" style={{ padding: "20px", marginTop: "24px", fontSize: "14px", color: "rgba(20,43,46,0.65)" }}>
          You need at least one apartment to log usage.
        </div>
      )}

      {apartments.length > 0 && (
        <>
          <div className="at-card" style={{ padding: "24px", marginTop: "24px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
              Select Apartment
            </label>
            <select
              className="at-input at-focus"
              value={selectedApartmentId}
              onChange={(e) => setSelectedApartmentId(e.target.value)}
              style={{ maxWidth: "300px" }}
            >
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", borderBottom: "1px solid rgba(20,43,46,0.1)" }}>
            <button
              onClick={() => setActiveTab("manual")}
              style={{
                padding: "12px 16px",
                fontWeight: 600,
                fontSize: "14px",
                color: activeTab === "manual" ? "var(--at-verdigris-deep)" : "rgba(20,43,46,0.5)",
                borderBottom: activeTab === "manual" ? "2px solid var(--at-verdigris-deep)" : "2px solid transparent",
                cursor: "pointer",
                background: "transparent",
                borderTop: "none", borderLeft: "none", borderRight: "none"
              }}
            >
              <Edit3 size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              style={{
                padding: "12px 16px",
                fontWeight: 600,
                fontSize: "14px",
                color: activeTab === "bulk" ? "var(--at-verdigris-deep)" : "rgba(20,43,46,0.5)",
                borderBottom: activeTab === "bulk" ? "2px solid var(--at-verdigris-deep)" : "2px solid transparent",
                cursor: "pointer",
                background: "transparent",
                borderTop: "none", borderLeft: "none", borderRight: "none"
              }}
            >
              <Upload size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              Bulk CSV Upload
            </button>
          </div>

          {activeTab === "manual" && (
            <div className="at-card" style={{ padding: "24px", marginTop: "24px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Log a single reading</h2>
              {loadingHouseholds ? (
                <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>Loading flats...</p>
              ) : households.length === 0 ? (
                <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>No flats found in this apartment.</p>
              ) : (
                <form onSubmit={handleManualSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 500 }}>Flat / Household</label>
                    <select
                      className="at-input at-focus"
                      style={{ marginTop: "5px" }}
                      value={selectedHouseholdId}
                      onChange={(e) => setSelectedHouseholdId(e.target.value)}
                      required
                    >
                      {households.map((h) => (
                        <option key={h.id} value={h.id}>
                          Flat {h.flatNumber} (Size: {h.flatSize} sq ft)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 500 }}>Reading Date</label>
                    <input
                      type="date"
                      className="at-input at-focus"
                      style={{ marginTop: "5px" }}
                      value={readingDate}
                      onChange={(e) => setReadingDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 500 }}>Reading Value (Liters or m³)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="at-input at-focus"
                      style={{ marginTop: "5px" }}
                      value={readingValue}
                      onChange={(e) => setReadingValue(e.target.value)}
                      placeholder="0.000"
                      required
                    />
                  </div>
                  <button type="submit" disabled={submittingManual} className="at-btn-brass at-focus">
                    {submittingManual ? "Saving…" : "Save"}
                  </button>
                </form>
              )}
              {manualError && <p className="at-error" style={{ marginTop: "12px" }}>{manualError}</p>}
              {manualSuccess && <p style={{ color: "var(--at-verdigris-deep)", fontWeight: 500, fontSize: "14px", marginTop: "12px" }}>{manualSuccess}</p>}
            </div>
          )}

          {activeTab === "bulk" && (
            <div className="at-card" style={{ padding: "24px", marginTop: "24px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>Upload bulk readings</h2>
              <p style={{ fontSize: "13px", color: "rgba(20,43,46,0.65)", marginBottom: "16px" }}>
                CSV Format expected: <strong>flatNumber, readingDate (YYYY-MM-DD), readingValue</strong><br/>
                Duplicate readings for the same flat on the same day will be safely skipped.
              </p>
              
              <form onSubmit={handleBulkSubmit} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  className="at-input at-focus"
                  style={{ flex: 1, padding: "8px" }}
                />
                <button type="submit" disabled={submittingBulk} className="at-btn-brass at-focus">
                  {submittingBulk ? "Uploading…" : "Upload CSV"}
                </button>
              </form>

              {bulkError && <p className="at-error" style={{ marginTop: "12px" }}>{bulkError}</p>}

              {bulkResult && (
                <div style={{ marginTop: "20px", padding: "16px", borderRadius: "8px", background: "rgba(20,43,46,0.02)", border: "1px solid rgba(20,43,46,0.08)" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Upload Results</h3>
                  <div style={{ display: "flex", gap: "24px", marginBottom: "12px", fontSize: "14px" }}>
                    <div style={{ color: "var(--at-verdigris-deep)", fontWeight: 500 }}>✓ {bulkResult.successful} Successful</div>
                    <div style={{ color: "#d97706", fontWeight: 500 }}>⚠ {bulkResult.skippedDuplicates} Skipped (Duplicates)</div>
                    <div style={{ color: "var(--at-error)", fontWeight: 500 }}>✕ {bulkResult.errors?.length || 0} Errors</div>
                  </div>
                  
                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <div style={{ maxHeight: "150px", overflowY: "auto", fontSize: "12px", background: "#fff", padding: "8px", border: "1px solid rgba(20,43,46,0.1)", borderRadius: "4px" }}>
                      {bulkResult.errors.map((err, i) => (
                        <div key={i} style={{ color: "var(--at-error)", marginBottom: "4px" }}>{err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
