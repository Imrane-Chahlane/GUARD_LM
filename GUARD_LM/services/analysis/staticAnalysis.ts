import type { ClientSecurityBundle, LayerResult } from "@/types/analysis";

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function compileClientRegex(pattern: string) {
  const normalized = pattern.startsWith("(?i)") ? pattern.slice(4) : pattern;
  return new RegExp(normalized, "i");
}

export async function runStaticAnalysis(
  prompt: string,
  config: Pick<ClientSecurityBundle, "enableStaticAnalysis" | "blacklistRules" | "regexRules">
): Promise<LayerResult> {
  if (!config.enableStaticAnalysis) {
    return { layer: "static", malicious: false };
  }

  const normalizedPrompt = normalize(prompt);
  const matches: Array<Record<string, unknown>> = [];

  for (const rule of config.blacklistRules) {
    if (!rule.isActive) {
      continue;
    }

    if (normalizedPrompt.includes(normalize(rule.phrase))) {
      matches.push({
        type: "blacklist",
        ruleId: rule.id,
        phrase: rule.phrase
      });
    }
  }

  for (const rule of config.regexRules) {
    if (!rule.isActive) {
      continue;
    }

    try {
      const regex = compileClientRegex(rule.pattern);
      const match = prompt.match(regex);

      if (match) {
        matches.push({
          type: "regex",
          ruleId: rule.id,
          pattern: rule.pattern,
          description: rule.description,
          matchedText: match[0]
        });
      }
    } catch {
      continue;
    }
  }

  if (matches.length === 0) {
    return { layer: "static", malicious: false, matches };
  }

  const firstMatch = matches[0];
  const reason =
    firstMatch.type === "blacklist"
      ? `Prompt matched forbidden phrase: ${String(firstMatch.phrase)}`
      : `Prompt matched forbidden instruction pattern: ${String(firstMatch.description || firstMatch.pattern)}`;

  return {
    layer: "static",
    malicious: true,
    reason,
    matches
  };
}
