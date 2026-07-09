import React, { useEffect, useState } from "react";
import { Home } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { createHousehold, listHouseholdsByApartment } from "../api/householdApi.js";

export default function AdminHouseholdsPage({ auth, setPage }) {
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError, setApartmentsError] = useState("");

  const [households, setHouseholds] = useState([]);
  const [loadingHouseholds, setLoadingHouseholds] = useState(false);
  const [listError, setListError] = useState("");

  const [flatNumber, setFlatNumber] = useState("");
  const [flatSize, setFlatSize] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadApartments() {
      try {
        const data = await listApartments(auth.token);
        setApartments(data);
        if (data.length > 0) setSelectedApartmentId(String(data[0].id));
      } catch (err) {
        setApartmentsError(err.message || "Could not load apartments.");
      }
    }
    loadApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHouseholds(apartmentId) {
    if (!apartmentId) return;
    setLoadingHouseholds(true);
    setListError("");
    try {
      const data = await listHouseholdsByApartment(auth.token, apartmentId);
      setHouseholds(data);
    } catch (err) {
      setListError(err.message || "Could not load households.");
    } finally {
      setLoadingHouseholds(false);
    }
  }

  useEffect(() => {
    loadHouseholds(selectedApartmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await createHousehold(auth.token, {
        apartmentId: Number(selectedApartmentId),
        flatNumber,
        flatSize: Number(flatSize),
        occupancy: Number(occupancy),
      });
      setFlatNumber("");
      setFlatSize("");
      setOccupancy("");
      await loadHouseholds(selectedApartmentId);
    } catch (err) {
      setFormError(err.message || "Could not create household.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="at-container" style={{ maxWidth: "900px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3">
        <Home size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          Households
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "rgba(20,43,46,0.65)", marginTop: "4px" }}>
        Add flats to an apartment, or review the ones already onboarded.
      </p>

      {apartmentsError && <p className="at-error" style={{ marginTop: "16px" }}>{apartmentsError}</p>}

      {!apartmentsError && apartments.length === 0 && (
        <div className="at-card" style={{ padding: "20px", marginTop: "24px", fontSize: "14px", color: "rgba(20,43,46,0.65)" }}>
          You need at least one apartment before adding households.{" "}
          <button onClick={() => setPage("admin-apartments")} className="at-link-btn at-focus">
            Add an apartment first
          </button>
        </div>
      )}

      {apartments.length > 0 && (
        <>
          <div className="at-card" style={{ padding: "24px", marginTop: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Add a household</h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}
            >
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Apartment</label>
                <select
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={selectedApartmentId}
                  onChange={(e) => setSelectedApartmentId(e.target.value)}
                >
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Flat number</label>
                <input
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="A-101"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Flat size</label>
                <input
                  type="number"
                  step="0.01"
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={flatSize}
                  onChange={(e) => setFlatSize(e.target.value)}
                  placeholder="850.5"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Occupancy</label>
                <input
                  type="number"
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                  placeholder="3"
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
            {loadingHouseholds && <p style={{ padding: "20px", fontSize: "14px", color: "rgba(20,43,46,0.6)" }}>Loading households…</p>}
            {listError && <p className="at-error" style={{ padding: "20px" }}>{listError}</p>}
            {!loadingHouseholds && !listError && (
              <table className="at-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Flat number</th>
                    <th>Flat size</th>
                    <th>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {households.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ color: "rgba(20,43,46,0.5)" }}>
                        No households yet for this apartment — add one above.
                      </td>
                    </tr>
                  )}
                  {households.map((h) => (
                    <tr key={h.id}>
                      <td><span className="at-badge">#{h.id}</span></td>
                      <td>{h.flatNumber}</td>
                      <td>{h.flatSize}</td>
                      <td>{h.occupancy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  );
}
