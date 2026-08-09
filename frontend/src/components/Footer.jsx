import React from "react";
import { useTranslation } from "react-i18next";
import {
  Droplets, ShieldCheck, Mail, Phone, MapPin,
  CheckCircle2
} from "lucide-react";

// Inline SVG Icon components for brand social icons
function GithubIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        background: "var(--admin-sidebar-bg)",
        borderTop: "1px solid var(--admin-card-border)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        padding: "60px 24px 30px",
        marginTop: "auto",
        position: "relative",
        zIndex: 10,
        color: "var(--admin-color)",
      }}
    >
      {/* Background Ambient Glow Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.5) 50%, transparent 100%)",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Top Footer Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            paddingBottom: "48px",
            borderBottom: "1px solid var(--admin-card-border)",
          }}
        >
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(56, 189, 248, 0.4)",
                }}
              >
                <Droplets size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  background: "var(--admin-logo-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AquaTrack
              </span>
            </div>

            <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", lineHeight: 1.65, margin: 0 }}>
              {t("footer.tagline")}
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#10B981",
                width: "fit-content",
              }}
            >
              <ShieldCheck size={15} />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-white)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
              {t("footer.platform")}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px", color: "var(--admin-text-muted)" }}>
              {[t("footer.dashboard"), t("footer.billing"), t("footer.reports"), t("footer.analytics")].map((link, idx) => (
                <li key={idx}>
                  <span style={{ cursor: "pointer", transition: "color 0.2s ease" }} onMouseEnter={(e) => (e.target.style.color = "#38BDF8")} onMouseLeave={(e) => (e.target.style.color = "var(--admin-text-muted)")}>
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-white)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
              {t("footer.contact")}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px", color: "var(--admin-text-muted)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={15} color="#0284C7" />
                <span>support@aquatrack.io</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={15} color="#0284C7" />
                <span>+1 (800) 555-AQUA</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={15} color="#0284C7" />
                <span>Silicon Valley, CA</span>
              </li>
            </ul>
          </div>

          {/* Social Icons & Status */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-white)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
              {t("footer.company")}
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {[
                { icon: TwitterIcon, label: "Twitter", href: "https://twitter.com" },
                { icon: GithubIcon, label: "GitHub", href: "https://github.com" },
                { icon: LinkedinIcon, label: "LinkedIn", href: "https://linkedin.com" },
                { icon: ({ size, color }) => <Mail size={size} color={color} />, label: "Email", href: "mailto:support@aquatrack.io" },
              ].map(({ icon: Icon, label, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--at-btn-secondary-bg)",
                    border: "1px solid var(--at-btn-secondary-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--admin-text-muted)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                    e.currentTarget.style.color = "#0284C7";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--at-btn-secondary-bg)";
                    e.currentTarget.style.borderColor = "var(--at-btn-secondary-border)";
                    e.currentTarget.style.color = "var(--admin-text-muted)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Icon size={16} color="currentColor" />
                </a>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#10B981" }}>
              <CheckCircle2 size={16} />
              <span>All Systems Operational (99.99%)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Info */}
        <div
          style={{
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12.5px",
            color: "var(--admin-text-muted)",
          }}
        >
          <div>{t("footer.copyright")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>{t("footer.madeWith")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
