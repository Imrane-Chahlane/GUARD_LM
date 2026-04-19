"use client";

import { useState } from "react";
import { Plus, Check, Cpu, Globe, Key, Database, Loader2, Link2 } from "lucide-react";
import { buttonClasses } from "../ui/Button";
import { cn } from "@/utils/cn";

interface ModelRecord {
  id: string;
  type: "EMBEDDING" | "LLM";
  provider: string;
  apiKey: string;
  baseUrl?: string | null;
  modelName: string;
  createdAt: string | Date;
}

const providers = [
  { id: "openai", name: "OpenAI", icon: <Cpu size={18} /> },
  { id: "google", name: "Google Gemini", icon: <Globe size={18} /> },
  { id: "anthropic", name: "Anthropic Claude", icon: <Database size={18} /> },
  { id: "openai-compatible", name: "OpenAI Compatible", icon: <Link2 size={18} /> }
];

export function ModelPanel({ initialModels }: { initialModels: ModelRecord[] }) {
  const [models, setModels] = useState(initialModels);

  const refreshModels = async () => {
    try {
      const response = await fetch("/api/models");
      const data = await response.json();
      setModels(data);
    } catch (e) {
      console.error("Failed to refresh models");
    }
  };

  const getModelByType = (type: "EMBEDDING" | "LLM") => {
    return models.find((m) => m.type === type);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ModelSection 
        title="Embedding Model" 
        description="Powers semantic similarity checks and vector comparisons."
        type="EMBEDDING"
        existingModel={getModelByType("EMBEDDING")}
        onUpdate={refreshModels}
      />
      <ModelSection 
        title="Classifier LLM" 
        description="Handles complex logic and final prompt classification."
        type="LLM"
        existingModel={getModelByType("LLM")}
        onUpdate={refreshModels}
      />
    </div>
  );
}

function ModelSection({ 
  title, 
  description, 
  type, 
  existingModel, 
  onUpdate 
}: { 
  title: string; 
  description: string; 
  type: "EMBEDDING" | "LLM";
  existingModel?: ModelRecord;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  
  const [provider, setProvider] = useState(existingModel?.provider || "openai");
  const [apiKey, setApiKey] = useState(existingModel?.apiKey || "");
  const [baseUrl, setBaseUrl] = useState(existingModel?.baseUrl || "");
  const [modelName, setModelName] = useState(existingModel?.modelName || "");

  async function handleSave() {
    if (!apiKey || !modelName) {
      setStatus("API Key and Model Name are required.");
      return;
    }
    setLoading(true);
    setStatus("");
    
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, provider, apiKey, baseUrl, modelName })
      });

      if (response.ok) {
        onUpdate();
        setStatus("Configuration saved!");
        setTimeout(() => setStatus(""), 3000);
      } else {
        const err = await response.text();
        setStatus(`Error: ${err || "Failed to save"}`);
      }
    } catch (e) {
      setStatus("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <section className="flex flex-col rounded-3xl border border-line bg-field overflow-hidden shadow-sm transition-all hover:border-mint/20 group">
      <div className="p-8 border-b border-line bg-ink/30 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-mint/5 blur-3xl transition-all group-hover:bg-mint/10" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10 text-mint border border-mint/20 shadow-[0_0_20px_rgba(0,255,163,0.1)]">
            {type === "EMBEDDING" ? <Globe size={28} /> : <Cpu size={28} />}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">{title}</h2>
            <p className="text-sm text-cloud/40 font-bold uppercase tracking-widest mt-0.5">{type}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-cloud/50 leading-relaxed max-w-sm">
          {description}
        </p>
      </div>

      <div className="p-8 space-y-8 flex-1">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-mint ml-1">Select Provider</label>
          <div className="grid grid-cols-2 gap-3">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-black transition-all active:scale-95",
                  provider === p.id 
                    ? "border-mint bg-mint/5 text-mint shadow-[0_0_20px_rgba(0,255,163,0.15)] ring-1 ring-mint/20" 
                    : "border-line bg-ink/40 text-cloud/40 hover:border-cloud/20 hover:text-cloud/60"
                )}
              >
                <span className={cn(provider === p.id ? "text-mint" : "text-cloud/20 transition-colors")}>{p.icon}</span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-cloud/30 ml-1">Model ID / Name</label>
            <input 
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={type === "EMBEDDING" ? "text-embedding-3-small" : "gpt-4o, claude-3-opus..."}
              className="w-full rounded-2xl border border-line bg-ink/40 px-5 py-4 text-sm font-medium text-cloud outline-none transition-all focus:border-mint focus:bg-ink/60 focus:shadow-[0_0_15px_rgba(0,255,163,0.05)]"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-cloud/30 ml-1">Private API Key</label>
            <div className="relative">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full rounded-2xl border border-line bg-ink/40 px-5 py-4 text-sm text-cloud outline-none transition-all focus:border-mint focus:bg-ink/60 pr-12 font-mono"
              />
              <Key size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-cloud/10" />
            </div>
          </div>

          {provider === "openai-compatible" && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-black uppercase tracking-widest text-mint ml-1">Custom Base URL</label>
              <input 
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.together.xyz/v1"
                className="w-full rounded-2xl border border-mint/30 bg-mint/5 px-5 py-4 text-sm font-medium text-mint outline-none transition-all focus:border-mint focus:bg-mint/10"
              />
              <p className="text-[11px] text-mint/40 ml-1 font-bold italic flex items-center gap-1.5">
                <Link2 size={12} /> Point to any OpenAI-compatible API gateway
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 border-t border-line bg-ink/20 flex items-center justify-between gap-6">
        <div className="flex-1">
          {status && (
            <p className={cn(
              "text-xs font-black animate-in fade-in slide-in-from-left-2 duration-300",
              status.includes("Error") || status.includes("Network") ? "text-ember" : "text-mint"
            )}>
              {status}
            </p>
          )}
        </div>
        <button 
          disabled={loading}
          onClick={handleSave}
          className={cn(
            buttonClasses("primary"), 
            "h-12 px-10 rounded-2xl font-black gap-2 transition-all active:scale-95 shadow-lg",
            loading && "opacity-70"
          )}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : status === "Configuration saved!" ? (
            <Check size={18} />
          ) : (
            <Plus size={18} />
          )}
          {existingModel ? "Update Setup" : "Connect Model"}
        </button>
      </div>
    </section>
  );
}
