/**
 * Calculates Jaccard token similarity between two text strings.
 * Returns a score between 0.0 (completely distinct) and 1.0 (identical tokens).
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  const normalize = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokensA = new Set(normalize(textA));
  const tokensB = new Set(normalize(textB));

  if (tokensA.size === 0 && tokensB.size === 0) return 1.0;
  if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokensA, ...tokensB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Checks if a candidate text is a duplicate of any existing text in a list.
 * Default similarity threshold is 0.82 (82%).
 */
export function detectDuplicate(
  candidateText: string,
  existingTexts: Array<{ id: string; text: string }>,
  threshold = 0.70
): { isDuplicate: boolean; matchedId?: string; similarityScore: number } {
  let highestSimilarity = 0;
  let matchedId: string | undefined;

  for (const item of existingTexts) {
    const similarity = calculateTextSimilarity(candidateText, item.text);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      matchedId = item.id;
    }
    if (similarity >= threshold) {
      return {
        isDuplicate: true,
        matchedId: item.id,
        similarityScore: Number(similarity.toFixed(3)),
      };
    }
  }

  return {
    isDuplicate: false,
    matchedId,
    similarityScore: Number(highestSimilarity.toFixed(3)),
  };
}
