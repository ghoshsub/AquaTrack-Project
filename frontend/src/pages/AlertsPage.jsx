import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Bell, CheckCircle, RefreshCw, Filter, Receipt, CheckCircle2 } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { listAlerts, markAlertAsRead, triggerAlertScan } from "../api/alertApi.js";

const inputBase = {
  width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)", padding: "9px 12px", borderRadius: "10px", fontSize: "13px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
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

export default function AlertsPage({ auth, setPage }) {
  const { t } = useTranslation();
  const isAdmin = auth?.role === "ADMIN";

  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError, setApartmentsError] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertsError, setAlertsError] = useState("");
  const [filterRead, setFilterRead] = useState("UNREAD_ONLY");

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
        setApartmentsError(err.message || t("common.error"));
      }
    }
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function loadAlerts() {
    setLoadingAlerts(true);
    setAlertsError("");
    try {
      const data = await listAlerts(auth.token, isAdmin ? selectedApartmentId : null);
      setAlerts(data);
    } catch (err) {
      setAlertsError(err.message || t("common.error"));
    } finally {
      setLoadingAlerts(false);
    }
  }

  useEffect(() => {
    if (!isAdmin || selectedApartmentId) { loadAlerts(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId, isAdmin]);

  async function handleMarkAsRead(id) {
    try {
      await markAlertAsRead(auth.token, id);
      await loadAlerts();
    } catch (err) {
      alert(err.message || t("common.error"));
    }
  }

  async function handleTriggerScan(e) {
    e.preventDefault();
    setScanError(""); setScanSuccess(""); setScanning(true);
    try {
      await triggerAlertScan(auth.token, scanDate);
      setScanSuccess(`Scan completed for ${scanDate}.`);
      setScanDate("");
      await loadAlerts();
    } catch (err) {
      setScanError(err.message || t("common.error"));
    } finally {
      setScanning(false);
    }
  }

  const filteredAlerts = alerts.filter(a => (filterRead === "UNREAD_ONLY" ? !a.isRead : true));
  const cardStyle = { background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "16px", backdropFilter: "blur(16px)", boxShadow: "var(--admin-card-shadow)" };

  return (
    <div style={{ maxWidth: "1050px", margin: "40px auto 80px", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <BackToDashboard setPage={setPage} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(245,158,11,0.2) 100%)", border: "1px solid rgba(244,63,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={22} color="#F43F5E" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("alerts.title")}</h1>
            <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>
              {isAdmin ? "Monitor potential water leaks, threshold spikes, and daily limit violations across all flats" : "Stay informed about water leaks and daily threshold alerts for your flat"}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {/* Apartment Selector */}
          <div style={{ ...cardStyle, padding: "20px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", marginBottom: "8px" }}>{t("households.apartment")}</label>
            <SaasSelect value={selectedApartmentId} onChange={e => setSelectedApartmentId(e.target.value)}>
              {apartments.length === 0 && <option value="">{t("apartments.noApartments")}</option>}
              {apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </SaasSelect>
            {apartmentsError && <p style={{ color: "#F87171", fontSize: "12px", marginTop: "6px" }}>{apartmentsError}</p>}
          </div>

          {/* Manual Scan */}
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <RefreshCw size={14} color="#38BDF8" />
              <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>Manual Usage Scan</h2>
            </div>
            <form onSubmit={handleTriggerScan} style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <SaasInput type="date" required value={scanDate} onChange={e => setScanDate(e.target.value)} />
              </div>
              <button type="submit" disabled={scanning}
                style={{ background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none", color: "#0F172A", fontWeight: 700, fontSize: "13px", padding: "10px 16px", borderRadius: "10px", cursor: scanning ? "not-allowed" : "pointer", opacity: scanning ? 0.7 : 1, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {scanning ? t("common.loading") : "Run Scan"}
              </button>
            </form>
            {scanSuccess && <p style={{ fontSize: "12px", color: "#34D399", marginTop: "8px" }}>{scanSuccess}</p>}
            {scanError && <p style={{ color: "#F87171", fontSize: "12px", marginTop: "8px" }}>{scanError}</p>}
            {scanSuccess && <p style={{ fontSize: "12px", color: "var(--admin-success-text)", marginTop: "8px" }}>{scanSuccess}</p>}
            {scanError && <p style={{ color: "var(--admin-error-text)", fontSize: "12px", marginTop: "8px" }}>{scanError}</p>}
          </div>
        </div>
      )}

      {/* Alert Feed */}
      <div style={{ ...cardStyle, padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--admin-border-muted)", paddingBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-white)" }}>{t("alerts.title")}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "12px", background: "rgba(244,63,94,0.15)", color: "#F43F5E" }}>{filteredAlerts.length}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={13} color="var(--admin-text-muted)" />
            <SaasSelect value={filterRead} onChange={e => setFilterRead(e.target.value)} style={{ width: "130px", padding: "6px 10px", fontSize: "12px" }}>
              <option value="UNREAD_ONLY">{t("alerts.unread")}</option>
              <option value="ALL">All alerts</option>
            </SaasSelect>
          </div>
        </div>

        {loadingAlerts && <p style={{ color: "var(--admin-text-muted)", fontSize: "14px", textAlign: "center", padding: "30px 0" }}>{t("common.loading")}</p>}
        {alertsError && <p style={{ color: "var(--admin-error-text)", fontSize: "13px" }}>{alertsError}</p>}

        {!loadingAlerts && !alertsError && filteredAlerts.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--admin-text-muted)" }}>
            <CheckCircle2 size={40} color="#10B981" style={{ display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", color: "var(--admin-text-muted)", margin: 0 }}>{t("alerts.allClear")}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredAlerts.map(a => {
            const isLeak = a.alertType === "LEAK_SUSPECTED";
            const isBill = a.alertType === "BILL_GENERATED";
            const cardBg = isLeak ? "rgba(244,63,94,0.06)" : isBill ? "rgba(56,189,248,0.06)" : "rgba(245,158,11,0.06)";
            const borderCol = isLeak ? "rgba(244,63,94,0.25)" : isBill ? "rgba(56,189,248,0.25)" : "rgba(245,158,11,0.25)";
            const iconCol = isLeak ? "#F43F5E" : isBill ? "#38BDF8" : "#F59E0B";
            const AlertIcon = isBill ? Receipt : AlertTriangle;

            return (
              <div key={a.id} style={{ display: "flex", gap: "16px", padding: "16px", borderRadius: "12px", background: cardBg, border: `1px solid ${borderCol}`, opacity: a.isRead ? 0.6 : 1, transition: "all 0.15s ease" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--admin-subcard-bg)", border: `1px solid ${borderCol}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertIcon size={18} color={iconCol} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-white)", margin: 0 }}>
                      {isBill ? "Monthly Bill Generated" : isLeak ? t("alerts.leak") : t("alerts.threshold")}
                      {isAdmin && a.household && (
                        <span style={{ fontSize: "12px", color: "#38BDF8", fontWeight: 500, marginLeft: "8px" }}>
                          (Flat {a.household.flatNumber})
                        </span>
                      )}
                    </h3>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>{a.readingDate}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--admin-text-muted)", marginTop: "6px", lineHeight: 1.5, margin: "6px 0 0" }}>{a.message}</p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px dashed var(--admin-border-muted)", paddingTop: "10px" }}>
                    <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                      {isBill ? <>Amount: <strong style={{ color: "var(--admin-text-white)" }}>₹{a.readingValue}</strong></> : <>{t("alerts.reading")}: <strong style={{ color: "var(--admin-text-white)" }}>{a.readingValue} L</strong></>}
                    </span>

                    {!a.isRead && (
                      <button onClick={() => handleMarkAsRead(a.id)}
                        style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-success-text)", background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontFamily: "inherit" }}>
                        <CheckCircle size={12} /> {t("alerts.markRead")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

