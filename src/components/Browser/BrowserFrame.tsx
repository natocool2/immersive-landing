import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, ArrowLeft, ArrowRight, Home, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  url: string;
  onUrlChange: (url: string) => void;
  onTitleChange: (title: string) => void;
  isActive: boolean;
}

export const BrowserFrame = ({ 
  url, 
  onUrlChange, 
  onTitleChange, 
  isActive 
}: BrowserFrameProps) => {
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isSecure = url.startsWith('https://');

  const handleNavigate = (newUrl: string) => {
    try {
      // Ensure URL has protocol
      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        newUrl = 'https://' + newUrl;
      }
      
      setIsLoading(true);
      onUrlChange(newUrl);
      setInputUrl(newUrl);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate(inputUrl);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleGoBack = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const handleGoForward = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc?.title) {
          onTitleChange(iframeDoc.title);
        }
      } catch (error) {
        // Cross-origin restrictions
        console.log('Cannot access iframe content due to CORS');
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [onTitleChange]);

  return (
    <motion.div
      className={cn(
        "flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-lg border border-white/10",
        !isActive && "hidden"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Browser Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-white/10">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            className={cn(
              "p-2 rounded-lg transition-colors",
              canGoBack 
                ? "hover:bg-white/10 text-white" 
                : "text-white/30 cursor-not-allowed"
            )}
            onClick={handleGoBack}
            disabled={!canGoBack}
            whileHover={canGoBack ? { scale: 1.05 } : {}}
            whileTap={canGoBack ? { scale: 0.95 } : {}}
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className={cn(
              "p-2 rounded-lg transition-colors",
              canGoForward 
                ? "hover:bg-white/10 text-white" 
                : "text-white/30 cursor-not-allowed"
            )}
            onClick={handleGoForward}
            disabled={!canGoForward}
            whileHover={canGoForward ? { scale: 1.05 } : {}}
            whileTap={canGoForward ? { scale: 0.95 } : {}}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </motion.button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
          {isSecure ? (
            <Lock className="w-4 h-4 text-green-400" />
          ) : (
            <Unlock className="w-4 h-4 text-yellow-400" />
          )}
          
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm"
            placeholder="Digite uma URL..."
          />
        </div>

        {/* Home Button */}
        <motion.button
          className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          onClick={() => handleNavigate('https://google.com')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Content Frame */}
      <div className="flex-1 relative overflow-hidden rounded-b-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <motion.div
              className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0 rounded-b-lg"
          title="Browser Content"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </motion.div>
  );
};