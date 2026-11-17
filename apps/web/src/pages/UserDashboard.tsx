import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Flame,
  Clock,
  BookOpen,
  Code2,
  CheckSquare,
  Award,
  Bookmark,
  StickyNote,
  ChevronRight,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Certificate, UserBookmark, UserNote } from '@projuktix/types';

export function UserDashboardPage() {
  const { profile, signInWithGoogle, isStaff } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['user-dashboard', profile?.uid],
    queryFn: () => apiClient.getUserDashboard(),
    enabled: !!profile,
  });

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg py-24 px-4 text-center space-y-6">
        <LayoutDashboard className="h-12 w-12 text-cyber-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Sign In to View Dashboard</h2>
        <p className="text-xs text-dark-muted leading-relaxed">
          Access your personalized learning streaks, saved bookmarks, personal chapter notes, and verified credentials.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyber-500 to-neon-blue text-white shadow-neon-cyan hover:brightness-110"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyber-500 border-r-transparent"></div>
        <p className="text-xs text-dark-muted">Aggregating real-time learner analytics from database...</p>
      </div>
    );
  }

  const overall = dashboard?.overallProgress || {
    totalMinutesSpent: 0,
    completedLessonsCount: 0,
    completedExercisesCount: 0,
    passedAssessmentsCount: 0,
    currentStreak: 1,
  };

  const techProgress = dashboard?.technologiesInProgress || [];
  const certs = dashboard?.recentCertificates || [];
  const bookmarks = dashboard?.bookmarks || [];
  const notes = dashboard?.recentNotes || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header Profile Banner */}
      <div className="rounded-3xl border border-dark-border bg-dark-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center space-x-5">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.displayName}
              className="h-16 w-16 rounded-2xl border-2 border-cyber-500/40 shadow-inner"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-cyber-600 flex items-center justify-center text-xl font-bold text-white">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyber-500/20 text-cyber-300 capitalize">
                {profile.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-dark-muted">{profile.email}</p>
          </div>
        </div>

        {isStaff && (
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-all"
          >
            <Shield className="h-4 w-4" />
            <span>Open Admin Portal</span>
          </Link>
        )}
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-muted font-medium">Daily Streak</span>
            <Flame className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-white">{overall.currentStreak} Days</div>
          <div className="text-[10px] text-dark-muted">Active consistent learning</div>
        </div>

        <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-muted font-medium">Time Learned</span>
            <Clock className="h-5 w-5 text-cyber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{overall.totalMinutesSpent} Mins</div>
          <div className="text-[10px] text-dark-muted">Total documented reading & labs</div>
        </div>

        <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-muted font-medium">Lessons Read</span>
            <BookOpen className="h-5 w-5 text-neon-blue" />
          </div>
          <div className="text-3xl font-extrabold text-white">{overall.completedLessonsCount}</div>
          <div className="text-[10px] text-dark-muted">Full technical encyclopedia lessons</div>
        </div>

        <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-dark-muted font-medium">Verified Credentials</span>
            <Award className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{certs.length}</div>
          <div className="text-[10px] text-dark-muted">Earned via passed mock exams</div>
        </div>
      </div>

      {/* 3. Technology Track Proficiency Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Technology Proficiency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techProgress.length > 0 ? (
            techProgress.map((tp: any) => (
              <div
                key={tp.technologyId}
                className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{tp.technologyName}</h4>
                  <span className="text-xs font-mono font-bold text-cyber-400">
                    {tp.proficiencyLevel}% Proficiency
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-dark-surface overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyber-500 to-neon-blue rounded-full transition-all duration-500"
                    style={{ width: `${tp.proficiencyLevel}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-dark-muted">
                  <span>{tp.completedLessons} Lessons</span>
                  <span>{tp.completedExercises} Practical Labs</span>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 p-8 rounded-2xl border border-dark-border bg-dark-card text-center text-xs text-dark-muted">
              You have not enrolled in any technology tracks yet. Start learning today!
            </div>
          )}
        </div>
      </div>

      {/* 4. Earned Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Issued Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.length > 0 ? (
            certs.map((c: Certificate) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-dark-muted uppercase">
                      ID: {c.certificateNumber}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">Passed: {c.score}%</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.assessmentTitle}</h4>
                  <p className="text-xs text-dark-muted">{c.technologyName}</p>
                </div>

                <Link
                  to={`/verify/${c.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-2"
                >
                  <span>View & Verify Credential</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 p-8 rounded-2xl border border-dark-border bg-dark-card text-center text-xs text-dark-muted">
              Complete any technology mock examination with score ≥ pass target to earn credentials.
            </div>
          )}
        </div>
      </div>

      {/* 5. Bookmarks & Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bookmarks */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-cyber-400" />
            Bookmarked Resources ({bookmarks.length})
          </h3>
          <div className="space-y-2">
            {bookmarks.map((bm: UserBookmark) => (
              <div
                key={bm.id}
                className="p-3.5 rounded-xl border border-dark-border bg-dark-card hover:bg-dark-cardHover flex items-center justify-between text-xs transition-colors"
              >
                <span className="text-white font-medium truncate max-w-xs">{bm.title}</span>
                <span className="text-[10px] uppercase font-mono text-dark-muted px-2 py-0.5 rounded bg-dark-surface">
                  {bm.resourceType}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-neon-amber" />
            Personal Notes ({notes.length})
          </h3>
          <div className="space-y-2">
            {notes.map((n: UserNote) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-dark-border bg-dark-card space-y-1 text-xs"
              >
                <p className="text-white leading-relaxed line-clamp-2">{n.noteText}</p>
                <span className="text-[10px] text-dark-muted font-mono">
                  {new Date(n.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
