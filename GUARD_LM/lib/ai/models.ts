import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { EmbeddingModel, LanguageModel } from 'ai';

export type ProviderType = 'openai' | 'anthropic' | 'google' | 'openai-compatible';

export interface ModelOptions {
  apiKey: string;
  baseUrl?: string;
  modelName: string;
}

export function getLLMModel(provider: ProviderType, options: ModelOptions): LanguageModel {
  const { apiKey, baseUrl, modelName } = options;
  const config = {
    apiKey,
    ...(baseUrl && baseUrl.trim() !== "" ? { baseURL: baseUrl.trim() } : {})
  };

  switch (provider) {
    case 'openai':
      return createOpenAI(config)(modelName);
    case 'anthropic':
      return createAnthropic(config)(modelName);
    case 'google':
      return createGoogleGenerativeAI(config)(modelName);
    case 'openai-compatible':
      return createOpenAICompatible({
        name: 'custom',
        apiKey: config.apiKey,
        baseURL: config.baseURL || 'http://localhost:11434/v1', // Fallback to a common default like Ollama
      })(modelName);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function getEmbeddingModel(provider: ProviderType, options: ModelOptions): EmbeddingModel {
  const { apiKey, baseUrl, modelName } = options;
  const config = {
    apiKey,
    ...(baseUrl && baseUrl.trim() !== "" ? { baseURL: baseUrl.trim() } : {})
  };

  switch (provider) {
    case 'openai':
      return createOpenAI(config).embedding(modelName);
    case 'google':
      return createGoogleGenerativeAI(config).textEmbeddingModel(modelName);
    case 'openai-compatible':
      return (createOpenAICompatible({
        name: 'custom',
        apiKey: config.apiKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        baseURL: config.baseURL || 'http://localhost:11434/v1',
      }) as any).embedding(modelName);
    default:
      throw new Error(`Unsupported provider for embeddings: ${provider}`);
  }
}
