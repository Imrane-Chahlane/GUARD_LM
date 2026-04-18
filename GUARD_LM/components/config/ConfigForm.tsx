"use client";

import { useMemo, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { ClientSecurityBundle, MaliciousActionName } from "@/types/analysis";

function joinLines(lines: string[]) {
  return lines.join("\n");
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function regexToText(config: ClientSecurityBundle) {
  return config.regexRules
    .map((rule) => (rule.description ? `${rule.pattern} || ${rule.description}` : rule.pattern))
    .join("\n");
}

function parseRegexRules(value: string) {
  return parseLines(value).map((line) => {
    const [pattern, ...descriptionParts] = line.split("||");
    return {
      pattern: pattern.trim(),
      description: descriptionParts.join("||").trim() || null
    };
  });
}

export function ConfigForm({ initialConfig }: { initialConfig: ClientSecurityBundle }) {
  const [enableStaticAnalysis, setEnableStaticAnalysis] = useState(
    initialConfig.enableStaticAnalysis
  );
  const [enableSemanticAnalysis, setEnableSemanticAnalysis] = useState(
    initialConfig.enableSemanticAnalysis
  );
  const [enableLlmClassification, setEnableLlmClassification] = useState(
    initialConfig.enableLlmClassification
  );
  const [maliciousAction, setMaliciousAction] = useState<MaliciousActionName>(
    initialConfig.maliciousAction
  );
  const [semanticThreshold, setSemanticThreshold] = useState(initialConfig.semanticThreshold);
  const [blacklistRules, setBlacklistRules] = useState(
    joinLines(initialConfig.blacklistRules.map((rule) => rule.phrase))
  );
  const [regexRules, setRegexRules] = useState(regexToText(initialConfig));
  const [semanticExamples, setSemanticExamples] = useState(
    joinLines(initialConfig.semanticExamples.map((example) => example.text))
  );
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const ruleCounts = useMemo(
    () => ({
      blacklist: parseLines(blacklistRules).length,
      regex: parseRegexRules(regexRules).length,
      semantic: parseLines(semanticExamples).length
    }),
    [blacklistRules, regexRules, semanticExamples]
  );

  async function saveConfig(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enableStaticAnalysis,
        enableSemanticAnalysis,
        enableLlmClassification,
        maliciousAction,
        semanticThreshold: Number(semanticThreshold),
        blacklistRules: parseLines(blacklistRules),
        regexRules: parseRegexRules(regexRules),
        semanticExamples: parseLines(semanticExamples)
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus(payload?.error || "Configuration could not be saved.");
      setLoading(false);
      return;
    }

    setStatus("Configuration saved.");
    setLoading(false);
  }

  return (
    <form onSubmit={saveConfig} className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <Toggle
          title="Static analysis"
          description="Blacklist and regex matching"
          checked={enableStaticAnalysis}
          onChange={setEnableStaticAnalysis}
        />
        <Toggle
          title="Semantic analysis"
          description="Similarity against examples"
          checked={enableSemanticAnalysis}
          onChange={setEnableSemanticAnalysis}
        />
        <Toggle
          title="LLM classification"
          description="Structured classifier layer"
          checked={enableLlmClassification}
          onChange={setEnableLlmClassification}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-line bg-field p-5">
          <h2 className="text-xl font-black">Decision policy</h2>
          <p className="mt-2 text-sm text-cloud/55">
            Guard_LM marks a prompt malicious when at least one enabled layer flags it.
          </p>

          <label className="mt-6 block text-sm font-semibold text-cloud/70">
            Action when malicious
            <select
              value={maliciousAction}
              onChange={(event) => setMaliciousAction(event.target.value as MaliciousActionName)}
              className="mt-2 w-full rounded-md border border-line bg-ink px-4 py-3 text-cloud outline-none focus:border-mint"
            >
              <option value="reject">Reject</option>
              <option value="sanitize">Sanitize and forward</option>
              <option value="reject_with_reason">Reject with reason</option>
            </select>
          </label>

          <label className="mt-5 block text-sm font-semibold text-cloud/70">
            Semantic threshold: {Number(semanticThreshold).toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={semanticThreshold}
              onChange={(event) => setSemanticThreshold(Number(event.target.value))}
              className="mt-4 w-full accent-mint"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <RuleCounter label="Blacklist phrases" value={ruleCounts.blacklist} />
          <RuleCounter label="Regex patterns" value={ruleCounts.regex} />
          <RuleCounter label="Semantic examples" value={ruleCounts.semantic} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <RuleTextarea
          label="Blacklist phrases"
          helper="One phrase per line."
          value={blacklistRules}
          onChange={setBlacklistRules}
          rows={14}
        />
        <RuleTextarea
          label="Regex patterns"
          helper="Use pattern || description when needed."
          value={regexRules}
          onChange={setRegexRules}
          rows={14}
        />
        <RuleTextarea
          label="Semantic malicious examples"
          helper="One known malicious prompt per line."
          value={semanticExamples}
          onChange={setSemanticExamples}
          rows={14}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading} className={buttonClasses("primary")}>
          {loading ? "Saving..." : "Save configuration"}
        </button>
        {status ? <span className="text-sm text-cloud/65">{status}</span> : null}
      </div>
    </form>
  );
}

function Toggle({
  title,
  description,
  checked,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line bg-field p-5">
      <span>
        <span className="block font-black">{title}</span>
        <span className="mt-1 block text-sm text-cloud/55">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-mint"
      />
    </label>
  );
}

function RuleCounter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-field p-5">
      <p className="text-sm text-cloud/55">{label}</p>
      <p className="mt-3 text-3xl font-black text-mint">{value}</p>
    </div>
  );
}

function RuleTextarea({
  label,
  helper,
  value,
  onChange,
  rows
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block rounded-lg border border-line bg-field p-5">
      <span className="font-black">{label}</span>
      <span className="mt-1 block text-sm text-cloud/55">{helper}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 w-full resize-y rounded-md border border-line bg-ink px-4 py-3 font-mono text-sm text-cloud outline-none focus:border-mint"
      />
    </label>
  );
}
