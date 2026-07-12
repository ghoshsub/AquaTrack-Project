import React from "react";
import { Home, LogIn, UserPlus, Info, Mail, Droplets, LogOut, User } from "lucide-react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "login", label: "Login", icon: LogIn },
  { key: "register", label: "Register", icon: UserPlus },
  { key: "about", label: "About", icon: Info },
  { key: "contact", label: "Contact", icon: Mail },
];

export default function NavBar({ page, setPage, isAuthed }) {
  return (
    <header style={{ background: "var(--at-ink)" }} className="sticky top-0 z-50">
      <nav className="at-container at-flex at-items-center at-justify-between" style={{ paddingTop: "12px", paddingBottom: "12px" }}>
        <button
          onClick={() => setPage(isAuthed ? "dashboard" : "home")}
          className="at-flex at-items-center at-gap-2 at-focus"
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <Droplets size={22} color="var(--at-brass)" strokeWidth={2.25} />
          <span
            className="at-display"
            style={{ color: "var(--at-limestone)", fontSize: "19px", fontWeight: 600, letterSpacing: "0.2px" }}
          >
            AquaTrack
          </span>
        </button>

        {!isAuthed && (
          <div className="at-flex at-items-center at-gap-1">
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
