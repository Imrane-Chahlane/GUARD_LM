import type { ClientSecurityBundle, LayerResult } from "@/types/analysis";

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  similarity(left: number[], right: number[]): number;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function hashToken(token: string, size: number) {
  let hash = 0;
  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) % size;
  }
  return hash;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  private readonly dimensions = 64;

  async embed(text: string) {
    const vector = Array.from({ length: this.dimensions }, () => 0);

    for (const token of tokenize(text)) {
      vector[hashToken(token, this.dimensions)] += 1;
    }

    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => value / magnitude);
  }

  similarity(left: number[], right: number[]) {
    return left.reduce((sum, value, index) => sum + value * (right[index] || 0), 0);
  }
}

export function getEmbeddingProvider(): EmbeddingProvider {
  // TODO: Swap this for OpenAI, Voyage, Cohere, or a local embedding model.
  return new MockEmbeddingProvider();
}

export async function runSemanticAnalysis(
  prompt: string,
  config: Pick<
    ClientSecurityBundle,
    "enableSemanticAnalysis" | "semanticThreshold" | "semanticExamples"
  >,
  provider = getEmbeddingProvider()
): Promise<LayerResult> {
  if (!config.enableSemanticAnalysis || config.semanticExamples.length === 0) {
    return { layer: "semantic", malicious: false, score: 0 };
  }

  const promptEmbedding = await provider.embed(prompt);
  let highestScore = 0;
  let closestExample: string | null = null;

  for (const example of config.semanticExamples.filter((item) => item.label === "malicious")) {
    const exampleEmbedding = await provider.embed(example.text);
    const score = provider.similarity(promptEmbedding, exampleEmbedding);

    if (score > highestScore) {
      highestScore = score;
      closestExample = example.text;
    }
  }

  if (highestScore >= config.semanticThreshold) {
    return {
      layer: "semantic",
      malicious: true,
      score: Number(highestScore.toFixed(4)),
      reason: `Prompt is semantically similar to a known malicious example (${highestScore.toFixed(2)} similarity)`,
      matches: closestExample
        ? [
            {
              closestExample,
              score: Number(highestScore.toFixed(4)),
              threshold: config.semanticThreshold
            }
          ]
        : []
    };
  }

  return {
    layer: "semantic",
    malicious: false,
    score: Number(highestScore.toFixed(4)),
    matches: closestExample
      ? [
          {
            closestExample,
            score: Number(highestScore.toFixed(4)),
            threshold: config.semanticThreshold
          }
        ]
      : []
  };
}
