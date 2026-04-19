import { z } from 'zod';

export const NovaRuleSchema = z.object({
  name: z.string().optional().describe("The unique name of the rule"),
  meta: z.object({
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  keywords: z.record(
    z.string().describe("The variable name starting with $"),
    z.object({
      pattern: z.string().describe("Exact text or regex pattern"),
      isRegex: z.boolean().default(false),
      caseSensitive: z.boolean().default(false),
    })
  ).optional(),
  semantics: z.record(
    z.string().describe("The variable name starting with $"),
    z.object({
      pattern: z.string().describe("The semantic pattern to match in natural language"),
      threshold: z.number().min(0).max(1).default(0.7).describe("Similarity threshold (0.0 to 1.0)"),
    })
  ).optional(),
  llm: z.record(
    z.string().describe("The variable name starting with $"),
    z.object({
      pattern: z.string().describe("The LLM evaluation criteria in natural language"),
      threshold: z.number().min(0).max(1).default(0.1).describe("Temperature for the LLM evaluation (0.0 to 1.0)"),
    })
  ).optional(),
  condition: z.string().describe("The boolean logic combining the patterns (e.g., '$kw1 or ($s1 and $l1)')"),
  failed: z.enum(['sanitize', 'reject']).default('reject').describe("Action to take if the evaluation fails"),
});

export type NovaRuleDefinition = z.infer<typeof NovaRuleSchema>;
/** @deprecated Use NovaRuleDefinition instead to avoid collision with Prisma NovaRule model */
export type NovaRule = NovaRuleDefinition;

export const JSON_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GuardLM Rule",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "meta": {
      "type": "object",
      "properties": {
        "description": { "type": "string" },
        "author": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } }
      }
    },
    "keywords": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "pattern": { "type": "string" },
          "isRegex": { "type": "boolean" },
          "caseSensitive": { "type": "boolean" }
        },
        "required": ["pattern"]
      }
    },
    "semantics": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "pattern": { "type": "string" },
          "threshold": { "type": "number", "minimum": 0, "maximum": 1 }
        },
        "required": ["pattern"]
      }
    },
    "llm": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "properties": {
          "pattern": { "type": "string" },
          "threshold": { "type": "number", "minimum": 0, "maximum": 1 }
        },
        "required": ["pattern"]
      }
    },
    "condition": { "type": "string" },
    "failed": { 
      "type": "string",
      "enum": ["sanitize", "reject"]
    }
  },
  "required": ["condition"]
};
