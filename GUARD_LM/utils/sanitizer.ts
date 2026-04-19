/**
 * Sanitizes a prompt by replacing a list of matched strings with a placeholder.
 * 
 * @param prompt - The original prompt to sanitize.
 * @param matches - A list of strings found in the prompt that should be redacted.
 * @param placeholder - The string to use for redaction (default: [FILTERED]).
 * @returns The sanitized prompt.
 */
export function sanitizePrompt(
  prompt: string, 
  matches: string[], 
  placeholder: string = "[FILTERED]"
): string {
  if (!matches || matches.length === 0) return prompt;

  // Remove duplicates and sort by length descending to avoid partial replacements of longer matches
  const sortedMatches = Array.from(new Set(matches)).sort((a, b) => b.length - a.length);

  let sanitized = prompt;
  for (const match of sortedMatches) {
    if (!match) continue;
    
    // We use a global regex with escape to replace all occurrences
    const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedMatch, 'g');
    sanitized = sanitized.replace(regex, placeholder);
  }

  return sanitized;
}
