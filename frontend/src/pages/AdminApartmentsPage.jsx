import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { createApartment, listApartments } from "../api/apartmentApi.js";

export default function AdminApartmentsPage({ auth, setPage }) {
  const [apartments, setApartments] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadApartments() {
    setLoadingList(true);
    setListError("");
    try {
      const data = await listApartments(auth.token);
      setApartments(data);
    } catch (err) {
      setListError(err.message || "Could not load apartments.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createApartment(auth.token, { name, address });
      setName("");
      setAddress("");
      await loadApartments();
    } catch (err) {
      setFormError(err.message || "Could not create apartment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="at-container" style={{ maxWidth: "900px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3">
        <Building2 size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          Apartments
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.65)", marginTop: "4px" }}>
        Onboard a new building, or review ones you've already added.
      </p>

      <div className="at-card" style={{ padding: "24px", marginTop: "28px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Add a new apartment</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 500 }}>Name</label>
            <input
              className="at-input at-focus"
              style={{ marginTop: "5px" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Green Valley Residency"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: 500 }}>Address</label>
            <input
              className="at-input at-focus"
              style={{ marginTop: "5px" }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Lake Road"
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="at-btn-brass at-focus">
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
        {formError && <p className="at-error" style={{ marginTop: "10px" }}>{formError}</p>}
      </div>

      <div className="at-card" style={{ marginTop: "24px", overflow: "hidden" }}>
        {loadingList && <p style={{ padding: "20px", fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>Loading apartments…</p>}
        {listError && <p className="at-error" style={{ padding: "20px" }}>{listError}</p>}
        {!loadingList && !listError && (
          <table className="at-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {apartments.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: "rgba(20,43,46,0.5)" }}>No apartments yet — add one above.</td>
                </tr>
              )}
              {apartments.map((a) => (
                <tr key={a.id}>
                  <td><span className="at-badge">#{a.id}</span></td>
                  <td>{a.name}</td>
                  <td>{a.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
