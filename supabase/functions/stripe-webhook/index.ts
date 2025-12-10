import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature || !endpointSecret) {
        return new Response('Missing signature or secret', { status: 400 })
    }

    try {
        const body = await req.text()
        let event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
        } catch (err) {
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object
            const saleId = paymentIntent.metadata.sale_id

            if (saleId) {
                // 1. Update Sale
                const { data: sale } = await supabase
                    .from('sales')
                    .update({
                        status: 'payment_confirmed',
                        stripe_payment_id: paymentIntent.id
                    })
                    .eq('id', saleId)
                    .select()
                    .single()

                // 2. Create Payment Record (Financial)
                if (sale) {
                    await supabase.from('payments').insert({
                        professional_id: sale.professional_id,
                        sales_id: sale.id,
                        student_id: sale.student_id, // Might be null initially
                        amount: paymentIntent.amount / 100,
                        status: 'paid',
                        payment_method: 'credit_card',
                        stripe_payment_id: paymentIntent.id,
                        due_date: new Date().toISOString(),
                        paid_at: new Date().toISOString(),
                        description: `Venda Plano (Sale ${sale.id})`
                    })

                    // 3. Trigger WhatsApp (via internal fetch or another function)
                    // Ideally call the evolution service or insert into a job queue
                    // For now, we assume the frontend or a separate trigger handles this 
                    // OR we can make a fetch to our own API if exposed?
                    // Simplified: The backend logic ends here for database consistency. 
                    // In a real scenario, we might call the Evolution API directly here.
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        })
    }
})
