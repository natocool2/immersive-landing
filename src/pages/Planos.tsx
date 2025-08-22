import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Star, Users, Zap, Clock, Code } from "lucide-react";
import Header from "@/components/Header";

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

// Remove the public display of coupon codes for security
// Coupons are now validated server-side only when entered by users

export default function Planos() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Dynamic add-on states
  const [customTokens, setCustomTokens] = useState([10]);
  const [customConsultation, setCustomConsultation] = useState([5]);
  const [customDevelopment, setCustomDevelopment] = useState([10]);
  
  const { user } = useAuth();

  const calculateTieredTokenPrice = (tokens: number): number => {
    let totalPrice = 0;
    let remaining = tokens;
    
    // Tier 1: 1-10M tokens: $3.00 per 1M tokens
    if (remaining > 0) {
      const tierTokens = Math.min(remaining, 10);
      totalPrice += tierTokens * 3.00;
      remaining -= tierTokens;
    }
    
    // Tier 2: 11-25M tokens: $2.80 per 1M tokens
    if (remaining > 0) {
      const tierTokens = Math.min(remaining, 15);
      totalPrice += tierTokens * 2.80;
      remaining -= tierTokens;
    }
    
    // Tier 3: 26-50M tokens: $2.60 per 1M tokens
    if (remaining > 0) {
      const tierTokens = Math.min(remaining, 25);
      totalPrice += tierTokens * 2.60;
      remaining -= tierTokens;
    }
    
    // Tier 4: 51-100M tokens: $2.40 per 1M tokens
    if (remaining > 0) {
      const tierTokens = Math.min(remaining, 50);
      totalPrice += tierTokens * 2.40;
      remaining -= tierTokens;
    }
    
    // Tier 5: 101-200M tokens: $2.20 per 1M tokens
    if (remaining > 0) {
      const tierTokens = Math.min(remaining, 100);
      totalPrice += tierTokens * 2.20;
      remaining -= tierTokens;
    }
    
    // Tier 6: 201M+ tokens: $2.00 per 1M tokens
    if (remaining > 0) {
      totalPrice += remaining * 2.00;
    }
    
    return totalPrice;
  };

  const calculateConsultationPrice = (hours: number): number => {
    let totalPrice = 0;
    let remaining = hours;
    
    // Tier 1: 1-5 hours: $60.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 5);
      totalPrice += tierHours * 60.00;
      remaining -= tierHours;
    }
    
    // Tier 2: 6-10 hours: $55.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 5);
      totalPrice += tierHours * 55.00;
      remaining -= tierHours;
    }
    
    // Tier 3: 11-20 hours: $50.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 10);
      totalPrice += tierHours * 50.00;
      remaining -= tierHours;
    }
    
    // Tier 4: 21-40 hours: $45.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 20);
      totalPrice += tierHours * 45.00;
      remaining -= tierHours;
    }
    
    // Tier 5: 41+ hours: $40.00 per hour
    if (remaining > 0) {
      totalPrice += remaining * 40.00;
    }
    
    return totalPrice;
  };

  const calculateDevelopmentPrice = (hours: number): number => {
    let totalPrice = 0;
    let remaining = hours;
    
    // Tier 1: 1-8 hours: $90.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 8);
      totalPrice += tierHours * 90.00;
      remaining -= tierHours;
    }
    
    // Tier 2: 9-20 hours: $85.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 12);
      totalPrice += tierHours * 85.00;
      remaining -= tierHours;
    }
    
    // Tier 3: 21-40 hours: $80.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 20);
      totalPrice += tierHours * 80.00;
      remaining -= tierHours;
    }
    
    // Tier 4: 41-80 hours: $75.00 per hour
    if (remaining > 0) {
      const tierHours = Math.min(remaining, 40);
      totalPrice += tierHours * 75.00;
      remaining -= tierHours;
    }
    
    // Tier 5: 81+ hours: $70.00 per hour
    if (remaining > 0) {
      totalPrice += remaining * 70.00;
    }
    
    return totalPrice;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Por favor, insira um código de cupão");
      return;
    }
    
    setIsApplyingCoupon(true);
    try {
      // Use the secure validation function instead of direct table access
      const { data, error } = await supabase.rpc('validate_coupon_code', {
        coupon_code_input: couponCode.toUpperCase()
      });

      if (error) {
        console.error('Error validating coupon:', error);
        toast.error("Erro ao validar cupão");
        setAppliedCoupon(null);
      } else if (!data || data.length === 0) {
        toast.error("Código de cupão inválido ou expirado");
        setAppliedCoupon(null);
      } else {
        const couponData = data[0];
        setAppliedCoupon(couponData);
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
    
    setSelectedTier(tier.name);
    setIsCheckingOut(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tier: tier.name,
          isYearly,
          couponCode: appliedCoupon?.code
        }
      });

      if (error) throw error;
      
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

  const handleAddonPurchase = async (type: string, amount: number, price: number) => {
    if (!user) {
      toast.error("Por favor, faça login para continuar");
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          addonType: type,
          addonAmount: amount,
          addonPrice: price,
          couponCode: appliedCoupon?.code
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar compra");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Planos Easynet Pro
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Escolha o plano perfeito para acelerar o seu negócio
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>Mensal</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsYearly(!isYearly)}
              className={`relative h-6 w-12 rounded-full p-0 ${isYearly ? 'bg-primary' : 'bg-gray-600'}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </Button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Anual <Badge variant="secondary" className="ml-1">20% OFF</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            const price = isYearly ? tier.yearlyPrice : tier.price;
            const monthlyPrice = isYearly ? tier.yearlyPrice / 12 : tier.price;
            
            return (
              <Card key={tier.name} className={`relative bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-300 ${tier.popular ? 'ring-2 ring-purple-500' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full w-fit">
                    <Icon className="h-8 w-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    €{price === 0 ? '0' : monthlyPrice.toFixed(0)}
                    <span className="text-sm text-gray-400 font-normal">/mês</span>
                  </div>
                  {isYearly && price > 0 && (
                    <p className="text-sm text-green-400">
                      Poupa €{(tier.price * 12 - tier.yearlyPrice).toFixed(0)}/ano
                    </p>
                  )}
                  <p className="text-gray-400">{tier.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={() => handleCheckout(tier)}
                    disabled={isCheckingOut && selectedTier === tier.name}
                  >
                    {tier.price === 0 ? 'Começar Grátis' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add-ons Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Add-ons Personalizados</h2>
          
          <Tabs defaultValue="tokens" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tokens">Tokens Extra</TabsTrigger>
              <TabsTrigger value="consultation">Horas de Consultoria</TabsTrigger>
              <TabsTrigger value="development">Horas de Desenvolvimento</TabsTrigger>
            </TabsList>
            
            {/* Tokens Tab */}
            <TabsContent value="tokens" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Tokens Extra - Preços Dinâmicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fixed Packages */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Pacotes Rápidos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {tokenPacks.map((pack) => (
                        <Card key={pack.name} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold text-white">{pack.name}</h4>
                            <p className="text-2xl font-bold text-purple-400">{pack.tokens}M</p>
                            <p className="text-lg text-white">€{pack.price}</p>
                            <Button 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleAddonPurchase('tokens', pack.tokens, pack.price)}
                            >
                              Comprar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-600" />
                  
                  {/* Custom Amount */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quantidade Personalizada</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Tokens (1M - 500M): {customTokens[0]}M tokens
                        </label>
                        <Slider
                          value={customTokens}
                          onValueChange={setCustomTokens}
                          max={500}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-white">
                          Preço Total: €{calculateTieredTokenPrice(customTokens[0]).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-300">
                          Preço médio: €{(calculateTieredTokenPrice(customTokens[0]) / customTokens[0]).toFixed(3)} por 1M tokens
                        </p>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleAddonPurchase('tokens', customTokens[0], calculateTieredTokenPrice(customTokens[0]))}
                        >
                          Comprar {customTokens[0]}M Tokens
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Consultation Tab */}
            <TabsContent value="consultation" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Horas de Consultoria - Preços Dinâmicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fixed Packages */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Pacotes Rápidos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {consultationPacks.map((pack) => (
                        <Card key={pack.name} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold text-white">{pack.name}</h4>
                            <p className="text-2xl font-bold text-purple-400">{pack.hours}h</p>
                            <p className="text-lg text-white">€{pack.price}</p>
                            <Button 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleAddonPurchase('consultation', pack.hours, pack.price)}
                            >
                              Comprar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-600" />
                  
                  {/* Custom Amount */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quantidade Personalizada</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Horas (1-100): {customConsultation[0]} horas
                        </label>
                        <Slider
                          value={customConsultation}
                          onValueChange={setCustomConsultation}
                          max={100}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-white">
                          Preço Total: €{calculateConsultationPrice(customConsultation[0]).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-300">
                          Preço médio: €{(calculateConsultationPrice(customConsultation[0]) / customConsultation[0]).toFixed(2)} por hora
                        </p>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleAddonPurchase('consultation', customConsultation[0], calculateConsultationPrice(customConsultation[0]))}
                        >
                          Comprar {customConsultation[0]} Horas
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Development Tab */}
            <TabsContent value="development" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Horas de Desenvolvimento - Preços Dinâmicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fixed Packages */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Pacotes Rápidos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {developmentPacks.map((pack) => (
                        <Card key={pack.name} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4 text-center">
                            <h4 className="font-semibold text-white">{pack.name}</h4>
                            <p className="text-2xl font-bold text-purple-400">{pack.hours}h</p>
                            <p className="text-lg text-white">€{pack.price}</p>
                            <Button 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleAddonPurchase('development', pack.hours, pack.price)}
                            >
                              Comprar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-600" />
                  
                  {/* Custom Amount */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quantidade Personalizada</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Horas (1-200): {customDevelopment[0]} horas
                        </label>
                        <Slider
                          value={customDevelopment}
                          onValueChange={setCustomDevelopment}
                          max={200}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-white">
                          Preço Total: €{calculateDevelopmentPrice(customDevelopment[0]).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-300">
                          Preço médio: €{(calculateDevelopmentPrice(customDevelopment[0]) / customDevelopment[0]).toFixed(2)} por hora
                        </p>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleAddonPurchase('development', customDevelopment[0], calculateDevelopmentPrice(customDevelopment[0]))}
                        >
                          Comprar {customDevelopment[0]} Horas
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Coupon Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">Tem um Código de Desconto?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Insira o código do cupão"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button 
                onClick={applyCoupon}
                disabled={isApplyingCoupon}
                variant="outline"
              >
                Aplicar
              </Button>
            </div>
            
            {appliedCoupon && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-400 font-semibold">
                  Cupão aplicado: {appliedCoupon.discount_percent}% de desconto
                </p>
                <p className="text-sm text-green-300">{appliedCoupon.description}</p>
              </div>
            )}
            
            <div className="p-3 bg-gray-700/50 rounded-lg text-center">
              <p className="text-sm text-gray-300 mb-2">
                Insira um código promocional para obter desconto na sua compra
              </p>
              <p className="text-xs text-gray-400">
                Códigos promocionais são fornecidos durante campanhas especiais e eventos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}