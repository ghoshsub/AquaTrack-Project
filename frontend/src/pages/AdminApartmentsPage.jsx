import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Plus, Edit2, Trash2, AlertCircle, X, MapPin, Search } from "lucide-react";
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
  color: "var(--admin-text-muted)",
};
const inputStyle = {
  width: "100%",
  background: "var(--admin-input-bg)",
  border: "1px solid var(--admin-input-border)",
  color: "var(--admin-text-white)",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
};

function SaasInput({ type = "text", style: customStyle, onFocus: customFocus, onBlur: customBlur, ...props }) {
  return (
    <input
      type={type}
      style={{ ...inputStyle, ...customStyle }}
      {...props}
      onFocus={(e) => {
        e.target.style.borderColor = customStyle?.borderColor || "#0284C7";
        e.target.style.boxShadow = "0 0 0 3px rgba(2,132,199,0.15)";
        if (customFocus) customFocus(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = customStyle?.borderColor || "var(--admin-input-border)";
        e.target.style.boxShadow = "none";
        if (customBlur) customBlur(e);
      }}
    />
  );
}

export default function AdminApartmentsPage({ auth, setPage }) {
  const { t } = useTranslation();
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

  // Inline validation errors
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function validateEmail(val) {
    if (!val || !val.trim()) return "";
    const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!EMAIL_RE.test(val.trim())) return "Enter a valid email address (e.g. owner@example.com).";
    return "";
  }
  function validatePhone(val) {
    if (!val || !val.trim()) return "";
    const clean = val.replace(/[^0-9]/g, "");
    if (clean.length !== 10) {
      return "Phone number must be exactly 10 digits.";
    }
    return "";
  }

  async function loadApartments() {
    setLoadingList(true);
    setListError("");
    try {
      const backendData = await listApartments(auth.token);
      setApartments(backendData || []);
    } catch (err) {
      setListError(err.message || "Failed to load apartments.");
      setApartments([]);
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
    setEmailError(""); setPhoneError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Re-validate before submit
    const eErr = validateEmail(ownerEmail);
    const pErr = validatePhone(ownerPhone);
    setEmailError(eErr);
    setPhoneError(pErr);
    if (eErr || pErr) return;
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
      await loadApartments();
      resetForm();
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
    setEmailError(""); setPhoneError("");
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
              <Building2 size={24} color="#0284C7" />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("apartments.title")}</h1>
              <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>{t("apartments.subheading")}</p>
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
          <Plus size={18} /> {t("apartments.addApartment")}
        </button>
      </div>

      {/* Form Drawer / Panel */}
      {showForm && (
        <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(20px)", boxShadow: "var(--admin-card-shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0 }}>
              {editingApartmentId ? t("apartments.editApartment") : t("apartments.addApartment")}
            </h2>
            <button onClick={resetForm} style={{ background: "var(--at-btn-secondary-bg)", border: "none", color: "var(--admin-text-muted)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>{t("apartments.details")}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("apartments.name")} *</label>
                  <SaasInput value={name} onChange={e => setName(e.target.value)} placeholder={t("apartments.namePlaceholder")} required />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("apartments.address")} *</label>
                  <SaasInput value={address} onChange={e => setAddress(e.target.value)} placeholder={t("apartments.addressPlaceholder")} required />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("apartments.ownerEmail")}</label>
                  <SaasInput
                    type="text"
                    value={ownerEmail}
                    onChange={e => { setOwnerEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                    onBlur={e => setEmailError(validateEmail(e.target.value))}
                    placeholder={t("apartments.emailPlaceholder")}
                    style={emailError ? { ...inputStyle, borderColor: "#F87171" } : undefined}
                  />
                  {emailError && <span style={{ fontSize: "12px", color: "#F87171", marginTop: "2px" }}>⚠ {emailError}</span>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("apartments.ownerPhone")}</label>
                  <SaasInput
                    type="text"
                    maxLength={10}
                    value={ownerPhone}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                      setOwnerPhone(val);
                      setPhoneError(validatePhone(val));
                    }}
                    onBlur={e => setPhoneError(validatePhone(e.target.value))}
                    placeholder={t("apartments.phonePlaceholder")}
                    style={phoneError ? { borderColor: "#F87171" } : undefined}
                  />
                  {phoneError && <span style={{ fontSize: "12px", color: "#F87171", marginTop: "2px" }}>⚠ {phoneError}</span>}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--admin-card-border)" }} />

            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>{t("tariffs.title")}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("tariffs.baseRate")} *</label>
                  <SaasInput type="number" step="0.01" required value={baseRate} onChange={e => setBaseRate(e.target.value)} placeholder="1.00" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("tariffs.baseTierLimit")} *</label>
                  <SaasInput type="number" step="0.01" required value={baseTierLimit} onChange={e => setBaseTierLimit(e.target.value)} placeholder="5000" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("tariffs.excessRate")} *</label>
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
                disabled={submitting || !!emailError || !!phoneError}
                style={{
                  background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)", border: "none",
                  color: "#0F172A", fontWeight: 700, fontSize: "14px", padding: "12px 26px",
                  borderRadius: "10px", cursor: (submitting || emailError || phoneError) ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(56,189,248,0.35)", fontFamily: "inherit",
                  opacity: (emailError || phoneError) ? 0.6 : 1,
                }}
              >
                {submitting ? t("common.loading") : (editingApartmentId ? t("apartments.save") : t("apartments.addApartment"))}
              </button>
              <button type="button" onClick={resetForm} style={{ background: "var(--at-btn-secondary-bg)", border: "1px solid var(--at-btn-secondary-border)", color: "var(--admin-text-muted)", fontWeight: 600, fontSize: "14px", padding: "12px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                {t("apartments.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Apartments Table Container */}
      <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)", boxShadow: "var(--admin-card-shadow)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0 }}>Registered Apartments</h2>
            <span style={{ fontSize: "12.5px", color: "var(--admin-text-muted)" }}>{apartments.length} total complexes registered</span>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
            <Search size={16} color="var(--admin-text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by name or address..."
              style={{
                width: "100%",
                background: "var(--admin-input-bg)",
                border: "1px solid var(--admin-input-border)",
                color: "var(--admin-text-white)",
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
          <div style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-muted)" }}>
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
                <tr style={{ borderBottom: "1px solid var(--admin-card-border)", color: "var(--admin-text-muted)", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                      style={{ borderBottom: "1px solid var(--admin-border-muted)", transition: "background 0.18s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-subcard-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px" }}>
                        <span style={{ background: "rgba(2,132,199,0.1)", color: "#0284C7", fontSize: "12px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>
                          #{a.id}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(2,132,199,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Building2 size={16} color="#0284C7" />
                          </div>
                          <span style={{ fontWeight: 700, color: "var(--admin-text-white)", fontSize: "14px" }}>{a.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: "var(--admin-text-muted)", fontSize: "13px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <MapPin size={13} color="var(--admin-text-muted)" />
                          {a.address}
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: "var(--admin-accent)", fontSize: "13.5px", fontWeight: 700 }}>₹{a.tariffPlan?.baseRate ?? "0"}/L</td>
                      <td style={{ padding: "16px", color: "var(--admin-text-white)", fontSize: "13.5px", fontWeight: 600 }}>{a.tariffPlan?.baseTierLimit ?? "0"} L</td>
                      <td style={{ padding: "16px", color: "var(--admin-error-text)", fontSize: "13.5px", fontWeight: 700 }}>₹{a.tariffPlan?.excessRate ?? "0"}/L</td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEdit(a)}
                            style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(2,132,199,0.1)", border: "1px solid rgba(2,132,199,0.25)", color: "var(--admin-accent)", fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            style={{ display: "flex", alignItems: "center", gap: "5px", background: "var(--admin-error-bg)", border: "1px solid var(--admin-error-border)", color: "var(--admin-error-text)", fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}
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
