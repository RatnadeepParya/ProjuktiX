import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import {
  Compass,
  BookOpen,
  Code2,
  CheckSquare,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  Tag,
  GitBranch,
} from 'lucide-react';

export function TechnologyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'courses' | 'labs' | 'assessments'>('roadmap');

  const { data: tech, isLoading: techLoading } = useQuery({
    queryKey: ['technology', slug],
    queryFn: () => (slug ? apiClient.getTechnology(slug) : null),
    enabled: !!slug,
  });

  const { data: roadmap = [] } = useQuery({
    queryKey: ['roadmap', tech?.id],
    queryFn: () => (tech ? apiClient.getRoadmap(tech.id) : []),
    enabled: !!tech,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', tech?.id],
    queryFn: () => (tech ? apiClient.getCourses(tech.id) : []),
    enabled: !!tech,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises', tech?.id],
    queryFn: () => (tech ? apiClient.getExercises(tech.id) : []),
    enabled: !!tech,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments', tech?.id],
    queryFn: () => (tech ? apiClient.getAssessments(tech.id) : []),
    enabled: !!tech,
  });

  if (techLoading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyber-500 border-r-transparent"></div>
        <p className="text-xs text-dark-muted">Loading technology architecture and syllabus...</p>
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Technology Not Found</h2>
        <p className="text-xs text-dark-muted">The requested technology track could not be located.</p>
        <Link to="/explore" className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyber-500 text-white">
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Technology Hero */}
      <div className="rounded-3xl border border-dark-border bg-dark-card/90 p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start space-x-5">
            {tech.logoUrl ? (
              <img
                src={tech.logoUrl}
                alt={tech.name}
                className="h-16 w-16 object-contain rounded-2xl p-2 bg-dark-surface border border-dark-border shadow-inner"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-cyber-500/20 text-cyber-400 flex items-center justify-center font-bold text-xl border border-cyber-500/30">
                {tech.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyber-500/10 text-cyber-300 border border-cyber-500/20">
                  {tech.domainSlug}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 capitalize">
                  {tech.status}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {tech.name}
              </h1>
              <p className="text-xs sm:text-sm text-dark-muted max-w-2xl leading-relaxed">
                {tech.longDescription || tech.shortDescription}
              </p>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px]">
            <Link
              to={`/documentation/${tech.slug}`}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyber-500 to-neon-blue text-white shadow-neon-cyan hover:brightness-110 transition-all text-center"
            >
              <BookOpen className="h-4 w-4" />
              <span>Read Documentation</span>
            </Link>
            <Link
              to={`/labs/${tech.slug}`}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-dark-surface border border-dark-border hover:bg-dark-border text-white transition-all text-center"
            >
              <Code2 className="h-4 w-4 text-neon-emerald" />
              <span>Launch Hands-On Lab</span>
            </Link>
          </div>
        </div>

        {/* Technology Versions & Tags */}
        <div className="mt-8 pt-6 border-t border-dark-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-dark-muted font-medium flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-cyber-400" />
              Supported Versions:
            </span>
            <div className="flex flex-wrap gap-2">
              {tech.versions?.map((v) => (
                <span
                  key={v.id}
                  className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] border ${
                    v.isDefault
                      ? 'bg-cyber-500/20 text-cyber-300 border-cyber-500/40'
                      : 'bg-dark-surface text-dark-muted border-dark-border'
                  }`}
                >
                  {v.versionString}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tech.tags?.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-[10px] bg-dark-surface/60 text-dark-muted border border-dark-border"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-dark-border flex space-x-8 text-sm">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'roadmap' ? 'text-cyber-400' : 'text-dark-muted hover:text-white'
          }`}
        >
          4-Stage Roadmap
          {activeTab === 'roadmap' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyber-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'courses' ? 'text-cyber-400' : 'text-dark-muted hover:text-white'
          }`}
        >
          Courses & Syllabus ({courses.length})
          {activeTab === 'courses' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyber-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'labs' ? 'text-cyber-400' : 'text-dark-muted hover:text-white'
          }`}
        >
          Practical Labs ({exercises.length})
          {activeTab === 'labs' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyber-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`pb-3 font-semibold transition-all relative ${
            activeTab === 'assessments' ? 'text-cyber-400' : 'text-dark-muted hover:text-white'
          }`}
        >
          Certification Mock Exams ({assessments.length})
          {activeTab === 'assessments' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyber-500 rounded-full" />
          )}
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Universal Learning Roadmap</h3>
            <p className="text-xs text-dark-muted">
              Structured progressive path from fundamentals to enterprise resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.map((stage) => (
              <div
                key={stage.stage}
                className="rounded-2xl border border-dark-border bg-dark-card p-6 space-y-4 hover:border-cyber-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyber-400 uppercase">
                      Stage 0{stage.order}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-dark-surface text-dark-muted border border-dark-border">
                      {stage.stage}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{stage.title}</h4>
                  <p className="text-xs text-dark-muted leading-relaxed">{stage.description}</p>
                </div>

                <Link
                  to={`/documentation/${tech.slug}`}
                  className="pt-4 border-t border-dark-border/60 flex items-center justify-between text-xs font-semibold text-cyber-400 hover:text-white transition-colors"
                >
                  <span>Explore Stage</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-4">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.id}
                className="p-6 rounded-2xl border border-dark-border bg-dark-card hover:bg-dark-cardHover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-dark-surface text-cyber-400 border border-dark-border">
                      {course.difficulty}
                    </span>
                    <span className="text-xs text-dark-muted font-mono">{course.lessonCount} Lessons</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{course.title}</h4>
                  <p className="text-xs text-dark-muted leading-relaxed">{course.description}</p>
                </div>

                <Link
                  to={`/documentation/${tech.slug}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan transition-all flex items-center gap-1.5"
                >
                  <span>Start Course</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-dark-muted rounded-2xl border border-dark-border bg-dark-card">
              No published courses for this technology yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="space-y-4">
          {exercises.length > 0 ? (
            exercises.map((ex) => (
              <div
                key={ex.id}
                className="p-6 rounded-2xl border border-dark-border bg-dark-card hover:bg-dark-cardHover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-dark-surface text-neon-emerald border border-dark-border">
                      {ex.exerciseType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-dark-muted font-mono">
                      ~{ex.estimatedMinutes} Mins
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{ex.title}</h4>
                  <p className="text-xs text-dark-muted leading-relaxed">{ex.description}</p>
                </div>

                <Link
                  to={`/labs/${tech.slug}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-neon-emerald text-dark-bg hover:brightness-110 font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Launch Lab</span>
                  <Code2 className="h-4 w-4" />
                </Link>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-dark-muted rounded-2xl border border-dark-border bg-dark-card">
              No hands-on practical exercises published yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="p-8 rounded-2xl border border-dark-border bg-dark-card space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              Official ProjuktiX Certification Mock Examinations
            </h3>
            <p className="text-xs text-dark-muted max-w-xl">
              Timed comprehensive assessments testing technical accuracy, internal architecture, and troubleshooting.
              Passing scores earn a verifiable ProjuktiX Credential.
            </p>
          </div>

          {assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((assess) => (
                <div
                  key={assess.id}
                  className="p-5 rounded-xl bg-dark-surface/60 border border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{assess.title}</div>
                    <div className="text-xs text-dark-muted">
                      {assess.timeLimitMinutes} Minutes • Negative Marking: {assess.negativeMarkingRate || 0} • Pass Rate: {assess.passPercentage}% • {assess.totalQuestions} Questions
                    </div>
                  </div>

                  <Link
                    to={`/assessments/${assess.slug || assess.id}`}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan transition-all"
                  >
                    Start Examination
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-dark-muted rounded-xl border border-dark-border bg-dark-surface/40">
              No published certification mock exams for this technology track yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
