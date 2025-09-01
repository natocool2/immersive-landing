import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Server, Play, Square, RotateCw, Trash2, Scale, 
  Terminal, Clock, ChevronRight, Copy, Camera,
  MoreVertical, ExternalLink, Activity, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { containerApi, type Container } from "@/services/containerApi";

interface ContainerListProps {
  containers: Container[];
  onRefresh: () => void;
  onContainerDeleted: () => void;
}

export function ContainerList({ containers, onRefresh, onContainerDeleted }: ContainerListProps) {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTier, setNewTier] = useState<string>('small');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (container: Container, action: string, params?: any) => {
    setActionLoading(`${container.id}-${action}`);
    
    try {
      const response = await containerApi.performAction(container.id, action, params);
      if (response.success) {
        toast({
          title: "Success",
          description: `Container ${action} completed successfully`,
        });
        onRefresh();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} container`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleScale = async () => {
    if (!selectedContainer) return;
    
    await handleAction(selectedContainer, 'scale', { tier: newTier });
    setShowScaleModal(false);
    setSelectedContainer(null);
  };

  const handleDelete = async () => {
    if (!selectedContainer) return;
    
    setActionLoading(`${selectedContainer.id}-delete`);
    
    try {
      const response = await containerApi.delete(selectedContainer.id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Container deleted successfully",
        });
        onContainerDeleted();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete container",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
      setSelectedContainer(null);
    }
  };

  const copySSHCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "Copied!",
      description: "SSH command copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'stopped':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'starting':
      case 'stopping':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'small':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'medium':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'large':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTierSpecs = (tier: string) => {
    switch (tier) {
      case 'small':
        return '1 CPU • 1GB RAM • 10GB Disk';
      case 'medium':
        return '1 CPU • 2GB RAM • 50GB Disk';
      case 'large':
        return '2 CPUs • 4GB RAM • 100GB Disk';
      default:
        return 'Custom configuration';
    }
  };

  if (containers.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-dashed border-white/20 text-center">
        <Server className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Containers Found</h3>
        <p className="text-white/60">Create your first container to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {containers.map((container) => (
        <motion.div
          key={container.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Container Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center ring-1 ring-blue-300/30">
                  <Server className="w-6 h-6 text-blue-300" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{container.name}</h3>
                    <Badge className={getStatusColor(container.status)}>
                      {container.status}
                    </Badge>
                    <Badge className={getTierColor(container.tier)}>
                      {container.tier}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Terminal className="w-4 h-4 text-white/50" />
                      <code className="bg-black/30 px-2 py-0.5 rounded text-xs">
                        {container.ssh_command}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-white/50 hover:text-white"
                        onClick={() => copySSHCommand(container.ssh_command)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/70">
                      <Activity className="w-4 h-4 text-white/50" />
                      <span>IP: {container.ip_address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-4 h-4 text-white/50" />
                      <span>Created {new Date(container.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-white/50">
                    {getTierSpecs(container.tier)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {container.status === 'stopped' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-300 border-green-500/30"
                    onClick={() => handleAction(container, 'start')}
                    disabled={actionLoading === `${container.id}-start`}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30"
                    onClick={() => handleAction(container, 'stop')}
                    disabled={actionLoading === `${container.id}-stop`}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20"
                  onClick={() => handleAction(container, 'restart')}
                  disabled={actionLoading === `${container.id}-restart`}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white/5 hover:bg-white/10 text-white border-white/20"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-white/20 text-white">
                    <DropdownMenuLabel>Container Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    <DropdownMenuItem 
                      className="text-white/90 hover:bg-white/10"
                      onClick={() => handleAction(container, 'snapshot', { name: `snapshot-${Date.now()}` })}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Create Snapshot
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="text-white/90 hover:bg-white/10"
                      onClick={() => {
                        setSelectedContainer(container);
                        setNewTier(container.tier);
                        setShowScaleModal(true);
                      }}
                    >
                      <Scale className="w-4 h-4 mr-2" />
                      Scale Resources
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="text-white/90 hover:bg-white/10"
                      onClick={() => window.open(`/containers/${container.id}/logs`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Logs
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    <DropdownMenuItem 
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        setSelectedContainer(container);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Container
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Resource Usage Bar (if metrics available) */}
            {container.metrics && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>CPU</span>
                    <span>{container.metrics.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${container.metrics.cpu_usage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Memory</span>
                    <span>{container.metrics.memory_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${container.metrics.memory_usage}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Disk</span>
                    <span>{container.metrics.disk_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-violet-400 to-purple-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${container.metrics.disk_usage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Scale Modal */}
      <Dialog open={showScaleModal} onOpenChange={setShowScaleModal}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Scale Container Resources</DialogTitle>
            <DialogDescription className="text-white/70">
              Change the resource tier for {selectedContainer?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Select Resource Tier</label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="small">Small - {getTierSpecs('small')}</SelectItem>
                  <SelectItem value="medium">Medium - {getTierSpecs('medium')}</SelectItem>
                  <SelectItem value="large">Large - {getTierSpecs('large')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-300 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium">Container will be restarted</p>
                  <p className="text-xs text-amber-200/70 mt-1">
                    Scaling requires a container restart. Any unsaved data may be lost.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowScaleModal(false)} className="text-white/70">
              Cancel
            </Button>
            <Button 
              onClick={handleScale}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
              disabled={newTier === selectedContainer?.tier}
            >
              Scale Container
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Delete Container</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete {selectedContainer?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-300 mt-0.5" />
              <div className="text-sm text-red-200">
                <p className="font-medium">This action cannot be undone</p>
                <p className="text-xs text-red-200/70 mt-1">
                  All data associated with this container will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="text-white/70">
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={actionLoading === `${selectedContainer?.id}-delete`}
            >
              Delete Container
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}