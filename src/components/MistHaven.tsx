import { ScrollArea } from "@/components/ui/scroll-area";
import { Trees, Flame, Moon, WifiOff, Star, MapPin, Calendar, CalendarClock, Users, Dog, Check, ShieldCheck, Leaf, ArrowRight, ChevronDown, Pencil, Menu } from "lucide-react";

export function MistHaven() {
  return (
    <div className="h-full w-full text-slate-950 bg-slate-950">
      {/* Background Image */}
      <div 
        className="fixed top-0 w-full h-screen bg-cover bg-center -z-10" 
        style={{
          backgroundImage: "url('https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/91b76de7-6349-4826-be85-69a179ee18b6_3840w.jpg')"
        }}
      />
      
      <ScrollArea className="h-full">
        <div className="max-w-7xl sm:px-6 lg:px-8 lg:py-10 mr-auto ml-auto pt-6 pr-4 pb-6 pl-4">
          <div className="sm:p-6 lg:p-8 shadow-[0_10px_60px_-15px_rgba(0,0,0,0.6)] bg-white/5 border-white/15 border rounded-3xl pt-4 pr-4 pb-4 pl-4 backdrop-blur-xl">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-300/30">
                  <Trees className="h-5 w-5 text-emerald-300" />
                </span>
                <span className="text-xl md:text-2xl text-white font-geist font-medium tracking-tighter">MistHaven</span>
              </div>

              <nav className="hidden md:flex items-center gap-8 text-sm text-slate-200/90">
                <a href="#" className="hover:text-white transition font-geist">Stays</a>
                <a href="#" className="hover:text-white transition font-geist">Cabins</a>
                <a href="#" className="hover:text-white transition font-geist">Experiences</a>
                <a href="#" className="hover:text-white transition font-geist">Contact</a>
              </nav>

              <div className="flex items-center gap-2">
                <button className="hidden sm:inline-flex gap-2 hover:bg-white transition font-medium text-slate-900 font-geist bg-white/90 rounded-full pt-2 pr-4 pb-2 pl-4 items-center">
                  <Calendar className="h-4 w-4" />
                  Reserve
                </button>
                <button className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 hover:bg-white/15 transition">
                  <Menu className="h-5 w-5 text-white" />
                </button>
              </div>
            </header>

            {/* Hero */}
            <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
              {/* Left: Copy */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="max-w-2xl lg:max-w-3xl">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight leading-[0.95]">
                    <span className="block text-white font-geist font-medium tracking-tighter">Where Silence</span>
                    <span className="block text-white/70 font-geist font-medium tracking-tighter">Meets</span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 font-geist font-medium tracking-tighter">The Pines</span>
                  </h1>

                  <p className="mt-6 text-base sm:text-lg text-slate-200/90 font-geist">
                    Handpicked retreats tucked between evergreens and alpine lakes. Unplug, warm up by the fire, and rediscover the simple things.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 ring-1 ring-white/15">
                      <Star className="h-4 w-4 text-amber-300" fill="currentColor" />
                      <span className="text-white font-medium font-geist">4.8</span>
                      <span className="text-slate-300/80 font-geist">from 2,400+ stays</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 ring-1 ring-white/15">
                      <MapPin className="h-4 w-4 text-emerald-300" />
                      <span className="text-slate-100 font-geist">Cascades, PNW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Booking Card */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="relative sm:p-6 lg:p-7 ring-1 ring-white/10 bg-slate-900/70 rounded-3xl pt-5 pr-5 pb-5 pl-5 backdrop-blur-xl">
                  <button className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition">
                    <Pencil className="h-4.5 w-4.5 text-slate-200" />
                  </button>

                  <h3 className="text-xl sm:text-2xl text-white font-geist font-medium tracking-tighter">Silverpine Ridge Cabin</h3>
                  <p className="mt-1 text-sm text-slate-300/80 font-geist">2 bedrooms • Wood stove • Riverside deck</p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium font-geist">
                        <Calendar className="h-4 w-4 text-slate-200" />
                        Check-in
                      </label>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-white font-medium font-geist">Apr 14</span>
                        <ChevronDown className="h-4 w-4 text-slate-300/80" />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400/80 font-geist">After 2:00 PM</p>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium font-geist">
                        <CalendarClock className="h-4 w-4 text-slate-200" />
                        Check-out
                      </label>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-white font-medium font-geist">Apr 18</span>
                        <ChevronDown className="h-4 w-4 text-slate-300/80" />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400/80 font-geist">Until 11:00 AM</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium font-geist">
                        <Users className="h-4 w-4 text-slate-200" />
                        Guests
                      </label>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-white font-medium font-geist">2–5 people</span>
                        <ChevronDown className="h-4 w-4 text-slate-300/80" />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <label className="flex items-center gap-2 text-slate-300/80 text-xs font-medium font-geist">
                        <Dog className="h-4 w-4 text-slate-200" />
                        Pet-friendly
                      </label>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-white font-medium font-geist">Yes</span>
                        <Check className="h-4 w-4 text-emerald-300" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <div className="text-2xl text-white font-geist font-medium tracking-tighter">
                        $329
                        <span className="text-base font-medium text-slate-300 font-geist"> / night</span>
                      </div>
                      <div className="text-xs text-slate-400/80 font-geist">Taxes and fees not included</div>
                    </div>
                    <button className="inline-flex gap-2 hover:bg-white/90 transition font-medium text-slate-900 font-geist bg-white rounded-full pt-2.5 pr-5 pb-2.5 pl-5 items-center">
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
                <span className="font-geist">No service fees on direct bookings</span>
              </div>
              <span className="hidden sm:inline text-slate-500 font-geist">•</span>
              <div className="inline-flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-300" />
                <span className="font-geist">Carbon-neutral stays</span>
              </div>
            </div>

            {/* Features Section */}
            <section className="mt-16 lg:mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                {/* Feature 1 */}
                <div className="relative group rounded-3xl bg-white/5 p-7 lg:p-8 ring-1 ring-white/15 backdrop-blur-sm overflow-hidden min-h-[360px]">
                  <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 ring-1 ring-emerald-300/30">
                      <img 
                        src="https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/a66a6053-081d-461e-b7bf-f325b92ef575_800w.jpg" 
                        alt="Wood-fired stove" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                      <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm font-geist">
                        <Flame className="h-3.5 w-3.5" />
                        Wood • Warmth
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-white font-geist mb-2">Wood-Fired Comfort</h3>
                    <p className="text-sm text-slate-300/90 font-geist">Cozy up by the crackling wood stove with locally sourced timber. Perfect for chilly mountain evenings.</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15 font-geist">
                        <Trees className="h-3.5 w-3.5 text-emerald-300" />
                        Local timber
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15 font-geist">
                        <Leaf className="h-3.5 w-3.5 text-emerald-300" />
                        Eco heating
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="relative group lg:p-8 ring-1 ring-white/15 overflow-hidden bg-white/5 rounded-3xl pt-7 pr-7 pb-7 pl-7 backdrop-blur-sm min-h-[360px]">
                  <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-blue-300/20 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 ring-1 ring-blue-300/30">
                      <img 
                        src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/81f80b03-8c4a-4b12-80cc-ef4dfb260072_800w.jpg" 
                        alt="Stargazing deck" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                      <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm font-geist">
                        <Moon className="h-3.5 w-3.5" />
                        Night sky
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-white font-geist mb-2">Stargazing Deck</h3>
                    <p className="text-sm text-slate-300/90 font-geist">Private riverside deck with zero light pollution. Watch the Milky Way unfold above ancient pines.</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15 font-geist">
                        <Star className="h-3.5 w-3.5 text-blue-300" fill="currentColor" />
                        Zero light pollution
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15 font-geist">
                        <MapPin className="h-3.5 w-3.5 text-blue-300" />
                        Riverside deck
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="relative group lg:p-8 ring-1 ring-white/15 overflow-hidden bg-white/5 rounded-3xl pt-7 pr-7 pb-7 pl-7 backdrop-blur-sm min-h-[360px]">
                  <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-amber-300/20 blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 ring-1 ring-amber-300/30">
                      <img 
                        src="https://hoirqrkdgbmvpwutwuwj-all.supabase.co/storage/v1/object/public/assets/assets/a7eacbd6-2566-476b-9e41-eebb713e56c1_800w.jpg" 
                        alt="Digital detox cabin interior" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                      <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm font-geist">
                        <WifiOff className="h-3.5 w-3.5" />
                        Offline
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-white font-geist mb-2">Digital Detox</h3>
                    <p className="text-sm text-slate-300/90 font-geist">Intentionally limited connectivity. Rediscover analog pleasures with books, games, and real conversations.</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15 font-geist">
                        <WifiOff className="h-3.5 w-3.5 text-amber-300" />
                        Library corner
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-white/15 font-geist">
                        <Leaf className="h-3.5 w-3.5 text-amber-300" />
                        Slow mornings
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery footer */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-300/80 font-geist">
                  <span className="font-medium text-white">24 photos</span> • Last updated March 2024
                </p>
                <button className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white text-sm font-medium hover:bg-white/15 transition ring-1 ring-white/15 font-geist">
                  View all photos
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}