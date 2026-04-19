import { embed, EmbeddingModel } from 'ai';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA * mB === 0) return 0;
  return dotProduct / (mA * mB);
}

export async function evaluateSemantic(
  pattern: string,
  input: string,
  threshold: number,
  embeddingModel: EmbeddingModel,
  cache: Map<string, number[]>
): Promise<{ matched: boolean; score: number }> {
  try {
    // Check cache for pattern embedding
    const patternKey = `pattern:${pattern}`;
    let patternEmbedding = cache.get(patternKey);
    if (!patternEmbedding) {
      const { embedding } = await embed({
        model: embeddingModel,
        value: pattern,
      });
      patternEmbedding = embedding;
      cache.set(patternKey, patternEmbedding);
    }

    // Check cache for input embedding
    const inputKey = `input:${input}`;
    let inputEmbedding = cache.get(inputKey);
    if (!inputEmbedding) {
      const { embedding } = await embed({
        model: embeddingModel,
        value: input,
      });
      inputEmbedding = embedding;
      cache.set(inputKey, inputEmbedding);
    }

    const score = cosineSimilarity(patternEmbedding, inputEmbedding);
    return {
      matched: score >= threshold,
      score,
    };
  } catch (error) {
    console.error('Semantic evaluation error:', error);
    return { matched: false, score: 0 };
  }
}
