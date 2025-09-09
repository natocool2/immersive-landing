import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, MapPin, Clock, Users, Filter, Search, Grid, List, ChevronLeft, ChevronRight, X, Tag, DollarSign, Globe, Building2, Trees, Star, Flame, Moon, WifiOff, ArrowRight, ChevronDown, Sparkles, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay, addDays } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import { motion } from "framer-motion";

// ============= TYPES =============

interface EventLocation {
  venue?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  is_online?: boolean;
}

interface EventOrganizer {
  id: number;
  name: string;
  email?: string;
  logo_url?: string;
  website?: string;
  description?: string;
}

interface EventPricing {
  currency?: string;
  min_price?: number;
  max_price?: number;
  is_free?: boolean;
}

interface Event {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  short_description?: string;
  start_date: string;
  end_date?: string;
  status?: string;
  location: EventLocation;
  cover_image_url?: string;
  organizer: EventOrganizer;
  pricing?: EventPricing;
  tickets?: any[];
  attendee_count: number;
  tickets_available?: number;
  category?: string;
  tags: string[];
  is_featured?: boolean;
  url?: string;
}

interface EventFilters {
  search?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  location?: string;
  is_online?: boolean;
  price_min?: number;
  price_max?: number;
  sort?: string;
}

// ============= CONSTANTS =============

const SORT_OPTIONS = [
  { value: "date", label: "Date (Upcoming)" },
  { value: "popularity", label: "Most Popular" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Recently Added" }
];

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This Weekend" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" }
];

// ============= COMPONENTS =============

