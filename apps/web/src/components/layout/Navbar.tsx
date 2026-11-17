import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import {
  Compass,
  BookOpen,
  Code2,
  CheckSquare,
  Award,
  Search,
  Moon,
  Sun,
  Shield,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ExternalLink,
  User as UserIcon,
} from 'lucide-react';

export function Navbar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { profile, openAuthModal, logout, isStaff } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Explore Technologies', path: '/explore', icon: Compass },
    { label: 'Documentation', path: '/documentation', icon: BookOpen },
    { label: 'Hands-on Labs', path: '/labs', icon: Code2 },
    { label: 'Assessments', path: '/assessments', icon: CheckSquare },
    { label: 'Architecture Explorer', path: '/architecture', icon: ExternalLink },
    { label: 'Verify Certificate', path: '/verify', icon: Award },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-border/80 bg-dark-bg/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.svg"
            alt="ProjuktiX Logo"
            className="h-9 w-9 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Projukti<span className="text-cyber-400 font-extrabold">X</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-dark-muted font-medium -mt-1">
              Universal Tech Academy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-cyber-400 bg-cyber-500/10 border border-cyber-500/20 shadow-sm'
                    : 'text-dark-muted hover:text-white hover:bg-dark-surface/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-dark-muted bg-dark-surface/60 border border-dark-border hover:border-dark-borderHover hover:text-white transition-all shadow-inner"
            title="Search technologies, courses, docs (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-cyber-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-dark-bg border border-dark-border rounded text-dark-muted">
              ⌘K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-dark-muted hover:text-white hover:bg-dark-surface/60 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-neon-amber" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Profile / Google Sign-In */}
          {profile ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-dark-border hover:border-cyber-500/40 bg-dark-surface/60 transition-all"
              >
                <span className="hidden sm:inline text-xs font-medium text-white max-w-[100px] truncate">
                  {profile.displayName}
                </span>
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.displayName}
                    className="h-7 w-7 rounded-full border border-cyber-500/30"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-cyber-600 flex items-center justify-center text-xs font-bold text-white">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-dark-border bg-dark-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-dark-border/60 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{profile.displayName}</p>
                    <p className="text-[11px] text-dark-muted truncate">{profile.email}</p>
                    <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyber-500/20 text-cyber-300 capitalize">
                      {profile.role.replace('_', ' ')}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-dark-muted hover:text-white hover:bg-dark-surface/60 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>My Learning Dashboard</span>
                  </Link>

                  {isStaff && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-neon-cyan hover:bg-cyber-500/15 rounded-lg transition-colors font-medium"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      <span>Enterprise Admin Portal</span>
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyber-500 to-neon-blue text-white shadow-neon-cyan hover:brightness-110 transition-all"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-dark-muted hover:text-white hover:bg-dark-surface/60 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-dark-border bg-dark-bg/95 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-muted hover:text-white hover:bg-dark-surface/60 transition-colors"
              >
                <Icon className="h-4 w-4 text-cyber-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {isStaff && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neon-cyan font-medium hover:bg-cyber-500/10 transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Enterprise Admin Portal</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
