import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to prevent app crash if envs are missing
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables. App will load but backend features will fail.');
}

// Use placeholders to allow createClient to initialize without crashing
const validUrl = supabaseUrl || 'https://placeholder.supabase.co';
const validKey = supabaseAnonKey || 'placeholder';

export const supabase = createClient<Database>(validUrl, validKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Untyped client for insert/update operations where Supabase types cause issues
// This is a workaround for cases where the generated types return 'never'
export const supabaseUntyped = createClient(validUrl, validKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Helper function to get current user
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Helper function to get current session
export const getCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

// Helper to handle Supabase errors gracefully
export function handleSupabaseError(error: any): never {
    if (!error) throw new Error('Unknown error occurred');

    const code = error.code || '';
    let message = error.message || 'An error occurred';

    // Map common Supabase/Postgres error codes to user-friendly messages
    switch (code) {
        case '23505': // unique_violation
            if (message.includes('email')) {
                message = 'Já existe um registro com este e-mail.';
            } else {
                message = 'Registro duplicado detectado.';
            }
            break;
        case '42703': // undefined_column
            message = 'Erro de sistema: Coluna não encontrada. Contate o suporte. (Migração pendente?)';
            break;
        case 'PGRST301': // row_security_violation (JWT expired or RLS)
        case '401':
            message = 'Sessão expirada ou sem permissão. Por favor, faça login novamente.';
            break;
        case 'PGRST116': // The result contains 0 rows
            message = 'Registro não encontrado.';
            break;
        case '23503': // foreign_key_violation
            message = 'Operação bloqueada: Este registro está sendo usado por outro item.';
            break;
    }

    console.error(`[Supabase Error] ${code}: ${error.details || error.message}`);
    throw new Error(message);
}