const EventCard = ({ event, onQuickView }: { event: Event; onQuickView: (event: Event) => void }) => {
  const locationText = event.location?.is_online 
    ? "Online Event" 
    : event.location?.city || event.location?.venue || "TBA";

  const formatPrice = () => {
    if (!event.pricing) return "Price TBD";
    if (event.pricing.is_free) return "FREE";
    const currency = event.pricing.currency === "USD" ? "$" : event.pricing.currency || "$";
    if (event.pricing.min_price === event.pricing.max_price) {
      return `${currency}${event.pricing.min_price || 0}`;
    }
    if (event.pricing.min_price !== undefined && event.pricing.max_price !== undefined) {
      return `${currency}${event.pricing.min_price} - ${currency}${event.pricing.max_price}`;
    }
    return "Price TBD";
  };

  const formatDate = () => {
    try {
      const date = parseISO(event.start_date);
      const hasEndDate = event.end_date && event.end_date !== event.start_date;
      
      if (hasEndDate) {
        const endDate = parseISO(event.end_date!);
        if (format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
          return `${format(date, 'MMM d, yyyy')} • ${format(date, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
        }
        return `${format(date, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      }
      return format(date, 'PPp');
    } catch (error) {
      return event.start_date;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div 
        onClick={() => onQuickView(event)} 
        className="relative bg-white/5 rounded-3xl p-1 ring-1 ring-white/10 backdrop-blur-xl shadow-lg hover:bg-white/10 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Gradient overlay effect */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-300/10 blur-3xl group-hover:bg-purple-300/20 transition-all duration-500"></div>
        
        {/* Image */}
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-indigo-600/20">
          {event.cover_image_url ? (
            <img 
              src={event.cover_image_url} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-16 h-16 text-white/30" />
            </div>
          )}
          
          {/* Price Badge */}
          {event.pricing && (
            <div className="absolute top-3 right-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm">
                {formatPrice()}
              </div>
            </div>
          )}

          {/* Category Badge */}
          {event.category && (
            <div className="absolute top-3 left-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white ring-1 ring-white/20 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {event.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Title & Organizer */}
          <div className="mb-3">
            <h3 className="text-lg font-medium text-white mb-1 tracking-tight line-clamp-2 group-hover:text-purple-300 transition-colors">
              {event.title}
            </h3>
            {event.organizer && (
              <div className="flex items-center gap-2 text-sm text-slate-300/80">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{event.organizer.name}</span>
              </div>
            )}
          </div>

          {/* Date & Location */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-200/90">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              <span>{formatDate()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-200/90">
              {event.location?.is_online ? (
                <Globe className="w-3.5 h-3.5 text-purple-300" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-purple-300" />
              )}
              <span className="truncate">{locationText}</span>
            </div>
          </div>

          {/* Stats */}
          {(event.attendee_count > 0 || event.tickets_available) && (
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              {event.attendee_count > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300/80">
                  <Users className="w-3.5 h-3.5" />
                  <span>{event.attendee_count} attending</span>
                </div>
              )}
              {event.tickets_available !== null && event.tickets_available > 0 && (
                <span className="text-xs text-emerald-300 font-medium">
                  {event.tickets_available} tickets left
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FilterSidebar = ({ 
  filters, 
  categories, 
  onFilterChange, 
  onReset,
  className 
}: {
  filters: EventFilters;
  categories: Array<{ value: string; count: number }>;
  onFilterChange: (key: keyof EventFilters, value: any) => void;
  onReset: () => void;
  className?: string;
}) => {
  const [priceRange, setPriceRange] = useState([0, 500]);

  return (
    <div className={cn("bg-white/5 rounded-3xl p-6 ring-1 ring-white/10 backdrop-blur-xl", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white tracking-tight">Filters</h3>
        <button 
          onClick={onReset}
          className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
        >
          Reset all
        </button>
      </div>
      
      {/* Date Presets */}
      <div className="space-y-3 mb-6">
        <Label className="text-sm text-slate-200">When</Label>
        <RadioGroup 
          value={filters.date_from || ""} 
          onValueChange={(value) => {
            const now = new Date();
            let from: Date | null = null;
            let to: Date | null = null;

            switch (value) {
              case "today":
                from = startOfDay(now);
                to = endOfDay(now);
                break;
              case "tomorrow":
                from = startOfDay(addDays(now, 1));
                to = endOfDay(addDays(now, 1));
                break;
              case "weekend":
                const daysUntilSaturday = (6 - now.getDay()) % 7;
                from = startOfDay(addDays(now, daysUntilSaturday));
                to = endOfDay(addDays(from, 1));
                break;
              case "week":
                from = now;
                to = addDays(now, 7);
                break;
              case "month":
                from = now;
                to = addDays(now, 30);
                break;
            }

            if (from && to) {
              onFilterChange("date_from", from.toISOString());
              onFilterChange("date_to", to.toISOString());
            }
          }}
        >
          {DATE_PRESETS.map((preset) => (
            <div key={preset.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={preset.value} 
                id={preset.value}
                className="border-white/20 text-purple-300" 
              />
              <Label 
                htmlFor={preset.value} 
                className="font-normal cursor-pointer text-sm text-slate-200/90 hover:text-white transition-colors"
              >
                {preset.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3 mb-6">
          <Label className="text-sm text-slate-200">Category</Label>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={cat.value}
                  checked={filters.category === cat.value}
                  onCheckedChange={(checked) => 
                    onFilterChange("category", checked ? cat.value : undefined)
                  }
                  className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <Label 
                  htmlFor={cat.value} 
                  className="text-sm font-normal cursor-pointer flex-1 flex justify-between text-slate-200/90 hover:text-white transition-colors"
                >
                  <span className="capitalize">{cat.value}</span>
                  <span className="text-slate-400">({cat.count})</span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Type */}
      <div className="space-y-3 mb-6">
        <Label className="text-sm text-slate-200">Event Type</Label>
        <RadioGroup 
          value={filters.is_online?.toString() || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              onFilterChange("is_online", undefined);
            } else {
              onFilterChange("is_online", value === "true");
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all-events" className="border-white/20 text-purple-300" />
            <Label htmlFor="all-events" className="font-normal cursor-pointer text-sm text-slate-200/90">
              All Events
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="online-only" className="border-white/20 text-purple-300" />
            <Label htmlFor="online-only" className="font-normal cursor-pointer text-sm text-slate-200/90">
              Online Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="in-person" className="border-white/20 text-purple-300" />
            <Label htmlFor="in-person" className="font-normal cursor-pointer text-sm text-slate-200/90">
              In-Person Only
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm text-slate-200">Price Range</Label>
        <div className="px-2">
          <Slider 
            value={priceRange}
            onValueChange={setPriceRange}
            max={500}
            step={10}
            className="[&_[role=slider]]:bg-purple-500"
          />
          <div className="flex justify-between mt-2 text-xs text-slate-300">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-3">
          <Checkbox 
            id="free-only"
            className="border-white/20 data-[state=checked]:bg-purple-500"
          />
          <Label htmlFor="free-only" className="text-sm font-normal cursor-pointer text-slate-200/90">
            Free Events Only
          </Label>
        </div>
      </div>
    </div>
  );
};

// ============= MAIN COMPONENT =============

const EventsV2 = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({ sort: "date" });
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<Array<{ value: string; count: number }>>([]);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
    has_next: false,
    has_prev: false
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchInput }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch events
  const fetchEvents = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", meta.limit.toString());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });

      // Fetch from real API
      const response = await fetch(`https://api.easynetpro.com/api/v1/public/events?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Set events from API response (API returns {events: [...], total: n, ...})
      setEvents(data.events || []);
      
      // Set metadata from API response
      setMeta({
        total: data.total || 0,
        page: data.page || page,
        limit: data.per_page || meta.limit,
        pages: data.total_pages || 0,
        has_next: data.page < data.total_pages,
        has_prev: data.page > 1
      });
      
      // Set categories from API response
      if (data.categories) {
        setCategories(data.categories);
      }

    } catch (err) {
      setError("Failed to load events. Please try again.");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, meta.limit]);

  // Initial load
  useEffect(() => {
    fetchEvents(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setMeta(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({ sort: "date" });
    setSearchInput("");
    setMeta(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setMeta(prev => ({ ...prev, page: newPage }));
    fetchEvents(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle quick view
  const handleQuickView = (event: Event) => {
    setSelectedEvent(event);
    setQuickViewOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-animated animate-gradient" />
      
      {/* Dark overlay for better contrast */}
      <div className="fixed inset-0 bg-black/40" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 bg-white/10 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Parallax background elements */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      >
        <div className="absolute top-20 left-20 h-64 w-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="h-4 w-4 text-purple-300" />
              <span className="text-sm text-white">Discover Amazing Experiences</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight"
            >
              <span className="block text-white font-medium tracking-tighter">Where Moments</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300 font-medium tracking-tighter">
                Become Memories
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-slate-200/90 max-w-2xl mx-auto"
            >
              Handpicked events and experiences. From intimate gatherings to grand celebrations, find your perfect moment.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 max-w-2xl mx-auto"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, venues, or organizers..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl text-white placeholder-slate-300/60 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 ring-1 ring-white/15">
                <Calendar className="h-4 w-4 text-purple-300" />
                <span className="text-white font-medium">{meta.total}</span>
                <span className="text-slate-300/80">events available</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 ring-1 ring-white/15">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <span className="text-slate-200">Multiple Locations</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-4">
                  <FilterSidebar
                    filters={filters}
                    categories={categories}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                  />
                </div>
              </aside>

              {/* Events Grid */}
              <div className="lg:col-span-3">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-slate-200/90">
                    {loading ? "Loading..." : `${meta.total} events found`}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                      <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center rounded-lg bg-white/10 p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                          "p-2 rounded transition-colors",
                          viewMode === "grid" ? "bg-white/20 text-white" : "text-slate-300 hover:text-white"
                        )}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                          "p-2 rounded transition-colors",
                          viewMode === "list" ? "bg-white/20 text-white" : "text-slate-300 hover:text-white"
                        )}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events Grid/List */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-white/5 rounded-3xl p-1 ring-1 ring-white/10 backdrop-blur-xl">
                        <Skeleton className="h-48 rounded-2xl bg-white/10" />
                        <div className="p-5 space-y-3">
                          <Skeleton className="h-6 w-3/4 bg-white/10" />
                          <Skeleton className="h-4 w-1/2 bg-white/10" />
                          <Skeleton className="h-4 w-full bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-20">
                    <p className="text-slate-200">{error}</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-20">
                    <Mountain className="w-24 h-24 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No events found</h3>
                    <p className="text-slate-300">Try adjusting your filters or search terms</p>
                    <Button 
                      onClick={handleResetFilters}
                      className="mt-4 bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className={cn(
                    "grid gap-6",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  )}>
                    {events.map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        onQuickView={handleQuickView}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!loading && meta.pages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={!meta.has_prev}
                      className="text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    {[...Array(Math.min(5, meta.pages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === meta.page ? "default" : "ghost"}
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "w-10 h-10",
                            page === meta.page 
                              ? "bg-purple-500 hover:bg-purple-600 text-white" 
                              : "text-white hover:bg-white/10"
                          )}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={!meta.has_next}
                      className="text-white hover:bg-white/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventsV2;