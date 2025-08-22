import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from "@/components/Header";
import { LiquidGlassDock } from "@/components/LiquidGlassDock";
import { useFullscreen } from "@/hooks/useFullscreen";
import { 
  Check, 
  Zap, 
  Users, 
  Shield, 
  Star, 
  Sparkles, 
  Crown,
  Calculator,
  Tag,
  ArrowRight,
  Cpu,
  Clock,
  Code,
  Maximize,
  Minimize
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  icon: any;
  popular?: boolean;
  tokenIncluded: number;
  consultationIncluded?: number;
  extraTokenPrice?: number;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    description: "Perfeito para começar",
    icon: Zap,
    tokenIncluded: 2,
    features: [
      "2M tokens/mês incluídos",
      "Criação básica de perfil",
      "Acesso ao conteúdo da comunidade",
      "Participação em eventos públicos",
      "Uploads limitados (3 projetos)",
      "Acesso básico à rede social",
      "Suporte da comunidade"
    ]
  },
  {
    name: "Starter",
    price: 29,
    yearlyPrice: 290,
    description: "Ideal para iniciantes",
    icon: Star,
    tokenIncluded: 10,
    features: [
      "10M tokens/mês incluídos",
      "Criação de plano de negócios IA",
      "Automação básica de tarefas",
      "5GB de armazenamento",
      "Participação em competições",
      "Certificados digitais básicos",
      "Uploads de projetos pessoais ilimitados",
      "Acesso a bootcamp introdutório",
      "Suporte por email"
    ]
  },
  {
    name: "Pro",
    price: 99,
    yearlyPrice: 990,
    description: "Para profissionais avançados",
    icon: Code,
    popular: true,
    tokenIncluded: 30,
    consultationIncluded: 1,
    extraTokenPrice: 0.04,
    features: [
      "30M tokens/mês incluídos",
      "Acesso completo ao Enengin",
      "Recursos de desenvolvimento avançados",
      "APIs e integrações completas",
      "50GB de armazenamento",
      "Treinamento técnico avançado",
      "Bootcamps técnicos especializados",
      "Análise IA avançada",
      "1h de consultoria mensal incluída",
      "Suporte prioritário",
      "Tokens extras: $0,04 por 1000 tokens"
    ]
  },
  {
    name: "Enterprise",
    price: 199,
    yearlyPrice: 1990,
    description: "Para equipas e empresas",
    icon: Users,
    tokenIncluded: 100,
    consultationIncluded: 3,
    extraTokenPrice: 0.03,
    features: [
      "100M tokens/mês incluídos",
      "Acesso multi-utilizador (até 25 utilizadores)",
      "Automação empresarial avançada",
      "Armazenamento ilimitado",
      "Dashboard de gestão de equipa",
      "Ferramentas colaborativas completas",
      "Gestão de projetos (Kanban, tarefas)",
      "Rastreamento de estudantes/estagiários",
      "Integrações CRM/ERP",
      "Matchmaking de talentos",
      "3h de consultoria mensal incluída",
      "Suporte dedicado 24/7",
      "Tokens extras: $0,03 por 1000 tokens (25% desconto)",
      "Garantia SLA",
      "Onboarding personalizado"
    ]
  }
];

const tokenPacks = [
  { name: "Pack Small", tokens: 5, price: 15 },
  { name: "Pack Medium", tokens: 20, price: 50 },
  { name: "Pack Large", tokens: 50, price: 120 },
  { name: "Pack XL", tokens: 100, price: 220 }
];

const consultationPacks = [
  { name: "Pack Básico", hours: 3, price: 180 },
  { name: "Pack Standard", hours: 8, price: 400 },
  { name: "Pack Premium", hours: 20, price: 900 }
];

const developmentPacks = [
  { name: "Pack Starter", hours: 5, price: 450 },
  { name: "Pack Growth", hours: 15, price: 1200 },
  { name: "Pack Enterprise", hours: 40, price: 2800 }
];

const coupons = [
  { code: "WELCOME10", discount: 10, description: "10% off first month" },
  { code: "ANNUAL20", discount: 20, description: "20% off annual plans" },
  { code: "STARTUP50", discount: 50, description: "50% off for startups" },
  { code: "STUDENT30", discount: 30, description: "30% off for students" },
  { code: "REFERRAL15", discount: 15, description: "15% off for referrals" }
];

