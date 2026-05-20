"use client";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface DashboardShellProps {
  role: string;
  title: string;
  userName: string;
  children: React.ReactNode;
}

export default function DashboardShell({
  role,
  title,
  userName,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <DashboardSidebar role={role} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <DashboardHeader title={title} userName={userName} />

        {/* Page Content */}
        <main className="flex-1 p-10">
          {children}
        </main>

      </div>
    </div>
  );
}