import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Sparkles, Loader2, Check } from 'lucide-react';

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResetMode(false);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const handleGoogleAuth = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      console.error('[AuthModal] Google Sign-In Error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed. Please try again.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMessage('This domain is being authorized. Please try again or use email sign-in.');
      } else {
        setErrorMessage(err?.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isResetMode) {
      if (!email.trim()) {
        setErrorMessage('Please enter your email address to reset password.');
        return;
      }
      try {
        setIsSubmitting(true);
        await sendPasswordReset(email.trim());
        setSuccessMessage('Password reset link sent to your email! Please check your inbox.');
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to send password reset email.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (authModalMode === 'signup') {
        if (!displayName.trim()) {
          setErrorMessage('Please provide your full name or handle.');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email.trim(), password, displayName.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      handleClose();
    } catch (err: any) {
      console.error('[AuthModal] Email Auth Error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (err?.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email. Please register first.');
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-dark-border bg-dark-card p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-dark-muted hover:text-white hover:bg-dark-surface transition-colors"
          title="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyber-500/30 bg-cyber-500/10 text-[11px] font-semibold text-cyber-300">
            <Sparkles className="h-3 w-3 text-cyber-400" />
            <span>Universal Engineering Academy</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isResetMode
              ? 'Reset Your Password'
              : authModalMode === 'signup'
              ? 'Create Learner Account'
              : 'Sign In to ProjuktiX'}
          </h2>
          <p className="text-xs text-dark-muted max-w-xs mx-auto">
            {isResetMode
              ? 'Enter your registered email to receive an official recovery link.'
              : authModalMode === 'signup'
              ? 'Join thousands of engineers tracking verified skill certificates and labs.'
              : 'Access your cloud progress, interactive labs, and certified transcripts.'}
          </p>
        </div>

        {/* Tab Switcher (if not reset mode) */}
        {!isResetMode && (
          <div className="flex rounded-xl bg-dark-surface p-1 mb-6 border border-dark-border">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                openAuthModal('signin');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'signin'
                  ? 'bg-cyber-500 text-white shadow-sm'
                  : 'text-dark-muted hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                openAuthModal('signup');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'signup'
                  ? 'bg-cyber-500 text-white shadow-sm'
                  : 'text-dark-muted hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1-Click Google Auth */}
        {!isResetMode && (
          <>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold bg-white text-dark-bg hover:bg-slate-100 disabled:opacity-60 transition-all shadow-md group"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                <span className="bg-dark-card px-3 text-dark-muted">or continue with email</span>
              </div>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && !isResetMode && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider">
                Full Name / Handle
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-dark-muted" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full rounded-xl border border-dark-border bg-dark-surface/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-dark-muted focus:border-cyber-500 focus:outline-none focus:ring-1 focus:ring-cyber-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-dark-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@enterprise.com"
                className="w-full rounded-xl border border-dark-border bg-dark-surface/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-dark-muted focus:border-cyber-500 focus:outline-none focus:ring-1 focus:ring-cyber-500"
              />
            </div>
          </div>

          {!isResetMode && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-dark-muted uppercase tracking-wider">
                  Password
                </label>
                {authModalMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setIsResetMode(true);
                    }}
                    className="text-[11px] text-cyber-400 hover:text-cyber-300 transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-dark-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-dark-border bg-dark-surface/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-dark-muted focus:border-cyber-500 focus:outline-none focus:ring-1 focus:ring-cyber-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-cyber-500 hover:bg-cyber-400 text-white disabled:opacity-60 transition-all shadow-neon-cyan"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isResetMode ? (
              <span>Send Recovery Link</span>
            ) : authModalMode === 'signup' ? (
              <span>Create Account</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {isResetMode && (
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
                setIsResetMode(false);
              }}
              className="w-full text-center text-xs text-dark-muted hover:text-white transition-colors pt-2"
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
