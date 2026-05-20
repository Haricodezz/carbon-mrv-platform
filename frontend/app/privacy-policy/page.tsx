export default function PrivacyPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center">

        <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
          Privacy Policy
        </p>

        <h1
          className="text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Your Data, Protected Responsibly
        </h1>

        <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
          Carbon MRV is committed to protecting user data, financial security,
          and sustainability project confidentiality.
        </p>

      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-8 pb-28 space-y-12 text-slate-700 leading-relaxed">

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Information We Collect
          </h2>

          <p>
            We collect account data, land/project data, transaction records,
            carbon verification records, and compliance documentation.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Financial Security
          </h2>

          <p>
            Payment transactions are securely processed through regulated
            third-party gateways such as Razorpay.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Data Usage
          </h2>

          <p>
            User information is used solely for platform operations,
            verification, analytics, and sustainability services.
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Compliance
          </h2>

          <p>
            We comply with relevant sustainability, financial, and data
            protection standards where applicable.
          </p>
        </div>

      </section>

    </main>
  );
}