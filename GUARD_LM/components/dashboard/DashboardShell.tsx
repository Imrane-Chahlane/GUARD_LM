"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

const baseNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/configuration", label: "Configuration" },
  { href: "/dashboard/api-keys", label: "API keys" },
  { href: "/dashboard/logs", label: "Logs" },
  { href: "/dashboard/pricing", label: "Pricing" },
  { href: "/dashboard/profile", label: "Profile" }
];

export function DashboardShell({
  children,
  user
}: {
  children: React.ReactNode;
  user: {
    name: string;
    companyName: string;
    email: string;
    role: string;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems =
    user.role === "ADMIN"
      ? [...baseNavItems, { href: "/dashboard/admin", label: "Admin" }]
      : baseNavItems;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink text-cloud">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-field/95 p-6 lg:block">
        <Link href="/dashboard" className="block">
          <p className="text-xs font-bold uppercase text-mint">Guard_LM</p>
          <h1 className="mt-2 text-2xl font-black">Security Console</h1>
        </Link>

        <div className="mt-8 rounded-lg border border-line bg-ink/60 p-4">
          <p className="text-sm font-semibold">{user.companyName}</p>
          <p className="mt-1 break-all text-xs text-cloud/55">{user.email}</p>
          <p className="mt-3 text-xs uppercase text-mint">{user.role.toLowerCase()}</p>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md border px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "border-mint bg-mint/10 text-mint"
                    : "border-transparent text-cloud/70 hover:border-line hover:bg-ink/70 hover:text-cloud"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="absolute bottom-6 left-6 right-6 rounded-md border border-line px-4 py-3 text-sm font-semibold text-cloud/70 transition hover:border-ember hover:text-ember"
        >
          Sign out
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-ink/90 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="text-sm font-black uppercase text-mint">
              Guard_LM
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-line px-3 py-2 text-xs font-semibold"
            >
              Sign out
            </button>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold",
                  pathname === item.href
                    ? "border-mint bg-mint/10 text-mint"
                    : "border-line text-cloud/65"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="px-5 py-6 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
