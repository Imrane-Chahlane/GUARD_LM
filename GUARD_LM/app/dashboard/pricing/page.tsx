import { PricingCards } from "@/components/pricing/PricingCards";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function PricingPage() {
  const user = await requireUser();
  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Pricing</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Plans and billing</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Placeholder plans for Free, Pro, and Enterprise subscriptions.
        </p>
      </section>

      <PricingCards activePlan={activeSubscription?.planName || "Free"} />
    </div>
  );
}
