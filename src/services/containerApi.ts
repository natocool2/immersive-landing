import { toast } from "@/hooks/use-toast";

// Use local API endpoint - nginx handles authentication
const API_BASE = '/api';

// Types
export interface Container {
  id: string;
  name: string;
  tenant_id: string;
  tier: 'small' | 'medium' | 'large';
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'creating' | 'deleting';
  ip_address: string;
  ssh_port: number;
  ssh_command: string;
  created_at: string;
  updated_at: string;
  resource_limits: {
    cpu: number;
    memory: string;
    disk: string;
  };
  network_config: {
    ip_address: string;
    ssh_port: number;
    http_port?: number;
    https_port?: number;
    custom_domain?: string;
  };
  metrics?: ContainerMetrics;
}

export interface ContainerMetrics {
  container_id: string;
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  memory_used_mb: number;
  memory_total_mb: number;
  disk_usage: number;
  disk_used_gb: number;
  disk_total_gb: number;
  network_rx_mb: number;
  network_tx_mb: number;
  processes: number;
}

export interface ContainerStats {
  total: number;
  running: number;
  stopped: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
}

export interface CreateContainerRequest {
  name: string;
  tier: 'small' | 'medium' | 'large';
  template_id?: string;
  ssh_keys?: string[];
  environment?: Record<string, string>;
  startup_script?: string;
}

// API request helper - authentication handled by nginx
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Send cookies for auth
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.href);
      throw new Error('Authentication required');
    }
    
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.statusText}`);
  }

  return response.json();
}

// Container API
export const containerApi = {
  // List containers
  async list(page = 1, perPage = 10, status?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(status ? { status } : {})
      });
      
      const data = await apiRequest(`/containers?${params}`);
      
      return {
        success: true,
        containers: data.containers || [],
        total: data.total || 0,
        page: data.page || 1,
        per_page: data.per_page || 10,
        pages: data.pages || 1
      };
    } catch (error: any) {
      console.error('Failed to list containers:', error);
      return {
        success: false,
        containers: [],
        total: 0,
        page: 1,
        per_page: 10,
        pages: 0,
        error: error.message
      };
    }
  },

  // Get container details
  async get(containerId: string) {
    try {
      const data = await apiRequest(`/containers/${containerId}`);
      return {
        success: true,
        container: data
      };
    } catch (error: any) {
      console.error('Failed to get container:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create container
  async create(request: CreateContainerRequest) {
    try {
      const data = await apiRequest('/containers', {
        method: 'POST',
        body: JSON.stringify(request)
      });
      
      return {
        success: true,
        container: data
      };
    } catch (error: any) {
      console.error('Failed to create container:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update container
  async update(containerId: string, updates: Partial<CreateContainerRequest>) {
    try {
      const data = await apiRequest(`/containers/${containerId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      return {
        success: true,
        container: data
      };
    } catch (error: any) {
      console.error('Failed to update container:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Delete container
  async delete(containerId: string) {
    try {
      await apiRequest(`/containers/${containerId}`, {
        method: 'DELETE'
      });
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Failed to delete container:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Perform action on container
  async performAction(containerId: string, action: string, parameters?: any) {
    try {
      const data = await apiRequest(`/containers/${containerId}/actions`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          parameters: parameters || {}
        })
      });
      
      return {
        success: true,
        result: data
      };
    } catch (error: any) {
      console.error(`Failed to ${action} container:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get container metrics
  async getMetrics(containerId: string) {
    try {
      const data = await apiRequest(`/containers/${containerId}/metrics`);
      
      return {
        success: true,
        metrics: data
      };
    } catch (error: any) {
      console.error('Failed to get metrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get container logs
  async getLogs(containerId: string, lines = 100) {
    try {
      const data = await apiRequest(`/containers/${containerId}/logs?lines=${lines}`);
      
      return {
        success: true,
        logs: data.logs || []
      };
    } catch (error: any) {
      console.error('Failed to get logs:', error);
      return {
        success: false,
        logs: [],
        error: error.message
      };
    }
  }
};

// Helper to show toast notifications
export function showContainerToast(success: boolean, message: string) {
  toast({
    title: success ? "Success" : "Error",
    description: message,
    variant: success ? "default" : "destructive"
  });
}
