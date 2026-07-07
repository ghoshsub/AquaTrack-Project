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

/**
 * Page switching lives here as simple state for now. When you're ready,
 * swap this for react-router (react-router-dom) — each `setPage("x")`
 * call becomes a navigate("/x"), and each page below becomes a <Route>.
 *
 * Auth (the JWT + user info returned from login/register) is lifted up
 * to this component so any page can read who's logged in.
 */
export default function App() {
  const [page, setPage] = useState("home");
  const [auth, setAuth] = useState(null); // { token, username, role } | null

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
  const activePage = auth && (page === "login" || page === "register") ? "dashboard" : page;

  return (
    <div className="at-root">
      <NavBar page={activePage} setPage={handlePageChange} isAuthed={!!auth} />

      <main style={{ flex: 1 }}>
        {activePage === "home" && <HomePage setPage={handlePageChange} />}
        {activePage === "login" && <LoginPage setPage={handlePageChange} onAuthed={handleAuthed} />}
        {activePage === "register" && <RegisterPage setPage={handlePageChange} onAuthed={handleAuthed} />}
        {activePage === "about" && <AboutPage />}
        {activePage === "contact" && <ContactPage />}
        {activePage === "dashboard" && <DashboardPage auth={auth} />}
      </main>

      <Footer />
    </div>
  );
}