export default function Pricing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isYearly, setIsYearly] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const { user } = useAuth();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Dynamic add-on states
  const [customTokens, setCustomTokens] = useState([10]);
  const [customConsultation, setCustomConsultation] = useState([5]);
  const [customDevelopment, setCustomDevelopment] = useState([10]);
  const [addOnMode, setAddOnMode] = useState<'packages' | 'custom'>('packages');

  // Mouse tracking para efeito parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Tiered pricing calculations
  const calculateTieredTokenPrice = (tokens: number) => {
    let total = 0;
    let remaining = tokens;

    // Tier 1: 1-10M tokens: $3.00 per 1M tokens
    if (remaining > 0) {
      const tier = Math.min(remaining, 10);
      total += tier * 3.00;
      remaining -= tier;
    }

    // Tier 2: 11-25M tokens: $2.80 per 1M tokens
    if (remaining > 0) {
      const tier = Math.min(remaining, 15);
      total += tier * 2.80;
      remaining -= tier;
    }

    // Tier 3: 26-50M tokens: $2.60 per 1M tokens
    if (remaining > 0) {
      const tier = Math.min(remaining, 25);
      total += tier * 2.60;
      remaining -= tier;
    }

    // Tier 4: 51-100M tokens: $2.40 per 1M tokens
    if (remaining > 0) {
      const tier = Math.min(remaining, 50);
      total += tier * 2.40;
      remaining -= tier;
    }

    // Tier 5: 101-200M tokens: $2.20 per 1M tokens
    if (remaining > 0) {
      const tier = Math.min(remaining, 100);
      total += tier * 2.20;
      remaining -= tier;
    }

    // Tier 6: 201M+ tokens: $2.00 per 1M tokens
    if (remaining > 0) {
      total += remaining * 2.00;
    }

    return total;
  };

  const calculateConsultationPrice = (hours: number) => {
    let total = 0;
    let remaining = hours;

    if (remaining > 0) {
      const tier = Math.min(remaining, 5);
      total += tier * 60.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      const tier = Math.min(remaining, 5);
      total += tier * 55.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      const tier = Math.min(remaining, 10);
      total += tier * 50.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      const tier = Math.min(remaining, 20);
      total += tier * 45.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      total += remaining * 40.00;
    }

    return total;
  };

  const calculateDevelopmentPrice = (hours: number) => {
    let total = 0;
    let remaining = hours;

    if (remaining > 0) {
      const tier = Math.min(remaining, 8);
      total += tier * 90.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      const tier = Math.min(remaining, 12);
      total += tier * 85.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      const tier = Math.min(remaining, 20);
      total += tier * 80.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      const tier = Math.min(remaining, 40);
      total += tier * 75.00;
      remaining -= tier;
    }

    if (remaining > 0) {
      total += remaining * 70.00;
    }

    return total;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Por favor, insira um código de cupão");
      return;
    }
    
    setIsApplyingCoupon(true);
    try {
      // Use the secure validation function instead of direct table access
      const { data, error } = await supabase.rpc('validate_coupon_secure', {
        coupon_code_input: couponCode.toUpperCase()
      });

      if (error) {
        console.error('Error validating coupon:', error);
        toast.error("Erro ao validar cupão");
        setAppliedCoupon(null);
      } else if (!data || data.length === 0 || !data[0].valid) {
        toast.error("Código de cupão inválido ou expirado");
        setAppliedCoupon(null);
      } else {
        const couponData = data[0];
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount_percent: couponData.discount_percent,
          description: couponData.description,
          active: true
        });
        toast.success(`Cupão aplicado! ${couponData.discount_percent}% de desconto`);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error("Erro ao validar cupão");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async (tier: PricingTier) => {
    if (!user) {
      toast.error("Por favor, faça login para continuar");
      return;
    }
    
    // Handle free plan - no payment needed
    if (tier.price === 0 && tier.yearlyPrice === 0) {
      toast.success("Plano Free ativado com sucesso!");
      return;
    }
    
    setSelectedTier(tier.name);
    setIsCheckingOut(true);
    
    try {
      const price = isYearly ? tier.yearlyPrice : tier.price;
      const finalPrice = appliedCoupon ? price * (1 - appliedCoupon.discount_percent / 100) : price;
      
      // Ensure we have a valid amount
      if (!finalPrice || finalPrice <= 0) {
        throw new Error("Preço inválido para este plano");
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          mode: 'payment',
          amount: Math.round(finalPrice * 100), // Convert to cents
          currency: 'eur',
          productName: `${tier.name} - ${isYearly ? 'Anual' : 'Mensal'}`,
          couponCode: appliedCoupon?.code
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento");
    } finally {
      setIsCheckingOut(false);
      setSelectedTier(null);
    }
  };

  const handleAddonPurchase = async (productName: string, price: number) => {
    try {
      setIsCheckingOut(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          mode: 'payment',
          amount: price * 100, // Convert to cents
          currency: 'usd',
          productName,
          couponCode: appliedCoupon?.code
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar compra");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleIconClick = (index: number) => {
    // Handle dock icon clicks if needed
  };

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
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* Conteúdo principal */}
      <div className="relative z-10 h-full w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto pt-[72px] pb-[103px] px-[30px]">
          <div className="bg-white/5 border border-white/15 rounded-3xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl shadow-[0_10px_60px_-15px_rgba(0,0,0,0.6)]">
            
            {/* Header */}
            <header className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 ring-1 ring-primary/20 mb-6">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">CitIntel Pricing</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6">
                <span className="block text-white font-medium">Choose Your</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Intelligence Level</span>
              </h1>
              
              <p className="text-lg text-slate-200/90 max-w-2xl mx-auto">
                Unlock the full potential of AI-powered business intelligence with our comprehensive subscription plans and flexible add-ons.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <span className={`text-sm ${!isYearly ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                <button
                  onClick={() => setIsYearly(!isYearly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isYearly ? 'bg-primary' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isYearly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${isYearly ? 'text-white' : 'text-slate-400'}`}>
                  Yearly
                  <Badge variant="secondary" className="ml-2">Save 17%</Badge>
                </span>
              </div>
            </header>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
              {pricingTiers.map((tier, index) => {
                const Icon = tier.icon;
                const price = isYearly ? tier.yearlyPrice : tier.price;
                const originalPrice = isYearly ? tier.price * 12 : tier.price;
                const discount = appliedCoupon ? (price * appliedCoupon.discount_percent) / 100 : 0;
                const finalPrice = price - discount;

                return (
                  <Card 
                    key={tier.name}
                    className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                      tier.popular 
                        ? 'ring-2 ring-primary bg-white/10 border-primary/50' 
                        : 'bg-white/5 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/70 mb-4">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                      <CardDescription className="text-slate-300">{tier.description}</CardDescription>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">
                            ${finalPrice}
                          </span>
                          <span className="text-slate-400">
                            /{isYearly ? 'year' : 'month'}
                          </span>
                        </div>
                        
                        {discount > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 line-through">${price}</span>
                            <Badge variant="secondary" className="text-xs">
                              Save ${discount.toFixed(0)}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="text-sm text-primary font-medium">
                          {tier.tokenIncluded}M tokens included
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Button 
                        className="w-full mb-6"
                        variant={tier.popular ? "default" : "outline"}
                        onClick={() => handleCheckout(tier)}
                        disabled={isCheckingOut && selectedTier === tier.name}
                      >
                        {tier.price === 0 ? 'Get Started Free' : 'Start Subscription'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      <ul className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-200">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Add-ons Section */}
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-white mb-4">Power-Up Your Plan</h2>
                <p className="text-lg text-slate-200/90">Choose from fixed packages or customize exactly what you need</p>
              </div>

              {/* Add-on Mode Toggle */}
              <Tabs value={addOnMode} onValueChange={(value) => setAddOnMode(value as 'packages' | 'custom')} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="packages">Quick Packages</TabsTrigger>
                  <TabsTrigger value="custom">Custom Amount</TabsTrigger>
                </TabsList>

                <TabsContent value="packages" className="space-y-8">
                  {/* Token Packages */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Extra Token Packages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {tokenPacks.map((pack) => (
                        <Card key={pack.name} className="bg-white/5 border-white/15 hover:bg-white/10 transition-colors">
                          <CardContent className="p-6">
                            <div className="text-center space-y-4">
                              <h4 className="font-medium text-white">{pack.name}</h4>
                              <div className="text-2xl font-bold text-primary">{pack.tokens}</div>
                              <div className="text-xl text-white">${pack.price}</div>
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleAddonPurchase(`${pack.name} - ${pack.tokens} tokens`, pack.price)}
                                disabled={isCheckingOut}
                              >
                                Purchase
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Packages */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Consultation Packages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {consultationPacks.map((pack) => (
                        <Card key={pack.name} className="bg-white/5 border-white/15 hover:bg-white/10 transition-colors">
                          <CardContent className="p-6">
                            <div className="text-center space-y-4">
                              <h4 className="font-medium text-white">{pack.name}</h4>
                              <div className="text-2xl font-bold text-primary">{pack.hours}h</div>
                              <div className="text-xl text-white">${pack.price}</div>
                              <div className="text-sm text-slate-400">${(pack.price / pack.hours).toFixed(0)}/hour</div>
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleAddonPurchase(`${pack.name} - ${pack.hours} hours consultation`, pack.price)}
                                disabled={isCheckingOut}
                              >
                                Purchase
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Development Packages */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      Development Packages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {developmentPacks.map((pack) => (
                        <Card key={pack.name} className="bg-white/5 border-white/15 hover:bg-white/10 transition-colors">
                          <CardContent className="p-6">
                            <div className="text-center space-y-4">
                              <h4 className="font-medium text-white">{pack.name}</h4>
                              <div className="text-2xl font-bold text-primary">{pack.hours}h</div>
                              <div className="text-xl text-white">${pack.price}</div>
                              <div className="text-sm text-slate-400">${(pack.price / pack.hours).toFixed(0)}/hour</div>
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleAddonPurchase(`${pack.name} - ${pack.hours} hours development`, pack.price)}
                                disabled={isCheckingOut}
                              >
                                Purchase
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-8">
                  {/* Custom Token Add-on */}
                  <Card className="bg-white/5 border-white/15">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Custom Extra Tokens
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Use the slider to select your desired amount of tokens with tiered pricing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white">Tokens (millions)</span>
                          <span className="text-2xl font-bold text-primary">{customTokens[0]}M</span>
                        </div>
                        <Slider
                          value={customTokens}
                          onValueChange={setCustomTokens}
                          max={500}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Total Price:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${calculateTieredTokenPrice(customTokens[0]).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-2">
                          Average rate: ${(calculateTieredTokenPrice(customTokens[0]) / customTokens[0]).toFixed(3)} per 1M tokens
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleAddonPurchase(
                          `Custom ${customTokens[0]}M tokens`, 
                          calculateTieredTokenPrice(customTokens[0])
                        )}
                        disabled={isCheckingOut}
                      >
                        Purchase {customTokens[0]}M Tokens - ${calculateTieredTokenPrice(customTokens[0]).toFixed(2)}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Custom Consultation Add-on */}
                  <Card className="bg-white/5 border-white/15">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Custom Consultation Hours
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Select the exact number of consultation hours you need
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white">Hours</span>
                          <span className="text-2xl font-bold text-primary">{customConsultation[0]}h</span>
                        </div>
                        <Slider
                          value={customConsultation}
                          onValueChange={setCustomConsultation}
                          max={100}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Total Price:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${calculateConsultationPrice(customConsultation[0]).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-2">
                          Average rate: ${(calculateConsultationPrice(customConsultation[0]) / customConsultation[0]).toFixed(2)} per hour
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleAddonPurchase(
                          `Custom ${customConsultation[0]} hours consultation`, 
                          calculateConsultationPrice(customConsultation[0])
                        )}
                        disabled={isCheckingOut}
                      >
                        Purchase {customConsultation[0]} Hours - ${calculateConsultationPrice(customConsultation[0]).toFixed(2)}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Custom Development Add-on */}
                  <Card className="bg-white/5 border-white/15">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Code className="h-5 w-5 text-primary" />
                        Custom Development Hours
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Get exactly the development hours you need for your project
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white">Hours</span>
                          <span className="text-2xl font-bold text-primary">{customDevelopment[0]}h</span>
                        </div>
                        <Slider
                          value={customDevelopment}
                          onValueChange={setCustomDevelopment}
                          max={200}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Total Price:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${calculateDevelopmentPrice(customDevelopment[0]).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 mt-2">
                          Average rate: ${(calculateDevelopmentPrice(customDevelopment[0]) / customDevelopment[0]).toFixed(2)} per hour
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => handleAddonPurchase(
                          `Custom ${customDevelopment[0]} hours development`, 
                          calculateDevelopmentPrice(customDevelopment[0])
                        )}
                        disabled={isCheckingOut}
                      >
                        Purchase {customDevelopment[0]} Hours - ${calculateDevelopmentPrice(customDevelopment[0]).toFixed(2)}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Coupon Section */}
            <Card className="bg-white/5 border-white/15 mt-16">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Have a Coupon Code?
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Enter your coupon code to get a discount on your purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-white/5 border-white/15 text-white placeholder:text-slate-400"
                  />
                  <Button 
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>

                {appliedCoupon && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Coupon Applied!</span>
                    </div>
                    <div className="text-sm text-green-300 mt-1">
                      {appliedCoupon.description} - {appliedCoupon.discount_percent}% off
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((coupon) => (
                    <div 
                      key={coupon.code}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="font-mono text-primary text-sm font-medium">{coupon.code}</div>
                      <div className="text-xs text-slate-400 mt-1">{coupon.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Liquid Glass Dock Footer */}
      <LiquidGlassDock onIconClick={handleIconClick} activeIcon={0} />
      
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
}
