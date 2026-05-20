export default function TermsPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center">

        <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
          Terms of Service
        </p>

        <h1
          className="text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Platform Rules and Service Conditions
        </h1>

        <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
          By using Carbon MRV, users agree to our operational, financial,
          compliance, and marketplace standards.
        </p>

      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-8 pb-28 space-y-12 text-slate-700 leading-relaxed">

        <div>
          <h2 className="text-3xl font-bold mb-4">
            User Responsibilities
          </h2>

          <p>
            Users must provide accurate registration, land, project,
            and financial information.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Carbon Marketplace
          </h2>

          <p>
            Carbon credit transactions are subject to verification,
            compliance review, and platform governance.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Escrow and Payments
          </h2>

          <p>
            Transactions may be held in escrow until compliance,
            verification, and project legitimacy are confirmed.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Fraud Prevention
          </h2>

          <p>
            Fraudulent activities, false reporting, or compliance violations
            may result in account suspension or legal action.
          </p>
        </div>

      </section>

    </main>
  );
}