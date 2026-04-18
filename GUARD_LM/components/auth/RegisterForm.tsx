"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

export function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Unable to create account.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-cloud/80" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none transition focus:border-mint"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-cloud/80" htmlFor="companyName">
          Company name
        </label>
        <input
          id="companyName"
          value={form.companyName}
          onChange={(event) => update("companyName", event.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none transition focus:border-mint"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-cloud/80" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none transition focus:border-mint"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-cloud/80" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none transition focus:border-mint"
          required
        />
      </div>

      {error ? (
        <div className="rounded-md border border-ember/50 bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading} className={buttonClasses("primary", "w-full")}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-cloud/60">
        Already registered?{" "}
        <Link href="/login" className="text-mint hover:text-leaf">
          Sign in
        </Link>
      </p>
    </form>
  );
}
