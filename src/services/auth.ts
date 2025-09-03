// Authentication service for EasyNet Pro
const API_BASE = 'https://api.easynetpro.com/api/v1';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
}

export class AuthService {
  private static TOKEN_KEY = 'easynet_token';
  private static REFRESH_TOKEN_KEY = 'easynet_refresh_token';
  private static USER_KEY = 'easynet_user';

  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    
    // Store tokens and user info
    localStorage.setItem(this.TOKEN_KEY, data.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refresh_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    
    return data;
  }

  static async logout(): Promise<void> {
    // Clear stored data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUser(): any | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data: LoginResponse = await response.json();
    
    // Update stored tokens
    localStorage.setItem(this.TOKEN_KEY, data.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refresh_token);
  }
}

export default AuthService;