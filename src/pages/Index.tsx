import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiquidGlassDock } from "@/components/LiquidGlassDock";
import { GlassInput } from "@/components/ui/liquid-glass";
import { useAuth } from "@/contexts/EnproAuthContext";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useFullscreen } from "@/hooks/useFullscreen";
import { DeveloperDashboardConnected } from "@/components/DeveloperDashboardConnected";
import { Maximize, Minimize, Trees, Calendar, CalendarClock, Users, Dog, Check, Star, MapPin, ShieldCheck, Leaf, Flame, Moon, WifiOff, Book, Coffee, ArrowRight, Pencil, ChevronDown } from "lucide-react";

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
    title: "MistHaven",
    subtitle: "Quiet Escapes in the Wild",
    buttons: ["Reserve", "Explore"]
  }
];

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeContent, setActiveContent] = useState(0);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleIconClick = (index: number) => {
    setActiveContent(index);
  };
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Remove authentication guard to allow public access to landing page

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
    <div className="relative h-[100vh] w-[100vw] overflow-hidden">
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
      {activeContent === 5 ? (
        // Developer Dashboard for Steam icon
        <div className="relative z-10 h-full w-full overflow-y-auto">
          <div className="w-full pt-[72px] pb-[106px] px-[16px]">
            <DeveloperDashboardConnected />
          </div>
        </div>
      ) : activeContent === 4 ? (
        // MistHaven Content
        <div className="relative z-10 h-full w-full overflow-y-auto">
<<<<<<< HEAD
          <div className="w-full pt-[72px] pb-[106px] px-[16px]">
            <div>
=======
          <div className="w-full pt-[72px] pb-[103px] pr-4 pl-[72px]">
            <div className="w-full p-0">
>>>>>>> aadceb40887da066e08d2b2ce8f3b6bd1fb522ec
              
              {/* Header */}
              <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-300/30">
                    <Trees className="h-5 w-5 text-emerald-300" />
                  </span>
                  <span className="text-xl md:text-2xl text-white font-medium tracking-tighter">MistHaven</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm text-slate-200/90">
                  <a href="#" className="hover:text-white transition">Stays</a>
                  <a href="#" className="hover:text-white transition">Cabins</a>
                  <a href="#" className="hover:text-white transition">Experiences</a>
                  <a href="#" className="hover:text-white transition">Contact</a>
                </nav>

                <div className="flex items-center gap-2">
                  <button className="hidden sm:inline-flex gap-2 hover:bg-white transition font-medium text-slate-900 bg-white/90 rounded-full px-4 py-2 shadow-lg items-center">
                    <Calendar className="h-4 w-4" />
                    Reserve
                  </button>
                </div>
              </header>

              {/* Hero */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
                {/* Left: Copy */}
                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="max-w-2xl lg:max-w-3xl">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[0.95]">
                      <span className="block text-white font-medium tracking-tighter">Where Silence</span>
                      <span className="block text-white/70 font-medium tracking-tighter">Meets</span>
                      <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 font-medium tracking-tighter">The Pines</span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-slate-200/90">
                      Handpicked retreats tucked between evergreens and alpine lakes. Unplug, warm up by the fire, and rediscover the simple things.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 ring-1 ring-white/15">
                        <Star className="h-4 w-4 text-amber-300" />
                        <span className="text-white font-medium">4.8</span>
                        <span className="text-slate-300/80">from 2,400+ stays</span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 ring-1 ring-white/15">
                        <MapPin className="h-4 w-4 text-emerald-300" />
                        <span className="text-slate-100">Cascades, PNW</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Booking Card */}
                <div className="lg:col-span-5 xl:col-span-4">
                  <div className="relative bg-slate-900/70 rounded-3xl p-5 sm:p-6 lg:p-7 ring-1 ring-white/10 backdrop-blur-xl shadow-lg">
                    <button className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition">
                      <Pencil className="h-4.5 w-4.5 text-slate-200" />
                    </button>

                    <h3 className="text-xl sm:text-2xl text-white font-medium tracking-tighter">Silverpine Ridge Cabin</h3>
                    <p className="mt-1 text-sm text-slate-300/80">2 bedrooms • Wood stove • Riverside deck</p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                        <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium">
                          <Calendar className="h-4 w-4 text-slate-200" />
                          Check-in
                        </label>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-white font-medium">Apr 14</span>
                          <ChevronDown className="h-4 w-4 text-slate-300/80" />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400/80">After 2:00 PM</p>
                      </div>

                      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                        <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium">
                          <CalendarClock className="h-4 w-4 text-slate-200" />
                          Check-out
                        </label>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-white font-medium">Apr 18</span>
                          <ChevronDown className="h-4 w-4 text-slate-300/80" />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400/80">Until 11:00 AM</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                        <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium">
                          <Users className="h-4 w-4 text-slate-200" />
                          Guests
                        </label>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-white font-medium">2–5 people</span>
                          <ChevronDown className="h-4 w-4 text-slate-300/80" />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                        <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium">
                          <Dog className="h-4 w-4 text-slate-200" />
                          Pet-friendly
                        </label>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-white font-medium">Yes</span>
                          <Check className="h-4 w-4 text-emerald-300" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <div className="text-2xl text-white font-medium tracking-tighter">$329<span className="text-base font-medium text-slate-300"> / night</span></div>
                        <div className="text-xs text-slate-400/80">Taxes and fees not included</div>
                      </div>
                      <button className="inline-flex gap-2 hover:bg-white/90 transition font-medium text-slate-900 bg-white rounded-full px-5 py-2.5 shadow-lg items-center">
                        Reserve
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer note */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-300/80">
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  <span>No service fees on direct bookings</span>
                </div>
                <span className="hidden sm:inline text-slate-500">•</span>
                <div className="inline-flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-300" />
                  <span>Carbon-neutral stays</span>
                </div>
              </div>

              {/* Features Section */}
              <section className="mt-16 lg:mt-20">
                {/* Features Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                  {/* Feature 1 */}
                  <div className="relative group rounded-3xl bg-white/5 p-7 lg:p-8 ring-1 ring-white/15 backdrop-blur-sm overflow-hidden min-h-[360px]">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-3xl"></div>

                    <div className="relative z-10">
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 ring-1 ring-emerald-300/30">
                        <img src="https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/a66a6053-081d-461e-b7bf-f325b92ef575_800w.jpg" alt="Wood-fired stove" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                        <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm">
                          <Flame className="h-3.5 w-3.5" />
                          Wood • Warmth
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Wood-Fired Comfort</h3>
                      <p className="text-sm text-slate-300/90">Cozy up by the crackling wood stove with locally sourced timber. Perfect for chilly mountain evenings.</p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15">
                          <Trees className="h-3.5 w-3.5 text-emerald-300" />
                          Local timber
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15">
                          <Leaf className="h-3.5 w-3.5 text-emerald-300" />
                          Eco heating
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="relative group rounded-3xl bg-white/5 p-7 lg:p-8 ring-1 ring-white/15 backdrop-blur-sm overflow-hidden min-h-[360px]">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-blue-300/20 blur-3xl"></div>

                    <div className="relative z-10">
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 ring-1 ring-blue-300/30">
                        <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/81f80b03-8c4a-4b12-80cc-ef4dfb260072_800w.jpg" alt="Stargazing deck" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                        <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm">
                          <Moon className="h-3.5 w-3.5" />
                          Night sky
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Stargazing Deck</h3>
                      <p className="text-sm text-slate-300/90">Private riverside deck with zero light pollution. Watch the Milky Way unfold above ancient pines.</p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15">
                          <Star className="h-3.5 w-3.5 text-blue-300" />
                          Zero light pollution
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15">
                          <MapPin className="h-3.5 w-3.5 text-blue-300" />
                          Riverside deck
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="relative group rounded-3xl bg-white/5 p-7 lg:p-8 ring-1 ring-white/15 backdrop-blur-sm overflow-hidden min-h-[360px]">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-amber-300/20 blur-3xl"></div>

                    <div className="relative z-10">
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 ring-1 ring-amber-300/30">
                        <img src="https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/a7eacbd6-2566-476b-9e41-eebb713e56c1_800w.jpg" alt="Digital detox cabin interior" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                        <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm">
                          <WifiOff className="h-3.5 w-3.5" />
                          Offline
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">Digital Detox</h3>
                      <p className="text-sm text-slate-300/90">Intentionally limited connectivity. Rediscover analog pleasures with books, games, and real conversations.</p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15">
                          <Book className="h-3.5 w-3.5 text-amber-300" />
                          Library corner
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15">
                          <Coffee className="h-3.5 w-3.5 text-amber-300" />
                          Slow mornings
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery footer */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-slate-300/80">
                    <span className="font-medium text-white">24 photos</span> • Last updated March 2024
                  </p>
                  <button className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white text-sm font-medium hover:bg-white/15 transition ring-1 ring-white/15">
                    View all photos
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        // Original content for other icons
        <div className="relative z-10 flex items-center justify-center h-full pt-[70px] pb-[106px]">
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
      )}

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
      <LiquidGlassDock onIconClick={handleIconClick} activeIcon={activeContent} />
      
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