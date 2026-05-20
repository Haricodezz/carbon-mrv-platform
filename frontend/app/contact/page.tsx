export default function ContactPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-28 text-center">
        <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-4">
          Contact Us
        </p>

        <h1
          className="text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Let’s Build the Future of Carbon Finance Together
        </h1>

        <p className="mt-8 text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
          Reach out for partnerships, investor opportunities, farmer onboarding,
          or enterprise sustainability collaborations.
        </p>
      </section>

      {/* Contact Grid */}
      <section className="max-w-7xl mx-auto px-8 pb-28 grid lg:grid-cols-2 gap-16">

        {/* Contact Info */}
        <div className="space-y-8">

          <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
            <h3 className="text-2xl font-semibold mb-3">Email</h3>
            <p className="text-slate-600">support@carbonmrv.com</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
            <h3 className="text-2xl font-semibold mb-3">Business Inquiries</h3>
            <p className="text-slate-600">partnerships@carbonmrv.com</p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-8 border border-slate-200">
            <h3 className="text-2xl font-semibold mb-3">Headquarters</h3>
            <p className="text-slate-600">
              Sustainable Climate Finance Innovation Hub
            </p>
          </div>

        </div>

        {/* Contact Form */}
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-10">

          <h2 className="text-3xl font-bold mb-8">
            Send Us a Message
          </h2>

          <form className="space-y-6">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4"
            />

            <textarea
              placeholder="Your Message"
              rows={5}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4"
            />

            <button
              type="submit"
              className="w-full rounded-full bg-green-700 text-white py-4 font-semibold hover:bg-green-800 transition"
            >
              Submit Inquiry
            </button>

          </form>
        </div>

      </section>

    </main>
  );
}