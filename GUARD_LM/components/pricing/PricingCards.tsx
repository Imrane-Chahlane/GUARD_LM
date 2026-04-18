"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For prototypes and local demos.",
    features: ["1 client workspace", "Mock classifiers", "Basic logs"]
  },
  {
    name: "Pro",
    price: "$49",
    description: "For shipped chatbot products.",
    features: ["Higher API volume", "Configurable policies", "Semantic references"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For platform owners and regulated teams.",
    features: ["Admin visibility", "Custom providers", "Billing integration ready"]
  }
] as const;

export function PricingCards({ activePlan }: { activePlan: string }) {
  const [selectedPlan, setSelectedPlan] = useState(activePlan || "Free");
  const [status, setStatus] = useState("");

  async function subscribe(planName: string) {
    setStatus("");
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planName })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus(payload?.error || "Subscription could not be updated.");
      return;
    }

    setSelectedPlan(planName);
    setStatus(`${planName} selected. Billing provider integration is ready for implementation.`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="rounded-lg border border-line bg-field p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{plan.name}</h2>
                <p className="mt-2 text-sm text-cloud/55">{plan.description}</p>
              </div>
              {selectedPlan === plan.name ? (
                <span className="rounded-md border border-mint/40 bg-mint/10 px-2 py-1 text-xs font-bold uppercase text-mint">
                  Active
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-3xl font-black text-mint">
              {plan.price}
              {plan.price.startsWith("$") ? <span className="text-sm text-cloud/50"> /mo</span> : null}
            </p>

            <ul className="mt-6 space-y-3 text-sm text-cloud/70">
              {plan.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => subscribe(plan.name)}
              className={buttonClasses(selectedPlan === plan.name ? "secondary" : "primary", "mt-6 w-full")}
            >
              {selectedPlan === plan.name ? "Current plan" : "Subscribe"}
            </button>
          </article>
        ))}
      </div>

      {status ? (
        <div className="rounded-lg border border-line bg-field p-4 text-sm text-cloud/70">{status}</div>
      ) : null}

      <section className="rounded-lg border border-line bg-field p-5">
        <h2 className="text-xl font-black">Billing UI placeholder</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-cloud/60">
          Connect Stripe, Paddle, or your preferred billing provider here. The subscription
          table and route are already scaffolded for plan changes and billing status.
        </p>
      </section>
    </div>
  );
}
