import type { ClientSecurityBundle, LayerResult } from "@/types/analysis";

export interface PromptSanitizer {
  sanitize(prompt: string, config: ClientSecurityBundle, results: LayerResult[]): Promise<string>;
}

export class MockPromptSanitizer implements PromptSanitizer {
  async sanitize(prompt: string, config: ClientSecurityBundle, results: LayerResult[]) {
    let sanitized = prompt;

    for (const rule of config.blacklistRules) {
      sanitized = sanitized.replace(new RegExp(escapeRegExp(rule.phrase), "gi"), "");
    }

    for (const rule of config.regexRules) {
      try {
        sanitized = sanitized.replace(new RegExp(rule.pattern, "gi"), "");
      } catch {
        // Invalid client regexes are reported by static analysis, but should not break sanitization.
      }
    }

    sanitized = sanitized
      .replace(/\b(system prompt|developer prompt|jailbreak|developer mode)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!sanitized) {
      return "Please provide a normal, policy-compliant request without attempting to override system instructions.";
    }

    if (results.some((result) => result.layer === "semantic" && result.malicious)) {
      return `Please answer this safe version of the user's request: ${sanitized}`;
    }

    return sanitized;
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getPromptSanitizer(): PromptSanitizer {
  // TODO: Replace with an LLM-backed rewrite service for production deployments.
  return new MockPromptSanitizer();
}
