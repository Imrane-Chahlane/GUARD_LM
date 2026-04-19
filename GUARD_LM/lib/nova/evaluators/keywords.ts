export interface KeywordMatchResult {
  matched: boolean;
  matches: string[];
}

export function evaluateKeyword(
  pattern: string,
  input: string,
  isRegex: boolean,
  caseSensitive: boolean
): KeywordMatchResult {
  const matches: string[] = [];

  if (isRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(pattern, flags);
      const allMatches = input.matchAll(regex);
      for (const match of allMatches) {
        matches.push(match[0]);
      }
      return {
        matched: matches.length > 0,
        matches
      };
    } catch (_e) {
      console.error('Invalid regex:', pattern);
      return { matched: false, matches: [] };
    }
  }

  const searchText = caseSensitive ? input : input.toLowerCase();
  const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();

  // Find all occurrences of the phrase
  let pos = searchText.indexOf(searchPattern);
  while (pos !== -1) {
    // Extract the original casing from the input
    matches.push(input.substring(pos, pos + pattern.length));
    pos = searchText.indexOf(searchPattern, pos + 1);
  }

  return {
    matched: matches.length > 0,
    matches
  };
}
