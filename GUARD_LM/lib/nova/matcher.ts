import { NovaRuleDefinition } from './schema';
import { evaluateKeyword } from './evaluators/keywords';
import { evaluateSemantic } from './evaluators/semantics';
import { evaluateLLM } from './evaluators/llm';
import { evaluateCondition } from './evaluators/condition';
import { LanguageModel, EmbeddingModel } from 'ai';

export interface MatchResult {
  matched: boolean;
  score: number;
  details: Record<string, { matched: boolean; score: number; reason?: string; matches?: string[] }>;
}

export async function checkRule(
  rule: NovaRuleDefinition,
  input: string,
  models: { llm?: LanguageModel; embedding?: EmbeddingModel },
  cache: Map<string, number[]>
): Promise<MatchResult> {
  const results: Record<string, boolean> = {};
  const scores: Record<string, { matched: boolean; score: number; reason?: string; matches?: string[] }> = {};

  // Stage 1: Keywords (Fastest)
  if (rule.keywords) {
    for (const [key, p] of Object.entries(rule.keywords)) {
      const matchDetails = evaluateKeyword(p.pattern, input, p.isRegex, p.caseSensitive);
      results[key] = matchDetails.matched;
      scores[key] = { 
        matched: matchDetails.matched, 
        score: matchDetails.matched ? 1 : 0,
        matches: matchDetails.matches
      };
    }
  }

  // Stage 2: Semantics (Medium)
  if (rule.semantics && models.embedding) {
    for (const [key, p] of Object.entries(rule.semantics)) {
      if (rule.condition.includes(key)) {
        const { matched, score } = await evaluateSemantic(
          p.pattern,
          input,
          p.threshold,
          models.embedding,
          cache
        );
        results[key] = matched;
        scores[key] = { matched, score };
      }
    }
  }

  // Stage 3: LLM (Slowest)
  if (rule.llm && models.llm) {
    for (const [key, p] of Object.entries(rule.llm)) {
      if (rule.condition.includes(key)) {
        const { matched, score, reason } = await evaluateLLM(
          p.pattern,
          input,
          p.threshold,
          models.llm
        );
        results[key] = matched;
        scores[key] = { matched, score, reason };
      }
    }
  }

  const finalMatch = evaluateCondition(rule.condition, results);

  return {
    matched: finalMatch,
    score: finalMatch ? 1 : 0,
    details: scores,
  };
}
