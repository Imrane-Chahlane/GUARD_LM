import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-ink px-5 py-10 text-cloud">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <section>
          <Link href="/" className="text-sm font-black uppercase text-mint">
            Guard_LM
          </Link>
          <h1 className="mt-8 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            Control every prompt before it reaches your assistant.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cloud/68">
            Sign in to configure security layers, manage API keys, review blocked prompt
            injection attempts, and tune your client policy.
          </p>
        </section>

        <section className="rounded-lg border border-line bg-field p-6 shadow-guard sm:p-8">
          <h2 className="text-2xl font-black">Sign in</h2>
          <p className="mt-2 text-sm text-cloud/60">Demo credentials are prefilled after seeding.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
