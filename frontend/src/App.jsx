import React, { useState } from "react";
import "./styles/theme.css";

import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";

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
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const [page, setPage] = useState("home");
  const [auth, setAuth] = useState(null); // { token, username, role } | null
  const [dashboardMonth, setDashboardMonth] = useState("2026-07"); // Sync month globally
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("at-theme") || "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("at-theme", nextTheme);
  };

  function handleAuthed(data) {
    setAuth(data);
  }

  function handlePageChange(next) {
    if (next === "logout") {
      setAuth(null);
      setPage("home");
      return;
    }
    setPage(next);
  }

  // Once logged in, keep login/register from showing again — bounce to dashboard.
  let activePage = auth && (page === "login" || page === "register") ? "dashboard" : page;

  // Guard: admin-only pages require an authenticated ADMIN. Anyone else
  // (not logged in, or a RESIDENT) gets bounced back to the dashboard/home.
  const isAdminPage = activePage === "admin-apartments" || activePage === "admin-households" || activePage === "admin-water-usage" || activePage === "admin-billing";
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
        return { title: "Dashboard", subtitle: "Overview of your water billing system" };
      case "admin-apartments":
        return { title: "Apartments", subtitle: "Onboard new buildings and configure plans" };
      case "admin-households":
        return { title: "Households", subtitle: "Manage flats and occupancy metrics" };
      case "admin-water-usage":
        return { title: "Water Usage", subtitle: "Log manual readings and view history" };
      case "admin-billing":
        return { title: "Billing Cycles", subtitle: "Open cycles, adjust invoices and generate bills" };
      case "profile":
        return { title: "Settings & Profile", subtitle: "Manage administrator credentials" };
      default:
        return { title: "AquaTrack Console", subtitle: "Water Utility Admin Portal" };
    }
  }

  const headerMeta = getAdminHeaderTitle();

  if (isAdmin) {
    return (
      <div className={`at-root admin-portal-theme ${theme === "light" ? "admin-light" : ""}`}>
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
          <button onClick={() => handlePageChange("dashboard")} className="admin-sidebar-logo">
            <Droplets size={24} color="#38BDF8" strokeWidth={2.5} />
            <span className="admin-sidebar-logo-text">AquaTrack</span>
          </button>

          <nav className="admin-sidebar-menu">
            <button
              onClick={() => handlePageChange("dashboard")}
              className={`admin-sidebar-item ${activePage === "dashboard" ? "active" : ""}`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              onClick={() => handlePageChange("admin-apartments")}
              className={`admin-sidebar-item ${activePage === "admin-apartments" ? "active" : ""}`}
            >
              <Building2 size={18} />
              Apartments
            </button>

            <button
              onClick={() => handlePageChange("admin-households")}
              className={`admin-sidebar-item ${activePage === "admin-households" ? "active" : ""}`}
            >
              <HomeIcon size={18} />
              Households
            </button>

            <button
              onClick={() => handlePageChange("admin-billing")}
              className={`admin-sidebar-item ${activePage === "admin-billing" ? "active" : ""}`}
            >
              <Receipt size={18} />
              Billing Cycles
            </button>

            <button
              onClick={() => handlePageChange("admin-water-usage")}
              className={`admin-sidebar-item ${activePage === "admin-water-usage" ? "active" : ""}`}
            >
              <Droplets size={18} />
              Water Usage
            </button>

            {/* Invoices: Maps to billing cycle page as per requirements */}
            <button
              onClick={() => handlePageChange("admin-billing")}
              className="admin-sidebar-item"
            >
              <Coins size={18} />
              Invoices
            </button>

            {/* Tariff Plans: Maps to apartments management page */}
            <button
              onClick={() => handlePageChange("admin-apartments")}
              className="admin-sidebar-item"
            >
              <FileText size={18} />
              Tariff Plans
            </button>

            {/* Reports: View-only toast placeholder or dashboard indicator */}
            <button
              onClick={() => {
                alert("Reports and advanced analytics are coming soon in the next system updates!");
              }}
              className="admin-sidebar-item"
            >
              <BarChart3 size={18} />
              Reports
            </button>

            <button
              onClick={() => handlePageChange("profile")}
              className={`admin-sidebar-item ${activePage === "profile" ? "active" : ""}`}
            >
              <Settings size={18} />
              Settings
            </button>
          </nav>

          {/* Profile Section */}
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">
              {auth.username ? auth.username.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-sidebar-info">
              <span className="admin-sidebar-info-name">{auth.username || "Admin"}</span>
              <span className="admin-sidebar-info-role">Administrator</span>
            </div>
          </div>

          <button onClick={() => handlePageChange("logout")} className="admin-sidebar-logout">
            <LogOut size={16} />
            Log out
          </button>
        </aside>

        {/* Right Main Content area */}
        <div className="admin-main">
          {/* Header */}
          <header className="admin-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button className="admin-notification-btn" style={{ padding: "4px" }}>
                <Menu size={20} />
              </button>
              <div className="admin-header-title-container">
                <span className="admin-header-title">{headerMeta.title}</span>
                <span className="admin-header-subtitle">{headerMeta.subtitle}</span>
              </div>
            </div>

            <div className="admin-header-right">
              {/* Theme Toggle option */}
              <button
                onClick={toggleTheme}
                className="admin-notification-btn"
                style={{ color: "var(--admin-text-white)", padding: "6px", display: "flex", alignItems: "center" }}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Month Selector synchronised globally */}
              <select
                className="admin-select-month"
                value={dashboardMonth}
                onChange={(e) => setDashboardMonth(e.target.value)}
              >
                <option value="2026-07">July 2026</option>
                <option value="2026-06">June 2026</option>
                <option value="2026-05">May 2026</option>
                <option value="2026-04">April 2026</option>
              </select>

              <button className="admin-notification-btn">
                <Bell size={18} />
                <span className="admin-notification-badge">3</span>
              </button>

              <div className="admin-header-avatar">
                {auth.username ? auth.username.charAt(0).toUpperCase() : "A"}
              </div>
            </div>
          </header>

          {/* Page Container */}
          <main className="admin-content">
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
            {activePage === "profile" && <ProfilePage auth={auth} onAuthed={handleAuthed} setPage={handlePageChange} />}
          </main>
        </div>
      </div>
    );
  }

  // Resident / Anonymous layout
  return (
    <div className={`at-root ${theme === "dark" ? "dark-theme" : ""}`}>
      <NavBar page={activePage} setPage={handlePageChange} auth={auth} theme={theme} toggleTheme={toggleTheme} />

      <main style={{ flex: 1 }}>
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

