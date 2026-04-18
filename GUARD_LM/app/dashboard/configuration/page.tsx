import { ConfigForm } from "@/components/config/ConfigForm";
import { requireUser } from "@/lib/auth/session";
import { getClientSecurityBundle } from "@/services/analysis/pipeline";

export default async function ConfigurationPage() {
  const user = await requireUser();
  const config = await getClientSecurityBundle(user.id);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Configuration</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Security rules</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Tune phrase matching, regex patterns, semantic references, classifier usage, and
          malicious prompt handling.
        </p>
      </section>

      <ConfigForm initialConfig={config} />
    </div>
  );
}
