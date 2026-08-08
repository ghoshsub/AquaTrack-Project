import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Home, LogIn, UserPlus, Info, Mail, Droplets, LogOut, User,
  Bell, Receipt, Sun, Moon, LayoutDashboard, Menu, X
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export default function NavBar({ page, setPage, auth, theme, toggleTheme }) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthed = !!auth;
  const isResident = auth?.role === "RESIDENT";

  const handleNavClick = (targetPage) => {
    setPage(targetPage);
    setMobileMenuOpen(false);
  };

  const isDark = theme === "dark";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        transition: "all 0.3s ease",
      }}
    >
      <nav
        style={{
          width: "100%",
          background: isDark
            ? "rgba(11, 17, 32, 0.82)"
            : "rgba(255, 255, 255, 0.85)",
          borderBottom: isDark
            ? "1px solid rgba(255, 255, 255, 0.12)"
            : "1px solid rgba(15, 23, 42, 0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "14px 120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: isDark
            ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
            : "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
          boxSizing: "border-box",

        }}
        className="navbar-container"
      >
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick(isAuthed ? "dashboard" : "home")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: 0,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(56, 189, 248, 0.4)",
            }}
          >
            <Droplets size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: isDark ? "transparent" : "#0F172A",
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
              {t("nav.tagline")}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Items */}
        <div
          className="nav-desktop-items"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.05)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
              color: isDark ? "#FFFFFF" : "#0F172A",
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginRight: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(56, 189, 248, 0.15)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
            }}
            title={isDark ? t("nav.switchLight") : t("nav.switchDark")}
          >
            {isDark ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#6366F1" />}
          </button>

          {!isAuthed ? (
            <>
              {[
                { key: "home", label: t("nav.home"), icon: Home },
                { key: "about", label: t("nav.about"), icon: Info },
                { key: "contact", label: t("nav.contact"), icon: Mail },
              ].map(({ key, label, icon: Icon }) => {
                const isActive = page === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    style={{
                      background: isActive ? "rgba(56, 189, 248, 0.15)" : "transparent",
                      border: isActive ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid transparent",
                      color: isActive ? "#38BDF8" : isDark ? "#94A3B8" : "#475569",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      transition: "all 0.2s ease",
                      fontFamily: "inherit",
                      boxShadow: isActive ? "0 4px 12px rgba(56, 189, 248, 0.2)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)";
                        e.currentTarget.style.color = isDark ? "#FFFFFF" : "#0F172A";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = isDark ? "#94A3B8" : "#475569";
                      }
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}

              <button
                onClick={() => handleNavClick("login")}
                style={{
                  background: page === "login" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "1px solid",
                  borderColor: page === "login" ? "rgba(56, 189, 248, 0.35)" : isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.12)",
                  color: page === "login" ? "#38BDF8" : isDark ? "#E2E8F0" : "#1E293B",
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontFamily: "inherit",
                  marginLeft: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#38BDF8";
                  e.currentTarget.style.color = "#38BDF8";
                  e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)";
                }}
                onMouseLeave={(e) => {
                  if (page !== "login") {
                    e.currentTarget.style.borderColor = isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.12)";
                    e.currentTarget.style.color = isDark ? "#E2E8F0" : "#1E293B";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <LogIn size={16} />
                {t("nav.login")}
              </button>

              <button
                onClick={() => handleNavClick("register")}
                style={{
                  background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                  border: "none",
                  color: "#0F172A",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "9px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(56, 189, 248, 0.4)",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  marginLeft: "4px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(56, 189, 248, 0.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(56, 189, 248, 0.4)";
                }}
              >
                <UserPlus size={16} />
                {t("nav.getStarted")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick("dashboard")}
                style={{
                  background: page === "dashboard" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "1px solid",
                  borderColor: page === "dashboard" ? "rgba(56, 189, 248, 0.35)" : "transparent",
                  color: page === "dashboard" ? "#38BDF8" : isDark ? "#94A3B8" : "#475569",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontFamily: "inherit",
                }}
              >
                <LayoutDashboard size={16} />
                {t("nav.dashboard")}
              </button>

              {isResident && (
                <>
                  <button
                    onClick={() => handleNavClick("resident-bills")}
                    style={{
                      background: page === "resident-bills" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                      border: "1px solid",
                      borderColor: page === "resident-bills" ? "rgba(56, 189, 248, 0.35)" : "transparent",
                      color: page === "resident-bills" ? "#38BDF8" : isDark ? "#94A3B8" : "#475569",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontFamily: "inherit",
                    }}
                  >
                    <Receipt size={16} />
                    {t("nav.myBills")}
                  </button>
                  <button
                    onClick={() => handleNavClick("alerts")}
                    style={{
                      background: page === "alerts" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                      border: "1px solid",
                      borderColor: page === "alerts" ? "rgba(56, 189, 248, 0.35)" : "transparent",
                      color: page === "alerts" ? "#38BDF8" : isDark ? "#94A3B8" : "#475569",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontFamily: "inherit",
                    }}
                  >
                    <Bell size={16} />
                    {t("nav.alerts")}
                  </button>
                </>
              )}

              <button
                onClick={() => handleNavClick("profile")}
                style={{
                  background: page === "profile" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "1px solid",
                  borderColor: page === "profile" ? "rgba(56, 189, 248, 0.35)" : "transparent",
                  color: page === "profile" ? "#38BDF8" : isDark ? "#94A3B8" : "#475569",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontFamily: "inherit",
                }}
              >
                <User size={16} />
                {t("nav.profile")}
              </button>

              <button
                onClick={() => handleNavClick("logout")}
                style={{
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                  color: "#F43F5E",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontFamily: "inherit",
                  marginLeft: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(244, 63, 94, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(244, 63, 94, 0.12)";
                }}
              >
                <LogOut size={16} />
                {t("nav.logout")}
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#FFFFFF",
            padding: "8px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          className="nav-mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            width: "100%",
            background: isDark ? "rgba(11, 17, 32, 0.96)" : "rgba(255, 255, 255, 0.96)",
            borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(0, 0, 0, 0.1)",
            padding: "16px 24px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxSizing: "border-box",
            animation: "fadeInNav 0.2s ease-out forwards",
          }}
        >
          {/* Language Switcher (mobile) */}
          <div style={{ paddingBottom: "8px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)" }}>
            <LanguageSwitcher />
          </div>

          {!isAuthed ? (
            <>
              <button
                onClick={() => handleNavClick("home")}
                style={{
                  background: page === "home" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "none",
                  color: page === "home" ? "#38BDF8" : isDark ? "#FFFFFF" : "#0F172A",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <Home size={18} /> {t("nav.home")}
              </button>
              <button
                onClick={() => handleNavClick("about")}
                style={{
                  background: page === "about" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "none",
                  color: page === "about" ? "#38BDF8" : isDark ? "#FFFFFF" : "#0F172A",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <Info size={18} /> {t("nav.about")}
              </button>
              <button
                onClick={() => handleNavClick("contact")}
                style={{
                  background: page === "contact" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "none",
                  color: page === "contact" ? "#38BDF8" : isDark ? "#FFFFFF" : "#0F172A",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <Mail size={18} /> {t("nav.contact")}
              </button>
              <button
                onClick={() => handleNavClick("login")}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  color: "#38BDF8",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "6px",
                }}
              >
                <LogIn size={18} /> {t("nav.login")}
              </button>
              <button
                onClick={() => handleNavClick("register")}
                style={{
                  background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
                  border: "none",
                  color: "#0F172A",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <UserPlus size={18} /> {t("nav.getStarted")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick("dashboard")}
                style={{
                  background: page === "dashboard" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "none",
                  color: page === "dashboard" ? "#38BDF8" : isDark ? "#FFFFFF" : "#0F172A",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <LayoutDashboard size={18} /> {t("nav.dashboard")}
              </button>

              {isResident && (
                <>
                  <button
                    onClick={() => handleNavClick("resident-bills")}
                    style={{
                      background: page === "resident-bills" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                      border: "none",
                      color: page === "resident-bills" ? "#38BDF8" : isDark ? "#FFFFFF" : "#0F172A",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                    }}
                  >
                    <Receipt size={18} /> {t("nav.myBills")}
                  </button>
                  <button
                    onClick={() => handleNavClick("alerts")}
                    style={{
                      background: page === "alerts" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                      border: "none",
                      color: page === "alerts" ? "#38BDF8" : isDark ? "#FFFFFF" : "#0F172A",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                    }}
                  >
                    <Bell size={18} /> {t("nav.alerts")}
                  </button>
                </>
              )}

              <button
                onClick={() => handleNavClick("profile")}
                style={{
                  background: page === "profile" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  border: "none",
                  color: page === "profile" ? "#38BDF8" : isDark ? "#FFFFFF" : "#0F172A",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  textAlign: "left",
                }}
              >
                <User size={18} /> {t("nav.profile")}
              </button>

              <button
                onClick={() => handleNavClick("logout")}
                style={{
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "none",
                  color: "#F43F5E",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "6px",
                }}
              >
                <LogOut size={18} /> {t("nav.logout")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Responsive Breakpoint rules */}
      <style>{`
        @media (max-width: 868px) {
          .navbar-container {
            padding: 12px 20px !important;
          }
          .nav-desktop-items {
            display: none !important;
          }
          .nav-mobile-toggle {
            display: flex !important;
          }
        }
        @keyframes fadeInNav {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
