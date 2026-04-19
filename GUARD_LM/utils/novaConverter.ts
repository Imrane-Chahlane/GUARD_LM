import { RuleFormData } from "@/components/config/RuleForm";

export function formToNovaDefinition(formData: RuleFormData) {
  const keywords: Record<string, any> = {};
  formData.keywords.forEach(kw => {
    if (kw.pattern) {
      keywords[kw.id] = {
        pattern: kw.pattern,
        isRegex: kw.isRegex,
        caseSensitive: kw.caseSensitive
      };
    }
  });

  const semantics: Record<string, any> = {};
  formData.semantics.forEach(s => {
    if (s.pattern) {
      semantics[s.id] = {
        pattern: s.pattern,
        threshold: s.threshold
      };
    }
  });

  const llm: Record<string, any> = {};
  formData.llms.forEach(l => {
    if (l.pattern) {
      llm[l.id] = {
        pattern: l.pattern,
        threshold: l.threshold
      };
    }
  });

  return {
    meta: {
      description: formData.description,
      author: "User",
      tags: []
    },
    keywords: Object.keys(keywords).length > 0 ? keywords : undefined,
    semantics: Object.keys(semantics).length > 0 ? semantics : undefined,
    llm: Object.keys(llm).length > 0 ? llm : undefined,
    condition: formData.condition || "",
    failed: formData.decision || "reject"
  };
}

export function novaDefinitionToForm(name: string, decision: any, definition: any): RuleFormData {
  const keywords = Object.entries(definition.keywords || {}).map(([id, val]: [string, any]) => ({
    id,
    pattern: val.pattern,
    isRegex: !!val.isRegex,
    caseSensitive: !!val.caseSensitive
  }));

  const semantics = Object.entries(definition.semantics || {}).map(([id, val]: [string, any]) => ({
    id,
    pattern: val.pattern,
    threshold: val.threshold ?? 0.7
  }));

  const llms = Object.entries(definition.llm || {}).map(([id, val]: [string, any]) => ({
    id,
    pattern: val.pattern,
    threshold: val.threshold ?? 0.1
  }));

  return {
    name: name || "Untitled Rule",
    description: definition.meta?.description || "",
    decision: decision || definition.failed || "reject",
    keywords,
    semantics,
    llms,
    condition: definition.condition || ""
  };
}
