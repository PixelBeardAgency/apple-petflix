import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { authService, SignUpData, SignInData } from '../services/auth';
import type { User } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (data: SignInData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (
    updates: Partial<Pick<User, 'username' | 'bio' | 'profile_picture_url'>>
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    const userProfile = await authService.getUserProfile(userId);
    setProfile(userProfile);
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const subscription = authService.onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    const { user: newUser, error } = await authService.signUp(data);
    if (!error && newUser) {
      setUser(newUser);
      // Profile will be created by database trigger
      setTimeout(() => fetchProfile(newUser.id), 1000);
    }
    return { error };
  };

  const signIn = async (data: SignInData) => {
    const { user: newUser, error } = await authService.signIn(data);
    if (!error && newUser) {
      setUser(newUser);
      await fetchProfile(newUser.id);
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  };

  const updateProfile = async (
    updates: Partial<Pick<User, 'username' | 'bio' | 'profile_picture_url'>>
  ) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await authService.updateUserProfile(user.id, updates);
    if (!error) {
      await fetchProfile(user.id);
    }
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

