import { describe, it, expect } from 'vitest';
import { calculateTextSimilarity, detectDuplicate } from '@projuktix/shared';

describe('Duplicate Content Detection & Quality Integrity', () => {
  const existingQuestions = [
    {
      id: 'existing-1',
      text: 'What background process in Oracle Database writes dirty buffers from the Database Buffer Cache to datafiles?',
    },
    {
      id: 'existing-2',
      text: 'How do you configure automatic memory management in Oracle 19c using SGA_TARGET?',
    },
  ];

  it('should identify near-identical candidate questions as duplicates', () => {
    const candidate =
      'Which background process in Oracle Database writes dirty buffers from the Database Buffer Cache to datafiles?';
    const result = detectDuplicate(candidate, existingQuestions);

    expect(result.isDuplicate).toBe(true);
    expect(result.matchedId).toBe('existing-1');
    expect(result.similarityScore).toBeGreaterThanOrEqual(0.7);
  });

  it('should allow distinct questions to pass duplicate verification', () => {
    const candidate = 'Explain how the Multi-Version Concurrency Control (MVCC) mechanism operates using Undo segments.';
    const result = detectDuplicate(candidate, existingQuestions);

    expect(result.isDuplicate).toBe(false);
    expect(result.similarityScore).toBeLessThan(0.4);
  });

  it('should return 1.0 similarity for identical texts', () => {
    const text = 'Oracle Automatic Shared Memory Management';
    expect(calculateTextSimilarity(text, text)).toBe(1.0);
  });
});
