"use client";

import { useState } from "react";

export default function CalculatorPage() {
  const [landSize, setLandSize] = useState(10);
  const [treeType, setTreeType] = useState("Teak");
  const [region, setRegion] = useState("India");
  const [soilQuality, setSoilQuality] = useState("High");

  const baseMultiplier =
    treeType === "Teak"
      ? 18
      : treeType === "Bamboo"
      ? 25
      : treeType === "Neem"
      ? 14
      : 12;

  const soilMultiplier =
    soilQuality === "High" ? 1.2 : soilQuality === "Medium" ? 1 : 0.8;

  const estimatedCredits = Math.round(
    landSize * baseMultiplier * soilMultiplier
  );

  const firstIssuance = Math.round(estimatedCredits * 0.7);

  const annualRevenue = estimatedCredits * 2500;

  return (
    <main className="bg-white text-slate-900">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 py-24 text-center">

        <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
          Advanced Carbon Calculator
        </p>

        <h1
          className="text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Estimate Long-Term Carbon Wealth From Agricultural Land
        </h1>

        <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
          Model tree profitability, sustainability growth, and climate
          revenue through advanced agricultural intelligence.
        </p>

      </section>

      {/* Calculator */}
      <section className="max-w-5xl mx-auto px-8 pb-28">

        <div className="rounded-[2rem] bg-slate-50 border border-slate-200 p-12 shadow-sm">

          {/* Inputs */}
          <div className="grid md:grid-cols-2 gap-8">

            <div>
              <label className="block mb-3 font-medium">
                Land Size (Acres)
              </label>

              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 px-5 py-4"
              />
            </div>

            <div>
              <label className="block mb-3 font-medium">
                Tree Type
              </label>

              <select
                value={treeType}
                onChange={(e) => setTreeType(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-5 py-4"
              >
                <option>Teak</option>
                <option>Bamboo</option>
                <option>Neem</option>
                <option>Mango</option>
              </select>
            </div>

            <div>
              <label className="block mb-3 font-medium">
                Region
              </label>

              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-5 py-4"
              >
                <option>India</option>
                <option>Asia</option>
                <option>Africa</option>
                <option>Global</option>
              </select>
            </div>

            <div>
              <label className="block mb-3 font-medium">
                Soil Quality
              </label>

              <select
                value={soilQuality}
                onChange={(e) => setSoilQuality(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-5 py-4"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

          </div>

          {/* Results */}
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-5 gap-6">

            <div className="rounded-3xl bg-white p-6 border border-slate-200">
              <p className="text-sm text-slate-500">
                Annual Credits
              </p>
              <h3 className="text-3xl font-bold mt-3">
                {estimatedCredits}
              </h3>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200">
              <p className="text-sm text-slate-500">
                First Issuance
              </p>
              <h3 className="text-3xl font-bold mt-3">
                {firstIssuance}
              </h3>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200">
              <p className="text-sm text-slate-500">
                Revenue Estimate
              </p>
              <h3 className="text-3xl font-bold mt-3">
                ₹{annualRevenue.toLocaleString()}
              </h3>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200">
              <p className="text-sm text-slate-500">
                Growth Potential
              </p>
              <h3 className="text-3xl font-bold mt-3">
                High
              </h3>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200">
              <p className="text-sm text-slate-500">
                Soil Class
              </p>
              <h3 className="text-3xl font-bold mt-3">
                {soilQuality}
              </h3>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}