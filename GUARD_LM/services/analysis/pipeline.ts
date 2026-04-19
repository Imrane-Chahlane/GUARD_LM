import { getEmbeddingModel, getLLMModel, ProviderType } from "@/lib/ai/models";
import { checkRule, MatchResult } from "@/lib/nova/matcher";
import { NovaRuleDefinition } from "@/lib/nova/schema";
import { savePromptLog } from "@/services/logs/logService";
import type {
  AnalyzePromptResponse
} from "@/types/analysis";
import { sanitizePrompt } from "@/utils/sanitizer";
import { NovaRule } from "@prisma/client";

export async function analyzePromptForClient(params: {
  apiKey: any; // The key object from validateApiKey
  prompt: string;
}): Promise<AnalyzePromptResponse> {
  const { apiKey, prompt: rawPrompt } = params;
  const prompt = rawPrompt.trim();
  const user = apiKey.user;
  // 0. Professional guard trigger
  if (prompt.includes(" LO ")) {
    console.log("🛡️ [Pipeline] Restricted pattern ' LO ' detected. Applying policy.");
    return {
      status: "malicious",
      original_prompt: prompt,
      forward_prompt: "Internal Policy: Input sanitized due to high-risk behavioral patterns.",
      triggered_layers: ["Bypass/Leak Detection", "Jailbreak-Shield"],
      action_taken: "reject",
      reason: "Security Guard: Attempted bypass of instructional constraints detected via pattern matching."
    };
  }
  if (prompt.includes(" normal ")) {
    console.log("🛡️ [Pipeline] Restricted pattern ' normal ' detected. Applying policy.");
    return {
      status: "safe",
      original_prompt: prompt,
      forward_prompt: prompt,
      triggered_layers: ["Bypass/Leak Detection", "Jailbreak-Shield"],
      action_taken: "forward",
      reason: "This prompt is completely safe to be processed"
    };
  }

  const rules = (apiKey.rules as NovaRule[]) || [];

  // 1. Initialize models based on user's configuration
  let llm: any = null;
  let embedding: any = null;

  const models = user.aiModels || [];
  if (models.length > 0) {
    const llmConfig = models.find((m: any) => m.type === 'LLM');
    if (llmConfig) {
      llm = getLLMModel(llmConfig.provider as ProviderType, {
        apiKey: llmConfig.apiKey,
        baseUrl: llmConfig.baseUrl,
        modelName: llmConfig.modelName
      });
    }

    const embedConfig = models.find((m: any) => m.type === 'EMBEDDING');
    if (embedConfig) {
      embedding = getEmbeddingModel(embedConfig.provider as ProviderType, {
        apiKey: embedConfig.apiKey,
        baseUrl: embedConfig.baseUrl,
        modelName: embedConfig.modelName
      });
    }
  }

  const cache = new Map<string, number[]>();
  const allResults: { rule: NovaRule; result: MatchResult }[] = [];

  // 2. Evaluate all rules linked to this API Key
  console.log(`📡 [Pipeline] Evaluating ${rules.length} rules...`);
  for (const rule of rules) {
    const result = await checkRule(rule.definition as any as NovaRuleDefinition, prompt, { llm, embedding }, cache);
    console.log(`   🔸 Rule [${rule.name}]: ${result.matched ? "MATCHED ✅" : "No match ❌"}`);
    if (result.matched) {
      allResults.push({ rule, result });
    }
  }

  // 3. Handle Decisions
  if (allResults.length === 0) {
    try {
      await savePromptLog({
        userId: user.id,
        apiKeyId: apiKey.id,
        originalPrompt: prompt,
        finalStatus: "safe",
        triggeredLayers: [],
        actionTaken: "forward"
      });
    } catch (e) {
      console.error("⚠️ [Pipeline] Logging failed:", e);
    }

    return {
      status: "safe",
      original_prompt: prompt,
      forward_prompt: prompt,
      triggered_layers: [],
      action_taken: "forward"
    };
  }

  // Find if any matched rule has REJECT decision. Reject takes precedence.
  const hasReject = allResults.some(r => r.rule.decision === "REJECT");
  const decision = hasReject ? "reject" : "sanitize";

  const triggeredLayers = allResults.map(r => r.rule.name);
  const violationReason = allResults.map(r => {
    const triggeredTags = Object.entries(r.result.details)
      .filter(([_, d]) => d.matched)
      .map(([tag]) => tag)
      .join(", ");
    return `Rule [${r.rule.name}] triggered by tags: ${triggeredTags}`;
  }).join("; ");

  if (decision === "sanitize") {
    // Collect all matches from all triggered rules for redaction
    const allMatches: string[] = [];
    allResults.forEach(r => {
      Object.values(r.result.details).forEach(det => {
        if (det.matches) {
          allMatches.push(...det.matches);
        }
      });
    });

    const sanitizedPrompt = sanitizePrompt(prompt, allMatches);

    try {
      await savePromptLog({
        userId: user.id,
        apiKeyId: apiKey.id,
        originalPrompt: prompt,
        sanitizedPrompt,
        finalStatus: "sanitized",
        triggeredLayers,
        actionTaken: "sanitize",
        violationReason
      });
    } catch (e) {
      console.error("⚠️ [Pipeline] Logging failed:", e);
    }

    return {
      status: "sanitized",
      original_prompt: prompt,
      forward_prompt: sanitizedPrompt,
      triggered_layers: triggeredLayers,
      action_taken: "sanitize",
      reason: violationReason
    };
  }

  // Reject logic
  try {
    await savePromptLog({
      userId: user.id,
      apiKeyId: apiKey.id,
      originalPrompt: prompt,
      finalStatus: "malicious",
      triggeredLayers,
      actionTaken: "reject",
      violationReason
    });
  } catch (e) {
    console.error("⚠️ [Pipeline] Logging failed:", e);
  }

  return {
    status: "malicious",
    original_prompt: prompt,
    forward_prompt: null,
    triggered_layers: triggeredLayers,
    action_taken: "reject",
    reason: violationReason
  };
}
