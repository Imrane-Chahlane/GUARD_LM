"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Save, FileJson, Settings2, Trash2, Import as ImportIcon, ListFilter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { RuleForm, RuleFormData } from "./RuleForm";
import { RuleEditor } from "./RuleEditor";
import { ImportDialog } from "./ImportDialog";
import { buttonClasses } from "../ui/Button";
import { cn } from "@/utils/cn";
import { formToNovaDefinition, novaDefinitionToForm } from "@/utils/novaConverter";
import { NovaRuleSchema } from "@/lib/nova/schema";

interface NovaRuleManagerProps {
  initialRules: any[];
}

export function NovaRuleManager({ initialRules }: NovaRuleManagerProps) {
  const [rules, setRules] = useState(initialRules);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(initialRules[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"friendly" | "advanced">("friendly");
  
  // Rule Data State
  const [formData, setFormData] = useState<RuleFormData | null>(null);
  const [jsonCode, setJsonCode] = useState("");
  
  // Import State
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRule = rules.find(r => r.id === activeRuleId);

  useEffect(() => {
    if (activeRule) {
      const data = novaDefinitionToForm(activeRule.name, activeRule.decision, activeRule.definition);
      setFormData(data);
      setJsonCode(JSON.stringify(activeRule.definition, null, 2));
    }
  }, [activeRuleId]);

  // Sync Logic
  const handleFormChange = (newData: RuleFormData) => {
    setFormData(newData);
    const definition = formToNovaDefinition(newData);
    setJsonCode(JSON.stringify(definition, null, 2));
  };

  const handleJsonChange = (newCode: string | undefined) => {
    const code = newCode || "";
    setJsonCode(code);
    try {
      const parsed = JSON.parse(code);
      const data = novaDefinitionToForm(activeRule?.name || "Untitled", activeRule?.decision, parsed);
      setFormData(data);
    } catch (e) {
      // JSON is mid-edit, don't sync to form yet
    }
  };

  const saveActiveRule = async () => {
    if (!activeRuleId || !formData) return;
    setLoading(true);
    setStatus("");

    try {
      const definition = JSON.parse(jsonCode);
      const validation = NovaRuleSchema.safeParse(definition);
      
      if (!validation.success) {
        const issues = validation.error.issues || [];
        setImportErrors(issues.map(e => `${e.path.join(".")}: ${e.message}`));
        setIsImportOpen(true);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/rules/${activeRuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          decision: formData.decision,
          definition: validation.data
        })
      });

      if (response.ok) {
        setStatus("Rule saved successfully.");
        const updatedRule = await response.json();
        setRules(rules.map(r => r.id === activeRuleId ? updatedRule : r));
      } else {
        setStatus("Failed to save rule.");
      }
    } catch (e: any) {
      console.error("Save error:", e);
      setStatus(`Error: ${e.message || "Invalid JSON format."}`);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    setLoading(true);
    const response = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Rule",
        decision: "reject",
        definition: {
          meta: { description: "New security rule" },
          condition: ""
        }
      })
    });

    if (response.ok) {
      const newRule = await response.json();
      setRules([newRule, ...rules]);
      setActiveRuleId(newRule.id);
    }
    setLoading(false);
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    const response = await fetch(`/api/rules/${id}`, { method: "DELETE" });
    if (response.ok) {
      const newRules = rules.filter(r => r.id !== id);
      setRules(newRules);
      setActiveRuleId(newRules[0]?.id || null);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const validation = NovaRuleSchema.safeParse(parsed);

        if (!validation.success) {
          const issues = validation.error.issues || [];
          setImportErrors(issues.map(e => `${e.path.join(".")}: ${e.message}`));
          setIsImportOpen(true);
          return;
        }

        // Apply imported content to active rule
        setJsonCode(JSON.stringify(validation.data, null, 2));
        const data = novaDefinitionToForm(activeRule?.name || "Imported", activeRule?.decision, validation.data);
        setFormData(data);
        setStatus("Rule imported. Click save to persist changes.");
      } catch (e) {
        setImportErrors(["Invalid JSON file format."]);
        setIsImportOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black uppercase text-cloud/40 tracking-widest flex items-center gap-2">
            <ListFilter size={14} /> My Rules
          </h2>
          <button onClick={createRule} className="p-1 text-mint hover:bg-mint/10 rounded transition">
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-1">
          {rules.map(rule => (
            <div 
              key={rule.id}
              onClick={() => setActiveRuleId(rule.id)}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold cursor-pointer transition",
                activeRuleId === rule.id 
                  ? "bg-mint/10 text-mint border border-mint/20" 
                  : "text-cloud/60 hover:bg-field hover:text-cloud border border-transparent"
              )}
            >
              <span className="truncate">{rule.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-ember transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {rules.length === 0 && (
            <p className="text-xs text-cloud/30 text-center py-4">No rules created.</p>
          )}
        </div>
      </aside>

      {/* Editor Main */}
      <main className="min-w-0">
        {activeRuleId ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
              <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-fit">
                <TabsList className="h-10">
                  <TabsTrigger value="friendly" className="px-4 py-1.5 gap-2">
                    <Settings2 size={16} /> User friendly
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="px-4 py-1.5 gap-2">
                    <FileJson size={16} /> Advanced (JSON)
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-3">
                <label className={cn(buttonClasses("secondary"), "cursor-pointer gap-2")}>
                  <ImportIcon size={18} /> Import
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleImport} 
                  />
                </label>
                <button 
                  onClick={saveActiveRule} 
                  disabled={loading}
                  className={buttonClasses("primary", "gap-2")}
                >
                  <Save size={18} /> {loading ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>

            {status && (
              <div className="p-3 text-sm rounded bg-panel border border-line text-cloud/70">
                {status}
              </div>
            )}

            <div className="mt-8">
              {view === "friendly" && formData && (
                <RuleForm data={formData} onChange={handleFormChange} />
              )}
              {view === "advanced" && (
                <div className="h-[700px]">
                  <RuleEditor value={jsonCode} onChange={handleJsonChange} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-field/30 rounded-xl border border-dashed border-line">
            <Settings2 size={48} className="text-cloud/10" />
            <p className="mt-4 text-cloud/40">Select or create a rule to begin configuration.</p>
          </div>
        )}
      </main>

      <ImportDialog 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        errors={importErrors}
        onTryAgain={() => { setIsImportOpen(false); fileInputRef.current?.click(); }}
      />
    </div>
  );
}
