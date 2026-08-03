import React, { useEffect, useState } from "react";
import { Building2, Plus, Edit2, Trash2, AlertCircle, X, MapPin, Mail, Phone, Search } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { createApartment, listApartments, deleteApartment, updateApartment } from "../api/apartmentApi.js";

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};
const labelStyle = {
  fontSize: "11.5px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#94A3B8",
};
const inputStyle = {
  width: "100%",
  background: "rgba(13, 22, 36, 0.9)",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  color: "#FFFFFF",
  padding: "10px 14px",
  borderRadius: "10px",
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
      style={inputStyle}
      {...props}
      onFocus={(e) => {
        e.target.style.borderColor = "#38BDF8";
        e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.18)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.14)";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

export default function AdminApartmentsPage({ auth, setPage }) {
  const [apartments, setApartments] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [baseTierLimit, setBaseTierLimit] = useState("");
  const [excessRate, setExcessRate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingApartmentId, setEditingApartmentId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadApartments() {
    setLoadingList(true);
    setListError("");
    try {
      const data = await listApartments(auth.token);
      setApartments(data);
    } catch (err) {
      setListError(err.message || "Could not load apartments.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setName(""); setAddress(""); setOwnerEmail(""); setOwnerPhone("");
    setBaseRate(""); setBaseTierLimit(""); setExcessRate("");
    setEditingApartmentId(null); setShowForm(false); setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload = {
        name, address, ownerEmail, ownerPhone,
        baseRate: Number(baseRate),
        baseTierLimit: Number(baseTierLimit),
        excessRate: Number(excessRate),
      };
      if (editingApartmentId) {
        await updateApartment(auth.token, editingApartmentId, payload);
      } else {
        await createApartment(auth.token, payload);
      }
      resetForm();
      await loadApartments();
    } catch (err) {
      setFormError(err.message || `Could not ${editingApartmentId ? "update" : "create"} apartment.`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(a) {
    setEditingApartmentId(a.id);
    setName(a.name); setAddress(a.address);
    setOwnerEmail(a.ownerEmail || ""); setOwnerPhone(a.ownerPhone || "");
    setBaseRate(a.tariffPlan?.baseRate ?? ""); setBaseTierLimit(a.tariffPlan?.baseTierLimit ?? "");
    setExcessRate(a.tariffPlan?.excessRate ?? "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this apartment? This cannot be undone.")) return;
    try {
      await deleteApartment(auth.token, id);
      await loadApartments();
    } catch (err) {
      alert(err.message || "Could not delete apartment.");
    }
  }

  const filteredApartments = apartments.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "32px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <BackToDashboard setPage={setPage} />
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "16px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(56,189,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={24} color="#38BDF8" />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>Apartment Management</h1>
              <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: "2px 0 0" }}>Onboard buildings, configure tier rates, and manage contact info</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
            border: "none", color: "#0F172A", fontWeight: 700, fontSize: "14px",
            padding: "12px 22px", borderRadius: "12px", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(56,189,248,0.4)", fontFamily: "inherit",
            transition: "all 0.2s ease",
          }}
        >
          <Plus size={18} /> Add Apartment
        </button>
      </div>

      {/* Form Drawer / Panel */}
      {showForm && (
        <div style={{ background: "rgba(17, 26, 42, 0.9)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(20px)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
              {editingApartmentId ? "Edit Building Details" : "Register New Apartment"}
            </h2>
            <button onClick={resetForm} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#94A3B8", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Building Information</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Apartment Name *</label>
                  <SaasInput value={name} onChange={e => setName(e.target.value)} placeholder="Green Meadows Residency" required />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Address *</label>
                  <SaasInput value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Lake View Road, City" required />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Owner Email</label>
                  <SaasInput type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="owner@example.com" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Owner Phone</label>
                  <SaasInput value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="+91-9876543210" />
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Tariff Plan (Water Rates)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Base Rate (₹/L) *</label>
                  <SaasInput type="number" step="0.01" required value={baseRate} onChange={e => setBaseRate(e.target.value)} placeholder="1.00" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Base Tier Limit (L) *</label>
                  <SaasInput type="number" step="0.01" required value={baseTierLimit} onChange={e => setBaseTierLimit(e.target.value)} placeholder="5000" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Excess Rate (₹/L) *</label>
                  <SaasInput type="number" step="0.01" required value={excessRate} onChange={e => setExcessRate(e.target.value)} placeholder="2.50" />
                </div>
              </div>
            </div>

            {formError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#F87171", fontSize: "13px" }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none",
                  color: "#0F172A", fontWeight: 700, fontSize: "14px", padding: "12px 26px",
                  borderRadius: "10px", cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(56,189,248,0.35)", fontFamily: "inherit",
                }}
              >
                {submitting ? (editingApartmentId ? "Saving…" : "Adding…") : (editingApartmentId ? "Save Changes" : "Create Apartment")}
              </button>
              <button type="button" onClick={resetForm} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94A3B8", fontWeight: 600, fontSize: "14px", padding: "12px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Apartments Table Container */}
      <div style={{ background: "rgba(17,26,42,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Registered Apartments</h2>
            <span style={{ fontSize: "12.5px", color: "#94A3B8" }}>{apartments.length} total complexes registered</span>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
            <Search size={16} color="#64748B" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by name or address..."
              style={{
                width: "100%",
                background: "rgba(13, 22, 36, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                padding: "8px 12px 8px 38px",
                borderRadius: "10px",
                fontSize: "13px",
                outline: "none",
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loadingList ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
            Loading apartment list…
          </div>
        ) : listError ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#F87171", fontSize: "13px" }}>
            <AlertCircle size={16} /> {listError}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 16px" }}>ID</th>
                  <th style={{ padding: "14px 16px" }}>Building Name</th>
                  <th style={{ padding: "14px 16px" }}>Address</th>
                  <th style={{ padding: "14px 16px" }}>Base Rate</th>
                  <th style={{ padding: "14px 16px" }}>Base Limit</th>
                  <th style={{ padding: "14px 16px" }}>Excess Rate</th>
                  <th style={{ padding: "14px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApartments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                      <Building2 size={36} color="#334155" style={{ marginBottom: "8px", display: "block", margin: "0 auto 8px" }} />
                      No apartments match your search. Click "Add Apartment" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredApartments.map((a) => (
                    <tr
                      key={a.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.18s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px" }}>
                        <span style={{ background: "rgba(56,189,248,0.12)", color: "#38BDF8", fontSize: "12px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>
                          #{a.id}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Building2 size={16} color="#38BDF8" />
                          </div>
                          <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "14px" }}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: "#94A3B8", fontSize: "13px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <MapPin size={13} color="#64748B" />
                          {a.address}
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: "#38BDF8", fontSize: "13.5px", fontWeight: 700 }}>₹{a.tariffPlan?.baseRate ?? "0"}/L</td>
                      <td style={{ padding: "16px", color: "#FFFFFF", fontSize: "13.5px", fontWeight: 600 }}>{a.tariffPlan?.baseTierLimit ?? "0"} L</td>
                      <td style={{ padding: "16px", color: "#F87171", fontSize: "13.5px", fontWeight: 700 }}>₹{a.tariffPlan?.excessRate ?? "0"}/L</td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEdit(a)}
                            style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", color: "#38BDF8", fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)", color: "#F87171", fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
