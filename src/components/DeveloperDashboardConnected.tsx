import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Code2, Key, BarChart3, Settings, Plus, Copy, Eye, EyeOff, 
  RotateCw, Trash2, Shield, Zap, Globe, Activity, Clock,
  Terminal, Sparkles, Layers, Package, Webhook, Database,
  CheckCircle2, AlertCircle, ChevronRight, ArrowUpRight, Loader2, RefreshCw,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  applicationApi, 
  apiKeyApi, 
  checkAuth,
  showApiToast,
  type Application,
  type ApiKey,
  type ApplicationSettings
} from "@/services/developerApi";
import { ContainerDashboard } from "./ContainerDashboard";

export function DeveloperDashboardConnected() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'keys' | 'analytics' | 'containers' | 'settings'>('overview');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Real data from API
  const [applications, setApplications] = useState<Application[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  
  // Form states
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    redirectUris: '',
    allowedOrigins: '',
  });
  
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    description: '',
    scopes: ['read', 'write'],
    expiresIn: 365,
  });

  // New key display
  const [newKeyCreated, setNewKeyCreated] = useState<{ key: string; name: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      setAuthenticated(isAuthenticated);
      if (!isAuthenticated) {
        window.location.href = 'https://auth.easynetpro.com/login?redirect=' + encodeURIComponent(window.location.href);
      } else {
        loadApplications();
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  // Load applications
  const loadApplications = async () => {
    try {
      const response = await applicationApi.list();
      if (response.success) {
        setApplications(response.applications);
        if (response.applications.length > 0 && !selectedApp) {
          setSelectedApp(response.applications[0]);
          loadApiKeys(response.applications[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      showApiToast(false, 'Failed to load applications');
    }
  };

  // Load API keys for selected app
  const loadApiKeys = async (appId: string) => {
    try {
      const response = await apiKeyApi.list(appId);
      if (response.success) {
        setApiKeys(response.keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  // Create new application
  const handleCreateApp = async () => {
    try {
      const response = await applicationApi.create({
        name: newAppForm.name,
        redirectUris: newAppForm.redirectUris.split(',').map(uri => uri.trim()).filter(Boolean),
        allowedOrigins: newAppForm.allowedOrigins.split(',').map(origin => origin.trim()).filter(Boolean),
      });
      
      if (response.success) {
        showApiToast(true, 'Application created successfully');
        setApplications([...applications, response.application]);
        setShowNewAppModal(false);
        setNewAppForm({ name: '', redirectUris: '', allowedOrigins: '' });
        
        // Show client secret
        toast({
          title: "Save your Client Secret",
          description: (
            <div className="mt-2">
              <code className="block bg-black/20 p-2 rounded text-xs break-all">
                {response.clientSecret}
              </code>
              <p className="mt-2 text-xs">This will not be shown again!</p>
            </div>
          ),
          duration: 10000,
        });
      }
    } catch (error: any) {
      showApiToast(false, error.message || 'Failed to create application');
    }
  };

  // Create new API key
  const handleCreateKey = async () => {
    if (!selectedApp) {
      showApiToast(false, 'Please select an application first');
      return;
    }
    
    try {
      const response = await apiKeyApi.create(selectedApp.id, newKeyForm);
      
      if (response.success) {
        showApiToast(true, response.message);
        setNewKeyCreated({ key: response.apiKey.key, name: response.apiKey.name });
        loadApiKeys(selectedApp.id);
        setShowNewKeyModal(false);
        setNewKeyForm({ name: '', description: '', scopes: ['read', 'write'], expiresIn: 365 });
      }
    } catch (error: any) {
      showApiToast(false, error.message || 'Failed to create API key');
    }
  };

  // Revoke API key
  const handleRevokeKey = async (keyId: string) => {
    if (!selectedApp) return;
    
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      try {
        const response = await apiKeyApi.revoke(selectedApp.id, keyId);
        if (response.success) {
          showApiToast(true, 'API key revoked successfully');
          loadApiKeys(selectedApp.id);
        }
      } catch (error: any) {
        showApiToast(false, error.message || 'Failed to revoke API key');
      }
    }
  };

  // Rotate API key
  const handleRotateKey = async (keyId: string) => {
    if (!selectedApp) return;
    
    if (confirm('Are you sure you want to rotate this API key? The old key will be revoked.')) {
      try {
        const response = await apiKeyApi.rotate(selectedApp.id, keyId);
        if (response.success) {
          showApiToast(true, response.message);
          setNewKeyCreated({ key: response.apiKey.key, name: response.apiKey.name });
          loadApiKeys(selectedApp.id);
        }
      } catch (error: any) {
        showApiToast(false, error.message || 'Failed to rotate API key');
      }
    }
  };

  // Calculate stats
  const stats = {
    totalRequests: apiKeys.reduce((sum, key) => sum + (key.usage_count || 0), 0),
    activeKeys: apiKeys.filter(k => !k.revoked_at).length,
    applications: applications.length,
    monthlyGrowth: 23.5 // TODO: Calculate from real data
  };

  const TabButton = ({ id, label, icon: Icon, isActive }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl transition-all
        ${isActive 
          ? 'bg-white/10 text-white ring-1 ring-white/20' 
          : 'text-white/70 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
          <p className="text-white/70">Please log in to access the Developer Dashboard</p>
          <Button 
            onClick={() => window.location.href = 'https://auth.easynetpro.com/login?redirect=' + encodeURIComponent(window.location.href)}
            className="mt-4 bg-gradient-to-r from-violet-500 to-purple-600"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400/20 to-purple-400/20 ring-1 ring-violet-300/30">
            <Code2 className="h-5 w-5 text-violet-300" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-white">Developer Dashboard</h1>
            <p className="text-sm text-white/70">Manage your applications and API keys</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadApplications()}
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowNewAppModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            New App
          </Button>
          <Button
            onClick={() => setShowNewKeyModal(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            disabled={!selectedApp}
          >
            <Key className="w-4 h-4 mr-2" />
            Generate Key
          </Button>
        </div>
      </header>

      {/* App Selector (if multiple apps) */}
      {applications.length > 1 && (
        <div className="mb-6">
          <Label className="text-white/80 mb-2">Select Application</Label>
          <select
            value={selectedApp?.id || ''}
            onChange={(e) => {
              const app = applications.find(a => a.id === e.target.value);
              if (app) {
                setSelectedApp(app);
                loadApiKeys(app.id);
              }
            }}
            className="w-full sm:w-auto bg-white/10 border-white/20 text-white rounded-lg px-4 py-2"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id} className="bg-gray-900">
                {app.app_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <nav className="flex items-center gap-2 mb-8 overflow-x-auto">
        <TabButton id="overview" label="Overview" icon={Activity} isActive={activeTab === 'overview'} />
        <TabButton id="applications" label="Applications" icon={Package} isActive={activeTab === 'applications'} />
        <TabButton id="keys" label="API Keys" icon={Key} isActive={activeTab === 'keys'} />
        <TabButton id="analytics" label="Analytics" icon={BarChart3} isActive={activeTab === 'analytics'} />
        <TabButton id="settings" label="Settings" icon={Settings} isActive={activeTab === 'settings'} />
      </nav>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-violet-300" />
                  <span className="text-xs text-green-400">+{stats.monthlyGrowth}%</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.totalRequests.toLocaleString()}
                </div>
                <p className="text-sm text-white/70">Total API Requests</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Key className="w-5 h-5 text-blue-300" />
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.activeKeys}</div>
                <p className="text-sm text-white/70">Active API Keys</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-emerald-300" />
                  <ArrowUpRight className="w-4 h-4 text-white/50" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.applications}</div>
                <p className="text-sm text-white/70">Applications</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-5 h-5 text-amber-300" />
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">99.9%</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">Enterprise</div>
                <p className="text-sm text-white/70">Security Level</p>
              </motion.div>
            </div>

            {applications.length === 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-dashed border-white/20 text-center">
                <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-white/60 mb-6">Create your first application to start using the API</p>
                <Button
                  onClick={() => setShowNewAppModal(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Application
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applications.map((app) => (
                <motion.div
                  key={app.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-violet-300/30">
                        <Package className="w-6 h-6 text-violet-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{app.app_name}</h3>
                        <p className="text-sm text-white/60">{app.client_id}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-white/70">
                      <span className="text-white/50">Created:</span> {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    {app.redirect_uris && app.redirect_uris.length > 0 && (
                      <p className="text-white/70">
                        <span className="text-white/50">Redirect URIs:</span> {app.redirect_uris.length}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/20">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-white/5 hover:bg-white/10 text-white border-white/20"
                      onClick={() => {
                        setSelectedApp(app);
                        loadApiKeys(app.id);
                        setActiveTab('keys');
                      }}
                    >
                      <Key className="w-4 h-4 mr-1" />
                      API Keys
                    </Button>
                  </div>
                </motion.div>
              ))}

              {/* Add New Application Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowNewAppModal(true)}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-dashed border-white/20 flex flex-col items-center justify-center min-h-[250px] cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Plus className="w-12 h-12 text-white/40 mb-3" />
                <p className="text-white/70 font-medium">Create New Application</p>
                <p className="text-sm text-white/50 mt-1">Add a new app to get started</p>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            {selectedApp ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">API Keys for {selectedApp.app_name}</h3>
                  <p className="text-sm text-white/60">Manage and monitor your API keys</p>
                </div>
                
                {apiKeys.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="p-6 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-violet-300/30">
                              <Key className="w-5 h-5 text-violet-300" />
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-white font-medium">{key.name}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`
                                    ${key.rate_limit_tier === 'enterprise' ? 'border-amber-500/30 text-amber-300' : ''}
                                    ${key.rate_limit_tier === 'premium' ? 'border-violet-500/30 text-violet-300' : ''}
                                    ${key.rate_limit_tier === 'standard' ? 'border-blue-500/30 text-blue-300' : ''}
                                  `}
                                >
                                  {key.rate_limit_tier}
                                </Badge>
                                {key.revoked_at && (
                                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Revoked</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 mt-1">
                                <code className="text-sm text-white/60 bg-black/30 px-2 py-1 rounded">
                                  {key.key_prefix}...
                                </code>
                                {key.last_used_at && (
                                  <span className="text-xs text-white/50">
                                    Last used: {new Date(key.last_used_at).toLocaleString()}
                                  </span>
                                )}
                                <span className="text-xs text-white/50">
                                  {key.usage_count.toLocaleString()} requests
                                </span>
                              </div>
                            </div>
                          </div>

                          {!key.revoked_at && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/70 hover:text-white hover:bg-white/10"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${key.key_prefix}...`);
                                  toast({
                                    title: "Copied!",
                                    description: "API key prefix copied to clipboard",
                                  });
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/70 hover:text-white hover:bg-white/10"
                                onClick={() => handleRotateKey(key.id)}
                              >
                                <RotateCw className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => handleRevokeKey(key.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Key className="w-12 h-12 text-white/40 mx-auto mb-3" />
                    <p className="text-white/70">No API keys yet</p>
                    <Button
                      onClick={() => setShowNewKeyModal(true)}
                      className="mt-4 bg-gradient-to-r from-violet-500 to-purple-600"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create API Key
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
                <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/70">Please select or create an application first</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* New Application Modal */}
      <Dialog open={showNewAppModal} onOpenChange={setShowNewAppModal}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Create New Application</DialogTitle>
            <DialogDescription className="text-white/70">
              Register a new application to access the API
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="app-name" className="text-white/80">Application Name</Label>
              <Input
                id="app-name"
                placeholder="My Awesome App"
                value={newAppForm.name}
                onChange={(e) => setNewAppForm({...newAppForm, name: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="redirect-uris" className="text-white/80">Redirect URIs (comma-separated)</Label>
              <Input
                id="redirect-uris"
                placeholder="https://myapp.com/callback, http://localhost:3000/callback"
                value={newAppForm.redirectUris}
                onChange={(e) => setNewAppForm({...newAppForm, redirectUris: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="allowed-origins" className="text-white/80">Allowed Origins (comma-separated)</Label>
              <Input
                id="allowed-origins"
                placeholder="https://myapp.com, http://localhost:3000"
                value={newAppForm.allowedOrigins}
                onChange={(e) => setNewAppForm({...newAppForm, allowedOrigins: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowNewAppModal(false)} className="text-white/70">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateApp}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
              disabled={!newAppForm.name}
            >
              Create Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New API Key Modal */}
      <Dialog open={showNewKeyModal} onOpenChange={setShowNewKeyModal}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription className="text-white/70">
              Create a new API key for {selectedApp?.app_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="key-name" className="text-white/80">Key Name</Label>
              <Input
                id="key-name"
                placeholder="Production API Key"
                value={newKeyForm.name}
                onChange={(e) => setNewKeyForm({...newKeyForm, name: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="key-description" className="text-white/80">Description (optional)</Label>
              <Textarea
                id="key-description"
                placeholder="Used for production environment"
                value={newKeyForm.description}
                onChange={(e) => setNewKeyForm({...newKeyForm, description: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="expires-in" className="text-white/80">Expires In (days)</Label>
              <Input
                id="expires-in"
                type="number"
                value={newKeyForm.expiresIn}
                onChange={(e) => setNewKeyForm({...newKeyForm, expiresIn: parseInt(e.target.value) || 365})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowNewKeyModal(false)} className="text-white/70">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateKey}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
              disabled={!newKeyForm.name}
            >
              Generate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Display Modal */}
      <Dialog open={!!newKeyCreated} onOpenChange={() => setNewKeyCreated(null)}>
        <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              API Key Created Successfully
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Save this API key securely. It will not be shown again!
            </DialogDescription>
          </DialogHeader>
          {newKeyCreated && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80">Key Name</Label>
                <p className="text-white font-medium">{newKeyCreated.name}</p>
              </div>
              <div>
                <Label className="text-white/80">API Key</Label>
                <div className="bg-black/30 p-4 rounded-lg mt-1">
                  <code className="text-sm text-green-400 break-all">
                    {newKeyCreated.key}
                  </code>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(newKeyCreated.key);
                    toast({
                      title: "Copied!",
                      description: "API key copied to clipboard",
                    });
                  }}
                  className="mt-2 bg-white/10 hover:bg-white/20"
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setNewKeyCreated(null)}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              I've Saved the Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}