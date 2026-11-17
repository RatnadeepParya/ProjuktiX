import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import {
  Compass,
  Search,
  BookOpen,
  Code2,
  CheckSquare,
  ArrowRight,
  Filter,
  Grid,
  List,
  ChevronRight,
  Database,
} from 'lucide-react';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const domainParam = searchParams.get('domain') || '';
  const searchParam = searchParams.get('search') || '';

  const [selectedDomain, setSelectedDomain] = useState(domainParam);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => apiClient.getDomains(),
  });

  const { data: techData, isLoading } = useQuery({
    queryKey: ['technologies', selectedDomain, searchInput],
    queryFn: () =>
      apiClient.getTechnologies({
        domain: selectedDomain || undefined,
        search: searchInput || undefined,
        pageSize: 48,
      }),
  });

  const handleDomainSelect = (slug: string) => {
    setSelectedDomain(slug);
    if (slug) {
      searchParams.set('domain', slug);
    } else {
      searchParams.delete('domain');
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const technologies = techData?.technologies || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-cyber-400 font-semibold mb-1">
          <Compass className="h-4 w-4" />
          <span>Universal Technology Registry</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Technologies</h1>
        <p className="text-xs sm:text-sm text-dark-muted mt-1 max-w-2xl">
          Browse our structured technology tracks across 24 core engineering disciplines. Every track
          includes detailed documentation, interactive architecture diagrams, practical labs, and mock exams.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-dark-border bg-dark-card">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyber-400" />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search technologies by name, keyword, or tag..."
            className="w-full bg-dark-surface/70 border border-dark-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-dark-muted focus:outline-none focus:border-cyber-500"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-xl bg-dark-surface p-1 border border-dark-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyber-500 text-white' : 'text-dark-muted hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-cyber-500 text-white' : 'text-dark-muted hover:text-white'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Domain Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleDomainSelect('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !selectedDomain
              ? 'bg-cyber-500 text-white shadow-neon-cyan'
              : 'bg-dark-surface text-dark-muted border border-dark-border hover:text-white hover:border-dark-borderHover'
          }`}
        >
          All Domains
        </button>
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => handleDomainSelect(d.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDomain === d.slug
                ? 'bg-cyber-500 text-white shadow-neon-cyan'
                : 'bg-dark-surface text-dark-muted border border-dark-border hover:text-white hover:border-dark-borderHover'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Technologies List / Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyber-500 border-r-transparent"></div>
          <p className="text-xs text-dark-muted">Loading authoritative technology registry...</p>
        </div>
      ) : technologies.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech) => (
              <div
                key={tech.id}
                className="group rounded-2xl border border-dark-border bg-dark-card p-6 hover:border-cyber-500/50 hover:bg-dark-cardHover transition-all shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {tech.logoUrl ? (
                        <img
                          src={tech.logoUrl}
                          alt={tech.name}
                          className="h-9 w-9 object-contain rounded-lg p-1 bg-dark-surface border border-dark-border"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-cyber-500/20 text-cyber-400 flex items-center justify-center font-bold text-xs">
                          {tech.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyber-300 transition-colors">
                          {tech.name}
                        </h3>
                        <span className="text-[11px] font-mono text-dark-muted">
                          {tech.domainSlug}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-dark-surface text-cyber-400 border border-dark-border">
                      {tech.status}
                    </span>
                  </div>

                  <p className="text-xs text-dark-muted line-clamp-3 leading-relaxed">
                    {tech.shortDescription}
                  </p>

                  {/* Badges for lessons, mcqs, exercises */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dark-border/60 text-center">
                    <div className="p-2 rounded-lg bg-dark-surface/40">
                      <div className="text-xs font-bold text-white">
                        {tech.stats?.publishedLessons || 0}
                      </div>
                      <div className="text-[10px] text-dark-muted">Lessons</div>
                    </div>
                    <div className="p-2 rounded-lg bg-dark-surface/40">
                      <div className="text-xs font-bold text-neon-cyan">
                        {tech.stats?.publishedMcqs || 0}
                      </div>
                      <div className="text-[10px] text-dark-muted">MCQs</div>
                    </div>
                    <div className="p-2 rounded-lg bg-dark-surface/40">
                      <div className="text-xs font-bold text-neon-emerald">
                        {tech.stats?.publishedExercises || 0}
                      </div>
                      <div className="text-[10px] text-dark-muted">Labs</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <Link
                    to={`/technologies/${tech.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyber-400 hover:text-white transition-colors"
                  >
                    <span>View Roadmap</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to={`/documentation/${tech.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-surface hover:bg-dark-border text-white transition-colors"
                  >
                    Read Docs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {technologies.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-4 rounded-xl border border-dark-border bg-dark-card hover:bg-dark-cardHover hover:border-cyber-500/40 transition-all"
              >
                <div className="flex items-center space-x-4">
                  {tech.logoUrl ? (
                    <img
                      src={tech.logoUrl}
                      alt={tech.name}
                      className="h-8 w-8 object-contain rounded-lg p-1 bg-dark-surface border border-dark-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-cyber-500/20 text-cyber-400 flex items-center justify-center font-bold text-xs">
                      {tech.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{tech.name}</h4>
                    <p className="text-xs text-dark-muted max-w-lg truncate">
                      {tech.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="hidden sm:flex items-center space-x-4 text-xs text-dark-muted">
                    <span>{tech.stats?.publishedLessons || 0} Lessons</span>
                    <span>{tech.stats?.publishedMcqs || 0} MCQs</span>
                    <span>{tech.stats?.publishedExercises || 0} Labs</span>
                  </div>
                  <Link
                    to={`/technologies/${tech.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyber-500/10 hover:bg-cyber-500 text-cyber-300 hover:text-white transition-all"
                  >
                    Roadmap
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="py-20 text-center space-y-4 rounded-2xl border border-dark-border bg-dark-card p-8">
          <Database className="h-10 w-10 text-dark-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No Technologies Found</h3>
          <p className="text-xs text-dark-muted max-w-sm mx-auto">
            No matching technologies found for the current domain or search filter.
          </p>
          <button
            onClick={() => {
              setSelectedDomain('');
              setSearchInput('');
              setSearchParams({});
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-surface text-white border border-dark-border hover:bg-dark-border"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
