import React, { useEffect, useState } from "react";
import { Home } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import { createHousehold, listHouseholdsByApartment, deleteHousehold, updateHousehold } from "../api/householdApi.js";

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
  const [residentEmail, setResidentEmail] = useState("");
  const [hasWorkingMeter, setHasWorkingMeter] = useState(true);
  const [dailyUsageThreshold, setDailyUsageThreshold] = useState("500.00");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingHouseholdId, setEditingHouseholdId] = useState(null);

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
      const payload = {
        apartmentId: Number(selectedApartmentId),
        flatNumber,
        flatSize: Number(flatSize),
        occupancy: Number(occupancy),
        residentEmail,
        hasWorkingMeter,
        dailyUsageThreshold: Number(dailyUsageThreshold),
      };
      if (editingHouseholdId) {
        await updateHousehold(auth.token, editingHouseholdId, payload);
        setEditingHouseholdId(null);
      } else {
        await createHousehold(auth.token, payload);
      }
      setFlatNumber("");
      setFlatSize("");
      setOccupancy("");
      setResidentEmail("");
      setHasWorkingMeter(true);
      setDailyUsageThreshold("500.00");
      await loadHouseholds(selectedApartmentId);
    } catch (err) {
      setFormError(err.message || `Could not ${editingHouseholdId ? "update" : "create"} household.`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(h) {
    setEditingHouseholdId(h.id);
    setFlatNumber(h.flatNumber);
    setFlatSize(String(h.flatSize));
    setOccupancy(String(h.occupancy));
    setResidentEmail(h.residentEmail || "");
    setHasWorkingMeter(h.hasWorkingMeter !== false);
    setDailyUsageThreshold(String(h.dailyUsageThreshold ?? "500.00"));
  }

  function handleCancelEdit() {
    setEditingHouseholdId(null);
    setFlatNumber("");
    setFlatSize("");
    setOccupancy("");
    setResidentEmail("");
    setHasWorkingMeter(true);
    setDailyUsageThreshold("500.00");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this household?")) return;
    try {
      await deleteHousehold(auth.token, id);
      await loadHouseholds(selectedApartmentId);
    } catch (err) {
      alert(err.message || "Could not delete household.");
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
      <p style={{ fontSize: "14px", color: "var(--at-text-body)", marginTop: "4px" }}>
        Add flats to an apartment, or review the ones already onboarded.
      </p>

      {apartmentsError && <p className="at-error" style={{ marginTop: "16px" }}>{apartmentsError}</p>}

      {!apartmentsError && apartments.length === 0 && (
        <div className="at-card" style={{ padding: "20px", marginTop: "24px", fontSize: "14px", color: "var(--at-text-muted)" }}>
          You need at least one apartment before adding households.{" "}
          <button onClick={() => setPage("admin-apartments")} className="at-link-btn at-focus">
            Add an apartment first
          </button>
        </div>
      )}

      {apartments.length > 0 && (
        <>
          <div className="at-card" style={{ padding: "24px", marginTop: "24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>
              {editingHouseholdId ? "Edit household" : "Add a household"}
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", alignItems: "end" }}
            >
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Apartment</label>
                <select
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={selectedApartmentId}
                  onChange={(e) => setSelectedApartmentId(e.target.value)}
                  disabled={!!editingHouseholdId}
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
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Flat size (sq ft)</label>
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
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Resident Email</label>
                <input
                  type="email"
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={residentEmail}
                  onChange={(e) => setResidentEmail(e.target.value)}
                  placeholder="resident@example.com"
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Working Meter?</label>
                <select
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={hasWorkingMeter ? "true" : "false"}
                  onChange={(e) => setHasWorkingMeter(e.target.value === "true")}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Daily Limit (units)</label>
                <input
                  type="number"
                  step="0.01"
                  className="at-input at-focus"
                  style={{ marginTop: "5px" }}
                  value={dailyUsageThreshold}
                  onChange={(e) => setDailyUsageThreshold(e.target.value)}
                  placeholder="500.00"
                  required
                />
              </div>
              <div className="at-flex at-items-center at-gap-2">
                <button type="submit" disabled={submitting} className="at-btn-brass at-focus" style={{ padding: "10px 16px" }}>
                  {submitting ? (editingHouseholdId ? "Saving…" : "Adding…") : (editingHouseholdId ? "Save" : "Add")}
                </button>
                {editingHouseholdId && (
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
            {loadingHouseholds && <p style={{ padding: "20px", fontSize: "14px", color: "var(--at-text-muted)" }}>Loading households…</p>}
            {listError && <p className="at-error" style={{ padding: "20px" }}>{listError}</p>}
            {!loadingHouseholds && !listError && (
              <table className="at-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Flat number</th>
                    <th>Flat size</th>
                    <th>Occupancy</th>
                    <th>Email</th>
                    <th>Meter Status</th>
                    <th>Daily Limit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {households.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ color: "var(--at-text-muted)" }}>
                        No households yet for this apartment — add one above.
                      </td>
                    </tr>
                  )}
                  {households.map((h) => (
                    <tr key={h.id}>
                      <td><span className="at-badge">#{h.id}</span></td>
                      <td>{h.flatNumber}</td>
                      <td>{h.flatSize} sq ft</td>
                      <td>{h.occupancy}</td>
                      <td>{h.residentEmail || "-"}</td>
                      <td>
                        {h.hasWorkingMeter !== false ? (
                          <span style={{ color: "var(--at-verdigris-deep)", fontWeight: 555 }}>Active</span>
                        ) : (
                          <span style={{ color: "var(--at-error)", fontWeight: 555 }}>Broken</span>
                        )}
                      </td>
                      <td>{h.dailyUsageThreshold ?? "500.00"} units</td>
                      <td>
                        <div className="at-flex at-items-center at-gap-2">
                          <button onClick={() => handleEdit(h)} className="btn-edit at-focus">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(h.id)} className="btn-delete at-focus">
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
        </>
      )}
    </section>
  );
}
