import { AssessmentEvaluationBreakdownItem, MCQAnswerKey, MCQQuestion } from '@projuktix/types';

export interface ScoreAssessmentInput {
  responses: Record<string, string[]>; // questionId -> selectedOptionIds
  questions: MCQQuestion[];
  answerKeys: Record<string, MCQAnswerKey>; // questionId -> MCQAnswerKey
  passPercentage: number;
  negativeMarkingRate?: number; // e.g. 0.25 (subtract 25% of question value if wrong)
}

export interface ScoreAssessmentResult {
  score: number; // 0 to 100 percentage
  rawScore: number;
  maxScore: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  weakTopicIds: string[];
  breakdown: AssessmentEvaluationBreakdownItem[];
}

export function scoreAssessment(input: ScoreAssessmentInput): ScoreAssessmentResult {
  const { responses, questions, answerKeys, passPercentage, negativeMarkingRate = 0 } = input;

  let rawScore = 0;
  const maxScore = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const topicStats: Record<string, { total: number; correct: number }> = {};
  const breakdown: AssessmentEvaluationBreakdownItem[] = [];

  for (const q of questions) {
    const key = answerKeys[q.id];
    const selected = responses[q.id] || [];

    if (!topicStats[q.topicId]) {
      topicStats[q.topicId] = { total: 0, correct: 0 };
    }
    topicStats[q.topicId].total += 1;

    if (!key) {
      // If no key found in database, fail safely
      breakdown.push({
        questionId: q.id,
        userSelectedOptionIds: selected,
        correctOptionIds: [],
        isCorrect: false,
        explanation: 'Answer key not found',
        topicId: q.topicId,
        difficulty: q.difficulty,
      });
      continue;
    }

    if (selected.length === 0) {
      unansweredCount += 1;
      breakdown.push({
        questionId: q.id,
        userSelectedOptionIds: [],
        correctOptionIds: key.correctOptionIds,
        isCorrect: false,
        explanation: key.explanation,
        topicId: q.topicId,
        difficulty: q.difficulty,
      });
      continue;
    }

    // Check if user's selections match key's correct option IDs exactly
    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...key.correctOptionIds].sort();

    const isMatch =
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((val, idx) => val === sortedCorrect[idx]);

    if (isMatch) {
      rawScore += 1;
      correctCount += 1;
      topicStats[q.topicId].correct += 1;
    } else {
      incorrectCount += 1;
      if (negativeMarkingRate > 0) {
        rawScore = rawScore - negativeMarkingRate;
      }
    }

    breakdown.push({
      questionId: q.id,
      userSelectedOptionIds: selected,
      correctOptionIds: key.correctOptionIds,
      isCorrect: isMatch,
      explanation: key.explanation,
      topicId: q.topicId,
      difficulty: q.difficulty,
    });
  }

  const normalizedRaw = Math.max(0, rawScore);
  const scorePercentage = maxScore > 0 ? Math.round((normalizedRaw / maxScore) * 100) : 0;
  const passed = scorePercentage >= passPercentage;

  // Weak topics are topics where score is under 60%
  const weakTopicIds: string[] = [];
  for (const [topicId, stats] of Object.entries(topicStats)) {
    if (stats.total > 0 && stats.correct / stats.total < 0.6) {
      weakTopicIds.push(topicId);
    }
  }

  return {
    score: scorePercentage,
    rawScore: Number(normalizedRaw.toFixed(2)),
    maxScore,
    passed,
    totalQuestions: questions.length,
    correctCount,
    incorrectCount,
    unansweredCount,
    weakTopicIds,
    breakdown,
  };
}
