import { generateObject, LanguageModel } from 'ai';
import { z } from 'zod';

export async function evaluateLLM(
  pattern: string,
  input: string,
  threshold: number,
  llmModel: LanguageModel
): Promise<{ matched: boolean; score: number; reason: string }> {
  try {
    const { object } = await generateObject({
      model: llmModel,
      temperature: 0.1, // Low temperature for consistent classification
      schema: z.object({
        matched: z.boolean(),
        confidence: z.number().min(0).max(1),
        reason: z.string(),
      }),
      system: "You are a specialized security evaluator for AI prompts. Your task is to analyze if a given text matches specific criteria.",
      prompt: `Criteria: ${pattern}\n\nText to evaluate: ${input}\n\nEvaluate if the text matches the criteria and provide a confidence score (0-1) and a brief reason.`,
    });

    return {
      matched: object.confidence >= threshold,
      score: object.confidence,
      reason: object.reason,
    };
  } catch (error) {
    console.error('LLM evaluation error:', error);
    return {
      matched: false,
      score: 0,
      reason: 'Evaluation failed due to an error.',
    };
  }
}
