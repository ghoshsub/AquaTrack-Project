import React, { useEffect, useState } from "react";
import { Receipt, Plus, Trash2, Lock, Archive, Calendar, Coins, CheckCircle, Info } from "lucide-react";
import BackToDashboard from "../components/BackToDashboard.jsx";
import { listApartments } from "../api/apartmentApi.js";
import {
  listBillingCycles,
  openBillingCycle,
  getBillingCycleDetails,
  finalizeBillingCycle,
  archiveBillingCycle,
  getCycleUsagePreviews,
  updateInvoiceAdjustments
} from "../api/billingApi.js";

function formatBillingMonth(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[monthIndex] || parts[1];
  return `${monthName} Bill`;
}

export default function AdminBillingPage({ auth, setPage }) {
  const [apartments, setApartments] = useState([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState("");
  const [apartmentsError, setApartmentsError] = useState("");

  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [cyclesError, setCyclesError] = useState("");

  // Cycle details
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [cycleDetails, setCycleDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Create cycle form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [useMonthSelect, setUseMonthSelect] = useState(true);
  const [createError, setCreateError] = useState("");
  const [creatingCycle, setCreatingCycle] = useState(false);

  // Household water usage readings entry
  const [householdReadings, setHouseholdReadings] = useState([]);

  // Inline adjustment state
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [tempAdjustments, setTempAdjustments] = useState("");
  const [updatingInvoice, setUpdatingInvoice] = useState(false);

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

  async function loadCycles(apartmentId) {
    if (!apartmentId) return;
    setLoadingCycles(true);
    setCyclesError("");
    try {
      const data = await listBillingCycles(auth.token, apartmentId);
      setCycles(data);
      if (data.length > 0) {
        // Automatically select the first/newest cycle
        setSelectedCycleId(data[0].id);
      } else {
        setSelectedCycleId(null);
        setCycleDetails(null);
      }
    } catch (err) {
      setCyclesError(err.message || "Could not load billing cycles.");
    } finally {
      setLoadingCycles(false);
    }
  }

  useEffect(() => {
    loadCycles(selectedApartmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApartmentId]);

  async function loadCycleDetails(cycleId) {
    if (!cycleId) return;
    setLoadingDetails(true);
    setDetailsError("");
    try {
      const data = await getBillingCycleDetails(auth.token, cycleId);
      setCycleDetails(data);
      if (data.status === "OPEN") {
        const previews = await getCycleUsagePreviews(auth.token, cycleId);
        setHouseholdReadings(previews.map(p => ({
          householdId: p.householdId,
          flatNumber: p.flatNumber,
          readingValue: p.existingUsage !== null ? String(p.existingUsage) : "0"
        })));
      }
    } catch (err) {
      setDetailsError(err.message || "Could not load cycle details.");
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    loadCycleDetails(selectedCycleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycleId]);

  async function handleCreateCycle(e) {
    e.preventDefault();
    setCreateError("");
    setCreatingCycle(true);
    try {
      let finalStart = startDate;
      let finalEnd = endDate;

      if (useMonthSelect) {
        if (!billingMonth) {
          throw new Error("Please select a billing month.");
        }
        const [yearStr, monthStr] = billingMonth.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);
        finalStart = `${yearStr}-${monthStr}-01`;
        
        // Find last day of the month
        const lastDay = new Date(year, month, 0).getDate();
        const lastDayStr = String(lastDay).padStart(2, "0");
        finalEnd = `${yearStr}-${monthStr}-${lastDayStr}`;
      }

      const payload = {
        apartmentId: Number(selectedApartmentId),
        startDate: finalStart,
        endDate: finalEnd
      };
      const newCycle = await openBillingCycle(auth.token, payload);
      setStartDate("");
      setEndDate("");
      setBillingMonth("");
      await loadCycles(selectedApartmentId);
      setSelectedCycleId(newCycle.id);
    } catch (err) {
      setCreateError(err.message || "Failed to open billing cycle.");
    } finally {
      setCreatingCycle(false);
    }
  }

  async function handleFinalize() {
    if (!window.confirm("Generating invoices will calculate all charges according to the tariff plan, and create invoices for all households. You cannot revert this. Proceed?")) return;
    
    const readingsPayload = {
      readings: householdReadings.map(r => ({
        householdId: r.householdId,
        readingValue: Number(r.readingValue)
      }))
    };

    setLoadingDetails(true);
    try {
      await finalizeBillingCycle(auth.token, selectedCycleId, readingsPayload);
      await loadCycles(selectedApartmentId);
    } catch (err) {
      alert(err.message || "Failed to generate invoices.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleArchive() {
    if (!window.confirm("Are you sure you want to archive this cycle? It will lock all invoices from further adjustment edits.")) return;
    setLoadingDetails(true);
    try {
      await archiveBillingCycle(auth.token, selectedCycleId);
      await loadCycles(selectedApartmentId);
    } catch (err) {
      alert(err.message || "Failed to archive billing cycle.");
    } finally {
      setLoadingDetails(false);
    }
  }

  function startEditingInvoice(inv) {
    setEditingInvoiceId(inv.id);
    setTempAdjustments(String(inv.adjustments));
  }

  async function handleSaveAdjustments(invId) {
    setUpdatingInvoice(true);
    try {
      await updateInvoiceAdjustments(auth.token, invId, Number(tempAdjustments));
      setEditingInvoiceId(null);
      await loadCycleDetails(selectedCycleId);
    } catch (err) {
      alert(err.message || "Could not update adjustments.");
    } finally {
      setUpdatingInvoice(false);
    }
  }

  return (
    <section className="at-container" style={{ maxWidth: "1000px", paddingTop: "56px", paddingBottom: "80px" }}>
      <BackToDashboard setPage={setPage} />

      <div className="at-flex at-items-center at-gap-3">
        <Receipt size={22} color="var(--at-verdigris-deep)" />
        <h1 className="at-display" style={{ fontSize: "26px", fontWeight: 600, color: "var(--at-ink-deep)" }}>
          Billing Engine & Cycles
        </h1>
      </div>
      <p style={{ fontSize: "14px", color: "var(--at-text-body)", marginTop: "4px" }}>
        Track tankers, municipal water procurement cost distributions, and finalize per-household cycles.
      </p>

      {apartmentsError && <p className="at-error" style={{ marginTop: "16px" }}>{apartmentsError}</p>}

      {!apartmentsError && apartments.length === 0 && (
        <div className="at-card" style={{ padding: "20px", marginTop: "24px", fontSize: "14px", color: "var(--at-text-muted)" }}>
          You need an apartment onboarded before setting up billing.{" "}
          <button onClick={() => setPage("admin-apartments")} className="at-link-btn at-focus">
            Add apartment first
          </button>
        </div>
      )}

      {apartments.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", marginTop: "28px" }}>
          
          {/* Left panel: cycle lists and opener */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Apartment Selector */}
            <div className="at-card" style={{ padding: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 550, display: "block", marginBottom: "6px" }}>Select Apartment</label>
              <select
                className="at-input at-focus"
                value={selectedApartmentId}
                onChange={(e) => setSelectedApartmentId(e.target.value)}
              >
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Cycle Opener */}
            <div className="at-card" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Open New Billing Period</h2>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", borderBottom: "1px solid var(--at-border-light)", paddingBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => setUseMonthSelect(true)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 650,
                    color: useMonthSelect ? "var(--at-verdigris-deep)" : "var(--at-text-muted)",
                    background: "transparent",
                    border: "none",
                    borderBottom: useMonthSelect ? "2px solid var(--at-verdigris-deep)" : "none",
                    paddingBottom: "4px",
                    cursor: "pointer"
                  }}
                >
                  By Month
                </button>
                <button
                  type="button"
                  onClick={() => setUseMonthSelect(false)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 650,
                    color: !useMonthSelect ? "var(--at-verdigris-deep)" : "var(--at-text-muted)",
                    background: "transparent",
                    border: "none",
                    borderBottom: !useMonthSelect ? "2px solid var(--at-verdigris-deep)" : "none",
                    paddingBottom: "4px",
                    cursor: "pointer"
                  }}
                >
                  Custom Dates
                </button>
              </div>

              <form onSubmit={handleCreateCycle} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {useMonthSelect ? (
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 500 }}>Select Month</label>
                    <input
                      type="month"
                      required
                      className="at-input at-focus"
                      value={billingMonth}
                      onChange={(e) => setBillingMonth(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 500 }}>Start Date</label>
                      <input
                        type="date"
                        required
                        className="at-input at-focus"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: 500 }}>End Date</label>
                      <input
                        type="date"
                        required
                        className="at-input at-focus"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <button type="submit" disabled={creatingCycle} className="at-btn-brass at-focus" style={{ width: "100%", padding: "10px", marginTop: "4px" }}>
                  {creatingCycle ? "Creating..." : "Open Cycle"}
                </button>
              </form>
              {createError && <p className="at-error" style={{ marginTop: "10px", fontSize: "12px" }}>{createError}</p>}
            </div>

            {/* Cycle Selector List */}
            <div className="at-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600 }}>Billing History</h2>
              {loadingCycles && <p style={{ fontSize: "13px", color: "var(--at-text-muted)" }}>Loading cycles...</p>}
              {cyclesError && <p className="at-error">{cyclesError}</p>}
              {!loadingCycles && cycles.length === 0 && (
                <p style={{ fontSize: "13px", color: "var(--at-text-muted)" }}>No cycles opened yet.</p>
              )}
              {cycles.map((c) => {
                const isActive = selectedCycleId === c.id;
                let badgeStyle = { color: "#fff", background: "var(--at-verdigris-deep)" };
                if (c.status === "FINALIZED") badgeStyle = { color: "var(--at-ink)", background: "var(--at-brass)" };
                if (c.status === "ARCHIVED") badgeStyle = { color: "var(--at-text-muted-deep)", background: "var(--at-bg-hover)" };

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCycleId(c.id)}
                    className="at-focus"
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "12px",
                      borderRadius: "8px",
                      border: isActive ? "2px solid var(--at-verdigris-deep)" : "1px solid var(--at-border-light)",
                      background: isActive ? "rgba(35, 117, 107, 0.05)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 500 }}>
                        {c.startDate ? formatBillingMonth(c.startDate) : `Cycle #${c.id}`}
                      </span>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: 600, ...badgeStyle }}>
                        {c.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Details of selected cycle */}
          <div>
            {!selectedCycleId && (
              <div className="at-card" style={{ padding: "40px", textAlign: "center", color: "var(--at-text-muted)" }}>
                Select or open a billing cycle on the left to manage it.
              </div>
            )}

            {selectedCycleId && loadingDetails && (
              <p style={{ fontSize: "14px", color: "var(--at-text-muted)" }}>Loading cycle details...</p>
            )}

            {selectedCycleId && !loadingDetails && detailsError && (
              <p className="at-error">{detailsError}</p>
            )}

            {selectedCycleId && !loadingDetails && cycleDetails && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Header card */}
                <div className="at-card" style={{ padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                     <div>
                       <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Billing Period: {cycleDetails.startDate ? formatBillingMonth(cycleDetails.startDate) : ""}</h2>
                     </div>
                    <span style={{
                      fontSize: "12px",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontWeight: 600,
                      color: cycleDetails.status === "OPEN" ? "#fff" : "var(--at-ink)",
                      background: cycleDetails.status === "OPEN" ? "var(--at-verdigris-deep)" : "var(--at-brass)"
                    }}>
                      {cycleDetails.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px", borderTop: "1px solid var(--admin-border-muted, var(--at-border-light))", paddingTop: "20px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>Apartment</span>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--admin-text-white)", marginTop: "2px" }}>
                        {cycleDetails.apartment?.name || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                    {cycleDetails.status === "OPEN" && (
                      <button onClick={handleFinalize} className="at-btn-brass at-focus" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}>
                        <Lock size={15} />
                        Generate Invoice
                      </button>
                    )}
                    {cycleDetails.status === "FINALIZED" && (
                      <button onClick={handleArchive} className="at-btn-outline at-focus" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}>
                        <Archive size={15} />
                        Archive & Lock Invoices
                      </button>
                    )}
                    {cycleDetails.status === "ARCHIVED" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--admin-text-muted)" }}>
                        <CheckCircle size={16} color="var(--at-verdigris-deep)" />
                        This cycle is archived and locked.
                      </div>
                    )}
                  </div>
                </div>

                 {/* Household readings input section for OPEN cycles */}
                 {cycleDetails.status === "OPEN" && (
                   <div className="at-card" style={{ padding: "28px" }}>
                     <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Household Water Usage Readings</h3>
                     <p style={{ fontSize: "13px", color: "var(--at-text-muted)", marginBottom: "20px" }}>
                       Enter the water usage reading (in liters) for each household for this cycle. If water usage logs have already been recorded for this month, they will be pre-populated below.
                     </p>
                     
                     <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                       {householdReadings.map((reading, index) => (
                         <div key={reading.householdId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--at-bg-hover)", borderRadius: "6px" }}>
                           <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--at-ink-deep)" }}>
                             Flat {reading.flatNumber}
                           </span>
                           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                             <input
                               type="number"
                               step="0.001"
                               className="at-input at-focus"
                               style={{ width: "120px", padding: "6px 10px", fontSize: "13px" }}
                               value={reading.readingValue}
                               onChange={(e) => {
                                 const updated = [...householdReadings];
                                 updated[index].readingValue = e.target.value;
                                 setHouseholdReadings(updated);
                               }}
                             />
                             <span style={{ fontSize: "12px", color: "var(--at-text-muted)" }}>liters</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Generated Invoices section */}
                 {cycleDetails.status !== "OPEN" && (
                   <div className="at-card" style={{ padding: "28px" }}>
                     <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px" }}>Resident Invoices</h3>
                     <table className="at-table">
                       <thead>
                         <tr>
                           <th>Flat</th>
                           <th>Water Usage</th>
                           <th>Base Charge</th>
                           <th>Adjustments</th>
                           <th>Total Invoice</th>
                           <th>Status</th>
                           {cycleDetails.status === "FINALIZED" && <th>Action</th>}
                         </tr>
                       </thead>
                       <tbody>
                         {!cycleDetails.invoices || cycleDetails.invoices.length === 0 ? (
                           <tr>
                             <td colSpan={cycleDetails.status === "FINALIZED" ? 7 : 6} style={{ color: "var(--at-text-muted)" }}>
                               No invoices found.
                             </td>
                           </tr>
                         ) : (
                           cycleDetails.invoices.map((inv) => {
                             const isEditing = editingInvoiceId === inv.id;
                             return (
                               <tr key={inv.id}>
                                 <td><strong>{inv.household?.flatNumber || "Unknown"}</strong></td>
                                 <td>{inv.waterUsage ?? "0.000"} liters</td>
                                 <td>INR {inv.baseCharge}</td>
                                 <td>
                                   {isEditing ? (
                                     <input
                                       type="number"
                                       step="0.01"
                                       className="at-input at-focus"
                                       style={{ width: "90px", padding: "4px 8px", fontSize: "13px" }}
                                       value={tempAdjustments}
                                       onChange={(e) => setTempAdjustments(e.target.value)}
                                     />
                                   ) : (
                                     <span style={{ color: inv.adjustments < 0 ? "var(--at-verdigris-deep)" : inv.adjustments > 0 ? "var(--at-error)" : "inherit" }}>
                                       INR {inv.adjustments}
                                     </span>
                                   )}
                                 </td>
                                 <td><strong>INR {inv.total}</strong></td>
                                 <td>
                                   <span className="at-badge" style={{
                                     background: inv.status === "PAID" ? "#dcfce7" : "#fee2e2",
                                     color: inv.status === "PAID" ? "#166534" : "#991b1b",
                                     padding: "2px 8px",
                                     borderRadius: "10px",
                                     fontSize: "11px",
                                     fontWeight: 600
                                   }}>
                                     {inv.status}
                                   </span>
                                 </td>
                                 {cycleDetails.status === "FINALIZED" && (
                                   <td>
                                     {isEditing ? (
                                       <div className="at-flex at-gap-1">
                                         <button disabled={updatingInvoice} onClick={() => handleSaveAdjustments(inv.id)} className="at-link-btn at-focus" style={{ fontWeight: 600 }}>
                                           Save
                                         </button>
                                         <button onClick={() => setEditingInvoiceId(null)} className="at-link-btn at-focus" style={{ color: "var(--at-text-muted)" }}>
                                           Cancel
                                         </button>
                                       </div>
                                     ) : (
                                       <button onClick={() => startEditingInvoice(inv)} className="at-link-btn at-focus">
                                         Adjust
                                       </button>
                                     )}
                                   </td>
                                 )}
                               </tr>
                             );
                           })
                         )}
                       </tbody>
                     </table>
                   </div>
                 )}

               </div>
             )}
           </div>

         </div>
       )}
    </section>
  );
}
