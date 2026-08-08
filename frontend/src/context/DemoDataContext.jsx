import React, { createContext, useContext, useState } from "react";

const SEED_APARTMENTS = [];

const SEED_HOUSEHOLDS = {};

const SEED_CYCLES = {};

function loadLS(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function saveLS(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { } }

let _nid = 300;
export function nextDemoId() { return ++_nid; }

const DemoDataContext = createContext(null);

export function DemoDataProvider({ children }) {
  const [apartments, setApartments] = useState(() => loadLS("demo_apartments", SEED_APARTMENTS));
  const [households, setHouseholds] = useState(() => loadLS("demo_households", SEED_HOUSEHOLDS));
  const [cycles,     setCycles]     = useState(() => loadLS("demo_cycles",     SEED_CYCLES));

  function addApartment(apt) {
    const n = { ...apt, id: nextDemoId() };
    const u = [...apartments, n];
    setApartments(u); saveLS("demo_apartments", u); return n;
  }
  function updateApartment(id, changes) {
    const u = apartments.map(a => a.id === id ? { ...a, ...changes } : a);
    setApartments(u); saveLS("demo_apartments", u);
  }
  function removeApartment(id) {
    const u = apartments.filter(a => a.id !== id);
    setApartments(u); saveLS("demo_apartments", u);
    const uh = { ...households }; delete uh[id]; setHouseholds(uh); saveLS("demo_households", uh);
    const uc = { ...cycles };     delete uc[id]; setCycles(uc);     saveLS("demo_cycles", uc);
  }

  function getHouseholds(aptId) { return households[aptId] || []; }
  function addHousehold(aptId, hh) {
    const n = { ...hh, id: nextDemoId() };
    const u = { ...households, [aptId]: [...(households[aptId] || []), n] };
    setHouseholds(u); saveLS("demo_households", u); return n;
  }
  function updateHousehold(aptId, id, changes) {
    const u = { ...households, [aptId]: (households[aptId] || []).map(h => h.id === id ? { ...h, ...changes } : h) };
    setHouseholds(u); saveLS("demo_households", u);
  }
  function removeHousehold(aptId, id) {
    const u = { ...households, [aptId]: (households[aptId] || []).filter(h => h.id !== id) };
    setHouseholds(u); saveLS("demo_households", u);
  }

  function getCycles(aptId) { return cycles[aptId] || []; }
  function addCycle(aptId, cycle) {
    const n = { ...cycle, id: nextDemoId(), invoices: [] };
    const u = { ...cycles, [aptId]: [n, ...(cycles[aptId] || [])] };
    setCycles(u); saveLS("demo_cycles", u); return n;
  }
  function updateCycle(aptId, id, changes) {
    const u = { ...cycles, [aptId]: (cycles[aptId] || []).map(c => c.id === id ? { ...c, ...changes } : c) };
    setCycles(u); saveLS("demo_cycles", u);
  }
  function updateInvoiceStatus(aptId, cycleId, invoiceId, status) {
    const u = { ...cycles, [aptId]: (cycles[aptId] || []).map(c => c.id === cycleId ? { ...c, invoices: (c.invoices || []).map(inv => inv.id === invoiceId ? { ...inv, status } : inv) } : c) };
    setCycles(u); saveLS("demo_cycles", u);
  }
  function resetDemoData() {
    setApartments(SEED_APARTMENTS); setHouseholds(SEED_HOUSEHOLDS); setCycles(SEED_CYCLES);
    localStorage.removeItem("demo_apartments"); localStorage.removeItem("demo_households"); localStorage.removeItem("demo_cycles");
  }

  return (
    <DemoDataContext.Provider value={{ apartments, households, cycles, addApartment, updateApartment, removeApartment, getHouseholds, addHousehold, updateHousehold, removeHousehold, getCycles, addCycle, updateCycle, updateInvoiceStatus, resetDemoData }}>
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error("useDemoData must be inside DemoDataProvider");
  return ctx;
}
