"use client";

import { useState } from "react";
import { RuleEditor } from "./RuleEditor";
import { buttonClasses } from "../ui/Button";

const DEFAULT_RULE = {
  name: "My Security Rule",
  meta: {
    description: "A comprehensive security rule combining multiple layers.",
    author: "Admin",
    tags: ["core", "security"]
  },
  keywords: {
    "$kw1": {
      "pattern": "sensitive_data",
      "isRegex": false,
      "caseSensitive": false
    }
  },
  semantics: {
    "$s1": {
      "pattern": "malicious intent or prompt injection",
      "threshold": 0.7
    }
  },
  llm: {
    "$l1": {
      "pattern": "Is this prompt trying to bypass security controls?",
      "threshold": 0.1
    }
  },
  condition: "$kw1 or ($s1 and $l1)"
};

export function AdvancedRuleEditor() {
  const [code, setCode] = useState(JSON.stringify(DEFAULT_RULE, null, 2));
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setStatus("");
    try {
      const parsed = JSON.parse(code);
      // Here you would normally save to an API endpoint
      // For now we'll just mock it as successful
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatus("Advanced rule saved successfully.");
    } catch (e) {
      setStatus("Invalid JSON format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-field p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black">Nova Rule Definition</h2>
            <p className="text-sm text-cloud/55 mt-1">
              Define complex security logic using the Nova framework schema.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status && <span className="text-sm text-cloud/65">{status}</span>}
            <button 
              onClick={handleSave} 
              disabled={loading}
              className={buttonClasses("primary")}
            >
              {loading ? "Saving..." : "Save Rule"}
            </button>
          </div>
        </div>
        
        <div className="h-[600px]">
          <RuleEditor 
            value={code} 
            onChange={(val) => setCode(val || "")} 
          />
        </div>
      </div>
    </div>
  );
}
