import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Shield,
  LayoutDashboard,
  Compass,
  BookOpen,
  CheckSquare,
  Code2,
  UploadCloud,
  FileCheck2,
  Users,
  Award,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export function AdminPortalPage() {
  const queryClient = useQueryClient();
  const { profile, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'tech' | 'docs' | 'mcq' | 'import'>('metrics');

  // Form states for new technology
  const [techName, setTechName] = useState('');
  const [techSlug, setTechSlug] = useState('');
  const [techDomain, setTechDomain] = useState('domain-database-technologies');
  const [techShortDesc, setTechShortDesc] = useState('');
  const [techLongDesc, setTechLongDesc] = useState('');

  // Form states for new MCQ
  const [mcqTechId, setMcqTechId] = useState('tech-oracle-db');
  const [mcqTopicId, setMcqTopicId] = useState('oracle-memory');
  const [mcqPrompt, setMcqPrompt] = useState('');
  const [mcqOptA, setMcqOptA] = useState('');
  const [mcqOptB, setMcqOptB] = useState('');
  const [mcqOptC, setMcqOptC] = useState('');
  const [mcqCorrect, setMcqCorrect] = useState('opt-a');
  const [mcqExplanation, setMcqExplanation] = useState('');

  // Bulk import state
  const [importTechId, setImportTechId] = useState('tech-oracle-db');
  const [importJson, setImportJson] = useState('');
  const [importReport, setImportReport] = useState<any>(null);

  // 1. Fetch Metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => apiClient.getAdminDashboard(),
    enabled: isStaff,
  });

  // 2. Create Technology Mutation
  const createTechMutation = useMutation({
    mutationFn: () =>
      apiClient.createAdminTechnology({
        name: techName,
        slug: techSlug,
        domainId: techDomain,
        domainSlug: techDomain.replace('domain-', ''),
        shortDescription: techShortDesc,
        longDescription: techLongDesc,
        tags: [techSlug],
        versions: [
          {
            id: 'v-default',
            versionString: 'Current Release',
            isLts: true,
            isDefault: true,
            status: 'active',
          },
        ],
        status: 'published',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      alert('Technology created and indexed successfully in Firestore!');
      setTechName('');
      setTechSlug('');
      setTechShortDesc('');
      setTechLongDesc('');
    },
    onError: (err: any) => {
      alert(`Error creating technology: ${err.message}`);
    },
  });

  // 3. Create MCQ Mutation
  const createMcqMutation = useMutation({
    mutationFn: () =>
      apiClient.createAdminMCQ({
        technologyId: mcqTechId,
        topicId: mcqTopicId,
        questionType: 'single_choice',
        promptMarkdown: mcqPrompt,
        options: [
          { id: 'opt-a', text: mcqOptA },
          { id: 'opt-b', text: mcqOptB },
          { id: 'opt-c', text: mcqOptC },
        ],
        difficulty: 'intermediate',
        tags: [mcqTopicId],
        estimatedSeconds: 60,
        status: 'published',
        answerKey: {
          correctOptionIds: [mcqCorrect],
          explanation: mcqExplanation,
          references: ['Authoritative Documentation'],
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      alert('MCQ question created! Answer key isolated to protected Firestore collection.');
      setMcqPrompt('');
      setMcqOptA('');
      setMcqOptB('');
      setMcqOptC('');
      setMcqExplanation('');
    },
    onError: (err: any) => {
      alert(`Error creating MCQ: ${err.message}`);
    },
  });

  // 4. Bulk Import Mutation
  const importMutation = useMutation({
    mutationFn: () => {
      let parsed = [];
      try {
        parsed = JSON.parse(importJson);
      } catch {
        throw new Error('Invalid JSON format. Please provide a valid JSON array.');
      }
      return apiClient.runBulkImport({
        technologyId: importTechId,
        resourceType: 'mcq',
        items: Array.isArray(parsed) ? parsed : [parsed],
      });
    },
    onSuccess: (data) => {
      setImportReport(data);
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (err: any) => {
      alert(`Import error: ${err.message}`);
    },
  });

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-lg py-24 px-4 text-center space-y-4">
        <Shield className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Restricted Administrator Area</h2>
        <p className="text-xs text-dark-muted">
          Your current account role does not have authorization to access the enterprise administration portal.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-dark-border">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-neon-cyan uppercase">
            <Shield className="h-4 w-4" />
            <span>Enterprise Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Platform Content & Governance Engine
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyber-500/10 text-cyber-300 border border-cyber-500/30">
            {profile?.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Admin Tab Controls */}
      <div className="flex items-center gap-2 border-b border-dark-border pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'metrics'
              ? 'bg-cyber-500 text-white shadow-neon-cyan'
              : 'text-dark-muted hover:text-white hover:bg-dark-surface'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Real-time Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('tech')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'tech'
              ? 'bg-cyber-500 text-white shadow-neon-cyan'
              : 'text-dark-muted hover:text-white hover:bg-dark-surface'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Technology Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('mcq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'mcq'
              ? 'bg-cyber-500 text-white shadow-neon-cyan'
              : 'text-dark-muted hover:text-white hover:bg-dark-surface'
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Question Bank Authoring</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'import'
              ? 'bg-cyber-500 text-white shadow-neon-cyan'
              : 'text-dark-muted hover:text-white hover:bg-dark-surface'
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>Bulk Import & Duplicate Detector</span>
        </button>
      </div>

      {/* TAB 1: Metrics Overview */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-1">
              <span className="text-[11px] font-mono text-dark-muted uppercase">Total Users</span>
              <div className="text-2xl font-bold text-white">{metrics?.totalUsers || 0}</div>
            </div>
            <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-1">
              <span className="text-[11px] font-mono text-dark-muted uppercase">Technologies</span>
              <div className="text-2xl font-bold text-cyber-400">
                {metrics?.totalTechnologies || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-1">
              <span className="text-[11px] font-mono text-dark-muted uppercase">Published MCQs</span>
              <div className="text-2xl font-bold text-neon-cyan">
                {metrics?.publishedMcqs || 0}
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-dark-border bg-dark-card space-y-1">
              <span className="text-[11px] font-mono text-dark-muted uppercase">Practical Labs</span>
              <div className="text-2xl font-bold text-neon-emerald">
                {metrics?.publishedExercises || 0}
              </div>
            </div>
          </div>

          {/* Technology-wise Content Coverage Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Technology-wise Content Coverage Target</h3>
            <div className="rounded-2xl border border-dark-border bg-dark-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-surface/60 border-b border-dark-border text-dark-muted font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Technology</th>
                    <th className="p-4">Domain</th>
                    <th className="p-4 text-center">Lessons</th>
                    <th className="p-4 text-center">Published MCQs</th>
                    <th className="p-4 text-center">Published Labs</th>
                    <th className="p-4 text-center">1,001 Target Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/60">
                  {metrics?.technologyCoverage?.map((tc) => (
                    <tr key={tc.technologyId} className="hover:bg-dark-surface/30">
                      <td className="p-4 font-bold text-white">{tc.technologyName}</td>
                      <td className="p-4 text-dark-muted font-mono">{tc.domainName}</td>
                      <td className="p-4 text-center font-bold">{tc.publishedLessons}</td>
                      <td className="p-4 text-center font-mono text-cyber-400 font-bold">
                        {tc.publishedMcqs}
                      </td>
                      <td className="p-4 text-center font-mono text-neon-emerald font-bold">
                        {tc.publishedExercises}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tc.isTargetMet
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {tc.isTargetMet ? 'Target Met (1,001+)' : 'In Progress (Active Track)'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Technology Manager */}
      {activeTab === 'tech' && (
        <div className="rounded-2xl border border-dark-border bg-dark-card p-6 space-y-6 max-w-2xl">
          <h3 className="text-base font-bold text-white">Create New Technology Track</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">
                Technology Name
              </label>
              <input
                type="text"
                value={techName}
                onChange={(e) => {
                  setTechName(e.target.value);
                  setTechSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                placeholder="e.g. PostgreSQL, Rust, Terraform"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-cyber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">URL Slug</label>
              <input
                type="text"
                value={techSlug}
                onChange={(e) => setTechSlug(e.target.value)}
                placeholder="e.g. postgresql, rust, terraform"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-cyber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">Domain</label>
              <select
                value={techDomain}
                onChange={(e) => setTechDomain(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-cyber-500"
              >
                <option value="domain-database-technologies">Database Technologies</option>
                <option value="domain-programming-languages">Programming Languages</option>
                <option value="domain-devops-platform">DevOps & Platform Engineering</option>
                <option value="domain-cloud-computing">Cloud Computing & Architecture</option>
                <option value="domain-cybersecurity">Cybersecurity & Security Engineering</option>
                <option value="domain-artificial-intelligence">Artificial Intelligence & ML</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={techShortDesc}
                onChange={(e) => setTechShortDesc(e.target.value)}
                placeholder="Brief summary for registry cards (10-300 chars)"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-cyber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">
                Long Description (Encyclopedia Scope)
              </label>
              <textarea
                value={techLongDesc}
                onChange={(e) => setTechLongDesc(e.target.value)}
                placeholder="Comprehensive technical scope..."
                className="w-full h-24 p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-cyber-500 resize-none"
              />
            </div>

            <button
              onClick={() => createTechMutation.mutate()}
              disabled={!techName || !techShortDesc || createTechMutation.isPending}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan"
            >
              {createTechMutation.isPending ? 'Publishing Technology...' : 'Create & Publish Technology'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MCQ Authoring */}
      {activeTab === 'mcq' && (
        <div className="rounded-2xl border border-dark-border bg-dark-card p-6 space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Create Question with Isolated Answer Key</h3>
            <p className="text-xs text-dark-muted">
              Answer key is saved separately in the secure `mcqAnswerKeys` collection and never exposed to clients.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">
                Question Prompt (Markdown)
              </label>
              <textarea
                value={mcqPrompt}
                onChange={(e) => setMcqPrompt(e.target.value)}
                placeholder="Technical question prompt..."
                className="w-full h-24 p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-cyber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-dark-muted mb-1">Option A</label>
                <input
                  type="text"
                  value={mcqOptA}
                  onChange={(e) => setMcqOptA(e.target.value)}
                  className="w-full p-2 rounded-lg bg-dark-surface border border-dark-border text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-dark-muted mb-1">Option B</label>
                <input
                  type="text"
                  value={mcqOptB}
                  onChange={(e) => setMcqOptB(e.target.value)}
                  className="w-full p-2 rounded-lg bg-dark-surface border border-dark-border text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-dark-muted mb-1">Option C</label>
                <input
                  type="text"
                  value={mcqOptC}
                  onChange={(e) => setMcqOptC(e.target.value)}
                  className="w-full p-2 rounded-lg bg-dark-surface border border-dark-border text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">Correct Answer</label>
              <select
                value={mcqCorrect}
                onChange={(e) => setMcqCorrect(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white"
              >
                <option value="opt-a">Option A</option>
                <option value="opt-b">Option B</option>
                <option value="opt-c">Option C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">
                Detailed Technical Explanation
              </label>
              <textarea
                value={mcqExplanation}
                onChange={(e) => setMcqExplanation(e.target.value)}
                placeholder="Comprehensive explanation of why this answer is correct..."
                className="w-full h-24 p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:outline-none focus:border-cyber-500 resize-none"
              />
            </div>

            <button
              onClick={() => createMcqMutation.mutate()}
              disabled={!mcqPrompt || !mcqOptA || !mcqExplanation || createMcqMutation.isPending}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan"
            >
              {createMcqMutation.isPending ? 'Saving Question...' : 'Save MCQ to Bank'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Bulk Import & Duplicate Detector */}
      {activeTab === 'import' && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-dark-border bg-dark-card p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Bulk Content Import Engine</h3>
              <p className="text-xs text-dark-muted">
                Processes JSON batch arrays. Automatically validates Zod schemas and executes Jaccard token similarity duplicate detection.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">Target Technology</label>
                <select
                  value={importTechId}
                  onChange={(e) => setImportTechId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-white"
                >
                  <option value="tech-typescript">TypeScript</option>
                  <option value="tech-postgresql">PostgreSQL</option>
                  <option value="tech-kubernetes">Kubernetes</option>
                  <option value="tech-python">Python</option>
                  <option value="tech-docker">Docker & Containers</option>
                  <option value="tech-react">React</option>
                  <option value="tech-aws">AWS</option>
                  <option value="tech-oracle-db">Oracle Database</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">
                  JSON Batch Array
                </label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder={`[\n  {\n    "topicId": "core-internals",\n    "promptMarkdown": "Which subsystem guarantees durability in WAL?",\n    "options": [{"id": "opt-1", "text": "WAL Writer"}, {"id": "opt-2", "text": "Shared Pool"}],\n    "correctOptionIds": ["opt-1"],\n    "explanation": "Write-Ahead Logging flushes transaction records synchronously on COMMIT."\n  }\n]`}
                  className="w-full h-48 p-3 rounded-xl bg-dark-bg border border-dark-border text-xs font-mono text-cyber-300 focus:outline-none focus:border-cyber-500 resize-none"
                />
              </div>

              <button
                onClick={() => importMutation.mutate()}
                disabled={!importJson.trim() || importMutation.isPending}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan"
              >
                {importMutation.isPending ? 'Processing Import...' : 'Run Validated Bulk Import'}
              </button>
            </div>
          </div>

          {/* Import Execution Report */}
          {importReport && (
            <div className="p-6 rounded-2xl border border-dark-border bg-dark-card space-y-4 animate-in fade-in">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-cyber-400" />
                Import Report (Job ID: {importReport.id})
              </h4>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-dark-surface">
                  <div className="font-bold text-white">{importReport.totalRecords}</div>
                  <div className="text-[10px] text-dark-muted">Total Records</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="font-bold text-emerald-400">{importReport.successfulRecords}</div>
                  <div className="text-[10px] text-emerald-300">Successfully Imported</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <div className="font-bold text-rose-400">{importReport.failedRecords}</div>
                  <div className="text-[10px] text-rose-300">Rejected / Duplicate</div>
                </div>
              </div>

              {importReport.issues?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono font-bold uppercase text-rose-400">
                    Validation & Duplicate Warnings:
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {importReport.issues.map((issue: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-dark-surface border border-dark-border text-xs flex items-start space-x-2"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-dark-muted">Row {issue.row}: </span>
                          <span className="text-white">{issue.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
