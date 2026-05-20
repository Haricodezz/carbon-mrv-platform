export function getDashboardRoute(role: string): string {
  switch (role) {
    case "farmer":
      return "/dashboard/farmer";

    case "ngo":
    case "nco":
      return "/dashboard/ngo";

    case "company":
      return "/dashboard/company";

    case "auditor":
      return "/dashboard/auditor";

    case "admin":
      return "/dashboard/admin";

    default:
      return "/auth/login";
  }
}