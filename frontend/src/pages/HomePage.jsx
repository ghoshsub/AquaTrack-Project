import React from "react";
import Hero from "../components/Hero.jsx";
import StatBand from "../components/StatBand.jsx";
import Features from "../components/Features.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import CTA from "../components/CTA.jsx";

export default function HomePage({ setPage }) {
  return (
    <>
      <Hero setPage={setPage} />
      <StatBand />
      <Features />
      <HowItWorks />
      <CTA setPage={setPage} />
    </>
  );
}
