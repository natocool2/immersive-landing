/**
 * EasyNetPro Auth Client
 * Enterprise authentication client for auth.easynetpro.com
 * Following Google-level best practices
 */

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  tenant_id?: string;
  permissions: string[];
}

interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  error?: string;
  requiresMfa?: boolean;
}

class AuthClient {
  private baseUrl: string;
  private user: User | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private authChangeCallbacks: Array<(user: User | null) => void> = [];

  constructor() {
    this.baseUrl = 'https://auth.easynetpro.com';
    this.initializeFromStorage();
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeFromStorage() {
    const storedUser = localStorage.getItem('enpro_user');
    const storedToken = localStorage.getItem('enpro_access_token');
    
    if (storedUser && storedToken) {
      try {
        this.user = JSON.parse(storedUser);
        this.accessToken = storedToken;
        this.validateToken();
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  /**
   * Validate current token with auth server
   */
  private async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        this.clearAuth();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuth() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('enpro_user');
    localStorage.removeItem('enpro_access_token');
    this.notifyAuthChange(null);
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyAuthChange(user: User | null) {
    this.authChangeCallbacks.forEach(callback => callback(user));
  }

  /**
   * Subscribe to auth state changes
   */
  public onAuthStateChange(callback: (user: User | null) => void) {
    this.authChangeCallbacks.push(callback);
    return () => {
      this.authChangeCallbacks = this.authChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current user
   */
  public getUser(): User | null {
    return this.user;
  }

  /**
   * Get current session
   */
  public async getSession() {
    await this.validateToken();
    return {
      user: this.user,
      access_token: this.accessToken,
    };
  }

  /**
   * Sign in with email and password
   */
  public async signIn(email: string, password: string, mfaCode?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, mfaCode }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.user = data.user;
        this.accessToken = data.accessToken;
        localStorage.setItem('enpro_user', JSON.stringify(data.user));
        localStorage.setItem('enpro_access_token', data.accessToken);
        this.notifyAuthChange(data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Sign up with email and password
   */
  public async signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        this.user = data.user;
        this.accessToken = data.accessToken;
        localStorage.setItem('enpro_user', JSON.stringify(data.user));
        localStorage.setItem('enpro_access_token', data.accessToken);
        this.notifyAuthChange(data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  public async signInWithProvider(provider: 'google' | 'github' | 'discord') {
    // Store return URL for after auth
    const returnUrl = window.location.href;
    localStorage.setItem('enpro_return_url', returnUrl);

    // Redirect to auth server OAuth endpoint
    window.location.href = `${this.baseUrl}/api/auth/${provider}?redirect_uri=${encodeURIComponent(returnUrl)}`;
  }

  /**
   * Handle OAuth callback
   */
  public async handleOAuthCallback(): Promise<AuthResponse> {
    try {
      // Check for auth cookie set by auth server
      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.user) {
          this.user = data.user;
          this.accessToken = data.accessToken;
          localStorage.setItem('enpro_user', JSON.stringify(data.user));
          localStorage.setItem('enpro_access_token', data.accessToken);
          this.notifyAuthChange(data.user);

          // Redirect to original page
          const returnUrl = localStorage.getItem('enpro_return_url') || '/';
          localStorage.removeItem('enpro_return_url');
          window.location.href = returnUrl;

          return { success: true, user: data.user };
        }
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Sign out
   */
  public async signOut() {
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.clearAuth();
    window.location.href = '/';
  }

  /**
   * Refresh access token
   */
  public async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        localStorage.setItem('enpro_access_token', data.accessToken);
        return true;
      }

      this.clearAuth();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authClient = new AuthClient();

// Export types
export type { User, AuthResponse };