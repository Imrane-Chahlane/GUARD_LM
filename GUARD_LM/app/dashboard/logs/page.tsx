import { LogsExplorer } from "@/components/logs/LogsExplorer";
import { requireUser } from "@/lib/auth/session";
import { listPromptLogs } from "@/services/logs/logService";
import { listApiKeys } from "@/services/apiKeys/apiKeyService";
import { listNovaRules } from "@/services/nova/ruleService";

export default async function LogsPage() {
  const user = await requireUser();
  const [logs, apiKeys, rules] = await Promise.all([
    listPromptLogs({ user }),
    listApiKeys(user.id),
    listNovaRules(user.id)
  ]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Logs</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Prompt audit trail</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Review processed prompts, triggered rules, actions, and sanitized outputs. 
          Use filters to isolate logs for specific API keys or security policies.
        </p>
      </section>

      <LogsExplorer
        apiKeys={apiKeys}
        rules={rules}
        initialLogs={logs.map((log) => ({
          ...log,
          date: log.date.toISOString()
        }))}
      />
    </div>
  );
}
