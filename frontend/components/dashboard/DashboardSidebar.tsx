"use client";

import Link from "next/link";

interface DashboardSidebarProps {
  role: string;
}

const MENU_ROUTES: Record<string, Record<string, string>> = {
  farmer: {
    Overview: "/dashboard/farmer",
    "My Lands": "/dashboard/farmer/projects",
    "KYC Verification": "/dashboard/kyc",
    "Carbon Calculator": "/calculator",
    "Credit Generation": "/dashboard/projects/create",
    Wallet: "/wallet",
    "Education Blog": "/blog",
  },
  nco: {
    Overview: "/dashboard/ngo",
    Projects: "/dashboard/projects",
    "KYC Verification": "/dashboard/kyc",
    "Carbon Calculator": "/calculator",
    "Credit Generation": "/dashboard/projects/create",
    Wallet: "/wallet",
    Reports: "/dashboard/analytics",
  },
  ngo: {
    Overview: "/dashboard/ngo",
    Projects: "/dashboard/projects",
    "KYC Verification": "/dashboard/kyc",
    "Carbon Calculator": "/calculator",
    "Credit Generation": "/dashboard/projects/create",
    Wallet: "/wallet",
    Reports: "/dashboard/analytics",
  },
  company: {
    Overview: "/dashboard/company",
    Marketplace: "/marketplace",
    "Purchased Credits": "/dashboard/purchases",
    "Retirement Certificates": "/dashboard/company/certificates",
    Wallet: "/dashboard/company/wallet",
    "ESG Reports": "/dashboard/portfolio",
  },
  auditor: {
    Overview: "/dashboard/auditor",
    "Verification Center": "/dashboard/auditor/verifications",
    "KYC & Land Reviews": "/dashboard/auditor/verification-requests",
    "Compliance Reports": "/dashboard/auditor/compliance-reports",
    "Field Reviews": "/dashboard/projects",
  },
  admin: {
    Overview: "/dashboard/admin",
    Users: "/dashboard/admin/users",
    "Project Governance": "/dashboard/admin/projects",
    "Issuance Queue": "/dashboard/admin/issuance",
    Marketplace: "/dashboard/admin/marketplace",
    "Treasury Control": "/dashboard/admin/mint",
    "Fraud Monitoring": "/dashboard/admin/fraud",
    Certificates: "/dashboard/certificates",
    "Blog CMS": "/dashboard/admin/blog",
    Settings: "/dashboard/admin/settings",
    Analytics: "/dashboard/analytics",
  },
};

const MENU_ITEMS: Record<string, string[]> = {
  farmer: [
    "Overview",
    "My Lands",
    "KYC Verification",
    "Carbon Calculator",
    "Credit Generation",
    "Wallet",
    "Education Blog",
    "Settings",
  ],
  ngo: [
    "Overview",
    "Projects",
    "KYC Verification",
    "Carbon Calculator",
    "Credit Generation",
    "Wallet",
    "Reports",
    "Settings",
  ],
  nco: [
    "Overview",
    "Projects",
    "KYC Verification",
    "Carbon Calculator",
    "Credit Generation",
    "Wallet",
    "Reports",
    "Settings",
  ],
  company: [
    "Overview",
    "Marketplace",
    "Purchased Credits",
    "Retirement Certificates",
    "Wallet",
    "ESG Reports",
    "Settings",
  ],
  auditor: [
    "Overview",
    "Verification Center",
    "KYC & Land Reviews",
    "Compliance Reports",
    "Field Reviews",
    "Settings",
  ],
  admin: [
    "Overview",
    "Users",
    "Project Governance",
    "Issuance Queue",
    "Marketplace",
    "Treasury Control",
    "Fraud Monitoring",
    "Certificates",
    "Blog CMS",
    "Settings",
    "Analytics",
  ],
};

export default function DashboardSidebar({
  role,
}: DashboardSidebarProps) {
  const routes = MENU_ROUTES[role] ?? {};
  const items = MENU_ITEMS[role] ?? [];

  return (
    <aside className="w-72 min-h-screen bg-slate-950 text-white p-8">
      <div
        className="text-3xl font-bold text-green-400 mb-12"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        Carbon MRV
      </div>

      <div className="mb-8 text-sm uppercase tracking-[0.2em] text-slate-400">
        {role} Dashboard
      </div>

      <nav className="space-y-3">
        {items.map((item) => {
          const href = routes[item];
          const className =
            "block rounded-2xl px-4 py-3 text-slate-300 hover:bg-green-700 hover:text-white transition";

          if (!href) {
            return (
              <span
                key={item}
                className={`${className} cursor-default opacity-60`}
                title="Coming soon"
              >
                {item}
              </span>
            );
          }

          return (
            <Link key={item} href={href} className={className}>
              {item}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
