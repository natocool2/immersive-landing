import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, MapPin, Clock, Users, Filter, Search, Grid, List, ChevronLeft, ChevronRight, X, Tag, DollarSign, Globe, Building2 } from "lucide-react";
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

interface EventsResponse {
  data: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    categories: Array<{
      value: string;
      count: number;
    }>;
    applied: Record<string, any>;
  };
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
  { value: "-date", label: "Date (Recent)" },
  { value: "popularity", label: "Most Popular" },
  { value: "price", label: "Price (Low to High)" },
  { value: "-price", label: "Price (High to Low)" },
  { value: "name", label: "Name (A-Z)" },
];

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This Weekend" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const ITEMS_PER_PAGE = [
  { value: "12", label: "12 per page" },
  { value: "24", label: "24 per page" },
  { value: "48", label: "48 per page" },
];

// ============= COMPONENTS =============

const EventCard = ({ event, onQuickView }: { event: Event; onQuickView: (event: Event) => void }) => {
  const formatPrice = () => {
    if (event.pricing.is_free) return "Free";
    const currency = event.pricing.currency === "USD" ? "$" : event.pricing.currency;
    if (event.pricing.min_price === event.pricing.max_price) {
      return `${currency}${event.pricing.min_price}`;
    }
    return `${currency}${event.pricing.min_price} - ${currency}${event.pricing.max_price}`;
  };

  const formatDate = () => {
    try {
      const date = parseISO(event.start_date);
      return format(date, "EEE, MMM d • h:mm a");
    } catch {
      return event.start_date;
    }
  };

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
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden">
      <div onClick={() => onQuickView(event)} className="relative">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-indigo-600 overflow-hidden">
          {event.cover_image_url ? (
            <img 
              src={event.cover_image_url} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-16 h-16 text-white/50" />
            </div>
          )}
          
          {/* Price Badge */}
          {event.pricing && (
            <div className="absolute top-3 right-3">
              <Badge variant={event.pricing.is_free ? "secondary" : "default"} className="shadow-lg">
                {formatPrice()}
              </Badge>
            </div>
          )}

          {/* Category Badge */}
          {event.category && (
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-white/90 backdrop-blur">
                {event.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg group-hover:text-purple-600 transition-colors">
              {event.title}
            </CardTitle>
          </div>
          
          {/* Organizer */}
          {event.organizer && (
            <div className="flex items-center gap-2 mt-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">{event.organizer.name}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span>{formatDate()}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            {event.location?.is_online ? (
              <Globe className="w-4 h-4" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span className="truncate">{locationText}</span>
          </div>

          {/* Description */}
          {event.description && (
            <CardDescription className="line-clamp-2 text-sm">
              {event.description}
            </CardDescription>
          )}
        </CardContent>

        <CardFooter className="pt-0 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {event.attendee_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.attendee_count} attending</span>
                </div>
              )}
              {event.tickets_available !== null && event.tickets_available > 0 && (
                <span className="text-green-600 font-medium">
                  {event.tickets_available} tickets left
                </span>
              )}
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

const EventSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
    <CardFooter>
      <Skeleton className="h-4 w-1/3" />
    </CardFooter>
  </Card>
);

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
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        {/* Date Presets */}
        <div className="space-y-3">
          <Label>When</Label>
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
                <RadioGroupItem value={preset.value} id={preset.value} />
                <Label htmlFor={preset.value} className="font-normal cursor-pointer">
                  {preset.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-3 mt-6">
            <Label>Category</Label>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={cat.value}
                    checked={filters.category === cat.value}
                    onCheckedChange={(checked) => 
                      onFilterChange("category", checked ? cat.value : undefined)
                    }
                  />
                  <Label 
                    htmlFor={cat.value} 
                    className="text-sm font-normal cursor-pointer flex-1 flex justify-between"
                  >
                    <span>{cat.value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="text-gray-400">({cat.count})</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Type */}
        <div className="space-y-3 mt-6">
          <Label>Event Type</Label>
          <RadioGroup 
            value={filters.is_online === true ? "online" : filters.is_online === false ? "offline" : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onFilterChange("is_online", undefined);
              } else {
                onFilterChange("is_online", value === "online");
              }
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all-events" />
              <Label htmlFor="all-events" className="font-normal cursor-pointer">
                All Events
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online-events" />
              <Label htmlFor="online-events" className="font-normal cursor-pointer">
                Online Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="offline" id="offline-events" />
              <Label htmlFor="offline-events" className="font-normal cursor-pointer">
                In-Person Only
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Price Range */}
        <div className="space-y-3 mt-6">
          <Label>Price Range</Label>
          <div className="px-1">
            <Slider
              value={priceRange}
              onValueChange={(value) => {
                setPriceRange(value);
                onFilterChange("price_min", value[0]);
                onFilterChange("price_max", value[1]);
              }}
              min={0}
              max={500}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}+</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="free-events"
              checked={filters.price_max === 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onFilterChange("price_min", 0);
                  onFilterChange("price_max", 0);
                  setPriceRange([0, 0]);
                } else {
                  onFilterChange("price_min", undefined);
                  onFilterChange("price_max", undefined);
                  setPriceRange([0, 500]);
                }
              }}
            />
            <Label htmlFor="free-events" className="font-normal cursor-pointer">
              Free Events Only
            </Label>
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          className="w-full mt-6" 
          onClick={onReset}
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

const EventQuickView = ({ event, isOpen, onClose }: { event: Event | null; isOpen: boolean; onClose: () => void }) => {
  if (!event) return null;

  const formatDate = () => {
    try {
      const start = parseISO(event.start_date);
      const startFormatted = format(start, "EEEE, MMMM d, yyyy • h:mm a");
      
      if (event.end_date) {
        const end = parseISO(event.end_date);
        const endFormatted = format(end, "h:mm a");
        return `${startFormatted} - ${endFormatted}`;
      }
      
      return startFormatted;
    } catch {
      return event.start_date;
    }
  };

  const formatPrice = () => {
    if (event.pricing.is_free) return "Free Event";
    const currency = event.pricing.currency === "USD" ? "$" : event.pricing.currency;
    if (event.pricing.min_price === event.pricing.max_price) {
      return `${currency}${event.pricing.min_price}`;
    }
    return `From ${currency}${event.pricing.min_price}`;
  };

  const locationText = () => {
    if (event.location?.is_online) return "Online Event";
    
    const parts = [
      event.location?.venue,
      event.location?.address,
      event.location?.city,
      event.location?.state,
      event.location?.country
    ].filter(Boolean);
    
    return parts.join(", ") || "Location TBA";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header Image */}
        <div className="relative h-64 -m-6 mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 overflow-hidden">
          {event.cover_image_url ? (
            <img 
              src={event.cover_image_url} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-24 h-24 text-white/30" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Title on image */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-3xl font-bold text-white mb-2">{event.title}</h2>
            <div className="flex items-center gap-4 text-white/90">
              <Badge variant="secondary" className="bg-white/20 backdrop-blur">
                {event.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Event"}
              </Badge>
              <span className="text-lg font-semibold">{formatPrice()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Organizer */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Organized by</p>
              <p className="font-semibold">{event.organizer.name}</p>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Date & Time</p>
                <p className="text-sm text-gray-600">{formatDate()}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-3">
              {event.location?.is_online ? (
                <Globe className="w-5 h-5 text-purple-600 mt-0.5" />
              ) : (
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
              )}
              <div>
                <p className="font-semibold mb-1">Location</p>
                <p className="text-sm text-gray-600">{locationText()}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold mb-2">About this event</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 p-4 bg-purple-50 rounded-lg">
            {event.attendee_count > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm">
                  <strong>{event.attendee_count}</strong> attending
                </span>
              </div>
            )}
            {event.tickets_available !== null && event.tickets_available > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                <span className="text-sm">
                  <strong>{event.tickets_available}</strong> tickets available
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.open(event.url, "_blank")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Get Tickets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============= MAIN COMPONENT =============

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 24,
    pages: 0,
    has_next: false,
    has_prev: false,
  });
  const [categories, setCategories] = useState<Array<{ value: string; count: number }>>([]);
  const [filters, setFilters] = useState<EventFilters>({
    sort: "date",
  });
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchInput || undefined }));
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Events</h1>
          <p className="text-xl opacity-90 mb-8">Find and book the best events happening around you</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events, venues, or organizers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900 placeholder-gray-500 border-0 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar
                        filters={filters}
                        categories={categories}
                        onFilterChange={handleFilterChange}
                        onReset={() => {
                          handleResetFilters();
                          setMobileFiltersOpen(false);
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Results count */}
                <p className="text-sm text-gray-600">
                  {loading ? "Loading..." : `${meta.total} events found`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                  <SelectTrigger className="w-48">
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

                {/* View Mode */}
                <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => setViewMode("grid")}
                    className="px-2"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => setViewMode("list")}
                    className="px-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Events Grid/List */}
            {loading ? (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <EventSkeleton key={i} />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {events.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && events.length > 0 && meta.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={!meta.has_prev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === meta.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {meta.pages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant={meta.pages === meta.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(meta.pages)}
                        className="w-10"
                      >
                        {meta.pages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={!meta.has_next}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <EventQuickView 
        event={selectedEvent}
        isOpen={quickViewOpen}
        onClose={() => {
          setQuickViewOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
};

export default Events;