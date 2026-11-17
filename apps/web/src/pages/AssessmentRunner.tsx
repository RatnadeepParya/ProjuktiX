import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { useAuth } from '../context/AuthContext.js';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';
import { AssessmentAttempt, AssessmentSet, Certificate, MCQQuestion } from '@projuktix/types';

export function AssessmentRunnerPage() {
  const { examId } = useParams<{ examId?: string }>();
  const navigate = useNavigate();
  const { profile, openAuthModal } = useAuth();

  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1800); // 30 mins
  const [evaluationResult, setEvaluationResult] = useState<{
    attempt: AssessmentAttempt;
    certificate?: Certificate;
  } | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  // 1. Fetch all assessment sets for the directory
  const { data: allAssessments = [], isLoading: allLoading } = useQuery({
    queryKey: ['assessments-all'],
    queryFn: () => apiClient.getAssessments(),
  });

  // 2. Fetch specific assessment if examId is provided
  const { data: assessmentMeta, isLoading: metaLoading } = useQuery({
    queryKey: ['assessment-meta', examId],
    queryFn: () => (examId ? apiClient.getAssessment(examId) : null),
    enabled: !!examId,
  });

  // 3. Start Assessment Mutation
  const startMutation = useMutation({
    mutationFn: (targetId: string) => apiClient.startAssessment(targetId),
    onSuccess: (data) => {
      setAttempt(data.attempt);
      setQuestions(data.questions);
      setTimeRemainingSeconds((assessmentMeta?.timeLimitMinutes || 30) * 60);
      setEvaluationResult(null);
      setCurrentIndex(0);
      setSelectedAnswers({});
    },
    onError: (err: any) => {
      alert(`Could not start assessment: ${err.message}`);
    },
  });

  // 4. Submit Assessment Mutation
  const submitMutation = useMutation({
    mutationFn: () => {
      const timeSpent = (assessmentMeta?.timeLimitMinutes || 30) * 60 - timeRemainingSeconds;
      return apiClient.submitAssessment({
        attemptId: attempt!.id,
        responses: selectedAnswers,
        timeSpentSeconds: Math.max(0, timeSpent),
      });
    },
    onSuccess: (data) => {
      setEvaluationResult(data);
    },
    onError: (err: any) => {
      alert(`Error evaluating assessment: ${err.message}`);
    },
  });

  // Timer countdown
  useEffect(() => {
    if (!attempt || evaluationResult || timeRemainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitMutation.mutate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt, evaluationResult, timeRemainingSeconds]);

  const handleStartExam = (targetExam: AssessmentSet) => {
    if (!profile) {
      openAuthModal('signin');
      return;
    }
    navigate(`/assessments/${targetExam.slug}`);
    startMutation.mutate(targetExam.id);
  };

  const handleSelectOption = (questionId: string, optionId: string, isMulti: boolean) => {
    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMulti) {
        return {
          ...prev,
          [questionId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return {
        ...prev,
        [questionId]: [optionId],
      };
    });
  };

  // IF NO SPECIFIC EXAM SELECTED -> RENDER ASSESSMENT CATALOG
  if (!examId || (!assessmentMeta && !metaLoading && !attempt)) {
    const filtered = allAssessments.filter(
      (a) =>
        a.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyber-400 font-semibold mb-1">
            <CheckSquare className="h-4 w-4" />
            <span>Verified Knowledge Evaluation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Certification & Mock Examinations Directory
          </h1>
          <p className="text-xs sm:text-sm text-dark-muted mt-1 max-w-3xl leading-relaxed">
            Standardized technical examinations modeled after industry certifications.
            Each exam isolates answer keys on backend servers, calculates weighted score metrics, and generates tamper-proof credentials.
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search examinations (CKA, PostgreSQL, TypeScript, etc.)..."
            className="w-full rounded-xl border border-dark-border bg-dark-card pl-10 pr-4 py-2.5 text-xs text-white placeholder-dark-muted focus:border-cyber-500 focus:outline-none"
          />
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between hover:border-cyber-500/40 hover:bg-dark-cardHover transition-all shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-dark-surface border border-dark-border text-cyber-400 uppercase">
                      {item.difficulty}
                    </span>
                    <span className="text-xs font-mono text-dark-muted">
                      Pass: {item.passPercentage}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-dark-muted line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-dark-muted pt-2 border-t border-dark-border/60">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-cyber-400" />
                      {item.totalQuestions || item.questionIds?.length || 10} Questions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-neon-cyan" />
                      {item.timeLimitMinutes} Mins
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartExam(item)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-cyber-500 hover:bg-cyber-400 text-white shadow-neon-cyan transition-all flex items-center justify-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  <span>Launch Examination</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-16 text-center text-xs text-dark-muted rounded-2xl border border-dark-border bg-dark-card">
              {allLoading ? 'Loading examinations directory...' : 'No published assessments found matching query.'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // IF EXAM IS COMPLETED -> RENDER SCORE REPORT & CERTIFICATE
  if (evaluationResult) {
    const isPassed = evaluationResult.attempt.passed;
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 space-y-8 animate-in fade-in duration-200">
        <div
          className={`p-8 rounded-3xl border text-center space-y-6 ${
            isPassed
              ? 'border-emerald-500/30 bg-emerald-500/10'
              : 'border-rose-500/30 bg-rose-500/10'
          }`}
        >
          {isPassed ? (
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-rose-400 mx-auto" />
          )}

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isPassed ? 'Congratulations! Examination Passed' : 'Assessment Completed — Needs Revision'}
            </h2>
            <p className="text-xs text-dark-muted max-w-md mx-auto">
              {isPassed
                ? 'You demonstrated verified technical mastery and met the enterprise standard score.'
                : 'You scored below the passing threshold. Review the core encyclopedia chapters and retake when prepared.'}
            </p>
          </div>

          <div className="flex justify-center gap-8 py-4 border-y border-dark-border/60">
            <div>
              <div className="text-3xl font-black text-white">{evaluationResult.attempt.score}%</div>
              <div className="text-[11px] uppercase tracking-wider text-dark-muted font-semibold mt-1">
                Your Score
              </div>
            </div>
            <div className="border-l border-dark-border/60 pl-8">
              <div className="text-3xl font-black text-cyber-400">
                {assessmentMeta?.passPercentage || 75}%
              </div>
              <div className="text-[11px] uppercase tracking-wider text-dark-muted font-semibold mt-1">
                Passing Cutoff
              </div>
            </div>
          </div>

          {evaluationResult.certificate && (
            <div className="p-4 rounded-2xl bg-dark-surface/60 border border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                  Credential Issued
                </span>
                <p className="text-xs font-semibold text-white">
                  Certificate #{evaluationResult.certificate.certificateNumber}
                </p>
              </div>
              <Link
                to={`/verify/${evaluationResult.certificate.id}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-dark-bg font-bold hover:brightness-110 shadow-lg"
              >
                View Credential
              </Link>
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setAttempt(null);
                setEvaluationResult(null);
                navigate('/assessments');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-dark-surface border border-dark-border text-white hover:bg-dark-card"
            >
              Back to Assessments
            </button>
            <button
              onClick={() => handleStartExam(assessmentMeta!)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retake Examination</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // IF EXAM IS IN PROGRESS -> RENDER QUESTION RUNNER
  if (attempt && questions.length > 0) {
    const currentQ = questions[currentIndex]!;
    const isMulti = currentQ.questionType === 'multiple_choice';
    const currentSelections = selectedAnswers[currentQ.id] || [];

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Top Timer Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-dark-border bg-dark-card shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-cyber-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-neon-amber">
            <Clock className="h-4 w-4" />
            <span>Time Left: {formatTime(timeRemainingSeconds)}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-3xl border border-dark-border bg-dark-card p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-dark-surface text-cyber-400 border border-dark-border">
                {isMulti ? 'Multiple Answers Required' : 'Single Choice'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-dark-surface text-dark-muted border border-dark-border">
                {currentQ.difficulty}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.promptMarkdown}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const selected = currentSelections.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id, isMulti)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${
                    selected
                      ? 'border-cyber-500 bg-cyber-500/15 text-white font-medium shadow-neon-cyan'
                      : 'border-dark-border bg-dark-surface/60 text-slate-300 hover:border-dark-borderHover hover:text-white'
                  }`}
                >
                  <span>{opt.text}</span>
                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      selected
                        ? 'border-cyber-500 bg-cyber-500 text-white'
                        : 'border-dark-border bg-dark-bg'
                    }`}
                  >
                    {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Question Navigation */}
          <div className="pt-4 border-t border-dark-border flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-surface border border-dark-border text-white disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyber-500 hover:bg-cyber-400 text-white shadow-neon-cyan flex items-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-dark-bg font-bold shadow-lg"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Finalize & Submit Exam'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // IF EXAM IS LOADED BUT NOT STARTED YET -> RENDER BRIEFING & START BUTTON
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 space-y-8 animate-in fade-in duration-200">
      <div className="p-8 rounded-3xl border border-dark-border bg-dark-card space-y-6 shadow-2xl">
        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-dark-surface border border-dark-border text-cyber-400 uppercase">
            {assessmentMeta?.difficulty || 'Expert'} Certification
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {assessmentMeta?.title}
          </h1>
          <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
            {assessmentMeta?.description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-dark-surface/50 border border-dark-border text-center">
          <div>
            <div className="text-xl font-bold text-white">{assessmentMeta?.timeLimitMinutes} Mins</div>
            <div className="text-[10px] text-dark-muted uppercase font-semibold">Time Limit</div>
          </div>
          <div className="border-x border-dark-border">
            <div className="text-xl font-bold text-cyber-400">{assessmentMeta?.totalQuestions || assessmentMeta?.questionIds?.length || 10}</div>
            <div className="text-[10px] text-dark-muted uppercase font-semibold">Questions</div>
          </div>
          <div>
            <div className="text-xl font-bold text-neon-emerald">{assessmentMeta?.passPercentage}%</div>
            <div className="text-[10px] text-dark-muted uppercase font-semibold">Pass Threshold</div>
          </div>
        </div>

        <button
          onClick={() => handleStartExam(assessmentMeta!)}
          disabled={startMutation.isPending}
          className="w-full py-3.5 px-6 rounded-xl text-xs font-semibold bg-cyber-500 hover:bg-cyber-400 text-white shadow-neon-cyan transition-all flex items-center justify-center gap-2"
        >
          <Award className="h-4 w-4" />
          <span>{startMutation.isPending ? 'Preparing Exam Pool...' : 'Start Examination'}</span>
        </button>
      </div>
    </div>
  );
}
