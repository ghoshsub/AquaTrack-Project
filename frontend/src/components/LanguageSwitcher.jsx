import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("at-language", code);
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="lang-switcher" style={{ position: "relative" }}>
      <button
        id="lang-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        className="lang-switcher-btn"
        title={t("language.select")}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: compact ? "4px 8px" : "6px 12px",
          background: "rgba(56, 189, 248, 0.10)",
          border: "1px solid rgba(56, 189, 248, 0.30)",
          borderRadius: "8px",
          color: "var(--admin-text-white)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.01em",
          transition: "all 0.18s ease",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "16px" }}>{currentLang.flag}</span>
        {!compact && (
          <span style={{ maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentLang.label}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transition: "transform 0.18s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.7,
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          id="lang-switcher-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "140px",
            background: "var(--admin-card-bg)",
            border: "1px solid var(--admin-card-border)",
            borderRadius: "10px",
            boxShadow: "var(--admin-card-shadow)",
            padding: "6px",
            zIndex: 9999,
            listStyle: "none",
            margin: 0,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            animation: "fadeSlideIn 0.15s ease",
          }}
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                role="option"
                aria-selected={i18n.language === lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  background:
                    i18n.language === lang.code
                      ? "rgba(56, 189, 248, 0.15)"
                      : "transparent",
                  border: "none",
                  borderRadius: "7px",
                  color:
                    i18n.language === lang.code ? "#38BDF8" : "var(--admin-text-white)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: i18n.language === lang.code ? 700 : 500,
                  transition: "all 0.14s ease",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (i18n.language !== lang.code) {
                    e.currentTarget.style.background = "var(--admin-subcard-bg)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== lang.code) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "16px" }}>{lang.flag}</span>
                <span>{lang.label}</span>
                {i18n.language === lang.code && (
                  <svg
                    style={{ marginLeft: "auto" }}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2.5 7l3.5 3.5 5.5-6"
                      stroke="#38BDF8"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
