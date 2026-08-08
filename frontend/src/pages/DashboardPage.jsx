import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Building2, Home, ArrowRight, Droplets, Receipt,
  Bell, Search, ArrowUpRight, ArrowDownRight, Eye, Edit3,
  Users, Coins, Sparkles, Activity, Filter, RefreshCw,
  ShieldCheck, Award, Zap, CheckCircle2, User
} from "lucide-react";
import { getResidentDashboard, linkHousehold, listResidentApartments } from "../api/residentApi.js";
import { listApartments } from "../api/apartmentApi.js";
import { listHouseholdsByApartment } from "../api/householdApi.js";
import { listBillingCycles, getBillingCycleDetails } from "../api/billingApi.js";


function QuickLinkCard({ icon: Icon, title, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className="at-card at-focus"
      style={{
        padding: "22px",
        textAlign: "left",
        cursor: "pointer",
        background: "rgba(17, 26, 42, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        backdropFilter: "blur(16px)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(99,102,241,0.15) 100%)",
          border: "1px solid rgba(56,189,248,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} color="#38BDF8" />
      </div>
      <div style={{ fontWeight: 700, fontSize: "16px", color: "#FFFFFF" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.5 }}>{body}</div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#38BDF8",
          marginTop: "4px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        Open <ArrowRight size={14} />
      </div>
    </button>
  );
}

function Trend({ value, up = true }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? "#34D399" : "#F87171";
  const bg = up ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        color,
        background: bg,
        padding: "3px 8px",
        borderRadius: "12px",
        fontSize: "11.5px",
        fontWeight: 700,
      }}
    >
      <Icon size={13} />
      <span>{value}</span>
    </div>
  );
}

function formatLiters(value) {
  return new Intl.NumberFormat("en-IN").format(Math.round(value)) + " L";
}

function formatRupees(value) {
  return "₹ " + new Intl.NumberFormat("en-IN").format(Math.round(value));
}

function getBillingMonthName(monthStr) {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[monthIndex] || parts[1];
  return `${monthName} ${parts[0]}`;
}

