
import { supabase, supabaseUntyped } from '../lib/supabase';

/**
 * Checkout API Mock
 * 
 * In a real deployment, this logic resides in a Supabase Edge Function to keep secrets safe.
 * For this "Serverless" architecture verification, we mock the logic here but call it like an API.
 */

export const checkoutApi = {

    /**
     * Create Checkout Session (Mocking Edge Function)
     */
    async createSession(req: { planId: string, email: string, name: string, professionalId: string, phone: string }) {
        console.log('[API] Creating Checkout Session for:', req.email);

        // 1. Validate Plan
        const { data: plan } = await supabase
            .from('plans')
            .select('*')
            .eq('id', req.planId)
            .single();

        const planData = plan as any;
        if (!planData) throw new Error('Plano não encontrado');

        // 2. Create Sale Record
        const { data: sale, error: saleError } = await supabase
            .from('sales')
            .insert({
                professional_id: req.professionalId,
                plan_id: req.planId,
                email: req.email,
                phone: req.phone,
                amount: planData.price,
                status: 'pending',
                metadata: { source: 'checkout_api' }
            } as any)
            .select() // Need to return the ID
            .single();

        if (saleError) {
            console.error('Error creating sale:', saleError);
            throw new Error('Erro ao iniciar venda');
        }

        // 3. Create Stripe Session (Real call would go here)
        // For now, we mock the return URL to be our success page
        const saleData = sale as any;
        const successUrl = `${window.location.origin}/checkout/success?session_id=mock_session_${saleData.id}`;

        // In a real app, we would call Stripe API here
        // const session = await stripe.checkout.sessions.create(...)

        return {
            sessionId: `sess_${Date.now()}`, // Fake Stripe Session ID
            sessionUrl: successUrl // Direct redirect to success for testing flow
        };
    },

    /**
     * Webhook Handler Logic (Mocking Edge Function)
     */
    async handleWebhook(event: any) {
        // This logic mimics what the Edge Function would do when receiving a Stripe Webhook
        console.log('[API] Processing Webhook:', event.type);

        if (event.type === 'payment_intent.succeeded') {
            const saleId = event.data.object.metadata.sale_id;

            // Update Sale
            // @ts-ignore - Supabase type inference issue
            await supabaseUntyped
                .from('sales')
                .update({ status: 'payment_confirmed' })
                .eq('id', saleId);

            // Create Payment Record
            // ... (payment creation logic)
        }
    }
};
