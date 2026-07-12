import React, { useEffect, useState } from "react";
import { Gauge, Building2, Home, ArrowRight, Droplet, CheckCircle } from "lucide-react";
import { getResidentDashboard, linkHousehold, listResidentApartments } from "../api/residentApi.js";

function QuickLinkCard({ icon: Icon, title, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className="at-card at-focus"
      style={{
        padding: "22px",
        textAlign: "left",
        cursor: "pointer",
        border: "1px solid rgba(20,43,46,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "9px",
          background: "var(--at-limestone)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color="var(--at-verdigris-deep)" />
      </div>
      <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--at-ink-deep)" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "rgba(20,43,46,0.65)", lineHeight: 1.5 }}>{body}</div>
      <div className="at-flex at-items-center at-gap-1" style={{ fontSize: "13px", fontWeight: 600, color: "var(--at-verdigris-deep)", marginTop: "4px" }}>
        Open <ArrowRight size={14} />
      </div>
    </button>
  );
}

export default function DashboardPage({ auth, setPage }) {
  const isAdmin = auth?.role === "ADMIN";
  const isResident = auth?.role === "RESIDENT";

  const [loading, setLoading] = useState(isResident);
  const [residentData, setResidentData] = useState(null);
  
  // Link Household Form State
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [linkError, setLinkError] = useState("");
  const [submittingLink, setSubmittingLink] = useState(false);

  useEffect(() => {
    if (isResident) {
      loadResidentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResident]);

  async function loadResidentData() {
    setLoading(true);
    try {
      const data = await getResidentDashboard(auth.token);
      setResidentData(data);
      if (!data.linked) {
        const apts = await listResidentApartments(auth.token);
        setApartments(apts);
        if (apts.length > 0) setSelectedApartmentId(String(apts[0].id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkSubmit(e) {
    e.preventDefault();
    setLinkError("");
    setSubmittingLink(true);
    try {
      await linkHousehold(auth.token, { apartmentId: Number(selectedApartmentId), flatNumber });
      await loadResidentData(); // Reload dashboard
    } catch (err) {
      setLinkError(err.message || "Failed to link flat. Please check your details.");
    } finally {
      setSubmittingLink(false);
    }
  }

  return (
    <section className="at-container" style={{ maxWidth: "900px", paddingTop: "80px", paddingBottom: "80px" }}>
      <p className="at-mono" style={{ color: "var(--at-verdigris-deep)", fontSize: "12px", letterSpacing: "0.1em" }}>
        {auth?.role || "USER"} DASHBOARD
      </p>
      <h1 className="at-display" style={{ fontSize: "30px", fontWeight: 600, color: "var(--at-ink-deep)", marginTop: "6px" }}>
        Welcome, {auth?.username || "there"}.
      </h1>
      
      {!isResident && (
        <p style={{ marginTop: "10px", fontSize: "14px", color: "rgba(20,43,46,0.7)" }}>
          This is a basic dashboard — the full version gets built in Phase 2.
        </p>
      )}

      {isAdmin && (
        <>
          <div className="at-card at-flex at-items-center at-gap-4" style={{ padding: "28px", marginTop: "28px" }}>
            <Gauge size={26} color="var(--at-verdigris-deep)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "15px" }}>You're logged in successfully.</div>
              <div style={{ fontSize: "13px", color: "rgba(20,43,46,0.6)", marginTop: "2px" }}>
                Token stored in memory for this session.
              </div>
            </div>
          </div>
          <h2 style={{ fontSize: "15px", fontWeight: 600, marginTop: "36px", marginBottom: "14px", color: "var(--at-ink-deep)" }}>
            Admin tools
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <QuickLinkCard
              icon={Building2}
              title="Apartments"
              body="Onboard a new building or review existing ones."
              onClick={() => setPage("admin-apartments")}
            />
            <QuickLinkCard
              icon={Home}
              title="Households"
              body="Add flats to an apartment and manage occupancy."
              onClick={() => setPage("admin-households")}
            />
            <QuickLinkCard
              icon={Droplet}
              title="Water Usage"
              body="Log daily readings manually or in bulk."
              onClick={() => setPage("admin-water-usage")}
            />
          </div>
        </>
      )}

      {isResident && loading && (
        <p style={{ marginTop: "20px", fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>Loading your dashboard...</p>
      )}

      {isResident && !loading && residentData && !residentData.linked && (
        <div className="at-card" style={{ padding: "32px", marginTop: "28px", maxWidth: "600px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(35, 117, 107, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={20} color="var(--at-verdigris-deep)" />
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Welcome to AquaTrack</h2>
          </div>
          <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.7)", marginBottom: "24px" }}>
            To view your water usage, please link your account to your apartment and flat.
          </p>

          <form onSubmit={handleLinkSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Apartment</label>
              <select
                className="at-input at-focus"
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
                required
              >
                {apartments.length === 0 && <option value="">No apartments available</option>}
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px" }}>Flat Number</label>
              <input
                className="at-input at-focus"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. A-101"
                required
              />
            </div>
            <button type="submit" disabled={submittingLink || apartments.length === 0} className="at-btn-brass at-focus" style={{ alignSelf: "flex-start", padding: "10px 24px", marginTop: "8px" }}>
              {submittingLink ? "Linking..." : "Link My Account"}
            </button>
          </form>
          {linkError && <p className="at-error" style={{ marginTop: "16px" }}>{linkError}</p>}
        </div>
      )}

      {isResident && !loading && residentData && residentData.linked && (
        <div style={{ marginTop: "28px" }}>
          <div className="at-flex at-items-center at-gap-2" style={{ marginBottom: "24px", color: "var(--at-verdigris-deep)" }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              Linked to {residentData.apartmentName}, Flat {residentData.flatNumber}
            </span>
          </div>

          <div className="at-card" style={{ padding: "32px", background: "linear-gradient(to right, #1a2b2b, #233838)", color: "#fff" }}>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>Current Month Usage</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "42px", fontWeight: 700 }}>{residentData.currentMonthUsage || "0.00"}</span>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)" }}>units</span>
            </div>
          </div>

          <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "36px", marginBottom: "16px" }}>Recent Daily Usage</h3>
          <div className="at-card" style={{ overflow: "hidden" }}>
            <table className="at-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Usage Recorded</th>
                </tr>
              </thead>
              <tbody>
                {!residentData.dailyLogs || residentData.dailyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ color: "rgba(20,43,46,0.5)" }}>No readings logged for this month yet.</td>
                  </tr>
                ) : (
                  residentData.dailyLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.readingDate}</td>
                      <td style={{ fontWeight: 500 }}>{log.readingValue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
}
