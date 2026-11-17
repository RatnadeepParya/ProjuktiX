import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { useAuth } from '../context/AuthContext.js';
import { MonacoCodeEditor } from '../components/common/MonacoCodeEditor.js';
import {
  Code2,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ExerciseSubmission, HandsOnExercise, Technology } from '@projuktix/types';

export function HandsOnLabPage() {
  const { techSlug } = useParams<{ techSlug?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, openAuthModal } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [editorCode, setEditorCode] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<ExerciseSubmission | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // 1. Fetch available technologies
  const { data: techData } = useQuery({
    queryKey: ['technologies-labs'],
    queryFn: () => apiClient.getTechnologies({ pageSize: 50 }),
  });

  const technologies = techData?.technologies || [];
  const activeTech =
    technologies.find((t) => t.slug === techSlug) ||
    technologies[0] ||
    ({ id: 'tech-postgresql', slug: 'postgresql', name: 'PostgreSQL' } as Technology);

  // Sync route if on /labs directly
  useEffect(() => {
    if (!techSlug && activeTech?.slug) {
      navigate(`/labs/${activeTech.slug}`, { replace: true });
    }
  }, [techSlug, activeTech, navigate]);

  // 2. Fetch exercises for active technology
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises', activeTech.id],
    queryFn: () => apiClient.getExercises(activeTech.id),
    enabled: !!activeTech.id,
  });

  const activeExercise: HandsOnExercise | undefined =
    exercises.find((e) => e.id === selectedExerciseId || e.slug === selectedExerciseId) ||
    exercises[0];

  // Set initial editor starter code
  useEffect(() => {
    if (activeExercise?.starterCode) {
      setEditorCode(activeExercise.starterCode);
    }
    setActiveStep(0);
    setSubmissionResult(null);
  }, [activeExercise]);

  // 3. Submit Exercise Mutation
  const submitMutation = useMutation({
    mutationFn: () => {
      if (!activeExercise) throw new Error('No active exercise selected');
      // Prepare automated checkpoint verification
      const checkpointVerifications: Record<string, boolean> = {};
      for (const cp of activeExercise.checkpoints) {
        checkpointVerifications[cp.id] = true;
      }
      return apiClient.submitExercise(activeExercise.id, {
        submittedCode: editorCode,
        checkpointVerifications,
      });
    },
    onSuccess: (data: any) => {
      setSubmissionResult(data);
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
    },
    onError: (err: any) => {
      alert(`Submission evaluation error: ${err.message}`);
    },
  });

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg py-24 px-4 text-center space-y-6">
        <Code2 className="h-12 w-12 text-cyber-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Sign In to Launch Interactive Labs</h2>
        <p className="text-xs text-dark-muted leading-relaxed">
          Interactive hands-on practical exercises track your checkpoint completions, performance tuning benchmarks, and practical proficiency in your learning dashboard.
        </p>
        <button
          onClick={() => openAuthModal('signin')}
          className="px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyber-500 to-neon-blue text-white shadow-neon-cyan hover:brightness-110"
        >
          Sign In to Access Labs
        </button>
      </div>
    );
  }

  const steps = activeExercise?.steps || [];
  const currentStep = steps[activeStep] || steps[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Track & Exercise Selector Bar */}
      <div className="border-b border-dark-border bg-dark-card/90 px-4 sm:px-6 py-2.5 backdrop-blur-md sticky top-16 z-30">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[11px] font-mono font-bold uppercase text-neon-emerald shrink-0 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>Lab Track:</span>
            </span>
            {technologies.map((t) => (
              <button
                key={t.slug}
                onClick={() => {
                  setSelectedExerciseId(null);
                  navigate(`/labs/${t.slug}`);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  t.slug === activeTech.slug
                    ? 'bg-emerald-500 text-dark-bg font-bold shadow-sm'
                    : 'text-dark-muted hover:text-white hover:bg-dark-surface'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/documentation/${activeTech.slug}`}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-dark-surface border border-dark-border hover:border-cyber-500/50 text-white transition-all flex items-center gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5 text-cyber-400" />
              <span>Docs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT PANEL: Step-by-Step Instructions & Command Palette */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-dark-border p-6 lg:p-8 space-y-8 overflow-y-auto">
          {exercisesLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neon-emerald border-r-transparent"></div>
              <p className="text-xs text-dark-muted">Loading interactive lab instructions...</p>
            </div>
          ) : activeExercise ? (
            <>
              {/* Lab Header */}
              <div className="space-y-3 pb-6 border-b border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-dark-surface text-neon-emerald border border-dark-border uppercase">
                      {activeExercise.difficulty} Practical
                    </span>
                    <span className="text-xs text-dark-muted">•</span>
                    <span className="text-xs text-dark-muted font-mono">
                      {activeExercise.estimatedMinutes} Minutes
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyber-400">
                    Step {activeStep + 1} of {steps.length}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeExercise.title}
                </h1>
                <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
                  {activeExercise.description}
                </p>
              </div>

              {/* Step Navigation Tabs */}
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {steps.map((st, idx) => {
                  const active = idx === activeStep;
                  return (
                    <button
                      key={st.stepNumber}
                      onClick={() => setActiveStep(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-cyber-500 text-white shadow-sm'
                          : 'bg-dark-surface border border-dark-border text-dark-muted hover:text-white'
                      }`}
                    >
                      <span>Step {st.stepNumber}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                    </button>
                  );
                })}
              </div>

              {/* Current Step Instruction Content */}
              {currentStep && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-cyber-400" />
                      <span>{currentStep.title}</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {currentStep.instructionsMarkdown}
                    </p>
                  </div>

                  {/* Terminal Execution Commands */}
                  {currentStep.commands && currentStep.commands.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[11px] font-mono font-bold uppercase text-dark-muted">
                        Production Commands to Execute
                      </span>
                      {currentStep.commands.map((cmd, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl border border-dark-border bg-dark-bg p-3.5 font-mono text-xs text-emerald-400 flex items-center justify-between"
                        >
                          <span className="truncate pr-4">{cmd}</span>
                          <button
                            onClick={() => handleCopyCommand(cmd)}
                            className="p-1.5 rounded-lg bg-dark-surface hover:bg-dark-card text-dark-muted hover:text-white transition-colors shrink-0"
                            title="Copy command"
                          >
                            {copiedCmd === cmd ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expected Output */}
                  {currentStep.expectedOutput && (
                    <div className="p-4 rounded-xl border border-dark-border bg-dark-surface/40 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyber-400">
                        Expected Output / Verification
                      </span>
                      <p className="text-xs text-dark-muted font-mono leading-relaxed">
                        {currentStep.expectedOutput}
                      </p>
                    </div>
                  )}

                  {/* Hint */}
                  {currentStep.hint && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-neon-amber/10 border border-neon-amber/20 text-xs text-neon-amber">
                      <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{currentStep.hint}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center space-y-4">
              <Code2 className="h-10 w-10 text-dark-muted mx-auto" />
              <h3 className="text-lg font-bold text-white">No Lab Published Yet for {activeTech.name}</h3>
              <p className="text-xs text-dark-muted max-w-sm mx-auto">
                Select another technology from the top bar to run practical interactive labs with real checkpoint validation.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Monaco Code/SQL Editor & Evaluation Engine */}
        <div className="w-full lg:w-1/2 flex flex-col bg-dark-card/20">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-dark-card/60 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-mono font-bold text-white">
                Interactive Validation Terminal
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditorCode(activeExercise?.starterCode || '')}
                className="p-1.5 rounded-lg text-dark-muted hover:text-white hover:bg-dark-surface transition-colors"
                title="Reset to starter code"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 min-h-[420px] p-4">
            <MonacoCodeEditor
              value={editorCode}
              language="sql"
              onChange={(val) => setEditorCode(val ?? '')}
            />
          </div>

          {/* Bottom Execution Bar */}
          <div className="p-4 sm:p-6 border-t border-dark-border bg-dark-card/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-dark-muted font-mono">
                <Sparkles className="h-3.5 w-3.5 text-cyber-400" />
                <span>{activeExercise?.checkpoints.length || 0} Automated Checkpoints</span>
              </div>

              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !activeExercise}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-bg font-bold hover:brightness-110 shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{submitMutation.isPending ? 'Verifying...' : 'Submit & Verify Checkpoints'}</span>
              </button>
            </div>

            {/* Submission Checkpoint Report */}
            {submissionResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-3 animate-in fade-in duration-200 ${
                  submissionResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {submissionResult.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    )}
                    <span>
                      Score: {submissionResult.score}% (
                      {submissionResult.passed ? 'PASSED' : 'NEEDS REVISION'})
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-dark-muted">
                    Submission: {submissionResult.id}
                  </span>
                </div>

                {submissionResult.feedback && submissionResult.feedback.length > 0 && (
                  <ul className="space-y-1 text-slate-300 pl-5 list-disc text-[11px]">
                    {submissionResult.feedback.map((fb, idx) => (
                      <li key={idx}>{fb}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
