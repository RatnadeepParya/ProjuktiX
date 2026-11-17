import React from 'react';
import { Link } from 'react-router-dom';
import { Github, BookOpen, ShieldCheck, Heart, Terminal, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-dark-border bg-dark-bg text-dark-muted py-12 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Vision */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.svg" alt="ProjuktiX Logo" className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight text-white">
                Projukti<span className="text-cyber-400 font-extrabold">X</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-sm text-dark-muted">
              Universal open-source engineering learning ecosystem and enterprise knowledge encyclopedia.
              Designed for developers, DBAs, DevOps engineers, cloud architects, and technology leaders.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-dark-surface border border-dark-border text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Spark & Render Zero-Cost Ready
              </span>
              <a
                href="https://github.com/RatnadeepParya/ProjuktiX"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>

          {/* Quick Learning Paths */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Core Academies</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore?domain=programming-languages" className="hover:text-cyber-400 transition-colors">
                  Programming Languages (TS, Python, Go)
                </Link>
              </li>
              <li>
                <Link to="/explore?domain=database-technologies" className="hover:text-cyber-400 transition-colors">
                  Enterprise Databases (Postgres, Oracle)
                </Link>
              </li>
              <li>
                <Link to="/explore?domain=devops-platform-engineering" className="hover:text-cyber-400 transition-colors">
                  DevOps & Kubernetes
                </Link>
              </li>
              <li>
                <Link to="/explore?domain=cloud-computing" className="hover:text-cyber-400 transition-colors">
                  Cloud Architecture (AWS, GCP, Azure)
                </Link>
              </li>
              <li>
                <Link to="/explore?domain=artificial-intelligence" className="hover:text-cyber-400 transition-colors">
                  AI/ML & Large Language Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Engines */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Learning Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="hover:text-cyber-400 transition-colors">
                  Technology Registry (24 Domains)
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="hover:text-cyber-400 transition-colors">
                  Deep Technical Documentation
                </Link>
              </li>
              <li>
                <Link to="/labs" className="hover:text-cyber-400 transition-colors">
                  Hands-on Practical Labs
                </Link>
              </li>
              <li>
                <Link to="/assessments" className="hover:text-cyber-400 transition-colors">
                  Certification Mock Exams
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-cyber-400 transition-colors">
                  Interactive Architecture Explorer
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-cyber-400 transition-colors">
                  Credential Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Reference & Standards */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Open-Source & Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://github.com/RatnadeepParya/ProjuktiX"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyber-400 transition-colors flex items-center gap-1"
                >
                  <BookOpen className="h-3 w-3" />
                  <span>Oracle Encyclopedia Ref</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/RatnadeepParya/ProjuktiX/blob/main/docs/security/SECRETS_MANAGEMENT.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyber-400 transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>Zero-Secret Architecture</span>
                </a>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cyber-400 transition-colors flex items-center gap-1">
                  <Terminal className="h-3 w-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
              <li>
                <span className="text-dark-muted/70">Database-First (Firestore)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dark-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-dark-muted/80 gap-4">
          <p>© {new Date().getFullYear()} ProjuktiX Open Source Project. Built for universal technology education.</p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1 text-[11px]">
              Engineered with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for global engineers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
