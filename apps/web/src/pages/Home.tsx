import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Compass,
  BookOpen,
  Code2,
  CheckSquare,
  Award,
  ArrowRight,
  Database,
  Server,
  Cloud,
  Cpu,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { profile, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => apiClient.getDomains(),
  });

  const { data: techData } = useQuery({
    queryKey: ['technologies-home'],
    queryFn: () => apiClient.getTechnologies({ pageSize: 6 }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const technologies = techData?.technologies || [];

  return (
    <div className="space-y-24 pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Futuristic glowing atmospheric background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-cyber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-neon-indigo/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyber-500/30 bg-cyber-500/10 text-xs font-semibold text-cyber-300">
            <Sparkles className="h-3.5 w-3.5 text-cyber-400" />
            <span>Universal Open-Source Technology Encyclopedia & Academy</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Master Any Technology from{' '}
            <span className="bg-gradient-to-r from-cyber-400 via-neon-cyan to-neon-indigo bg-clip-text text-transparent">
              Internal Architecture
            </span>{' '}
            to Enterprise Scale.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-dark-muted max-w-3xl mx-auto leading-relaxed">
            ProjuktiX combines a universal technical encyclopedia, structured professional roadmaps,
            deep documentation, hands-on terminal labs, massive verified question banks, and authentic mock examinations.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="flex items-center rounded-2xl border border-dark-border bg-dark-card/90 shadow-2xl p-2 transition-all focus-within:border-cyber-500 focus-within:ring-2 focus-within:ring-cyber-500/20">
              <Search className="h-5 w-5 text-cyber-400 ml-3 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 24 technology domains: TypeScript, Kubernetes, PostgreSQL, Python, AWS..."
                className="w-full bg-transparent text-sm text-white placeholder-dark-muted focus:outline-none py-2"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyber-500 to-neon-blue text-white hover:brightness-110 shadow-neon-cyan transition-all"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action CTAs & Auth */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/explore"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-dark-surface border border-dark-border hover:border-cyber-500/50 hover:bg-dark-card text-white transition-all shadow-lg"
            >
              <Compass className="h-4 w-4 text-cyber-400" />
              <span>Explore All Technologies</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!profile && (
              <button
                onClick={() => openAuthModal('signin')}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-white text-dark-bg hover:bg-slate-100 shadow-xl transition-all"
              >
                <Sparkles className="h-4 w-4 text-cyber-500" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Platform Real-Time Telemetry Counters */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md">
          <div className="text-center p-3">
            <div className="text-3xl font-extrabold text-white">24</div>
            <div className="text-xs text-dark-muted uppercase tracking-wider font-semibold mt-1">
              Technology Domains
            </div>
          </div>
          <div className="text-center p-3 border-l border-dark-border/60">
            <div className="text-3xl font-extrabold text-cyber-400">1,001+</div>
            <div className="text-xs text-dark-muted uppercase tracking-wider font-semibold mt-1">
              Target MCQs / Tech
            </div>
          </div>
          <div className="text-center p-3 border-l border-dark-border/60">
            <div className="text-3xl font-extrabold text-neon-cyan">1,001+</div>
            <div className="text-xs text-dark-muted uppercase tracking-wider font-semibold mt-1">
              Target Labs / Tech
            </div>
          </div>
          <div className="text-center p-3 border-l border-dark-border/60">
            <div className="text-3xl font-extrabold text-neon-emerald">100%</div>
            <div className="text-xs text-dark-muted uppercase tracking-wider font-semibold mt-1">
              Database-Driven (Firestore)
            </div>
          </div>
        </div>
      </section>

      {/* 3. Flagship Learning Tracks */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Flagship Technology Academies
            </h2>
            <p className="text-sm text-dark-muted mt-1">
              Deep, architecture-level technical curricula inspired by enterprise encyclopedias.
            </p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-1.5 text-xs font-semibold text-cyber-400 hover:text-cyber-300 transition-colors"
          >
            <span>View All Tracks</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {technologies.length > 0 ? (
            technologies.map((tech) => (
              <div
                key={tech.slug}
                className="group relative rounded-2xl border border-dark-border bg-dark-card p-6 hover:border-cyber-500/50 hover:bg-dark-cardHover transition-all shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {tech.logoUrl ? (
                        <img
                          src={tech.logoUrl}
                          alt={tech.name}
                          className="h-9 w-9 object-contain rounded-xl p-1 bg-dark-surface border border-dark-border"
                        />
                      ) : (
                        <div className="p-2.5 rounded-xl bg-cyber-500/10 text-cyber-400 group-hover:bg-cyber-500/20 transition-colors">
                          <Database className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <span className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider">
                          {tech.domainSlug.replace(/-/g, ' ')}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyber-300 transition-colors">
                          {tech.name}
                        </h3>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-dark-surface border border-dark-border text-cyber-400 uppercase">
                      {tech.status}
                    </span>
                  </div>

                  <p className="text-xs text-dark-muted leading-relaxed line-clamp-2">
                    {tech.shortDescription || tech.longDescription}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-dark-muted pt-2 border-t border-dark-border/60">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-cyber-400" />
                      {tech.stats?.publishedLessons || 0} Published Lessons
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-neon-cyan" />
                      {tech.stats?.publishedMcqs || 0} MCQs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-neon-emerald" />
                      {tech.stats?.publishedExercises || 0} Labs
                    </span>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <Link
                    to={`/documentation/${tech.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyber-400 hover:text-white transition-colors"
                  >
                    <span>Open Documentation</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to={`/technologies/${tech.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-surface hover:bg-dark-border text-white transition-colors"
                  >
                    Roadmap & Syllabus
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-12 text-center text-xs text-dark-muted rounded-2xl border border-dark-border bg-dark-card">
              No technology tracks published yet.
            </div>
          )}
        </div>
      </section>

      {/* 4. 24-Domain Bento Grid Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Universal Engineering Domains
          </h2>
          <p className="text-sm text-dark-muted mt-1">
            Categorized registry supporting thousands of technology tracks across modern computing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {domains.slice(0, 8).map((domain) => (
            <Link
              key={domain.id}
              to={`/explore?domain=${domain.slug}`}
              className="p-5 rounded-2xl border border-dark-border bg-dark-card hover:border-cyber-500/40 hover:bg-dark-cardHover transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyber-400">0{domain.displayOrder}</span>
                <span className="text-[11px] font-mono text-dark-muted">
                  {domain.technologyCount} Tracks
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-cyber-300 transition-colors">
                {domain.name}
              </h4>
              <p className="text-xs text-dark-muted mt-1.5 line-clamp-2 leading-relaxed">
                {domain.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold border border-dark-border bg-dark-surface hover:bg-dark-card text-white transition-all"
          >
            <span>Explore All 24 Domains</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. 4-Stage Learning Roadmap Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-dark-border bg-dark-card/80 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyber-400">
              Universal Learning Hierarchy
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Fundamental Principles to High-Availability Production
            </h2>
            <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
              Every technology on ProjuktiX is engineered through structured four-stage roadmaps.
              No fragmented blog posts—only end-to-end, version-aware mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-dark-surface/50 border border-dark-border space-y-2">
              <div className="text-xs font-bold text-cyber-400">Stage 1</div>
              <h4 className="text-sm font-bold text-white">Foundations & Architecture</h4>
              <p className="text-xs text-dark-muted">
                Core concepts, terminology, process structure, memory models, and installation prerequisites.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-dark-surface/50 border border-dark-border space-y-2">
              <div className="text-xs font-bold text-neon-cyan">Stage 2</div>
              <h4 className="text-sm font-bold text-white">Implementation & Configuration</h4>
              <p className="text-xs text-dark-muted">
                Standard administration, hands-on terminal tasks, configuration parameters, and daily operations.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-dark-surface/50 border border-dark-border space-y-2">
              <div className="text-xs font-bold text-neon-blue">Stage 3</div>
              <h4 className="text-sm font-bold text-white">Internals & Performance Tuning</h4>
              <p className="text-xs text-dark-muted">
                Engine internals, write-ahead logging, memory latency, execution plan tuning, and security hardening.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-dark-surface/50 border border-dark-border space-y-2">
              <div className="text-xs font-bold text-neon-indigo">Stage 4</div>
              <h4 className="text-sm font-bold text-white">Enterprise DR & High Availability</h4>
              <p className="text-xs text-dark-muted">
                Clustering (RAC), data replication, zero-data-loss failover, multi-region cloud resilience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
