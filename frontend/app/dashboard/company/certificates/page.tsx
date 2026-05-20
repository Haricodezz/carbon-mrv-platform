// DashboardShell is now provided by the global layout

export default function CompanyCertificatesDashboard() {
  const certificates = [
    {
      id: "CERT-2026-001",
      credits: 500,
      date: "2026-04-12",
      status: "Retired",
    },
    {
      id: "CERT-2026-002",
      credits: 320,
      date: "2026-05-01",
      status: "Retired",
    },
  ];

  return (
    <>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-8">

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Certificates Issued</p>
          <h3 className="text-4xl font-bold mt-3">
            {certificates.length}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total Credits Retired</p>
          <h3 className="text-4xl font-bold mt-3">
            820
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Compliance Status</p>
          <h3 className="text-4xl font-bold mt-3">
            Verified
          </h3>
        </div>

      </div>

      {/* Certificates Table */}
      <div className="mt-12 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-10">

        <h2 className="text-3xl font-bold mb-8">
          Downloadable Certificates
        </h2>

        <div className="space-y-6">

          {certificates.map((cert, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center justify-between rounded-3xl border border-slate-200 p-6"
            >

              <div>
                <p className="font-semibold text-lg">
                  {cert.id}
                </p>

                <p className="text-slate-600 mt-2">
                  {cert.credits} Credits • {cert.date}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0">

                <span className="rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
                  {cert.status}
                </span>

                <button className="rounded-full bg-green-700 text-white px-6 py-3 font-semibold hover:bg-green-800 transition">
                  Download
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </>
  );
}