import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client.js';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Search,
  Printer,
  ExternalLink,
  Calendar,
  Layers,
} from 'lucide-react';
import { Certificate } from '@projuktix/types';

export function VerifyCertificatePage() {
  const { id = 'sample' } = useParams<{ id: string }>();
  const [searchId, setSearchId] = useState('');
  const [activeCertId, setActiveCertId] = useState(id);

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ['certificate-verify', activeCertId],
    queryFn: async () => {
      if (activeCertId === 'sample') {
        // Sample credential preview
        const sample: Certificate = {
          id: 'cert-sample-systems-2026',
          certificateNumber: 'PJX-2026-SYS-8921',
          userId: 'user-demo-1',
          recipientName: 'Enterprise Cloud Architect',
          technologyId: 'tech-kubernetes',
          technologyName: 'Distributed Systems & Cloud-Native Architecture',
          assessmentSetId: 'assess-k8s-cka-1',
          assessmentTitle: 'Certified Cloud-Native Systems Engineering Examination',
          assessmentAttemptId: 'attempt-sample-1',
          score: 94,
          passPercentage: 75,
          issuedAt: new Date().toISOString(),
          verificationUrl: '/verify/sample',
          issuer: {
            organization: 'ProjuktiX Open Source Foundation',
            platform: 'ProjuktiX Technical Learning Ecosystem',
            disclaimer:
              'This certificate validates technical skill proficiency achieved via rigorous assessment on ProjuktiX. It is not an official vendor examination.',
          },
        };
        return sample;
      }
      return apiClient.verifyCertificate(activeCertId);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setActiveCertId(searchId.trim());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Search Header for Public Verification */}
      <div className="text-center max-w-xl mx-auto space-y-4 print:hidden">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 inline-block text-emerald-400">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Credential Verification Registry
        </h1>
        <p className="text-xs text-dark-muted">
          Validate authentic educational certificates issued by the ProjuktiX Open Source Platform.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Certificate ID e.g. PJX-2026-ORA-8921..."
            className="w-full p-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white placeholder-dark-muted focus:outline-none focus:border-cyber-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan shrink-0"
          >
            Verify
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyber-500 border-r-transparent"></div>
          <p className="text-xs text-dark-muted">Validating credential with registry database...</p>
        </div>
      ) : cert ? (
        <div className="space-y-6">
          {/* Certificate Card Render (Printable) */}
          <div className="rounded-3xl border-2 border-cyber-500/30 bg-dark-card p-8 sm:p-14 shadow-2xl relative overflow-hidden print:border-black print:text-black print:bg-white">
            {/* Background cyber watermark */}
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-12 translate-y-12">
              <img src="/logo.svg" alt="Watermark" className="w-96 h-96" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-dark-border/80 gap-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.svg" alt="ProjuktiX" className="h-10 w-10" />
                <div>
                  <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                    Projukti<span className="text-cyber-400 font-extrabold">X</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-dark-muted block">
                    Verified Credential Registry
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-dark-muted uppercase">Credential Number</span>
                <div className="text-sm font-mono font-bold text-cyber-400">
                  {cert.certificateNumber}
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="py-12 text-center space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-dark-muted">
                Certificate of Technical Proficiency
              </span>

              <div className="space-y-2">
                <p className="text-xs text-dark-muted">This credential is proudly awarded to</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {cert.recipientName}
                </h2>
              </div>

              <p className="text-xs text-dark-muted max-w-lg mx-auto leading-relaxed">
                for demonstrating verified architectural, operational, and practical mastery in
              </p>

              <div className="text-xl font-bold text-cyber-300">
                {cert.technologyName}
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>Examination Score: {cert.score}% (Pass Target: {cert.passPercentage}%)</span>
              </div>
            </div>

            {/* Footer Signatures & Issuer Info */}
            <div className="pt-8 border-t border-dark-border/80 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end text-xs">
              <div className="space-y-1">
                <div className="text-dark-muted">Authoritative Platform Issuer:</div>
                <div className="font-semibold text-white">{cert.issuer.organization}</div>
                <div className="text-[10px] text-dark-muted font-mono">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <div className="text-[10px] text-dark-muted/80 leading-relaxed">
                  {cert.issuer.disclaimer}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-center space-x-4 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-dark-surface border border-dark-border hover:bg-dark-border text-white transition-all shadow"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
            <Link
              to="/explore"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyber-500 text-white hover:brightness-110 shadow-neon-cyan transition-all"
            >
              <span>Explore More Tracks</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dark-border bg-dark-card space-y-3">
          <Award className="h-8 w-8 text-dark-muted mx-auto" />
          <h3 className="text-base font-bold text-white">Certificate Not Found</h3>
          <p className="text-xs text-dark-muted">
            The credential ID provided does not match any recorded ProjuktiX certificates.
          </p>
        </div>
      )}
    </div>
  );
}
