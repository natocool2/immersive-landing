import { toast } from "@/hooks/use-toast";

const API_BASE_URL = 'https://auth.easynetpro.com/api';

// Types
export interface Application {
  id: string;
  app_name: string;
  client_id: string;
  client_secret?: string;
  redirect_uris: string[];
  allowed_origins: string[];
  scopes: string[];
  created_at: string;
}

export interface ApiKey {
  id: string;
  key?: string; // Only returned on creation
  key_prefix: string;
  name: string;
  description?: string;
  scopes: string[];
  rate_limit_tier: string;
  last_used_at?: string;
  usage_count: number;
  expires_at?: string;
  revoked_at?: string;
  created_at: string;
}

export interface ApiKeyStats {
  total_requests: number;
  avg_response_time: number;
  max_response_time: number;
  min_response_time: number;
  unique_ips: number;
  successful_requests: number;
  failed_requests: number;
}

export interface ApplicationSettings {
  webhook_url?: string;
  webhook_events?: string[];
  mfa_required?: boolean;
  rate_limit_per_minute?: number;
  rate_limit_per_hour?: number;
  logo_url?: string;
  primary_color?: string;
}

// API request helper - authentication handled by auth.easynetpro.com cookies
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for auth
    });
    
    if (response.status === 401) {
      // Redirect to auth if unauthorized
      window.location.href = 'https://auth.easynetpro.com/login?redirect=' + encodeURIComponent(window.location.href);
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Application APIs
export const applicationApi = {
  // List all applications
  async list(): Promise<{ success: boolean; applications: Application[] }> {
    return apiRequest('/applications');
  },
  
  // Create new application
  async create(data: {
    name: string;
    redirectUris?: string[];
    allowedOrigins?: string[];
    scopes?: string[];
  }): Promise<{ success: boolean; application: Application; clientSecret: string }> {
    return apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get application details
  async get(appId: string): Promise<{ success: boolean; application: Application & ApplicationSettings }> {
    return apiRequest(`/applications/${appId}`);
  },
  
  // Update application
  async update(appId: string, data: Partial<Application> & { settings?: ApplicationSettings }): Promise<{ success: boolean }> {
    return apiRequest(`/applications/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete application
  async delete(appId: string): Promise<{ success: boolean }> {
    return apiRequest(`/applications/${appId}`, {
      method: 'DELETE',
    });
  },
};

// API Key APIs
export const apiKeyApi = {
  // Create API key
  async create(appId: string, data: {
    name: string;
    description?: string;
    scopes?: string[];
    expiresIn?: number;
  }): Promise<{ 
    success: boolean; 
    apiKey: ApiKey & { key: string };
    message: string;
  }> {
    return apiRequest(`/applications/${appId}/keys`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // List API keys for an application
  async list(appId: string, includeRevoked = false): Promise<{ success: boolean; keys: ApiKey[] }> {
    const params = includeRevoked ? '?include_revoked=true' : '';
    return apiRequest(`/applications/${appId}/keys${params}`);
  },
  
  // Revoke API key
  async revoke(appId: string, keyId: string, reason?: string): Promise<{ success: boolean }> {
    return apiRequest(`/applications/${appId}/keys/${keyId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  },
  
  // Rotate API key
  async rotate(appId: string, keyId: string): Promise<{ 
    success: boolean; 
    apiKey: ApiKey & { key: string };
    message: string;
  }> {
    return apiRequest(`/applications/${appId}/keys/${keyId}/rotate`, {
      method: 'POST',
    });
  },
  
  // Get API key statistics
  async getStats(appId: string, keyId: string, days = 7): Promise<{ 
    success: boolean; 
    stats: ApiKeyStats;
    period: string;
  }> {
    return apiRequest(`/applications/${appId}/keys/${keyId}/stats?days=${days}`);
  },
};

// Auth check
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await apiRequest('/auth/session');
    return response.authenticated === true;
  } catch {
    return false;
  }
}

// Helper to show success/error toasts
export function showApiToast(success: boolean, message: string) {
  toast({
    title: success ? "Success" : "Error",
    description: message,
    variant: success ? "default" : "destructive",
  });
}