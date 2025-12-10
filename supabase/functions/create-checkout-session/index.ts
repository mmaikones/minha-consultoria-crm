// Follow this setup to deploy: https://supabase.com/docs/guides/functions/deploy
// supabase functions deploy create-checkout-session

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
    try {
        const { planId, email, phone, name, professionalId } = await req.json()

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get Plan
        const { data: plan } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single()

        if (!plan) throw new Error('Plan not found')

        // 2. Create Sale Record
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert({
                professional_id: professionalId,
                plan_id: planId,
                email,
                phone,
                amount: plan.price,
                status: 'pending',
                metadata: { source: 'checkout_session' }
            })
            .select()
            .single()

        if (saleError) throw saleError

        // 3. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: plan.name,
                            description: plan.description,
                        },
                        unit_amount: Math.round(plan.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/checkout/cancel`,
            customer_email: email,
            metadata: {
                sale_id: sale.id,
                plan_id: planId,
                professional_id: professionalId
            },
        })

        // 4. Update Sale with Session ID
        await supabase
            .from('sales')
            .update({ stripe_session_id: session.id })
            .eq('id', sale.id)

        return new Response(
            JSON.stringify({ sessionId: session.id, sessionUrl: session.url }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }
})
