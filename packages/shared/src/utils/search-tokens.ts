/**
 * Generates search tokens (normalized words and prefixes) for Firestore indexing.
 * Enables fast `array-contains` search queries within the Spark free tier.
 */
export function generateSearchTokens(...texts: (string | undefined | null)[]): string[] {
  const tokenSet = new Set<string>();

  for (const text of texts) {
    if (!text) continue;
    // Normalize and remove punctuation
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);

    for (const word of words) {
      tokenSet.add(word);
      // Generate prefixes of length 3 to min(word.length, 12)
      for (let i = 3; i <= Math.min(word.length, 12); i++) {
        tokenSet.add(word.substring(0, i));
      }
    }
  }

  // Cap at 100 tokens per document to respect Firestore document constraints
  return Array.from(tokenSet).slice(0, 100);
}
