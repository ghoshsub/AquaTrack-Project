import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { createApartment, listApartments, deleteApartment, updateApartment } from "../api/apartmentApi.js";

export default function AdminApartmentsPage({ auth, setPage }) {
  const [apartments, setApartments] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [baseRate, setBaseRate] = useState("");
  const [baseTierLimit, setBaseTierLimit] = useState("");
  const [excessRate, setExcessRate] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingApartmentId, setEditingApartmentId] = useState(null);

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

  function resetForm() {
    setName("");
    setAddress("");
    setOwnerEmail("");
    setOwnerPhone("");
    setBaseRate("");
    setBaseTierLimit("");
    setExcessRate("");
    setEditingApartmentId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload = {
        name,
        address,
        ownerEmail,
        ownerPhone,
        baseRate: Number(baseRate),
        baseTierLimit: Number(baseTierLimit),
        excessRate: Number(excessRate),
      };
      if (editingApartmentId) {
        await updateApartment(auth.token, editingApartmentId, payload);
      } else {
        await createApartment(auth.token, payload);
      }
      resetForm();
      await loadApartments();
    } catch (err) {
      setFormError(err.message || `Could not ${editingApartmentId ? "update" : "create"} apartment.`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(a) {
    setEditingApartmentId(a.id);
    setName(a.name);
    setAddress(a.address);
    setOwnerEmail(a.ownerEmail || "");
    setOwnerPhone(a.ownerPhone || "");
    setBaseRate(a.tariffPlan?.baseRate ?? "");
    setBaseTierLimit(a.tariffPlan?.baseTierLimit ?? "");
    setExcessRate(a.tariffPlan?.excessRate ?? "");
  }

  function handleCancelEdit() {
    resetForm();
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this apartment?")) return;
    try {
      await deleteApartment(auth.token, id);
      await loadApartments();
    } catch (err) {
      alert(err.message || "Could not delete apartment.");
    }
  }

  return (
    <section className="at-container" style={{ maxWidth: "1050px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3">
        <Building2 size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          Apartments
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "var(--at-text-body)", marginTop: "4px" }}>
        Onboard a new building with its tariff plan, or review ones you've already added.
      </p>

      <div className="at-card" style={{ padding: "24px", marginTop: "28px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>
          {editingApartmentId ? "Edit apartment" : "Add a new apartment"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Apartment details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Apartment Name *</label>
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
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Address *</label>
              <input
                className="at-input at-focus"
                style={{ marginTop: "5px" }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Lake Road"
                required
              />
            </div>
          </div>

          {/* Row 2: Owner info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Owner Email</label>
              <input
                type="email"
                className="at-input at-focus"
                style={{ marginTop: "5px" }}
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@example.com"
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Owner Phone</label>
              <input
                className="at-input at-focus"
                style={{ marginTop: "5px" }}
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="555-1234"
              />
            </div>
          </div>

          {/* Row 3: Tariff plan */}
          <div style={{ borderTop: "1px solid rgba(20,43,46,0.1)", paddingTop: "16px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px", color: "var(--at-verdigris-deep)" }}>
              Tariff Plan (Water Rate Tiers)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 500 }}>Base Rate (INR/litre) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="at-input at-focus"
                  style={{ marginTop: "4px" }}
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                  placeholder="e.g. 5.00"
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 500 }}>Base Tier Limit (litres) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="at-input at-focus"
                  style={{ marginTop: "4px" }}
                  value={baseTierLimit}
                  onChange={(e) => setBaseTierLimit(e.target.value)}
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 500 }}>Excess Rate (INR/litre) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="at-input at-focus"
                  style={{ marginTop: "4px" }}
                  value={excessRate}
                  onChange={(e) => setExcessRate(e.target.value)}
                  placeholder="e.g. 8.00"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="at-flex at-items-center at-gap-2">
            <button type="submit" disabled={submitting} className="at-btn-brass at-focus" style={{ padding: "10px 20px" }}>
              {submitting ? (editingApartmentId ? "Saving…" : "Adding…") : (editingApartmentId ? "Save Changes" : "Add Apartment")}
            </button>
            {editingApartmentId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="at-btn-outline at-focus"
                style={{ padding: "10px 16px" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {formError && <p className="at-error" style={{ marginTop: "10px" }}>{formError}</p>}
      </div>

      <div className="at-card" style={{ marginTop: "24px", overflow: "hidden" }}>
        {loadingList && <p style={{ padding: "20px", fontSize: "14px", color: "var(--at-text-muted)" }}>Loading apartments…</p>}
        {listError && <p className="at-error" style={{ padding: "20px" }}>{listError}</p>}
        {!loadingList && !listError && (
          <table className="at-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Base Rate</th>
                <th>Tier Limit</th>
                <th>Excess Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apartments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ color: "var(--at-text-muted)" }}>No apartments yet — add one above.</td>
                </tr>
              )}
              {apartments.map((a) => (
                <tr key={a.id}>
                  <td><span className="at-badge">#{a.id}</span></td>
                  <td><strong>{a.name}</strong></td>
                  <td>{a.address}</td>
                  <td>INR {a.tariffPlan?.baseRate ?? "0"}/litre</td>
                  <td>{a.tariffPlan?.baseTierLimit ?? "0"} litres</td>
                  <td>INR {a.tariffPlan?.excessRate ?? "0"}/litre</td>
                  <td>
                    <div className="at-flex at-items-center at-gap-2">
                      <button onClick={() => handleEdit(a)} className="btn-edit at-focus">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="btn-delete at-focus">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
