'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading dashboard...</div>;
  }

  if (!user) {
    // Rely on individual page's useAuthGuard for redirection
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  // Derive an appropriate title based on the path
  let title = "Dashboard";
  if (pathname.includes('/projects/create')) title = "Submit New Project";
  else if (pathname.includes('/farmer/projects')) title = "My Carbon Projects";
  else if (pathname.includes('/farmer')) title = "Farmer Dashboard";
  else if (pathname.includes('/auditor/verification-requests')) title = "Verification Workspace";
  else if (pathname.includes('/auditor/compliance-reports')) title = "Compliance Review";
  else if (pathname.includes('/auditor')) title = "Audit Control Center";
  else if (pathname.includes('/admin/projects')) title = "Platform Projects";
  else if (pathname.includes('/admin/blog')) title = "Blog CMS Manager";
  else if (pathname.includes('/admin')) title = "Admin Dashboard";
  else if (pathname.includes('/company/wallet')) title = "Company Wallet";
  else if (pathname.includes('/company/certificates')) title = "Retirement Certificates";
  else if (pathname.includes('/company')) title = "Company Dashboard";
  else if (pathname.includes('/ngo')) title = "NGO Dashboard";
  else if (pathname.includes('/analytics')) title = "Carbon MRV Analytics Center";
  else if (pathname.includes('/purchases')) title = "Carbon Credit Portfolio";
  else if (pathname.includes('/portfolio')) title = "ESG Portfolio Dashboard";
  else if (pathname.includes('/transactions')) title = "Blockchain Transaction Ledger";
  else if (pathname.includes('/projects/')) title = "Project Details";
  else if (pathname.includes('/projects')) title = user.role === 'auditor' ? "Field Reviews" : "My Projects";
  else if (pathname.includes('/wallet')) title = "Wallet";

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Persistent Sidebar */}
      <DashboardSidebar role={user.role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Persistent Header */}
        <DashboardHeader title={title} userName={user.full_name || 'User'} role={user.role} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
