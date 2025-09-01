import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Server, Plus, Activity, Cpu, HardDrive, Network, 
  Play, Square, RotateCw, Trash2, Scale, Package2,
  Terminal, Clock, AlertCircle, CheckCircle2, Loader2,
  BarChart3, Settings, ChevronRight, ArrowUpRight, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ContainerList } from "./ContainerList";
import { CreateContainerWizard } from "./CreateContainerWizard";
import { ContainerMetrics } from "./ContainerMetrics";
import { containerApi, type Container, type ContainerStats } from "@/services/containerApi";

export function ContainerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'containers' | 'metrics' | 'settings'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Container data
  const [containers, setContainers] = useState<Container[]>([]);
  const [stats, setStats] = useState<ContainerStats>({
    total: 0,
    running: 0,
    stopped: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkUsage: 0
  });

  // Load containers
  const loadContainers = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await containerApi.list();
      if (response.success) {
        setContainers(response.containers);
        
        // Calculate stats
        const running = response.containers.filter(c => c.status === 'running').length;
        const stopped = response.containers.filter(c => c.status === 'stopped').length;
        
        setStats({
          total: response.total,
          running,
          stopped,
          cpuUsage: response.containers.reduce((sum, c) => sum + (c.metrics?.cpu_usage || 0), 0) / response.total || 0,
          memoryUsage: response.containers.reduce((sum, c) => sum + (c.metrics?.memory_usage || 0), 0) / response.total || 0,
          diskUsage: response.containers.reduce((sum, c) => sum + (c.metrics?.disk_usage || 0), 0) / response.total || 0,
          networkUsage: response.containers.reduce((sum, c) => sum + (c.metrics?.network_rx_mb || 0) + (c.metrics?.network_tx_mb || 0), 0)
        });
      }
    } catch (error) {
      console.error('Failed to load containers:', error);
      toast({
        title: "Error",
        description: "Failed to load containers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadContainers();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadContainers(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="w-full">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 ring-1 ring-blue-300/30">
            <Server className="h-5 w-5 text-blue-300" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-white">Container Management</h1>
            <p className="text-sm text-white/70">Manage your LXD containers and resources</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadContainers(false)}
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Container
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex items-center gap-2 mb-8 overflow-x-auto">
        <TabButton id="overview" label="Overview" icon={Activity} isActive={activeTab === 'overview'} />
        <TabButton id="containers" label="Containers" icon={Server} isActive={activeTab === 'containers'} />
        <TabButton id="metrics" label="Metrics" icon={BarChart3} isActive={activeTab === 'metrics'} />
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
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Server className="w-5 h-5 text-blue-300" />
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Total</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                <p className="text-sm text-white/70">Containers</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Play className="w-5 h-5 text-green-300" />
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.running}</div>
                <p className="text-sm text-white/70">Running</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Square className="w-5 h-5 text-amber-300" />
                  <span className="text-xs text-white/50">Inactive</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.stopped}</div>
                <p className="text-sm text-white/70">Stopped</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-5 h-5 text-violet-300" />
                  <span className="text-xs text-white/50">{stats.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.cpuUsage.toFixed(0)}%
                </div>
                <p className="text-sm text-white/70">CPU Usage</p>
              </motion.div>
            </div>

            {/* Resource Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-300" />
                    <span className="text-white font-medium">Memory Usage</span>
                  </div>
                  <span className="text-sm text-white/70">{stats.memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all"
                    style={{ width: `${stats.memoryUsage}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-green-300" />
                    <span className="text-white font-medium">Disk Usage</span>
                  </div>
                  <span className="text-sm text-white/70">{stats.diskUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all"
                    style={{ width: `${stats.diskUsage}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-violet-300" />
                    <span className="text-white font-medium">Network</span>
                  </div>
                  <span className="text-sm text-white/70">{stats.networkUsage.toFixed(1)} MB</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Total Transfer</span>
                  <span>This Month</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20 justify-start"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Container
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20 justify-start"
                  onClick={() => setActiveTab('containers')}
                >
                  <Server className="w-4 h-4 mr-2" />
                  View All Containers
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20 justify-start"
                  onClick={() => setActiveTab('metrics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Metrics
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20 justify-start"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  SSH Access Guide
                </Button>
              </div>
            </div>

            {containers.length === 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-dashed border-white/20 text-center">
                <Package2 className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Containers Yet</h3>
                <p className="text-white/60 mb-6">Create your first container to get started</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Container
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'containers' && (
          <ContainerList 
            containers={containers} 
            onRefresh={() => loadContainers(false)}
            onContainerDeleted={() => loadContainers(false)}
          />
        )}

        {activeTab === 'metrics' && (
          <ContainerMetrics containers={containers} />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Container Settings</h3>
            <p className="text-white/70">Configure default settings for new containers</p>
            {/* Settings content will be implemented later */}
          </div>
        )}
      </motion.div>

      {/* Create Container Modal */}
      <CreateContainerWizard
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadContainers(false);
        }}
      />
    </div>
  );
}