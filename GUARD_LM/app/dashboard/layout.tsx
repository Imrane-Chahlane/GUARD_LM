import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <DashboardShell
      user={{
        name: user.name,
        companyName: user.companyName,
        email: user.email,
        role: user.role
      }}
    >
      {children}
    </DashboardShell>
  );
}
