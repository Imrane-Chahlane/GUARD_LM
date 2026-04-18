# Guard_LM Architecture

Guard_LM is organized as a modular full-stack Next.js app.

## Request Flow

1. Client application sends `api_key` and `prompt` to `POST /api/analyze-prompt`.
2. API key service hashes the provided key and validates it against active stored keys.
3. Pipeline loads the client configuration, blacklist rules, regex rules, and semantic examples.
4. Analysis services run:
   - Static analysis: phrase and regex matching
   - Semantic analysis: mock embedding similarity against malicious examples
   - LLM classification: mock classifier using structured policy rules
5. Aggregation applies the core rule: at least one malicious layer means the prompt is malicious.
6. Configured action is applied.
7. Result is saved to `prompt_logs`.

## Replaceable Services

- `EmbeddingProvider`: replace mock vectors with a real embedding provider.
- `LLMClassifier`: replace mock classification with OpenAI or another model.
- `PromptSanitizer`: replace simple rewrite logic with an LLM-backed safe rewrite.

## Roles

- `CLIENT`: manages own configuration, API keys, logs, subscription, and profile.
- `ADMIN`: can view all logs through the same log service when authenticated as admin.
