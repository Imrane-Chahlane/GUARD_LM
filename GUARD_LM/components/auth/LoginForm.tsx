"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

export function LoginForm() {
  const [email, setEmail] = useState("client@guardlm.dev");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Unable to sign in.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-cloud/80" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="flex items-center justify-between text-sm text-cloud/60">
        <Link href="/register" className="text-mint hover:text-leaf">
          Create account
        </Link>
        <span>Forgot password</span>
      </div>
    </form>
  );
}
