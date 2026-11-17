import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  User,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.js';
import { apiClient } from '../lib/api-client.js';
import { UserProfile, UserRole } from '@projuktix/types';
import { AuthModal } from '../components/auth/AuthModal.js';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const syncUserProfile = async (user: User): Promise<UserProfile> => {
    try {
      const token = await user.getIdToken();
      apiClient.setAuthToken(token);
      const syncedProfile = await apiClient.syncAuth();
      setProfile(syncedProfile);
      return syncedProfile;
    } catch (err) {
      console.warn('[AuthContext] Backend profile sync fallback to client profile:', err);
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Learner',
        photoUrl: user.photoURL || undefined,
        role: 'learner',
        isActive: true,
        preferences: {
          theme: 'dark',
          emailNotifications: true,
          codeEditorTheme: 'vs-dark',
          defaultCodeFontSize: 14,
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    // 1. Check for pending redirect sign-in results (e.g. mobile or popup-blocked browsers)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          setFirebaseUser(result.user);
          await syncUserProfile(result.user);
        }
      })
      .catch((err) => {
        console.warn('[AuthContext] Redirect sign-in result error:', err);
      });

    // 2. Listen to active auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        apiClient.setAuthToken(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setFirebaseUser(result.user);
      await syncUserProfile(result.user);
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked') {
        console.info('[AuthContext] Popup blocked, falling back to redirect flow...');
        await signInWithRedirect(auth, googleAuthProvider);
        return;
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    setFirebaseUser(cred.user);
    await syncUserProfile(cred.user);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    setFirebaseUser(cred.user);
    await syncUserProfile(cred.user);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    apiClient.setAuthToken(null);
    setFirebaseUser(null);
    setProfile(null);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  };

  const isStaff = !!profile && [
    'super_admin',
    'platform_admin',
    'content_admin',
    'content_reviewer',
    'auditor',
  ].includes(profile.role);

  const isAdmin = !!profile && ['super_admin', 'platform_admin'].includes(profile.role);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        isLoading,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        logout,
        hasRole,
        isStaff,
        isAdmin,
      }}
    >
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
