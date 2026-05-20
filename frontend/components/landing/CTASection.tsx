"use client";

import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-32 bg-gradient-to-br from-green-700 via-emerald-700 to-green-900 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-8 text-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="uppercase tracking-[0.25em] text-green-200 font-semibold mb-6">
            Join the Climate Economy
          </p>

          <h2
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Start Monetizing Land Through Verified Carbon Intelligence
          </h2>

          <p className="mt-8 text-lg text-green-100 max-w-3xl mx-auto leading-relaxed">
            Build long-term agricultural profitability, access carbon
            marketplaces, and unlock enterprise-grade sustainability revenue.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <a
              href="/auth/register"
              className="rounded-full bg-white text-green-800 px-8 py-4 font-semibold shadow-xl hover:bg-green-50 transition"
            >
              Get Started
            </a>

            <a
              href="/marketplace"
              className="rounded-full border border-white px-8 py-4 font-semibold hover:bg-white/10 transition"
            >
              Explore Marketplace
            </a>
          </div>
        </motion.div>

      </div>

      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl"></div>
    </section>
  );
}