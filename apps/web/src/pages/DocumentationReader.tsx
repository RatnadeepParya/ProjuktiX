import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { useAuth } from '../context/AuthContext.js';
import { MermaidViewer } from '../components/common/MermaidViewer.js';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  StickyNote,
  Tag,
  Code2,
  Layers,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { LessonWithContent, Technology, Course, Chapter, Lesson } from '@projuktix/types';

export function DocumentationReaderPage() {
  const { techSlug } = useParams<{ techSlug?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, openAuthModal } = useAuth();

  const [fontSize, setFontSize] = useState<number>(15);
  const [noteText, setNoteText] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [chapterFilter, setChapterFilter] = useState('');
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string | null>(null);

  // 1. Fetch available technologies
  const { data: techData, isLoading: techLoading } = useQuery({
    queryKey: ['technologies-docs'],
    queryFn: () => apiClient.getTechnologies({ pageSize: 50 }),
  });

  const technologies = techData?.technologies || [];
  const activeTech =
    technologies.find((t) => t.slug === techSlug) ||
    technologies[0] ||
    ({ id: 'tech-typescript', slug: 'typescript', name: 'TypeScript' } as Technology);

  // Sync route if accessing /documentation directly
  useEffect(() => {
    if (!techSlug && activeTech?.slug) {
      navigate(`/documentation/${activeTech.slug}`, { replace: true });
    }
  }, [techSlug, activeTech, navigate]);

  // 2. Fetch courses for active technology
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', activeTech.id],
    queryFn: () => apiClient.getCourses(activeTech.id),
    enabled: !!activeTech.id,
  });

  const activeCourse = courses[0];

  // 3. Fetch chapters for active course
  const { data: chapters = [] } = useQuery({
    queryKey: ['chapters', activeCourse?.id],
    queryFn: () => apiClient.getChapters(activeCourse!.id),
    enabled: !!activeCourse?.id,
  });

  const activeChapter = chapters[0];

  // 4. Fetch lessons for active chapter
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', activeChapter?.id],
    queryFn: () => apiClient.getLessons(activeChapter!.id),
    enabled: !!activeChapter?.id,
  });

  // Effective lesson identifier
  const currentLessonSlug = selectedLessonSlug || lessons[0]?.slug;

  // 5. Fetch full lesson content & assembled chunks
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson-detail', currentLessonSlug],
    queryFn: async () => {
      if (!currentLessonSlug) return null;
      return apiClient.getLesson(currentLessonSlug);
    },
    enabled: !!currentLessonSlug,
  });

  // 6. Complete Lesson Mutation
  const completeMutation = useMutation({
    mutationFn: (lessonId: string) => apiClient.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      alert('Lesson marked as completed! Your learning streak and progress have been updated.');
    },
    onError: (err: any) => {
      alert(`Could not mark lesson complete: ${err.message}`);
    },
  });

  // 7. Save Note Mutation
  const saveNoteMutation = useMutation({
    mutationFn: () =>
      apiClient.saveNote({
        lessonId: lesson?.id || currentLessonSlug || 'lesson-1',
        technologyId: activeTech.id,
        noteText,
      }),
    onSuccess: () => {
      setShowNoteModal(false);
      setNoteText('');
      alert('Personal note saved to your dashboard!');
    },
    onError: (err: any) => {
      alert(`Could not save note: ${err.message}`);
    },
  });

  const handleBookmarkToggle = async () => {
    if (!profile) {
      openAuthModal('signin');
      return;
    }
    if (!lesson) return;

    if (!isBookmarked) {
      await apiClient.addBookmark({
        resourceType: 'lesson',
        resourceId: lesson.id,
        technologyId: activeTech.id,
        title: lesson.title,
      });
      setIsBookmarked(true);
    } else {
      await apiClient.removeBookmark(lesson.id);
      setIsBookmarked(false);
    }
  };

  const handleNoteOpen = () => {
    if (!profile) {
      openAuthModal('signin');
      return;
    }
    setShowNoteModal(true);
  };

  const handleComplete = () => {
    if (!profile) {
      openAuthModal('signin');
      return;
    }
    if (lesson?.id) {
      completeMutation.mutate(lesson.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Technology Selector Bar */}
      <div className="border-b border-dark-border bg-dark-card/90 px-4 sm:px-6 py-2.5 backdrop-blur-md sticky top-16 z-30">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[11px] font-mono font-bold uppercase text-cyber-400 shrink-0 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Technology Track:</span>
            </span>
            {technologies.map((t) => (
              <button
                key={t.slug}
                onClick={() => {
                  setSelectedLessonSlug(null);
                  navigate(`/documentation/${t.slug}`);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  t.slug === activeTech.slug
                    ? 'bg-cyber-500 text-white shadow-sm'
                    : 'text-dark-muted hover:text-white hover:bg-dark-surface'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/labs/${activeTech.slug}`}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-dark-surface border border-dark-border hover:border-cyber-500/50 text-white transition-all flex items-center gap-1.5"
            >
              <Code2 className="h-3.5 w-3.5 text-cyber-400" />
              <span>Open Lab</span>
            </Link>
            <Link
              to={`/assessments`}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-dark-surface border border-dark-border hover:border-neon-cyan/50 text-white transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-neon-cyan" />
              <span>Exams</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT PANEL: Chapter & Lesson Index Tree */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-dark-border bg-dark-card/40 p-4 space-y-4 shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border/80">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-dark-muted">Curriculum</span>
              <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                {activeCourse?.title || `${activeTech.name} Architecture`}
              </h3>
            </div>
            <Link
              to={`/technologies/${activeTech.slug}`}
              className="p-1.5 rounded-lg text-dark-muted hover:text-white hover:bg-dark-surface"
              title="Technology Syllabus"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* Chapter Search Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dark-muted" />
            <input
              type="text"
              value={chapterFilter}
              onChange={(e) => setChapterFilter(e.target.value)}
              placeholder="Filter topics..."
              className="w-full bg-dark-surface border border-dark-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-dark-muted focus:outline-none focus:border-cyber-500"
            />
          </div>

          {/* Chapter Tree */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
            {chapters.length > 0 ? (
              chapters.map((chap) => (
                <div key={chap.id} className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider flex items-center justify-between">
                    <span>{chap.title}</span>
                  </div>
                  <div className="space-y-1">
                    {lessons
                      .filter((l) => l.chapterId === chap.id || !l.chapterId)
                      .filter((l) =>
                        chapterFilter.trim()
                          ? l.title.toLowerCase().includes(chapterFilter.toLowerCase())
                          : true
                      )
                      .map((l) => {
                        const active = (currentLessonSlug === l.slug) || (!currentLessonSlug && l === lessons[0]);
                        return (
                          <button
                            key={l.id}
                            onClick={() => setSelectedLessonSlug(l.slug)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                              active
                                ? 'bg-cyber-500/15 border border-cyber-500/30 text-white font-medium'
                                : 'text-dark-muted hover:text-white hover:bg-dark-surface/50'
                            }`}
                          >
                            <span className="truncate">{l.title}</span>
                            {active && <span className="h-2 w-2 rounded-full bg-cyber-400 shrink-0"></span>}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-dark-muted p-4 text-center">
                {coursesLoading ? 'Loading course chapters...' : 'No published chapters in this track yet.'}
              </div>
            )}
          </div>
        </aside>

        {/* CENTER PANEL: Article Content & Architecture Illustrations */}
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 overflow-y-auto">
          {lessonLoading ? (
            <div className="py-32 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyber-500 border-r-transparent"></div>
              <p className="text-xs text-dark-muted">Assembling technical encyclopedia chapter from database chunks...</p>
            </div>
          ) : lesson ? (
            <>
              {/* Article Header Bar */}
              <div className="space-y-4 pb-6 border-b border-dark-border">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 text-xs text-cyber-400 font-mono">
                    <span className="capitalize">{activeTech.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-dark-muted">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson?.readingTimeMinutes || 15} Min Read
                    </span>
                  </div>

                  {/* Reading Controls */}
                  <div className="flex items-center space-x-2">
                    {/* Font Size Adjuster */}
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-dark-surface border border-dark-border text-xs">
                      <button
                        onClick={() => setFontSize((s) => Math.max(13, s - 1))}
                        className="px-1 text-dark-muted hover:text-white font-bold"
                        title="Decrease text size"
                      >
                        A-
                      </button>
                      <span className="text-[11px] font-mono text-cyber-400">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize((s) => Math.min(20, s + 1))}
                        className="px-1 text-dark-muted hover:text-white font-bold"
                        title="Increase text size"
                      >
                        A+
                      </button>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={handleBookmarkToggle}
                      className={`p-2 rounded-lg border transition-all ${
                        isBookmarked
                          ? 'bg-neon-amber/20 border-neon-amber text-neon-amber'
                          : 'bg-dark-surface border-dark-border text-dark-muted hover:text-white'
                      }`}
                      title="Bookmark Lesson"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>

                    {/* Notes Button */}
                    <button
                      onClick={handleNoteOpen}
                      className="p-2 rounded-lg bg-dark-surface border border-dark-border text-dark-muted hover:text-white transition-all"
                      title="Add Personal Note"
                    >
                      <StickyNote className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {lesson.title}
                </h1>
                <p className="text-sm text-dark-muted leading-relaxed">
                  {lesson.summary}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {lesson.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-dark-surface text-cyber-400 border border-dark-border"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Mermaid Architecture Diagrams */}
              {lesson.diagrams?.map((diag) => (
                <MermaidViewer
                  key={diag.id}
                  id={diag.id}
                  title={diag.title}
                  definition={diag.rawDefinition}
                  description={diag.description}
                  legend={diag.legend}
                />
              ))}

              {/* Assembled Lesson Markdown Content */}
              <article
                className="prose prose-invert max-w-none space-y-6 text-slate-300 leading-relaxed font-sans"
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="whitespace-pre-wrap font-sans space-y-4">
                  {lesson.content}
                </div>
              </article>

              {/* References & Citations */}
              {lesson.references && lesson.references.length > 0 && (
                <div className="pt-6 border-t border-dark-border space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted">
                    Official Technical References
                  </h4>
                  <div className="space-y-2">
                    {lesson.references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-dark-border bg-dark-card hover:bg-dark-cardHover text-xs transition-colors group"
                      >
                        <span className="text-white font-medium group-hover:text-cyber-300">
                          {ref.title}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-dark-muted group-hover:text-cyber-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Navigation & Complete Action */}
              <div className="pt-8 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-dark-bg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark Lesson Completed</span>
                </button>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <Link
                    to={`/labs/${activeTech.slug}`}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-dark-surface border border-dark-border hover:bg-dark-card text-white transition-all flex items-center gap-1.5"
                  >
                    <span>Practice in Terminal Lab</span>
                    <ChevronRight className="h-4 w-4 text-cyber-400" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center space-y-4">
              <BookOpen className="h-10 w-10 text-dark-muted mx-auto" />
              <h3 className="text-lg font-bold text-white">Select a Chapter to Begin</h3>
              <p className="text-xs text-dark-muted max-w-sm mx-auto">
                Explore architectural encyclopedias, memory workflows, and verified technical implementations.
              </p>
            </div>
          )}
        </main>

        {/* RIGHT PANEL: In-Page TOC & Learning Objectives */}
        <aside className="hidden xl:block w-72 border-l border-dark-border bg-dark-card/30 p-6 space-y-6 shrink-0">
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase text-dark-muted">Chapter Architecture</span>
            <ul className="space-y-2 text-xs text-dark-muted">
              <li className="text-cyber-400 font-medium hover:underline cursor-pointer">
                1. Executive Architecture Overview
              </li>
              <li className="hover:text-white transition-colors cursor-pointer pl-2">
                2. Internal Subsystems & Data Structures
              </li>
              <li className="hover:text-white transition-colors cursor-pointer pl-4">
                2.1 Memory Allocation & Buffer Management
              </li>
              <li className="hover:text-white transition-colors cursor-pointer pl-4">
                2.2 Durable Logging & Persistence
              </li>
              <li className="hover:text-white transition-colors cursor-pointer pl-2">
                3. Concurrency & Isolation Guarantees
              </li>
              <li className="hover:text-white transition-colors cursor-pointer pl-2">
                4. High-Availability & Disaster Recovery
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-dark-surface/50 border border-dark-border space-y-2">
            <span className="text-[10px] font-bold uppercase text-cyber-400">Universal Academy Standard</span>
            <p className="text-xs text-dark-muted leading-relaxed">
              Every technical encyclopedia entry adheres to enterprise architectural standards, providing direct production commands and verifiable evidence.
            </p>
          </div>
        </aside>
      </div>

      {/* Personal Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-cyber-400" />
                Add Personal Note
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="text-xs text-dark-muted hover:text-white">
                Cancel
              </button>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type personal takeaways, production reminders, or interview notes..."
              className="w-full h-36 p-3 rounded-xl bg-dark-surface border border-dark-border text-xs text-white placeholder-dark-muted focus:outline-none focus:border-cyber-500 resize-none"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-dark-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => saveNoteMutation.mutate()}
                disabled={!noteText.trim() || saveNoteMutation.isPending}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
