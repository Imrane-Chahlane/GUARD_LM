"use client";

import { buttonClasses } from "@/components/ui/Button";
import { useState } from "react";

const staticPlans = [
  {
    name: "Free",
    price: "$0",
    description: "For prototypes and local demos.",
    features: ["1 client workspace", "Mock classifiers", "Basic logs"]
  }
] as const;

const PAYG_PRICING = {
  client: { name: "Bring Your Own Model", rate: "$1.00", per: "1k requests" },
  openai: { name: "OpenAI GPT-5-mini", rate: "$12.00", per: "1k requests" },
  anthropic: { name: "Anthropic Sonnet 3.6", rate: "$18.00", per: "1k requests" },
  google: { name: "Google Gemini 2.5 flash", rate: "$4.00", per: "1k requests" }
};

export function PricingCards({ activePlan }: { activePlan: string }) {
  const [selectedPlan, setSelectedPlan] = useState(activePlan || "Free");
  const [status, setStatus] = useState("");
  const [paygProvider, setPaygProvider] = useState<keyof typeof PAYG_PRICING>("client");

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
    const displayName = planName === "PAYG" ? "Pay As You GO" : planName;
    setStatus(`${displayName} selected. Billing provider integration is ready for implementation.`);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        {staticPlans.map((plan) => (
          <article
            key={plan.name}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-field p-6 transition-all hover:border-mint/30 hover:shadow-[0_0_20px_-12px_rgba(0,186,124,0.3)]"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{plan.name}</h2>
                  <p className="mt-2 text-sm text-cloud/55 leading-snug">{plan.description}</p>
                </div>
                {selectedPlan === plan.name ? (
                  <span className="shrink-0 rounded-full border border-mint/40 bg-mint/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mint">
                    Active
                  </span>
                ) : null}
              </div>

              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-mint">{plan.price}</span>
                {plan.price.startsWith("$") && plan.price !== "$0" ? (
                  <span className="text-sm font-medium text-cloud/40">/mo</span>
                ) : null}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-cloud/70">
                    <svg className="h-4 w-4 text-mint/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => subscribe(plan.name)}
              className={buttonClasses(
                selectedPlan === plan.name ? "secondary" : "primary",
                "mt-8 w-full font-bold transition-all group-hover:scale-[1.02]"
              )}
            >
              {selectedPlan === plan.name ? "Current plan" : "Select Plan"}
            </button>
          </article>
        ))}

        {/* Pay As You Go Plan */}
        <article
          className="group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-mint/20 bg-gradient-to-br from-field to-mint/5 p-6 transition-all hover:border-mint/50 hover:shadow-[0_0_30px_-10px_rgba(0,186,124,0.4)]"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-mint/10 blur-2xl transition-all group-hover:bg-mint/20" />

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Pay As You GO
                  <span className="rounded-md bg-mint/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-mint">New</span>
                </h2>
                <p className="mt-2 text-sm text-cloud/55 leading-snug">Usage-based pricing for any scale.</p>
              </div>
              {selectedPlan === "PAYG" ? (
                <span className="shrink-0 rounded-full border border-mint/40 bg-mint/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mint">
                  Active
                </span>
              ) : null}
            </div>

            <div className="mt-6 rounded-lg bg-ink/40 p-3 ring-1 ring-white/5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-cloud/40">Select Provider</label>
              <select
                value={paygProvider}
                onChange={(e) => setPaygProvider(e.target.value as keyof typeof PAYG_PRICING)}
                className="mt-1 w-full bg-transparent text-sm font-bold text-cloud/90 focus:outline-none"
              >
                {Object.entries(PAYG_PRICING).map(([key, value]) => (
                  <option key={key} value={key} className="bg-ink text-cloud">
                    {value.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-mint">{PAYG_PRICING[paygProvider].rate}</span>
              <span className="text-sm font-medium text-cloud/40">/ {PAYG_PRICING[paygProvider].per}</span>
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2 text-sm text-cloud/70">
                <svg className="h-4 w-4 text-mint/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited API keys
              </li>
              <li className="flex items-center gap-2 text-sm text-cloud/70">
                <svg className="h-4 w-4 text-mint/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Up to 8k tokens per prompt
              </li>
              <li className="flex items-center gap-2 text-sm text-cloud/70">
                <svg className="h-4 w-4 text-mint/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enterprise security rules
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => subscribe("PAYG")}
            className={buttonClasses(
              selectedPlan === "PAYG" ? "secondary" : "primary",
              "mt-8 w-full font-bold transition-all group-hover:scale-[1.02]"
            )}
          >
            {selectedPlan === "PAYG" ? "Current plan" : "Switch to PAYG"}
          </button>
        </article>
      </div>

      {status ? (
        <div className="mt-4 rounded-lg border border-mint/20 bg-mint/5 p-4 text-sm text-mint animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {status}
          </div>
        </div>
      ) : null}
    </div>
  );
}
