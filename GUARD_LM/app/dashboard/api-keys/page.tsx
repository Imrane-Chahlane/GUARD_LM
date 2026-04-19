import { ApiKeyPanel } from "@/components/apiKeys/ApiKeyPanel";
import { requireUser } from "@/lib/auth/session";
import { listApiKeys } from "@/services/apiKeys/apiKeyService";
import { listNovaRules } from "@/services/nova/ruleService";

export default async function ApiKeysPage() {
  const user = await requireUser();
  const [apiKeys, rules] = await Promise.all([
    listApiKeys(user.id),
    listNovaRules(user.id)
  ]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">API keys</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Middleware access</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Generate, revoke, and use API keys for your Guard_LM prompt analysis endpoint. 
          Each key can be associated with specific Nova security rules.
        </p>
      </section>

      <ApiKeyPanel
        availableRules={rules}
        initialApiKeys={apiKeys.map((key) => ({
          ...key,
          createdAt: key.createdAt.toISOString(),
          revokedAt: key.revokedAt ? key.revokedAt.toISOString() : null
        }))}
      />
    </div>
  );
}
