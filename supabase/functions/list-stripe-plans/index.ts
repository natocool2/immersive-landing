import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LIST-STRIPE-PLANS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get all products
    const products = await stripe.products.list({ 
      active: true,
      limit: 100 
    });
    logStep("Products retrieved", { count: products.data.length });

    // Get all prices
    const prices = await stripe.prices.list({ 
      active: true,
      limit: 100 
    });
    logStep("Prices retrieved", { count: prices.data.length });

    // Combine products with their prices
    const plans = products.data.map(product => {
      const productPrices = prices.data.filter(price => price.product === product.id);
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata,
        prices: productPrices.map(price => ({
          id: price.id,
          currency: price.currency,
          unit_amount: price.unit_amount,
          recurring: price.recurring ? {
            interval: price.recurring.interval,
            interval_count: price.recurring.interval_count
          } : null,
          type: price.type,
          nickname: price.nickname
        }))
      };
    });

    logStep("Plans organized", { planCount: plans.length });

    return new Response(JSON.stringify({ 
      plans,
      summary: {
        total_products: products.data.length,
        total_prices: prices.data.length,
        plans_with_prices: plans.filter(p => p.prices.length > 0).length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in list-stripe-plans", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});