import React from "react";
import { Home, LogIn, UserPlus, Info, Mail, Droplets, LogOut, User, Bell, Receipt, Sun, Moon } from "lucide-react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "login", label: "Login", icon: LogIn },
  { key: "register", label: "Register", icon: UserPlus },
  { key: "about", label: "About", icon: Info },
  { key: "contact", label: "Contact", icon: Mail },
];

export default function NavBar({ page, setPage, auth, theme, toggleTheme }) {
  const isAuthed = !!auth;
  const isAdmin = auth?.role === "ADMIN";
  const isResident = auth?.role === "RESIDENT";

  return (
    <header style={{ background: "var(--at-nav-bg)", borderBottom: "1px solid var(--at-border-light)" }} className="sticky top-0 z-50">
      <nav className="at-container at-flex at-items-center at-justify-between" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
        <button
          onClick={() => setPage(isAuthed ? "dashboard" : "home")}
          className="at-flex at-items-center at-gap-2 at-focus"
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <Droplets size={22} color="var(--at-brass)" strokeWidth={2.25} />
          <span
            className="at-display"
            style={{ color: "var(--at-nav-text)", fontSize: "19px", fontWeight: 600, letterSpacing: "0.2px" }}
          >
            AquaTrack
          </span>
        </button>

        {!isAuthed && (
          <div className="at-flex at-items-center at-gap-1">
            <button
              onClick={toggleTheme}
              className="at-navlink at-focus"
              style={{ padding: "8px", borderRadius: "50%", marginRight: "8px" }}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className={`at-navlink at-focus ${page === key ? "active" : ""}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        )}

        {isAuthed && (
          <div className="at-flex at-items-center at-gap-3">
            <button
              onClick={toggleTheme}
              className="at-navlink at-focus"
              style={{ padding: "8px", borderRadius: "50%" }}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setPage("admin-billing")}
                  className={`at-navlink at-focus ${page === "admin-billing" ? "active" : ""}`}
                >
                  <Receipt size={15} />
                  Billing
                </button>
              </>
            )}
            {isResident && (
              <>
                <button
                  onClick={() => setPage("resident-bills")}
                  className={`at-navlink at-focus ${page === "resident-bills" ? "active" : ""}`}
                >
                  <Receipt size={15} />
                  My Bills
                </button>
                <button
                  onClick={() => setPage("alerts")}
                  className={`at-navlink at-focus ${page === "alerts" ? "active" : ""}`}
                >
                  <Bell size={15} />
                  Alerts
                </button>
              </>
            )}
            <button
              onClick={() => setPage("profile")}
              className={`at-navlink at-focus ${page === "profile" ? "active" : ""}`}
            >
              <User size={15} />
              Profile
            </button>
            <button onClick={() => setPage("logout")} className="at-navlink at-focus">
              <LogOut size={15} />
              Log out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
