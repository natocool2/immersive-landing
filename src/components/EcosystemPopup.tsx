import { X, Building2, Package, Users, Calendar, FolderKanban, UserCheck } from "lucide-react";
import { useEffect } from "react";

interface EcosystemPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ecosystemApps = [
  {
    id: 1,
    name: "EasyNet Pro",
    description: "Enterprise platform for container management and cloud infrastructure",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    url: "https://easynetpro.com",
    status: "active"
  },
  {
    id: 2,
    name: "ERP",
    description: "Enterprise Resource Planning with Odoo 18 for complete business management",
    icon: Package,
    color: "from-purple-500 to-purple-600",
    url: "https://erp.easynetpro.com",
    status: "active"
  },
  {
    id: 3,
    name: "Collaboration Platform",
    description: "AFFiNE-powered workspace for team collaboration and document management",
    icon: Users,
    color: "from-green-500 to-green-600",
    url: "https://affine.easynetpro.com",
    status: "maintenance"
  },
  {
    id: 4,
    name: "Event Management",
    description: "Hi.Events platform for organizing and managing events seamlessly",
    icon: Calendar,
    color: "from-orange-500 to-orange-600",
    url: "https://eventener.com",
    status: "active"
  },
  {
    id: 5,
    name: "Project Management",
    description: "Plane-powered solution for agile project tracking and team coordination",
    icon: FolderKanban,
    color: "from-indigo-500 to-indigo-600",
    url: "https://plane.easynetpro.com",
    status: "active"
  },
  {
    id: 6,
    name: "CRM",
    description: "Twenty CRM for customer relationship management and sales automation",
    icon: UserCheck,
    color: "from-pink-500 to-pink-600",
    url: "https://crm.easynetpro.com",
    status: "coming-soon"
  }
];

const EcosystemPopup = ({ isOpen, onClose }: EcosystemPopupProps) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCardClick = (url: string, status: string) => {
    if (status === "active") {
      window.open(url, "_blank");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Popup Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden pointer-events-auto transform transition-all duration-300 scale-100 opacity-100 border border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div>
              <h2 className="text-2xl font-bold text-white">EasyNet Pro Ecosystem</h2>
              <p className="text-gray-400 text-sm mt-1">Integrated enterprise solutions for your business</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>

          {/* Apps Grid */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ecosystemApps.map((app) => {
                const Icon = app.icon;
                const isDisabled = app.status !== "active";
                
                return (
                  <div
                    key={app.id}
                    onClick={() => handleCardClick(app.url, app.status)}
                    className={`
                      relative group rounded-xl p-6 transition-all duration-300 border
                      ${isDisabled 
                        ? "bg-gray-800/50 border-gray-700/50 cursor-not-allowed opacity-60" 
                        : "bg-gray-800/80 border-gray-700 hover:border-gray-600 hover:bg-gray-800 cursor-pointer hover:scale-[1.02] hover:shadow-xl"
                      }
                    `}
                  >
                    {/* Status Badge */}
                    {app.status === "maintenance" && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Maintenance
                      </div>
                    )}
                    {app.status === "coming-soon" && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                        Coming Soon
                      </div>
                    )}

                    {/* Icon with gradient background */}
                    <div className={`
                      w-12 h-12 rounded-lg bg-gradient-to-br ${app.color} 
                      flex items-center justify-center mb-4 
                      ${!isDisabled && "group-hover:scale-110"} 
                      transition-transform duration-300
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {app.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {app.description}
                    </p>

                    {/* Hover indicator */}
                    {!isDisabled && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${app.color}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Access all integrated applications from one unified platform
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EcosystemPopup;