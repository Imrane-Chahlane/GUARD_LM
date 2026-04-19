import { ModelPanel } from "@/components/models/ModelPanel";
import { requireUser } from "@/lib/auth/session";
import { listAiModels } from "@/services/ai/modelService";

export default async function ModelsPage() {
  const user = await requireUser();
  const models = await listAiModels(user.id);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">AI Infrastructure</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Model connections</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Connect your preferred LLM and Embedding providers. These models power the semantic 
          analysis and AI classification layers of your Nova Rules.
        </p>
      </section>

      <ModelPanel initialModels={models} />
    </div>
  );
}
