import { LogsExplorer } from "@/components/logs/LogsExplorer";
import { requireUser } from "@/lib/auth/session";
import { listPromptLogs } from "@/services/logs/logService";

export default async function LogsPage() {
  const user = await requireUser();
  const logs = await listPromptLogs({ user });

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Logs</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Prompt audit trail</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Review processed prompts, triggered layers, actions, and sanitized outputs.
        </p>
      </section>

      <LogsExplorer
        initialLogs={logs.map((log) => ({
          ...log,
          date: log.date.toISOString()
        }))}
      />
    </div>
  );
}
