"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function TrustSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">

        {/* LEFT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200">
            <Image
              src="/images/farmer-land.jpg"
              alt="Farmer Land"
              width={900}
              height={700}
              className="w-full h-auto"
            />
          </div>

          {/* Floating Badge */}
          <div className="absolute -bottom-8 right-8 bg-white rounded-3xl shadow-xl px-8 py-5 border border-slate-200">
            <p className="text-sm text-slate-500">Carbon Profitability</p>
            <p className="text-2xl font-bold text-green-700">
              High Yield Region
            </p>
          </div>
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-green-700 font-semibold uppercase tracking-[0.2em] mb-4">
            Trusted Carbon Infrastructure
          </p>

          <h2
            className="text-5xl font-bold text-slate-900 leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Built for Sustainable Agriculture and Enterprise Carbon Markets
          </h2>

          <p className="mt-8 text-lg text-slate-600 leading-relaxed">
            Empowering landowners, enterprises, and investors through
            precision carbon intelligence, financial security, and climate
            innovation.
          </p>

          {/* Bullet Points */}
          <div className="mt-10 space-y-5 text-slate-700">
            <p>✔ AI-powered carbon estimation systems</p>
            <p>✔ Google Earth Engine satellite analytics</p>
            <p>✔ Secure Razorpay + escrow financial layer</p>
            <p>✔ Verified retirement certification ecosystem</p>
            <p>✔ Long-term agricultural ROI optimization</p>
          </div>

          {/* Metrics */}
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
              <p className="text-3xl font-bold text-green-700">98%</p>
              <p className="text-sm text-slate-600 mt-2">
                Prediction Confidence
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
              <p className="text-3xl font-bold text-green-700">24/7</p>
              <p className="text-sm text-slate-600 mt-2">
                Marketplace Access
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}