import React, { useEffect, useState } from "react";
import {
  Gauge,
  Building2,
  Home,
  ArrowRight,
  Droplet,
  CheckCircle,
  Receipt,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  PlusCircle,
  Edit3,
  Lock,
  Users,
  Coins
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

function Trend({ value, up = true }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const color = up ? "#10B981" : "#EF4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", color, fontSize: "12px", fontWeight: 600 }}>
      <Icon size={14} />
      <span>{value}</span>
    </div>
  );
}

function formatLiters(value) {
  return new Intl.NumberFormat('en-IN').format(Math.round(value)) + " L";
}

function formatRupees(value) {
  return "₹ " + new Intl.NumberFormat('en-IN').format(Math.round(value));
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
  const [apartmentsData, setApartmentsData] = useState({}); // { [aptId]: { households: [], cycles: [], monthCycle: null } }
  const [loadingAdmin, setLoadingAdmin] = useState(isAdmin);
  const [adminError, setAdminError] = useState("");
  
  // Admin Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const selectedMonth = globalMonth || "2026-07";

  // Mock data for display when database is empty
  const mockApts = [
    { id: "mock-1", name: "Green Meadows", mockHouseholds: 48, mockUsage: 125600, mockAmount: 125600, mockStatus: "Open" },
    { id: "mock-2", name: "Sunrise Residency", mockHouseholds: 36, mockUsage: 98400, mockAmount: 98400, mockStatus: "Open" },
    { id: "mock-3", name: "Lake View Heights", mockHouseholds: 52, mockUsage: 156800, mockAmount: 156800, mockStatus: "Closed" },
    { id: "mock-4", name: "Silver Springs", mockHouseholds: 40, mockUsage: 102300, mockAmount: 102300, mockStatus: "Open" },
    { id: "mock-5", name: "Ocean Breeze", mockHouseholds: 60, mockUsage: 189600, mockAmount: 189600, mockStatus: "Closed" },
  ];

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
      // 1. Fetch all apartments
      const aptsList = await listApartments(auth.token);
      setApartments(aptsList);

      const tempAptData = {};

      // 2. Fetch households and billing cycles for each apartment in parallel
      await Promise.all(aptsList.map(async (apt) => {
        try {
          const hList = await listHouseholdsByApartment(auth.token, apt.id);
          const cList = await listBillingCycles(auth.token, apt.id);
          
          // Find if there is a cycle for the selected billing month
          const monthCycle = cList.find(c => c.startDate && c.startDate.startsWith(selectedMonth));
          let monthCycleDetails = null;

          if (monthCycle) {
            // Fetch detailed cycle to get invoices
            monthCycleDetails = await getBillingCycleDetails(auth.token, monthCycle.id).catch(() => null);
          }

          tempAptData[apt.id] = {
            households: hList,
            cycles: cList,
            monthCycle: monthCycleDetails || monthCycle || null
          };
        } catch (err) {
          console.error(`Error loading data for apartment ${apt.id}:`, err);
          tempAptData[apt.id] = { households: [], cycles: [], monthCycle: null };
        }
      }));

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
        cycle.invoices.forEach(inv => {
          totalUsage += inv.waterUsage || 0;
          totalAmount += inv.total || 0;
          if (inv.status === "UNPAID") {
            unpaidInvoices += 1;
            unpaidAmount += inv.total || 0;
          }
        });
      }
    });

    // High fidelity values fallback to 0 if empty database
    return {
      totalApts: totalApts || 0,
      totalHouseholds: totalHouseholds || 0,
      totalUsage: totalUsage || 0,
      totalAmount: totalAmount || 0,
      unpaidInvoices: unpaidInvoices || 0,
      unpaidAmount: unpaidAmount || 0,
      isRealData: totalApts > 0
    };
  }

  const stats = getAggregatedStats();

  // Filter apartments
  const filteredApartments = apartments.filter(apt => {
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

  const displayApartments = filteredApartments;

  // --- RENDER ADMIN PORTAL ---
  if (isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "28px" }}>
        
        {loadingAdmin && Object.keys(apartmentsData).length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
            Loading dashboard data and calculating statistics...
          </div>
        ) : adminError ? (
          <div className="at-card" style={{ padding: "20px", color: "#EF4444" }}>
            Error: {adminError}
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="admin-kpi-grid">
              {/* Card 1 */}
              <div className="at-card admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Total Apartments</span>
                  <div className="admin-kpi-icon-container" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
                    <Building2 size={18} color="#3B82F6" />
                  </div>
                </div>
                <span className="admin-kpi-value">{stats.totalApts}</span>
                <span className="admin-kpi-trend">
                  <Trend value="12% from last month" up={true} />
                </span>
              </div>

              {/* Card 2 */}
              <div className="at-card admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Total Households</span>
                  <div className="admin-kpi-icon-container" style={{ background: "rgba(16, 185, 129, 0.15)" }}>
                    <Users size={18} color="#10B981" />
                  </div>
                </div>
                <span className="admin-kpi-value">{stats.totalHouseholds}</span>
                <span className="admin-kpi-trend">
                  <Trend value="8% from last month" up={true} />
                </span>
              </div>

              {/* Card 3 */}
              <div className="at-card admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Current Month Usage</span>
                  <div className="admin-kpi-icon-container" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
                    <Droplet size={18} color="#8B5CF6" />
                  </div>
                </div>
                <span className="admin-kpi-value">{formatLiters(stats.totalUsage)}</span>
                <span className="admin-kpi-trend">
                  <Trend value="14.5% from last month" up={true} />
                </span>
              </div>

              {/* Card 4 */}
              <div className="at-card admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Current Month Amount</span>
                  <div className="admin-kpi-icon-container" style={{ background: "rgba(245, 158, 11, 0.15)" }}>
                    <Coins size={18} color="#F59E0B" />
                  </div>
                </div>
                <span className="admin-kpi-value">{formatRupees(stats.totalAmount)}</span>
                <span className="admin-kpi-trend">
                  <Trend value="16.3% from last month" up={true} />
                </span>
              </div>

              {/* Card 5 */}
              <div className="at-card admin-kpi-card">
                <div className="admin-kpi-header">
                  <span className="admin-kpi-title">Unpaid Invoices</span>
                  <div className="admin-kpi-icon-container" style={{ background: "rgba(239, 68, 68, 0.15)" }}>
                    <Receipt size={18} color="#EF4444" />
                  </div>
                </div>
                <span className="admin-kpi-value">{stats.unpaidInvoices}</span>
                <span style={{ fontSize: "12px", color: "#EF4444", fontWeight: 600, marginTop: "2px" }}>
                  {formatRupees(stats.unpaidAmount)} pending
                </span>
              </div>
            </div>

            {/* Filters Row */}
            <div className="at-card admin-filter-bar">
              <div className="admin-filter-field" style={{ position: "relative" }}>
                <span className="admin-filter-label">Search Apartment</span>
                <div style={{ position: "relative" }}>
                  <Search size={16} color="#64748B" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    placeholder="Search apartment..."
                    className="at-input"
                    style={{ paddingLeft: "36px" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-filter-field">
                <span className="admin-filter-label">Cycle Status</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="admin-filter-field">
                <span className="admin-filter-label">Month</span>
                <select value={selectedMonth} onChange={(e) => setGlobalMonth(e.target.value)}>
                  <option value="2026-07">July 2026</option>
                  <option value="2026-06">June 2026</option>
                  <option value="2026-05">May 2026</option>
                  <option value="2026-04">April 2026</option>
                </select>
              </div>

              <button
                className="admin-clear-filter-btn"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>

            {/* Apartment Overview Table Section */}
            <div className="at-card" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--admin-text-white, #FFFFFF)" }}>
                Apartment Overview
              </h2>

              <table className="at-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Apartment Name</th>
                    <th>Households</th>
                    <th>Current Month Usage (L)</th>
                    <th>Current Month Amount (₹)</th>
                    <th>Cycle Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayApartments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#64748B", padding: "24px" }}>
                        No apartments match the active search and filter settings.
                      </td>
                    </tr>
                  ) : (
                    displayApartments.map((apt) => {
                      const isMock = String(apt.id).startsWith("mock-");
                      let houseCount = 0;
                      let finalUsage = 0;
                      let finalAmount = 0;
                      let isOpen = false;

                      if (isMock) {
                        houseCount = apt.mockHouseholds;
                        finalUsage = apt.mockUsage;
                        finalAmount = apt.mockAmount;
                        isOpen = apt.mockStatus === "Open";
                      } else {
                        const data = apartmentsData[apt.id] || { households: [], cycles: [], monthCycle: null };
                        houseCount = data.households ? data.households.length : 0;
                        isOpen = data.monthCycle && data.monthCycle.status === "OPEN";

                        let cycleUsage = 0;
                        let cycleAmount = 0;
                        if (data.monthCycle && data.monthCycle.invoices) {
                          data.monthCycle.invoices.forEach(inv => {
                            cycleUsage += inv.waterUsage || 0;
                            cycleAmount += inv.total || 0;
                          });
                        }
                        finalUsage = cycleUsage;
                        finalAmount = cycleAmount;
                      }

                      const cycleStatusText = isOpen ? "Open" : "Closed";

                      return (
                        <tr key={apt.id}>
                          <td>
                            <strong>{apt.name}</strong>
                          </td>
                          <td>{houseCount}</td>
                          <td>{formatLiters(finalUsage)}</td>
                          <td>{formatRupees(finalAmount)}</td>
                          <td>
                            <span
                              className="admin-table-badge"
                              style={{
                                background: isOpen ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: isOpen ? "#34D399" : "#F87171"
                              }}
                            >
                              {cycleStatusText}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setPage("admin-billing")}
                                className="admin-table-action-btn"
                                style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA" }}
                                title="View Invoices & Details"
                              >
                                <Eye size={13} /> View
                              </button>

                              <button
                                onClick={() => setPage("admin-billing")}
                                className="admin-table-action-btn"
                                style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399" }}
                                title="Open a new billing cycle"
                              >
                                <PlusCircle size={13} /> Open Cycle
                              </button>

                              <button
                                onClick={() => setPage("admin-water-usage")}
                                className="admin-table-action-btn"
                                style={{ background: "rgba(139, 92, 246, 0.15)", color: "#A78BFA" }}
                                title="Enter water usage readings"
                              >
                                <Edit3 size={13} /> Enter Usage
                              </button>

                              <button
                                onClick={() => setPage("admin-billing")}
                                className="admin-table-action-btn"
                                style={{ background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}
                                title="Generate bills and finalize invoices"
                              >
                                <Lock size={13} /> Generate Invoice
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

            {/* Apartment Summary Cards Section */}
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--admin-text-white, #FFFFFF)" }}>
                Apartment Summary
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                {displayApartments.slice(0, 5).map((apt) => {
                  const isMock = String(apt.id).startsWith("mock-");
                  let houseCount = 0;
                  let finalUsage = 0;
                  let finalAmount = 0;
                  let isOpen = false;

                  if (isMock) {
                    houseCount = apt.mockHouseholds;
                    finalUsage = apt.mockUsage;
                    finalAmount = apt.mockAmount;
                    isOpen = apt.mockStatus === "Open";
                  } else {
                    const data = apartmentsData[apt.id] || { households: [], cycles: [], monthCycle: null };
                    houseCount = data.households ? data.households.length : 0;
                    isOpen = data.monthCycle && data.monthCycle.status === "OPEN";

                    let cycleUsage = 0;
                    let cycleAmount = 0;
                    if (data.monthCycle && data.monthCycle.invoices) {
                      data.monthCycle.invoices.forEach(inv => {
                        cycleUsage += inv.waterUsage || 0;
                        cycleAmount += inv.total || 0;
                      });
                    }
                    finalUsage = cycleUsage;
                    finalAmount = cycleAmount;
                  }

                  return (
                    <div key={apt.id} className="at-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={16} color="#3B82F6" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-white, #FFFFFF)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "140px" }} title={apt.name}>{apt.name}</span>
                          <span style={{ fontSize: "12px", color: "var(--admin-text-muted, #64748B)" }}>{houseCount} Households</span>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid var(--admin-border-muted, rgba(255,255,255,0.06))", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-white, #FFFFFF)" }}>{formatLiters(finalUsage)}</span>
                          <span style={{ fontSize: "11px", color: "var(--admin-text-muted, #64748B)", marginLeft: "4px" }}>Usage ({getBillingMonthName(selectedMonth)})</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-text-white, #FFFFFF)" }}>{formatRupees(finalAmount)}</span>
                          <span style={{ fontSize: "11px", color: "var(--admin-text-muted, #64748B)", marginLeft: "4px" }}>Amount ({getBillingMonthName(selectedMonth)})</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                        <span
                          className="admin-table-badge"
                          style={{
                            background: isOpen ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: isOpen ? "#34D399" : "#F87171"
                          }}
                        >
                          {isOpen ? "Open" : "Closed"}
                        </span>
                        
                        <button
                          onClick={() => setPage("admin-billing")}
                          className="at-focus"
                          style={{
                            background: "#2563EB",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    );
  }

  // --- RENDER RESIDENT DASHBOARD ---
  return (
    <section className="at-container" style={{ maxWidth: "900px", paddingTop: "80px", paddingBottom: "80px" }}>
      <p className="at-mono" style={{ color: "var(--at-verdigris-deep)", fontSize: "12px", letterSpacing: "0.1em" }}>
        {auth?.role || "USER"} DASHBOARD
      </p>
      <h1 className="at-display" style={{ fontSize: "30px", fontWeight: 600, color: "var(--at-ink-deep)", marginTop: "6px" }}>
        Welcome, {auth?.username || "there"}.
      </h1>

      {loadingResident && (
        <p style={{ marginTop: "20px", fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>Loading your dashboard...</p>
      )}

      {!loadingResident && residentData && !residentData.linked && (
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
                {residentApartments.length === 0 && <option value="">No apartments available</option>}
                {residentApartments.map((a) => (
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
            <button type="submit" disabled={submittingLink || residentApartments.length === 0} className="at-btn-brass at-focus" style={{ alignSelf: "flex-start", padding: "10px 24px", marginTop: "8px" }}>
              {submittingLink ? "Linking..." : "Link My Account"}
            </button>
          </form>
          {linkError && <p className="at-error" style={{ marginTop: "16px" }}>{linkError}</p>}
        </div>
      )}

      {!loadingResident && residentData && residentData.linked && (
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "20px" }}>
            <QuickLinkCard
              icon={Receipt}
              title="My Invoices"
              body="Review itemized utility statements and rates."
              onClick={() => setPage("resident-bills")}
            />
            <QuickLinkCard
              icon={Bell}
              title="Leak & Limit Alerts"
              body="Check your household's limit crossings and alerts."
              onClick={() => setPage("alerts")}
            />
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
