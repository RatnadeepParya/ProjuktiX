import { describe, it, expect } from 'vitest';
import { scoreAssessment } from '@projuktix/shared';
import { MCQQuestion, MCQAnswerKey } from '@projuktix/types';

describe('Assessment Scoring Engine & Answer Key Protection', () => {
  const mockQuestions: MCQQuestion[] = [
    {
      id: 'q1',
      technologyId: 'tech-oracle-db',
      topicId: 'oracle-memory',
      questionType: 'single_choice',
      promptMarkdown: 'What process writes dirty blocks to disk?',
      options: [
        { id: 'opt-a', text: 'LGWR' },
        { id: 'opt-b', text: 'DBWn' },
        { id: 'opt-c', text: 'SMON' },
      ],
      difficulty: 'intermediate',
      tags: ['oracle'],
      estimatedSeconds: 45,
      status: 'published',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'q2',
      technologyId: 'tech-oracle-db',
      topicId: 'oracle-wal',
      questionType: 'single_choice',
      promptMarkdown: 'What process writes redo log buffers to disk?',
      options: [
        { id: 'opt-a', text: 'LGWR' },
        { id: 'opt-b', text: 'DBWn' },
        { id: 'opt-c', text: 'PMON' },
      ],
      difficulty: 'intermediate',
      tags: ['oracle'],
      estimatedSeconds: 45,
      status: 'published',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockAnswerKeys: Record<string, MCQAnswerKey> = {
    q1: {
      questionId: 'q1',
      correctOptionIds: ['opt-b'],
      explanation: 'DBWn writes dirty blocks asynchronously to datafiles.',
      references: ['Oracle Concepts Guide'],
    },
    q2: {
      questionId: 'q2',
      correctOptionIds: ['opt-a'],
      explanation: 'LGWR writes redo records sequentially on commit.',
      references: ['Oracle Concepts Guide'],
    },
  };

  it('should score 100% when all user answers match the protected answer keys', () => {
    const result = scoreAssessment({
      responses: {
        q1: ['opt-b'],
        q2: ['opt-a'],
      },
      questions: mockQuestions,
      answerKeys: mockAnswerKeys,
      passPercentage: 75,
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctCount).toBe(2);
    expect(result.incorrectCount).toBe(0);
    expect(result.weakTopicIds).toHaveLength(0);
  });

  it('should fail and compute weak topics when score is below pass percentage', () => {
    const result = scoreAssessment({
      responses: {
        q1: ['opt-a'], // Incorrect
        q2: ['opt-a'], // Correct
      },
      questions: mockQuestions,
      answerKeys: mockAnswerKeys,
      passPercentage: 75,
    });

    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(1);
    expect(result.weakTopicIds).toContain('oracle-memory');
  });

  it('should calculate negative marking accurately when configured', () => {
    const result = scoreAssessment({
      responses: {
        q1: ['opt-a'], // Incorrect (-0.25)
        q2: ['opt-a'], // Correct (1.0)
      },
      questions: mockQuestions,
      answerKeys: mockAnswerKeys,
      passPercentage: 50,
      negativeMarkingRate: 0.25,
    });

    // rawScore: 1.0 - 0.25 = 0.75 out of 2 = 37.5% -> 38%
    expect(result.rawScore).toBe(0.75);
    expect(result.score).toBe(38);
    expect(result.passed).toBe(false);
  });
});
