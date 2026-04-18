export type LayerName = "static" | "semantic" | "llm";
export type MaliciousActionName = "reject" | "sanitize" | "reject_with_reason";
export type PromptFinalStatus = "safe" | "malicious" | "sanitized";
export type ActionTakenName = "forward" | "reject" | "sanitize" | "reject_with_reason";

export type BlacklistRuleInput = {
  id: string;
  phrase: string;
  isActive: boolean;
};

export type RegexRuleInput = {
  id: string;
  pattern: string;
  description: string | null;
  isActive: boolean;
};

export type SemanticExampleInput = {
  id: string;
  text: string;
  label: string;
};

export type ClientSecurityBundle = {
  userId: string;
  enableStaticAnalysis: boolean;
  enableSemanticAnalysis: boolean;
  enableLlmClassification: boolean;
  maliciousAction: MaliciousActionName;
  semanticThreshold: number;
  blacklistRules: BlacklistRuleInput[];
  regexRules: RegexRuleInput[];
  semanticExamples: SemanticExampleInput[];
};

export type LayerResult = {
  layer: LayerName;
  malicious: boolean;
  reason?: string;
  score?: number;
  matches?: Array<Record<string, unknown>>;
};

export type AnalyzePromptResponse = {
  status: PromptFinalStatus;
  original_prompt: string;
  forward_prompt: string | null;
  triggered_layers: LayerName[];
  action_taken: ActionTakenName;
  reason?: string;
};
