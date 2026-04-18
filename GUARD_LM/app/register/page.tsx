import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-ink px-5 py-10 text-cloud">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        <section>
          <Link href="/" className="text-sm font-black uppercase text-mint">
            Guard_LM
          </Link>
          <h1 className="mt-8 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            Add prompt injection defense without rebuilding your chatbot.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cloud/68">
            Create a client workspace, receive API keys, and configure static, semantic,
            and LLM-based guardrails for your application.
          </p>
        </section>

        <section className="rounded-lg border border-line bg-field p-6 shadow-guard sm:p-8">
          <h2 className="text-2xl font-black">Create client account</h2>
          <p className="mt-2 text-sm text-cloud/60">Start with default security rules.</p>
          <div className="mt-8">
            <RegisterForm />
          </div>
        </section>
      </div>
    </main>
  );
}
