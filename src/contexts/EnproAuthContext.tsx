import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, type User } from '@/lib/auth-client';

interface AuthContextType {
  user: User | null;
  session: { user: User | null; access_token: string | null } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'github' | 'discord') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User | null; access_token: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = authClient.onAuthStateChange((user) => {
      setUser(user);
      setSession(user ? { user, access_token: localStorage.getItem('enpro_access_token') } : null);
      setLoading(false);
    });

    // Check for existing session
    authClient.getSession().then((session) => {
      setUser(session.user);
      setSession(session as any);
      setLoading(false);
    });

    // Check if returning from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('token')) {
      authClient.handleOAuthCallback();
    }

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Input validation
    if (!email || !password) {
      return { error: { message: 'Email e senha são obrigatórios' } };
    }
    
    const response = await authClient.signIn(email, password);
    
    if (!response.success) {
      return { error: { message: response.error || 'Email ou senha inválidos' } };
    }
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Input validation
    if (!email || !password) {
      return { error: { message: 'Email e senha são obrigatórios' } };
    }
    
    // Password strength validation
    if (password.length < 8) {
      return { error: { message: 'A senha deve ter pelo menos 8 caracteres' } };
    }
    
    const response = await authClient.signUp(email, password, displayName);
    
    if (!response.success) {
      return { error: { message: response.error || 'Erro ao criar conta' } };
    }
    
    return { error: null };
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'discord') => {
    console.log('Starting OAuth signin with provider:', provider);
    
    try {
      await authClient.signInWithProvider(provider);
      // Note: This will redirect the user, so no response is needed
      return { error: null };
    } catch (error) {
      console.error('OAuth signin error:', error);
      return { error: { message: 'Erro ao fazer login com ' + provider } };
    }
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};