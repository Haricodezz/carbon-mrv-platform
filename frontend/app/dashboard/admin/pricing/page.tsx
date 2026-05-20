// DashboardShell is now provided by the global layout

export default function AdminPricingDashboard() {
  return (
    <>

      {/* Pricing Summary */}
      <div className="grid md:grid-cols-4 gap-8">

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Base Price / Credit</p>
          <h3 className="text-4xl font-bold mt-3">
            ₹2,500
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Platform Commission</p>
          <h3 className="text-4xl font-bold mt-3">
            8%
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Escrow Fee</p>
          <h3 className="text-4xl font-bold mt-3">
            2%
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Regional Multiplier</p>
          <h3 className="text-4xl font-bold mt-3">
            1.0x
          </h3>
        </div>

      </div>

      {/* Pricing Controls */}
      <div className="mt-12 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-10">

        <h2 className="text-3xl font-bold mb-8">
          Update Pricing Parameters
        </h2>

        <form className="grid md:grid-cols-2 gap-8">

          <div>
            <label className="block mb-3 font-medium">
              Base Credit Price
            </label>

            <input
              type="number"
              defaultValue={2500}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4"
            />
          </div>

          <div>
            <label className="block mb-3 font-medium">
              Platform Commission (%)
            </label>

            <input
              type="number"
              defaultValue={8}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4"
            />
          </div>

          <div>
            <label className="block mb-3 font-medium">
              Escrow Fee (%)
            </label>

            <input
              type="number"
              defaultValue={2}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4"
            />
          </div>

          <div>
            <label className="block mb-3 font-medium">
              Regional Multiplier
            </label>

            <input
              type="number"
              defaultValue={1}
              step="0.1"
              className="w-full rounded-2xl border border-slate-300 px-5 py-4"
            />
          </div>

          <button
            type="submit"
            className="md:col-span-2 rounded-full bg-green-700 text-white py-4 font-semibold hover:bg-green-800 transition"
          >
            Save Pricing Configuration
          </button>

        </form>

      </div>

    </>
  );
}