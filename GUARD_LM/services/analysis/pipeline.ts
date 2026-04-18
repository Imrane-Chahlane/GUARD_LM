import { prisma } from "@/lib/prisma";
import { savePromptLog } from "@/services/logs/logService";
import type {
  AnalyzePromptResponse,
  ClientSecurityBundle,
  LayerResult,
  MaliciousActionName
} from "@/types/analysis";
import { maliciousActionToApi } from "@/utils/enums";
import { runLLMClassification } from "./llmClassifier";
import { getPromptSanitizer } from "./sanitizer";
import { runSemanticAnalysis } from "./semanticAnalysis";
import { runStaticAnalysis } from "./staticAnalysis";

export async function getClientSecurityBundle(userId: string): Promise<ClientSecurityBundle> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      config: true,
      blacklistRules: { where: { isActive: true } },
      regexRules: { where: { isActive: true } },
      semanticExamples: true
    }
  });

  if (!user) {
    throw new Error("Client not found");
  }

  const config =
    user.config ??
    (await prisma.clientConfig.create({
      data: { userId }
    }));

  return {
    userId,
    enableStaticAnalysis: config.enableStaticAnalysis,
    enableSemanticAnalysis: config.enableSemanticAnalysis,
    enableLlmClassification: config.enableLlmClassification,
    maliciousAction: maliciousActionToApi(config.maliciousAction),
    semanticThreshold: config.semanticThreshold,
    blacklistRules: user.blacklistRules,
    regexRules: user.regexRules,
    semanticExamples: user.semanticExamples
  };
}

function collectViolationReason(results: LayerResult[]) {
  return (
    results
      .filter((result) => result.malicious && result.reason)
      .map((result) => result.reason)
      .join("; ") || "Prompt violated one or more configured Guard_LM security rules"
  );
}

function normalizeAction(action: MaliciousActionName) {
  return action;
}

export async function analyzePromptForClient(params: {
  userId: string;
  prompt: string;
}): Promise<AnalyzePromptResponse> {
  const config = await getClientSecurityBundle(params.userId);
  const prompt = params.prompt.trim();

  const [staticResult, semanticResult, llmResult] = await Promise.all([
    runStaticAnalysis(prompt, config),
    runSemanticAnalysis(prompt, config),
    runLLMClassification(prompt, config)
  ]);

  const results = [staticResult, semanticResult, llmResult];
  const maliciousResults = results.filter((result) => result.malicious);
  const triggeredLayers = maliciousResults.map((result) => result.layer);

  if (triggeredLayers.length === 0) {
    await savePromptLog({
      userId: params.userId,
      originalPrompt: prompt,
      finalStatus: "safe",
      triggeredLayers: [],
      actionTaken: "forward"
    });

    return {
      status: "safe",
      original_prompt: prompt,
      forward_prompt: prompt,
      triggered_layers: [],
      action_taken: "forward"
    };
  }

  const action = normalizeAction(config.maliciousAction);
  const reason = collectViolationReason(maliciousResults);

  if (action === "sanitize") {
    const sanitizedPrompt = await getPromptSanitizer().sanitize(prompt, config, results);

    await savePromptLog({
      userId: params.userId,
      originalPrompt: prompt,
      sanitizedPrompt,
      finalStatus: "sanitized",
      triggeredLayers,
      actionTaken: "sanitize",
      violationReason: reason
    });

    return {
      status: "sanitized",
      original_prompt: prompt,
      forward_prompt: sanitizedPrompt,
      triggered_layers: triggeredLayers,
      action_taken: "sanitize",
      reason
    };
  }

  const actionTaken = action === "reject_with_reason" ? "reject_with_reason" : "reject";

  await savePromptLog({
    userId: params.userId,
    originalPrompt: prompt,
    finalStatus: "malicious",
    triggeredLayers,
    actionTaken,
    violationReason: reason
  });

  return {
    status: "malicious",
    original_prompt: prompt,
    forward_prompt: null,
    triggered_layers: triggeredLayers,
    action_taken: actionTaken,
    reason: action === "reject_with_reason" ? reason : "Prompt rejected by Guard_LM"
  };
}
