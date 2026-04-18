import { Prisma, PromptStatus, Role } from "@prisma/client";
import Link from "next/link";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MiniBarChart } from "@/components/dashboard/MiniBarChart";
import { RecentLogsTable } from "@/components/dashboard/RecentLogsTable";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { actionTakenToApi, promptStatusToApi } from "@/utils/enums";
import type { LayerName } from "@/types/analysis";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

export default async function DashboardPage() {
  const user = await requireUser();
  const where: Prisma.PromptLogWhereInput = user.role === Role.ADMIN ? {} : { userId: user.id };
  const today = startOfToday();

  const [total, malicious, sanitized, apiCallsToday, recentLogs, sevenDayLogs] =
    await Promise.all([
      prisma.promptLog.count({ where }),
      prisma.promptLog.count({ where: { ...where, finalStatus: PromptStatus.MALICIOUS } }),
      prisma.promptLog.count({ where: { ...where, finalStatus: PromptStatus.SANITIZED } }),
      prisma.promptLog.count({ where: { ...where, createdAt: { gte: today } } }),
      prisma.promptLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 8
      }),
      prisma.promptLog.findMany({
        where: {
          ...where,
          createdAt: { gte: lastSevenDays()[0] }
        },
        select: { createdAt: true }
      })
    ]);

  const chartData = lastSevenDays().map((date) => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      value: sevenDayLogs.filter((log) => log.createdAt >= date && log.createdAt < next).length
    };
  });

  const quickLinks = [
    { href: "/dashboard/configuration", label: "Configuration" },
    { href: "/dashboard/api-keys", label: "API keys" },
    { href: "/dashboard/logs", label: "Logs" },
    { href: "/dashboard/pricing", label: "Billing" }
  ];

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Prompt security overview</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Monitor prompt volume, malicious detections, sanitization activity, and daily API usage.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total prompts analyzed" value={total} detail="All-time processed prompts" />
        <MetricCard
          label="Malicious prompts blocked"
          value={malicious}
          detail="Rejected by configured rules"
          tone="ember"
        />
        <MetricCard
          label="Sanitized prompts"
          value={sanitized}
          detail="Rewritten before forwarding"
          tone="amber"
        />
        <MetricCard
          label="API calls today"
          value={apiCallsToday}
          detail="Since local midnight"
          tone="leaf"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MiniBarChart data={chartData} />
        <div className="rounded-lg border border-line bg-field p-5">
          <p className="text-sm font-semibold text-cloud/60">Quick links</p>
          <h2 className="mt-2 text-xl font-black">Operate Guard_LM</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-line bg-ink px-4 py-4 font-semibold text-cloud/75 transition hover:border-mint hover:text-mint"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RecentLogsTable
        logs={recentLogs.map((log) => ({
          id: log.id,
          createdAt: log.createdAt,
          originalPrompt: log.originalPrompt,
          finalStatus: promptStatusToApi(log.finalStatus),
          actionTaken: actionTakenToApi(log.actionTaken),
          triggeredLayers: Array.isArray(log.triggeredLayers)
            ? (log.triggeredLayers as LayerName[])
            : []
        }))}
      />
    </div>
  );
}
