import { motion } from "framer-motion";
import { X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrowserTabProps {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  favicon?: string;
}

export const BrowserTab = ({
  id,
  title,
  url,
  isActive,
  onActivate,
  onClose,
  favicon
}: BrowserTabProps) => {
  const displayTitle = title || new URL(url).hostname;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 min-w-[200px] max-w-[250px] cursor-pointer",
        "bg-white/5 backdrop-blur-sm border border-white/10 rounded-t-lg",
        "hover:bg-white/10 transition-all duration-200",
        isActive && "bg-white/15 border-white/20"
      )}
      onClick={onActivate}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {favicon ? (
          <img 
            src={favicon} 
            alt="" 
            className="w-4 h-4 rounded-sm"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              const next = target.nextElementSibling as HTMLElement;
              target.style.display = 'none';
              if (next) next.style.display = 'block';
            }}
          />
        ) : null}
        <Globe className={cn("w-4 h-4 text-white/60", favicon && "hidden")} />
        <span className="text-white text-sm truncate font-medium">
          {displayTitle}
        </span>
      </div>
      
      <motion.button
        className="p-1 hover:bg-white/20 rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-3 h-3 text-white/60" />
      </motion.button>
    </motion.div>
  );
};