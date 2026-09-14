import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./styles/theme.css";

import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import BackgroundGlow from "./components/BackgroundGlow.jsx";
import LanguageSwitcher from "./components/LanguageSwitcher.jsx";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AdminApartmentsPage from "./pages/AdminApartmentsPage.jsx";
import AdminHouseholdsPage from "./pages/AdminHouseholdsPage.jsx";
import AdminWaterUsagePage from "./pages/AdminWaterUsagePage.jsx";
import AdminBillingPage from "./pages/AdminBillingPage.jsx";
import AdminInvoicesPage from "./pages/AdminInvoicesPage.jsx";
import AdminTariffPlansPage from "./pages/AdminTariffPlansPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import ResidentBillsPage from "./pages/ResidentBillsPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Import Lucide icons for the premium admin layout
import {
  LayoutDashboard,
  Building2,
  Home as HomeIcon,
  Receipt,
  Droplets,
  Coins,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
  User,
  Users as UsersIcon,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const { t } = useTranslation();
  const [page, setPage] = useState("home");
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem("at-auth");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }); // { token, username, role } | null
  const [dashboardMonth, setDashboardMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }); // Sync month globally — defaults to current month
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("at-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light-theme", "admin-light");
      document.documentElement.classList.remove("dark-theme");
      document.body.classList.add("light-theme", "admin-light");
      document.body.classList.remove("dark-theme");
    } else {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme", "admin-light");
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme", "admin-light");
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("at-theme", nextTheme);
  };

  function handleAuthed(data) {
    setAuth(data);
    try {
      if (data) {
        localStorage.setItem("at-auth", JSON.stringify(data));
      } else {
        localStorage.removeItem("at-auth");
      }
    } catch (e) {}
  }

  function handlePageChange(next) {
    setSidebarOpen(false);
    if (next === "logout") {
      setAuth(null);
      try { localStorage.removeItem("at-auth"); } catch (e) {}
      setPage("login");
      return;
    }
    setPage(next);
  }

  // Once logged in, keep login/register from showing again — bounce to dashboard.
  let activePage = auth && (page === "login" || page === "register") ? "dashboard" : page;

  // Guard: admin-only pages require an authenticated ADMIN. Anyone else
  // (not logged in, or a RESIDENT) gets bounced back to the dashboard/home.
  const isAdminPage = activePage === "admin-apartments" || activePage === "admin-households" || activePage === "admin-water-usage" || activePage === "admin-billing" || activePage === "admin-invoices" || activePage === "admin-tariffs" || activePage === "admin-users";
  if (isAdminPage && (!auth || auth.role !== "ADMIN")) {
    activePage = auth ? "dashboard" : "home";
  }

  // Guard: pages that require login
  const isUserPage = activePage === "profile" || activePage === "resident-bills";
  if (isUserPage && !auth) {
    activePage = "home";
  }

  // Guard: alerts page is only for RESIDENT
  if (activePage === "alerts" && (!auth || auth.role !== "RESIDENT")) {
    activePage = auth ? "dashboard" : "home";
  }

  const isAdmin = auth && auth.role === "ADMIN";

  // Helper to render readable title in admin header
  function getAdminHeaderTitle() {
    switch (activePage) {
      case "dashboard":
        return { title: t("adminHeader.dashboard"), subtitle: t("adminHeader.dashboardSub") };
      case "admin-apartments":
        return { title: t("adminHeader.apartments"), subtitle: t("adminHeader.apartmentsSub") };
      case "admin-households":
        return { title: t("adminHeader.households"), subtitle: t("adminHeader.householdsSub") };
      case "admin-water-usage":
        return { title: t("adminHeader.waterUsage"), subtitle: t("adminHeader.waterUsageSub") };
      case "admin-billing":
        return { title: t("adminHeader.billing"), subtitle: t("adminHeader.billingSub") };
      case "admin-invoices":
        return { title: t("adminHeader.invoices"), subtitle: t("adminHeader.invoicesSub") };
      case "admin-tariffs":
        return { title: t("adminHeader.tariffs"), subtitle: t("adminHeader.tariffsSub") };
      case "admin-users":
        return { title: "User Management", subtitle: "Inspect and edit all user accounts and credentials" };
      case "profile":
        return { title: t("adminHeader.profile"), subtitle: t("adminHeader.profileSub") };
      default:
        return { title: t("adminHeader.default"), subtitle: t("adminHeader.defaultSub") };
    }
  }

  const headerMeta = getAdminHeaderTitle();

  if (isAdmin) {
    return (
      <div className={`at-root admin-portal-theme ${theme === "light" ? "admin-light" : ""}`}>
        <BackgroundGlow />
        {/* Left Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <button
            onClick={() => handlePageChange("dashboard")}
            className="admin-sidebar-logo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "4px 8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(56, 189, 248, 0.45)",
                flexShrink: 0,
              }}
            >
              <Droplets size={22} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  background: "var(--admin-logo-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                }}
              >
                AquaTrack
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#38BDF8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {t("sidebar.adminConsole")}
              </span>
            </div>
          </button>

          <nav className="admin-sidebar-menu">
            <button
              onClick={() => handlePageChange("dashboard")}
              className={`admin-sidebar-item ${activePage === "dashboard" ? "active" : ""}`}
            >
              <LayoutDashboard size={18} />
              {t("sidebar.dashboard")}
            </button>

            <button
              onClick={() => handlePageChange("admin-apartments")}
              className={`admin-sidebar-item ${activePage === "admin-apartments" ? "active" : ""}`}
            >
              <Building2 size={18} />
              {t("sidebar.apartments")}
            </button>

            <button
              onClick={() => handlePageChange("admin-households")}
              className={`admin-sidebar-item ${activePage === "admin-households" ? "active" : ""}`}
            >
              <HomeIcon size={18} />
              {t("sidebar.households")}
            </button>

            <button
              onClick={() => handlePageChange("admin-billing")}
              className={`admin-sidebar-item ${activePage === "admin-billing" ? "active" : ""}`}
            >
              <Receipt size={18} />
              {t("sidebar.billing")}
            </button>

            <button
              onClick={() => handlePageChange("admin-water-usage")}
              className={`admin-sidebar-item ${activePage === "admin-water-usage" ? "active" : ""}`}
            >
              <Droplets size={18} />
              {t("sidebar.waterUsage")}
            </button>

            {/* Invoices */}
            <button
              onClick={() => handlePageChange("admin-invoices")}
              className={`admin-sidebar-item ${activePage === "admin-invoices" ? "active" : ""}`}
            >
              <Coins size={18} />
              {t("sidebar.invoices")}
            </button>

            {/* Tariff Plans */}
            <button
              onClick={() => handlePageChange("admin-tariffs")}
              className={`admin-sidebar-item ${activePage === "admin-tariffs" ? "active" : ""}`}
            >
              <FileText size={18} />
              {t("sidebar.tariffs")}
            </button>

            {/* Users */}
            <button
              onClick={() => handlePageChange("admin-users")}
              className={`admin-sidebar-item ${activePage === "admin-users" ? "active" : ""}`}
            >
              <UsersIcon size={18} />
              Users
            </button>

            <button
              onClick={() => handlePageChange("profile")}
              className={`admin-sidebar-item ${activePage === "profile" ? "active" : ""}`}
            >
              <Settings size={18} />
              {t("sidebar.settings")}
            </button>
          </nav>

          {/* Profile Section */}
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">
              {auth.username ? auth.username.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-sidebar-info">
              <span className="admin-sidebar-info-name">{auth.username || "Admin"}</span>
              <span className="admin-sidebar-info-role">{t("sidebar.administrator")}</span>
            </div>
          </div>

          <button onClick={() => handlePageChange("logout")} className="admin-sidebar-logout">
            <LogOut size={16} />
            {t("sidebar.logout")}
          </button>
        </aside>

        {/* Right Main Content area */}
        <div className="admin-main">
          {/* Header */}
          <header className="admin-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="admin-header-title-container">
                <span className="admin-header-title">{headerMeta.title}</span>
                <span className="admin-header-subtitle">{headerMeta.subtitle}</span>
              </div>
            </div>

            <div className="admin-header-right">
              {/* Language Switcher */}
              <LanguageSwitcher compact />

              {/* Theme Toggle option */}
              <button
                onClick={toggleTheme}
                className="admin-notification-btn"
                style={{ color: "var(--admin-text-white)", padding: "6px", display: "flex", alignItems: "center" }}
                title={theme === "dark" ? t("adminHeader.switchLight") : t("adminHeader.switchDark")}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Month Selector — dynamically generates last 12 months so any billing cycle month is selectable */}
              <select
                className="admin-select-month"
                value={dashboardMonth}
                onChange={(e) => setDashboardMonth(e.target.value)}
              >
                {(() => {
                  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                  const options = [];
                  const now = new Date();
                  for (let i = 0; i < 12; i++) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                    const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
                    options.push(<option key={val} value={val}>{label}</option>);
                  }
                  return options;
                })()}
              </select>
            </div>
          </header>

          {/* Page Container */}
          <main className="admin-content page-fade-in" key={activePage}>
            {activePage === "dashboard" && (
              <DashboardPage
                auth={auth}
                setPage={handlePageChange}
                globalMonth={dashboardMonth}
                setGlobalMonth={setDashboardMonth}
              />
            )}
            {activePage === "admin-apartments" && <AdminApartmentsPage auth={auth} setPage={handlePageChange} />}
            {activePage === "admin-households" && <AdminHouseholdsPage auth={auth} setPage={handlePageChange} />}
            {activePage === "admin-water-usage" && <AdminWaterUsagePage auth={auth} setPage={handlePageChange} />}
            {activePage === "admin-billing" && <AdminBillingPage auth={auth} setPage={handlePageChange} />}
            {activePage === "admin-invoices" && <AdminInvoicesPage auth={auth} setPage={handlePageChange} />}
            {activePage === "admin-tariffs" && <AdminTariffPlansPage auth={auth} setPage={handlePageChange} />}
            {activePage === "admin-users" && <AdminUsersPage auth={auth} onAuthed={handleAuthed} setPage={handlePageChange} />}
            {activePage === "profile" && <ProfilePage auth={auth} onAuthed={handleAuthed} setPage={handlePageChange} />}
          </main>
        </div>
      </div>
    );
  }

  // Resident / Anonymous layout
  return (
    <div className={`at-root ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
      <BackgroundGlow />
      <NavBar page={activePage} setPage={handlePageChange} auth={auth} theme={theme} toggleTheme={toggleTheme} />

      <main style={{ flex: 1 }} className="page-fade-in" key={activePage}>
        {activePage === "home" && <HomePage setPage={handlePageChange} />}
        {activePage === "login" && <LoginPage setPage={handlePageChange} onAuthed={handleAuthed} />}
        {activePage === "register" && <RegisterPage setPage={handlePageChange} onAuthed={handleAuthed} />}
        {activePage === "about" && <AboutPage />}
        {activePage === "contact" && <ContactPage />}
        {activePage === "dashboard" && <DashboardPage auth={auth} setPage={handlePageChange} />}
        {activePage === "resident-bills" && <ResidentBillsPage auth={auth} setPage={handlePageChange} />}
        {activePage === "alerts" && <AlertsPage auth={auth} setPage={handlePageChange} />}
        {activePage === "profile" && <ProfilePage auth={auth} onAuthed={handleAuthed} setPage={handlePageChange} />}
      </main>

      <Footer />
    </div>
  );
}

