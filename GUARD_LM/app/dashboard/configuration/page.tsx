import { NovaRuleManager } from "@/components/config/NovaRuleManager";
import { requireUser } from "@/lib/auth/session";
import { listNovaRules } from "@/services/nova/ruleService";

export default async function ConfigurationPage() {
  const user = await requireUser();
  const rules = await listNovaRules(user.id);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Configuration</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Security rules</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Define multiple security rules using keywords, semantic analysis, and AI classifiers. 
          Link these rules to specific API keys to control protection levels across environments.
        </p>
      </section>

      <NovaRuleManager initialRules={rules} />
    </div>
  );
}
