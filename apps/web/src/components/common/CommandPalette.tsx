import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, BookOpen, Code2, CheckSquare, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Explore 24 Technology Domains', category: 'Registry', path: '/explore', icon: Compass },
    { title: 'Deep Technical Documentation', category: 'Documentation', path: '/documentation', icon: BookOpen },
    { title: 'Interactive Hands-on Labs Hub', category: 'Practical Lab', path: '/labs', icon: Code2 },
    { title: 'Certification & Mock Exams Directory', category: 'Assessment', path: '/assessments', icon: CheckSquare },
    { title: 'TypeScript Compiler & Type System Internals', category: 'Documentation', path: '/documentation/typescript', icon: BookOpen },
    { title: 'PostgreSQL MVCC & Shared Buffers Lab', category: 'Practical Lab', path: '/labs/postgresql', icon: Code2 },
    { title: 'Kubernetes Cluster Architecture & CKA Simulation', category: 'Assessment', path: '/assessments/certified-kubernetes-administrator-mock-exam', icon: CheckSquare },
    { title: 'Python CPython Virtual Machine Internals', category: 'Documentation', path: '/documentation/python', icon: BookOpen },
    { title: 'Interactive System Architecture Explorer', category: 'Visualizer', path: '/architecture', icon: BookOpen },
    { title: 'Verify Professional Credential', category: 'Certifications', path: '/verify', icon: CheckSquare },
  ];

  const filtered = query.trim()
    ? quickLinks.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase()))
    : quickLinks;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-dark-bg/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-dark-border bg-dark-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-dark-border/80">
          <Search className="h-4 w-4 text-cyber-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a technology, course, lab, or exam topic..."
            className="w-full bg-transparent py-4 text-sm text-white placeholder-dark-muted focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-dark-muted hover:text-white rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs hover:bg-dark-surface/80 group transition-all"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-1.5 rounded-lg bg-cyber-500/10 text-cyber-400 group-hover:bg-cyber-500/20">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-white font-medium truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-dark-muted px-2 py-0.5 rounded bg-dark-bg border border-dark-border">
                    {item.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-dark-muted">
              No matching learning resources found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-dark-bg/60 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-dark-muted">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
