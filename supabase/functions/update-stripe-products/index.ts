import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-STRIPE-PRODUCTS] ${step}${detailsStr}`);
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

    // Create CitIntel subscription products
    const subscriptionProducts = [
      {
        name: "CitIntel Free Plan",
        description: "2M tokens/month, basic features, community access",
        metadata: {
          plan_type: "subscription",
          tier: "free",
          tokens_included: "2000000",
          features: "Basic profile creation, Community content access, Public events participation, Limited uploads (3 projects), Basic social network access, Community support"
        }
      },
      {
        name: "CitIntel Starter Plan",
        description: "10M tokens/month, AI business plan creation, basic automation",
        metadata: {
          plan_type: "subscription",
          tier: "starter",
          tokens_included: "10000000",
          features: "AI business plan creation, Basic task automation, 5GB storage, Competition participation, Basic digital certificates, Unlimited personal project uploads, Introductory bootcamp access, Email support"
        }
      },
      {
        name: "CitIntel Pro Plan",
        description: "30M tokens/month, full Enengin access, advanced features",
        metadata: {
          plan_type: "subscription",
          tier: "pro",
          tokens_included: "30000000",
          features: "Full Enengin access, Advanced development resources, Complete APIs and integrations, 50GB storage, Advanced technical training, Specialized technical bootcamps, Advanced AI analysis, 1h monthly consultation included, Priority support"
        }
      },
      {
        name: "CitIntel Enterprise Plan",
        description: "100M tokens/month, multi-user access, enterprise features",
        metadata: {
          plan_type: "subscription",
          tier: "enterprise",
          tokens_included: "100000000",
          features: "Multi-user access (up to 25 users), Advanced enterprise automation, Unlimited storage, Team management dashboard, Complete collaborative tools, Project management (Kanban, tasks), Student/intern tracking, CRM/ERP integrations, Talent matchmaking, 3h monthly consultation included, 24/7 dedicated support, SLA guarantee, Personalized onboarding"
        }
      }
    ];

    // Create add-on products
    const addonProducts = [
      {
        name: "Extra Tokens Pack Small",
        description: "5M additional tokens",
        metadata: { plan_type: "addon", addon_type: "tokens", quantity: "5000000" }
      },
      {
        name: "Extra Tokens Pack Medium",
        description: "20M additional tokens",
        metadata: { plan_type: "addon", addon_type: "tokens", quantity: "20000000" }
      },
      {
        name: "Extra Tokens Pack Large",
        description: "50M additional tokens",
        metadata: { plan_type: "addon", addon_type: "tokens", quantity: "50000000" }
      },
      {
        name: "Extra Tokens Pack XL",
        description: "100M additional tokens",
        metadata: { plan_type: "addon", addon_type: "tokens", quantity: "100000000" }
      },
      {
        name: "Consultation Pack Básico",
        description: "3 hours of expert consultation",
        metadata: { plan_type: "addon", addon_type: "consultation", quantity: "3" }
      },
      {
        name: "Consultation Pack Standard",
        description: "8 hours of expert consultation",
        metadata: { plan_type: "addon", addon_type: "consultation", quantity: "8" }
      },
      {
        name: "Consultation Pack Premium",
        description: "20 hours of expert consultation",
        metadata: { plan_type: "addon", addon_type: "consultation", quantity: "20" }
      },
      {
        name: "Development Pack Starter",
        description: "5 hours of development work",
        metadata: { plan_type: "addon", addon_type: "development", quantity: "5" }
      },
      {
        name: "Development Pack Growth",
        description: "15 hours of development work",
        metadata: { plan_type: "addon", addon_type: "development", quantity: "15" }
      },
      {
        name: "Development Pack Enterprise",
        description: "40 hours of development work",
        metadata: { plan_type: "addon", addon_type: "development", quantity: "40" }
      }
    ];

    logStep("Creating products...");

    // Create all products
    const createdProducts = [];
    
    for (const productData of [...subscriptionProducts, ...addonProducts]) {
      const product = await stripe.products.create(productData);
      createdProducts.push(product);
      logStep(`Created product: ${product.name}`, { id: product.id });
    }

    // Create prices for subscription products
    const subscriptionPrices = [
      // Free Plan - $0
      { product_id: createdProducts[0].id, unit_amount: 0, interval: "month" },
      
      // Starter Plan - $29/month or $290/year
      { product_id: createdProducts[1].id, unit_amount: 2900, interval: "month" },
      { product_id: createdProducts[1].id, unit_amount: 29000, interval: "year" },
      
      // Pro Plan - $99/month or $990/year
      { product_id: createdProducts[2].id, unit_amount: 9900, interval: "month" },
      { product_id: createdProducts[2].id, unit_amount: 99000, interval: "year" },
      
      // Enterprise Plan - $199/month or $1990/year
      { product_id: createdProducts[3].id, unit_amount: 19900, interval: "month" },
      { product_id: createdProducts[3].id, unit_amount: 199000, interval: "year" }
    ];

    // Create prices for add-on products (one-time purchases)
    const addonPrices = [
      // Token Packs
      { product_id: createdProducts[4].id, unit_amount: 1500 }, // Pack Small - $15
      { product_id: createdProducts[5].id, unit_amount: 5000 }, // Pack Medium - $50
      { product_id: createdProducts[6].id, unit_amount: 12000 }, // Pack Large - $120
      { product_id: createdProducts[7].id, unit_amount: 22000 }, // Pack XL - $220
      
      // Consultation Packs
      { product_id: createdProducts[8].id, unit_amount: 18000 }, // Básico - $180
      { product_id: createdProducts[9].id, unit_amount: 40000 }, // Standard - $400
      { product_id: createdProducts[10].id, unit_amount: 90000 }, // Premium - $900
      
      // Development Packs
      { product_id: createdProducts[11].id, unit_amount: 45000 }, // Starter - $450
      { product_id: createdProducts[12].id, unit_amount: 120000 }, // Growth - $1200
      { product_id: createdProducts[13].id, unit_amount: 280000 } // Enterprise - $2800
    ];

    logStep("Creating prices...");

    // Create subscription prices
    for (const priceData of subscriptionPrices) {
      const price = await stripe.prices.create({
        currency: "usd",
        product: priceData.product_id,
        unit_amount: priceData.unit_amount,
        recurring: { interval: priceData.interval },
        metadata: {
          billing_period: priceData.interval
        }
      });
      logStep(`Created subscription price: ${price.id}`, { 
        amount: price.unit_amount, 
        interval: priceData.interval 
      });
    }

    // Create one-time prices for add-ons
    for (const priceData of addonPrices) {
      const price = await stripe.prices.create({
        currency: "usd",
        product: priceData.product_id,
        unit_amount: priceData.unit_amount,
        metadata: {
          purchase_type: "one_time"
        }
      });
      logStep(`Created one-time price: ${price.id}`, { amount: price.unit_amount });
    }

    logStep("All products and prices created successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "All CitIntel products and prices created successfully",
      products_created: createdProducts.length,
      subscription_prices: subscriptionPrices.length,
      addon_prices: addonPrices.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in update-stripe-products", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});