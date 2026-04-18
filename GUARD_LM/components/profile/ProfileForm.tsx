"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

export function ProfileForm({
  user
}: {
  user: {
    name: string;
    companyName: string;
    email: string;
    role: string;
  };
}) {
  const [name, setName] = useState(user.name);
  const [companyName, setCompanyName] = useState(user.companyName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        companyName,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      })
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus(payload?.error || "Profile could not be saved.");
      setLoading(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setStatus("Profile saved.");
    setLoading(false);
  }

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-lg border border-line bg-field p-5">
        <h2 className="text-xl font-black">Client info</h2>
        <div className="mt-6 grid gap-5">
          <label className="text-sm font-semibold text-cloud/70">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none focus:border-mint"
            />
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            Company info
            <input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none focus:border-mint"
            />
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            Email
            <input
              value={user.email}
              disabled
              className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud/45 outline-none"
            />
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            Role
            <input
              value={user.role.toLowerCase()}
              disabled
              className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud/45 outline-none"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-field p-5">
        <h2 className="text-xl font-black">Change password</h2>
        <p className="mt-2 text-sm text-cloud/55">Leave password fields empty to keep the current password.</p>
        <div className="mt-6 grid gap-5">
          <label className="text-sm font-semibold text-cloud/70">
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none focus:border-mint"
            />
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none focus:border-mint"
            />
          </label>

          <button type="submit" disabled={loading} className={buttonClasses("primary")}>
            {loading ? "Saving..." : "Save account"}
          </button>
          {status ? <p className="text-sm text-cloud/65">{status}</p> : null}
        </div>
      </section>
    </form>
  );
}
