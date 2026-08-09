import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Home, Users, Plus, Edit2, Trash2, AlertCircle, X, Mail, Gauge, CheckCircle2, XCircle, Building2, Search } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { createHousehold, listHouseholdsByApartment, deleteHousehold, updateHousehold } from "../api/householdApi.js";

const fieldStyle = { display: "flex", flexDirection: "column", gap: "6px" };
const labelStyle = { fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--admin-text-muted)" };
const inputBase = {
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
    <input type={type} style={{ ...inputBase, ...customStyle }} {...props}
      onFocus={e => {
        e.target.style.borderColor = customStyle?.borderColor || "var(--admin-accent)";
        e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--admin-accent) 15%, transparent)";
        if (customFocus) customFocus(e);
      }}
      onBlur={e => {
        e.target.style.borderColor = customStyle?.borderColor || "var(--admin-input-border)";
        e.target.style.boxShadow = "none";
        if (customBlur) customBlur(e);
      }}
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

export default function AdminHouseholdsPage({ auth, setPage }) {
  const { t } = useTranslation();
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError] = useState("");
  const [households, setHouseholds] = useState([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(false);
  const [listError, setListError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [flatSize, setFlatSize] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [residentEmail, setResidentEmail] = useState("");
  const [residentPhone, setResidentPhone] = useState("");
  const [hasWorkingMeter, setHasWorkingMeter] = useState(true);
  const [dailyUsageThreshold, setDailyUsageThreshold] = useState("500.00");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingHouseholdId, setEditingHouseholdId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Inline validation
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function validateEmail(val) {
    if (!val || !val.trim()) return "";
    const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!EMAIL_RE.test(val.trim())) return "Enter a valid email address (e.g. resident@example.com).";
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

  useEffect(() => {
    async function loadApartments() {
      try {
        const data = await listApartments(auth.token);
        const list = data || [];
        setApartments(list);
        if (list.length > 0 && !selectedApartmentId) setSelectedApartmentId(String(list[0].id));
      } catch {
        setApartments([]);
      }
    }
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHouseholds(apartmentId) {
    if (!apartmentId) {
      setHouseholds([]);
      return;
    }
    setLoadingHouseholds(true);
    setListError("");
    try {
      const realData = await listHouseholdsByApartment(auth.token, apartmentId);
      setHouseholds(realData || []);
    } catch (err) {
      setListError(err.message || "Failed to load households.");
      setHouseholds([]);
    } finally {
      setLoadingHouseholds(false);
    }
  }

  useEffect(() => {
    async function run() { await loadHouseholds(selectedApartmentId); }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId]);

  function resetForm() {
    setEditingHouseholdId(null);
    setFlatNumber(""); setFlatSize(""); setOccupancy(""); setResidentEmail(""); setResidentPhone("");
    setHasWorkingMeter(true); setDailyUsageThreshold("500.00");
    setShowForm(false); setFormError(""); setEmailError(""); setPhoneError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const eErr = validateEmail(residentEmail);
    const pErr = validatePhone(residentPhone);
    setEmailError(eErr);
    setPhoneError(pErr);
    if (eErr || pErr) return;
    setFormError("");
    setSubmitting(true);
    try {
      const payload = {
        apartmentId: Number(selectedApartmentId),
        flatNumber, flatSize: Number(flatSize) || 2, occupancy: Number(occupancy) || 3,
        residentEmail, residentPhone, hasWorkingMeter, dailyUsageThreshold: Number(dailyUsageThreshold) || 500,
        occupantName: residentEmail ? residentEmail.split("@")[0] : `Resident ${flatNumber}`,
        status: "ACTIVE",
      };
      if (editingHouseholdId) {
        await updateHousehold(auth.token, editingHouseholdId, payload);
      } else {
        await createHousehold(auth.token, payload);
      }
      await loadHouseholds(selectedApartmentId);
      resetForm();
    } catch (err) {
      setFormError(err.message || `Could not ${editingHouseholdId ? "update" : "create"} household.`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(h) {
    setEditingHouseholdId(h.id);
    setFlatNumber(h.flatNumber); setFlatSize(String(h.flatSize || "")); setOccupancy(String(h.occupancy || ""));
    setResidentEmail(h.residentEmail || ""); setResidentPhone(h.residentPhone || ""); setHasWorkingMeter(h.hasWorkingMeter !== false);
    setDailyUsageThreshold(String(h.dailyUsageThreshold ?? "500.00"));
    setEmailError(""); setPhoneError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this household? This cannot be undone.")) return;
    try {
      await deleteHousehold(auth.token, id);
      await loadHouseholds(selectedApartmentId);
    } catch (err) {
      alert(err.message || "Could not delete household.");
    }
  }

  const filteredHouseholds = households.filter(h =>
    h.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.residentEmail && h.residentEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "32px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <BackToDashboard setPage={setPage} />
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "16px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(56,189,248,0.2) 100%)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={24} color="#34D399" />
            </div>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0, letterSpacing: "-0.02em" }}>{t("households.title")}</h1>
              <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>{t("households.subheading")}</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {apartments.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--admin-text-muted)", fontWeight: 600 }}>{t("households.apartment")}:</span>
              <SaasSelect value={selectedApartmentId} onChange={e => setSelectedApartmentId(e.target.value)} style={{ minWidth: "200px" }}>
                {apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </SaasSelect>
            </div>
          )}
          {apartments.length > 0 && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                border: "none", color: "#FFFFFF", fontWeight: 700, fontSize: "14px",
                padding: "12px 22px", borderRadius: "12px", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(16,185,129,0.4)", fontFamily: "inherit",
              }}
            >
              <Plus size={18} /> {t("households.addHousehold")}
            </button>
          )}
        </div>
      </div>

      {/* Errors */}
      {apartmentsError && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13.5px" }}>
          <AlertCircle size={16} /> {apartmentsError}
        </div>
      )}

      {!apartmentsError && apartments.length === 0 && !loadingHouseholds && (
        <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "20px", padding: "48px", textAlign: "center" }}>
          <Building2 size={44} color="var(--admin-text-muted)" style={{ marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--admin-text-muted)", fontSize: "15px" }}>
            {t("households.noHouseholds")}{" "}
            <button onClick={() => setPage("admin-apartments")} style={{ background: "none", border: "none", color: "#38BDF8", fontWeight: 700, cursor: "pointer", fontSize: "15px", textDecoration: "underline" }}>
              {t("apartments.addApartment")}
            </button>
          </p>
        </div>
      )}

      {/* Form Drawer */}
      {showForm && apartments.length > 0 && (
        <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "20px", padding: "32px", backdropFilter: "blur(20px)", boxShadow: "var(--admin-card-shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0 }}>
              {editingHouseholdId ? t("households.editHousehold") : t("households.addHousehold")}
            </h2>
            <button onClick={resetForm} style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", color: "var(--admin-text-muted)", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>{t("households.title")}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("households.apartment")}</label>
                  <SaasSelect value={selectedApartmentId} onChange={e => setSelectedApartmentId(e.target.value)} disabled={!!editingHouseholdId}>
                    {apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </SaasSelect>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("households.flatNumber")} *</label>
                  <SaasInput value={flatNumber} onChange={e => setFlatNumber(e.target.value)} placeholder="A-101" required />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("households.flatSize")} *</label>
                  <SaasInput type="number" step="0.01" value={flatSize} onChange={e => setFlatSize(e.target.value)} placeholder="850" required />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("households.occupancy")} *</label>
                  <SaasInput type="number" value={occupancy} onChange={e => setOccupancy(e.target.value)} placeholder="3" required />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("households.residentEmail")}</label>
                  <SaasInput
                    type="text"
                    value={residentEmail}
                    onChange={e => { setResidentEmail(e.target.value); if (emailError) setEmailError(validateEmail(e.target.value)); }}
                    onBlur={e => setEmailError(validateEmail(e.target.value))}
                    placeholder="resident@example.com"
                    style={emailError ? { borderColor: "#F87171" } : undefined}
                  />
                  {emailError && <span style={{ fontSize: "12px", color: "#F87171", marginTop: "2px" }}>⚠ {emailError}</span>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Resident Phone</label>
                  <SaasInput
                    type="text"
                    maxLength={10}
                    value={residentPhone}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                      setResidentPhone(val);
                      setPhoneError(validatePhone(val));
                    }}
                    onBlur={e => setPhoneError(validatePhone(e.target.value))}
                    placeholder="e.g. 9876543210"
                    style={phoneError ? { borderColor: "#F87171" } : undefined}
                  />
                  {phoneError && <span style={{ fontSize: "12px", color: "#F87171", marginTop: "2px" }}>⚠ {phoneError}</span>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("households.hasMeter")}</label>
                  <SaasSelect value={hasWorkingMeter ? "true" : "false"} onChange={e => setHasWorkingMeter(e.target.value === "true")}>
                    <option value="true">{t("households.yes")} — Active</option>
                    <option value="false">{t("households.no")} — Faulty</option>
                  </SaasSelect>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>{t("households.dailyThreshold")} *</label>
                  <SaasInput type="number" step="0.01" value={dailyUsageThreshold} onChange={e => setDailyUsageThreshold(e.target.value)} placeholder="500.00" required />
                </div>
              </div>
            </div>
            {formError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#F87171", fontSize: "13px" }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" disabled={submitting || !!emailError || !!phoneError} style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)", border: "none", color: "#FFFFFF", fontWeight: 700, fontSize: "14px", padding: "12px 26px", borderRadius: "10px", cursor: (submitting || emailError || phoneError) ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.35)", fontFamily: "inherit", transition: "all 0.18s", opacity: (emailError || phoneError) ? 0.6 : 1 }}>
                {submitting ? t("common.loading") : (editingHouseholdId ? t("households.save") : t("households.addHousehold"))}
              </button>
              <button type="button" onClick={resetForm} style={{ background: "var(--admin-subcard-bg)", border: "1px solid var(--admin-card-border)", color: "var(--admin-text-muted)", fontWeight: 600, fontSize: "14px", padding: "12px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "inherit" }}>
                {t("households.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Container */}
      {apartments.length > 0 && (
        <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-card-border)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)", boxShadow: "var(--admin-card-shadow)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--admin-text-white)", margin: 0 }}>{t("households.title")}</h2>
              {selectedApartmentId && apartments.find(a => String(a.id) === selectedApartmentId) && (
                <span style={{ fontSize: "12px", color: "#34D399", background: "rgba(16,185,129,0.15)", padding: "4px 12px", borderRadius: "16px", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 700 }}>
                  {apartments.find(a => String(a.id) === selectedApartmentId)?.name}
                </span>
              )}
            </div>

            <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
              <Search size={16} color="var(--admin-text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder={t("common.search")}
                style={{
                  width: "100%",
                  background: "var(--admin-input-bg)",
                  border: "1px solid var(--admin-input-border)",
                  color: "var(--admin-text-white)",
                  padding: "8px 12px 8px 38px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loadingHouseholds && <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>}
          {listError && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "10px", padding: "12px 16px", color: "#F87171", fontSize: "13px" }}>
              <AlertCircle size={16} /> {listError}
            </div>
          )}

          {!loadingHouseholds && !listError && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--admin-card-border)", color: "var(--admin-text-muted)", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "14px 16px" }}>ID</th>
                    <th style={{ padding: "14px 16px" }}>{t("households.flatNumber")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("households.flatSize")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("households.occupancy")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("households.residentEmail")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("households.hasMeter")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("households.dailyThreshold")}</th>
                    <th style={{ padding: "14px 16px", textAlign: "right" }}>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHouseholds.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
                        <Home size={36} color="#334155" style={{ marginBottom: "8px", display: "block", margin: "0 auto 8px" }} />
                        {t("households.noHouseholds")}
                      </td>
                    </tr>
                  ) : (
                    filteredHouseholds.map(h => (
                      <tr key={h.id} style={{ borderBottom: "1px solid var(--admin-border-muted)", transition: "background 0.18s ease" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--admin-table-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "16px" }}>
                          <span style={{ background: "rgba(16,185,129,0.12)", color: "#34D399", fontSize: "12px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>#{h.id}</span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Home size={15} color="#34D399" />
                            </div>
                            <span style={{ fontWeight: 700, color: "var(--admin-text-white)", fontSize: "14px" }}>{h.flatNumber}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: "var(--admin-text-muted)", fontSize: "13.5px" }}>{h.flatSize} sq ft</td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--admin-text-white)", fontSize: "13.5px", fontWeight: 600 }}>
                            <Users size={14} color="#38BDF8" />
                            {h.occupancy} People
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          {h.residentEmail ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94A3B8", fontSize: "13px" }}>
                              <Mail size={13} color="#64748B" /> {h.residentEmail}
                            </div>
                          ) : <span style={{ color: "var(--admin-text-muted)", fontSize: "13px" }}>{t("common.noResults")}</span>}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {h.hasWorkingMeter !== false ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(16,185,129,0.15)", color: "#34D399", fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "16px", border: "1px solid rgba(16,185,129,0.3)" }}>
                              <CheckCircle2 size={13} /> {t("households.yes")}
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(244,63,94,0.15)", color: "#F87171", fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "16px", border: "1px solid rgba(244,63,94,0.3)" }}>
                              <XCircle size={13} /> {t("households.no")}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#38BDF8", fontSize: "13.5px", fontWeight: 700 }}>
                            <Gauge size={14} color="#38BDF8" />
                            {h.dailyUsageThreshold ?? "500.00"} L
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button onClick={() => handleEdit(h)} style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", color: "#38BDF8", fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>
                              <Edit2 size={13} /> {t("households.edit")}
                            </button>
                            <button onClick={() => handleDelete(h.id)} style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.25)", color: "#F87171", fontSize: "12px", fontWeight: 600, padding: "6px 12px", borderRadius: "8px", cursor: "pointer" }}>
                              <Trash2 size={13} /> {t("households.delete")}
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
      )}
    </div>
  );
}
