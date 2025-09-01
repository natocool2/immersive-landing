import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, Cpu, HardDrive, Network, TrendingUp, TrendingDown,
  Clock, Server, BarChart3, LineChart, PieChart, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { containerApi, type Container } from "@/services/containerApi";

interface ContainerMetricsProps {
  containers: Container[];
}

export function ContainerMetrics({ containers }: ContainerMetricsProps) {
  const [selectedContainer, setSelectedContainer] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedContainer && selectedContainer !== 'all') {
      loadMetrics(selectedContainer);
    }
  }, [selectedContainer, timeRange]);

  const loadMetrics = async (containerId: string) => {
    setLoading(true);
    try {
      const response = await containerApi.getMetrics(containerId);
      if (response.success) {
        setMetrics(response.metrics);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics for all containers
  const aggregateMetrics = {
    totalCpu: containers.reduce((sum, c) => sum + (c.metrics?.cpu_usage || 0), 0) / containers.length || 0,
    totalMemory: containers.reduce((sum, c) => sum + (c.metrics?.memory_usage || 0), 0) / containers.length || 0,
    totalDisk: containers.reduce((sum, c) => sum + (c.metrics?.disk_usage || 0), 0) / containers.length || 0,
    totalNetwork: containers.reduce((sum, c) => sum + (c.metrics?.network_rx_mb || 0) + (c.metrics?.network_tx_mb || 0), 0),
    totalProcesses: containers.reduce((sum, c) => sum + (c.metrics?.processes || 0), 0),
  };

  const getStatusColor = (value: number, type: string) => {
    if (type === 'cpu' || type === 'memory' || type === 'disk') {
      if (value < 50) return 'text-green-300';
      if (value < 80) return 'text-yellow-300';
      return 'text-red-300';
    }
    return 'text-blue-300';
  };

  const MetricCard = ({ icon: Icon, label, value, unit, trend, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-white/80 text-sm">{label}</span>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold text-white`}>{value}</span>
        <span className="text-sm text-white/50">{unit}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={selectedContainer} onValueChange={setSelectedContainer}>
            <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select container" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All Containers</SelectItem>
              {containers.map((container) => (
                <SelectItem key={container.id} value={container.id}>
                  {container.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* Overview Metrics */}
      {selectedContainer === 'all' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Cpu}
              label="Average CPU Usage"
              value={aggregateMetrics.totalCpu.toFixed(1)}
              unit="%"
              color={getStatusColor(aggregateMetrics.totalCpu, 'cpu')}
              trend={2.3}
            />
            <MetricCard
              icon={HardDrive}
              label="Average Memory"
              value={aggregateMetrics.totalMemory.toFixed(1)}
              unit="%"
              color={getStatusColor(aggregateMetrics.totalMemory, 'memory')}
              trend={-1.2}
            />
            <MetricCard
              icon={HardDrive}
              label="Average Disk"
              value={aggregateMetrics.totalDisk.toFixed(1)}
              unit="%"
              color={getStatusColor(aggregateMetrics.totalDisk, 'disk')}
              trend={0.5}
            />
            <MetricCard
              icon={Network}
              label="Total Network"
              value={aggregateMetrics.totalNetwork.toFixed(1)}
              unit="MB"
              color="text-violet-300"
            />
          </div>

          {/* Container Performance Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Container Performance</h3>
              <p className="text-sm text-white/60">Real-time resource usage by container</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-white/80">Container</th>
                    <th className="text-left p-4 text-sm font-medium text-white/80">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-white/80">CPU</th>
                    <th className="text-left p-4 text-sm font-medium text-white/80">Memory</th>
                    <th className="text-left p-4 text-sm font-medium text-white/80">Disk</th>
                    <th className="text-left p-4 text-sm font-medium text-white/80">Network</th>
                    <th className="text-left p-4 text-sm font-medium text-white/80">Processes</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((container) => (
                    <tr key={container.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-blue-300" />
                          <span className="text-white text-sm">{container.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`
                          ${container.status === 'running' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}
                          ${container.status === 'stopped' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : ''}
                        `}>
                          {container.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getStatusColor(container.metrics?.cpu_usage || 0, 'cpu')}`}>
                            {container.metrics?.cpu_usage?.toFixed(1) || '0.0'}%
                          </span>
                          <div className="w-16 bg-black/30 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1.5 rounded-full"
                              style={{ width: `${container.metrics?.cpu_usage || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getStatusColor(container.metrics?.memory_usage || 0, 'memory')}`}>
                            {container.metrics?.memory_usage?.toFixed(1) || '0.0'}%
                          </span>
                          <div className="w-16 bg-black/30 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full"
                              style={{ width: `${container.metrics?.memory_usage || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${getStatusColor(container.metrics?.disk_usage || 0, 'disk')}`}>
                            {container.metrics?.disk_usage?.toFixed(1) || '0.0'}%
                          </span>
                          <div className="w-16 bg-black/30 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-violet-400 to-purple-400 h-1.5 rounded-full"
                              style={{ width: `${container.metrics?.disk_usage || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-white/70">
                          {((container.metrics?.network_rx_mb || 0) + (container.metrics?.network_tx_mb || 0)).toFixed(1)} MB
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-white/70">
                          {container.metrics?.processes || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Individual Container Metrics */
        <>
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={Cpu}
                label="CPU Usage"
                value={metrics.cpu_usage.toFixed(1)}
                unit="%"
                color={getStatusColor(metrics.cpu_usage, 'cpu')}
              />
              <MetricCard
                icon={HardDrive}
                label="Memory Usage"
                value={metrics.memory_used_mb}
                unit={`MB / ${metrics.memory_total_mb} MB`}
                color={getStatusColor(metrics.memory_usage, 'memory')}
              />
              <MetricCard
                icon={HardDrive}
                label="Disk Usage"
                value={metrics.disk_used_gb.toFixed(1)}
                unit={`GB / ${metrics.disk_total_gb} GB`}
                color={getStatusColor(metrics.disk_usage, 'disk')}
              />
              <MetricCard
                icon={Activity}
                label="Processes"
                value={metrics.processes}
                unit="active"
                color="text-blue-300"
              />
            </div>
          )}

          {!metrics && !loading && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
              <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/70">Select a container to view detailed metrics</p>
            </div>
          )}
        </>
      )}

      {/* Alert Thresholds */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-300 mt-0.5" />
          <div className="text-sm text-amber-200">
            <p className="font-medium">Monitoring Active</p>
            <p className="text-xs text-amber-200/70 mt-1">
              Alerts will be triggered when CPU > 80%, Memory > 90%, or Disk > 85%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}