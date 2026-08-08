import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Building2, Save, CheckCircle, AlertCircle, Calculator, Layers, Info } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { getTariffPlan, saveTariffPlan } from "../api/tariffApi.js";

function formatRupees(amount) {
  return "₹ " + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
}

function formatLiters(value) {
  return new Intl.NumberFormat("en-IN").format(Math.round(value || 0)) + " L";
}

const inputBase = {
  width: "100%", background: "rgba(13,22,36,0.9)", border: "1px solid rgba(255,255,255,0.14)",
  color: "#FFFFFF", padding: "12px 14px", borderRadius: "10px", fontSize: "14px",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "all 0.2s ease",
};

const cardStyle = {
  background: "rgba(17,26,42,0.9)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
};

export default function AdminTariffPlansPage({ auth, setPage }) {
  const { t } = useTranslation();
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");

  const [loadingApartments, setLoadingApartments] = useState(true);
  const [loadingTariff, setLoadingTariff] = useState(false);
  const [savingTariff, setSavingTariff] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [baseRate, setBaseRate] = useState("");
  const [baseTierLimit, setBaseTierLimit] = useState("");
  const [excessRate, setExcessRate] = useState("");

  const [calcUsageLiters, setCalcUsageLiters] = useState("12000");

  useEffect(() => {
    async function loadApartments() {
      setLoadingApartments(true);
      setError("");
      try {
        const data = await listApartments(auth.token);
        const list = data || [];
        setApartments(list);
        if (list.length > 0 && !selectedApartmentId) setSelectedApartmentId(String(list[0].id));
      } catch (err) {
        setError(err.message || "Failed to load apartments.");
        setApartments([]);
      } finally {
        setLoadingApartments(false);
      }
    }
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  useEffect(() => {
    async function loadTariff() {
      if (!selectedApartmentId) {
        setBaseRate(""); setBaseTierLimit(""); setExcessRate(""); return;
      }
      setLoadingTariff(true);
      setError(""); setSuccessMsg("");
      try {
        const realData = await getTariffPlan(auth.token, selectedApartmentId);
        if (realData) {
          setBaseRate(String(realData.baseRate ?? 10));
          setBaseTierLimit(String(realData.baseTierLimit ?? 1000));
          setExcessRate(String(realData.excessRate ?? 15));
        } else {
          setBaseRate("10");
          setBaseTierLimit("1000");
          setExcessRate("15");
        }
      } catch {
        setBaseRate("10");
        setBaseTierLimit("1000");
        setExcessRate("15");
      } finally {
        setLoadingTariff(false);
      }
    }
    loadTariff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId, auth.token]);

  async function handleSaveTariff(e) {
    e.preventDefault();
    if (!selectedApartmentId) return;
    setSavingTariff(true);
    setError(""); setSuccessMsg("");
    try {
      const payload = {
        apartmentId: Number(selectedApartmentId),
        baseRate: Number(baseRate),
        baseTierLimit: Number(baseTierLimit),
        excessRate: Number(excessRate),
      };
      await saveTariffPlan(auth.token, payload);
      setSuccessMsg("Tariff plan updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save tariff plan.");
    } finally {
      setSavingTariff(false);
    }
  }

  const sampleLiters = Number(calcUsageLiters) || 0;
  const bRate = Number(baseRate) || 0;
  const bLimit = Number(baseTierLimit) || 0;
  const eRate = Number(excessRate) || 0;

  const excessUsage = Math.max(0, sampleLiters - bLimit);
  const excessCost = excessUsage * eRate;
  const calculatedTotal = bRate + excessCost;

  const selectedApartment = apartments.find((a) => String(a.id) === String(selectedApartmentId));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "32px" }}>
      {/* Header */}
      <div>
        <BackToDashboard setPage={setPage} />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "16px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(99,102,241,0.2) 100%)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={24} color="#FBBF24" />
          </div>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>{t("tariffs.title")}</h1>
            <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: "2px 0 0" }}>{t("tariffs.subheading")}</p>
          </div>
        </div>
      </div>

      {/* Apartment Selector */}
      <div style={{ ...cardStyle, padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={20} color="#38BDF8" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{t("tariffs.apartment")}</label>
          <select value={selectedApartmentId} onChange={(e) => setSelectedApartmentId(e.target.value)} disabled={loadingApartments}
            style={{ ...inputBase, padding: "10px 16px", fontSize: "14.5px", minWidth: "280px" }}>
            {apartments.length === 0 && <option value="">No apartments found</option>}
            {apartments.map((apt) => <option key={apt.id} value={apt.id}>{apt.name} ({apt.address})</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "12px", padding: "12px 16px", color: "#F87171", fontSize: "13.5px" }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: "12px", padding: "12px 16px", color: "#34D399", fontSize: "13.5px" }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Main 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
        {/* Tariff Configuration Form */}
        <div style={{ ...cardStyle, padding: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={17} color="#FBBF24" />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFF", margin: 0 }}>{t("tariffs.title")}</h2>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0" }}>Configure billing rates for this building</p>
            </div>
          </div>

          {loadingTariff ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
          ) : (
            <form onSubmit={handleSaveTariff} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Base Rate */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  {t("tariffs.baseRate")}
                </label>
                <input type="number" step="0.01" min="0" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} placeholder="e.g. 150.00" required
                  style={inputBase}
                  onFocus={e => { e.target.style.borderColor = "#FBBF24"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.18)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
                />
                <span style={{ fontSize: "12px", color: "#64748B", marginTop: "5px", display: "block" }}>Fixed minimum charge per billing cycle, up to the base tier limit.</span>
              </div>

              {/* Base Tier Limit */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  {t("tariffs.baseTierLimit")}
                </label>
                <input type="number" step="1" min="0" value={baseTierLimit} onChange={(e) => setBaseTierLimit(e.target.value)} placeholder="e.g. 10000" required
                  style={inputBase}
                  onFocus={e => { e.target.style.borderColor = "#34D399"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.18)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
                />
                <span style={{ fontSize: "12px", color: "#64748B", marginTop: "5px", display: "block" }}>Volume covered under the base charge before excess rates apply.</span>
              </div>

              {/* Excess Rate */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  Excess Usage Rate (₹ per Liter)
                </label>
                <input type="number" step="0.001" min="0" value={excessRate} onChange={(e) => setExcessRate(e.target.value)} placeholder="e.g. 0.02" required
                  style={inputBase}
                  onFocus={e => { e.target.style.borderColor = "#F87171"; e.target.style.boxShadow = "0 0 0 3px rgba(244,63,94,0.18)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
                />
                <span style={{ fontSize: "12px", color: "#64748B", marginTop: "5px", display: "block" }}>Rate per extra liter consumed above the base tier limit.</span>
              </div>

              <button type="submit" disabled={savingTariff || !selectedApartmentId}
                style={{ width: "100%", background: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)", border: "none", color: "#1C1917", fontWeight: 800, fontSize: "15px", padding: "14px", borderRadius: "12px", cursor: savingTariff ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 16px rgba(245,158,11,0.35)", fontFamily: "inherit", marginTop: "8px" }}>
                <Save size={18} />
                {savingTariff ? "Saving Tariff Plan…" : "Save Tariff Plan"}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Summary + Calculator */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Active Structure Summary */}
          <div style={{ ...cardStyle, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Info size={17} color="#38BDF8" />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFF", margin: 0 }}>
                Active Structure — {selectedApartment?.name || "Select a building"}
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", padding: "16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "11.5px", color: "#38BDF8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Base Rate</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF" }}>{formatRupees(bRate)}</div>
              </div>
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", padding: "16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "11.5px", color: "#34D399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Included Volume</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF" }}>{formatLiters(bLimit)}</div>
              </div>
            </div>

            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "11.5px", color: "#FBBF24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Excess Surcharge</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF" }}>
                {formatRupees(eRate)} <span style={{ fontSize: "13px", fontWeight: 500, color: "#94A3B8" }}>/ Liter</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>= {formatRupees(eRate * 1000)} per 1,000 L</div>
            </div>
          </div>

          {/* Bill Simulation Calculator */}
          <div style={{ ...cardStyle, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calculator size={17} color="#A78BFA" />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFF", margin: 0 }}>Live Bill Simulator</h3>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0" }}>Preview invoice total for any consumption volume</p>
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Test Consumption (Liters)</label>
              <input type="number" value={calcUsageLiters} onChange={(e) => setCalcUsageLiters(e.target.value)} placeholder="Enter test volume…"
                style={inputBase}
                onFocus={e => { e.target.style.borderColor = "#A78BFA"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.18)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: "12px", padding: "18px", fontSize: "13.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                <span style={{ color: "#94A3B8" }}>Base Charge:</span>
                <span style={{ color: "#FFF", fontWeight: 700 }}>{formatRupees(bRate)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                <span style={{ color: "#94A3B8" }}>Excess ({formatLiters(excessUsage)} @ {formatRupees(eRate)}/L):</span>
                <span style={{ color: "#FBBF24", fontWeight: 700 }}>{formatRupees(excessCost)}</span>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "18px", color: "#A78BFA" }}>
                <span>Estimated Total:</span>
                <span>{formatRupees(calculatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
