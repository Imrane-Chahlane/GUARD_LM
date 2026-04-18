import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { defaultBlacklistPhrases, defaultRegexRules } from "@/lib/defaultSecurity";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await requireUser();

  if (user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const [users, logCount, subscriptions] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.promptLog.count(),
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            companyName: true,
            email: true
          }
        }
      }
    })
  ]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Admin</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Platform controls</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          View users, inspect platform log volume, and manage placeholder plan and global rule surfaces.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-field p-5">
          <p className="text-sm text-cloud/55">Users</p>
          <p className="mt-3 text-3xl font-black text-mint">{users.length}</p>
        </div>
        <div className="rounded-lg border border-line bg-field p-5">
          <p className="text-sm text-cloud/55">Prompt logs</p>
          <p className="mt-3 text-3xl font-black text-amber">{logCount}</p>
        </div>
        <div className="rounded-lg border border-line bg-field p-5">
          <p className="text-sm text-cloud/55">Default static rules</p>
          <p className="mt-3 text-3xl font-black text-leaf">
            {defaultBlacklistPhrases.length + defaultRegexRules.length}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-field">
        <div className="border-b border-line p-5">
          <h2 className="text-xl font-black">Users</h2>
          <p className="mt-1 text-sm text-cloud/55">Admin visibility across client accounts.</p>
        </div>
        <div className="table-scroll">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-ink text-xs uppercase text-cloud/50">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 text-cloud/80">{item.name}</td>
                  <td className="px-5 py-4 text-cloud/65">{item.companyName}</td>
                  <td className="px-5 py-4 text-cloud/65">{item.email}</td>
                  <td className="px-5 py-4 text-cloud/65">{item.role.toLowerCase()}</td>
                  <td className="px-5 py-4 text-cloud/55">{item.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-line bg-field p-5">
          <h2 className="text-xl font-black">Plans</h2>
          <p className="mt-2 text-sm text-cloud/55">
            Manage plan metadata here when a billing provider is connected.
          </p>
          <div className="mt-5 space-y-3">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded-md border border-line bg-ink p-3">
                <p className="font-semibold">{subscription.planName}</p>
                <p className="mt-1 text-xs text-cloud/55">
                  {subscription.user.companyName} - {subscription.status.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-field p-5">
          <h2 className="text-xl font-black">Global default rules</h2>
          <p className="mt-2 text-sm text-cloud/55">
            New client accounts are seeded from these defaults.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-mint">Blacklist</p>
              <ul className="mt-3 space-y-2 text-sm text-cloud/65">
                {defaultBlacklistPhrases.slice(0, 6).map((phrase) => (
                  <li key={phrase}>- {phrase}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-amber">Regex</p>
              <ul className="mt-3 space-y-2 text-sm text-cloud/65">
                {defaultRegexRules.map((rule) => (
                  <li key={rule.pattern}>- {rule.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
