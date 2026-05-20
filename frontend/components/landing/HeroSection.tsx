"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-green-50 to-white">
      <div className="max-w-7xl mx-auto px-8 py-28 grid lg:grid-cols-2 gap-20 items-center">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-6">
            Sustainable Carbon Intelligence
          </p>

          <h1
            className="text-6xl leading-tight font-bold text-slate-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Transform Agricultural Land Into Climate Revenue
          </h1>

          <p className="mt-8 text-lg text-slate-600 leading-relaxed max-w-xl">
            AI-powered carbon measurement, satellite verification, and
            ESG-grade marketplace systems designed for modern agricultural
            profitability.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <a
              href="/auth/register"
              className="rounded-full bg-green-700 px-8 py-4 text-white font-semibold shadow-lg hover:bg-green-800 transition"
            >
              Start Earning
            </a>

            <a
              href="/calculator"
              className="rounded-full border border-slate-300 px-8 py-4 font-semibold hover:border-green-700 hover:text-green-700 transition"
            >
              Carbon Calculator
            </a>
          </div>

          <div className="mt-16 flex gap-12 text-sm text-slate-600">
            <div>
              <p className="text-3xl font-bold text-slate-900">10K+</p>
              <p>Farmers Empowered</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-slate-900">AI + GIS</p>
              <p>Precision Verified</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-slate-900">ESG Ready</p>
              <p>Marketplace Scale</p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200">
            <Image
              src="/images/dashboard-preview.png"
              alt="Carbon Dashboard"
              width={900}
              height={700}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Floating Card */}
          <div className="absolute -bottom-8 -left-8 bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
            <p className="text-sm text-slate-500">Projected Annual Revenue</p>
            <p className="text-3xl font-bold text-green-700">₹4.2L+</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}