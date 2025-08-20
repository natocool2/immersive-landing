import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StripePlan {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Array<{
    id: string;
    currency: string;
    unit_amount: number;
    recurring: {
      interval: string;
      interval_count: number;
    } | null;
    type: string;
    nickname: string;
  }>;
}

interface StripeResponse {
  plans: StripePlan[];
  summary: {
    total_products: number;
    total_prices: number;
    plans_with_prices: number;
  };
}

export const StripePlansList = () => {
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<StripeResponse['summary'] | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('list-stripe-plans');
      
      if (error) {
        console.error('Erro ao buscar planos:', error);
        toast.error('Erro ao carregar planos do Stripe');
        return;
      }

      setPlans(data.plans || []);
      setSummary(data.summary || null);
      toast.success('Planos carregados com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao conectar com o Stripe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatInterval = (recurring: any) => {
    if (!recurring) return 'Pagamento único';
    const interval = recurring.interval === 'month' ? 'mês' : 
                    recurring.interval === 'year' ? 'ano' : recurring.interval;
    return recurring.interval_count > 1 ? 
      `A cada ${recurring.interval_count} ${interval}es` : 
      `Por ${interval}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planos do Stripe</h2>
          {summary && (
            <p className="text-muted-foreground">
              {summary.total_products} produtos, {summary.total_prices} preços, {summary.plans_with_prices} planos com preços
            </p>
          )}
        </div>
        <Button onClick={fetchPlans} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar'}
        </Button>
      </div>

      {loading && plans.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">A carregar planos...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                {plan.description && (
                  <CardDescription>{plan.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    ID: {plan.id}
                  </div>
                  
                  {plan.prices.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Preços:</h4>
                      {plan.prices.map((price) => (
                        <div key={price.id} className="border rounded p-2 text-sm">
                          <div className="font-medium">
                            {formatPrice(price.unit_amount, price.currency)}
                          </div>
                          <div className="text-muted-foreground">
                            {formatInterval(price.recurring)}
                          </div>
                          {price.nickname && (
                            <div className="text-xs text-muted-foreground">
                              {price.nickname}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            ID: {price.id}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nenhum preço configurado
                    </div>
                  )}

                  {Object.keys(plan.metadata).length > 0 && (
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Metadata:</h4>
                      {Object.entries(plan.metadata).map(([key, value]) => (
                        <div key={key} className="text-xs text-muted-foreground">
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && plans.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground">
              Nenhum plano encontrado no Stripe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};