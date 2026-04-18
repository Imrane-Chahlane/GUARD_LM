import { ButtonLink } from "@/components/ui/Button";

const features = [
  {
    title: "Static pattern defense",
    body: "Blacklist phrases and regex rules catch direct prompt injection attempts before they touch your model."
  },
  {
    title: "Semantic similarity",
    body: "Known malicious examples become reference signals for prompts that use different wording with the same intent."
  },
  {
    title: "LLM classification",
    body: "A structured classifier layer evaluates client-specific rules and returns a clear malicious or safe decision."
  }
];

const workflow = [
  "End user sends a prompt to your app.",
  "Your app calls Guard_LM with the client API key.",
  "Static, semantic, and LLM layers analyze the prompt.",
  "Safe prompts are forwarded. Malicious prompts are rejected, sanitized, or rejected with a reason."
];

export default function LandingPage() {
  return (
    <main className="bg-ink text-cloud">
      <header className="fixed left-0 right-0 top-0 z-20 border-b border-white/10 bg-ink/70 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#" className="text-sm font-black uppercase text-mint">
            Guard_LM
          </a>
          <nav className="hidden items-center gap-6 text-sm text-cloud/70 md:flex">
            <a href="#features" className="hover:text-mint">
              Features
            </a>
            <a href="#workflow" className="hover:text-mint">
              Workflow
            </a>
            <a href="#pricing" className="hover:text-mint">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="secondary" className="hidden sm:inline-flex">
              Login
            </ButtonLink>
            <ButtonLink href="/register">Sign up</ButtonLink>
          </div>
        </div>
      </header>

      <section className="hero-image min-h-[82vh] px-5 pb-16 pt-32">
        <div className="mx-auto flex max-w-7xl flex-col justify-center">
          <p className="text-sm font-bold uppercase text-mint">Middleware security for AI apps</p>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Stop prompt injection before it reaches your chatbot.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cloud/75">
            Guard_LM sits between users and chatbots, analyzes each prompt with three
            security layers, and enforces the action your team chooses.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/register">Buy service</ButtonLink>
            <ButtonLink href="/login" variant="secondary">
              Open dashboard
            </ButtonLink>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-line bg-cloud px-5 py-20 text-ink">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase text-ink/55">Features</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">
              Three layers, one clear verdict.
            </h2>
            <p className="text-lg leading-8 text-ink/65">
              Each client configures rules, thresholds, and response behavior. If any layer
              flags the prompt, Guard_LM treats it as malicious and records the decision.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-lg border border-ink/10 bg-white p-6">
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-4 leading-7 text-ink/65">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-t border-line bg-ink px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase text-mint">Security workflow</p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                Built for teams that ship chatbot features.
              </h2>
              <p className="mt-5 leading-8 text-cloud/68">
                Use one API endpoint to analyze prompts, enforce configured actions, and keep
                a clean audit trail for developers, companies, and platform owners.
              </p>
            </div>

            <ol className="grid gap-4">
              {workflow.map((item, index) => (
                <li key={item} className="rounded-lg border border-line bg-field p-5">
                  <span className="text-sm font-black text-amber">0{index + 1}</span>
                  <p className="mt-2 text-lg font-semibold">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-line bg-field px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-black uppercase text-mint">Pricing teaser</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Start free, scale by traffic.</h2>
            <p className="mt-5 max-w-xl leading-8 text-cloud/68">
              Free, Pro, and Enterprise plans are scaffolded with subscription placeholders
              ready for a billing provider.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {["Free", "Pro", "Enterprise"].map((plan) => (
              <div key={plan} className="rounded-lg border border-line bg-ink p-5">
                <h3 className="font-black">{plan}</h3>
                <p className="mt-3 text-sm text-cloud/60">Usage-based controls</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
