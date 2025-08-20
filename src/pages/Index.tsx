import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiquidGlassDock } from "@/components/LiquidGlassDock";
import { GlassInput } from "@/components/ui/liquid-glass";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useFullscreen } from "@/hooks/useFullscreen";
import { Maximize, Minimize } from "lucide-react";

const contentData = [
  {
    title: "Easynet Pro",
    subtitle: "Build anything",
    buttons: ["Explorar", "Saber Mais"]
  },
  {
    title: "Finder",
    subtitle: "Organize your files",
    buttons: ["Browse Files", "Recent Items"]
  },
  {
    title: "ChatGPT",
    subtitle: "AI Assistant",
    buttons: ["Start Chat", "Examples"]
  },
  {
    title: "Maps",
    subtitle: "Navigate anywhere",
    buttons: ["Directions", "Explore"]
  },
  {
    title: "Safari",
    subtitle: "Browse the web",
    buttons: ["New Tab", "Bookmarks"]
  },
  {
    title: "Steam",
    subtitle: "Game library",
    buttons: ["Library", "Store"]
  }
];

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeContent, setActiveContent] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    const handleDoubleClick = () => {
      toggleFullscreen();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("dblclick", handleDoubleClick);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [toggleFullscreen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Fundo gradiente animado */}
      <div className="absolute inset-0 bg-gradient-animated animate-gradient" />
      
      {/* Overlay escuro para melhor contraste */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Efeito parallax com mouse */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            hsla(var(--primary), 0.3) 0%, 
            transparent 50%)`,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* Partículas flutuantes */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{ 
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Conteúdo principal */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.6, 0.01, 0.05, 0.95],
            delay: 0.5 
          }}
          className="text-center text-white px-8 max-w-4xl"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            key={activeContent}
          >
            {contentData[activeContent].title}
          </motion.h1>
          
          <motion.div 
            className="mb-8 w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            key={`input-${activeContent}`}
          >
            <GlassInput placeholder={contentData[activeContent].subtitle} />
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            key={`buttons-${activeContent}`}
          >
            <motion.button
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
              whileHover={{ 
                boxShadow: "0 0 30px hsla(var(--primary), 0.5)",
                scale: 1.05 
              }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: [
                  "0 0 20px hsla(var(--primary), 0.3)",
                  "0 0 40px hsla(var(--primary), 0.6)",
                  "0 0 20px hsla(var(--primary), 0.3)"
                ]
              }}
              transition={{ 
                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {contentData[activeContent].buttons[0]}
            </motion.button>
            
            <motion.button
              className="px-8 py-4 bg-transparent border border-white/30 rounded-full text-white font-medium text-lg hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {contentData[activeContent].buttons[1]}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Elementos decorativos */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-l from-accent/20 to-primary/20 blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      
      {/* Liquid Glass Dock Footer */}
      <LiquidGlassDock onIconClick={setActiveContent} activeIcon={activeContent} />
      
      {/* Botão Fullscreen */}
      <motion.button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isFullscreen ? "Sair do fullscreen" : "Entrar em fullscreen"}
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </motion.button>
    </div>
  );
};

export default Index;