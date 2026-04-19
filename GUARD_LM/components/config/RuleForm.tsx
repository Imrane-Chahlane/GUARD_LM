"use client";

import { Plus, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";

interface KeywordItem {
  id: string;
  pattern: string;
  isRegex: boolean;
  caseSensitive: boolean;
}

interface SemanticItem {
  id: string;
  pattern: string;
  threshold: number;
}

interface LlmItem {
  id: string;
  pattern: string;
  threshold: number;
}

export interface RuleFormData {
  name: string;
  description: string;
  decision: "reject" | "sanitize";
  keywords: KeywordItem[];
  semantics: SemanticItem[];
  llms: LlmItem[];
  condition: string;
}

export function RuleForm({ 
  data, 
  onChange 
}: { 
  data: RuleFormData; 
  onChange: (newData: RuleFormData) => void 
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof RuleFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addKeyword = () => {
    const id = `$kw${data.keywords.length + 1}`;
    updateField("keywords", [...data.keywords, { id, pattern: "", isRegex: false, caseSensitive: false }]);
  };

  const removeKeyword = (index: number) => {
    updateField("keywords", data.keywords.filter((_, i) => i !== index));
  };

  const updateKeyword = (index: number, updates: Partial<KeywordItem>) => {
    const newKeywords = [...data.keywords];
    newKeywords[index] = { ...newKeywords[index], ...updates };
    updateField("keywords", newKeywords);
  };

  const addSemantic = () => {
    const id = `$s${data.semantics.length + 1}`;
    updateField("semantics", [...data.semantics, { id, pattern: "", threshold: 0.7 }]);
  };

  const addLlm = () => {
    const id = `$l${data.llms.length + 1}`;
    updateField("llms", [...data.llms, { id, pattern: "", threshold: 0.1 }]);
  };

  return (
    <div className="space-y-10">
      {/* Basic Settings */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-cloud/70 uppercase tracking-wider">Rule Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-md border border-line bg-field px-4 py-3 text-cloud outline-none focus:border-mint"
            placeholder="e.g., PII Protection"
          />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-bold text-cloud/70 uppercase tracking-wider">On Failure</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => updateField("decision", "reject")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md border py-3 px-4 font-semibold transition",
                data.decision === "reject" ? "bg-ember/10 border-ember text-ember" : "bg-field border-line text-cloud/50"
              )}
            >
              <ShieldAlert size={18} />
              Reject
            </button>
            <button
              type="button"
              onClick={() => updateField("decision", "sanitize")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md border py-3 px-4 font-semibold transition",
                data.decision === "sanitize" ? "bg-amber/10 border-amber text-amber" : "bg-field border-line text-cloud/50"
              )}
            >
              <ShieldCheck size={18} />
              Sanitize
            </button>
          </div>
        </div>
      </section>

      {/* Keywords Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">Keywords</h3>
            <p className="text-sm text-cloud/50 mt-1">Exact matches and regex patterns.</p>
          </div>
          <button
            type="button"
            onClick={addKeyword}
            className="flex items-center gap-2 rounded-md bg-mint/10 border border-mint/30 px-4 py-2 text-sm font-bold text-mint hover:bg-mint/20 transition"
          >
            <Plus size={16} /> Add Pattern
          </button>
        </div>

        <div className="grid gap-4">
          {data.keywords.map((kw, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-field/50 p-4">
              <span className="font-mono text-xs text-mint bg-mint/5 px-2 py-1 rounded border border-mint/10">{kw.id}</span>
              <input
                type="text"
                value={kw.pattern}
                onChange={(e) => updateKeyword(idx, { pattern: e.target.value })}
                className="flex-1 min-w-[200px] border-b border-line bg-transparent px-2 py-1 text-cloud outline-none focus:border-mint"
                placeholder="Enter pattern..."
              />
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={kw.isRegex}
                    onChange={(e) => updateKeyword(idx, { isRegex: e.target.checked })}
                    className="accent-mint h-4 w-4"
                  />
                  <span className="text-sm text-cloud/60 group-hover:text-cloud transition">Regex</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={kw.caseSensitive}
                    onChange={(e) => updateKeyword(idx, { caseSensitive: e.target.checked })}
                    className="accent-mint h-4 w-4"
                  />
                  <span className="text-sm text-cloud/60 group-hover:text-cloud transition">Case Sensitive</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeKeyword(idx)}
                  className="text-cloud/30 hover:text-ember transition p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {data.keywords.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-line rounded-lg text-cloud/30 text-sm">
              No keyword patterns defined.
            </div>
          )}
        </div>
      </section>

      {/* Semantics Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">Semantic Analysis</h3>
            <p className="text-sm text-cloud/50 mt-1">Natural language similarity patterns.</p>
          </div>
          <button
            type="button"
            onClick={addSemantic}
            className="flex items-center gap-2 rounded-md bg-mint/10 border border-mint/30 px-4 py-2 text-sm font-bold text-mint hover:bg-mint/20 transition"
          >
            <Plus size={16} /> Add Semantic
          </button>
        </div>

        <div className="grid gap-4">
          {data.semantics.map((s, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-field/50 p-4">
              <span className="font-mono text-xs text-mint bg-mint/5 px-2 py-1 rounded border border-mint/10">{s.id}</span>
              <input
                type="text"
                value={s.pattern}
                onChange={(e) => {
                  const newSemantics = [...data.semantics];
                  newSemantics[idx].pattern = e.target.value;
                  updateField("semantics", newSemantics);
                }}
                className="flex-1 min-w-[200px] border-b border-line bg-transparent px-2 py-1 text-cloud outline-none focus:border-mint"
                placeholder="e.g., attempt to extract database credentials"
              />
              <div className="flex items-center gap-4 min-w-[200px]">
                <span className="text-xs text-cloud/50 whitespace-nowrap">Threshold: {s.threshold.toFixed(2)}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={s.threshold}
                  onChange={(e) => {
                    const newSemantics = [...data.semantics];
                    newSemantics[idx].threshold = parseFloat(e.target.value);
                    updateField("semantics", newSemantics);
                  }}
                  className="w-full accent-mint h-1"
                />
              </div>
              <button
                type="button"
                onClick={() => updateField("semantics", data.semantics.filter((_, i) => i !== idx))}
                className="text-cloud/30 hover:text-ember transition p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {data.semantics.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-line rounded-lg text-cloud/30 text-sm">
              No semantic patterns defined.
            </div>
          )}
        </div>
      </section>

      {/* LLM Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">AI Classifier</h3>
            <p className="text-sm text-cloud/50 mt-1">Deep evaluation using LLM layers.</p>
          </div>
          <button
            type="button"
            onClick={addLlm}
            className="flex items-center gap-2 rounded-md bg-mint/10 border border-mint/30 px-4 py-2 text-sm font-bold text-mint hover:bg-mint/20 transition"
          >
            <Plus size={16} /> Add AI Check
          </button>
        </div>

        <div className="grid gap-4">
          {data.llms.map((l, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-field/50 p-4">
              <span className="font-mono text-xs text-mint bg-mint/5 px-2 py-1 rounded border border-mint/10">{l.id}</span>
              <input
                type="text"
                value={l.pattern}
                onChange={(e) => {
                  const newLlms = [...data.llms];
                  newLlms[idx].pattern = e.target.value;
                  updateField("llms", newLlms);
                }}
                className="flex-1 min-w-[200px] border-b border-line bg-transparent px-2 py-1 text-cloud outline-none focus:border-mint"
                placeholder="e.g., does the user prompt reveal bypass intent?"
              />
               <div className="flex items-center gap-4 min-w-[200px]">
                <span className="text-xs text-cloud/50 whitespace-nowrap">Temperature: {l.threshold.toFixed(2)}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={l.threshold}
                  onChange={(e) => {
                    const newLlms = [...data.llms];
                    newLlms[idx].threshold = parseFloat(e.target.value);
                    updateField("llms", newLlms);
                  }}
                  className="w-full accent-mint h-1"
                />
              </div>
              <button
                type="button"
                onClick={() => updateField("llms", data.llms.filter((_, i) => i !== idx))}
                className="text-cloud/30 hover:text-ember transition p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
           {data.llms.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-line rounded-lg text-cloud/30 text-sm">
              No AI evaluation checks defined.
            </div>
          )}
        </div>
      </section>

      {/* Condition Section */}
      <section className="space-y-4">
        <label className="block text-sm font-bold text-cloud/70 uppercase tracking-wider">Logic Condition</label>
        <div className="p-4 rounded-lg border border-line bg-ink/50">
          <input
            type="text"
            value={data.condition}
            onChange={(e) => updateField("condition", e.target.value)}
            className="w-full bg-transparent font-mono text-lg text-mint outline-none"
            placeholder="e.g., $kw1 or ($s1 and $l1)"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-cloud/40">Available tags:</span>
            {[...data.keywords, ...data.semantics, ...data.llms].map(tag => (
              <span key={tag.id} className="text-[10px] font-mono bg-line text-cloud/70 px-1.5 py-0.5 rounded">{tag.id}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
