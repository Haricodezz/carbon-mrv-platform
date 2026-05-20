export default function CertificatesPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-8 py-28 text-center">

        <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
          Carbon Retirement Certificates
        </p>

        <h1
          className="text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Verified Carbon Retirement Documentation
        </h1>

        <p className="mt-8 text-lg text-slate-600 max-w-3xl mx-auto">
          Secure, auditable, and compliance-grade retirement certificates
          for organizations offsetting emissions responsibly.
        </p>

      </section>

      {/* Certificate Preview */}
      <section className="max-w-7xl mx-auto px-8 pb-28">

        <div className="rounded-[2rem] bg-slate-50 border border-slate-200 shadow-sm p-14">

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-16 text-center">

            <p className="text-green-700 uppercase tracking-[0.3em] font-semibold mb-6">
              Official Retirement Certificate
            </p>

            <h2
              className="text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Carbon Credit Retirement
            </h2>

            <p className="mt-10 text-lg text-slate-600">
              This certifies that verified carbon credits have been permanently
              retired for sustainability and emissions offset purposes.
            </p>

            <div className="mt-14 grid md:grid-cols-3 gap-8 text-left">

              <div>
                <p className="text-sm text-slate-500">Buyer</p>
                <p className="text-xl font-semibold mt-2">
                  Company Name
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Credits Retired</p>
                <p className="text-xl font-semibold mt-2">
                  500 Credits
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Verification ID</p>
                <p className="text-xl font-semibold mt-2">
                  CERT-2026-001
                </p>
              </div>

            </div>

            <div className="mt-16">
              <button className="rounded-full bg-green-700 text-white px-10 py-4 font-semibold hover:bg-green-800 transition">
                Download Certificate
              </button>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}