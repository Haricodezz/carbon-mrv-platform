export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-8 py-28 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div>
          <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-6">
            About Carbon MRV
          </p>

          <h1
            className="text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Building Climate Wealth Through Verified Sustainability
          </h1>

          <p className="mt-8 text-lg text-slate-600 leading-relaxed">
            Carbon MRV empowers farmers, NGOs, auditors, and companies
            through AI-powered carbon verification, satellite intelligence,
            secure marketplaces, and sustainable economic opportunity.
          </p>
        </div>

        {/* Right */}
        <div>
          <img
            src="/images/farmer-land.jpg"
            alt="Carbon MRV Mission"
            className="rounded-[2rem] shadow-2xl object-cover w-full h-[500px]"
          />
        </div>

      </section>

      {/* MISSION */}
      <section className="bg-slate-50 py-28">
        <div className="max-w-7xl mx-auto px-8">

          <div className="text-center max-w-4xl mx-auto mb-20">
            <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
              Our Mission
            </p>

            <h2
              className="text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Transforming Agricultural Land Into Global Climate Assets
            </h2>

            <p className="mt-8 text-lg text-slate-600">
              We bridge agriculture, sustainability, financial inclusion,
              and enterprise carbon markets into one integrated platform.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            <div className="rounded-3xl bg-white p-8 border border-slate-200">
              <h3 className="text-2xl font-bold mb-4">
                AI Verification
              </h3>
              <p className="text-slate-600">
                Precision biomass and carbon estimation powered by ML and
                satellite systems.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 border border-slate-200">
              <h3 className="text-2xl font-bold mb-4">
                Financial Inclusion
              </h3>
              <p className="text-slate-600">
                Empowering rural landowners with new carbon revenue streams.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 border border-slate-200">
              <h3 className="text-2xl font-bold mb-4">
                Marketplace Access
              </h3>
              <p className="text-slate-600">
                Connecting verified projects with global offset buyers.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 border border-slate-200">
              <h3 className="text-2xl font-bold mb-4">
                Compliance
              </h3>
              <p className="text-slate-600">
                Auditor-backed governance and retirement certification.
              </p>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}