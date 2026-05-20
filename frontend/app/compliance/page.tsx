export default function CompliancePage() {
  return (
    <main className="bg-white text-slate-900">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center">

        <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
          Compliance & Governance
        </p>

        <h1
          className="text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Verified Climate Integrity Standards
        </h1>

        <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
          Carbon MRV ensures secure, auditable, and compliance-driven
          sustainability verification through scientific monitoring,
          financial governance, and retirement certification.
        </p>

      </section>

      {/* Standards */}
      <section className="max-w-7xl mx-auto px-8 pb-28">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
            <h3 className="text-2xl font-bold mb-4">
              Auditor Verification
            </h3>

            <p className="text-slate-600">
              Independent verification workflows ensure project legitimacy.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
            <h3 className="text-2xl font-bold mb-4">
              Satellite Monitoring
            </h3>

            <p className="text-slate-600">
              Remote sensing systems validate biomass and carbon claims.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
            <h3 className="text-2xl font-bold mb-4">
              Escrow Security
            </h3>

            <p className="text-slate-600">
              Transactional integrity protects buyers and project owners.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
            <h3 className="text-2xl font-bold mb-4">
              Retirement Certification
            </h3>

            <p className="text-slate-600">
              Official retirement certificates provide accountability.
            </p>
          </div>

        </div>

        {/* Governance */}
        <div className="mt-20 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-12">

          <h2
            className="text-4xl font-bold mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Governance Framework
          </h2>

          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">

            <p>
              ✔ Multi-role governance including Admin, Auditor, Farmer, NGO,
              and Company stakeholders.
            </p>

            <p>
              ✔ KYC verification for financial and project security.
            </p>

            <p>
              ✔ Fraud monitoring systems for marketplace integrity.
            </p>

            <p>
              ✔ Secure payments through regulated gateways.
            </p>

            <p>
              ✔ Transparent carbon lifecycle management.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}