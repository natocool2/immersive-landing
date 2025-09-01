import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Server, ChevronRight, ChevronLeft, Key, Settings, 
  CheckCircle2, Loader2, Package2, Cpu, HardDrive, Network
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { containerApi } from "@/services/containerApi";

interface CreateContainerWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateContainerWizard({ open, onClose, onSuccess }: CreateContainerWizardProps) {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    tier: 'small',
    template_id: '',
    ssh_keys: '',
    environment: '',
    startup_script: ''
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      tier: 'small',
      template_id: '',
      ssh_keys: '',
      environment: '',
      startup_script: ''
    });
  };

  const handleCreate = async () => {
    setCreating(true);
    
    try {
      // Parse SSH keys (one per line)
      const sshKeys = formData.ssh_keys
        .split('\n')
        .map(key => key.trim())
        .filter(Boolean);
      
      // Parse environment variables
      const environment: Record<string, string> = {};
      if (formData.environment) {
        formData.environment.split('\n').forEach(line => {
          const [key, value] = line.split('=');
          if (key && value) {
            environment[key.trim()] = value.trim();
          }
        });
      }
      
      const response = await containerApi.create({
        name: formData.name,
        tier: formData.tier as 'small' | 'medium' | 'large',
        template_id: formData.template_id || undefined,
        ssh_keys: sshKeys.length > 0 ? sshKeys : undefined,
        environment: Object.keys(environment).length > 0 ? environment : undefined,
        startup_script: formData.startup_script || undefined
      });
      
      if (response.success) {
        toast({
          title: "Success!",
          description: "Container created successfully",
        });
        
        // Show SSH command
        if (response.container.ssh_command) {
          toast({
            title: "SSH Access Ready",
            description: (
              <div className="mt-2">
                <code className="block bg-black/20 p-2 rounded text-xs">
                  {response.container.ssh_command}
                </code>
                <p className="mt-2 text-xs">Use this command to connect via SSH</p>
              </div>
            ),
            duration: 10000,
          });
        }
        
        onSuccess();
        resetForm();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create container",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const getTierSpecs = (tier: string) => {
    switch (tier) {
      case 'small':
        return { cpu: 1, memory: '1GB', disk: '10GB', price: '$5/mo' };
      case 'medium':
        return { cpu: 1, memory: '2GB', disk: '50GB', price: '$10/mo' };
      case 'large':
        return { cpu: 2, memory: '4GB', disk: '100GB', price: '$20/mo' };
      default:
        return { cpu: 1, memory: '1GB', disk: '10GB', price: '$5/mo' };
    }
  };

  const currentTierSpecs = getTierSpecs(formData.tier);

  const templates = [
    { id: '', name: 'Ubuntu 24.04 (Default)', icon: '🐧' },
    { id: 'nodejs-18', name: 'Node.js 18 LTS', icon: '🟢' },
    { id: 'python-3.11', name: 'Python 3.11', icon: '🐍' },
    { id: 'go-1.21', name: 'Go 1.21', icon: '🐹' },
    { id: 'rust-latest', name: 'Rust Latest', icon: '🦀' },
    { id: 'docker', name: 'Docker CE', icon: '🐳' },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-300" />
            Create New Container
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Configure your new LXD container in 3 simple steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium
                ${step >= s 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' 
                  : 'bg-white/10 text-white/50'
                }
              `}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-blue-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="name" className="text-white/80 mb-2 block">
                    Container Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="my-app"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">
                    Select Template
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setFormData({ ...formData, template_id: template.id })}
                        className={`
                          p-3 rounded-lg border transition-all text-left
                          ${formData.template_id === template.id
                            ? 'bg-blue-500/20 border-blue-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{template.icon}</span>
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label className="text-white/80 mb-2 block">
                    Resource Tier
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {['small', 'medium', 'large'].map((tier) => {
                      const specs = getTierSpecs(tier);
                      return (
                        <button
                          key={tier}
                          onClick={() => setFormData({ ...formData, tier })}
                          className={`
                            p-4 rounded-lg border transition-all text-left
                            ${formData.tier === tier
                              ? 'bg-blue-500/20 border-blue-500/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-white font-medium capitalize">{tier}</span>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {specs.price}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-white/60">
                                <span className="flex items-center gap-1">
                                  <Cpu className="w-3 h-3" />
                                  {specs.cpu} CPU
                                </span>
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {specs.memory} RAM
                                </span>
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {specs.disk} Disk
                                </span>
                              </div>
                            </div>
                            {formData.tier === tier && (
                              <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="ssh-keys" className="text-white/80 mb-2 block">
                    SSH Public Keys (Optional)
                  </Label>
                  <Textarea
                    id="ssh-keys"
                    placeholder="ssh-rsa AAAAB3NzaC1... user@host
ssh-ed25519 AAAAC3NzaC1... user@host"
                    value={formData.ssh_keys}
                    onChange={(e) => setFormData({ ...formData, ssh_keys: e.target.value })}
                    className="bg-white/10 border-white/20 text-white h-24 font-mono text-xs"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Add one SSH key per line for access to your container
                  </p>
                </div>

                <div>
                  <Label htmlFor="env-vars" className="text-white/80 mb-2 block">
                    Environment Variables (Optional)
                  </Label>
                  <Textarea
                    id="env-vars"
                    placeholder="NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://..."
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    className="bg-white/10 border-white/20 text-white h-20 font-mono text-xs"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    KEY=value format, one per line
                  </p>
                </div>

                <div>
                  <Label htmlFor="startup" className="text-white/80 mb-2 block">
                    Startup Script (Optional)
                  </Label>
                  <Textarea
                    id="startup"
                    placeholder="#!/bin/bash
# Install dependencies
apt-get update && apt-get install -y nginx

# Start services
systemctl start nginx"
                    value={formData.startup_script}
                    onChange={(e) => setFormData({ ...formData, startup_script: e.target.value })}
                    className="bg-white/10 border-white/20 text-white h-24 font-mono text-xs"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Bash script to run on container startup
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Summary (shown on last step) */}
        {step === 3 && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-4">
            <h4 className="text-sm font-medium text-white mb-2">Configuration Summary</h4>
            <div className="space-y-1 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="text-white">{formData.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span>Template:</span>
                <span className="text-white">
                  {templates.find(t => t.id === formData.template_id)?.name || 'Ubuntu 24.04'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Resources:</span>
                <span className="text-white">
                  {currentTierSpecs.cpu} CPU, {currentTierSpecs.memory} RAM, {currentTierSpecs.disk} Disk
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Cost:</span>
                <span className="text-white font-medium">{currentTierSpecs.price}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 1) {
                resetForm();
                onClose();
              } else {
                setStep(step - 1);
              }
            }}
            className="text-white/70"
            disabled={creating}
          >
            {step === 1 ? 'Cancel' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
              disabled={step === 1 && !formData.name}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
              disabled={!formData.name || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Container
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}