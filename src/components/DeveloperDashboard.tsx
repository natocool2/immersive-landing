import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Code2, Key, BarChart3, Settings, Plus, Copy, Eye, EyeOff, 
  RotateCw, Trash2, Shield, Zap, Globe, Activity, Clock,
  Terminal, Sparkles, Layers, Package, Webhook, Database,
  CheckCircle2, AlertCircle, ChevronRight, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsed?: string;
  created: string;
  status: 'active' | 'revoked';
  usage: number;
  tier: 'standard' | 'premium' | 'enterprise';
}

interface Application {
  id: string;
  name: string;
  clientId: string;
  description?: string;
  redirectUris: string[];
  created: string;
  apiKeys: number;
  requests: number;
  users: number;
}

export function DeveloperDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'keys' | 'analytics' | 'settings'>('overview');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  
  // Mock data - will be replaced with API calls
  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      name: 'My SaaS Platform',
      clientId: 'app_1234567890',
      description: 'Main production application',
      redirectUris: ['https://myapp.com/callback'],
      created: '2024-01-15',
      apiKeys: 3,
      requests: 45230,
      users: 1250
    }
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      keyPrefix: 'sk_live_abc',
      scopes: ['read', 'write'],
      lastUsed: '2 minutes ago',
      created: '2024-01-20',
      status: 'active',
      usage: 12543,
      tier: 'premium'
    },
    {
      id: '2',
      name: 'Development Key',
      keyPrefix: 'sk_test_def',
      scopes: ['read'],
      lastUsed: '1 hour ago',
      created: '2024-02-01',
      status: 'active',
      usage: 3421,
      tier: 'standard'
    }
  ]);

  const stats = {
    totalRequests: 58673,
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    applications: applications.length,
    monthlyGrowth: 23.5
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
          >
            <Key className="w-4 h-4 mr-2" />
            Generate Key
          </Button>
        </div>
      </header>

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

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-300" />
                  Recent Activity
                </h3>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {[
                  { action: 'API Key Created', details: 'Production API Key', time: '2 minutes ago', icon: Key, color: 'text-green-400' },
                  { action: 'Application Updated', details: 'My SaaS Platform', time: '1 hour ago', icon: Package, color: 'text-blue-400' },
                  { action: 'Key Rotated', details: 'Development Key', time: '3 hours ago', icon: RotateCw, color: 'text-amber-400' },
                  { action: 'Webhook Added', details: 'user.created event', time: '1 day ago', icon: Webhook, color: 'text-purple-400' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{item.action}</p>
                        <p className="text-xs text-white/60">{item.details}</p>
                      </div>
                    </div>
                    <span className="text-xs text-white/50">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
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
                        <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                        <p className="text-sm text-white/60">{app.clientId}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  </div>

                  <p className="text-sm text-white/70 mb-4">{app.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-bold text-white">{app.apiKeys}</p>
                      <p className="text-xs text-white/60">API Keys</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{app.requests.toLocaleString()}</p>
                      <p className="text-xs text-white/60">Requests</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{app.users.toLocaleString()}</p>
                      <p className="text-xs text-white/60">Users</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/20">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/20">
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
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Active API Keys</h3>
                <p className="text-sm text-white/60">Manage and monitor your API keys</p>
              </div>
              
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
                                ${key.tier === 'enterprise' ? 'border-amber-500/30 text-amber-300' : ''}
                                ${key.tier === 'premium' ? 'border-violet-500/30 text-violet-300' : ''}
                                ${key.tier === 'standard' ? 'border-blue-500/30 text-blue-300' : ''}
                              `}
                            >
                              {key.tier}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1">
                            <code className="text-sm text-white/60 bg-black/30 px-2 py-1 rounded">
                              {key.keyPrefix}...
                            </code>
                            <span className="text-xs text-white/50">
                              Last used: {key.lastUsed}
                            </span>
                            <span className="text-xs text-white/50">
                              {key.usage.toLocaleString()} requests
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white/70 hover:text-white hover:bg-white/10"
                          onClick={() => {
                            navigator.clipboard.writeText(`${key.keyPrefix}...`);
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
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Volume Chart Placeholder */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-300" />
                  Request Volume
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-white/50">Chart visualization coming soon</p>
                </div>
              </div>

              {/* Response Time Chart Placeholder */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-300" />
                  Response Time
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-white/50">Chart visualization coming soon</p>
                </div>
              </div>
            </div>

            {/* Metrics Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="text-sm text-white/60">Uptime</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">45ms</p>
                  <p className="text-sm text-white/60">Avg Response</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">0.01%</p>
                  <p className="text-sm text-white/60">Error Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">2.5M</p>
                  <p className="text-sm text-white/60">Total Requests</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Developer Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="webhook-url" className="text-white/80 mb-2">Webhook URL</Label>
                  <Input 
                    id="webhook-url"
                    placeholder="https://api.yourapp.com/webhooks" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                  <p className="text-xs text-white/50 mt-1">Receive real-time event notifications</p>
                </div>

                <div>
                  <Label htmlFor="allowed-origins" className="text-white/80 mb-2">Allowed Origins (CORS)</Label>
                  <Input 
                    id="allowed-origins"
                    placeholder="https://yourapp.com, https://app.yourapp.com" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                  <p className="text-xs text-white/50 mt-1">Comma-separated list of allowed domains</p>
                </div>

                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}