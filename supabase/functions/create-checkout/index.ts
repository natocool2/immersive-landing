import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    // Parse request body
    const { mode, priceId, amount, currency = "eur", productName } = await req.json();
    logStep("Request parsed", { mode, priceId, amount, currency, productName });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user (optional for one-off payments)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
      logStep("User authenticated", { userId: user?.id, email: user?.email });
    } else {
      logStep("No authentication provided - guest checkout");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check for existing customer
    let customerId;
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      }
    }

    // Prepare session configuration
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : (user?.email || "guest@example.com"),
      mode: mode || "payment", // Default to one-time payment
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
    };

    // Configure line items based on mode
    if (mode === "subscription" && priceId) {
      // Use existing Stripe price for subscription
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else {
      // Create price on the fly for one-time payments
      if (!amount || amount <= 0) {
        throw new Error("Amount is required and must be greater than 0");
      }
      sessionConfig.line_items = [
        {
          price_data: {
            currency: currency,
            product_data: { 
              name: productName || "Produto" 
            },
            unit_amount: Math.round(amount), // Amount in cents, ensure it's an integer
            ...(mode === "subscription" ? { recurring: { interval: "month" } } : {}),
          },
          quantity: 1,
        },
      ];
    }

    logStep("Creating Stripe session", { sessionConfig });
    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});