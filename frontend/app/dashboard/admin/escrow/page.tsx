// DashboardShell is now provided by the global layout

export default function AdminEscrowDashboard() {
  const escrowTransactions = [
    {
      id: "ESC-001",
      buyer: "EcoCorp Ltd",
      seller: "Rajesh Farmer",
      amount: "₹120,000",
      status: "Held",
    },
    {
      id: "ESC-002",
      buyer: "GreenFuture Inc",
      seller: "Green Earth NGO",
      amount: "₹300,000",
      status: "Released",
    },
  ];

  return (
    <>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-8">

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Held Funds</p>
          <h3 className="text-4xl font-bold mt-3">
            ₹120,000
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Released Funds</p>
          <h3 className="text-4xl font-bold mt-3">
            ₹300,000
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Pending Verification</p>
          <h3 className="text-4xl font-bold mt-3">
            1
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Fraud Flags</p>
          <h3 className="text-4xl font-bold mt-3">
            0
          </h3>
        </div>

      </div>

      {/* Escrow Transactions */}
      <div className="mt-12 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-10">

        <h2 className="text-3xl font-bold mb-8">
          Escrow Transactions
        </h2>

        <div className="space-y-6">

          {escrowTransactions.map((tx, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-200 p-6 flex flex-col lg:flex-row justify-between items-center"
            >

              <div>
                <p className="text-xl font-semibold">
                  {tx.id}
                </p>

                <p className="text-slate-600 mt-2">
                  Buyer: {tx.buyer}
                </p>

                <p className="text-slate-600">
                  Seller: {tx.seller}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-4 lg:mt-0">

                <p className="font-bold text-lg">
                  {tx.amount}
                </p>

                <span className="rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
                  {tx.status}
                </span>

                <button className="rounded-full bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 transition">
                  Manage
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </>
  );
}