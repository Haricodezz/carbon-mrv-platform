"use client";

import { motion } from "framer-motion";
import {
  FaSatellite,
  FaTree,
  FaChartLine,
  FaCertificate,
} from "react-icons/fa";

const features = [
  {
    icon: <FaSatellite className="text-green-700 text-3xl" />,
    title: "Satellite Intelligence",
    description:
      "Advanced NDVI, EVI, biomass, and carbon stock monitoring across multi-satellite layers.",
  },
  {
    icon: <FaTree className="text-green-700 text-3xl" />,
    title: "Tree Profitability",
    description:
      "Estimate land productivity, carbon growth, and long-term tree ROI with precision.",
  },
  {
    icon: <FaChartLine className="text-green-700 text-3xl" />,
    title: "Carbon Marketplace",
    description:
      "Securely trade, retire, and monetize verified carbon credits through escrow systems.",
  },
  {
    icon: <FaCertificate className="text-green-700 text-3xl" />,
    title: "Retirement Certificates",
    description:
      "Generate compliance-grade branded retirement certificates with QR verification.",
  },
];

export default function FeatureSection() {
  return (
    <section className="bg-slate-50 py-28">
      <div className="max-w-7xl mx-auto px-8">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-green-700 font-semibold uppercase tracking-[0.2em] mb-4">
            Platform Capabilities
          </p>

          <h2
            className="text-5xl font-bold text-slate-900"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Climate Finance Infrastructure Built for Scale
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            Integrating AI, remote sensing, ESG markets, and agricultural
            intelligence into one premium ecosystem.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm hover:shadow-xl"
            >
              <div className="mb-6">{feature.icon}</div>

              <h3 className="text-xl font-semibold mb-4">
                {feature.title}
              </h3>

              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}