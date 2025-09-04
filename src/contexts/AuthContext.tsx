import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signInWithProvider: (provider: 'google' | 'github' | 'discord') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_API = 'https://auth.easynetpro.com/api/auth';
const CONTAINER_API = 'https://api.easynetpro.com/api/v1';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check session via auth gateway (cookie-based authentication)
      const response = await fetch('/auth/api/auth/session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Token is managed via cookies now, not needed in frontend
          setToken('cookie-session');
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Use local auth endpoint (proxied to auth gateway)
      const response = await fetch('/auth/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken('cookie-session');
        return { error: null };
      }

      return { error: errorData.error || 'Login failed' };
    } catch (error) {
      return { error: error.message || 'Network error' };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name: displayName }),
      });

      if (response.ok) {
        // Auto sign in after registration
        return signIn(email, password);
      }

      const error = await response.json();
      return { error: error.detail || 'Registration failed' };
    } catch (error) {
      return { error: error.message || 'Network error' };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github' | 'discord') => {
    try {
      // OAuth flow - redirect to provider
      window.location.href = `${AUTH_API}/${provider}`;
      return { error: null };
    } catch (error) {
      return { error: error.message || 'OAuth error' };
    }
  };

  const signOut = async () => {
    try {
      // Call logout endpoint
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local state
    setUser(null);
    setToken(null);
    localStorage.removeItem('easynet_token');
    localStorage.removeItem('easynet_user');
  };

  const value = {
    user,
    token,
    loading,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Compatibility exports for existing code
export type { User };
export const Session = null; // For compatibility