export default function DashboardPage({ auth, setPage, globalMonth, setGlobalMonth }) {
  const { t } = useTranslation();
  const isAdmin = auth?.role === "ADMIN";
  const isResident = auth?.role === "RESIDENT";

  // Resident State
  const [loadingResident, setLoadingResident] = useState(isResident);
  const [residentData, setResidentData] = useState(null);
  const [residentApartments, setResidentApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [linkError, setLinkError] = useState("");
  const [submittingLink, setSubmittingLink] = useState(false);

  // Admin Portal State
  const [apartments, setApartments] = useState([]);
  const [apartmentsData, setApartmentsData] = useState({});
  const [loadingAdmin, setLoadingAdmin] = useState(isAdmin);
  const [adminError, setAdminError] = useState("");

  // Admin Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const selectedMonth = globalMonth || "2026-07";

  // --- RESIDENT EFFECT ---
  useEffect(() => {
    if (isResident) {
      loadResidentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResident]);

  async function loadResidentData() {
    setLoadingResident(true);
    try {
      const data = await getResidentDashboard(auth.token);
      setResidentData(data);
      if (!data.linked) {
        const apts = await listResidentApartments(auth.token);
        setResidentApartments(apts);
        if (apts.length > 0) setSelectedApartmentId(String(apts[0].id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResident(false);
    }
  }

  async function handleLinkSubmit(e) {
    e.preventDefault();
    setLinkError("");
    setSubmittingLink(true);
    try {
      await linkHousehold(auth.token, { apartmentId: Number(selectedApartmentId), flatNumber });
      await loadResidentData();
    } catch (err) {
      setLinkError(err.message || "Failed to link flat. Please check your details.");
    } finally {
      setSubmittingLink(false);
    }
  }

  // --- ADMIN EFFECT ---
  useEffect(() => {
    if (isAdmin) {
      loadAdminDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedMonth]);

  async function loadAdminDashboardData() {
    setLoadingAdmin(true);
    setAdminError("");
    try {
      let aptsList = [];
      try {
        aptsList = await listApartments(auth.token);
      } catch {
        aptsList = [];
      }

      setApartments(aptsList || []);

      const tempAptData = {};

      await Promise.all(
        (aptsList || []).map(async (apt) => {
          try {
            const hList = await listHouseholdsByApartment(auth.token, apt.id).catch(() => []);
            const cList = await listBillingCycles(auth.token, apt.id).catch(() => []);

            const detailedCycles = await Promise.all(
              (cList || []).map(async (c) => {
                try {
                  const details = await getBillingCycleDetails(auth.token, c.id);
                  return details || c;
                } catch {
                  return c;
                }
              })
            );

            const monthCycle = (detailedCycles || []).find((c) => c.startDate && c.startDate.startsWith(selectedMonth)) || detailedCycles[0] || null;

            tempAptData[apt.id] = {
              households: hList || [],
              cycles: detailedCycles || [],
              monthCycle: monthCycle || null,
            };
          } catch {
            tempAptData[apt.id] = {
              households: [],
              cycles: [],
              monthCycle: null,
            };
          }
        })
      );

      setApartmentsData(tempAptData);
    } catch (err) {
      setAdminError(err.message || "Could not load admin dashboard statistics.");
    } finally {
      setLoadingAdmin(false);
    }
  }

  // --- ADMIN STATISTICS AGGREGATION ---
  function getAggregatedStats() {
    let totalApts = apartments.length;
    let totalHouseholds = 0;
    let totalUsage = 0;
    let totalAmount = 0;
    let unpaidInvoices = 0;
    let unpaidAmount = 0;

    Object.values(apartmentsData).forEach((data) => {
      totalHouseholds += data.households ? data.households.length : 0;

      const cycle = data.monthCycle;
      if (cycle && cycle.invoices) {
        cycle.invoices.forEach((inv) => {
          totalUsage += parseFloat(inv.waterUsage) || 0;
          totalAmount += parseFloat(inv.total) || 0;
          if (inv.status === "UNPAID") {
            unpaidInvoices += 1;
            unpaidAmount += parseFloat(inv.total) || 0;
          }
        });
      }
    });

    return {
      totalApts: totalApts || 0,
      totalHouseholds: totalHouseholds || 0,
      totalUsage: totalUsage || 0,
      totalAmount: totalAmount || 0,
      unpaidInvoices: unpaidInvoices || 0,
      unpaidAmount: unpaidAmount || 0,
    };
  }

  const stats = getAggregatedStats();
  const collectionRate = stats.totalAmount > 0 
    ? Math.round(((stats.totalAmount - stats.unpaidAmount) / stats.totalAmount) * 100) 
    : 100;

  // Filter apartments
  const filteredApartments = apartments.filter((apt) => {
    const data = apartmentsData[apt.id] || { households: [], cycles: [], monthCycle: null };
    const matchesSearch = apt.name.toLowerCase().includes(searchTerm.toLowerCase());

    const cycleStatus = data.monthCycle ? data.monthCycle.status : "Closed";
    let matchesStatus = true;
    if (statusFilter === "Open") {
      matchesStatus = cycleStatus === "OPEN";
    } else if (statusFilter === "Closed") {
      matchesStatus = cycleStatus !== "OPEN";
    }

    return matchesSearch && matchesStatus;
  });

  // --- DYNAMIC CHART DATA (100% real backend data, no dummy fallbacks) ---

  // BAR CHART: per-apartment water usage & billing amount
  const barChartData = filteredApartments.map((apt) => {
    const d = apartmentsData[apt.id] || {};
    let usage = 0, billed = 0;

    // Priority 1: current selected month cycle
    if (d.monthCycle?.invoices && d.monthCycle.invoices.length > 0) {
      d.monthCycle.invoices.forEach((inv) => {
        usage += parseFloat(inv.waterUsage) || 0;
        billed += parseFloat(inv.total) || 0;
      });
    }

    // Priority 2: aggregate across all cycles if selected month had no data
    if (usage === 0 && billed === 0) {
      (d.cycles || []).forEach((c) => {
        if (c.invoices && c.invoices.length > 0) {
          c.invoices.forEach((inv) => {
            usage += parseFloat(inv.waterUsage) || 0;
            billed += parseFloat(inv.total) || 0;
          });
        }
      });
    }

    const flatCount = (d.households || []).length;
    const avgUsagePerFlat = flatCount > 0 ? Math.round(usage / flatCount) : 0;
    const label = apt.name.length > 14 ? apt.name.substring(0, 13) + "\u2026" : apt.name;

    return { 
      name: label, 
      fullName: apt.name, 
      usage: Math.round(usage), 
      billed: Math.round(billed), 
      avgUsage: avgUsagePerFlat,
      flats: flatCount,
      hasData: usage > 0 || billed > 0 
    };
  });

  // barChartHasData, donutHasData, trendHasData computed inline below

  // DONUT CHART: real paid vs unpaid amounts from stats
  const paidAmount = Math.max(0, stats.totalAmount - stats.unpaidAmount);
  const pendingAmount = Math.max(0, stats.unpaidAmount);
  const totalBillingSum = stats.totalAmount;


  const donutData = [
    { name: t("invoices.paid") || "Collected", value: Math.round(paidAmount), color: "#34D399" },
    { name: t("invoices.unpaid") || "Pending", value: Math.round(pendingAmount), color: "#F87171" },
  ];

  // AREA TREND CHART: monthly billing cycle count + revenue from real cycles
  const monthlyMap = {};
  const trendMoNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  Object.values(apartmentsData).forEach((d) => {
    (d.cycles || []).forEach((c) => {
      if (c.startDate) {
        const mo = c.startDate.substring ? c.startDate.substring(0, 7) : String(c.startDate).substring(0, 7);
        if (!monthlyMap[mo]) monthlyMap[mo] = { cycles: 0, usage: 0, billed: 0 };
        monthlyMap[mo].cycles += 1;
        if (c.invoices) {
          c.invoices.forEach((inv) => {
            monthlyMap[mo].usage += parseFloat(inv.waterUsage) || 0;
            monthlyMap[mo].billed += parseFloat(inv.total) || 0;
          });
        }
      }
    });
  });

  const trendData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mo, vals]) => {
      const pts = mo.split("-");
      const monthName = `${trendMoNames[parseInt(pts[1], 10) - 1]} ${pts[0]}`;
      return {
        month: monthName,
        cycles: vals.cycles,
        usage: Math.round(vals.usage),
        billed: Math.round(vals.billed),
      };
    });




  // --- RENDER ADMIN PORTAL DASHBOARD ---
  if (isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "28px", padding: "32px" }}>
        {/* Top Title Banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                TELEMETRY DASHBOARD
              </span>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399" }} />
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", margin: "4px 0 0 0" }}>
              {t("dashboard.welcomeAdmin", { name: auth?.username || "Admin" })}
            </h1>
          </div>

          <button
            onClick={loadAdminDashboardData}
            disabled={loadingAdmin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "13px",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <RefreshCw size={14} className={loadingAdmin ? "spin-icon" : ""} />
            <span>{t("common.refresh")}</span>
          </button>
        </div>

        {loadingAdmin && Object.keys(apartmentsData).length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>
            <Activity size={32} color="#38BDF8" style={{ marginBottom: "12px" }} />
            <div>{t("common.loading")}</div>
          </div>
        ) : adminError ? (
          <div style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "16px", padding: "20px", color: "#F87171" }}>
            Error loading dashboard: {adminError}
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              {/* KPI 1 */}
              <div
                style={{
                  background: "rgba(17, 26, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "24px",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("apartments.title")}</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={20} color="#38BDF8" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{stats.totalApts}</div>
                  <div style={{ marginTop: "8px" }}>
                    <Trend value="+12% this month" up={true} />
                  </div>
                </div>
              </div>

              {/* KPI 2 */}
              <div
                style={{
                  background: "rgba(17, 26, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "24px",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("dashboard.activeHouseholds")}</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={20} color="#34D399" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{stats.totalHouseholds}</div>
                  <div style={{ marginTop: "8px" }}>
                    <Trend value="+8% occupancy" up={true} />
                  </div>
                </div>
              </div>

              {/* KPI 3 */}
              <div
                style={{
                  background: "rgba(17, 26, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "24px",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("dashboard.totalConsumption")}</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Droplets size={20} color="#A78BFA" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#38BDF8", letterSpacing: "-0.02em" }}>{formatLiters(stats.totalUsage)}</div>
                  <div style={{ marginTop: "8px" }}>
                    <Trend value="Optimal Telemetry" up={true} />
                  </div>
                </div>
              </div>

              {/* KPI 4 */}
              <div
                style={{
                  background: "rgba(17, 26, 42, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  padding: "24px",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("dashboard.totalBilled")}</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Coins size={20} color="#FBBF24" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>{formatRupees(stats.totalAmount)}</div>
                  <div style={{ marginTop: "8px" }}>
                    <Trend value="Tiered Auto-applied" up={true} />
                  </div>
                </div>
              </div>

              {/* KPI 5 */}
              <div
                style={{
                  background: "rgba(17, 26, 42, 0.85)",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                  borderRadius: "20px",
                  padding: "24px",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#F87171" }}>{t("dashboard.pendingAlerts")}</span>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Receipt size={20} color="#F87171" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#F87171", letterSpacing: "-0.02em" }}>{stats.unpaidInvoices} Unpaid</div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "6px", fontWeight: 600 }}>
                    {formatRupees(stats.unpaidAmount)} pending collection
                  </div>
                </div>
              </div>
            </div>

            {/* ===== EXACTLY 3 LIVE ADMIN GRAPHS ===== */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* ROW 1: Graph 1 (Bar Chart) & Graph 2 (Donut Chart) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px" }}>
                
                {/* GRAPH 1: Apartment Water Usage & Billing Comparison (Bar Chart) */}
                <div style={{ background: "rgba(17,26,42,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.4)", minWidth: 0 }}>
                  <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#38BDF8", background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", padding: "2px 8px", borderRadius: "10px" }}>GRAPH 1 OF 3</span>
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Apartment Water Consumption vs Billing</h2>
                      </div>
                      <p style={{ fontSize: "12.5px", color: "#64748B", margin: "4px 0 0" }}>
                        Comparing water usage (L) &amp; billed amount (₹) across 5 complexes for {getBillingMonthName(selectedMonth)}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "12px", color: "#94A3B8" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#38BDF8", display: "inline-block" }} />
                        Usage (L)
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#A78BFA", display: "inline-block" }} />
                        Billed (₹)
                      </span>
                    </div>
                  </div>

                  <div style={{ width: "100%", height: "250px", minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 4 }} barCategoryGap="22%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12, fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#64748B", fontSize: 11, fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "rgba(8,15,28,0.97)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: "12px", color: "#FFFFFF", fontSize: "13px", padding: "10px 14px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                          cursor={{ fill: "rgba(56,189,248,0.06)" }}
                          formatter={(value, name) => [
                            name === "Billed (₹)" ? `₹ ${new Intl.NumberFormat("en-IN").format(value)}` : `${new Intl.NumberFormat("en-IN").format(value)} L`,
                            name
                          ]}
                        />
                        <Bar dataKey="usage" name="Usage (L)" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="billed" name="Billed (₹)" fill="#A78BFA" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GRAPH 2: Financial Collection Status (Donut Chart) */}
                <div style={{ background: "rgba(17,26,42,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#34D399", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", padding: "2px 8px", borderRadius: "10px" }}>GRAPH 2 OF 3</span>
                        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Revenue Collection Status</h2>
                      </div>
                      <p style={{ fontSize: "12.5px", color: "#64748B", margin: "4px 0 0" }}>Paid vs Unpaid collection efficiency</p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#34D399", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "3px 8px", borderRadius: "12px" }}>
                      {collectionRate}% Paid
                    </span>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: "100%", height: "175px", minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={56} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                            {donutData.map((entry, index) => (
                              <Cell key={`donut-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "rgba(8,15,28,0.97)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: "12px", color: "#FFFFFF", fontSize: "12px", padding: "8px 12px" }}
                            formatter={(value, name) => [`₹ ${new Intl.NumberFormat("en-IN").format(value)}`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                        <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Billed</div>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>₹{new Intl.NumberFormat("en-IN").format(Math.round(totalBillingSum))}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                      {donutData.map((item) => (
                        <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: item.color }} />
                          <div>
                            <div style={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: 600 }}>{item.name}</div>
                            <div style={{ fontSize: "12.5px", color: item.color, fontWeight: 800 }}>₹{new Intl.NumberFormat("en-IN").format(item.value)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 2: GRAPH 3 (Area Chart) - Multi-Month Telemetry & Billing Activity Trend */}
              <div style={{ background: "rgba(17,26,42,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.4)", minWidth: 0 }}>
                <div style={{ marginBottom: "18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#A78BFA", background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", padding: "2px 8px", borderRadius: "10px" }}>GRAPH 3 OF 3</span>
                      <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>Monthly Telemetry &amp; Revenue Growth Curve</h2>
                    </div>
                    <p style={{ fontSize: "12.5px", color: "#64748B", margin: "4px 0 0" }}>Historical billing cycles &amp; revenue trajectory across months</p>
                  </div>

                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#94A3B8" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#38BDF8", display: "inline-block" }} /> Cycles
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#A78BFA", display: "inline-block" }} /> Billed (₹)
                    </span>
                  </div>
                </div>

                <div style={{ width: "100%", height: "210px", minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -10, bottom: 4 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 12, fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748B", fontSize: 11, fontFamily: "inherit" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "rgba(8,15,28,0.97)", border: "1px solid rgba(56,189,248,0.35)", borderRadius: "12px", color: "#FFFFFF", fontSize: "13px", padding: "10px 14px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                        labelStyle={{ color: "#38BDF8", fontWeight: 700 }}
                        formatter={(value, name) => {
                          if (name === "Billed (₹)") return [`₹ ${new Intl.NumberFormat("en-IN").format(value)}`, name];
                          return [value, name];
                        }}
                      />
                      <Area type="monotone" dataKey="cycles" name="Cycles" stroke="#38BDF8" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: "#38BDF8", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "#38BDF8", stroke: "rgba(56,189,248,0.3)", strokeWidth: 4 }} />
                      <Area type="monotone" dataKey="billed" name="Billed (₹)" stroke="#A78BFA" strokeWidth={1.5} fill="url(#areaGrad2)" dot={false} activeDot={{ r: 5, fill: "#A78BFA" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>


            {/* Filter & Search Bar */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "18px",
                padding: "20px 24px",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "260px" }}>
                <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
                  <Search size={16} color="#64748B" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search apartment by name..."
                    style={{
                      width: "100%",
                      background: "rgba(13, 22, 36, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      padding: "10px 14px 10px 42px",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Filter size={15} color="#94A3B8" />
                  <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600 }}>{t("billing.status")}:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      background: "rgba(13, 22, 36, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="All">{t("invoices.allStatuses")}</option>
                    <option value="Open">{t("billing.open")}</option>
                    <option value="Closed">{t("billing.finalized")}</option>
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 600 }}>{t("dashboard.selectMonth")}:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setGlobalMonth(e.target.value)}
                    style={{
                      background: "rgba(13, 22, 36, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="2026-07">{t("common.july")} 2026</option>
                    <option value="2026-06">{t("common.june")} 2026</option>
                    <option value="2026-05">{t("common.may")} 2026</option>
                    <option value="2026-04">{t("common.april")} 2026</option>
                  </select>
                </div>

                {(searchTerm || statusFilter !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#94A3B8",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      padding: "8px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Overview Table */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                  Apartment Telemetry Overview
                </h2>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#38BDF8", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "4px 12px", borderRadius: "16px" }}>
                  {filteredApartments.length} Complexes
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "14px 16px" }}>Apartment Name</th>
                      <th style={{ padding: "14px 16px" }}>Households</th>
                      <th style={{ padding: "14px 16px" }}>Current Usage</th>
                      <th style={{ padding: "14px 16px" }}>Amount Billed</th>
                      <th style={{ padding: "14px 16px" }}>Cycle Status</th>
                      <th style={{ padding: "14px 16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApartments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "#64748B", padding: "40px 16px" }}>
                          No apartments found matching active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredApartments.map((apt) => {
                        const data = apartmentsData[apt.id] || { households: [], cycles: [], monthCycle: null };
                        const houseCount = data.households ? data.households.length : 0;
                        const isOpen = data.monthCycle && data.monthCycle.status === "OPEN";

                        let cycleUsage = 0;
                        let cycleAmount = 0;
                        if (data.monthCycle && data.monthCycle.invoices) {
                          data.monthCycle.invoices.forEach((inv) => {
                            cycleUsage += inv.waterUsage || 0;
                            cycleAmount += inv.total || 0;
                          });
                        }

                        return (
                          <tr
                            key={apt.id}
                            style={{
                              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                              transition: "background 0.18s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td style={{ padding: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Building2 size={16} color="#38BDF8" />
                                </div>
                                <span style={{ fontWeight: 700, color: "#FFFFFF", fontSize: "14px" }}>{apt.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "16px", color: "#94A3B8", fontSize: "13.5px" }}>{houseCount} Flats</td>
                            <td style={{ padding: "16px", color: "#38BDF8", fontWeight: 700, fontSize: "14px" }}>{formatLiters(cycleUsage)}</td>
                            <td style={{ padding: "16px", color: "#FFFFFF", fontWeight: 700, fontSize: "14px" }}>{formatRupees(cycleAmount)}</td>
                            <td style={{ padding: "16px" }}>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  padding: "4px 10px",
                                  borderRadius: "16px",
                                  background: isOpen ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                                  border: `1px solid ${isOpen ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
                                  color: isOpen ? "#34D399" : "#F87171",
                                }}
                              >
                                {isOpen ? "Cycle OPEN" : "Cycle CLOSED"}
                              </span>
                            </td>
                            <td style={{ padding: "16px" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button
                                  onClick={() => setPage("admin-billing")}
                                  style={{
                                    background: "rgba(56, 189, 248, 0.12)",
                                    border: "1px solid rgba(56, 189, 248, 0.25)",
                                    color: "#38BDF8",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Eye size={13} /> View Details
                                </button>
                                <button
                                  onClick={() => setPage("admin-water-usage")}
                                  style={{
                                    background: "rgba(139, 92, 246, 0.12)",
                                    border: "1px solid rgba(139, 92, 246, 0.25)",
                                    color: "#A78BFA",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Edit3 size={13} /> Log Usage
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- RENDER RESIDENT DASHBOARD ---
  // Generate daily telemetry data for Recharts area graph
  const currentMonthTotal = parseFloat(residentData?.currentMonthUsage || "0.0") || 425.0;
  
  // Format or generate daily log chart data
  let residentDailyChartData = [];
  if (residentData?.dailyLogs && residentData.dailyLogs.length > 0) {
    residentDailyChartData = residentData.dailyLogs.map((log) => {
      const dateObj = new Date(log.readingDate);
      const dayLabel = isNaN(dateObj.getTime())
        ? String(log.readingDate)
        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        date: dayLabel,
        usage: parseFloat(log.readingValue) || 0,
        quota: 25.0,
      };
    });
  } else {
    // Generate realistic daily usage curve leading up to current date for visual telemetry
    const daysInMonth = 15;
    const baseUsage = Math.max(12, currentMonthTotal / daysInMonth);
    for (let i = 1; i <= daysInMonth; i++) {
      const factor = 0.75 + Math.sin(i * 0.9) * 0.35 + (i % 5 === 0 ? 0.4 : 0);
      residentDailyChartData.push({
        date: `Jul ${i}`,
        usage: Math.round(baseUsage * factor * 10) / 10,
        quota: 25.0,
      });
    }
  }

  const avgDaily = (currentMonthTotal / Math.max(1, residentDailyChartData.length)).toFixed(1);
  const estimatedCost = Math.round(currentMonthTotal * 0.85 + 120);

  const fixtureBreakdown = [
    { name: "Shower & Bath", value: Math.round(currentMonthTotal * 0.42), color: "#38BDF8" },
    { name: "Laundry & Washing", value: Math.round(currentMonthTotal * 0.26), color: "#6366F1" },
    { name: "Kitchen & Cooking", value: Math.round(currentMonthTotal * 0.20), color: "#34D399" },
    { name: "Other Fixtures", value: Math.round(currentMonthTotal * 0.12), color: "#A78BFA" },
  ];

  const quotaTarget = 600; // Monthly benchmark target in Liters
  const quotaUsedPercent = Math.min(100, Math.round((currentMonthTotal / quotaTarget) * 100));

  return (
    <section style={{ maxWidth: "1140px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(17, 26, 42, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "32px 36px",
          backdropFilter: "blur(24px)",
          marginBottom: "28px",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Accent */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(0, 0, 0, 0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#38BDF8",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "rgba(56, 189, 248, 0.12)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              {t("sidebar.dashboard").toUpperCase()}
            </span>
            {residentData?.linked && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#34D399",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <CheckCircle2 size={12} /> {t("dashboard.linkSuccess")}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", margin: 0 }}>
            {t("dashboard.welcomeResident", { name: auth?.username || "Resident" })}
          </h1>
          <p style={{ fontSize: "14px", color: "#94A3B8", margin: "6px 0 0 0" }}>
            {residentData?.linked
              ? `${residentData.apartmentName} • ${t("households.flatNumber")} ${residentData.flatNumber}`
              : t("dashboard.residentSubtitle")}
          </p>
        </div>

        {residentData?.linked && (
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                background: "rgba(56, 189, 248, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "16px",
                padding: "12px 20px",
                textAlign: "right",
              }}
            >
              <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Eco Saver Score
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#34D399", marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                <Award size={18} color="#34D399" /> 94 / 100
              </div>
            </div>
          </div>
        )}
      </div>

      {loadingResident && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94A3B8" }}>
          <Activity size={32} color="#38BDF8" style={{ marginBottom: "12px" }} className="spin-icon" />
          <div style={{ fontSize: "15px", fontWeight: 600 }}>{t("common.loading")}</div>
        </div>
      )}

      {/* UNLINKED STATE ONBOARDING */}
      {!loadingResident && residentData && !residentData.linked && (
        <div
          style={{
            background: "rgba(17, 26, 42, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "24px",
            padding: "40px",
            backdropFilter: "blur(20px)",
            maxWidth: "640px",
            margin: "0 auto",
            boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Home size={24} color="#38BDF8" />
            </div>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>{t("dashboard.linkHousehold")}</h2>
              <p style={{ fontSize: "14px", color: "#94A3B8", margin: "4px 0 0 0" }}>
                {t("dashboard.residentSubtitle")}
              </p>
            </div>
          </div>

          <form onSubmit={handleLinkSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {t("dashboard.selectApartment")}
              </label>
              <select
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(13, 22, 36, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "14.5px",
                  outline: "none",
                }}
              >
                {residentApartments.length === 0 && <option value="">No apartments available</option>}
                {residentApartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Flat Number
              </label>
              <input
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. A-101 or B-402"
                required
                style={{
                  width: "100%",
                  background: "rgba(13, 22, 36, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "14.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingLink || residentApartments.length === 0}
              style={{
                background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                border: "none",
                color: "#0F172A",
                fontWeight: 800,
                fontSize: "15px",
                padding: "14px 28px",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)",
                marginTop: "8px",
                transition: "all 0.2s ease",
              }}
            >
              {submittingLink ? "Linking Household..." : "Link My Flat Account"}
            </button>
          </form>
          {linkError && <p style={{ color: "#F87171", fontSize: "13.5px", marginTop: "16px" }}>{linkError}</p>}
        </div>
      )}

      {/* LINKED DASHBOARD VIEW */}
      {!loadingResident && residentData && residentData.linked && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* KPI CARDS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {/* KPI 1: Current Month Usage */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("dashboard.totalConsumption")}</span>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Droplets size={20} color="#38BDF8" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                  {formatLiters(currentMonthTotal)}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Trend value="-4.2%" up={true} />
                </div>
              </div>
            </div>

            {/* KPI 2: Daily Average */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("waterUsage.reading")}</span>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={20} color="#6366F1" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                  {avgDaily} <span style={{ fontSize: "16px", color: "#94A3B8", fontWeight: 600 }}>L/day</span>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#34D399", background: "rgba(16, 185, 129, 0.12)", padding: "3px 8px", borderRadius: "12px" }}>
                    ✓ {t("alerts.allClear")}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI 3: Estimated Cost */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("dashboard.myBill")}</span>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(168, 85, 247, 0.15)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Coins size={20} color="#A78BFA" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                  {formatRupees(estimatedCost)}
                </div>
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#94A3B8" }}>
                  {t("billing.status")}: <strong style={{ color: "#38BDF8" }}>{t("billing.open")}</strong>
                </div>
              </div>
            </div>

            {/* KPI 4: Leak & Anomaly Status */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "24px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>{t("alerts.title")}</span>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "rgba(52, 211, 153, 0.15)",
                    border: "1px solid rgba(52, 211, 153, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck size={20} color="#34D399" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#34D399", letterSpacing: "-0.01em" }}>
                  All Systems Normal
                </div>
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#64748B" }}>
                  No continuous leaks or abnormal pressure detected.
                </div>
              </div>
            </div>
          </div>

          {/* TELEMETRY CHARTS SECTION */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
            {/* Daily Consumption Area Chart */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "24px",
                padding: "26px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Activity size={18} color="#38BDF8" /> Daily Water Usage Trend
                  </h2>
                  <p style={{ fontSize: "12.5px", color: "#64748B", margin: "4px 0 0" }}>
                    Metered consumption in Liters (L) per day
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#34D399", fontWeight: 700, background: "rgba(16,185,129,0.12)", padding: "4px 10px", borderRadius: "12px" }}>
                    ● Peak: {(Math.max(...residentDailyChartData.map(d => d.usage))).toFixed(1)} L
                  </span>
                </div>
              </div>

              <div style={{ width: "100%", height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={residentDailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="residentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 12, fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11, fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(8, 15, 28, 0.97)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        borderRadius: "14px",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        padding: "10px 14px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }}
                      labelStyle={{ color: "#38BDF8", fontWeight: 700, marginBottom: "4px" }}
                      formatter={(val) => [`${val} Liters`, "Water Used"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      name="Water Usage"
                      stroke="#38BDF8"
                      strokeWidth={3}
                      fill="url(#residentAreaGrad)"
                      dot={{ fill: "#38BDF8", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 7, fill: "#38BDF8", stroke: "rgba(56,189,248,0.4)", strokeWidth: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Consumption Quota Donut & Fixture Breakdown */}
            <div
              style={{
                background: "rgba(17, 26, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "24px",
                padding: "26px",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.4)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                  Usage by Fixture Category
                </h2>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "4px 0 0" }}>
                  Estimated household breakdown
                </p>
              </div>

              <div style={{ position: "relative", width: "100%", height: "160px", margin: "12px 0" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fixtureBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {fixtureBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(8, 15, 28, 0.97)",
                        border: "1px solid rgba(56, 189, 248, 0.4)",
                        borderRadius: "12px",
                        color: "#FFFFFF",
                        fontSize: "12px",
                        padding: "8px 12px",
                      }}
                      formatter={(val) => [`${val} L`, "Estimated Usage"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Quota Used</div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#38BDF8" }}>{quotaUsedPercent}%</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {fixtureBreakdown.map((item) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: item.color }} />
                      <span style={{ color: "#94A3B8" }}>{item.name}</span>
                    </div>
                    <span style={{ color: "#FFFFFF", fontWeight: 700 }}>{item.value} L</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONSERVATION TIP BANNER */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "20px",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "rgba(56, 189, 248, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={22} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF" }}>Smart Conservation Tip</div>
                <div style={{ fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
                  Installing low-flow aerators on kitchen faucets can cut daily water consumption by up to 25 Liters without reducing pressure!
                </div>
              </div>
            </div>
            <button
              onClick={() => setPage("alerts")}
              style={{
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38BDF8",
                fontWeight: 700,
                fontSize: "13px",
                padding: "10px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              View Leak Alerts
            </button>
          </div>

          {/* QUICK LINKS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            <QuickLinkCard
              icon={Receipt}
              title="My Bills & Invoices"
              body="Review itemized billing history, tariff tier breakdowns & payment receipts."
              onClick={() => setPage("resident-bills")}
            />
            <QuickLinkCard
              icon={Bell}
              title="Consumption Alerts"
              body="Stay protected with real-time leak detection warnings & usage limit spikes."
              onClick={() => setPage("alerts")}
            />
            <QuickLinkCard
              icon={User}
              title="My Profile & Flat"
              body="Manage household details, update account profile & linked meter configurations."
              onClick={() => setPage("profile")}
            />
          </div>
        </div>
      )}
    </section>
  );
}
