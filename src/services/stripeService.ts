/**
 * Stripe Service
 * 
 * Handles Stripe integration for plan/package management,
 * checkout sessions, and webhook processing via Supabase Edge Functions.
 */

import { supabase, supabaseUntyped } from '../lib/supabase';

// Types matching Supabase Schema
export interface Plan {
    id: string;
    professional_id: string;
    name: string;
    description: string;
    price: number;
    duration_days: number;
    type: 'mensal' | 'trimestral' | 'semestral' | 'anual';
    features: string[]; // JSONB in DB handled as string[]
    icon?: string;
    status: boolean;
    created_at: string;
    stripe_product_id?: string;
    stripe_price_id?: string;
}

export interface CheckoutSessionRequest {
    planId: string;
    email: string;
    name: string;
    phone: string;
    professionalId: string;
}

export interface CheckoutSessionResponse {
    sessionId: string;
    sessionUrl: string;
}

// Duration configurations for UI helpers
export const durationConfigs: Record<string, { months: number; label: string; discount: number }> = {
    'mensal': { months: 1, label: 'Mensal', discount: 0 },
    'trimestral': { months: 3, label: 'Trimestral', discount: 10 },
    'semestral': { months: 6, label: 'Semestral', discount: 15 },
    'anual': { months: 12, label: 'Anual', discount: 25 },
};

/**
 * Get all active plans for a professional
 */
export async function getPlans(professionalId?: string): Promise<Plan[]> {
    if (!professionalId) {
        // If no ID provided, try to get current user's plans
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: pro } = await supabase
            .from('professionals')
            .select('id')
            .eq('user_id', user.id)
            .single();

        professionalId = (pro as any)?.id;
    }

    if (!professionalId) return [];

    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('professional_id', professionalId)
        .eq('status', true)
        .order('price', { ascending: true });

    if (error) {
        console.error('Error fetching plans:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get plan by ID
 */
export async function getPlanById(planId: string): Promise<Plan | null> {
    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (error) return null;
    return data;
}

/**
 * Create a new checkout session via Edge Function
 */
export async function createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: request
    });

    if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error('Falha ao criar sessão de pagamento.');
    }

    return data; // { sessionId, sessionUrl }
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency
    }).format(price);
}

/**
 * Calculate monthly price from total
 */
export function calculateMonthlyPrice(totalPrice: number, durationType: string): number {
    const config = durationConfigs[durationType] || { months: 1 };
    return Math.round((totalPrice / config.months) * 100) / 100;
}


/**
 * Save (Create or Update) a Plan
 */
export async function savePlan(plan: Partial<Plan>): Promise<Plan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get Professional ID
    const { data: pro } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single();

    const proData = pro as any;
    if (!proData) throw new Error('Professional not found');

    const planData = {
        ...plan,
        professional_id: proData.id,
        // Ensure defaults
        status: plan.status ?? true,
        features: plan.features ?? [],
        updated_at: new Date().toISOString()
    };

    // Remove ID if it's a temp ID or empty, to trigger insert
    if (plan.id && plan.id.startsWith('plan-')) {
        delete (planData as any).id;
    }

    const { data, error } = await supabase
        .from('plans')
        .upsert(planData as any) // Type assertion due to some flexibility in Partial
        .select()
        .single();

    if (error) {
        console.error('Error saving plan:', error);
        throw error;
    }

    return data;
}

/**
 * Delete (Soft Delete) a Plan
 */
export async function deletePlan(planId: string): Promise<void> {
    // @ts-ignore - Supabase type inference issue
    const { error } = await supabaseUntyped
        .from('plans')
        .update({ status: false })
        .eq('id', planId);

    if (error) {
        console.error('Error deleting plan:', error);
        throw error;
    }
}

/**
 * Generate Shareable Link
 */
export function generateShareableLink(planId: string): string {
    const baseUrl = window.location.origin;
    // In production, might want to include professional ID in the URL structure or similar
    // For now, assuming Global ID lookup or passed via context
    // Actually, the route is /checkout/:planId or /vender/:professionalId
    // Let's use the checkout route for specific plan
    return `${baseUrl}/checkout/${planId}`;
}

/**
 * Copy Link to Clipboard
 */
export async function copyLinkToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}
