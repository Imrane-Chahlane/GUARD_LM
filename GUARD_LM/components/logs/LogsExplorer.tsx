"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import type { PromptFinalStatus } from "@/types/analysis";

type PromptLogRow = {
  id: string;
  date: string;
  client: string;
  clientEmail: string;
  apiKeyId?: string | null;
  ruleId?: string | null;
  ruleName?: string | null;
  originalPrompt: string;
  sanitizedPrompt: string | null;
  status: PromptFinalStatus;
  triggeredLayers: string[];
  actionTaken: string;
  violationReason: string | null;
};

export function LogsExplorer({ 
  initialLogs,
  apiKeys,
  rules 
}: { 
  initialLogs: PromptLogRow[],
  apiKeys: { id: string, maskedKey: string }[],
  rules: { id: string, name: string }[]
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [filters, setFilters] = useState({
    status: "",
    apiKeyId: "",
    ruleId: "",
    search: "",
    from: "",
    to: ""
  });
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function applyFilters(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const response = await fetch(`/api/logs?${params.toString()}`);
    const payload = await response.json();
    setLogs(payload.logs || []);
    setLoading(false);
  }

  async function resetFilters() {
    setFilters({ status: "", apiKeyId: "", ruleId: "", search: "", from: "", to: "" });
    setLoading(true);
    const response = await fetch("/api/logs");
    const payload = await response.json();
    setLogs(payload.logs || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={applyFilters} className="rounded-lg border border-line bg-field p-5">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <label className="text-sm font-semibold text-cloud/70">
            Search
            <input
              value={filters.search}
              onChange={(event) => update("search", event.target.value)}
              placeholder="Prompt..."
              className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-cloud outline-none focus:border-mint text-xs"
            />
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            Status
            <select
              value={filters.status}
              onChange={(event) => update("status", event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-cloud outline-none focus:border-mint text-xs"
            >
              <option value="">All Status</option>
              <option value="safe">Safe</option>
              <option value="malicious">Malicious</option>
              <option value="sanitized">Sanitized</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            API Key
            <select
              value={filters.apiKeyId}
              onChange={(event) => update("apiKeyId", event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-cloud outline-none focus:border-mint text-xs"
            >
              <option value="">All Keys</option>
              {apiKeys.map(k => (
                <option key={k.id} value={k.id}>{k.maskedKey}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            Rule
            <select
              value={filters.ruleId}
              onChange={(event) => update("ruleId", event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-cloud outline-none focus:border-mint text-xs"
            >
              <option value="">All Rules</option>
              {rules.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            From
            <input
              type="date"
              value={filters.from}
              onChange={(event) => update("from", event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-cloud outline-none focus:border-mint text-xs"
            />
          </label>

          <label className="text-sm font-semibold text-cloud/70">
            To
            <input
              type="date"
              value={filters.to}
              onChange={(event) => update("to", event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-cloud outline-none focus:border-mint text-xs"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className={buttonClasses("primary")}>
            {loading ? "Filtering..." : "Apply filters"}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className={buttonClasses("secondary")}
          >
            Reset
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-line bg-field">
        <div className="table-scroll">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-ink text-xs uppercase text-cloud/50">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Rule</th>
                <th className="px-5 py-3">Original prompt</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Triggered tags</th>
                <th className="px-5 py-3">Action taken</th>
                <th className="px-5 py-3">Sanitized prompt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-cloud/50" colSpan={7}>
                    No logs match these filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="align-top">
                    <td className="whitespace-nowrap px-5 py-4 text-cloud/60">
                      {new Date(log.date).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-cloud/80">{log.client}</p>
                      <p className="mt-1 text-xs text-cloud/45">{log.clientEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-cloud/70 font-bold">
                      {log.ruleName || "none"}
                    </td>
                    <td className="max-w-sm px-5 py-4 text-cloud/75">{log.originalPrompt}</td>
                    <td className="px-5 py-4">
                      <Badge variant={log.status}>{log.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-cloud/65">
                      <div className="flex flex-wrap gap-1">
                        {log.triggeredLayers.length ? log.triggeredLayers.map((tag, i) => (
                           <span key={i} className="text-[10px] bg-ember/10 text-ember/70 px-1 py-0.5 rounded uppercase font-black">
                             {tag}
                           </span>
                        )) : "none"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-cloud/65 uppercase text-[10px] font-black">{log.actionTaken}</td>
                    <td className="max-w-sm px-5 py-4 text-cloud/65 italic">
                      {log.sanitizedPrompt || "none"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
