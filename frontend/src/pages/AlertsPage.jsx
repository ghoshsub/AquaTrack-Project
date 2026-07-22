import React, { useEffect, useState } from "react";
import { AlertTriangle, Bell, CheckCircle, RefreshCw, Filter, Receipt } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { listAlerts, markAlertAsRead, triggerAlertScan } from "../api/alertApi.js";

export default function AlertsPage({ auth, setPage }) {
  const isAdmin = auth?.role === "ADMIN";

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError, setApartmentsError] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertsError, setAlertsError] = useState("");

  // Filters
  const [filterRead, setFilterRead] = useState("UNREAD_ONLY"); // "ALL", "UNREAD_ONLY"

  // Testing Scan Opener (Admin Only)
  const [scanDate, setScanDate] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState("");
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    async function loadApartments() {
      if (!isAdmin) return;
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
  }, [isAdmin]);

  async function loadAlerts() {
    setLoadingAlerts(true);
    setAlertsError("");
    try {
      // If resident, don't pass apartmentId (backend resolves by token's household)
      const data = await listAlerts(
        auth.token,
        isAdmin ? selectedApartmentId : null
      );
      setAlerts(data);
    } catch (err) {
      setAlertsError(err.message || "Could not load alerts.");
    } finally {
      setLoadingAlerts(false);
    }
  }

  useEffect(() => {
    // For resident, trigger immediately. For admin, wait for selectedApartmentId
    if (!isAdmin || selectedApartmentId) {
      loadAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId, isAdmin]);

  async function handleMarkAsRead(id) {
    try {
      await markAlertAsRead(auth.token, id);
      await loadAlerts();
    } catch (err) {
      alert(err.message || "Could not mark alert as read.");
    }
  }

  async function handleTriggerScan(e) {
    e.preventDefault();
    setScanError("");
    setScanSuccess("");
    setScanning(true);
    try {
      await triggerAlertScan(auth.token, scanDate);
      setScanSuccess(`Scan successfully triggered and completed for ${scanDate}.`);
      setScanDate("");
      await loadAlerts();
    } catch (err) {
      setScanError(err.message || "Failed to trigger scan.");
    } finally {
      setScanning(false);
    }
  }

  const filteredAlerts = alerts.filter((a) => {
    if (filterRead === "UNREAD_ONLY") return !a.isRead;
    return true;
  });

  return (
    <section className="at-container" style={{ maxWidth: "800px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3">
        <Bell size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          Notifications & Alerts
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.65)", marginTop: "4px" }}>
        {isAdmin
          ? "Monitor potential leaks, abnormal consumption spikes, and daily limit violations across all flats."
          : "Stay informed about your flat's potential water leaks and limit threshold notifications."}
      </p>

      {/* Admin specific scanning & selector controls */}
      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "24px" }}>
          {/* Selector */}
          <div className="at-card" style={{ padding: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 550, display: "block", marginBottom: "6px" }}>Select Apartment</label>
            <select
              className="at-input at-focus"
              value={selectedApartmentId}
              onChange={(e) => setSelectedApartmentId(e.target.value)}
            >
              {apartments.length === 0 && <option value="">No apartments available</option>}
              {apartments.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {apartmentsError && <p className="at-error" style={{ marginTop: "6px" }}>{apartmentsError}</p>}
          </div>

          {/* Trigger Scan Form */}
          <div className="at-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }} className="at-flex at-items-center at-gap-1">
              <RefreshCw size={14} />
              Manual Usage Scan
            </h2>
            <form onSubmit={handleTriggerScan} style={{ display: "flex", gap: "10px", alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", color: "rgba(20,43,46,0.6)", display: "block", marginBottom: "4px" }}>Target Date</label>
                <input
                  type="date"
                  required
                  className="at-input at-focus"
                  style={{ padding: "8px 12px" }}
                  value={scanDate}
                  onChange={(e) => setScanDate(e.target.value)}
                />
              </div>
              <button type="submit" disabled={scanning} className="at-btn-brass at-focus" style={{ padding: "9px 16px" }}>
                {scanning ? "Running..." : "Scan"}
              </button>
            </form>
            {scanSuccess && <p style={{ fontSize: "12px", color: "var(--at-verdigris-deep)", marginTop: "6px" }}>{scanSuccess}</p>}
            {scanError && <p className="at-error" style={{ fontSize: "12px", marginTop: "6px" }}>{scanError}</p>}
          </div>
        </div>
      )}

      {/* Main Alerts Feed */}
      <div className="at-card" style={{ marginTop: "28px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(20,43,46,0.1)", paddingBottom: "12px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600 }}>Alert Feed</h2>
          
          <div className="at-flex at-items-center at-gap-2">
            <Filter size={14} color="rgba(20,43,46,0.5)" />
            <select
              className="at-input at-focus"
              style={{ fontSize: "12px", padding: "4px 8px", width: "130px" }}
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
            >
              <option value="UNREAD_ONLY">Unread alerts</option>
              <option value="ALL">All alerts</option>
            </select>
          </div>
        </div>

        {loadingAlerts && <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>Fetching alerts...</p>}
        {alertsError && <p className="at-error">{alertsError}</p>}

        {!loadingAlerts && !alertsError && filteredAlerts.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "rgba(20,43,46,0.5)" }}>
            No new alerts in this filter. Everything looks clear!
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredAlerts.map((a) => {
            const isLeak = a.alertType === "LEAK_SUSPECTED";
            const isBill = a.alertType === "BILL_GENERATED";
            const cardBg = isLeak
              ? "rgba(239, 68, 68, 0.04)"
              : isBill
              ? "rgba(35, 117, 107, 0.04)"
              : "rgba(245, 158, 11, 0.04)";
            const borderCol = isLeak
              ? "rgba(239, 68, 68, 0.2)"
              : isBill
              ? "rgba(35, 117, 107, 0.2)"
              : "rgba(245, 158, 11, 0.2)";
            const iconCol = isLeak
              ? "var(--at-error)"
              : isBill
              ? "var(--at-verdigris-deep)"
              : "#d97706";
            const AlertIcon = isBill ? Receipt : AlertTriangle;

            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "10px",
                  background: cardBg,
                  border: `1px solid ${borderCol}`,
                  opacity: a.isRead ? 0.65 : 1,
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fff", border: `1px solid ${borderCol}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertIcon size={18} color={iconCol} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
                      {isBill ? "Monthly Bill" : isLeak ? "Leak Warning" : "Threshold Spiked"}
                      {isAdmin && a.household && (
                        <span style={{ fontSize: "11px", color: "rgba(20,43,46,0.6)", fontWeight: 400, marginLeft: "8px" }}>
                          (Flat {a.household.flatNumber})
                        </span>
                      )}
                    </h3>
                    <span style={{ fontSize: "11px", color: "rgba(20,43,46,0.5)" }}>{a.readingDate}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(20,43,46,0.85)", marginTop: "6px", lineHeight: "1.4" }}>
                    {a.message}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px dashed rgba(20,43,46,0.08)", paddingTop: "8px" }}>
                    <span style={{ fontSize: "11px", color: "rgba(20,43,46,0.5)" }}>
                      {isBill ? (
                        <>
                          Bill Amount: <strong>INR {a.readingValue}</strong>
                        </>
                      ) : (
                        <>
                          Logged reading: <strong>{a.readingValue} units</strong>
                        </>
                      )}
                    </span>

                    {!a.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(a.id)}
                        className="at-focus"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--at-verdigris-deep)",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <CheckCircle size={12} />
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
